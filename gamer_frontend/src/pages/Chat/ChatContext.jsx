import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const ChatContext = createContext();
export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [currentUserEmail, setCurrentUserEmail] = useState(() => localStorage.getItem("email"));
  const [chatList, setChatList] = useState([]);
  const clientRef = useRef(null);
  const pollingRef = useRef(null);

  const fetchChatList = async (email) => {
    if (!email) {
      setChatList([]);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:8080/api/chat/list?currentUserEmail=${encodeURIComponent(email)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChatList(res.data || []);
    } catch (err) {
    }
  };

  useEffect(() => {
    if (clientRef.current && clientRef.current.active) {
      try { clientRef.current.deactivate(); } catch (e) { }
      clientRef.current = null;
    }

    if (!currentUserEmail) {
      setChatList([]);
      return;
    }

    fetchChatList(currentUserEmail);

    clientRef.current = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      reconnectDelay: 5000,
      onConnect: () => {
        clientRef.current.subscribe(`/user/${currentUserEmail}/queue/messages`, async (message) => {
          try {
            const receivedMessage = JSON.parse(message.body);

            setChatList(prev => {
              const copy = Array.isArray(prev) ? [...prev] : [];
              const otherEmail = receivedMessage.senderEmail === currentUserEmail
                ? receivedMessage.receiverEmail
                : receivedMessage.senderEmail;

              const idx = copy.findIndex(c => c.profile && c.profile.email === otherEmail);

              if (idx !== -1) {
                const updated = { ...copy[idx], lastMessage: receivedMessage, hasUnread: (receivedMessage.receiverEmail === currentUserEmail) || !!copy[idx].hasUnread };
                copy.splice(idx, 1);
                return [updated, ...copy];
              } else {
                (async () => {
                  try {
                    const token = localStorage.getItem("token");
                    const profileRes = await axios.get(
                      `http://localhost:8080/api/profile/${encodeURIComponent(otherEmail)}`,
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    const profile = profileRes.data;
                    setChatList(prev2 => {
                      const exists = prev2.some(p => p.profile && p.profile.email === otherEmail);
                      if (exists) {
                        return prev2.map(p => p.profile.email === otherEmail
                          ? { ...p, lastMessage: receivedMessage, hasUnread: true }
                          : p
                        ).sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp));
                      }
                      const newItem = { profile, lastMessage: receivedMessage, hasUnread: receivedMessage.receiverEmail === currentUserEmail };
                      return [newItem, ...prev2];
                    });
                  } catch { }
                })();
                return copy;
              }
            });

            window.dispatchEvent(new CustomEvent("newMessage", { detail: receivedMessage }));
          } catch { }
        });
      },
      debug: () => { }
    });

    clientRef.current.activate();

    return () => {
      if (clientRef.current && clientRef.current.active) {
        try { clientRef.current.deactivate(); } catch (e) { }
      }
      clientRef.current = null;
    };
  }, [currentUserEmail]);

  useEffect(() => {
    const onAuthChanged = () => {
      const newEmail = localStorage.getItem("email");
      if (newEmail !== currentUserEmail) setCurrentUserEmail(newEmail);
    };
    window.addEventListener("authChanged", onAuthChanged);

    const onStorage = (e) => {
      if (e.key === "email") {
        setCurrentUserEmail(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);

    pollingRef.current = setInterval(() => {
      const email = localStorage.getItem("email");
      if (email !== currentUserEmail) {
        setCurrentUserEmail(email);
      }
    }, 1000);

    return () => {
      window.removeEventListener("authChanged", onAuthChanged);
      window.removeEventListener("storage", onStorage);
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [currentUserEmail]);

  const markChatAsRead = (email) => {
    setChatList(prev => prev.map(chat => chat.profile && chat.profile.email === email ? { ...chat, hasUnread: false } : chat));
  };

  return (
    <ChatContext.Provider value={{ chatList, setChatList, markChatAsRead, currentUserEmail }}>
      {children}
    </ChatContext.Provider>
  );
};
