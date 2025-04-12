import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import boost from '../images/boost.png';
import fillboost from '../images/fillboost.png';
import comment from '../images/comment.png';
import share from '../images/share.png';
import NavBar from "../components/NavBar";
import Sidebar from "../components/SideBar";
import user1 from '../images/user1.png';
import post3 from '../images/post3.png';
import post4 from '../images/post4.png';
import squad from '../images/squad.png';
import edit from '../images/edit.png';
import CreatePost from "../components/CreatePost";
import WriteBlog from "../components/WriteBlog";

const Profile = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      // Decode JWT to extract email
      const decoded = JSON.parse(atob(token.split('.')[1]));
      const email = decoded.sub;

      try {
        const res = await fetch(`http://localhost:8080/api/profile/${email}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        } else {
          navigate("/createprof"); // no profile found
        }
      } catch (err) {
        console.error("Error loading profile", err);
        navigate("/createprof");
      }
    };

    fetchProfile();
  }, [navigate]);

  return profile && (
    <div className="bg-gray-900 text-white min-h-screen"> 
      <NavBar/>
      
      <div className="container mx-auto flex mt-4 space-x-4 px-4">
        {/* Sidebar */}
        <div className="w-1/4">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="w-full flex flex-col items-center mt-20">
          {/* Profile Section */}
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
                <p className="text-gray-400 mt-3">{profile.role && profile.role.join(" | ")}</p>
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
                  onClick={() => setIsModalOpen(true)}
                >
                  Create a post
                </button>
                <button
                  className="bg-gray-900 px-4 py-2 rounded-full border-2 border-white"
                  onClick={() => setIsBlogModalOpen(true)}
                >
                  Write a blog
                </button>
              </div>
            </div>
          </div>

          {/* Feed Section */}
          <div className="w-full max-w-2xl bg-gray-900 p-4">
            {/* Post 1 */}
            <div className="bg-gray-800 p-4 rounded mb-4">
              <div className="flex items-center space-x-4">
                <img src={user1} alt="User Avatar" className="h-10 w-10 rounded-full" />
                <div>
                  <h2 className="font-semibold">Megna Dewmini</h2>
                  <p className="text-sm text-gray-400">Just Now</p>
                </div>
              </div>
              <p className="mt-2">It's not only a game. It is an art.</p>
              <img src={post3} alt="Post" className="w-full h-auto object-cover rounded my-2 mb-10" />
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

            {/* Post 2 */}
            <div className="bg-gray-800 p-4 rounded mb-4">
              <div className="flex items-center space-x-4">
                <img src={user1} alt="User Avatar" className="h-10 w-10 rounded-full" />
                <div>
                  <h2 className="font-semibold">Megna Dewmini</h2>
                  <p className="text-sm text-gray-400">1 hour ago</p>
                </div>
              </div>
              <p className="mt-2">Hey Gamers, This is my new work.</p>
              <img src={post4} alt="Post" className="w-full h-auto object-cover rounded my-2 mb-10" />
              <div className="flex justify-between text-white font-thin text-sm px-2">
                <span>24 Boosts</span>
                <span>5 Comments</span>
              </div>
              <hr className="border-t border-white opacity-30 my-2" />
              <div className="flex justify-between text-white font-thin">
                <button className="flex items-center space-x-1">
                  <img src={fillboost} alt="fillboost" className="w-7 h-7" />
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
          </div>
        </div>
      </div>

      {/* Dark Blur Effect when Modal Opens */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm z-10"></div>
      )}

      {/* CreatePost Popup Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center z-20">
          <CreatePost onClose={() => setIsModalOpen(false)} />
        </div>
      )}

      {/* WriteBlog Popup Modal */}
      {isBlogModalOpen && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm z-10"></div>
          <div className="fixed inset-0 flex justify-center items-center z-20">
            <WriteBlog onClose={() => setIsBlogModalOpen(false)} />
          </div>
        </>
      )}

    </div>
  );
};

export default Profile;
