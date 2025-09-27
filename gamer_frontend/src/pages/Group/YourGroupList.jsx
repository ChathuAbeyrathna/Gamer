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
    window.scrollTo(0, 0);

    if (!email || !token) {
        navigate('/login');
        return;
    }

    axios.get(`http://localhost:8080/api/groups/owner/${email}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setGroups(res.data))
      .catch(err => console.error("Error loading your groups", err));
  }, [email, token, navigate]);

  const sortedGroups = [...groups].reverse(); // newest groups at the top

  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed top-0 left-0 w-full h-full bg-gray-900 z-[-1]"></div>
      <NavBar />

      <div className="container mx-auto flex mt-4">
        {/* Sidebar hidden on mobile */}
        <div className="hidden lg:block lg:w-1/4">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="w-full lg:w-3/4 px-4 mt-16">
          <div className="sticky top-[70px] bg-gray-900 z-30 pt-8 pb-4 mb-4">
            <div className="flex items-center space-x-4">
              <FaArrowLeft
                className="text-xl font-light cursor-pointer hover:text-gray-400"
                onClick={() => navigate("/group")}
              />
              <h1 className="text-2xl md:text-3xl">Your Game Groups</h1>
            </div>
            <p className="mt-2 text-gray-400 ml-10">{groups.length} Groups</p>
          </div>

          {groups.length === 0 ? (
            <p className="text-gray-500 text-center py-10">You haven’t created any groups yet.</p>
          ) : (
            <div className="space-y-4">
              {sortedGroups.slice(0, visibleCount).map(group => (
                <div
                  key={group.id}
                  onClick={() => navigate(`/group/view/${group.id}`)}
                  className="w-full max-w-3xl mx-auto bg-gradient-to-r from-[#01C0D3]/70 to-[#2059B6]/70 p-4 rounded-xl flex items-center space-x-4 cursor-pointer hover:brightness-110 transition"
                >
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <img
                      src={group.coverPhotoUrl || defaultGroup}
                      alt="Group Cover"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="font-semibold text-white truncate">
                      {group.name}
                    </div>
                  </div>
                </div>
              ))}

              {sortedGroups.length > visibleCount && (
                <div className="text-center py-8">
                  <button
                    onClick={() => setVisibleCount(prev => prev + 8)}
                    className="mx-auto flex items-center gap-2 text-gray-300 hover:scale-105 transition duration-300"
                  >
                    View More
                    <img src={viewMore} alt="View More" className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YourGroupList;