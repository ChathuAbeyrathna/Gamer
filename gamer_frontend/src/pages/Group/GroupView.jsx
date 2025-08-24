import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { UserIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
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
    const [savedBlogIds, setSavedBlogIds] = useState([]);
    const [openBlog, setOpenBlog] = useState(null);
    const [editingPost, setEditingPost] = useState(null);
    const [editingBlog, setEditingBlog] = useState(null);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [showBlogModal, setShowBlogModal] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const menuRef = useRef(null);

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
                    axios.get(`http://localhost:8080/api/groups/${id}/posts`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`http://localhost:8080/api/groups/${id}/blogs`, { headers: { Authorization: `Bearer ${token}` } }),
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
        const fetchSavedItems = async () => {
            if (!token) return;
            try {
                // Saved posts
                const postsRes = await axios.get("http://localhost:8080/api/saved-posts", { headers: { Authorization: `Bearer ${token}` } });
                setSavedPostIds(postsRes.data.map(sp => sp.postId));

                // Saved blogs
                const blogsRes = await axios.get("http://localhost:8080/api/saved-blogs", { headers: { Authorization: `Bearer ${token}` } });
                setSavedBlogIds(blogsRes.data.map(sb => sb.blogId));
            } catch (err) {
                console.error("Error fetching saved items:", err);
            }
        };

        fetchSavedItems();
    }, [token]);


    const toggleSavePost = async (postId) => {
        if (!token) {
            const result = await window.confirm("You need to log in to save posts. Go to login page?");
            if (result) navigate("/login");
            return;
        }
        try {
            const res = await axios.post(`http://localhost:8080/api/saved-posts/toggle/${postId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
            if (res.data) setSavedPostIds(prev => [...prev, postId]);
            else setSavedPostIds(prev => prev.filter(id => id !== postId));
        } catch (err) { console.error("Error toggling save post:", err); }
    };

    const toggleSaveBlog = async (blogId) => {
        if (!token) {
            const result = await window.confirm("You need to log in to save blogs. Go to login page?");
            if (result) navigate("/login");
            return;
        }
        try {
            const res = await axios.post(`http://localhost:8080/api/saved-blogs/toggle/${blogId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
            if (res.data) setSavedBlogIds(prev => [...prev, blogId]);
            else setSavedBlogIds(prev => prev.filter(id => id !== blogId));
        } catch (err) { console.error("Error toggling save blog:", err); }
    };

    const handleEditItem = (item) => {
        if (item.type === "post") { setEditingPost(item); setShowCreatePost(true); }
        else { setEditingBlog(item); setShowBlogModal(true); }
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
            const res = await fetch(url, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) setGroupFeed(prev => prev.filter(item => item.id !== itemId));
            else window.alert(`Failed to delete ${type}`);
        } catch (err) { console.error(`Error deleting ${type}`, err); }

        setDropdownOpenId(null);
    };

    const filteredFeed = showMyPostsOnly ? groupFeed.filter(item => item.email === email) : groupFeed;

    useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <div className="relative min-h-screen text-white">
            <div className="fixed top-0 left-0 w-full h-full bg-gray-900 z-[-1]"></div>
            <NavBar />

            <button onClick={() => navigate(-1)} className="fixed top-24 left-32 mt-4 z-50 text-white hover:text-gray-400">
                <FaArrowLeft className="text-2xl font-light" style={{ strokeWidth: 1 }} />
            </button>

            <div className="mx-auto mt-20 px-4 py-8 flex flex-col items-center">
                {group && (
                    <>
                        <img src={group.coverPhotoUrl || defaultImg} alt="Group Cover" className="w-full max-w-4xl h-80 object-cover shadow-lg" />
                        <div className="max-w-4xl w-full mt-6 mb-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h1 className="text-3xl font-bold">{group.name}</h1>
                                    <p className="text-gray-300 mt-1">{group.description}</p>
                                    <p className="mt-1 text-sm text-gray-400">{group.memberEmails.length} Gamers</p>
                                </div>

                                <div className="flex gap-2">
                                    {isOwner && (
                                        <div className="relative" ref={menuRef}>
                                            <button
                                                onClick={() => setShowMenu(prev => !prev)}
                                                className="p-2"
                                            >
                                                <Cog6ToothIcon className="w-5 h-5" />
                                            </button>

                                            {showMenu && (
                                                <div className="absolute right-0 mt-2 w-40 bg-gradient-to-b from-[#222] to-[#444] text-white rounded shadow z-10">
                                                    <button
                                                        onClick={() => {
                                                            setShowMenu(false);
                                                            navigate(`/group/edit/${group.id}`);
                                                        }}
                                                        className="w-full text-left px-4 py-2 hover:bg-gray-600"
                                                    >
                                                        Edit Group
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            setShowMenu(false);
                                                            // Wait for confirmation before proceeding
                                                            const confirmed = await window.confirm("Are you sure you want to delete this group?");
                                                            if (!confirmed) return; // Stop if user cancels

                                                            try {
                                                                await axios.delete(`http://localhost:8080/api/groups/${id}?email=${email}`, {
                                                                    headers: { Authorization: `Bearer ${token}` },
                                                                });
                                                                alert("Group deleted successfully");
                                                                navigate("/yourgroups");
                                                            } catch (err) {
                                                                alert("Failed to delete group");
                                                                console.error(err);
                                                            }
                                                        }}
                                                        className="w-full text-left px-4 py-2 hover:bg-gray-600"
                                                    >
                                                        Delete Group
                                                    </button>
                                                </div>
                                            )}
                                        </div>
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
                                            className="px-4 py-2 rounded-md text-sm font-medium border border-white text-white"
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
                                            className="px-4 py-2 rounded-md text-sm font-medium border border-white text-white"
                                        >
                                            Leave Group
                                        </button>

                                    )}
                                </div>
                            </div>

                            {(isOwner || isMember) && (
                                <div className="flex flex-wrap items-center justify-between w-full mt-6">
                                    <div className="flex gap-4">
                                        <button onClick={() => { setEditingPost(null); setShowCreatePost(true); }} className="w-36 py-2 rounded-lg font-medium hover:opacity-90 bg-[linear-gradient(to_right,_rgba(33,_80,_182,_0.5),_rgba(1,_192,_211,_0.5))]">Create a Post</button>
                                        <button onClick={() => { setEditingBlog(null); setShowBlogModal(true); }} className="w-36 py-2 rounded-lg font-medium hover:opacity-90 bg-[linear-gradient(to_right,_rgba(33,_80,_182,_0.5),_rgba(1,_192,_211,_0.5))]">Write a Blog</button>
                                    </div>

                                    <div>
                                        <button onClick={() => setShowMyPostsOnly(prev => !prev)} className="border border-white text-white rounded-full p-2 hover:bg-white/20 transition duration-200">
                                            {showMyPostsOnly ? <ClipboardDocumentListIcon className="w-5 h-5" alt="All Posts" /> : <UserIcon className="w-5 h-5" alt="My Posts" />}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Feed */}
                        <div className="w-2/4 mx-4 mt-8 space-y-6">
                            {filteredFeed.length === 0 ? (
                                <div className="text-center text-gray-400">No posts or blogs yet.</div>
                            ) : (
                                filteredFeed.map((item) => (
                                    <FeedCard
                                        key={item.id || item._id}
                                        item={item}
                                        currentUserEmail={email}
                                        dropdownOpenId={dropdownOpenId}
                                        setDropdownOpenId={setDropdownOpenId}
                                        toggleSave={item.type === "post" ? toggleSavePost : toggleSaveBlog}
                                        savedPostIds={item.type === "post" ? savedPostIds : savedBlogIds}
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
                        onClose={() => { setShowCreatePost(false); setEditingPost(null); }}
                        editingPost={editingPost}
                        onPostCreated={(newPost) => {
                            if (editingPost) setGroupFeed(prev => prev.map(p => p.id === newPost.id ? { ...newPost, type: "post" } : p));
                            else setGroupFeed(prev => [{ ...newPost, type: "post" }, ...prev]);
                            setRefreshKey(prev => prev + 1);
                        }}
                        groupId={id}
                    />
                )}

                {showBlogModal && (
                    <WriteBlog
                        onClose={() => { setShowBlogModal(false); setEditingBlog(null); }}
                        editingBlog={editingBlog}
                        onBlogCreated={(newBlog) => {
                            if (editingBlog) setGroupFeed(prev => prev.map(b => b.id === newBlog.id ? { ...newBlog, type: "blog" } : b));
                            else setGroupFeed(prev => [{ ...newBlog, type: "blog" }, ...prev]);
                            setRefreshKey(prev => prev + 1);
                        }}
                        groupId={id}
                    />
                )}
            </div>
        </div>
    );
};

export default GroupView;
