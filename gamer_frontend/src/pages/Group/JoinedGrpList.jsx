import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import NavBar from "../../components/NavBar";
import Sidebar from "../../components/SideBar";
import axios from 'axios';
import defaultGroup from '../../images/default.png';
import viewMore from '../../images/viewMore.png';

/**
 * JoinedGrpList Component
 * -----------------------
 * Displays all groups that the user has joined (excluding groups they own).
 * Features:
 * - Fetch joined groups from backend
 * - Paginated display with "View More" button
 * - Navigate to individual group pages
 * - Leave a group functionality
 */
const JoinedGrpList = () => {
  // Retrieve user authentication info
  const email = localStorage.getItem("email");
  const token = localStorage.getItem("token");

  // State: list of all groups user is part of
  const [groups, setGroups] = useState([]);

  // State: number of visible groups for pagination
  const [visibleCount, setVisibleCount] = useState(8);

  const navigate = useNavigate();

  /**
   * Fetch joined groups on component mount
   * - Redirect to login if email/token not found
   * - Fetch groups from backend
   */
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);

    // Redirect if not logged in
    if (!email || !token) {
      navigate('/login');
      return;
    }

    // Fetch user's groups
    axios.get(`http://localhost:8080/api/groups/user/${email}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setGroups(res.data))
      .catch(err => console.error("Error loading joined groups", err));
  }, [email, token, navigate]);

  // Filter out groups where user is the owner
  const joinedGroups = groups.filter(group => group.ownerEmail !== email).reverse();

  return (
    <div className="relative min-h-screen text-white">
      {/* Background */}
      <div className="fixed top-0 left-0 w-full h-full bg-gray-900 z-[-1]"></div>

      {/* Navigation */}
      <NavBar />

      <div className="container mx-auto flex mt-4">
        {/* Sidebar (hidden on mobile) */}
        <div className="hidden lg:block lg:w-1/4">
          <Sidebar />
        </div>

        {/* Main content */}
        <div className="w-full lg:w-3/4 px-4 mt-16">
          {/* Header */}
          <div className="sticky top-[70px] bg-gray-900 z-30 pt-8 pb-4 mb-4">
            <div className="flex items-center space-x-4">
              <FaArrowLeft
                className="text-xl font-light cursor-pointer hover:text-gray-400"
                onClick={() => navigate("/group")} // Navigate back to main group page
              />
              <h1 className="text-2xl md:text-3xl">Groups You've Joined</h1>
            </div>
            <p className="mt-2 text-gray-400 ml-10">{joinedGroups.length} Groups</p>
          </div>

          {/* No groups message */}
          {joinedGroups.length === 0 ? (
            <p className="text-gray-500 text-center py-10">You haven’t joined any groups yet.</p>
          ) : (
            <div className="space-y-4">
              {/* Display groups */}
              {joinedGroups.slice(0, visibleCount).map(group => (
                <div
                  key={group.id}
                  onClick={() => navigate(`/group/view/${group.id}`)} // Navigate to individual group page
                  className="w-full max-w-3xl mx-auto bg-gradient-to-r from-[#01C0D3]/70 to-[#2059B6]/70 p-4 rounded-xl flex items-center justify-between space-x-4 cursor-pointer hover:brightness-110 transition"
                >
                  {/* Group info */}
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <img
                      src={group.coverPhotoUrl || defaultGroup} // Default image if none
                      alt="Group Cover"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="font-semibold text-white truncate">
                      {group.name}
                    </div>
                  </div>

                  {/* Leave group button */}
                  <button
                    onClick={async (e) => {
                      e.stopPropagation(); // Prevent triggering navigate on parent div
                      const confirmed = await window.confirm("Leave this group?");
                      if (!confirmed) return;

                      try {
                        await axios.post(
                          `http://localhost:8080/api/groups/${group.id}/leave?email=${email}`,
                          {},
                          { headers: { Authorization: `Bearer ${token}` } }
                        );
                        // Remove group from state after leaving
                        setGroups(prev => prev.filter(g => g.id !== group.id));
                      } catch (error) {
                        console.error("Failed to leave group", error);
                      }
                    }}
                    className="px-4 py-1.5 rounded-md text-sm font-medium border border-white text-white whitespace-nowrap"
                  >
                    Leave
                  </button>
                </div>
              ))}

              {/* View More button for pagination */}
              {joinedGroups.length > visibleCount && (
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

export default JoinedGrpList;
