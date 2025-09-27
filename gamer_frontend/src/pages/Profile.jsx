import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import Sidebar from "../components/SideBar";
import SquadModal from '../components/SquadModal';
import CreatePost from "../components/CreatePost";
import WriteBlog from "../components/WriteBlog";
import ViewBlog from "../components/ViewBlog";
import FeedCard from "../components/FeedCard";
import squad from '../images/squad.png';
import edit from '../images/edit.png';
import defaultProfile from '../images/defaultProfile.png';

/**
 * Profile Component
 * - Displays the user's profile information, posts, and blogs.
 * - Allows creating/editing posts and blogs.
 * - Shows Squad modal.
 * - Handles post/blog deletion.
 */
const Profile = () => {
  // User profile data
  const [profile, setProfile] = useState(null);

  // Modal states
  const [showSquad, setShowSquad] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // For CreatePost modal
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false); // For WriteBlog modal

  // Editing state
  const [editingPost, setEditingPost] = useState(null);
  const [editingBlog, setEditingBlog] = useState(null);

  // User posts/blogs data
  const [userPosts, setUserPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);

  // View blog modal state
  const [openBlog, setOpenBlog] = useState(null);

  // Dropdown menu for edit/delete in FeedCard
  const [menuOpenIndex, setMenuOpenIndex] = useState(null);
  const menuRef = useRef(null);

  // Force re-fetch data when posts/blogs are updated
  const [refreshKey, setRefreshKey] = useState(0);

  const navigate = useNavigate();
  const token = localStorage.getItem("token"); // JWT token for auth
  const currentUserEmail = token ? JSON.parse(atob(token.split('.')[1])).sub : null;

  /**
   * Fetch profile, posts, and blogs on mount or refresh
   */
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const decoded = JSON.parse(atob(token.split('.')[1]));
    const email = decoded.sub;

    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch profile
        const profileRes = await fetch(`http://localhost:8080/api/profile/${email}`, { headers });

        if (profileRes.status === 401 || profileRes.status === 403) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (!profileRes.ok) {
          navigate("/createprof"); // If profile does not exist, redirect
          return;
        }

        const profileData = await profileRes.json();
        setProfile(profileData);

        // Fetch user's posts and blogs
        const postRes = await fetch(`http://localhost:8080/api/posts/user/${email}`, { headers });
        const blogRes = await fetch(`http://localhost:8080/api/blogs/user/${email}`, { headers });

        const postData = postRes.ok ? await postRes.json() : [];
        const blogData = blogRes.ok ? await blogRes.json() : [];

        // Filter out group-specific posts/blogs
        const postsWithType = postData.filter(p => !p.groupId).map(p => ({ ...p, type: "post" }));
        const blogsWithType = blogData.filter(b => !b.groupId).map(b => ({ ...b, type: "blog" }));

        // Combine posts and blogs, sort by newest first
        const combined = [...postsWithType, ...blogsWithType].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setUserPosts(combined);
        setIsLoadingPosts(false);
      } catch (err) {
        console.error("Error fetching data", err);
        navigate("/createprof");
      }
    };

    fetchData();
  }, [navigate, refreshKey, token]);

  /**
   * Close dropdown if clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpenIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /**
   * Scroll to top on page load
   */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /**
   * Handle editing a post or blog
   */
  const handleEditItem = (item) => {
    if (item.type === "post") {
      setEditingPost(item);
      setIsModalOpen(true);
    } else if (item.type === "blog") {
      setEditingBlog(item);
      setIsBlogModalOpen(true);
    }
    setMenuOpenIndex(null);
  };

  /**
   * Handle deleting a post or blog
   */
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
        setUserPosts(prevItems => prevItems.filter(item => item.id !== itemId));
      } else {
        window.alert(`Failed to delete ${type}`);
      }
    } catch (err) {
      console.error(`Error deleting ${type}`, err);
    }

    setMenuOpenIndex(null);
  };

  return (
    <div className="relative min-h-screen text-white">
      {/* Background */}
      <div className="fixed top-0 left-0 w-full h-full bg-gray-900 z-[-1]"></div>

      {/* NavBar */}
      <NavBar />

      {/* Main Container */}
      <div className="flex flex-col md:flex-row container mx-auto mt-4 px-4 md:space-x-4">

        {/* Sidebar */}
        <div className="w-full md:w-1/4 mb-4 md:mb-0">
          <Sidebar />
        </div>

        {/* Profile and Feed */}
        <div className="flex-1 flex flex-col items-center mt-6 md:mt-20">

          {/* Profile Card */}
          {profile && (
            <div className="w-full max-w-6xl bg-gray-900 p-4 sm:p-6 md:p-6 rounded-lg flex flex-col md:flex-row items-center md:items-start mb-6">
              {/* Profile Image */}
              <img
                src={profile.imageUrl || defaultProfile}
                alt="Profile"
                className="w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 rounded-full object-cover mb-4 md:mb-0 md:mr-8"
              />

              {/* Profile Info */}
              <div className="flex-1 w-full relative text-center md:text-left">
                <div className="mb-4 md:mb-0">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold">{profile.gamerName}</h1>
                  <p className="text-gray-400 mt-2 sm:mt-4">{profile.bio}</p>
                  <p className="text-gray-400 mt-1 sm:mt-3">{profile.role?.join(" | ")}</p>
                </div>

                {/* Edit Profile Button */}
                <div className="absolute top-0 right-0">
                  <Link to="/editprof">
                    <button className="bg-gray-700 px-4 py-2 rounded-full flex items-center space-x-2">
                      <img src={edit} alt="Edit" className="w-5 h-5" />
                      <span>Edit Profile</span>
                    </button>
                  </Link>
                </div>

                {/* Squad Button */}
                <div onClick={() => setShowSquad(true)} className="cursor-pointer absolute bottom-0 right-0 flex items-center space-x-2 text-gray-300">
                  <img src={squad} alt="Squad Icon" className="w-6 h-6" />
                  <span>Squad</span>
                </div>

                {/* Create Post / Write Blog Buttons */}
                <div className="flex flex-col sm:flex-row justify-center md:justify-start space-y-2 sm:space-y-0 sm:space-x-4 mt-6 md:mt-8">
                  <button
                    className="bg-gray-900 px-4 py-2 rounded-full border-2 border-white w-full sm:w-auto"
                    onClick={() => { setIsModalOpen(true); setEditingPost(null); }}
                  >
                    Create a post
                  </button>
                  <button
                    className="bg-gray-900 px-4 py-2 rounded-full border-2 border-white w-full sm:w-auto"
                    onClick={() => { setIsBlogModalOpen(true); setEditingBlog(null); }}
                  >
                    Write a blog
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Feed Section */}
          <div className="w-full max-w-2xl bg-gray-900 p-4 sm:p-6 rounded-lg">
            {isLoadingPosts ? (
              <p className="text-center text-gray-400">Loading...</p>
            ) : userPosts.length === 0 ? (
              <p className="text-center text-gray-400">No posts yet.</p>
            ) : (
              userPosts.map((item) => (
                <FeedCard
                  key={item.id || item._id}
                  item={item}
                  currentUserEmail={currentUserEmail}
                  dropdownOpenId={menuOpenIndex}
                  setDropdownOpenId={setMenuOpenIndex}
                  setOpenBlog={setOpenBlog}
                  showMenu={true}
                  onEdit={() => handleEditItem(item)}
                  onDelete={() => handleDeleteItem(item.id, item.type === "blog")}
                  profileImage={profile.imageUrl}
                  profileName={profile.gamerName}
                />
              ))
            )}

            {/* View Blog Modal */}
            {openBlog && <ViewBlog blog={openBlog} onClose={() => setOpenBlog(null)} />}
          </div>
        </div>
      </div>

      {/* Squad Modal */}
      {showSquad && (
        <div className="fixed inset-0 flex justify-center items-center z-20 p-4">
          <SquadModal
            email={profile?.email}
            show={showSquad}
            onClose={() => setShowSquad(false)}
          />
        </div>
      )}

      {/* Create Post Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center z-20 p-4">
          <CreatePost
            onClose={() => { setIsModalOpen(false); setEditingPost(null); }}
            editingPost={editingPost}
            onPostCreated={(newPost) => {
              if (editingPost) {
                setUserPosts((prev) => prev.map((p) => (p.id === newPost.id ? newPost : p)));
              } else {
                setUserPosts((prev) => [newPost, ...prev]);
              }
              setRefreshKey(prev => prev + 1);
            }}
          />
        </div>
      )}

      {/* Write Blog Modal */}
      {isBlogModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center z-20 p-4">
          <WriteBlog
            onClose={() => { setIsBlogModalOpen(false); setEditingBlog(null); }}
            editingBlog={editingBlog}
            onBlogCreated={(newBlog) => {
              if (editingBlog) {
                setUserPosts((prev) => prev.map((b) => (b.id === newBlog.id ? newBlog : b)));
              } else {
                setUserPosts((prev) => [newBlog, ...prev]);
              }
              setRefreshKey(prev => prev + 1);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Profile;
