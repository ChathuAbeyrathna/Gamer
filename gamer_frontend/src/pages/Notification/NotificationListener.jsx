import { useEffect } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

/**
 * NotificationListener Component
 * - Listens for real-time notifications for a specific user via WebSocket + STOMP.
 * - Calls `onNewNotification` callback when a new notification arrives.
 *
 * Props:
 *  - userId: string | number
 *      The ID of the currently logged-in user. Determines the subscription topic.
 *  - onNewNotification: function
 *      Callback function to handle incoming notifications.
 */
const NotificationListener = ({ userId, onNewNotification }) => {

  useEffect(() => {
    // Skip if no userId is provided
    if (!userId) return;

    // Create a SockJS connection to backend WebSocket endpoint
    const socket = new SockJS("http://localhost:8080/ws");

    // Initialize STOMP client with SockJS connection
    const stompClient = new Client({
      webSocketFactory: () => socket,       // WebSocket factory function
      reconnectDelay: 5000,                 // Auto-reconnect after 5s
      debug: () => { },                       // Disable debug logs

      // Called when connection is established
      onConnect: () => {
        // Subscribe to user's notification topic
        stompClient.subscribe(`/topic/notifications/${userId}`, (message) => {
          try {
            const notification = JSON.parse(message.body);
            onNewNotification(notification);  // Pass notification to parent
          } catch (err) {
            console.error("Failed to parse notification:", err);
          }
        });
      },

      // Called on broker error
      onStompError: (frame) => {
        console.error(
          "STOMP Broker Error:",
          frame.headers["message"],
          frame.body
        );
      },
    });

    // Start the STOMP client
    stompClient.activate();

    // Cleanup on unmount or when userId changes
    return () => {
      if (stompClient.active) {
        stompClient.deactivate();
      }
    };
  }, [userId, onNewNotification]); // Include callback to avoid stale closures

  return null; // This component does not render anything
};

export default NotificationListener;
