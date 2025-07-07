import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import defaultProfile from '../images/defaultProfile.png';

const SquadModal = ({ email, show, onClose }) => {
    const [activeTab, setActiveTab] = useState("following");
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const currentUserEmail = localStorage.getItem("email");

    // Disable main page scroll when modal is open
    useEffect(() => {
        if (show) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        // Cleanup on unmount
        return () => {
            document.body.style.overflow = "";
        };
    }, [show]);

    // Fetch followers and following when modal opens or email changes
    useEffect(() => {
        if (!show) return;

        const fetchBoth = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");

                const [followersRes, followingRes] = await Promise.all([
                    axios.get(`http://localhost:8080/api/follow/followers/${email}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`http://localhost:8080/api/follow/following/${email}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                setFollowers(followersRes.data);
                setFollowing(followingRes.data);

                setFilteredUsers(
                    activeTab === "followers" ? followersRes.data : followingRes.data
                );
            } catch (err) {
                console.error("Error fetching squad users:", err);
                setFollowers([]);
                setFollowing([]);
                setFilteredUsers([]);
            } finally {
                setLoading(false);
                setSearchTerm("");
            }
        };

        fetchBoth();
    }, [email, show, activeTab]);

    // Filter users by search term
    useEffect(() => {
        const list = activeTab === "followers" ? followers : following;
        const lower = searchTerm.toLowerCase();

        if (!searchTerm.trim()) {
            setFilteredUsers(list);
        } else {
            setFilteredUsers(
                list.filter((u) => u.gamerName?.toLowerCase().includes(lower))
            );
        }
    }, [searchTerm, activeTab, followers, following]);

    // Unfollow handler
    const handleUnfollow = async (targetEmail) => {
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `http://localhost:8080/api/follow/toggle-follow/${targetEmail}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const updatedList = following.filter((u) => u.email !== targetEmail);
            setFollowing(updatedList);
            if (activeTab === "following") {
                setFilteredUsers(
                    searchTerm
                        ? updatedList.filter((u) =>
                            u.gamerName?.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        : updatedList
                );
            }
        } catch (err) {
            console.error("Unfollow failed:", err);
        }
    };

    if (!show) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur flex items-center justify-center z-50"
            onClick={onClose}
            style={{ overflow: "visible" }}
        >
            <div
                className="bg-gray-800 rounded-lg p-6 max-w-md w-full max-h-screen"
                onClick={(e) => e.stopPropagation()}
                style={{ overflow: "visible" }}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-white">Squad</h2>
                    <button
                        onClick={onClose}
                        className="text-white text-2xl font-bold hover:text-gray-400"
                        aria-label="Close modal"
                    >
                        &times;
                    </button>
                </div>

                {/* Tabs with counts */}
                <div className="flex space-x-4 mb-4">
                    <button
                        onClick={() => setActiveTab("following")}
                        className={`flex-1 py-2 border-b-2 ${activeTab === "following"
                            ? "text-[#01C0D3] border-[#01C0D3]"
                            : "text-white border-transparent hover:text-[#01C0D3] hover:border-[#01C0D3]"
                            }`}
                    >
                        Following ({following.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("followers")}
                        className={`flex-1 py-2 border-b-2 ${activeTab === "followers"
                            ? "text-[#01C0D3] border-[#01C0D3]"
                            : "text-white border-transparent hover:text-[#01C0D3] hover:border-[#01C0D3]"
                            }`}
                    >
                        Followers ({followers.length})
                    </button>
                </div>

                {/* Search */}
                <input
                    type="text"
                    placeholder="Search Your Gamer"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full mb-3 px-3 py-2 bg-gray-800 text-white rounded outline-none placeholder-gray-400"
                />

                {/* User List */}
                {loading ? (
                    <p className="text-center text-gray-300">Loading...</p>
                ) : filteredUsers.length === 0 ? (
                    <p className="text-center text-gray-500">No users found.</p>
                ) : (
                    <ul className="max-h-64 overflow-y-auto space-y-2">
                        {filteredUsers
                            .slice()
                            .sort((a, b) => a.gamerName?.localeCompare(b.gamerName || "") || 0)
                            .map((user) => (
                                <li
                                    key={user.email}
                                    className="flex items-center justify-between p-2 rounded hover:bg-gray-800"
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
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = defaultProfile;
                                            }}
                                        />
                                        <span className="text-white font-medium">
                                            {user.gamerName || user.email}
                                        </span>
                                    </div>

                                    {/* Unfollow button */}
                                    {activeTab === "following" && currentUserEmail === email && (
                                        <button
                                            onClick={() => handleUnfollow(user.email)}
                                            className="bg-gradient-to-b from-[#407CDE] to-[#2059B6] text-white text-xs px-2 py-1 rounded hover:brightness-110 transition duration-150"
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
    );
};

export default SquadModal;
