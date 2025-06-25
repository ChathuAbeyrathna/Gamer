import { useState } from "react";
import axios from "axios";
import logo from '../../images/logo.png';

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSending(true);
        try {
            await axios.post("http://localhost:8080/api/auth/forgot-password", { email });
            setMessage("Reset link sent! Check your email.");
            setError("");
        } catch {
            setError("Failed to send reset link.");
            setMessage("");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-900">
            <div className="w-full max-w-md bg-gradient-to-b from-[#01C0D3] to-[#2059B6] p-[2px] rounded-lg shadow-lg">
                <div className="bg-gradient-to-b from-gray-900 to-gray-700 p-8 rounded-lg">
                    <div className="mb-6">
                        <img src={logo} alt="Logo" className="mx-auto w-24" />
                    </div>
                    <h2 className="text-2xl text-white text-center mb-4">Forgot Password</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="w-full p-3 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <button
                            type="submit"
                            disabled={isSending}
                            className="w-full p-3 bg-gradient-to-r from-[#2059B6] to-[#407CDE] text-white font-semibold rounded hover:from-[#1a4694] hover:to-[#3366bb] transition-colors duration-200 disabled:opacity-50"
                        >
                            {isSending ? "Sending..." : "Send Reset Link"}
                        </button>
                    </form>
                    {message && <p className="text-green-400 text-center mt-4">{message}</p>}
                    {error && <p className="text-red-400 text-center mt-4">{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
