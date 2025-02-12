import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logo from '../images/logo.png';

const Login = () => {
    const [formData, setFormData] = useState({
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
            await axios.post("http://localhost:8080/api/auth/login", formData);
            alert("Login successful!");
            navigate("/dashboard"); // Redirect after login
        } catch (error) {
            alert("Invalid email or password");
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
                <h2 className="text-3xl font-semibold text-white text-center mb-6">Log in to Gamer</h2>
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
                            Log In
                        </button>
                    </div>
                </form>
                <div className="mt-4 text-center">
                    <a href="/forgot-password" className="text-blue-600 hover:underline">Forgot Password?</a>
                </div>
            </div>
            </div>

            <div className="mt-2 w-full max-w-md border-1 border-transparent bg-gradient-to-b from-[#01C0D3] to-[#2059B6] p-[2px] rounded-lg shadow-lg">
            <div className="bg-gradient-to-b from-gray-900 to-gray-700 p-4 rounded-lg">
                <p className="text-gray-400 text-center">
                    Don't Have an Account? <a href="/signup" className="text-blue-600 hover:underline">Sign Up</a>
                </p>
            </div>
            </div>

        </div>
    );
};

export default Login;
