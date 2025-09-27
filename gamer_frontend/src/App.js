import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useState, useMemo } from "react";

// Custom components and providers
import NotificationListener from "./pages/Notification/NotificationListener";
import { ChatProvider } from "./pages/Chat/ChatContext";
import Home from "./pages/Home";
import ProtectedRoute from "./ProtectedRoute";
import ProtectPages from "./ProtectPages";
import Signup from "./pages/Auth/Signup";
import Login from "./pages/Auth/Login";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import HelpSupport from "./pages/HelpSupport";
import { Alert } from "./Alert";

/**
 * App component - main entry point of the React application
 * - Sets up routing for all pages
 * - Handles user notifications
 * - Wraps app with providers (ChatProvider, Alert)
 */
function App() {
  // State to track if there are any unread notifications
  const [hasUnread, setHasUnread] = useState(false);

  // Get userId from localStorage once (memoized to avoid re-fetching on each render)
  const userId = useMemo(() => localStorage.getItem("email"), []);

  return (
    <Router>
      {/* Alert wrapper for showing global alert messages */}
      <Alert>
        {/* Chat context provider to share chat state across app */}
        <ChatProvider>
          {/* Notification listener is only rendered if a user is logged in */}
          {userId && (
            <NotificationListener
              userId={userId}
              onNewNotification={(notification) => {
                // Update unread state when a new notification arrives
                setHasUnread(true);

                // Dispatch a global event for other components to listen
                window.dispatchEvent(
                  new CustomEvent("NEW_NOTIFICATION", { detail: notification })
                );
              }}
            />
          )}

          {/* Application routes */}
          <Routes>
            {/* Public routes */}
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/" element={<Home hasUnread={hasUnread} />} />
            <Route path="/help-support" element={<HelpSupport />} />

            {/* Home route */}
            <Route path="/" element={<Home hasUnread={hasUnread} />} />

            {/* Protected routes (require login) */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <ProtectPages
                    hasUnread={hasUnread}
                    setHasUnread={setHasUnread}
                    userId={userId}
                  />
                </ProtectedRoute>
              }
            />
          </Routes>
        </ChatProvider>
      </Alert>
    </Router>
  );
}

export default App;
