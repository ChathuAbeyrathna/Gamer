import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import moment from "moment";
import NavBar from "../components/NavBar";
import Sidebar from "../components/SideBar";
import { FaBookmark } from "react-icons/fa";
import menuIcon from '../images/option.png';
import fillboost from '../images/fillboost.png';
import comment from '../images/comment.png';
import share from '../images/share.png';

const SavedPosts = () => {
    const [savedPosts, setSavedPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dropdownOpenId, setDropdownOpenId] = useState(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchSavedPosts();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpenId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const fetchSavedPosts = async () => {
        setLoading(true);
        const token = localStorage.getItem("token");
        try {
            const res = await axios.get("http://localhost:8080/api/saved-posts", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const savedPostIds = res.data.map(p => p.postId);
            const allPosts = await axios.get("http://localhost:8080/api/posts/all");
            const filtered = allPosts.data.filter(post => savedPostIds.includes(post.id));
            setSavedPosts(filtered);
        } catch (error) {
            console.error("Error fetching saved posts:", error);
        }
        setLoading(false);
    };

    const unsavePost = async (postId) => {
        const token = localStorage.getItem("token");
        try {
            await axios.post(`http://localhost:8080/api/saved-posts/toggle/${postId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSavedPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
        } catch (error) {
            console.error("Error unsaving post:", error);
        }
    };    

    const formatTime = (createdAt) => moment(createdAt).fromNow();

    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <NavBar />
            <div className="container mx-auto flex mt-4">
                <Sidebar />
                <div className="w-2/4 mx-4 p-4 mt-[6%] ml-[30%]">
                    <h1 className="text-3xl mb-8">Saved Items</h1>
                    {loading ? (
                        <p className="text-gray-400">Loading...</p>
                    ) : savedPosts.length === 0 ? (
                        <p className="text-gray-400">You haven't saved any posts yet.</p>
                    ) : (
                        savedPosts.map(post => (
                            <div key={post.id} className="bg-gray-800 p-4 rounded mb-4 relative">
                                <div className="absolute top-4 right-4">
                                    <button onClick={() => setDropdownOpenId(dropdownOpenId === post.id ? null : post.id)}>
                                        <img src={menuIcon} alt="menu" className="h-5" />
                                    </button>
                                    {dropdownOpenId === post.id && (
                                        <div ref={dropdownRef} className="absolute right-0 mt-2 w-40 bg-gradient-to-b from-[#222] to-[#444] text-white rounded shadow z-10">
                                            <button
                                                onClick={() => unsavePost(post.id)}
                                                className="flex items-center w-full text-left px-4 py-2 hover:bg-gray-600">
                                                <FaBookmark className="text-white mr-2" />
                                                <span>Unsave</span>
                                            </button>
                                            <button className="flex items-center w-full text-left px-4 py-2 hover:bg-gray-600">
                                                <div className="bg-gray-100 rounded-full w-4 h-4 flex items-center justify-center text-black mr-2">!</div>
                                                <span>Report Post</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center space-x-4">
                                    <img src={post.userImage} alt="User" className="h-10 w-10 rounded-full" />
                                    <div>
                                        <h2 className="font-semibold">{post.userName || "Unknown"}</h2>
                                        <p className="text-sm text-gray-400">{formatTime(post.createdAt)}</p>
                                    </div>
                                </div>
                                <p className="mt-2">{post.title}</p>
                                <p className="text-sm text-blue-400">
                                    #{Array.isArray(post.tags) ? post.tags.join(", ") : ""}
                                </p>
                                {post.imageUrl && (
                                    /\.(mp4|webm|ogg)$/.test(post.imageUrl) ? (
                                        <video controls className="w-full rounded my-2 mb-4">
                                            <source src={post.imageUrl} />
                                        </video>
                                    ) : (
                                        <img src={post.imageUrl} alt="Post" className="w-full rounded my-2 mb-4" />
                                    )
                                )}

                                <div className="flex justify-between text-white font-thin text-sm px-2">
                                    <span>24 Boosts</span>
                                    <span>5 Comments</span>
                                </div>
                                <hr className="border-t border-white opacity-30 my-2" />
                                <div className="flex justify-between text-white font-thin">
                                    <button className="flex items-center space-x-1">
                                        <img src={fillboost} alt="fillboost" className="w-7 h-7" />
                                        <span>Boost</span>
                                    </button>
                                    <button className="flex items-center space-x-1">
                                        <img src={comment} alt="comment" className="w-6 h-6" />
                                        <span>Comment</span>
                                    </button>
                                    <button className="flex items-center space-x-1">
                                        <img src={share} alt="share" className="w-6 h-6" />
                                        <span>Share</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default SavedPosts;
