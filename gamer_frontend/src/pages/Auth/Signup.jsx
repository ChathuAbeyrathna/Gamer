import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logo from '../../images/logo.png';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });

    const [popupMessage, setPopupMessage] = useState("");
    const [popupType, setPopupType] = useState(""); // 'error' or 'success'
    const [showPopup, setShowPopup] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await axios.post("http://localhost:8080/api/auth/signup", formData);
            showPopupMessage("Signup successful! Redirecting...", "success");
            setTimeout(() => navigate("/login"), 1500);
        } catch (error) {
            if (error.response && error.response.status === 400) {
                const message = error.response.data || "";
                if (message.toLowerCase().includes("email")) {
                    showPopupMessage("This email is already registered.", "error");
                } else {
                    showPopupMessage("Signup failed: " + message, "error");
                }
            } else {
                showPopupMessage("An unexpected error occurred. Please try again.", "error");
            }
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

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-900 flex-col">
            {/* Popup Message */}
            {showPopup && (
                <div className="mb-4 w-full max-w-md px-4">
                    <div className={`text-white text-center py-2 px-4 rounded shadow-md animate-fade-in 
                        ${popupType === "success" ? "bg-green-600" : "bg-red-600"}`}>
                        {popupMessage}
                    </div>
                </div>
            )}

            <div className="w-full max-w-md border-1 border-transparent bg-gradient-to-b from-[#01C0D3] to-[#2059B6] p-[2px] rounded-lg shadow-lg">
                <div className="bg-gradient-to-b from-gray-900 to-gray-700 p-8 rounded-lg">
                    <div className="mb-6">
                        <img src={logo} alt="Gamer Logo" className="mx-auto w-24" />
                    </div>
                    <h2 className="text-3xl font-semibold text-white text-center mb-6">Create a New Account</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-200">Username</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full p-3 mt-1 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-200">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full p-3 mt-1 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                className="w-full p-3 mt-1 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div className="flex justify-center">
                            <button
                                type="submit"
                                className="w-64 p-3 mt-4 bg-gradient-to-r from-[#2059B6] to-[#407CDE] text-white font-semibold rounded hover:bg-gradient-to-r hover:from-[#2059B6] hover:to-[#407CDE] transition disabled:opacity-50"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Signing Up..." : "Sign Up"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="mt-2 w-full max-w-md border-1 border-transparent bg-gradient-to-b from-[#01C0D3] to-[#2059B6] p-[2px] rounded-lg shadow-lg">
                <div className="bg-gradient-to-b from-gray-900 to-gray-700 p-4 rounded-lg">
                    <p className="text-gray-400 text-center">
                        Have an Account?{" "}
                        <a href="/login" className="text-blue-600 hover:underline">
                            Log In
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
