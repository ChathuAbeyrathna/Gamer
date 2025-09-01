import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useState, useMemo } from "react";
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

function App() {
  const [hasUnread, setHasUnread] = useState(false);
  const userId = useMemo(() => localStorage.getItem("email"), []);

  return (
    <Router>
      <Alert>
        <ChatProvider>
          {userId && (
            <NotificationListener
              userId={userId}
              onNewNotification={(notification) => {
                setHasUnread(true);

                window.dispatchEvent(
                  new CustomEvent("NEW_NOTIFICATION", { detail: notification })
                );
              }}
            />
          )}

          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/" element={<Home hasUnread={hasUnread} />} />
            <Route path="/help-support" element={<HelpSupport />} />

            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <ProtectPages hasUnread={hasUnread} setHasUnread={setHasUnread} userId={userId} />
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