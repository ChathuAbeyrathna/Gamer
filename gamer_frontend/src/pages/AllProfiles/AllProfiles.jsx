import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NavBar from "../../components/NavBar";
import Sidebar from "../../components/SideBar";
import defaultProfile from '../../images/defaultProfile.png'; // imported fallback image

const AllProfiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8080/api/profile/all')
      .then(res => setProfiles(res.data))
      .catch(err => console.error('Error fetching profiles:', err));
  }, []);

  const currentUserEmail = localStorage.getItem("email");

  const toggleFollow = (email) => {
    setFollowing((prev) =>
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    );
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <NavBar />

      <div className="container mx-auto flex mt-4 space-x-4 px-4">
        {/* Sidebar */}
        <div className="w-1/4">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="w-full flex flex-col m-24">
          <h2 className="text-3xl self-start mt-3 mb-3">Gamers</h2>

          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles
                .filter(profile => profile.email !== currentUserEmail)
                .map(profile => (
                <div
                    key={profile.email}
                    className="p-[2px] rounded-xl bg-gradient-to-b from-[#01C0D3] to-[#2059B6]"
                >
                    <div className="bg-gray-800 text-white p-4 rounded-xl shadow-md flex flex-col items-center">
                    <img
                        src={profile.imageUrl || defaultProfile}
                        alt="Profile"
                        className="w-24 h-24 rounded-full mt-3 mb-3 object-cover"
                    />
                    <h3 className="text-lg font-semibold">{profile.gamerName}</h3>
                    <p className="text-sm text-gray-300 mb-3">{profile.bio}</p>
                    <button
                        className={`m-3 w-28 py-1 rounded-full text-sm font-medium ${
                        following.includes(profile.email)
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-gradient-to-b from-[#2059B6] to-[#407CDE] hover:opacity-90'
                        }`}
                        onClick={() => toggleFollow(profile.email)}
                    >
                        {following.includes(profile.email) ? 'Unfollow' : 'Follow'}
                    </button>
                    </div>
                </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};

export default AllProfiles;
