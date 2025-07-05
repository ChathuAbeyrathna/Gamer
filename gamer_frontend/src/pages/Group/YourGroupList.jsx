import React, { useEffect, useState } from 'react';
import NavBar from "../../components/NavBar";
import Sidebar from "../../components/SideBar";
import axios from 'axios';
import defaultImg from '../../images/default.png';


const YourGroupList = () => {
  const email = localStorage.getItem("email");
  const [groups, setGroups] = useState([]); 

  useEffect(() => {
    if (!email) return;

    const token = localStorage.getItem("token");

    axios.get(`http://localhost:8080/api/groups/owner/${email}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setGroups(res.data))
      .catch(err => console.error("Error loading user's groups", err));
  }, [email]);

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
        <div className="w-3/4 px-4 mt-16 mr-40 ml-40">
          <div className="min-h-screen bg-gray-900 px-6 py-10 text-white">
            <h1 className="text-3xl mb-2">Your Game Groups</h1>
            <p className="mb-6 text-gray-300">{groups.length} Groups</p>

            <div className="space-y-5">
              {groups.map(group => (
                <div key={group.id} className="bg-gradient-to-r from-[rgba(1,192,211,0.7)] to-[rgba(32,89,182,0.7)] p-4 rounded-2xl flex items-center shadow-lg">
                  <img
                    src={group.coverPhotoUrl ? group.coverPhotoUrl : defaultImg}
                    alt="Group Cover"
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <h2 className="text-lg font-semibold">{group.name}</h2>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YourGroupList;
