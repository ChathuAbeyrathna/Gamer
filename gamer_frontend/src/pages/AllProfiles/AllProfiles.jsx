import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NavBar from "../../components/NavBar";
import Sidebar from "../../components/SideBar";
import defaultProfile from '../../images/defaultProfile.png';
import viewMore from '../../images/viewMore.png';

/**
 * - Displays all gamer profiles in a grid layout.
 * - Allows the current user to follow/unfollow other users.
 * - Supports lazy-loading ("View More") for profiles.
 * - Integrates with backend APIs for profiles and following data.
 */
const AllProfiles = () => {
  // State for all profiles fetched from backend
  const [profiles, setProfiles] = useState([]);

  // State for emails of users the current user is following
  const [following, setFollowing] = useState([]);

  // Loading state while fetching profiles/following
  const [loading, setLoading] = useState(true);

  // Controls how many profiles are displayed at once (lazy-load)
  const [visibleCount, setVisibleCount] = useState(9); // show 9 at start

  // React Router navigation hook
  const navigate = useNavigate();

  // Current user credentials stored in localStorage
  const currentUserEmail = localStorage.getItem("email");
  const token = localStorage.getItem("token");

  /**
   * Fetch profiles + following list from backend
   * Runs on mount and whenever `currentUserEmail` or `token` changes.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all profiles
        const profilesRes = await axios.get('http://localhost:8080/api/profile/all');
        setProfiles(profilesRes.data);

        // Fetch "following" list if logged in
        if (token && currentUserEmail) {
          const followingRes = await axios.get(
            `http://localhost:8080/api/follow/following/${currentUserEmail}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          // Store only emails of followed users
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

  /**
   * Toggle follow/unfollow for a given profile
   */
  const handleToggleFollow = async (profileEmail, e) => {
    // Prevent parent click (going to profile)
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

      if (res.data.status === 'FOLLOWED') {
        // Add email to following list
        setFollowing(prev =>
          prev.includes(profileEmail) ? prev : [...prev, profileEmail]
        );
      } else if (res.data.status === 'UNFOLLOWED') {
        // Remove email from following list
        setFollowing(prev =>
          prev.filter(email => email !== profileEmail)
        );
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };

  /**
   * Navigate to a selected profile
   */
  const goToProfile = (email) => navigate(`/profile/view/${encodeURIComponent(email)}`);

  // Remove current user from the list of profiles
  const filteredProfiles = profiles.filter(p => p.email !== currentUserEmail);

  // Only show a slice of profiles (for lazy-load pagination)
  const visibleProfiles = filteredProfiles.slice(0, visibleCount);

  // Ensure page loads from top when mounted
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative min-h-screen text-white">
      {/* Background */}
      <div className="fixed inset-0 bg-gray-900 z-[-1]" />

      {/* Top navigation */}
      <NavBar />

      <div className="container mx-auto flex flex-col lg:flex-row mt-4 px-2 sm:px-4 space-y-4 lg:space-y-0 lg:space-x-4">

        {/* Sidebar (hidden on mobile, visible on md+) */}
        <div className="hidden md:block md:w-1/4 lg:w-1/5">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="w-full flex flex-col">

          {/* Header */}
          <div className="sticky top-[80px] bg-gray-900 z-30 pt-4 pb-4 lg:pt-8 lg:pb-6 px-2 lg:px-0">
            <h2 className="text-2xl sm:text-3xl font-bold">Gamers</h2>
          </div>

          {/* Profiles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-2 sm:p-4 mt-16 mb-16">
            {loading ? (
              // Loading state
              <p className="text-gray-400">Loading...</p>
            ) : (
              // Render each profile card
              visibleProfiles.map(p => (
                <div
                  key={p.email}
                  onClick={() => goToProfile(p.email)}
                  className="cursor-pointer p-[2px] rounded-xl bg-gradient-to-b from-[#01C0D3] to-[#2059B6] hover:scale-105 transition-transform duration-200"
                >
                  <div className="bg-gray-800 p-3 sm:p-4 rounded-xl shadow-md flex flex-col items-center h-full">
                    {/* Profile picture */}
                    <img
                      src={p.imageUrl || defaultProfile}
                      alt={p.gamerName}
                      className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full object-cover mt-2 sm:mt-3 mb-2 sm:mb-3"
                    />

                    {/* Gamer name */}
                    <h3 className="text-base sm:text-lg font-semibold text-center break-words px-1">
                      {p.gamerName}
                    </h3>

                    {/* Follow/Unfollow button */}
                    <button
                      onClick={(e) => handleToggleFollow(p.email, e)}
                      className={`m-2 sm:m-4 w-20 sm:w-28 py-1 rounded-lg text-xs sm:text-sm font-medium text-white transition duration-150 
                        ${following.includes(p.email)
                          ? 'bg-gradient-to-b from-[#407CDE] to-[#2059B6]'
                          : 'bg-gradient-to-b from-[#2059B6] to-[#407CDE]'
                        } hover:brightness-110 active:scale-95`}
                    >
                      {following.includes(p.email) ? 'Unfollow' : 'Follow'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* View More button (pagination) */}
          {!loading && visibleCount < filteredProfiles.length && (
            <div className="flex justify-center">
              <button
                onClick={() => setVisibleCount(prev => prev + 9)}
                className="mx-auto m-6 sm:m-10 text-sm sm:text-md flex items-center gap-2 text-gray-300 hover:scale-105 transition duration-300"
              >
                View More
                <img src={viewMore} alt="View More" className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllProfiles;
