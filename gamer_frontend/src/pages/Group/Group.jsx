import React from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Sidebar from "../../components/SideBar";
import group1 from '../../images/group1.png';
import group2 from '../../images/group2.png';

const Profile = () => {
  const navigate = useNavigate();

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
        <div className="w-3/4 px-4 mt-20 mr-40 ml-40">
          {/* Create New Group Button */}
          <div className="flex justify-center mb-10 mt-6">
            <button
              className="w-80 py-2 rounded-md text-white font-semibold bg-gradient-to-r from-[#01C0D34D] to-[#2059B64D]"
              onClick={() => navigate("/creategroup")}>
              + Create New Group
            </button>
          </div>

          {/* Group Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 cursor-pointer">
            {/* Card 1 */}
            <div className="relative rounded-xl overflow-hidden" onClick={() => navigate("/joinedgroups")}>
              <img
                src={group1}
                alt="Group Joined"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black bg-opacity-70 px-5 py-3 rounded">
                  <h3 className="text-2xl text-white text-center">
                    Game <br />
                    Groups You've <br />
                    Joined
                  </h3>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="relative rounded-xl overflow-hidden" onClick={() => navigate("/yourgrouplist")}>
              <img
                src={group2}
                alt="Your Game Groups"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black bg-opacity-70 px-5 py-3 rounded">
                  <h3 className="text-2xl text-white text-center">
                    Your Game <br />
                    Groups
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
