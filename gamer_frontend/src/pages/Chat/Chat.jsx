import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import EmojiPicker from "emoji-picker-react";
import { FiSend } from "react-icons/fi";
import defaultProfile from "../../images/defaultProfile.png";
import chatBackground from "../../images/chatBg.png";
import { useChat } from "../Chat/ChatContext";

const ChatPage = () => {
  const { email: receiverEmail } = useParams();
  const navigate = useNavigate();
  const currentUserEmail = localStorage.getItem("email");

  const { chatList, markChatAsRead } = useChat();
  const markChatAsReadRef = useRef(markChatAsRead);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [receiverProfile, setReceiverProfile] = useState(null);
  const messageEndRef = useRef(null);
  const clientRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Keep the latest markChatAsRead function in a ref
  useEffect(() => {
    markChatAsReadRef.current = markChatAsRead;
  }, [markChatAsRead]);

  // Scroll helper
  const scrollToBottom = (smooth = false) => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
      });
    }
  };

  // Fetch receiver profile
  useEffect(() => {
    const fetchReceiverProfile = async () => {
      if (!receiverEmail) return;
      try {
        const res = await axios.get(
          `http://localhost:8080/api/profile/${receiverEmail}`
        );
        setReceiverProfile(res.data);
      } catch { }
    };
    fetchReceiverProfile();
  }, [receiverEmail]);

  // Fetch chat history
  useEffect(() => {
    const token = localStorage.getItem("token");
    let isMounted = true;

    const fetchHistory = async () => {
      if (!receiverEmail) return;
      try {
        const res = await axios.get(
          `http://localhost:8080/api/chat/history/${currentUserEmail}/${receiverEmail}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (isMounted) {
          setMessages(res.data);
          markChatAsReadRef.current(receiverEmail);
          setTimeout(() => scrollToBottom(false), 0);
        }
      } catch { }
    };

    fetchHistory();
    return () => { isMounted = false; };
  }, [receiverEmail, currentUserEmail]);

  // Scroll to bottom on new messages
  useEffect(() => {
    setTimeout(() => scrollToBottom(true), 50);
  }, [messages]);

  // WebSocket for new messages
  useEffect(() => {
    clientRef.current = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      reconnectDelay: 5000,
      onConnect: () => { },
      debug: () => { },
    });
    clientRef.current.activate();

    const handleNewMessage = (e) => {
      const msg = e.detail;
      if (msg.senderEmail === receiverEmail || msg.receiverEmail === receiverEmail) {
        setMessages((prev) => [...prev, msg]);
        markChatAsReadRef.current(
          msg.senderEmail === currentUserEmail ? msg.receiverEmail : msg.senderEmail
        );
      }
    };

    window.addEventListener("newMessage", handleNewMessage);
    return () => window.removeEventListener("newMessage", handleNewMessage);
  }, [receiverEmail, currentUserEmail]);

  const sendMessage = () => {
    if (!message.trim()) return;
    const chat = {
      senderEmail: currentUserEmail,
      receiverEmail,
      message,
      timestamp: new Date().toISOString(),
    };
    clientRef.current?.publish({
      destination: "/app/send",
      body: JSON.stringify(chat),
    });
    setMessages((prev) => [...prev, chat]);
    setMessage("");
  };

  const formatDateTime = (timestamp) =>
    timestamp
      ? new Date(timestamp).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      : "";

  const isNewDay = (prevMsg, currentMsg) =>
    !prevMsg ||
    new Date(prevMsg.timestamp).toDateString() !==
    new Date(currentMsg.timestamp).toDateString();

  const onEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  return (
    <div className="flex h-screen text-white pt-20">
      <div className="fixed top-0 left-0 w-full h-full bg-gray-900 z-[-1]"></div>

      {/* Sidebar */}
      <div className="w-72 overflow-y-auto pl-6 pr-4 py-4 space-y-4 bg-gray-900 hide-scrollbar">
        <h2 className="text-xl font-semibold mb-6">Chats</h2>
        {chatList.map((chat) => {
          const isActive = chat.profile.email === receiverEmail;
          return (
            <div
              key={chat.profile.email}
              onClick={() => {
                navigate(`/chat/${chat.profile.email}`);
                markChatAsReadRef.current(chat.profile.email);
              }}
              className={`flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-800 ${isActive ? "bg-gray-800" : ""
                }`}
            >
              <div className="relative">
                <img
                  src={chat.profile.imageUrl || defaultProfile}
                  alt={chat.profile.gamerName || "Profile"}
                  className="w-10 h-10 rounded-full"
                />
                {chat.hasUnread && (
                  <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-red-500 border-2 border-gray-900" />
                )}
              </div>
              <div className="flex-1 flex justify-between items-center">
                <span>{chat.profile.gamerName}</span>
                <span className="text-xs text-gray-400">
                  {chat.lastMessage?.timestamp
                    ? new Date(chat.lastMessage.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                    : ""}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {receiverEmail ? (
          <>
            <div className="flex items-center p-4 justify-between bg-[#1a2232]">
              <div className="flex items-center space-x-4">
                <img
                  src={receiverProfile?.imageUrl || defaultProfile}
                  alt={receiverProfile?.gamerName || "Profile"}
                  className="w-12 h-12 rounded-full"
                />
                <h2 className="text-lg font-semibold">
                  {receiverProfile?.gamerName}
                </h2>
              </div>
            </div>

            <div
              className="flex-1 overflow-y-auto p-4 space-y-2"
              style={{
                backgroundImage: `url(${chatBackground})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {messages.map((msg, idx) => {
                const prevMsg = idx > 0 ? messages[idx - 1] : null;
                const showDate = isNewDay(prevMsg, msg);
                return (
                  <React.Fragment key={idx}>
                    {showDate && (
                      <div className="text-center text-gray-400 text-sm my-2">
                        {formatDateTime(msg.timestamp)}
                      </div>
                    )}
                    <div
                      className={`flex ${msg.senderEmail === currentUserEmail
                        ? "justify-end"
                        : "justify-start"
                        }`}
                    >
                      <div
                        className={`px-4 py-2 rounded-lg max-w-xs break-words ${msg.senderEmail === currentUserEmail
                          ? "bg-gradient-to-r from-[#01C0D3]/80 to-[#2059B6]/80"
                          : "bg-gradient-to-r from-gray-700/80 to-gray-500/80"
                          }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
              <div ref={messageEndRef}></div>
            </div>

            <div className="flex items-center gap-2 p-4 bg-[#1a2232]">
              {showEmojiPicker && (
                <div className="absolute bottom-14 z-50">
                  <EmojiPicker onEmojiClick={onEmojiClick} theme="dark" height={400} width={400} />
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-xl"
              >
                😊
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 rounded-lg px-4 py-2 bg-gray-700/90 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-600/50"
                placeholder="Type a message..."
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                onClick={sendMessage}
                disabled={!message.trim()}
                className="ml-2 px-4 py-2 rounded-lg flex items-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSend className="text-xl" />
              </button>
            </div>
          </>
        ) : (
          <div
            className="flex-1 flex items-center justify-center text-xl font-semibold text-gray-400"
            style={{
              backgroundImage: `url(${chatBackground})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            Chat with your gaming buddies...❤️
          </div>
        )}
      </div>

      <style>
        {`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}
      </style>
    </div>
  );
};

export default ChatPage;
