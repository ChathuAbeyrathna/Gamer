// src/pages/JoinedGroupList.jsx

import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Sidebar from "../../components/SideBar";
import axios from 'axios';
import defaultImg from '../../images/default.png';

const JoinedGrpList = () => {
  const email = localStorage.getItem("email");
  const token = localStorage.getItem("token");
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    if (!email || !token) return;

    axios.get(`http://localhost:8080/api/groups/user/${email}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setGroups(res.data))
      .catch(err => console.error("Error loading joined groups", err));
  }, [email, token]);

  // Filter out groups where user is the owner
  const joinedGroups = groups.filter(group => group.ownerEmail !== email);

  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed top-0 left-0 w-full h-full bg-gray-900 z-[-1]"></div>
      <NavBar />

      <div className="flex mt-4">
        <div className="w-1/4">
          <Sidebar />
        </div>

        <div className="w-3/4 px-4 mt-16 mr-40 ml-40">
          <div className="min-h-screen bg-gray-900 px-6 py-10 text-white">
            <h1 className="text-3xl mb-2">Game Groups You've Joined</h1>
            <p className="mb-6 text-gray-300">{joinedGroups.length} Groups</p>

            {joinedGroups.length === 0 && (
              <p className="text-gray-500">You haven’t joined any groups yet.</p>
            )}

            <div className="space-y-5">
              {joinedGroups.map(group => (
                <div
                  key={group.id}
                  className="bg-gradient-to-r from-[rgba(1,192,211,0.7)] to-[rgba(32,89,182,0.7)] p-4 rounded-2xl flex justify-between items-center shadow-lg hover:scale-[1.01] transition-all"
                >
                  <Link to={`/group/view/${group.id}`} className="flex items-center">
                    <img
                      src={group.coverPhotoUrl || defaultImg}
                      alt="Group Cover"
                      className="w-16 h-16 rounded-full object-cover mr-4 border border-white"
                    />
                    <div>
                      <h2 className="text-lg font-semibold">{group.name}</h2>
                      <p className="text-sm text-gray-200 mt-1">{group.memberEmails.length} Gamers</p>
                    </div>
                  </Link>

                  <button
                    onClick={async () => {
                      const confirmed = await window.confirm("Leave this group?");
                      if (!confirmed) return;

                      try {
                        await axios.post(
                          `http://localhost:8080/api/groups/${group.id}/leave?email=${email}`,
                          {},
                          { headers: { Authorization: `Bearer ${token}` } }
                        );
                        setGroups(prev => prev.filter(g => g.id !== group.id));
                      } catch (error) {
                        console.error("Failed to leave group", error);
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
                  >
                    Leave Group
                  </button>

                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinedGrpList;
