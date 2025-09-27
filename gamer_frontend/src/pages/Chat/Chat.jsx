import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Client } from "@stomp/stompjs"; // For WebSocket/STOMP messaging
import SockJS from "sockjs-client"; // SockJS fallback for STOMP
import EmojiPicker from "emoji-picker-react";
import { FiSend } from "react-icons/fi";
import { IoArrowBack } from "react-icons/io5"; // Back arrow for mobile
import defaultProfile from "../../images/defaultProfile.png";
import chatBackground from "../../images/chatBg.png";
import { useChat } from "../Chat/ChatContext";

/**
 * ChatPage component
 * - Shows a list of chats in the sidebar
 * - Displays chat conversation with selected user
 * - Supports sending messages via WebSocket/STOMP
 * - Includes emoji picker, date separation, and responsive design
 */
const ChatPage = () => {
  // Extract receiver's email from URL
  const { email: receiverEmail } = useParams();
  const navigate = useNavigate();
  const currentUserEmail = localStorage.getItem("email"); // Logged-in user email

  // Chat context: chatList for sidebar, markChatAsRead to mark chats read
  const { chatList, markChatAsRead } = useChat();
  const markChatAsReadRef = useRef(markChatAsRead); // Persist ref for use in effects

  // Component states
  const [messages, setMessages] = useState([]); // Conversation messages
  const [message, setMessage] = useState(""); // Input message
  const [receiverProfile, setReceiverProfile] = useState(null); // Profile info
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Refs
  const messageEndRef = useRef(null); // Scroll-to-bottom ref
  const clientRef = useRef(null); // STOMP client ref

  // Update ref if markChatAsRead changes
  useEffect(() => {
    markChatAsReadRef.current = markChatAsRead;
  }, [markChatAsRead]);

  /**
   * Scroll chat to bottom
   * @param smooth boolean to animate scrolling
   */
  const scrollToBottom = (smooth = false) => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
    }
  };

  /**
   * Fetch receiver's profile from backend
   */
  useEffect(() => {
    const fetchReceiverProfile = async () => {
      if (!receiverEmail) return;
      try {
        const res = await axios.get(`http://localhost:8080/api/profile/${receiverEmail}`);
        setReceiverProfile(res.data);
      } catch { }
    };
    fetchReceiverProfile();
  }, [receiverEmail]);

  /**
   * Fetch chat history for current conversation
   */
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
          setMessages(res.data); // Set chat messages
          markChatAsReadRef.current(receiverEmail); // Mark chat as read
          setTimeout(() => scrollToBottom(false), 0); // Scroll after messages load
        }
      } catch { }
    };

    fetchHistory();
    return () => { isMounted = false; };
  }, [receiverEmail, currentUserEmail]);

  // Scroll smoothly when new messages update
  useEffect(() => {
    setTimeout(() => scrollToBottom(true), 50);
  }, [messages]);

  /**
   * Initialize WebSocket/STOMP client
   * Listen for new messages using custom event
   */
  useEffect(() => {
    clientRef.current = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      reconnectDelay: 5000,
      onConnect: () => { }, // Optional: connected callback
      debug: () => { }, // Optional: suppress logs
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

  /**
   * Send message via WebSocket
   */
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
    setMessage(""); // Clear input
  };

  /**
   * Format timestamp into readable date
   */
  const formatDateTime = (timestamp) =>
    timestamp
      ? new Date(timestamp).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      : "";

  /**
   * Check if current message is on a new day
   */
  const isNewDay = (prevMsg, currentMsg) =>
    !prevMsg ||
    new Date(prevMsg.timestamp).toDateString() !== new Date(currentMsg.timestamp).toDateString();

  /**
   * Append emoji to message input
   */
  const onEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  return (
    <div className="flex h-screen text-white pt-16 md:pt-20">
      {/* Background */}
      <div className="fixed top-0 left-0 w-full h-full bg-gray-900 z-[-1]"></div>

      {/* Sidebar: chat list */}
      <div className={`overflow-y-auto pl-6 pr-4 py-4 space-y-4 bg-gray-900 hide-scrollbar
        ${receiverEmail ? "hidden lg:block w-full lg:w-72" : "block w-full lg:w-72"}`}>
        <h2 className="text-xl font-semibold mt-4 mb-6">Chats</h2>
        {chatList.map((chat) => {
          const isActive = chat.profile.email === receiverEmail;
          return (
            <div
              key={chat.profile.email}
              onClick={() => {
                navigate(`/chat/${chat.profile.email}`);
                markChatAsReadRef.current(chat.profile.email);
              }}
              className={`flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-800 ${isActive ? "bg-gray-800" : ""}`}
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
                    ? new Date(chat.lastMessage.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : ""}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex-col ${receiverEmail ? "flex" : "hidden lg:flex"}`}>
        {receiverEmail ? (
          <>
            {/* Header */}
            <div className="flex items-center p-4 justify-between bg-[#1a2232]">
              <div className="flex items-center space-x-4">
                <button onClick={() => navigate("/chat")} className="lg:hidden p-2 -ml-2">
                  <IoArrowBack className="text-2xl" />
                </button>
                <img src={receiverProfile?.imageUrl || defaultProfile} alt={receiverProfile?.gamerName || "Profile"} className="w-12 h-12 rounded-full" />
                <h2 className="text-lg font-semibold">{receiverProfile?.gamerName}</h2>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ backgroundImage: `url(${chatBackground})`, backgroundSize: "cover", backgroundPosition: "center" }}>
              {messages.map((msg, idx) => {
                const prevMsg = idx > 0 ? messages[idx - 1] : null;
                const showDate = isNewDay(prevMsg, msg);
                return (
                  <React.Fragment key={idx}>
                    {showDate && <div className="text-center text-gray-400 text-sm my-2">{formatDateTime(msg.timestamp)}</div>}
                    <div className={`flex items-end gap-2 ${msg.senderEmail === currentUserEmail ? "justify-end" : "justify-start"}`}>
                      <div className={`px-4 py-2 rounded-lg max-w-[80%] md:max-w-md break-words ${msg.senderEmail === currentUserEmail ? "bg-gradient-to-r from-[#01C0D3]/80 to-[#2059B6]/80" : "bg-gradient-to-r from-gray-700/80 to-gray-500/80"}`}>
                        {msg.message}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
              <div ref={messageEndRef}></div>
            </div>

            {/* Input */}
            <div className="relative flex items-center gap-2 p-4 bg-[#1a2232]">
              {showEmojiPicker && (
                <div className="absolute bottom-20 left-0 right-0 mx-auto w-full max-w-sm px-2 z-50">
                  <EmojiPicker onEmojiClick={onEmojiClick} theme="dark" height={350} width="100%" />
                </div>
              )}
              <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-xl p-2 rounded-full hover:bg-gray-700">😊</button>
              <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} className="flex-1 rounded-lg px-4 py-2 bg-gray-700/90 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-600/50" placeholder="Type a message..." />
              <button onClick={sendMessage} disabled={!message.trim()} className="ml-2 px-4 py-2 rounded-lg flex items-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed">
                <FiSend className="text-xl" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xl font-semibold text-gray-400" style={{ backgroundImage: `url(${chatBackground})`, backgroundSize: "cover", backgroundPosition: "center" }}>
            Select a chat to start messaging...
          </div>
        )}
      </div>

      {/* Hide scrollbar style */}
      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
};

export default ChatPage;
