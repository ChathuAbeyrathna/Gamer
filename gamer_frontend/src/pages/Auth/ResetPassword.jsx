import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from '../../images/logo.png';

const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const navigate = useNavigate();

    const query = new URLSearchParams(useLocation().search);
    const token = query.get("token");

    if (!token) {
        return (
            <div className="relative flex justify-center items-center min-h-screen">
                <div className="fixed top-0 left-0 w-full h-full bg-gray-900 z-[-1]"></div>

                <div className="w-full max-w-md bg-gradient-to-b from-[#01C0D3] to-[#2059B6] p-[2px] rounded-lg shadow-lg">
                    <div className="bg-gradient-to-b from-gray-900 to-gray-700 p-8 rounded-lg text-center">
                        <img src={logo} alt="Logo" className="mx-auto w-24 mb-4" />
                        <h2 className="text-xl text-white font-semibold mb-2">Invalid Access</h2>
                        <p className="text-gray-300">Please use the password reset link sent to your email.</p>
                    </div>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirm) {
            setError("Passwords do not match.");
            return;
        }

        setIsUpdating(true);
        try {
            await axios.post("http://localhost:8080/api/auth/reset-password", {
                token,
                newPassword: password,
            });
            setSuccess("Password updated! Redirecting...");
            setError("");
            setTimeout(() => navigate("/login"), 3000);
        } catch {
            setError("Invalid or expired token.");
            setSuccess("");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-900">
            <div className="w-full max-w-md bg-gradient-to-b from-[#01C0D3] to-[#2059B6] p-[2px] rounded-lg shadow-lg">
                <div className="bg-gradient-to-b from-gray-900 to-gray-700 p-8 rounded-lg">
                    <div className="mb-6">
                        <img src={logo} alt="Logo" className="mx-auto w-24" />
                    </div>
                    <h2 className="text-2xl text-white text-center mb-4">Reset Your Password</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="password"
                            placeholder="New Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            className="w-full p-3 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="w-full p-3 bg-gradient-to-r from-[#2059B6] to-[#407CDE] text-white font-semibold rounded hover:from-[#1a4694] hover:to-[#3366bb] transition-colors duration-200 disabled:opacity-50"
                        >
                            {isUpdating ? "Updating..." : "Reset Password"}
                        </button>
                    </form>
                    {success && <p className="text-green-400 text-center mt-4">{success}</p>}
                    {error && <p className="text-red-400 text-center mt-4">{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
