import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logo from '../../images/logo.png';
import Loading from '../../components/Loading';

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState(""); // 'success' or 'error'
  const [showPopup, setShowPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoadingPage, setShowLoadingPage] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await axios.post("http://localhost:8080/api/auth/login", formData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("email", res.data.email);
      const email = res.data.email;

      const profileCheckRes = await axios.get(`http://localhost:8080/api/profile/exists/${email}`);

      showPopupMessage("Login successful! Redirecting...", "success");
      setShowLoadingPage(true);

      setTimeout(() => {
        if (profileCheckRes.data === true) {
          navigate("/");
        } else {
          navigate("/createprof");
        }
      }, 3000);
    } catch (error) {
      showPopupMessage("Invalid email or password", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const showPopupMessage = (msg, type) => {
    setPopupMessage(msg);
    setPopupType(type);
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
      setPopupMessage("");
      setPopupType("");
    }, 3000);
  };

  if (showLoadingPage) {
    return <Loading />;
  }

  return (
    <div className="relative flex justify-center items-center min-h-screen flex-col">
      <div className="fixed top-0 left-0 w-full h-full bg-gray-900 z-[-1]"></div>
      {/* Popup Message */}
      {showPopup && (
        <div className="mb-4 w-full max-w-md px-4">
          <div
            className={`text-white text-center py-2 px-4 rounded shadow-md animate-fade-in ${popupType === "success" ? "bg-green-600" : "bg-red-600"
              }`}
          >
            {popupMessage}
          </div>
        </div>
      )}

      <div className="w-full max-w-md border-1 border-transparent bg-gradient-to-b from-[#01C0D3] to-[#2059B6] p-[2px] rounded-lg shadow-lg">
        <div className="bg-gradient-to-b from-gray-900 to-gray-700 p-8 rounded-lg">
          <div className="mb-6">
            <img src={logo} alt="Gamer Logo" className="mx-auto w-24" />
          </div>
          <h2 className="text-3xl font-semibold text-white text-center mb-6">Log in to Gamer</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="flex justify-center">
              <button
                type="submit"
                className="w-64 p-3 mt-4 bg-gradient-to-r from-[#2059B6] to-[#407CDE] text-white font-semibold rounded hover:from-[#1a4694] hover:to-[#3366bb] transition-colors duration-200 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging in..." : "Log In"}
              </button>
            </div>
          </form>
          <div className="mt-4 text-center">
            <a href="/forgotpassword" className="text-blue-600 hover:underline">
              Forgot Password?
            </a>
          </div>
        </div>
      </div>

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
