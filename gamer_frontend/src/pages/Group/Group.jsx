import { useNavigate } from "react-router-dom"; // Hook for programmatic navigation
import NavBar from "../../components/NavBar"; // Top navigation bar
import Sidebar from "../../components/SideBar"; // Sidebar navigation
import group1 from '../../images/group1.png'; // Image for "Groups You've Joined" card
import group2 from '../../images/group2.png'; // Image for "Your Game Groups" card

/**
 * Group Page
 * Displays:
 * - Button to create a new group
 * - Two cards: "Groups You've Joined" and "Your Game Groups"
 * - Responsive layout with sidebar on medium+ screens
 */
const Group = () => {
  const navigate = useNavigate(); // Hook to navigate to other pages

  return (
    <div className="relative min-h-screen text-white">
      {/* Background overlay */}
      <div className="fixed top-0 left-0 w-full h-full bg-gray-900 z-[-1]"></div>

      {/* Top Navigation */}
      <NavBar />

      <div className="flex flex-col lg:flex-row mt-4 px-2 sm:px-4">
        {/* Sidebar: Hidden on mobile, visible from medium screens */}
        <div className="hidden md:block md:w-1/4 lg:w-1/5">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="w-full lg:w-3/4 px-2 sm:px-4 mt-16 lg:mt-20 mx-auto lg:mx-0 lg:mr-10 lg:ml-10 xl:mr-40 xl:ml-40">

          {/* Create New Group Button */}
          <div className="flex justify-center mb-6 lg:mb-10 mt-4 lg:mt-6">
            <button
              className="w-full sm:w-96 lg:w-80 py-3 sm:py-2 rounded-md text-white font-semibold 
                         bg-gradient-to-r from-[#01C0D34D] to-[#2059B64D] 
                         hover:from-[#01C0D366] hover:to-[#2059B666] 
                         transition-all duration-200 text-lg sm:text-base"
              onClick={() => navigate("/creategroup")} // Navigate to create group page
            >
              + Create New Group
            </button>
          </div>

          {/* Group Cards Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 cursor-pointer max-w-4xl mx-auto">

            {/* Card 1: Groups You've Joined */}
            <div
              className="relative rounded-xl overflow-hidden hover:scale-105 transition-transform duration-200"
              onClick={() => navigate("/joinedgroups")}
            >
              <img src={group1} alt="Group Joined" className="w-full h-auto object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-20 transition-all duration-200">
                <div className="bg-black bg-opacity-70 px-4 py-3 sm:px-5 sm:py-3 rounded">
                  <h3 className="text-xl sm:text-2xl text-white text-center leading-tight">
                    Game <br />
                    Groups You've <br />
                    Joined
                  </h3>
                </div>
              </div>
            </div>

            {/* Card 2: Your Game Groups */}
            <div
              className="relative rounded-xl overflow-hidden hover:scale-105 transition-transform duration-200"
              onClick={() => navigate("/yourgroups")}
            >
              <img src={group2} alt="Your Game Groups" className="w-full h-auto object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-20 transition-all duration-200">
                <div className="bg-black bg-opacity-70 px-4 py-3 sm:px-5 sm:py-3 rounded">
                  <h3 className="text-xl sm:text-2xl text-white text-center leading-tight">
                    Your Game <br />
                    Groups
                  </h3>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile description text */}
          <div className="md:hidden text-center mt-6 text-gray-300 text-sm">
            <p>Tap on a card to view your groups</p>
          </div>
        </div>
      </div>

      {/* Extra spacing for mobile to prevent content cutoff on scroll */}
      <div className="h-16 md:hidden"></div>
    </div>
  );
};

export default Group;
