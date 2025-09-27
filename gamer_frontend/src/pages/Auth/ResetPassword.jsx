import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from '../../images/logo.png';

/**
 * - Handles password reset using a token sent via email.
 * - Validates new password + confirmation match.
 * - Sends reset request to backend with token and new password.
 * - Shows success/error messages.
 * - Redirects to login page after successful reset.
 */
const ResetPassword = () => {
    // State for new password and confirmation
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");

    // State for error/success messages
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // State to indicate request in progress
    const [isUpdating, setIsUpdating] = useState(false);

    const navigate = useNavigate();

    // Extract reset token from URL query string
    const query = new URLSearchParams(useLocation().search);
    const token = query.get("token");

    // If token is missing → show invalid access message
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

    /**
     * Handle form submission
     * - Validates that passwords match.
     * - Sends POST request to reset password.
     * - Shows success/error message.
     * - Redirects to login page after 3 seconds on success.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate passwords match
        if (password !== confirm) {
            setError("Passwords do not match.");
            return;
        }

        setIsUpdating(true);
        try {
            // Send reset password request to backend
            await axios.post("http://localhost:8080/api/auth/reset-password", {
                token,
                newPassword: password,
            });

            setSuccess("Password updated! Redirecting...");
            setError("");

            // Redirect to login page after 3 seconds
            setTimeout(() => navigate("/login"), 3000);
        } catch {
            // Handle invalid or expired token
            setError("Invalid or expired token.");
            setSuccess("");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-900">
            {/* Password reset form container */}
            <div className="w-full max-w-md bg-gradient-to-b from-[#01C0D3] to-[#2059B6] p-[2px] rounded-lg shadow-lg">
                <div className="bg-gradient-to-b from-gray-900 to-gray-700 p-8 rounded-lg">
                    {/* Logo */}
                    <div className="mb-6">
                        <img src={logo} alt="Logo" className="mx-auto w-24" />
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl text-white text-center mb-4">Reset Your Password</h2>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* New password input */}
                        <input
                            type="password"
                            placeholder="New Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        {/* Confirm password input */}
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            className="w-full p-3 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="w-full p-3 bg-gradient-to-r from-[#2059B6] to-[#407CDE] text-white font-semibold rounded 
                                       hover:from-[#1a4694] hover:to-[#3366bb] transition-colors duration-200 disabled:opacity-50"
                        >
                            {isUpdating ? "Updating..." : "Reset Password"}
                        </button>
                    </form>

                    {/* Feedback messages */}
                    {success && <p className="text-green-400 text-center mt-4">{success}</p>}
                    {error && <p className="text-red-400 text-center mt-4">{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
