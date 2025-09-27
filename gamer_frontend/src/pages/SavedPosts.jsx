import React, { useEffect, useState } from "react";
import axios from "axios";
import NavBar from "../components/NavBar";
import Sidebar from "../components/SideBar";
import FeedCard from "../components/FeedCard";
import ViewBlog from "../components/ViewBlog";

/**
 * SavedItems Component
 *
 * - Displays all posts and blogs that the current user has saved.
 * - Fetches saved items from backend and hydrates them with full post/blog data.
 * - Allows user to unsave items directly from the UI.
 * - Integrates FeedCard for each item and supports opening a blog in ViewBlog modal.
 */
const SavedItems = () => {
  // State to store fully hydrated saved items
  const [savedItems, setSavedItems] = useState([]);
  // Loading state for fetch operations
  const [loading, setLoading] = useState(false);
  // Track which dropdown (edit/save menu) is open
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  // Open blog modal state
  const [openBlog, setOpenBlog] = useState(null);

  // Auth token and current user email from localStorage
  const token = localStorage.getItem("token");
  const currentUserEmail = localStorage.getItem("email");

  /**
   * useEffect: Fetch saved posts and blogs on mount
   */
  useEffect(() => {
    const fetchSavedItems = async () => {
      if (!token) return; // Exit if user is not logged in
      setLoading(true);
      try {
        // Fetch saved post IDs and timestamps
        const [savedPostsRes, savedBlogsRes] = await Promise.all([
          axios.get("http://localhost:8080/api/saved-posts", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:8080/api/saved-blogs", { headers: { Authorization: `Bearer ${token}` } })
        ]);

        // Fetch all possible content (both global and group posts/blogs)
        const [allPostsRes, allBlogsRes, allGroupPostsRes, allGroupBlogsRes] = await Promise.all([
          axios.get("http://localhost:8080/api/posts/all", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:8080/api/blogs/all", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:8080/api/groups/all-posts", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:8080/api/groups/all-blogs", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        // Combine all posts and blogs into a map for quick lookup
        const allPosts = [...allPostsRes.data, ...allGroupPostsRes.data];
        const allBlogs = [...allBlogsRes.data, ...allGroupBlogsRes.data];
        const itemMap = new Map([
          ...allPosts.map(p => [p.id, { ...p, type: "post" }]),
          ...allBlogs.map(b => [b.id, { ...b, type: "blog" }]),
        ]);

        // Combine saved post/blog IDs with savedAt timestamps
        const allSavedData = [
          ...savedPostsRes.data.map(sp => ({ id: sp.postId, savedAt: sp.savedAt })),
          ...savedBlogsRes.data.map(sb => ({ id: sb.blogId, savedAt: sb.savedAt })),
        ];

        // Hydrate saved items with full post/blog data, filter missing items, and sort by savedAt
        const hydratedItems = allSavedData
          .map(savedItem => {
            const fullItem = itemMap.get(savedItem.id);
            return fullItem ? { ...fullItem, savedAt: savedItem.savedAt } : null;
          })
          .filter(Boolean)
          .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));

        setSavedItems(hydratedItems);
      } catch (err) {
        console.error("Error fetching saved items:", err);
      }
      setLoading(false);
    };

    fetchSavedItems();
  }, [token]);

  /**
   * toggleSave:
   * - Unsaves a post or blog
   * - Optimistically removes it from the UI
   */
  const toggleSave = async (item) => {
    if (!token) return;
    try {
      const endpoint = item.type === 'post' ? 'saved-posts' : 'saved-blogs';
      await axios.post(
        `http://localhost:8080/api/${endpoint}/toggle/${item.id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Remove item from savedItems to reflect unsave immediately
      setSavedItems(prev => prev.filter(i => i.id !== item.id));
    } catch (err) {
      console.error("Error toggling save:", err);
    }
  };

  return (
    <div className="relative min-h-screen text-white">
      {/* Background overlay */}
      <div className="fixed top-0 left-0 w-full h-full bg-gray-900 z-[-1]"></div>

      {/* Navigation bar */}
      <NavBar />

      <div className="container mx-auto flex">
        {/* Sidebar (hidden on mobile) */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Main content area */}
        <div className="w-full lg:w-2/4 px-4 lg:ml-[30%]">
          {/* Sticky page header */}
          <div className="sticky top-[70px] bg-gray-900 z-30 pt-8 pb-6">
            <h1 className="text-2xl lg:text-3xl">Saved Items</h1>
          </div>

          {/* Saved items list */}
          <div className="mt-20 mb-20 space-y-6">
            {loading ? (
              <p className="text-gray-400 text-center">Loading...</p>
            ) : savedItems.length === 0 ? (
              <p className="text-gray-400 text-center">You haven't saved any items yet.</p>
            ) : (
              savedItems.map((item) => (
                <FeedCard
                  key={`${item.type}-${item.id}`}
                  item={item}
                  currentUserEmail={currentUserEmail}
                  dropdownOpenId={dropdownOpenId}
                  setDropdownOpenId={setDropdownOpenId}
                  toggleSave={() => toggleSave(item)}
                  savedPostIds={[item.id]} // Mark this item as saved
                  profileImage={item.userImage || item.authorImage}
                  profileName={item.userName || item.authorName}
                  setOpenBlog={setOpenBlog} // Open blog modal when clicked
                />
              ))
            )}

            {/* Blog modal */}
            {openBlog && (
              <ViewBlog blog={openBlog} onClose={() => setOpenBlog(null)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedItems;
