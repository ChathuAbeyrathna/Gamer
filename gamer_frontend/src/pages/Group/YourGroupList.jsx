import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import NavBar from "../../components/NavBar";
import Sidebar from "../../components/SideBar";
import axios from 'axios';
import defaultGroup from '../../images/default.png';
import viewMore from '../../images/viewMore.png';

const YourGroupList = () => {
  const email = localStorage.getItem("email");
  const token = localStorage.getItem("token");
  const [groups, setGroups] = useState([]);
  const [visibleCount, setVisibleCount] = useState(8);
  const navigate = useNavigate();

  useEffect(() => {
    if (!email || !token) return;

    axios.get(`http://localhost:8080/api/groups/owner/${email}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setGroups(res.data))
      .catch(err => console.error("Error loading your groups", err));
  }, [email, token]);

  const sortedGroups = [...groups].reverse(); // newest groups at the top

  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed top-0 left-0 w-full h-full bg-gray-900 z-[-1]"></div>
      <NavBar />

      <div className="flex mt-4">
        {/* Sidebar */}
        <div className="w-1/4">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="w-3/4 px-4 mt-16 mb-10 mr-40 ml-40">
          <div className="sticky top-[80px] bg-gray-900 z-30 pt-8 pb-1 mb-4">
            <div className="flex items-center space-x-3 -ml-10">
              <FaArrowLeft
                className="text-2xl font-light mr-1 cursor-pointer hover:text-gray-400"
                onClick={() => navigate("/group")}
              />
              <h1 className="text-3xl mb-2">Your Game Groups</h1>
            </div>
            <p className="mb-6 text-gray-300">{groups.length} Groups</p>
          </div>

          {groups.length === 0 && (
            <p className="text-gray-500">You haven’t created any groups yet.</p>
          )}

          <div className="space-y-5">
            {sortedGroups.slice(0, visibleCount).map(group => (
              <div
                key={group.id}
                onClick={() => navigate(`/group/view/${group.id}`)}
                className="w-[700px] bg-gradient-to-r from-[#01C0D3B3] to-[#2059B6B3] p-4 rounded-xl flex justify-between items-center space-x-4 cursor-pointer hover:brightness-110 transition"
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
              </div>
            ))}

            {sortedGroups.length > visibleCount && (
              <div className="text-center mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setVisibleCount(prev => prev + 8);
                  }}
                  className="mx-[300px] mt-8 flex items-center gap-2 text-gray-300 hover:scale-105 transition duration-300"
                >
                  View More
                  <img src={viewMore} alt="Mario Icon" className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default YourGroupList;
