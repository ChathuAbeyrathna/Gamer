import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { FiSend, FiMoreVertical } from "react-icons/fi";
import defaultProfile from "../../images/defaultProfile.png";
import chatBackground from "../../images/chatBg.png";

const ChatPage = () => {
  const { email: receiverEmail } = useParams();
  const navigate = useNavigate();
  const currentUserEmail = localStorage.getItem("email");

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [receiverProfile, setReceiverProfile] = useState(null);
  const [chatList, setChatList] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const messageEndRef = useRef(null);
  const clientRef = useRef(null);

  // Auto-scroll after every render when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const fetchReceiverProfile = async () => {
      if (!receiverEmail) return;
      try {
        const res = await axios.get(
          `http://localhost:8080/api/profile/${receiverEmail}`
        );
        setReceiverProfile(res.data);
      } catch (err) { console.error(err); }
    };

    const fetchChatList = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:8080/api/chat/list?currentUserEmail=${currentUserEmail}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setChatList(res.data);
      } catch (err) { console.error(err); }
    };

    const fetchHistory = async () => {
      if (!receiverEmail) return;
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:8080/api/chat/history/${currentUserEmail}/${receiverEmail}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(res.data);
      } catch (err) { console.error(err); }
    };

    const connectWebSocket = () => {
      if (!receiverEmail) return;
      clientRef.current = new Client({
        webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
        reconnectDelay: 5000,
        onConnect: () => {
          clientRef.current.subscribe(
            `/user/${currentUserEmail}/queue/messages`,
            (msg) => {
              const receivedMessage = JSON.parse(msg.body);

              setMessages((prev) => [...prev, receivedMessage]);
            }
          );
        },
        debug: (str) => console.log(str),
      });
      clientRef.current.activate();
    };

    fetchReceiverProfile();
    fetchChatList();
    fetchHistory();
    connectWebSocket();

    return () => { clientRef.current?.deactivate(); };
  }, [receiverEmail, currentUserEmail]);

  const sendMessage = () => {
    if (!message.trim()) return;
    const chat = {
      senderEmail: currentUserEmail,
      receiverEmail,
      message,
      timestamp: new Date().toISOString()
    };
    clientRef.current?.publish({ destination: "/app/send", body: JSON.stringify(chat) });
    setMessages((prev) => [...prev, chat]);
    setMessage("");
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  const isNewDay = (prevMsg, currentMsg) => {
    if (!prevMsg) return true;
    const prevDate = new Date(prevMsg.timestamp);
    const currentDate = new Date(currentMsg.timestamp);
    return prevDate.toDateString() !== currentDate.toDateString();
  };

  return (
    <div className="flex h-screen text-white pt-20">
      <div className="fixed top-0 left-0 w-full h-full bg-gray-900 z-[-1]"></div>

      {/* Sidebar */}
      <div className="w-72 overflow-y-auto pl-6 pr-4 py-4 space-y-4 bg-gray-900 hide-scrollbar">
        <h2 className="text-xl font-semibold mb-6">Chats</h2>
        {chatList
          .filter((chatUser) => chatUser.email !== currentUserEmail)
          .map((chatUser) => {
            const isActive = chatUser.email === receiverEmail;
            return (
              <div
                key={chatUser.email}
                onClick={() => navigate(`/chat/${chatUser.email}`)}
                className={`flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-800 ${isActive ? "bg-gray-800" : ""}`}
              >
                <div className="relative">
                  <img src={chatUser.imageUrl || defaultProfile} alt="Profile" className="w-10 h-10 rounded-full" />
                </div>
                <span>{chatUser.gamerName}</span>
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
                <img src={receiverProfile?.imageUrl || defaultProfile} alt="Receiver" className="w-12 h-12 rounded-full" />
                <h2 className="text-lg font-semibold">{receiverProfile?.gamerName || receiverEmail}</h2>
              </div>
              <div className="relative">
                <FiMoreVertical className="cursor-pointer" size={22} onClick={() => setMenuOpen(!menuOpen)} />
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-gray-800 rounded-md shadow-lg p-2 z-50">
                    <button className="w-full text-left px-2 py-1 hover:bg-gray-700 rounded">Delete Chat</button>
                  </div>
                )}
              </div>
            </div>

            <div
              className="flex-1 overflow-y-auto p-4 space-y-2"
              style={{ backgroundImage: `url(${chatBackground})`, backgroundSize: "cover", backgroundPosition: "center" }}
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
                    <div className={`flex ${msg.senderEmail === currentUserEmail ? "justify-end" : "justify-start"}`}>
                      <div className={`px-4 py-2 rounded-lg max-w-xs break-words ${msg.senderEmail === currentUserEmail ? "bg-blue-600" : "bg-gray-700"}`}>
                        <div>{msg.message}</div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
              <div ref={messageEndRef}></div>
            </div>

            <div className="flex items-center gap-2 p-4 bg-[#1a2232]">
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
          <div className="flex-1 flex items-center justify-center text-xl font-semibold text-gray-400"
            style={{ backgroundImage: `url(${chatBackground})`, backgroundSize: "cover", backgroundPosition: "center" }}
          >
            Chat with your gaming buddies...❤️
          </div>
        )}
      </div>

      {/* Hide scrollbar style */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default ChatPage;

