import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import NavBar from "../../components/NavBar";
import Sidebar from "../../components/SideBar";
import ViewBlog from "../../components/ViewBlog";
import menuIcon from '../../images/option.png';
import fillboost from '../../images/fillboost.png';
import comment from '../../images/comment.png';
import share from '../../images/share.png';
import { FaBookmark, FaRegBookmark, FaArrowLeft } from "react-icons/fa";
import defaultGroup from '../../images/default.png'; // imported fallback image

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
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeed();
    fetchSavedPosts();
    fetchGroups();
  }, []);

  const fetchFeed = async () => {
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
  };

  const fetchSavedPosts = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get("http://localhost:8080/api/saved-posts", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedPostIds(res.data.map(sp => sp.postId));
    } catch (error) {
      console.error("Error fetching saved posts:", error);
    }
  };

  const fetchGroups = async () => {
    const userEmail = localStorage.getItem("email");
    try {
      const res = await axios.get("http://localhost:8080/api/groups");
      const otherGroups = res.data.filter(g => g.ownerEmail !== userEmail);
      setExploreGroups(otherGroups);
    } catch (err) {
      console.error("Error loading groups:", err);
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

  const formatTime = (createdAt) => moment(createdAt).fromNow();

  const stripHtmlTags = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
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

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <NavBar />

      <div className="container mx-auto flex mt-4 space-x-4 px-4">
        <div className="w-1/4">
          <Sidebar />
        </div>

        <div className="w-full flex flex-col m-24">
          {/* Category Title with Back Arrow */}
          <div className="text-3xl ml-40 self-start flex items-center space-x-3">
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

          {/* Category List */}
          {!selectedCategory && (
            <div className="flex flex-col space-y-6 w-3/4 mt-10 ml-40">
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

          {/* Posts/Groups Tabs */}
          {selectedCategory && (
            <div className="flex ml-[42%] mt-8 mb-2 space-x-8 text-lg font-semibold">
              <button
                onClick={() => setViewType("posts")}
                className={`px-4 py-1 border-b-2 ${
                  viewType === "posts"
                    ? "text-[#01C0D3] border-[#01C0D3]"
                    : "text-gray-400 border-transparent hover:text-[#01C0D3] hover:border-[#01C0D3]"
                }`}
              >
                Posts
              </button>
              <button
                onClick={() => setViewType("groups")}
                className={`px-4 py-1 border-b-2 ${
                  viewType === "groups"
                    ? "text-[#01C0D3] border-[#01C0D3]"
                    : "text-gray-400 border-transparent hover:text-[#01C0D3] hover:border-[#01C0D3]"
                }`}
              >
                Groups
              </button>
            </div>
          )}

          {/* Main Content Area */}
          <div className="w-2/4 mx-4 bg-gray-900 p-4 h-full mt-[2%] ml-[20%]">
            {selectedCategory ? (
              viewType === "posts" ? (
                filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <div key={item.id} className="bg-gray-800 p-4 rounded mb-6 relative w-[600px] min-h-[400px]">
                      {/* Post/Blog Display (same as before) */}
                      <div className="absolute top-4 right-4">
                        <button onClick={() => setDropdownOpenId(dropdownOpenId === item.id ? null : item.id)}>
                          <img src={menuIcon} alt="menu" className="h-5" />
                        </button>
                        {dropdownOpenId === item.id && (
                          <div ref={dropdownRef} className="absolute right-0 mt-2 w-40 bg-gradient-to-b from-[#222] to-[#444] text-white rounded shadow z-10">
                            <button className="flex items-center w-full text-left px-4 py-2 hover:bg-gray-600" onClick={() => toggleSave(item.id)}>
                              {savedPostIds.includes(item.id) ? <FaBookmark className="text-white mr-2" /> : <FaRegBookmark className="text-white mr-2" />}
                              Save {item.type === "post" ? "Post" : "Blog"}
                            </button>
                            <button className="flex items-center w-full text-left px-4 py-2 hover:bg-gray-600">
                              <div className="bg-gray-100 rounded-full w-4 h-4 flex items-center justify-center text-black mr-2">!</div>
                              <span>Report Post</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-4">
                        <img src={item.userImage} alt="User Avatar" className="h-10 w-10 rounded-full" />
                        <div>
                          <h2 className="font-semibold">{item.userName}</h2>
                          <p className="text-sm text-gray-400">{formatTime(item.createdAt)}</p>
                        </div>
                      </div>

                      <div
                        onClick={() => item.type === "blog" && setOpenBlog(item)}
                        className={`${item.type === "blog" ? "bg-gray-700 rounded-md p-2 mt-4 mb-4 cursor-pointer" : ""}`}
                      >
                        <p className="mt-2">{item.title}</p>
                        <p className="text-sm text-blue-400">
                          #{Array.isArray(item.tags) ? item.tags.join(", ") : ""}
                        </p>
                        {item.imageUrl && (/\.(mp4|webm|ogg)(\?.*)?$/.test(item.imageUrl) ? (
                          <video controls className="w-full h-auto rounded my-2 mb-4">
                            <source src={item.imageUrl} />
                          </video>
                        ) : (
                          <img src={item.imageUrl} alt="Media" className={`object-cover rounded my-2 mb-4 ${item.type === "blog" ? "w-full h-40" : "w-full h-auto"}`} />
                        ))}
                        {item.type === "blog" && (
                          <p className="mt-2 text-sm text-gray-300">
                            {stripHtmlTags(item.content).length > 200
                              ? stripHtmlTags(item.content).substring(0, 200) + "...see more"
                              : stripHtmlTags(item.content)}
                          </p>
                        )}
                      </div>

                      <div className="flex justify-between text-white font-thin text-sm px-2">
                        <span>24 Boosts</span>
                        <span>5 Comments</span>
                      </div>
                      <hr className="border-t border-white opacity-30 my-2" />
                      <div className="flex justify-between text-white font-thin">
                        <button className="flex items-center space-x-1">
                          <img src={fillboost} alt="boost" className="w-7 h-7" />
                          <span>Boost</span>
                        </button>
                        <button className="flex items-center space-x-1">
                          <img src={comment} alt="comment" className="w-6 h-6" />
                          <span>Comment</span>
                        </button>
                        <button className="flex items-center space-x-1">
                          <img src={share} alt="share" className="w-6 h-6" />
                          <span>Share</span>
                        </button>
                      </div>
                    </div>
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
