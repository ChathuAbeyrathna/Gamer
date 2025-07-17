import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import NavBar from "../../components/NavBar";
import defaultImg from "../../images/default.png";
import CreatePost from "../../components/CreatePost";
import WriteBlog from "../../components/WriteBlog";
import FeedCard from "../../components/FeedCard";
import ViewBlog from "../../components/ViewBlog";

const GroupView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const email = localStorage.getItem("email");
    const token = localStorage.getItem("token");

    const [group, setGroup] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const [isMember, setIsMember] = useState(false);
    const [groupFeed, setGroupFeed] = useState([]);
    const [showMyPostsOnly, setShowMyPostsOnly] = useState(false);
    const [dropdownOpenId, setDropdownOpenId] = useState(null);
    const [savedPostIds, setSavedPostIds] = useState([]);
    const [openBlog, setOpenBlog] = useState(null);
    const [editingPost, setEditingPost] = useState(null);
    const [editingBlog, setEditingBlog] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const menuRef = useRef(null);

    const [showCreatePost, setShowCreatePost] = useState(false);
    const [showBlogModal, setShowBlogModal] = useState(false);

    useEffect(() => {
        const fetchGroup = async () => {
            try {
                const res = await axios.get(`http://localhost:8080/api/groups/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setGroup(res.data);
                setIsOwner(res.data.ownerEmail === email);
                setIsMember(res.data.memberEmails.includes(email));
            } catch (err) {
                console.error("Error fetching group:", err);
            }
        };

        const fetchGroupFeed = async () => {
            try {
                const [postsRes, blogsRes] = await Promise.all([
                    axios.get(`http://localhost:8080/api/groups/${id}/posts`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`http://localhost:8080/api/groups/${id}/blogs`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                const posts = postsRes.data.map((p) => ({ ...p, type: "post" }));
                const blogs = blogsRes.data.map((b) => ({ ...b, type: "blog" }));

                const combined = [...posts, ...blogs].sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                );

                setGroupFeed(combined);
            } catch (err) {
                console.error("Failed to load posts/blogs", err);
            }
        };

        fetchGroup();
        fetchGroupFeed();
    }, [id, email, token, refreshKey]);

    useEffect(() => {
        const fetchSavedPosts = async () => {
            if (!token) return;
            try {
                const res = await axios.get("http://localhost:8080/api/saved-posts", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setSavedPostIds(res.data.map((sp) => sp.postId));
            } catch (error) {
                console.error("Error fetching saved posts:", error);
            }
        };

        fetchSavedPosts();
    }, [token]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setDropdownOpenId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const toggleSave = async (postId) => {
        if (!token) {
            const result = await window.confirm("You need to log in to save posts. Go to login page?");
            if (result) navigate("/login");
            return;
        }

        try {
            const res = await axios.post(
                `http://localhost:8080/api/saved-posts/toggle/${postId}`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (res.data) {
                setSavedPostIds((prev) => [...prev, postId]);
            } else {
                setSavedPostIds((prev) => prev.filter((id) => id !== postId));
            }
        } catch (err) {
            console.error("Error toggling save:", err);
        }
    };

    const handleEditItem = (item) => {
        if (item.type === "post") {
            setEditingPost(item);
            setShowCreatePost(true);
        } else {
            setEditingBlog(item);
            setShowBlogModal(true);
        }
        setDropdownOpenId(null);
    };

    const handleDeleteItem = async (itemId, isBlog = false) => {
        const type = isBlog ? "blog" : "post";

        const confirmDelete = await window.confirm(`Are you sure you want to delete this ${type}?`);
        if (!confirmDelete) return;

        const url = isBlog
            ? `http://localhost:8080/api/blogs/delete/${itemId}`
            : `http://localhost:8080/api/posts/delete/${itemId}`;

        try {
            const res = await fetch(url, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                setGroupFeed(prevItems => prevItems.filter(item => item.id !== itemId));
            } else {
                window.alert(`Failed to delete ${type}`);
            }
        } catch (err) {
            console.error(`Error deleting ${type}`, err);
        }

        setDropdownOpenId(null);
    };



    const filteredFeed = showMyPostsOnly
        ? groupFeed.filter((item) => item.email === email)
        : groupFeed;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="relative min-h-screen text-white">
            <div className="fixed top-0 left-0 w-full h-full bg-gray-900 z-[-1]"></div>
            <NavBar />

            <div className="relative z-10 bg-gray-900 min-h-screen pt-20 px-6 flex flex-col items-center">
                {group && (
                    <>
                        <img
                            src={group.coverPhotoUrl || defaultImg}
                            alt="Group Cover"
                            className="w-full max-w-4xl h-60 object-cover rounded-lg shadow-lg"
                        />

                        <div className="max-w-4xl w-full bg-gray-800 rounded-xl mt-6 p-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h1 className="text-3xl font-bold">{group.name}</h1>
                                    <p className="text-gray-300 mt-1">{group.description}</p>
                                    <p className="mt-1 text-sm text-gray-400">
                                        {group.memberEmails.length} Gamers
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    {isOwner && (
                                        <>
                                            <button
                                                onClick={() => navigate(`/group/edit/${group.id}`)}
                                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-1 rounded"
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    if (window.confirm("Are you sure you want to delete this group?")) {
                                                        try {
                                                            await axios.delete(`http://localhost:8080/api/groups/${id}?email=${email}`, {
                                                                headers: { Authorization: `Bearer ${token}` },
                                                            });
                                                            alert("Group deleted successfully");
                                                            navigate("/groups");
                                                        } catch (err) {
                                                            alert("Failed to delete group");
                                                            console.error(err);
                                                        }
                                                    }
                                                }}
                                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded"
                                            >
                                                🗑️ Delete
                                            </button>
                                        </>
                                    )}

                                    {!isOwner && !isMember && (
                                        <button
                                            onClick={async () => {
                                                try {
                                                    await axios.post(
                                                        `http://localhost:8080/api/groups/${id}/join?email=${email}`,
                                                        {},
                                                        { headers: { Authorization: `Bearer ${token}` } }
                                                    );
                                                    window.location.reload();
                                                } catch (err) {
                                                    console.error("Join failed:", err);
                                                }
                                            }}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                                        >
                                            Join Group
                                        </button>
                                    )}

                                    {!isOwner && isMember && (
                                        <button
                                            onClick={async () => {
                                                const confirmed = await window.confirm("Leave this group?");
                                                if (!confirmed) return;

                                                try {
                                                    await axios.post(
                                                        `http://localhost:8080/api/groups/${id}/leave?email=${email}`,
                                                        {},
                                                        { headers: { Authorization: `Bearer ${token}` } }
                                                    );
                                                    navigate(-1);
                                                } catch (err) {
                                                    console.error("Leave failed:", err);
                                                }
                                            }}
                                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                                        >
                                            Leave Group
                                        </button>

                                    )}

                                </div>
                            </div>

                            {group.tags?.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {group.tags.map((tag, idx) => (
                                        <span key={idx} className="bg-blue-700 px-3 py-1 rounded-full text-sm">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {(isOwner || isMember) && (
                                <div className="flex gap-4 mt-6 flex-wrap">
                                    <button
                                        onClick={() => {
                                            setEditingPost(null);
                                            setShowCreatePost(true);
                                        }}
                                        className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded"
                                    >
                                        Create a Post
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingBlog(null);
                                            setShowBlogModal(true);
                                        }}
                                        className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded"
                                    >
                                        ✍️ Write Blog
                                    </button>
                                    <button
                                        onClick={() => setShowMyPostsOnly((prev) => !prev)}
                                        className="bg-purple-700 hover:bg-purple-800 px-4 py-2 rounded"
                                    >
                                        {showMyPostsOnly ? "Show All Posts" : "My Posts"}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Feed */}
                        <div className="max-w-4xl w-full mt-10 space-y-6">
                            {filteredFeed.length === 0 ? (
                                <div className="bg-gray-800 p-4 rounded-lg text-center text-gray-400">
                                    No posts or blogs yet.
                                </div>
                            ) : (
                                filteredFeed.map((item) => (
                                    <FeedCard
                                        key={item.id || item._id}
                                        item={item}
                                        currentUserEmail={email}
                                        dropdownOpenId={dropdownOpenId}
                                        setDropdownOpenId={setDropdownOpenId}
                                        toggleSave={toggleSave}
                                        savedPostIds={savedPostIds}
                                        setOpenBlog={setOpenBlog}
                                        showMenu={showMyPostsOnly}
                                        onEdit={() => handleEditItem(item)}
                                        onDelete={() => handleDeleteItem(item.id, item.type === "blog")}
                                        ref={menuRef}
                                    />
                                ))
                            )}
                            {openBlog && <ViewBlog blog={openBlog} onClose={() => setOpenBlog(null)} />}
                        </div>
                    </>
                )}

                {showCreatePost && (
                    <CreatePost
                        onClose={() => {
                            setShowCreatePost(false);
                            setEditingPost(null);
                        }}
                        editingPost={editingPost}
                        onPostCreated={(newPost) => {
                            if (editingPost) {
                                setGroupFeed((prev) =>
                                    prev.map((p) => (p.id === newPost.id ? { ...newPost, type: "post" } : p))
                                );
                            } else {
                                setGroupFeed((prev) => [{ ...newPost, type: "post" }, ...prev]);
                            }
                            setRefreshKey((prev) => prev + 1);
                        }}
                        groupId={id}
                    />
                )}

                {showBlogModal && (
                    <WriteBlog
                        onClose={() => {
                            setShowBlogModal(false);
                            setEditingBlog(null);
                        }}
                        editingBlog={editingBlog}
                        onBlogCreated={(newBlog) => {
                            if (editingBlog) {
                                setGroupFeed((prev) =>
                                    prev.map((b) => (b.id === newBlog.id ? { ...newBlog, type: "blog" } : b))
                                );
                            } else {
                                setGroupFeed((prev) => [{ ...newBlog, type: "blog" }, ...prev]);
                            }
                            setRefreshKey((prev) => prev + 1);
                        }}
                        groupId={id}
                    />
                )}
            </div>
        </div>
    );
};

export default GroupView;
