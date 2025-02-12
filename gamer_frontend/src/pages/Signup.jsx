import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logo from '../images/logo.png';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:8080/api/auth/signup", formData);
            alert("Signup successful! Redirecting to login...");
            navigate("/login"); // Redirect to login page
        } catch (error) {
            alert("Error signing up");
            console.error(error);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-900 flex-col">
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
                            className="w-64 p-3 mt-4 bg-gradient-to-r from-[#2059B6] to-[#407CDE] text-white font-semibold rounded hover:bg-gradient-to-r hover:from-[#2059B6] hover:to-[#407CDE] transition">
                            Sign Up
                        </button>
                    </div>
                </form>
            </div>
            </div>
            <div className="mt-2 w-full max-w-md border-1 border-transparent bg-gradient-to-b from-[#01C0D3] to-[#2059B6] p-[2px] rounded-lg shadow-lg">
            <div className="bg-gradient-to-b from-gray-900 to-gray-700 p-4 rounded-lg">
                <p className="text-gray-400 text-center">
                    Have an Account? <a href="/login" className="text-blue-600 hover:underline">Log In</a>
                </p>
            </div>
            </div>
        </div>
    );
};

export default Signup;
