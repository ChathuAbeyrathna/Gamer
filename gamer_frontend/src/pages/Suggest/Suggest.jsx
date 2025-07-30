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
    const fetchFeed = async () => {
      setLoading(true);
      try {
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
      } catch (error) {
        console.error("Error fetching feed:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchGroups = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/groups", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const otherGroups = res.data.filter(g => g.ownerEmail !== currentUserEmail);
        setExploreGroups(otherGroups);
      } catch (err) {
        console.error("Error loading groups:", err);
      }
    };

    const fetchSavedPosts = async () => {
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

    const fetchJoinedGroups = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/groups/user/${currentUserEmail}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const joinedIds = res.data.map(g => g.id);
        setJoinedGroupIds(joinedIds);
      } catch (err) {
        console.error("Error loading joined groups", err);
      }
    };

    fetchFeed();
    fetchGroups();
    fetchSavedPosts();
    fetchJoinedGroups();
    window.scrollTo(0, 0);
  }, [currentUserEmail, token]);

  const toggleSave = async (postId) => {
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

  const handleJoinGroup = async (groupId) => {
    try {
      await axios.post(`http://localhost:8080/api/groups/${groupId}/join?email=${currentUserEmail}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
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

  const filteredGroups = selectedCategory
    ? exploreGroups.filter(group => {
      const groupTags = group.tags?.map(tag => tag.toLowerCase()) || [];
      if (selectedCategory === "others") {
        return !groupTags.some(tag =>
          knownTags.some(known => tag.includes(known))
        );
      } else {
        return groupTags.some(tag => tag.includes(selectedCategory.toLowerCase()));
      }
    })
    : [];

  useEffect(() => {
    if (!selectedCategory) {
      window.scrollTo(0, 0);
    }
  }, [selectedCategory]);

  if (filteredItems.length > 0) {
    window.scrollTo(0, 0);
  }

  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed top-0 left-0 w-full h-full bg-gray-900 z-[-1]"></div>
      <NavBar />

      <div className="container mx-auto flex mt-4 space-x-4 px-4">
        <div className="w-1/4">
          <Sidebar />
        </div>

        <div className="w-full flex flex-col">
          {/* Top header */}
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
                  <FaArrowLeft className="text-2xl font-light mr-1" />
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

          {/* Category selection */}
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

          {/* Main display area */}
          <div className="w-2/4 mx-4 bg-gray-900 p-4 h-full mt-[6%] ml-[27%]">
            {loading ? (
              <p className="text-center text-gray-400">Loading...</p>
            ) : selectedCategory ? (
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
                <div className="mt-8 mb-8 space-y-4">
                  {filteredGroups.length > 0 ? (
                    <>
                      {[...filteredGroups].reverse().slice(0, visibleCount).map(group => {
                        const isJoined = joinedGroupIds.includes(group.id);
                        return (
                          <div
                            key={group.id}
                            onClick={() => navigate(`/group/view/${group.id}`)}
                            className="w-[700px] bg-gradient-to-r from-[#01C0D3B3] to-[#2059B6B3] p-4 rounded-xl flex items-center justify-between space-x-4 cursor-pointer -ml-24 -mt-8 hover:brightness-110 transition"
                          >
                            <div className="flex items-center space-x-4">
                              <img
                                src={group.coverPhotoUrl || defaultGroup}
                                alt="Group Cover"
                                className="w-12 h-12 rounded-full object-cover"
                              />
                              <div className="font-semibold text-white">
                                {group.name}
                              </div>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                isJoined ? handleLeaveGroup(group.id) : handleJoinGroup(group.id);
                              }}
                              className="px-4 py-1 rounded-md text-sm font-medium border border-white text-white"
                            >
                              {isJoined ? "Leave Group" : "Join Group"}
                            </button>
                          </div>
                        );
                      })}

                      {filteredGroups.length > visibleCount && (
                        <div className="text-center mt-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setVisibleCount(prev => prev + 8);
                            }}
                            className="mx-auto mt-8 flex items-center gap-2 text-gray-300 hover:scale-105 transition duration-300"
                          >
                            View More
                            <img src={viewMore} alt="Mario Icon" className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </>
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
