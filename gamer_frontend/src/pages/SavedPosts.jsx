import React, { useEffect, useState } from "react";
import axios from "axios";
import NavBar from "../components/NavBar";
import Sidebar from "../components/SideBar";
import FeedCard from "../components/FeedCard";

const SavedPosts = () => {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dropdownOpenId, setDropdownOpenId] = useState(null);

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  const fetchSavedPosts = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:8080/api/saved-posts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const savedPostIds = res.data.map((p) => p.postId);
      const allPosts = await axios.get("http://localhost:8080/api/posts/all");
      const idToPostMap = new Map(allPosts.data.map((post) => [post.id, post]));
      const filtered = savedPostIds.map((id) => idToPostMap.get(id)).filter(Boolean);
      setSavedPosts(filtered);
    } catch (error) {
      console.error("Error fetching saved posts:", error);
    }
    setLoading(false);
  };

  const unsavePost = async (postId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `http://localhost:8080/api/saved-posts/toggle/${postId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSavedPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    } catch (error) {
      console.error("Error unsaving post:", error);
    }
  };

  const currentUserEmail = localStorage.getItem("email");

  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed top-0 left-0 w-full h-full bg-gray-900 z-[-1]"></div>
      <NavBar />
      <div className="container mx-auto flex">
        <Sidebar />
        <div className="w-2/4 mx-4 p-4 ml-[30%]">
          <div className="sticky top-[80px] bg-gray-900 z-30 pt-8 pb-6">
            <h1 className="text-3xl">Saved Items</h1>
          </div>

          <div className="mt-20">
            {loading ? (
              <p className="text-gray-400">Loading...</p>
            ) : savedPosts.length === 0 ? (
              <p className="text-gray-400">You haven't saved any posts yet.</p>
            ) : (
              savedPosts.map((post) => (
                <FeedCard
                  key={post.id}
                  item={post}
                  currentUserEmail={currentUserEmail}
                  dropdownOpenId={dropdownOpenId}
                  setDropdownOpenId={setDropdownOpenId}
                  toggleSave={unsavePost}
                  savedPostIds={savedPosts.map((p) => p.id)}
                  profileImage={post.userImage}
                  profileName={post.userName || "Unknown"}
                  showMenu={false}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedPosts;
