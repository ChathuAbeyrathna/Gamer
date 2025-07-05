import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FeedCard from "../../components/FeedCard";
import NavBar from "../../components/NavBar";
import Sidebar from "../../components/SideBar";
import ViewBlog from "../../components/ViewBlog";
import { FaArrowLeft } from "react-icons/fa";
import defaultGroup from '../../images/default.png';

const categories = [
  { name: "Action Game", icon: "🎯", tag: "action" },
  { name: "Adventure Game", icon: "🏹", tag: "adventure" },
  { name: "RPG Game", icon: "🎮", tag: "rpg" },
  { name: "Simulation Game", icon: "🧑‍🏫", tag: "simulation" },
  { name: "Sports Game", icon: "🏓", tag: "sports" },
  { name: "Others", icon: "🏆", tag: "others" },
];

const Suggest = () => {
  const [feedItems, setFeedItems] = useState([]);
  const [savedPostIds, setSavedPostIds] = useState([]);
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const [openBlog, setOpenBlog] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [viewType, setViewType] = useState("posts");
  const [exploreGroups, setExploreGroups] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeed();
    fetchGroups();
    fetchSavedPosts();
  }, []);

  const fetchFeed = async () => {
    const token = localStorage.getItem("token");
    const [postsRes, blogsRes] = await Promise.all([
      axios.get("http://localhost:8080/api/posts/all", {
        headers: { Authorization: `Bearer ${token}` }
      }),
      axios.get("http://localhost:8080/api/blogs/all", {
        headers: { Authorization: `Bearer ${token}` }
      }),
    ]);

    const posts = postsRes.data.map((post) => ({ ...post, type: "post" }));
    const blogs = blogsRes.data.map((blog) => ({ ...blog, type: "blog" }));

    const combinedFeed = [...posts, ...blogs].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    setFeedItems(combinedFeed);
  };

  const fetchGroups = async () => {
    const userEmail = localStorage.getItem("email");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8080/api/groups", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const otherGroups = res.data.filter(g => g.ownerEmail !== userEmail);
      setExploreGroups(otherGroups);
    } catch (err) {
      console.error("Error loading groups:", err);
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

    const res = await axios.post(`http://localhost:8080/api/saved-posts/toggle/${postId}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.data) {
      setSavedPostIds(prev => [...prev, postId]);
    } else {
      setSavedPostIds(prev => prev.filter(id => id !== postId));
    }
  };

  const knownTags = ["action", "adventure", "rpg", "simulation", "sports"];

  const filteredItems = selectedCategory
    ? feedItems.filter((item) => {
      if (!item.tags || !Array.isArray(item.tags)) return false;
      const itemTags = item.tags.map(tag => tag.toLowerCase());

      if (selectedCategory === "others") {
        return !itemTags.some(tag =>
          knownTags.some(known => tag.includes(known))
        );
      } else {
        return itemTags.some(tag => tag.includes(selectedCategory.toLowerCase()));
      }
    })
    : [];

  const currentUserEmail = localStorage.getItem("email");

  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed top-0 left-0 w-full h-full bg-gray-900 z-[-1]"></div>
      <NavBar />

      <div className="container mx-auto flex mt-4 space-x-4 px-4">
        <div className="w-1/4">
          <Sidebar />
        </div>

        <div className="w-full flex flex-col">
          {/* Category Title with Back Arrow */}
          <div className="sticky top-[80px] bg-gray-900 z-30 pt-6 pb-4">
            <div className="container mx-auto flex items-center space-x-3 px-10 text-3xl ml-20">
              {selectedCategory && (
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setViewType("posts");
                  }}
                  className="hover:text-gray-400"
                >
                  <FaArrowLeft className="text-2xl font-light mr-1" style={{ strokeWidth: 1 }} />
                </button>
              )}
              <h2>
                {selectedCategory
                  ? categories.find((cat) => cat.tag === selectedCategory)?.name || "Category"
                  : "Categories"}
              </h2>
            </div>
          </div>

          {/* Posts/Groups Tabs */}
          {selectedCategory && (
            <div className="sticky top-[140px] bg-gray-900 z-30 py-2 flex justify-center">
              <div className="mb-2 space-x-8 text-lg font-semibold">
                <button
                  onClick={() => setViewType("posts")}
                  className={`px-4 py-1 border-b-2 ${viewType === "posts"
                    ? "text-[#01C0D3] border-[#01C0D3]"
                    : "text-gray-400 border-transparent hover:text-[#01C0D3] hover:border-[#01C0D3]"
                    }`}
                >
                  Posts
                </button>
                <button
                  onClick={() => setViewType("groups")}
                  className={`px-4 py-1 border-b-2 ${viewType === "groups"
                    ? "text-[#01C0D3] border-[#01C0D3]"
                    : "text-gray-400 border-transparent hover:text-[#01C0D3] hover:border-[#01C0D3]"
                    }`}
                >
                  Groups
                </button>
              </div>
            </div>
          )}

          {/* Category List */}
          {!selectedCategory && (
            <div className="flex flex-col space-y-6 w-3/4 mt-24 ml-40">
              {categories.map((cat) => (
                <div
                  key={cat.tag}
                  className="flex items-center space-x-4 bg-black p-4 rounded-md cursor-pointer hover:bg-gray-700"
                  onClick={() => setSelectedCategory(cat.tag)}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-lg font-semibold">{cat.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* Main Content Area */}
          <div className="w-2/4 mx-4 bg-gray-900 p-4 h-full mt-[6%] ml-[27%]">
            {selectedCategory ? (
              viewType === "posts" ? (
                filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <FeedCard
                      key={item.id}
                      item={item}
                      currentUserEmail={currentUserEmail}
                      dropdownOpenId={dropdownOpenId}
                      setDropdownOpenId={setDropdownOpenId}
                      toggleSave={toggleSave}
                      savedPostIds={savedPostIds}
                      setOpenBlog={setOpenBlog}
                      customStyle="w-[550px] min-h-[400px]"
                    />
                  ))
                ) : (
                  <p className="text-center text-gray-400">No posts found for this category.</p>
                )
              ) : (
                <div className="mt-8 space-y-4">
                  {exploreGroups.length > 0 ? (
                    exploreGroups.map(group => (
                      <div
                        key={group.id}
                        className="bg-gradient-to-r from-[rgba(1,192,211,0.2)] to-[rgba(32,89,182,0.2)] p-4 rounded-xl flex items-center space-x-4"
                      >
                        <img
                          src={group.coverPhotoUrl || defaultGroup}
                          alt="Group Cover"
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="text-white font-semibold">{group.name}</div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-400">No groups found in this category.</p>
                  )}
                </div>
              )
            ) : (
              <p className="text-center text-gray-400">Please select a category to view items.</p>
            )}

            {openBlog && <ViewBlog blog={openBlog} onClose={() => setOpenBlog(null)} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Suggest;
