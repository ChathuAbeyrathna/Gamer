import React, { useEffect, useState } from "react";
import axios from "axios";
import NavBar from "../components/NavBar";
import Sidebar from "../components/SideBar";
import FeedCard from "../components/FeedCard";

const SavedItems = () => {
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dropdownOpenId, setDropdownOpenId] = useState(null);

  const token = localStorage.getItem("token");
  const currentUserEmail = localStorage.getItem("email");

  useEffect(() => {
    const fetchSavedItems = async () => {
      if (!token) return;
      setLoading(true);
      try {
        // Fetch saved posts
        const savedPostsRes = await axios.get("http://localhost:8080/api/saved-posts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const savedPostsData = savedPostsRes.data; // includes postId and savedAt

        // Fetch saved blogs
        const savedBlogsRes = await axios.get("http://localhost:8080/api/saved-blogs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const savedBlogsData = savedBlogsRes.data; // includes blogId and savedAt

        // Fetch all posts and blogs
        const [allPostsRes, allBlogsRes, allGroupPostsRes, allGroupBlogsRes] = await Promise.all([
          axios.get("http://localhost:8080/api/posts/all", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:8080/api/blogs/all", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:8080/api/groups/all-posts", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:8080/api/groups/all-blogs", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        // Merge global + group posts/blogs
        const allPosts = [...allPostsRes.data, ...allGroupPostsRes.data];
        const allBlogs = [...allBlogsRes.data, ...allGroupBlogsRes.data];

        const idToPostMap = new Map(allPosts.map(p => [p.id, p]));
        const idToBlogMap = new Map(allBlogs.map(b => [b.id, b]));


        // Map saved items with savedAt
        const posts = savedPostsData
          .map(sp => {
            const post = idToPostMap.get(sp.postId);
            return post ? { ...post, type: "post", savedAt: sp.savedAt } : null;
          })
          .filter(Boolean);

        const blogs = savedBlogsData
          .map(sb => {
            const blog = idToBlogMap.get(sb.blogId);
            return blog ? { ...blog, type: "blog", savedAt: sb.savedAt } : null;
          })
          .filter(Boolean);

        // Combine and sort by savedAt descending
        setSavedItems([...posts, ...blogs].sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt)));

      } catch (err) {
        console.error("Error fetching saved items:", err);
      }
      setLoading(false);
    };

    fetchSavedItems();
  }, [token]); // <- added token as dependency, warning removed

  const toggleSave = async (item) => {
    if (!token) return;

    try {
      let res;
      if (item.type === "post") {
        res = await axios.post(
          `http://localhost:8080/api/saved-posts/toggle/${item.id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else if (item.type === "blog") {
        res = await axios.post(
          `http://localhost:8080/api/saved-blogs/toggle/${item.id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      if (res && res.data !== undefined) {
        setSavedItems(prev => prev.filter(i => i.id !== item.id));
      }
    } catch (err) {
      console.error("Error toggling save:", err);
    }
  };

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
            ) : savedItems.length === 0 ? (
              <p className="text-gray-400">You haven't saved any items yet.</p>
            ) : (
              savedItems.map((item) => (
                <FeedCard
                  key={item.id}
                  item={item}
                  currentUserEmail={currentUserEmail}
                  dropdownOpenId={dropdownOpenId}
                  setDropdownOpenId={setDropdownOpenId}
                  toggleSave={() => toggleSave(item)}
                  savedPostIds={savedItems.map((i) => i.id)}
                  profileImage={item.userImage || item.authorImage}
                  profileName={item.userName || item.authorName || "Unknown"}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedItems;
