import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import FeedCard from "../components/FeedCard";
import NavBar from "../components/NavBar";
import Sidebar from "../components/SideBar";
import ViewBlog from "../components/ViewBlog";
import defaultProfile from '../images/defaultProfile.png';

const Home = () => {
  const [feedItems, setFeedItems] = useState([]);
  const [savedPostIds, setSavedPostIds] = useState([]);
  const [savedBlogIds, setSavedBlogIds] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [following, setFollowing] = useState([]);
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const [openBlog, setOpenBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const currentUserEmail = localStorage.getItem("email");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      try {
        const [postsRes, blogsRes] = await Promise.all([
          axios.get("http://localhost:8080/api/posts/all"),
          axios.get("http://localhost:8080/api/blogs/all"),
        ]);
        const posts = postsRes.data.map((p) => ({ ...p, type: "post" }));
        const blogs = blogsRes.data.map((b) => ({ ...b, type: "blog" }));
        const combinedFeed = [...posts, ...blogs].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setFeedItems(combinedFeed);
      } catch (error) {
        console.error("Error fetching feed:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSavedItems = async () => {
      if (!token) return;
      try {
        // Fetch saved posts
        const postsRes = await axios.get("http://localhost:8080/api/saved-posts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSavedPostIds(postsRes.data.map(sp => sp.postId));

        // Fetch saved blogs
        const blogsRes = await axios.get("http://localhost:8080/api/saved-blogs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSavedBlogIds(blogsRes.data.map(sb => sb.blogId));

      } catch (err) {
        console.error("Error fetching saved items:", err);
      }
    };

    const fetchProfiles = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/profile/all");
        setProfiles(res.data);
      } catch (err) {
        console.error("Error fetching profiles:", err);
      }
    };

    const fetchFollowing = async () => {
      if (!token || !currentUserEmail) return;
      try {
        const res = await axios.get(
          `http://localhost:8080/api/follow/following/${currentUserEmail}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFollowing(res.data.map((user) => user.email));
      } catch (err) {
        console.error("Error fetching following list:", err);
      }
    };

    fetchFeed();
    fetchSavedItems();
    fetchProfiles();
    fetchFollowing();
  }, [currentUserEmail, token]);

  const handleToggleFollow = async (email, e) => {
    e.stopPropagation();
    if (!token) {
      const result = window.confirm("You need to log in to follow users. Go to login page?");
      if (result) navigate("/login");
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:8080/api/follow/toggle-follow/${email}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.status === "FOLLOWED") {
        setFollowing(prev => (prev.includes(email) ? prev : [...prev, email]));
      } else if (res.data.status === "UNFOLLOWED") {
        setFollowing(prev => prev.filter(e => e !== email));
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
    }
  };

  const toggleSavePost = async (postId) => {
    if (!token) {
      const result = window.confirm("You need to log in to save posts. Go to login page?");
      if (result) navigate("/login");
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:8080/api/saved-posts/toggle/${postId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data) {
        setSavedPostIds(prev => [...prev, postId]);
      } else {
        setSavedPostIds(prev => prev.filter(id => id !== postId));
      }
    } catch (err) {
      console.error("Error toggling save post:", err);
    }
  };

  const toggleSaveBlog = async (blogId) => {
    if (!token) {
      const result = window.confirm("You need to log in to save blogs. Go to login page?");
      if (result) navigate("/login");
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:8080/api/saved-blogs/toggle/${blogId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data) {
        setSavedBlogIds(prev => [...prev, blogId]);
      } else {
        setSavedBlogIds(prev => prev.filter(id => id !== blogId));
      }
    } catch (err) {
      console.error("Error toggling save blog:", err);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed top-0 left-0 w-full h-full bg-gray-900 z-[-1]"></div>
      <NavBar />

      <div className="container mx-auto flex mt-4">
        {/* Sidebar is now wrapped to be hidden on mobile */}
        <div className="hidden lg:block">
            <Sidebar />
        </div>

        {/* Feed - updated with responsive classes */}
        <div className="w-full lg:w-2/4 bg-gray-900 p-4 mt-20 lg:ml-[25%]">
          {loading ? (
            <div className="flex justify-center items-center h-40 text-gray-400 text-lg font-medium">
              Loading...
            </div>
          ) : (
            feedItems.map((item) => (
              <FeedCard
                key={item.id}
                item={item}
                currentUserEmail={currentUserEmail}
                dropdownOpenId={dropdownOpenId}
                setDropdownOpenId={setDropdownOpenId}
                toggleSave={item.type === "post" ? toggleSavePost : toggleSaveBlog}
                savedPostIds={item.type === "post" ? savedPostIds : savedBlogIds}
                setOpenBlog={setOpenBlog}
              />
            ))
          )}
          {openBlog && (
            <ViewBlog blog={openBlog} onClose={() => setOpenBlog(null)} />
          )}
        </div>

        {/* Right Sidebar - no changes needed, it was already responsive */}
        <div className="w-1/4 bg-black-800 p-4 hidden lg:block fixed right-0 h-full mt-[6%]">
          <h2 className="font-semibold mb-2">Power Up Your Stream:</h2>
          <ul>
            {profiles
              .filter((p) => p.email !== currentUserEmail)
              .slice(0, 5)
              .map((p) => (
                <div
                  key={p.email}
                  className="p-[2px] bg-gradient-to-r from-[#01C0D3] to-[#2059B6] rounded mr-10 mb-5 mt-6"
                >
                  <li className="flex items-center justify-between p-2 bg-gray-800 hover:bg-gray-700 rounded h-14 cursor-pointer">
                    <div
                      className="flex items-center space-x-3"
                      onClick={() => navigate(`/profile/view/${p.email}`)}
                    >
                      <img
                        src={p.imageUrl || defaultProfile}
                        alt={p.gamerName}
                        className="w-10 h-10 rounded-full"
                      />
                      <span>{p.gamerName}</span>
                    </div>
                    <button
                      onClick={(e) => handleToggleFollow(p.email, e)}
                      className={`text-xs px-2 py-1 rounded hover:brightness-110 transition duration-150 ${following.includes(p.email)
                        ? "bg-gradient-to-b from-[#407CDE] to-[#2059B6]"
                        : "bg-gradient-to-b from-[#2059B6] to-[#407CDE]"
                        }`}
                    >
                      {following.includes(p.email) ? "Unfollow" : "Follow"}
                    </button>
                  </li>
                </div>
              ))}
          </ul>
          <Link to="/allprof">
            <button className="mt-2 text-white-500">View All →</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;