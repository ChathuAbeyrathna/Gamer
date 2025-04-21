import React, { useEffect, useState, useRef }  from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import profile1 from '../images/profile1.png';
import profile2 from '../images/profile2.png';
import profile3 from '../images/profile3.png';
import profile4 from '../images/profile4.png';
import profile5 from '../images/profile5.png';
import fillboost from '../images/fillboost.png';
import comment from '../images/comment.png';
import share from '../images/share.png';
import menuIcon from '../images/option.png';
import NavBar from "../components/NavBar";
import Sidebar from "../components/SideBar";
import ViewBlog from "../components/ViewBlog";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";

const Home = () => {
  const [feedItems, setFeedItems] = useState([]);
  const [savedPostIds, setSavedPostIds] = useState([]);
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const [openBlog, setOpenBlog] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

      useEffect(() => {
        fetchFeed();
        fetchSavedPosts();
      }, []);

      useEffect(() => {
        const handleClickOutside = (event) => {
          if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setDropdownOpenId(null);
          }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
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
    
      const formatTime = (createdAt) => {
          return moment(createdAt).fromNow();
      };

      const stripHtmlTags = (html) => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        return doc.body.textContent || "";
      };      
      
  return (
    <div className="bg-gray-900 text-white min-h-screen"> 
      <NavBar/>

      {/* Main Layout */}
      <div className="container mx-auto flex mt-4">
        {/* Sidebar */}
        <Sidebar />

        {/* Feed */}
        <div className="w-2/4 mx-4 bg-gray-900 p-4 h-full mt-[6%] ml-[25%]">
          {feedItems.map((item) => (
            <div key={item.id} 
                className="bg-gray-800 p-4 rounded mb-4 relative"
            >
              <div className="absolute top-4 right-4">
                <button onClick={() => setDropdownOpenId(dropdownOpenId === item.id ? null : item.id)}>
                  <img src={menuIcon} alt="menu" className="h-5" />
                </button>
                {dropdownOpenId === item.id && (
                  <div
                    ref={dropdownRef}
                    className="absolute right-0 mt-2 w-40 bg-gradient-to-b from-[#222] to-[#444] text-white rounded shadow z-10"
                  >
                    <button
                      className="flex items-center w-full text-left px-4 py-2 hover:bg-gray-600"
                      onClick={() => toggleSave(item.id)}
                    >
                      {savedPostIds.includes(item.id) ? (
                        <FaBookmark className="text-white mr-2" />
                      ) : (
                        <FaRegBookmark className="text-white mr-2" />
                      )}
                      Save {item.type === "post" ? "Post" : "Blog"}
                    </button>
                    <button className="flex items-center w-full text-left px-4 py-2 hover:bg-gray-600">
                      <span>Report {item.type === "post" ? "Post" : "Blog"}</span>
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
          ))}

          {openBlog && (
            <ViewBlog blog={openBlog} onClose={() => setOpenBlog(null)} />
          )}

        </div>     

        {/* Right Sidebar */}
        <div className="w-1/4 bg-black-800 p-4 hidden lg:block fixed right-0 h-full mt-[6%]">
        
          <h2 className="font-semibold mb-2">Power Up Your Stream:</h2>
          <ul>
            <div className="p-[2px] bg-gradient-to-r from-[#01C0D3] to-[#2059B6] rounded mr-10 mb-5 mt-6">
              <li className="flex items-center justify-between p-2 bg-gray-800 hover:bg-gray-700 rounded h-14">
                <div className="flex items-center space-x-3">
                  <img src={profile1} alt="Profile" className="w-10 h-10 rounded-full" />
                  <span>Anju Silva</span>
                </div>
                <button className="bg-gradient-to-b from-[#2059B6] to-[#407CDE] text-white text-xs px-2 py-1 rounded">Add Gamer</button>
              </li>
            </div>

            <div className="p-[2px] bg-gradient-to-r from-[#01C0D3] to-[#2059B6] rounded mr-10 mb-5 mt-6">
              <li className="flex items-center justify-between p-2 bg-gray-800 hover:bg-gray-700 rounded h-14">
                <div className="flex items-center space-x-3">
                  <img src={profile2} alt="Profile" className="w-10 h-10 rounded-full" />
                  <span>Leo Max</span>
                </div>
                <button className="bg-gradient-to-b from-[#2059B6] to-[#407CDE] text-white text-xs px-2 py-1 rounded">Add Gamer</button>
              </li>
            </div>

            <div className="p-[2px] bg-gradient-to-r from-[#01C0D3] to-[#2059B6] rounded mr-10 mb-5 mt-6">
              <li className="flex items-center justify-between p-2 bg-gray-800 hover:bg-gray-700 rounded h-14">
                <div className="flex items-center space-x-3">
                  <img src={profile3} alt="Profile" className="w-10 h-10 rounded-full" />
                  <span>Ava Mae</span>
                </div>
                <button className="bg-gradient-to-b from-[#2059B6] to-[#407CDE] text-white text-xs px-2 py-1 rounded">Add Gamer</button>
              </li>
            </div>

            <div className="p-[2px] bg-gradient-to-r from-[#01C0D3] to-[#2059B6] rounded mr-10 mb-5 mt-6">
              <li className="flex items-center justify-between p-2 bg-gray-800 hover:bg-gray-700 rounded h-14">
                <div className="flex items-center space-x-3">
                  <img src={profile4} alt="Profile" className="w-10 h-10 rounded-full" />
                  <span>Ben Kai</span>
                </div>
                <button className="bg-gradient-to-b from-[#2059B6] to-[#407CDE] text-white text-xs px-2 py-1 rounded">Add Gamer</button>
              </li>
            </div>

            <div className="p-[2px] bg-gradient-to-r from-[#01C0D3] to-[#2059B6] rounded mr-10 mb-5 mt-6">
              <li className="flex items-center justify-between p-2 bg-gray-800 hover:bg-gray-700 rounded h-14">
                <div className="flex items-center space-x-3">
                  <img src={profile5} alt="Profile" className="w-10 h-10 rounded-full" />
                  <span>Jack Lee</span>
                </div>
                <button className="bg-gradient-to-b from-[#2059B6] to-[#407CDE] text-white text-xs px-2 py-1 rounded">Add Gamer</button>
              </li>
            </div>
          </ul>
          <button className="mt-2 text-white-500">View All →</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
