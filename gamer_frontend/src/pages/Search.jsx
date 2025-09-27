import React, { useEffect, useState } from "react";
import axios from 'axios';
import { useLocation, useNavigate } from "react-router-dom";
import FeedCard from "../components/FeedCard";
import ViewBlog from "../components/ViewBlog";
import defaultProfile from "../images/defaultProfile.png";
import defaultGroup from "../images/default.png";
import viewMore from "../images/viewMore.png";

const Search = () => {
  const location = useLocation(); // Access URL query
  const navigate = useNavigate(); // Navigation for profiles/groups
  const query = new URLSearchParams(location.search).get("query") || ""; // Search term

  // State management
  const [results, setResults] = useState(null); // Search results object
  const [loading, setLoading] = useState(false); // Loading state
  const [activeTab, setActiveTab] = useState(null); // Current active tab

  const [visibleProfilesCount, setVisibleProfilesCount] = useState(9); // Pagination for profiles
  const [visibleGroupsCount, setVisibleGroupsCount] = useState(8); // Pagination for groups
  const [dropdownOpenId, setDropdownOpenId] = useState(null); // Dropdown menu for posts/blogs
  const [openBlog, setOpenBlog] = useState(null); // Modal for viewing a blog
  const [following, setFollowing] = useState([]); // Followed users
  const [savedPostIds, setSavedPostIds] = useState([]); // Saved post IDs
  const [savedBlogIds, setSavedBlogIds] = useState([]); // Saved blog IDs
  const [joinedGroupIds, setJoinedGroupIds] = useState([]); // Groups joined by current user

  const currentUserEmail = localStorage.getItem("email") || null;
  const token = localStorage.getItem("token");

  // Fetch search results whenever query changes
  useEffect(() => {
    if (!query) {
      setResults(null);
      setActiveTab(null);
      return;
    }

    setLoading(true);

    fetch(`http://localhost:8080/api/search?query=${encodeURIComponent(query)}`, {
      headers: { "Authorization": `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error("Search failed");
        return res.json();
      })
      .then(data => {
        setResults(data);

        // Determine initial active tab based on available results
        if (data.users && data.users.length > 0) setActiveTab("gamers");
        else if (data.posts && data.posts.length > 0) setActiveTab("posts");
        else if (data.blogs && data.blogs.length > 0) setActiveTab("blogs");
        else if (data.groups && data.groups.length > 0) setActiveTab("groups");
        else setActiveTab(null);
      })
      .catch(err => {
        console.error("Search error:", err);
        setResults({});
        setActiveTab(null);
      })
      .finally(() => setLoading(false));

  }, [query, token]);

  // Tabs metadata
  const tabMeta = [
    { key: "gamers", label: "Gamers", items: results?.users || [] },
    { key: "posts", label: "Posts", items: results?.posts || [] },
    { key: "blogs", label: "Blogs", items: results?.blogs || [] },
    { key: "groups", label: "Groups", items: results?.groups || [] },
  ].filter((t) => t.items && t.items.length > 0);

  // Navigation helpers
  const goToProfile = (email) => navigate(`/profile/view/${encodeURIComponent(email)}`);
  const goToGroup = (id) => navigate(`/group/view/${id}`);

  // Follow/unfollow users
  const handleToggleFollow = async (profileEmail, e) => {
    e.stopPropagation();
    if (!token) {
      alert('Please log in to follow users.');
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:8080/api/follow/toggle-follow/${profileEmail}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.status === 'FOLLOWED') {
        setFollowing(prev => (prev.includes(profileEmail) ? prev : [...prev, profileEmail]));
      } else if (res.data.status === 'UNFOLLOWED') {
        setFollowing(prev => prev.filter(email => email !== profileEmail));
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };

  // -------------------------------
  // Prepare feed items for posts/blogs tabs
  // -------------------------------
  const feedItemsForTab = (key) => {
    if (key === "posts") return (results?.posts || []).map(p => ({ ...p, type: "post" }));
    if (key === "blogs") return (results?.blogs || []).map(b => ({ ...b, type: "blog" }));
    return [];
  };

  // Fetch saved posts, blogs and joined groups
  useEffect(() => {
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
        const res = await axios.get(`http://localhost:8080/api/groups/user/${currentUserEmail}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setJoinedGroupIds(res.data.map(g => g.id));
      } catch (err) {
        console.error("Error loading joined groups", err);
      }
    };

    fetchSavedItems();
    fetchJoinedGroups();
  }, [currentUserEmail, token]);

  // Save/unsave post or blog
  const toggleSavePost = async (postId) => {
    if (!token) {
      if (window.confirm("You need to log in to save posts. Go to login page?")) navigate("/login");
      return;
    }

    try {
      const res = await axios.post(`http://localhost:8080/api/saved-posts/toggle/${postId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data) setSavedPostIds(prev => [...prev, postId]);
      else setSavedPostIds(prev => prev.filter(id => id !== postId));
    } catch (err) { console.error("Error toggling save post:", err); }
  };

  const toggleSaveBlog = async (blogId) => {
    if (!token) {
      const result = await window.confirm("You need to log in to save blogs. Go to login page?");
      if (result) navigate("/login");
      return;
    }

    try {
      const res = await axios.post(`http://localhost:8080/api/saved-blogs/toggle/${blogId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data) setSavedBlogIds(prev => [...prev, blogId]);
      else setSavedBlogIds(prev => prev.filter(id => id !== blogId));
    } catch (err) { console.error("Error toggling save blog:", err); }
  };

  // Join/leave group
  const handleJoinGroup = async (groupId) => {
    try {
      await axios.post(`http://localhost:8080/api/groups/${groupId}/join?email=${currentUserEmail}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setJoinedGroupIds(prev => [...prev, groupId]);
    } catch (err) { console.error("Join failed:", err); }
  };

  const handleLeaveGroup = async (groupId) => {
    const confirmed = await window.confirm("Leave this group?");
    if (!confirmed) return;
    try {
      await axios.post(`http://localhost:8080/api/groups/${groupId}/leave?email=${currentUserEmail}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setJoinedGroupIds(prev => prev.filter(id => id !== groupId));
    } catch (err) { console.error("Leave failed:", err); }
  };

  // Scroll to top when component mounts
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed inset-0 bg-gray-900 z-[-1]" />
      <div className="container mx-auto flex mt-4 px-4 space-x-4">
        <div className="flex-1">
          {loading ? (
            <div className="text-center py-20 text-gray-400 mt-6">Searching...</div>
          ) : !results || tabMeta.length === 0 ? (
            <div className="text-center py-20 text-gray-400 mt-6">No results found.</div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex items-center space-x-10 border-b border-gray-700 sticky top-[80px] bg-gray-900 z-20 pt-8 pb-6">
                {tabMeta.map(t => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className={`pb-2 px-3 rounded-md text-sm font-medium transition ${activeTab === t.key ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-300 hover:text-white"}`}
                  >
                    {t.label} <span className="text-gray-400">({t.items.length})</span>
                  </button>
                ))}
              </div>

              {/* Content area */}
              <div className="space-y-6">
                {/* Gamers tab */}
                {activeTab === "gamers" && (
                  <div className="mt-24 mb-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {(results.users || []).slice(0, visibleProfilesCount).map(u => (
                        <div key={u.email} onClick={() => goToProfile(u.email)} className="cursor-pointer p-[2px] rounded-xl bg-gradient-to-b from-[#01C0D3] to-[#2059B6]">
                          <div className="bg-gray-800 p-4 rounded-xl shadow-md flex flex-col items-center h-full">
                            <img src={u.imageUrl || defaultProfile} alt={u.gamerName} className="w-24 h-24 rounded-full object-cover mt-3 mb-3" />
                            <h3 className="text-lg font-semibold">{u.gamerName}</h3>
                            <button
                              onClick={(e) => handleToggleFollow(u.email, e)}
                              className={`m-4 w-28 py-1 rounded-lg text-sm font-medium text-white transition duration-150 ${following.includes(u.email) ? 'bg-gradient-to-b from-[#407CDE] to-[#2059B6]' : 'bg-gradient-to-b from-[#2059B6] to-[#407CDE]'} hover:brightness-110`}
                            >
                              {following.includes(u.email) ? 'Unfollow' : 'Follow'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* View More button */}
                    {(results.users || []).length > visibleProfilesCount && (
                      <div className="text-center mt-10 mb-10">
                        <button onClick={() => setVisibleProfilesCount(s => s + 9)} className="mx-auto flex items-center gap-2 text-gray-300 hover:scale-105 transition duration-300">
                          View More
                          <img src={viewMore} alt="more" className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Posts & Blogs */}
                {["posts", "blogs"].includes(activeTab) && (
                  <div className="w-full max-w-xl p-4 h-full mt-20 mb-10 mx-auto">
                    {feedItemsForTab(activeTab).length === 0 ? (
                      <p className="text-gray-400">No {activeTab} found.</p>
                    ) : (
                      feedItemsForTab(activeTab).map(item => (
                        <FeedCard
                          key={item.id}
                          item={item}
                          currentUserEmail={currentUserEmail}
                          dropdownOpenId={dropdownOpenId}
                          setDropdownOpenId={setDropdownOpenId}
                          toggleSave={item.type === "post" ? toggleSavePost : toggleSaveBlog}
                          savedPostIds={item.type === "post" ? savedPostIds : savedBlogIds}
                          setOpenBlog={item.type === "blog" ? setOpenBlog : undefined}
                        />
                      ))
                    )}
                    {openBlog && <ViewBlog blog={openBlog} onClose={() => setOpenBlog(null)} />}
                  </div>
                )}

                {/* Groups tab */}
                {activeTab === "groups" && (
                  <div className="w-full max-w-4xl mx-auto mt-24">
                    {(results.groups || []).slice(0, visibleGroupsCount).map(group => {
                      const isJoined = joinedGroupIds.includes(group.id);
                      return (
                        <div
                          key={group.id}
                          onClick={() => goToGroup(group.id)}
                          className="bg-gradient-to-r from-[#01C0D3B3] to-[#2059B6B3] p-4 rounded-xl flex items-center justify-between space-x-4 cursor-pointer hover:brightness-110 transition mb-4"
                        >
                          <div className="flex items-center space-x-4">
                            <img src={group.coverPhotoUrl || defaultGroup} alt={group.name} className="w-12 h-12 rounded-full object-cover" />
                            <div className="font-semibold text-white">{group.name}</div>
                          </div>
                          <button
                            onClick={e => {
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

                    {/* View More button */}
                    {(results.groups || []).length > visibleGroupsCount && (
                      <div className="text-center mt-10 mb-20">
                        <button onClick={() => setVisibleGroupsCount(s => s + 8)} className="mx-auto flex items-center gap-2 text-gray-300 hover:scale-105 transition duration-300">
                          View More
                          <img src={viewMore} alt="more" className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
