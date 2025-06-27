import logo from '../images/logo.png'; // Adjust path if needed

const Loading = () => {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-900">
            <div className="flex flex-col items-center animate-fade-in">
                {/* Smooth pulsing logo */}
                <img
                    src={logo}
                    alt="Gamer Logo"
                    className="h-20 animate-logoPulse drop-shadow-lg"
                />

                {/* Glowing quote below */}
                <p className="text-white mt-6 text-xl font-semibold italic text-center animate-glow">
                    Gaming is not a hobby, it's a lifestyle...
                </p>

                {/* Inline animations */}
                <style>{`
                    @keyframes fade-in {
                        from { opacity: 0; transform: scale(0.95); }
                        to { opacity: 1; transform: scale(1); }
                    }
                    .animate-fade-in {
                        animation: fade-in 0.4s ease-out;
                    }

                    @keyframes glow {
                        0%, 100% {
                            text-shadow: 0 0 10px #00e0ff, 0 0 20px #00e0ff;
                        }
                        50% {
                            text-shadow: 0 0 20px #00e0ff, 0 0 30px #00e0ff;
                        }
                    }
                    .animate-glow {
                        animation: glow 2s ease-in-out infinite;
                    }

                    @keyframes logoPulse {
                        0%, 100% {
                            transform: scale(1);
                        }
                        50% {
                            transform: scale(1.07);
                        }
                    }
                    .animate-logoPulse {
                        animation: logoPulse 1.6s ease-in-out infinite;
                    }
                `}</style>
            </div>
        </div>
    );
};

export default Loading;
