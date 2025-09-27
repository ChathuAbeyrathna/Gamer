import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logo from '../../images/logo.png';
import Loading from '../../components/Loading';

/**
 * - Handles user login with email + password.
 * - On success: stores JWT token & email in localStorage,
 *   then checks if a profile exists to decide navigation.
 * - Shows popup messages for success/error states.
 * - Displays a full-screen loading page during redirect.
 */
const Login = () => {
  // Form input state for email & password
  const [formData, setFormData] = useState({ email: "", password: "" });

  // Popup feedback state
  const [popupMessage, setPopupMessage] = useState(""); // message text
  const [popupType, setPopupType] = useState(""); // "success" | "error"
  const [showPopup, setShowPopup] = useState(false); // controls popup visibility

  // Loading & submission states
  const [isSubmitting, setIsSubmitting] = useState(false); // disables button while logging in
  const [showLoadingPage, setShowLoadingPage] = useState(false); // shows full-page loader after login

  const navigate = useNavigate();

  /**
   * Handle input changes
   * - Updates formData state dynamically based on field name.
   */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Handle form submission
   * - Sends login request to backend with formData.
   * - On success:
   *    1. Stores JWT token + email in localStorage.
   *    2. Checks if user profile exists.
   *    3. Shows success popup & redirects after delay.
   * - On error: shows error popup.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Send login request
      const res = await axios.post("http://localhost:8080/api/auth/login", formData);

      // Save token & email to local storage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("email", res.data.email);

      const email = res.data.email;

      // Check if user already has a profile
      const profileCheckRes = await axios.get(`http://localhost:8080/api/profile/exists/${email}`);

      // Show success popup + start loading screen
      showPopupMessage("Login successful! Redirecting...", "success");
      setShowLoadingPage(true);

      // Redirect after 3 seconds based on profile existence
      setTimeout(() => {
        if (profileCheckRes.data === true) {
          navigate("/"); // Go to home
        } else {
          navigate("/createprof"); // Go to create profile page
        }
      }, 3000);
    } catch (error) {
      // Show error popup if login fails
      showPopupMessage("Invalid email or password", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Show popup message helper
   * - Displays temporary popup with given message + type.
   * - Auto hides after 3 seconds.
   */
  const showPopupMessage = (msg, type) => {
    setPopupMessage(msg);
    setPopupType(type);
    setShowPopup(true);

    // Auto-hide after 3 seconds
    setTimeout(() => {
      setShowPopup(false);
      setPopupMessage("");
      setPopupType("");
    }, 3000);
  };

  // If loading screen is active → show full-page loader
  if (showLoadingPage) {
    return <Loading />;
  }

  return (
    <div className="relative flex justify-center items-center min-h-screen flex-col">
      {/* Background overlay */}
      <div className="fixed top-0 left-0 w-full h-full bg-gray-900 z-[-1]"></div>

      {/* Popup Message */}
      {showPopup && (
        <div className="mb-4 w-full max-w-md px-4">
          <div
            className={`text-white text-center py-2 px-4 rounded shadow-md animate-fade-in 
                        ${popupType === "success" ? "bg-green-600" : "bg-red-600"}`}
          >
            {popupMessage}
          </div>
        </div>
      )}

      {/* Login form container */}
      <div className="w-full max-w-md border-1 border-transparent bg-gradient-to-b from-[#01C0D3] to-[#2059B6] p-[2px] rounded-lg shadow-lg">
        <div className="bg-gradient-to-b from-gray-900 to-gray-700 p-8 rounded-lg">
          {/* Logo */}
          <div className="mb-6">
            <img src={logo} alt="Gamer Logo" className="mx-auto w-24" />
          </div>

          {/* Title */}
          <h2 className="text-3xl font-semibold text-white text-center mb-6">
            Log in to Gamer
          </h2>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email input */}
            <div>
              <label className="block text-sm font-medium text-gray-200">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 mt-1 text-white bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Password input */}
            <div>
              <label className="block text-sm font-medium text-gray-200">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 mt-1 text-white bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Submit button */}
            <div className="flex justify-center">
              <button
                type="submit"
                className="w-64 p-3 mt-4 bg-gradient-to-r from-[#2059B6] to-[#407CDE] text-white font-semibold rounded 
                           hover:from-[#1a4694] hover:to-[#3366bb] transition-colors duration-200 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging in..." : "Log In"}
              </button>
            </div>
          </form>

          {/* Forgot password link */}
          <div className="mt-4 text-center">
            <a href="/forgotpassword" className="text-blue-600 hover:underline">
              Forgot Password?
            </a>
          </div>
        </div>
      </div>

      {/* Sign up prompt */}
      <div className="mt-2 w-full max-w-md border-1 border-transparent bg-gradient-to-b from-[#01C0D3] to-[#2059B6] p-[2px] rounded-lg shadow-lg">
        <div className="bg-gradient-to-b from-gray-900 to-gray-700 p-4 rounded-lg">
          <p className="text-gray-400 text-center">
            Don't Have an Account?{" "}
            <a href="/signup" className="text-blue-600 hover:underline">
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
