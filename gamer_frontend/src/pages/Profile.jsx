import React from "react";
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

const Profile = () => {
  return (
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
                src={user1} 
                alt="Profile"
                className="w-52 h-52 rounded-full mr-12 ml-10"
            />
            <div className="flex-1 text-left relative">
            <div>
                <h1 className="text-2xl font-semibold m">Megna Dewmini</h1>
                <p className="text-gray-400 mt-4">Gaming Beyond Limits 🎮✨</p>
                <p className="text-gray-400 mt-3 ">Player | Developer | Blogger</p>
            </div>
            <div className="absolute top-0 right-0">
                <button className="bg-gray-700 px-4 py-2 rounded-full flex items-center space-x-2">
                    <img src={edit} alt="Edit" className="w-5 h-5" /> 
                    <span>Edit Profile</span>
                </button>
            </div>
            <div className="absolute bottom-0 right-0 flex items-center space-x-2 text-gray-300">
                <img src={squad} alt="Squad Icon" className="w-6 h-6" /> 
                <span>105 Squad</span>
            </div>
            <div className="flex space-x-4 mt-8">
                <button className="bg-gray-900 px-4 py-2 rounded-full border-2 border-white">Create a post</button>
                <button className="bg-gray-900 px-4 py-2 rounded-full border-2 border-white">Write a blog</button>
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
    </div>
  );
};

export default Profile;
