import { useState } from "react";
import axios from "axios";
import logo from '../../images/logo.png';

/**
 * - Allows a user to request a password reset by entering their email.
 * - Sends a reset link request to the backend via Axios.
 * - Handles success/error feedback messages and a loading state.
 */
const ForgotPassword = () => {
    // State to hold the entered email address
    const [email, setEmail] = useState("");
    // State to hold success feedback (when reset link is sent)
    const [message, setMessage] = useState("");
    // State to hold error feedback (when request fails)
    const [error, setError] = useState("");
    // State to indicate if request is being processed (loading spinner substitute)
    const [isSending, setIsSending] = useState(false);

    /**
     * Handle form submission
     * - Prevents page reload
     * - Calls backend API to send reset link
     * - Updates success/error messages accordingly
     */
    const handleSubmit = async (e) => {
        e.preventDefault(); // prevent default form refresh
        setIsSending(true); // disable button while sending
        try {
            await axios.post("http://localhost:8080/api/auth/forgot-password", { email });
            setMessage("Reset link sent! Check your email."); // success message
            setError(""); // clear error if any
        } catch {
            setError("Failed to send reset link."); // error message
            setMessage(""); // clear success message
        } finally {
            setIsSending(false); // re-enable button after request
        }
    };

    return (
        <div className="relative flex justify-center items-center min-h-screen">
            {/* Background overlay */}
            <div className="fixed top-0 left-0 w-full h-full bg-gray-900 z-[-1]"></div>

            {/* Outer gradient border container */}
            <div className="w-full max-w-md bg-gradient-to-b from-[#01C0D3] to-[#2059B6] p-[2px] rounded-lg shadow-lg">
                {/* Inner content box */}
                <div className="bg-gradient-to-b from-gray-900 to-gray-700 p-8 rounded-lg">

                    {/* Logo section */}
                    <div className="mb-6">
                        <img src={logo} alt="Logo" className="mx-auto w-24" />
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl text-white text-center mb-4">Forgot Password</h2>

                    {/* Form for email input */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email input field */}
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="w-full p-3 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />

                        {/* Submit button (disabled when sending) */}
                        <button
                            type="submit"
                            disabled={isSending}
                            className="w-full p-3 bg-gradient-to-r from-[#2059B6] to-[#407CDE] text-white font-semibold rounded 
                        hover:from-[#1a4694] hover:to-[#3366bb] transition-colors duration-200 
                        disabled:opacity-50"
                        >
                            {isSending ? "Sending..." : "Send Reset Link"}
                        </button>
                    </form>

                    {/* Success & error messages */}
                    {message && <p className="text-green-400 text-center mt-4">{message}</p>}
                    {error && <p className="text-red-400 text-center mt-4">{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
