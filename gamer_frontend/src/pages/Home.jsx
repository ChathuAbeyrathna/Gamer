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
  const [profiles, setProfiles] = useState([]);
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const [openBlog, setOpenBlog] = useState(null);
  const [loading, setLoading] = useState(true); 
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeed();
    fetchSavedPosts();
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/profile/all")
      .then((res) => setProfiles(res.data))
      .catch((err) => console.error("Error fetching profiles:", err));
  }, []);

  const currentUserEmail = localStorage.getItem("email");

  const fetchFeed = async () => {
    setLoading(true); // Start loading
    try {
      const [postsRes, blogsRes] = await Promise.all([
        axios.get("http://localhost:8080/api/posts/all"),
        axios.get("http://localhost:8080/api/blogs/all"),
      ]);

      const posts = postsRes.data.map((post) => ({ ...post, type: "post" }));
      const blogs = blogsRes.data.map((blog) => ({ ...blog, type: "blog" }));

      const combinedFeed = [...posts, ...blogs].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setFeedItems(combinedFeed);
    } catch (error) {
      console.error("Error fetching feed:", error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const fetchSavedPosts = async () => {
    const token = localStorage.getItem("token");
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

  const toggleSave = async (postId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

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
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <NavBar />

      {/* Main Layout */}
      <div className="container mx-auto flex mt-4">
        {/* Sidebar */}
        <Sidebar />

        {/* Feed */}
        <div className="w-2/4 mx-4 bg-gray-900 p-4 h-full mt-[6%] ml-[25%]">
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
                toggleSave={toggleSave}
                savedPostIds={savedPostIds}
                setOpenBlog={setOpenBlog}
              />
            ))
          )}
          {openBlog && (
            <ViewBlog blog={openBlog} onClose={() => setOpenBlog(null)} />
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-1/4 bg-black-800 p-4 hidden lg:block fixed right-0 h-full mt-[6%]">
          <h2 className="font-semibold mb-2">Power Up Your Stream:</h2>
          <ul>
            {profiles
              .filter((profile) => profile.email !== currentUserEmail)
              .map((profile) => (
                <div
                  key={profile.email}
                  className="p-[2px] bg-gradient-to-r from-[#01C0D3] to-[#2059B6] rounded mr-10 mb-5 mt-6"
                >
                  <li className="flex items-center justify-between p-2 bg-gray-800 hover:bg-gray-700 rounded h-14">
                    <div className="flex items-center space-x-3">
                      <img
                        src={profile.imageUrl || defaultProfile}
                        alt="Profile"
                        className="w-10 h-10 rounded-full"
                      />
                      <span>{profile.gamerName}</span>
                    </div>
                    <button className="bg-gradient-to-b from-[#2059B6] to-[#407CDE] text-white text-xs px-2 py-1 rounded">
                      Follow
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
