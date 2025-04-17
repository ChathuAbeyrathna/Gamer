import React from "react";
import { useEffect, useState } from "react";
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
import NavBar from "../components/NavBar";
import Sidebar from "../components/SideBar";

const Home = () => {
  const [posts, setPosts] = useState([]);

      useEffect(() => {
        axios.get("http://localhost:8080/api/posts/all")
            .then(response => {
                const sortedPosts = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setPosts(sortedPosts);
            })
            .catch(error => console.error("Error fetching posts:", error));
    }, []);

    const formatTime = (createdAt) => {
        return moment(createdAt).fromNow();
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
        
          {/* Posts*/}
          {posts.map((post) => (
          <div key={post.id} className=" bg-gray-800 p-4 rounded mb-4">
            <div className="flex items-center space-x-4">
              <img
                src={post.userImage} 
                alt="User Avatar"
                className="h-10 w-10 rounded-full"
              />
              <div>
                <h2 className="font-semibold">{post.userName || "Unknown User"}</h2>
                <p className="text-sm text-gray-400">{formatTime(post.createdAt)}</p>
              </div>
            </div>

            <p className="mt-2">{post.title}</p>
            <p className="text-sm text-blue-400">#
              {Array.isArray(post.tags) ? post.tags.join(", ") : ""}
            </p>
            
            {post.imageUrl && (
              /\.(mp4|webm|ogg)(\?.*)?$/.test(post.imageUrl) ? (
                <video
                  controls
                  className="w-full h-auto rounded my-2 mb-10"
                >
                  <source src={post.imageUrl} />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={post.imageUrl}
                  alt="Post"
                  className="w-full h-auto object-cover rounded my-2 mb-10"
                />
              )
            )}

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
          ))}
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
