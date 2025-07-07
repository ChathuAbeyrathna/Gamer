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

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [showSquad, setShowSquad] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editingBlog, setEditingBlog] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [openBlog, setOpenBlog] = useState(null);
  const [menuOpenIndex, setMenuOpenIndex] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

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

        const profileRes = await fetch(`http://localhost:8080/api/profile/${email}`, { headers });
        if (profileRes.status === 401 || profileRes.status === 403) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (!profileRes.ok) {
          navigate("/createprof");
          return;
        }

        const profileData = await profileRes.json();
        setProfile(profileData);

        const postRes = await fetch(`http://localhost:8080/api/posts/user/${email}`, { headers });
        const blogRes = await fetch(`http://localhost:8080/api/blogs/user/${email}`, { headers });

        const postData = postRes.ok ? await postRes.json() : [];
        const blogData = blogRes.ok ? await blogRes.json() : [];

        const postsWithType = postData.map(p => ({ ...p, type: "post" }));
        const blogsWithType = blogData.map(b => ({ ...b, type: "blog" }));

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpenIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const handleDeleteItem = async (itemId, isBlog = false) => {
    const type = isBlog ? "blog" : "post";
    const confirmDelete = window.confirm(`Are you sure you want to delete this ${type}?`);
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
        alert(`Failed to delete ${type}`);
      }
    } catch (err) {
      console.error(`Error deleting ${type}`, err);
    }

    setMenuOpenIndex(null);
  };

  const currentUserEmail = JSON.parse(atob(token.split('.')[1])).sub;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed top-0 left-0 w-full h-full bg-gray-900 z-[-1]"></div>
      <NavBar />
      <div className="container mx-auto flex mt-4 space-x-4 px-4">
        <div className="w-1/4">
          <Sidebar />
        </div>

        <div className="w-full flex flex-col items-center mt-20">
          {profile && (
            <div className="w-full max-w-6xl bg-gray-900 p-6 rounded-lg flex items-center mb-4">
              <img
                src={profile.imageUrl || defaultProfile}
                alt="Profile"
                className="w-52 h-52 rounded-full mr-12 ml-10"
              />
              <div className="flex-1 text-left relative">
                <div>
                  <h1 className="text-2xl font-semibold">{profile.gamerName}</h1>
                  <p className="text-gray-400 mt-4">{profile.bio}</p>
                  <p className="text-gray-400 mt-3">{profile.role?.join(" | ")}</p>
                </div>
                <div className="absolute top-0 right-0">
                  <Link to="/editprof">
                    <button className="bg-gray-700 px-4 py-2 rounded-full flex items-center space-x-2">
                      <img src={edit} alt="Edit" className="w-5 h-5" />
                      <span>Edit Profile</span>
                    </button>
                  </Link>
                </div>
                <div onClick={() => setShowSquad(true)} className="cursor-pointer absolute bottom-0 right-0 flex items-center space-x-2 text-gray-300">
                  <img src={squad} alt="Squad Icon" className="w-6 h-6" />
                  <span>Squad</span>
                </div>
                <div className="flex space-x-4 mt-8">
                  <button
                    className="bg-gray-900 px-4 py-2 rounded-full border-2 border-white"
                    onClick={() => {
                      setIsModalOpen(true);
                      setEditingPost(null);
                    }}
                  >
                    Create a post
                  </button>
                  <button
                    className="bg-gray-900 px-4 py-2 rounded-full border-2 border-white"
                    onClick={() => {
                      setIsBlogModalOpen(true);
                      setEditingBlog(null);
                    }}
                  >
                    Write a blog
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Feed Section */}
          <div className="w-full max-w-2xl bg-gray-900 p-4">
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
                  profileImage={profile.imageUrl || defaultProfile}
                  profileName={profile.gamerName}
                />
              ))
            )}

            {openBlog && (
              <ViewBlog blog={openBlog} onClose={() => setOpenBlog(null)} />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showSquad && (
        <div className="fixed inset-0 flex justify-center items-center z-20">
          <SquadModal
            email={profile?.email}
            show={showSquad}
            onClose={() => setShowSquad(false)}
          />
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center z-20">
          <CreatePost
            onClose={() => {
              setIsModalOpen(false);
              setEditingPost(null);
            }}
            editingPost={editingPost}
            onPostCreated={(newPost) => {
              if (editingPost) {
                setUserPosts((prev) =>
                  prev.map((p) => (p.id === newPost.id ? newPost : p))
                );
              } else {
                setUserPosts((prev) => [newPost, ...prev]);
              }
              setRefreshKey(prev => prev + 1);
            }}
          />
        </div>
      )}

      {isBlogModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center z-20">
          <WriteBlog
            onClose={() => {
              setIsBlogModalOpen(false);
              setEditingBlog(null);
            }}
            editingBlog={editingBlog}
            onBlogCreated={(newBlog) => {
              if (editingBlog) {
                setUserPosts((prev) =>
                  prev.map((b) => (b.id === newBlog.id ? newBlog : b))
                );
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
