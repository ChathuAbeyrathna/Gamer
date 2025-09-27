import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import { Client } from "@stomp/stompjs"; // STOMP client for WebSocket messaging
import SockJS from "sockjs-client";      // SockJS for WebSocket fallback

// --- Create context and hook for consuming chat state ---
const ChatContext = createContext();
export const useChat = () => useContext(ChatContext);

/**
 * ChatProvider manages:
 *  - Current logged-in user email
 *  - List of chats with last messages
 *  - WebSocket connection using STOMP over SockJS
 *  - Updating chat list on receiving new messages
 *  - Marking chats as read
 */
export const ChatProvider = ({ children }) => {
  // --- States ---
  const [currentUserEmail, setCurrentUserEmail] = useState(() => localStorage.getItem("email"));
  const [chatList, setChatList] = useState([]);

  // --- Refs ---
  const clientRef = useRef(null);  // WebSocket STOMP client
  const pollingRef = useRef(null); // Interval for detecting email changes

  // --- Fetch chats from backend ---
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
      // Error handling omitted
    }
  };

  // --- Effect: Setup WebSocket connection and subscriptions ---
  useEffect(() => {
    // Deactivate existing client if any
    if (clientRef.current && clientRef.current.active) {
      try { clientRef.current.deactivate(); } catch (e) { }
      clientRef.current = null;
    }

    if (!currentUserEmail) {
      setChatList([]);
      return;
    }

    fetchChatList(currentUserEmail);

    // Create new STOMP client
    clientRef.current = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      reconnectDelay: 5000, // Reconnect every 5s if connection drops
      onConnect: () => {
        // Subscribe to user's private message queue
        clientRef.current.subscribe(`/user/${currentUserEmail}/queue/messages`, async (message) => {
          try {
            const receivedMessage = JSON.parse(message.body);

            // Update chat list state
            setChatList(prev => {
              const copy = Array.isArray(prev) ? [...prev] : [];
              const otherEmail = receivedMessage.senderEmail === currentUserEmail
                ? receivedMessage.receiverEmail
                : receivedMessage.senderEmail;

              // Check if chat with other user already exists
              const idx = copy.findIndex(c => c.profile && c.profile.email === otherEmail);

              if (idx !== -1) {
                // Update existing chat with lastMessage & unread flag
                const updated = {
                  ...copy[idx],
                  lastMessage: receivedMessage,
                  hasUnread: (receivedMessage.receiverEmail === currentUserEmail) || !!copy[idx].hasUnread
                };
                copy.splice(idx, 1); // Remove old chat
                return [updated, ...copy]; // Place updated chat on top
              } else {
                // New chat: fetch profile info asynchronously
                (async () => {
                  try {
                    const token = localStorage.getItem("token");
                    const profileRes = await axios.get(
                      `http://localhost:8080/api/profile/${encodeURIComponent(otherEmail)}`,
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    const profile = profileRes.data;

                    // Update chatList with new chat
                    setChatList(prev2 => {
                      const exists = prev2.some(p => p.profile && p.profile.email === otherEmail);
                      if (exists) {
                        // Already exists, just update
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

            // Dispatch global event for UI updates elsewhere
            window.dispatchEvent(new CustomEvent("newMessage", { detail: receivedMessage }));
          } catch { }
        });
      },
      debug: () => { } // Disable STOMP debug logs
    });

    clientRef.current.activate();

    // Cleanup on unmount or email change
    return () => {
      if (clientRef.current && clientRef.current.active) {
        try { clientRef.current.deactivate(); } catch (e) { }
      }
      clientRef.current = null;
    };
  }, [currentUserEmail]);

  // --- Effect: Listen to auth/email changes and poll for updates ---
  useEffect(() => {
    const onAuthChanged = () => {
      const newEmail = localStorage.getItem("email");
      if (newEmail !== currentUserEmail) setCurrentUserEmail(newEmail);
    };
    window.addEventListener("authChanged", onAuthChanged);

    const onStorage = (e) => {
      if (e.key === "email") setCurrentUserEmail(e.newValue);
    };
    window.addEventListener("storage", onStorage);

    // Poll every 1s in case storage events are missed
    pollingRef.current = setInterval(() => {
      const email = localStorage.getItem("email");
      if (email !== currentUserEmail) setCurrentUserEmail(email);
    }, 1000);

    return () => {
      window.removeEventListener("authChanged", onAuthChanged);
      window.removeEventListener("storage", onStorage);
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [currentUserEmail]);

  // --- Mark a chat as read by clearing hasUnread ---
  const markChatAsRead = (email) => {
    setChatList(prev => prev.map(chat => chat.profile && chat.profile.email === email ? { ...chat, hasUnread: false } : chat));
  };

  // --- Provide chat state & functions to children ---
  return (
    <ChatContext.Provider value={{ chatList, setChatList, markChatAsRead, currentUserEmail }}>
      {children}
    </ChatContext.Provider>
  );
};
