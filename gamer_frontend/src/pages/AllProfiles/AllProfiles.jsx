import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NavBar from "../../components/NavBar";
import Sidebar from "../../components/SideBar";
import defaultProfile from '../../images/defaultProfile.png';
import viewMore from '../../images/viewMore.png';

const AllProfiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(9); // show 9 at start
  const navigate = useNavigate();

  const currentUserEmail = localStorage.getItem("email");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profilesRes = await axios.get('http://localhost:8080/api/profile/all');
        setProfiles(profilesRes.data);

        if (token && currentUserEmail) {
          const followingRes = await axios.get(
            `http://localhost:8080/api/follow/following/${currentUserEmail}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setFollowing(followingRes.data.map((u) => u.email));
        }
      } catch (err) {
        console.error('Error fetching profiles or following:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUserEmail, token]);

  const handleToggleFollow = async (profileEmail, e) => {
    e.stopPropagation();
    if (!token) {
      alert('Please log in to follow users.');
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:8080/api/follow/toggle-follow/${profileEmail}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.status === 'ok') {
        setFollowing(prev => prev.includes(profileEmail)
          ? prev.filter(e => e !== profileEmail)
          : [...prev, profileEmail]);
      } else if (res.data.status === 'blocked') {
        alert('Cannot follow this user (blocked).');
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };
 
  const goToProfile = (email) => navigate(`/profile/view/${encodeURIComponent(email)}`);

  const filteredProfiles = profiles.filter(p => p.email !== currentUserEmail);
  const visibleProfiles = filteredProfiles.slice(0, visibleCount); // show only up to visibleCount

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed inset-0 bg-gray-900 z-[-1]" />
      <NavBar />

      <div className="container mx-auto flex mt-4 px-4 space-x-4">
        <div className="w-1/4"><Sidebar /></div>

        <div className="w-full flex flex-col">

          <div className="sticky top-[80px] bg-gray-900 z-30 pt-8 pb-6">
            <h2 className="text-3xl">Gamers</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 mt-16">
            {loading ? (
              <p className="text-gray-400">Loading...</p>
            ) : (
              visibleProfiles.map(p => (
                <div
                  key={p.email}
                  onClick={() => goToProfile(p.email)}
                  className="cursor-pointer p-[2px] rounded-xl bg-gradient-to-b from-[#01C0D3] to-[#2059B6]"
                >
                  <div className="bg-gray-800 p-4 rounded-xl shadow-md flex flex-col items-center h-full">
                    <img
                      src={p.imageUrl || defaultProfile}
                      alt={p.gamerName}
                      className="w-24 h-24 rounded-full object-cover mt-3 mb-3"
                    />
                    <h3 className="text-lg font-semibold">{p.gamerName}</h3>
                    <button
                      onClick={(e) => handleToggleFollow(p.email, e)}
                      className={`m-4 w-28 py-1 rounded-lg text-sm font-medium text-white transition duration-150 ${following.includes(p.email)
                        ? 'bg-gradient-to-b from-[#407CDE] to-[#2059B6]'
                        : 'bg-gradient-to-b from-[#2059B6] to-[#407CDE]'
                        } hover:brightness-110`}
                    >
                      {following.includes(p.email) ? 'Unfollow' : 'Follow'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* View More Button */}
          {!loading && visibleCount < filteredProfiles.length && (
            <button
              onClick={() => setVisibleCount(prev => prev + 9)}
              className="mx-auto m-10 text-md flex items-center gap-2 text-gray-300 hover:scale-105 transition duration-300"
            >
              View More
              <img src={viewMore} alt="Mario Icon" className="w-5 h-5" />
            </button>

          )}
        </div>
      </div>
    </div>
  );
};

export default AllProfiles;
