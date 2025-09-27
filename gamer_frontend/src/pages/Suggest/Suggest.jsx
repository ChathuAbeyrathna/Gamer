import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import FeedCard from "../../components/FeedCard";
import NavBar from "../../components/NavBar";
import Sidebar from "../../components/SideBar";
import ViewBlog from "../../components/ViewBlog";
import defaultGroup from '../../images/default.png';
import viewMore from '../../images/viewMore.png';

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
  const [savedBlogIds, setSavedBlogIds] = useState([]);
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const [openBlog, setOpenBlog] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [viewType, setViewType] = useState("posts");
  const [exploreGroups, setExploreGroups] = useState([]);
  const [joinedGroupIds, setJoinedGroupIds] = useState([]);
  const [visibleCount, setVisibleCount] = useState(8);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const currentUserEmail = localStorage.getItem("email");
  const token = localStorage.getItem("token");
  const knownTags = ["action", "adventure", "rpg", "simulation", "sports"];

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchFeed = async () => {
      setLoading(true);
      try {
        const [postsRes, blogsRes] = await Promise.all([
          axios.get("http://localhost:8080/api/posts/all", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:8080/api/blogs/all", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const posts = postsRes.data.map((post) => ({ ...post, type: "post" }));
        const blogs = blogsRes.data.map((blog) => ({ ...blog, type: "blog" }));
        const combinedFeed = [...posts, ...blogs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setFeedItems(combinedFeed);
      } catch (error) {
        console.error("Error fetching feed:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchGroups = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/groups", { headers: { Authorization: `Bearer ${token}` } });
        const otherGroups = res.data.filter(g => g.ownerEmail !== currentUserEmail);
        setExploreGroups(otherGroups);
      } catch (err) {
        console.error("Error loading groups:", err);
      }
    };

    const fetchSavedItems = async () => {
      if (!token) return;
      try {
        const postsRes = await axios.get("http://localhost:8080/api/saved-posts", { headers: { Authorization: `Bearer ${token}` } });
        setSavedPostIds(postsRes.data.map(sp => sp.postId));
        const blogsRes = await axios.get("http://localhost:8080/api/saved-blogs", { headers: { Authorization: `Bearer ${token}` } });
        setSavedBlogIds(blogsRes.data.map(sb => sb.blogId));
      } catch (err) {
        console.error("Error fetching saved items:", err);
      }
    };

    const fetchJoinedGroups = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/groups/user/${currentUserEmail}`, { headers: { Authorization: `Bearer ${token}` } });
        const joinedIds = res.data.map(g => g.id);
        setJoinedGroupIds(joinedIds);
      } catch (err) {
        console.error("Error loading joined groups", err);
      }
    };

    fetchFeed();
    fetchGroups();
    fetchSavedItems();
    fetchJoinedGroups();
  }, [currentUserEmail, token]);


  const toggleSavePost = async (postId) => {
    if (!token) {
      const result = await window.confirm("You need to log in to save posts. Go to login page?");
      if (result) navigate("/login");
      return;
    }
    try {
      const res = await axios.post(`http://localhost:8080/api/saved-posts/toggle/${postId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setSavedPostIds(prev => res.data ? [...prev, postId] : prev.filter(id => id !== postId));
    } catch (err) {
      console.error("Error toggling save post:", err);
    }
  };

  const toggleSaveBlog = async (blogId) => {
    if (!token) {
      const result = await window.confirm("You need to log in to save blogs. Go to login page?");
      if (result) navigate("/login");
      return;
    }
    try {
      const res = await axios.post(`http://localhost:8080/api/saved-blogs/toggle/${blogId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setSavedBlogIds(prev => res.data ? [...prev, blogId] : prev.filter(id => id !== blogId));
    } catch (err) {
      console.error("Error toggling save blog:", err);
    }
  };


  const handleJoinGroup = async (groupId) => {
    try {
      await axios.post(`http://localhost:8080/api/groups/${groupId}/join?email=${currentUserEmail}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setJoinedGroupIds(prev => [...prev, groupId]);
    } catch (err) {
      console.error("Join failed:", err);
    }
  };

  const handleLeaveGroup = async (groupId) => {
    const confirmed = await window.confirm("Leave this group?");
    if (!confirmed) return;

    try {
      await axios.post(
        `http://localhost:8080/api/groups/${groupId}/leave?email=${currentUserEmail}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setJoinedGroupIds(prev => prev.filter(id => id !== groupId));
    } catch (err) {
      console.error("Leave failed:", err);
    }
  };

  const filterContent = (items, category, isGroup) => {
    if (!category) return [];
    return items.filter(item => {
      const itemTags = (isGroup ? item.tags : item.tags)?.map(tag => tag.toLowerCase()) || [];
      if (category === "others") {
        return !itemTags.some(tag => knownTags.some(known => tag.includes(known)));
      }
      return itemTags.some(tag => tag.includes(category.toLowerCase()));
    });
  };

  const filteredItems = filterContent(feedItems, selectedCategory, false);
  const filteredGroups = filterContent(exploreGroups, selectedCategory, true);

  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed top-0 left-0 w-full h-full bg-gray-900 z-[-1]"></div>
      <NavBar />

      <div className="container mx-auto flex mt-4 space-x-4 px-4">
        {/* Sidebar hidden on mobile */}
        <div className="hidden lg:block lg:w-1/4">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <div className="w-full lg:w-3/4 flex flex-col">
          {/* Top header */}
          <div className="sticky top-[80px] bg-gray-900 z-30 pt-6 pb-4">
            <div className="flex items-center space-x-3 text-2xl md:text-3xl">
              {selectedCategory && (
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setViewType("posts");
                  }}
                  className="hover:text-gray-400"
                >
                  <FaArrowLeft className="text-lg md:text-xl font-light" />
                </button>
              )}
              <h2>
                {selectedCategory
                  ? categories.find((cat) => cat.tag === selectedCategory)?.name || "Category"
                  : "Categories"}
              </h2>
            </div>
          </div>

          {/* Tab switcher */}
          {selectedCategory && (
            <div className="sticky top-[140px] bg-gray-900 z-30 py-4 flex justify-center">
              <div className="space-x-8 text-lg font-semibold">
                <button
                  onClick={() => setViewType("posts")}
                  className={`px-4 py-1 border-b-2 ${viewType === "posts"
                    ? "text-[#01C0D3] border-[#01C0D3]"
                    : "text-gray-400 border-transparent hover:text-[#01C0D3]"
                    }`}
                >
                  Posts
                </button>
                <button
                  onClick={() => setViewType("groups")}
                  className={`px-4 py-1 border-b-2 ${viewType === "groups"
                    ? "text-[#01C0D3] border-[#01C0D3]"
                    : "text-gray-400 border-transparent hover:text-[#01C0D3]"
                    }`}
                >
                  Groups
                </button>
              </div>
            </div>
          )}

          {/* Centered Content: Categories or Results */}
          <div className="w-full max-w-3xl mx-auto mt-20 mb-12">
            {loading ? (
              <p className="text-center text-gray-400">Loading...</p>
            ) : selectedCategory ? (
              viewType === "posts" ? (
                <div className="space-y-6">
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <div className="max-w-xl mx-auto">
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
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-400 py-10">No posts found for this category.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4 pb-8">
                  {filteredGroups.length > 0 ? (
                    <>
                      {filteredGroups.slice(0, visibleCount).map(group => (
                        <div
                          key={group.id}
                          onClick={() => navigate(`/group/view/${group.id}`)}
                          className="w-full bg-gradient-to-r from-[#01C0D3]/70 to-[#2059B6]/70 p-4 rounded-xl flex items-center justify-between space-x-4 cursor-pointer hover:brightness-110 transition"
                        >
                          <div className="flex items-center space-x-4 flex-1 min-w-0">
                            <img src={group.coverPhotoUrl || defaultGroup} alt="Group Cover" className="w-12 h-12 rounded-full object-cover" />
                            <div className="font-semibold text-white truncate">{group.name}</div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              joinedGroupIds.includes(group.id) ? handleLeaveGroup(group.id) : handleJoinGroup(group.id);
                            }}
                            className="px-4 py-1.5 rounded-md text-sm font-medium border border-white text-white whitespace-nowrap"
                          >
                            {joinedGroupIds.includes(group.id) ? "Leave" : "Join"}
                          </button>
                        </div>
                      ))}
                      {filteredGroups.length > visibleCount && (
                        <div className="text-center mt-4">
                          <button
                            onClick={() => setVisibleCount(prev => prev + 8)}
                            className="mx-auto mt-8 flex items-center gap-2 text-gray-300 hover:scale-105 transition duration-300"
                          >
                            View More
                            <img src={viewMore} alt="View More" className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-center text-gray-400 py-10">No groups found in this category.</p>
                  )}
                </div>
              )
            ) : (
              <div className="flex flex-col space-y-4">
                {categories.map((cat) => (
                  <div
                    key={cat.tag}
                    className="flex items-center space-x-4 bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                    onClick={() => setSelectedCategory(cat.tag)}
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-lg font-semibold">{cat.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {openBlog && <ViewBlog blog={openBlog} onClose={() => setOpenBlog(null)} />}
    </div>
  );
};

export default Suggest;