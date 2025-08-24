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

  // fetch chat list helper
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
      console.error("fetchChatList error:", err);
    }
  };

  // Re-subscribe logic: called whenever currentUserEmail changes
  useEffect(() => {
    // Cleanup previous client
    if (clientRef.current && clientRef.current.active) {
      try { clientRef.current.deactivate(); } catch (e) {}
      clientRef.current = null;
    }

    if (!currentUserEmail) {
      setChatList([]);
      return;
    }

    // initial list load
    fetchChatList(currentUserEmail);

    // Create websocket client and subscribe to user's private queue
    clientRef.current = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      reconnectDelay: 5000,
      onConnect: () => {
        clientRef.current.subscribe(`/user/${currentUserEmail}/queue/messages`, async (message) => {
          try {
            const receivedMessage = JSON.parse(message.body);

            // Update or insert chat list item + move to top
            setChatList(prev => {
              const copy = Array.isArray(prev) ? [...prev] : [];

              const otherEmail = receivedMessage.senderEmail === currentUserEmail ? receivedMessage.receiverEmail : receivedMessage.senderEmail;
              const idx = copy.findIndex(c => c.profile && c.profile.email === otherEmail);

              if (idx !== -1) {
                // update existing
                const updated = { ...copy[idx], lastMessage: receivedMessage, hasUnread: (receivedMessage.receiverEmail === currentUserEmail) || !!copy[idx].hasUnread };
                copy.splice(idx, 1);
                return [updated, ...copy];
              } else {
                // fetch profile for new participant and prepend (async)
                (async () => {
                  try {
                    const token = localStorage.getItem("token");
                    const profileRes = await axios.get(`http://localhost:8080/api/profile/${encodeURIComponent(otherEmail)}`, { headers: { Authorization: `Bearer ${token}` } });
                    const profile = profileRes.data;
                    setChatList(prev2 => {
                      const exists = prev2.some(p => p.profile && p.profile.email === otherEmail);
                      if (exists) {
                        // race: update existing
                        return prev2.map(p => p.profile.email === otherEmail ? { ...p, lastMessage: receivedMessage, hasUnread: true } : p)
                                    .sort((a,b)=> new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp));
                      }
                      const newItem = { profile, lastMessage: receivedMessage, hasUnread: receivedMessage.receiverEmail === currentUserEmail };
                      return [newItem, ...prev2];
                    });
                  } catch (err) {
                    console.error("Failed to fetch profile for new chat user", otherEmail, err);
                  }
                })();
                return copy;
              }
            });

            // notify open chat page (if mounted)
            window.dispatchEvent(new CustomEvent("newMessage", { detail: receivedMessage }));
          } catch (err) {
            console.error("ws message parse error:", err);
          }
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error", frame);
      },
      debug: () => {}
    });

    clientRef.current.activate();

    return () => {
      if (clientRef.current && clientRef.current.active) {
        try { clientRef.current.deactivate(); } catch (e) {}
      }
      clientRef.current = null;
    };
  }, [currentUserEmail]);

  // Detect auth changes inside same tab:
  useEffect(() => {
    // 1) custom event listener (preferred if you can emit from auth flow)
    const onAuthChanged = () => {
      const newEmail = localStorage.getItem("email");
      if (newEmail !== currentUserEmail) setCurrentUserEmail(newEmail);
    };
    window.addEventListener("authChanged", onAuthChanged);

    // 2) listen for storage events (works cross-tab)
    const onStorage = (e) => {
      if (e.key === "email") {
        setCurrentUserEmail(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);

    // 3) polling fallback (detect changes in same tab if auth code didn't dispatch event)
    pollingRef.current = setInterval(() => {
      const email = localStorage.getItem("email");
      if (email !== currentUserEmail) {
        setCurrentUserEmail(email);
      }
    }, 1000); // 1 second checks; lightweight

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
