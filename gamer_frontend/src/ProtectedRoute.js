import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const [decision, setDecision] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkAccess = async () => {
      if (!token && decision === null) {
        const wantToLogin = await window.confirm("You need to log in to continue. Do you want to log in?");
        setDecision(wantToLogin ? "login" : "cancel");
      }
    };
    checkAccess();
  }, [token, decision]);

  if (token) return children;

  if (decision === "login") return <Navigate to="/login" state={{ from: location }} />;
  if (decision === "cancel") return <Navigate to="/" />;

  // Full screen loading overlay with top-aligned text
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-95 flex justify-center">
      <div className="text-white text-lg font-medium mt-8">
        Loading...
      </div>
    </div>
  );
};

export default ProtectedRoute;
