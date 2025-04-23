import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import moment from "moment";
import boost from '../images/boost.png';
import comment from '../images/comment.png';
import share from '../images/share.png';
import squad from '../images/squad.png';
import edit from '../images/edit.png';
import menuIcon from '../images/option.png';
import NavBar from "../components/NavBar";
import Sidebar from "../components/SideBar";
import ViewBlog from "../components/ViewBlog";
import CreatePost from "../components/CreatePost";
import WriteBlog from "../components/WriteBlog";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editingBlog, setEditingBlog] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [openBlog, setOpenBlog] = useState(null);
  const [menuOpenIndex, setMenuOpenIndex] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // Add this line for refresh control
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const formatTime = (createdAt) => moment(createdAt).fromNow();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        const email = decoded.sub;
    
        const profileRes = await fetch(`http://localhost:8080/api/profile/${email}`);
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
        } else {
          navigate("/createprof");
          return;
        }
    
        const postRes = await fetch(`http://localhost:8080/api/posts/user/${email}`);
        const blogRes = await fetch(`http://localhost:8080/api/blogs/user/${email}`);

        const postData = postRes.ok ? await postRes.json() : [];
        const blogData = blogRes.ok ? await blogRes.json() : [];

        const postsWithType = postData.map(p => ({ ...p, type: "post" }));
        const blogsWithType = blogData.map(b => ({ ...b, type: "blog" }));

        const combined = [...postsWithType, ...blogsWithType]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setUserPosts(combined);
    
      } catch (err) {
        console.error("Error fetching data", err);
        navigate("/createprof");
      }
    };
    
    fetchData();    
  }, [navigate, refreshKey]);

  const handleToggleMenu = (index) => {
    setMenuOpenIndex(menuOpenIndex === index ? null : index);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpenIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleEditItem = (item) => {
    if (item.type === "post") {
      setEditingPost(item);
      setIsModalOpen(true);
    } else if (item.type === "blog") {
      setEditingBlog(item);
      setIsBlogModalOpen(true);
    }
    setMenuOpenIndex(null);
  };  

  const handleDeleteItem = async (itemId, isBlog = false) => {
    const type = isBlog ? "blog" : "post";
    const confirmDelete = window.confirm(`Are you sure you want to delete this ${type}?`);
    if (confirmDelete) {
      const url = isBlog 
        ? `http://localhost:8080/api/blogs/delete/${itemId}`
        : `http://localhost:8080/api/posts/delete/${itemId}`;
  
      const response = await fetch(url, { method: "DELETE" });
      if (response.ok) {
        setUserPosts(prevItems => prevItems.filter(item => item.id !== itemId));
      } else {
        alert(`Failed to delete ${type}`);
      }
    }
    setMenuOpenIndex(null);
  };  

  const stripHtmlTags = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  }; 

  return profile && (
    <div className="bg-gray-900 text-white min-h-screen">
      <NavBar />

      <div className="container mx-auto flex mt-4 space-x-4 px-4">
        <div className="w-1/4">
          <Sidebar />
        </div>

        <div className="w-full flex flex-col items-center mt-20">
          <div className="w-full max-w-6xl bg-gray-900 p-6 rounded-lg flex items-center mb-6">
            <img
              src={profile.imageUrl}
              alt="Profile"
              className="w-52 h-52 rounded-full mr-12 ml-10"
            />
            <div className="flex-1 text-left relative">
              <div>
                <h1 className="text-2xl font-semibold">{profile.gamerName}</h1>
                <p className="text-gray-400 mt-4">{profile.bio}</p>
                <p className="text-gray-400 mt-3">{profile.role?.join(" | ")}</p>
              </div>
              <div className="absolute top-0 right-0">
                <Link to="/editprof">
                  <button className="bg-gray-700 px-4 py-2 rounded-full flex items-center space-x-2">
                    <img src={edit} alt="Edit" className="w-5 h-5" />
                    <span>Edit Profile</span>
                  </button>
                </Link>
              </div>
              <div className="absolute bottom-0 right-0 flex items-center space-x-2 text-gray-300">
                <img src={squad} alt="Squad Icon" className="w-6 h-6" />
                <span>105 Squad</span>
              </div>
              <div className="flex space-x-4 mt-8">
                <button
                  className="bg-gray-900 px-4 py-2 rounded-full border-2 border-white"
                  onClick={() => {
                    setIsModalOpen(true);
                    setEditingPost(null);
                  }}
                >
                  Create a post
                </button>
                <button
                  className="bg-gray-900 px-4 py-2 rounded-full border-2 border-white"
                  onClick={() => {
                    setIsBlogModalOpen(true);
                    setEditingBlog(null);
                  }}
                >
                  Write a blog
                </button>
              </div>
            </div>
          </div>

          {/* Feed Section */}
          <div className="w-full max-w-2xl bg-gray-900 p-4">
            {userPosts.length === 0 ? (
              <p className="text-center text-gray-400">No posts yet.</p>
            ) : (
              userPosts.map((item, index) => (
                <div key={item.id} className="bg-gray-800 p-4 rounded mb-4 relative">
                  {/* Post Header */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <img src={profile.imageUrl} alt="User" className="h-10 w-10 rounded-full" />
                      <div>
                        <h2 className="font-semibold">{profile.gamerName}</h2>
                        <p className="text-sm text-gray-400">{formatTime(item.createdAt)}</p>
                      </div>
                    </div>

                    {/* Three-dot menu */}
                    <div className="relative">
                      <button onClick={() => handleToggleMenu(index)}>
                        <img src={menuIcon} alt="menu" className="h-5" />
                      </button>
                      {menuOpenIndex === index && (
                        <div ref={menuRef} className="absolute right-0 mt-2 w-40 bg-gradient-to-b from-[#222] to-[#444] text-white rounded shadow z-10">
                          <button className="w-full text-left px-4 py-2 hover:bg-gray-600" onClick={() => handleEditItem(item)}>
                            Edit
                          </button>
                          <button className="w-full text-left px-4 py-2 hover:bg-gray-600" onClick={() => handleDeleteItem(item.id, item.type === "blog")}>
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    onClick={() => item.type === "blog" && setOpenBlog(item)}
                    className={`${item.type === "blog" ? "bg-gray-700 rounded-md p-2 mt-4 mb-4 cursor-pointer" : ""}`}
                  >
                    <p className={`mt-2 ${item.type === "blog" ? "text-bold" : "text-bold"
                          }`}>{item.title}</p>
                    <p className="text-sm text-blue-400">
                      #{Array.isArray(item.tags) ? item.tags.join(", ") : ""}
                    </p>

                    {item.imageUrl &&
                      (/\.(mp4|webm|ogg)(\?.*)?$/.test(item.imageUrl) ? (
                        <video controls className="w-full h-auto rounded my-2 mb-4">
                          <source src={item.imageUrl} />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <img
                          src={item.imageUrl}
                          alt="Media"
                          className={`object-cover rounded my-2 mb-4 ${
                            item.type === "blog" ? "w-full h-40" : "w-full h-auto"
                          }`}
                        />
                      ))}

                    {item.type === "blog" && (
                      <p className="mt-2 text-sm text-gray-300">
                        {item.content &&
                          (stripHtmlTags(item.content).length > 200
                            ? stripHtmlTags(item.content).substring(0, 200) + "...see more"
                            : stripHtmlTags(item.content))}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <hr className="border-t border-white opacity-30 my-2" />
                  <div className="flex justify-between text-white font-thin">
                    <button className="flex items-center space-x-1">
                      <img src={boost} alt="boost" className="w-7 h-7" />
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
            )}

            {openBlog && (
              <ViewBlog blog={openBlog} onClose={() => setOpenBlog(null)} />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center z-20">
          <CreatePost
            onClose={() => {
              setIsModalOpen(false);
              setEditingPost(null);
            }}
            editingPost={editingPost}
            onPostCreated={(newPost) => {
              if (editingPost) {
                setUserPosts((prev) =>
                  prev.map((p) => (p.id === newPost.id ? newPost : p))
                );
              } else {
                setUserPosts((prev) => [newPost, ...prev]);
              }
              setEditingPost(null);
              setIsModalOpen(false);
              setRefreshKey(prev => prev + 1); // Add this line to trigger refresh
            }}
          />
        </div>
      )}

      {isBlogModalOpen && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm z-10"></div>
          <div className="fixed inset-0 flex justify-center items-center z-20">
            <WriteBlog 
              onClose={() => { 
                setIsBlogModalOpen(false);
                setEditingBlog(null);
              }}
              editingBlog={editingBlog}
              onBlogCreated={(newBlog) => {
                if (editingBlog) {
                  setUserPosts((prev) =>
                    prev.map((b) => (b.id === newBlog.id ? newBlog : b))
                  );
                } else {
                  setUserPosts((prev) => [newBlog, ...prev]);
                }
                setEditingBlog(null);
                setIsBlogModalOpen(false);
                setRefreshKey(prev => prev + 1); // Add this line to trigger refresh
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;
