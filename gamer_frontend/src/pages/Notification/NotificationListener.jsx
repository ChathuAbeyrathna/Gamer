import { useEffect } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const NotificationListener = ({ userId, onNewNotification }) => {
  useEffect(() => {
    if (!userId) return;

    const socket = new SockJS("http://localhost:8080/ws");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: () => {}, 
      onConnect: () => {
        stompClient.subscribe(`/topic/notifications/${userId}`, (message) => {
          try {
            const notification = JSON.parse(message.body);
            onNewNotification(notification);
          } catch (err) {
            console.error("Failed to parse notification:", err);
          }
        });
      },
      onStompError: (frame) => {
        console.error("STOMP Broker Error:", frame.headers["message"], frame.body);
      },
    });

    stompClient.activate();

    return () => {
      if (stompClient.active) {
        stompClient.deactivate();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);
  
  return null;
};

export default NotificationListener;
