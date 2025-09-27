import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import defaultProfile from '../images/defaultProfile.png';

/**
 * SquadModal component
 * - Displays a responsive modal showing followers and following of a user
 * - Supports search, tab switching, and unfollow functionality
 * - Disables background scroll when open
 */
const SquadModal = ({ email, show, onClose }) => {
    const [activeTab, setActiveTab] = useState("following");
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const currentUserEmail = localStorage.getItem("email");

    /** Disable background scroll when modal is open */
    useEffect(() => {
        if (show) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [show]);

    /** Fetch followers and following when the modal is open */
    useEffect(() => {
        if (!show || !email) return;

        //fetchSquad uses axios to get both lists concurrently with Promise.all
        const fetchSquad = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                const headers = token ? { Authorization: `Bearer ${token}` } : {};

                const [followersRes, followingRes] = await Promise.all([
                    axios.get(`http://localhost:8080/api/follow/followers/${email}`, { headers }),
                    axios.get(`http://localhost:8080/api/follow/following/${email}`, { headers }),
                ]);

                setFollowers(followersRes.data);
                setFollowing(followingRes.data);
            } catch (err) {
                console.error("Error fetching squad users:", err);
                setFollowers([]);
                setFollowing([]);
            } finally {
                setLoading(false);
                setSearchTerm("");
            }
        };

        fetchSquad();
    }, [email, show]);

    // handleUnfollow is memoized with useCallback for performance
    const handleUnfollow = useCallback(async (targetEmail) => {
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `http://localhost:8080/api/follow/toggle-follow/${targetEmail}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Optimistically update the UI
            setFollowing(prev => prev.filter(u => u.email !== targetEmail));
        } catch (err) {
            console.error("Unfollow failed:", err);
        }
    }, []);
    
    // filteredUsers memoized with useMemo to filter based on searchTerm and activeTab
    const filteredUsers = React.useMemo(() => {
        const list = activeTab === "followers" ? followers : following;
        const lowercasedSearch = searchTerm.toLowerCase();
        
        if (!lowercasedSearch.trim()) return list;

        return list.filter(u => 
            u.gamerName?.toLowerCase().includes(lowercasedSearch)
        );
    }, [searchTerm, activeTab, followers, following]);


    if (!show) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-gray-800 rounded-lg w-full max-w-md flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-xl font-semibold text-white">Squad</h2>
                    <button onClick={onClose} className="text-gray-400 text-2xl font-bold hover:text-white" aria-label="Close modal">
                        &times;
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-700">
                    <button
                        onClick={() => setActiveTab("following")}
                        className={`flex-1 py-3 font-semibold text-sm transition-colors ${
                            activeTab === "following"
                                ? "text-[#01C0D3] border-b-2 border-[#01C0D3]"
                                : "text-gray-300 hover:text-white"
                        }`}
                    >
                        Following ({following.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("followers")}
                        className={`flex-1 py-3 font-semibold text-sm transition-colors ${
                            activeTab === "followers"
                                ? "text-[#01C0D3] border-b-2 border-[#01C0D3]"
                                : "text-gray-300 hover:text-white"
                        }`}
                    >
                        Followers ({followers.length})
                    </button>
                </div>

                {/* Search input */}
                <div className="p-4">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900 text-white rounded-md outline-none focus:ring-2 focus:ring-[#01C0D3]/50"
                    />
                </div>

                {/* Users list */}
                <div className="overflow-y-auto px-4 pb-4">
                    {loading ? (
                        <p className="text-center text-gray-400 py-8">Loading...</p>
                    ) : filteredUsers.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No users found.</p>
                    ) : (
                        <ul className="space-y-2">
                            {filteredUsers.map((user) => (
                                <li
                                    key={user.email}
                                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-700/50"
                                >
                                    <div
                                        className="flex items-center space-x-3 cursor-pointer"
                                        onClick={() => {
                                            onClose();
                                            navigate(`/profile/view/${user.email}`);
                                        }}
                                    >
                                        <img
                                            src={user.imageUrl || defaultProfile}
                                            alt={user.gamerName || "User"}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <span className="text-white font-medium">{user.gamerName || user.email}</span>
                                    </div>

                                    {activeTab === "following" && currentUserEmail === email && (
                                        <button
                                            onClick={() => handleUnfollow(user.email)}
                                            className="bg-gradient-to-b from-[#407CDE] to-[#2059B6] text-white text-xs px-3 py-1.5 rounded-md hover:brightness-110 transition duration-150"
                                        >
                                            Unfollow
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SquadModal;