import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import FeedCard from "../../components/FeedCard";
import defaultBanner from "../../images/default.png";
import NavBar from "../../components/NavBar";
import Sidebar from "../../components/SideBar";

const GroupView = () => {
    const { groupId } = useParams();
    const [group, setGroup] = useState(null);
    const [isJoined, setIsJoined] = useState(false);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const currentUserEmail = localStorage.getItem("email");
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchGroup = async () => {
            try {
                const res = await axios.get(`http://localhost:8080/api/groups/${groupId}`);
                setGroup(res.data);
                setIsJoined(res.data.memberEmails.includes(currentUserEmail));
            } catch (err) {
                console.error("Error loading group:", err);
            }
        };

        const fetchGroupPosts = async () => {
            try {
                const res = await axios.get("http://localhost:8080/api/posts/all", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const filtered = res.data.filter((p) => p.groupId === groupId);
                setPosts(filtered);
            } catch (err) {
                console.error("Error loading posts:", err);
            }
        };

        fetchGroup();
        fetchGroupPosts();
        setLoading(false);
        window.scrollTo(0, 0);
    }, [groupId, currentUserEmail, token]);

    const handleJoinOrLeave = async () => {
        try {
            if (isJoined) {
                // Leave group
                await axios.post(`http://localhost:8080/api/groups/${groupId}/leave?email=${currentUserEmail}`, {}, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setIsJoined(false);
                setGroup(prev => ({
                    ...prev,
                    memberEmails: prev.memberEmails.filter(email => email !== currentUserEmail),
                }));
            } else {
                // Join group
                await axios.post(`http://localhost:8080/api/groups/${groupId}/join?email=${currentUserEmail}`, {}, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setIsJoined(true);
                setGroup(prev => ({
                    ...prev,
                    memberEmails: [...prev.memberEmails, currentUserEmail],
                }));
            }
        } catch (err) {
            console.error("Join/Leave failed:", err);
        }
    };

    if (loading || !group) {
        return <p className="text-center text-gray-400 mt-10">Loading...</p>;
    }

    return (
        <div className="min-h-screen text-white bg-gray-900">
            <NavBar />
            <div className="flex mt-4 px-4">
                <div className="w-1/4">
                    <Sidebar />
                </div>
                <div className="w-3/4">
                    {/* Banner */}
                    <div className="relative rounded-xl overflow-hidden h-[250px] mb-6">
                        <img
                            src={group.coverPhotoUrl || defaultBanner}
                            alt="Group Banner"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Group info */}
                    <div className="flex items-center justify-between mb-6 px-4">
                        <div>
                            <h1 className="text-3xl font-bold">{group.name}</h1>
                            <p className="text-gray-400">{group.memberEmails.length} Gamers</p>
                        </div>
                        <div className="space-x-4 flex items-center">
                            <button
                                onClick={handleJoinOrLeave}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                            >
                                {isJoined ? "Leave Group" : "Join to Group"}
                            </button>
                            <button
                                className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-md"
                                onClick={() => navigate(`/groups/${groupId}/create-post`)}
                            >
                               Join to Group
                            </button>
                        </div>
                    </div>

                    {/* Posts */}
                    <div className="space-y-6 px-4">
                        {posts.length > 0 ? (
                            posts.map((post) => (
                                <FeedCard
                                    key={post.id}
                                    item={post}
                                    currentUserEmail={currentUserEmail}
                                />
                            ))
                        ) : (
                            <p className="text-gray-400 text-center">No posts in this group yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupView;
