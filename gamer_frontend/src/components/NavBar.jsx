import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

// Images and icons for navigation
import logo from "../images/logo.png";
import home from "../images/home.png";
import friends from "../images/friends.png";
import notifi from "../images/notifi.png";
import menu1 from "../images/menu1.png";
import chat from "../images/chat.png";
import search from "../images/search.png";
import menu2 from "../images/menu2.png";
import game from "../images/game.png";
import group from "../images/group.png";
import save from "../images/save.png";
import { FiMenu, FiX } from "react-icons/fi";

// Components and utilities
import Loading from "../components/Loading";
import defaultProfile from "../images/defaultProfile.png";
import { getUserEmail } from "../authUtils";
import { useChat } from "../pages/Chat/ChatContext";

/**
 * NavBar component renders the top navigation bar including:
 * - Logo and search input
 * - Navigation buttons (home, friends, notifications, menu popups)
 * - Profile and chat icons with notification indicators
 * - Mobile menu for smaller screens
 */
const NavBar = () => {
  const location = useLocation(); // To highlight active nav button
  const navigate = useNavigate(); // For programmatic navigation
  const email = getUserEmail();   // Logged-in user email

  // Mobile menu open state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Popups for Menu1 (Game/Group/Saved) and Menu2 (Help & Logout)
  const [showMenu1Popup, setShowMenu1Popup] = useState(false);
  const [showMenu2Popup, setShowMenu2Popup] = useState(false);

  // Loading state for logout
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Notifications state
  const [hasUnreadAndUnseen, setHasUnreadAndUnseen] = useState(false);

  // Chat context to show red dot for unread messages
  const { chatList } = useChat();
  const showChatRedDot = chatList.some((c) => c.hasUnread);

  // User profile state
  const [profile, setProfile] = useState(null);

  /**
   * Handles user logout:
   * - Shows loading spinner
   * - Clears token & email from localStorage
   * - Redirects to login page
   */
  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("email");
      navigate("/login");
    }, 3000);
  };

  /**
   * Fetch notifications and check for unread/unseen:
   * - Runs on mount and every 60 seconds
   * - Compares notification timestamps with last seen time
   */
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setHasUnreadAndUnseen(false);
          return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await fetch("http://localhost:8080/api/notifications", config);
        if (!res.ok) throw new Error("Failed to fetch notifications");
        const data = await res.json();

        // Compares createdAt timestamps with notificationsLastSeenAt from localStorage
        const lastSeenStr = localStorage.getItem("notificationsLastSeenAt");
        const lastSeen = lastSeenStr ? new Date(lastSeenStr) : new Date(0);

        const newUnreadExists = data.some(
          (n) => !n.read && new Date(n.createdAt) > lastSeen
        );

        setHasUnreadAndUnseen(newUnreadExists);
      } catch (err) {
        console.error("Failed to fetch notifications for unread check", err);
        setHasUnreadAndUnseen(false);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 60000); // Repeat every minute
    return () => clearInterval(interval);
  }, []);

  const showNotiRedDot = hasUnreadAndUnseen; // For notification icon red dot

  /**
   * Fetch user profile data from backend
   * - Runs whenever logged-in email changes
   */
  useEffect(() => {
    const fetchProfile = async () => {
      if (!email) return;

      try {
        const res = await fetch(`http://localhost:8080/api/profile/${email}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (err) {
        console.error("Profile fetch error", err);
      }
    };

    fetchProfile();
  }, [email]);

  // Close popups when mobile menu opens/closes
  useEffect(() => {
    if (mobileMenuOpen) {
      setShowMenu1Popup(false);
      setShowMenu2Popup(false);
    }
  }, [mobileMenuOpen]);

  // Close popups when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowMenu1Popup(false);
      setShowMenu2Popup(false);
    };

    if (showMenu1Popup || showMenu2Popup) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showMenu1Popup, showMenu2Popup]);

  // Show loading spinner while logging out
  if (isLoggingOut) return <Loading />;

  return (
    <div className="bg-gray-900 text-white relative z-50">
      <nav className="bg-gray-800 p-4 fixed top-0 left-0 w-full h-20 shadow-lg">
        <div className="container mx-auto flex items-center justify-between px-2 sm:px-4 lg:ml-5">

          {/* Left section: Logo + Search */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-1 lg:flex-none">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <img src={logo} alt="Gamer Logo" className="h-10 sm:h-12 lg:h-14" />
            </Link>

            {/* Search bar - hidden on mobile, visible on medium screens and up */}
            <div className="hidden md:block relative">
              <div className="bg-gradient-to-r from-[#01C0D3] to-[#2059B6] p-[2px] rounded-full">
                <div className="relative flex items-center bg-gray-800 bg-gradient-to-r from-[#01C0D34C] to-[#2059B64C] rounded-full px-3">
                  <img src={search} alt="Search" className="w-4 h-4 sm:w-5 sm:h-5 opacity-70 mr-2" />
                  <input
                    type="text"
                    className="bg-transparent text-white placeholder-white/70 p-2 w-40 lg:w-58 focus:outline-none text-sm lg:text-base"
                    placeholder="Search Gamer"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const query = e.target.value.trim();
                        if (query) navigate(`/search?query=${encodeURIComponent(query)}`);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Center section: Desktop navigation buttons */}
          <div className="hidden lg:flex space-x-10 xl:space-x-20 absolute left-1/2 transform -translate-x-1/2">
            {/* Home button */}
            <Link to="/">
              <div className="relative inline-block rounded-full p-[2px] bg-gradient-to-b from-[#01C0D3] to-[#2059B6]">
                <button
                  className={`w-10 h-10 rounded-full text-white transition flex items-center justify-center 
                  ${location.pathname === "/" ? "bg-gradient-to-b from-[#2059B6] to-[#0E2750] scale-110" : "bg-gray-800 hover:bg-gradient-to-b hover:from-[#2059B6] hover:to-[#0E2750] hover:scale-110"}`}
                >
                  <img src={home} alt="home" className="h-5 w-5" />
                </button>
              </div>
            </Link>

            {/* Friends button */}
            <Link to="/allprof">
              <div className="relative inline-block rounded-full p-[2px] bg-gradient-to-b from-[#01C0D3] to-[#2059B6]">
                <button
                  className={`w-10 h-10 rounded-full text-white transition flex items-center justify-center 
                  ${location.pathname === "/allprof" ? "bg-gradient-to-b from-[#2059B6] to-[#0E2750] scale-110" : "bg-gray-800 hover:bg-gradient-to-b hover:from-[#2059B6] hover:to-[#0E2750] hover:scale-110"}`}
                >
                  <img src={friends} alt="friends" className="h-5 w-5" />
                </button>
              </div>
            </Link>

            {/* Notifications button with red dot */}
            <Link to="/notifications">
              <div className="relative inline-block rounded-full p-[2px] bg-gradient-to-b from-[#01C0D3] to-[#2059B6]">
                <button
                  className={`w-10 h-10 rounded-full text-white transition flex items-center justify-center 
                  ${location.pathname === "/notifications" ? "bg-gradient-to-b from-[#2059B6] to-[#0E2750] scale-110" : "bg-gray-800 hover:bg-gradient-to-b hover:from-[#2059B6] hover:to-[#0E2750] hover:scale-110"}`}
                >
                  <img src={notifi} alt="notifi" className="h-5 w-5" />
                  {showNotiRedDot && <span className="absolute top-1 right-0.5 w-3 h-3 rounded-full bg-red-500 border-2 border-gray-800" />}
                </button>
              </div>
            </Link>

            {/* Menu1 popup: Game/Group/Saved */}
            <div className="relative">
              <div className="rounded-full p-[2px] bg-gradient-to-b from-[#01C0D3] to-[#2059B6]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu1Popup(!showMenu1Popup);
                    setShowMenu2Popup(false);
                  }}
                  className={`bg-gray-800 w-10 h-10 rounded-full text-white transition flex items-center justify-center
                  ${["/group", "/suggest", "/save"].includes(location.pathname) ? "bg-gradient-to-b from-[#2059B6] to-[#0E2750] scale-110" : "hover:bg-gradient-to-b hover:from-[#2059B6] hover:to-[#0E2750] hover:scale-110"}`}
                >
                  <img src={menu1} alt="menu1" className="h-5" />
                </button>
              </div>

              {showMenu1Popup && (
                <div className="absolute right-0 mt-2 w-56 bg-gradient-to-b from-[#222] to-[#444] text-white rounded-xl shadow-lg p-4 space-y-4 z-50">
                  {/* Game Suggestions */}
                  <Link to="/suggest" className="flex items-center space-x-3 hover:bg-gray-700 hover:rounded-lg transition-all duration-200 p-1">
                    <button className="w-7 h-7 rounded-full bg-gradient-to-b from-[#01C0D3] to-[#2059B6] flex items-center justify-center text-white hover:scale-105 transition-transform duration-200">
                      <img src={game} alt="game" className="h-6 w-6" />
                    </button>
                    <span className="hover:text-blue-400 transition-colors duration-200">Game Suggestions</span>
                  </Link>

                  {/* Groups */}
                  <Link to="/group" className="flex items-center space-x-3 hover:bg-gray-700 hover:rounded-lg transition-all duration-200 p-1">
                    <button className="w-7 h-7 rounded-full bg-gradient-to-b from-[#01C0D3] to-[#2059B6] flex items-center justify-center text-white hover:scale-105 transition-transform duration-200">
                      <img src={group} alt="group" className="h-6 w-6" />
                    </button>
                    <span className="hover:text-blue-400 transition-colors duration-200">Groups</span>
                  </Link>

                  {/* Saved Items */}
                  <Link to="/save" className="flex items-center space-x-3 hover:bg-gray-700 hover:rounded-lg transition-all duration-200 p-1">
                    <button className="w-7 h-7 rounded-full bg-gradient-to-b from-[#01C0D3] to-[#2059B6] flex items-center justify-center text-white hover:scale-105 transition-transform duration-200">
                      <img src={save} alt="save" className="h-5 w-5" />
                    </button>
                    <span className="hover:text-blue-400 transition-colors duration-200">Saved Items</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right section: Chat, Menu2, Profile */}
          <div className="hidden lg:flex space-x-6 xl:space-x-10 absolute right-4 xl:right-16">
            {/* Chat icon */}
            <Link to="/chat" className="relative">
              <div className="relative inline-block rounded-full p-[2px] bg-gradient-to-b from-[#01C0D3] to-[#2059B6]">
                <button
                  className={`bg-gray-800 w-10 h-10 rounded-full text-white transition flex items-center justify-center
                  ${location.pathname.startsWith("/chat") ? "bg-gradient-to-b from-[#2059B6] to-[#0E2750] scale-110" : "hover:bg-gradient-to-b hover:from-[#2059B6] hover:to-[#0E2750] hover:scale-110"}`}
                >
                  <img src={chat} alt="chat" className="h-5 w-5" />
                </button>
              </div>
              {showChatRedDot && <span className="absolute top-1 right-0.5 w-3 h-3 rounded-full bg-red-500 border-2 border-gray-800" />}
            </Link>

            {/* Menu2 popup: Help & Logout */}
            <div className="relative">
              <div className="rounded-full p-[2px] bg-gradient-to-b from-[#01C0D3] to-[#2059B6]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu2Popup(!showMenu2Popup);
                    setShowMenu1Popup(false);
                  }}
                  className="bg-gray-800 w-10 h-10 rounded-full text-white transition hover:bg-gradient-to-b hover:from-[#2059B6] hover:to-[#0E2750] hover:scale-110 flex items-center justify-center"
                >
                  <img src={menu2} alt="menu2" className="h-5" />
                </button>
              </div>
              {showMenu2Popup && (
                <div className="absolute right-0 mt-2 w-56 bg-gradient-to-b from-[#222] to-[#444] text-white rounded-xl shadow-lg p-4 space-y-4 z-50">
                  <Link to="/help-support">
                    <div className="flex items-center space-x-3 hover:bg-gray-700 hover:rounded-lg transition-all duration-200 p-1 cursor-pointer">
                      <div className="bg-gray-400 rounded-full w-8 h-8 flex items-center justify-center text-xl text-black hover:scale-105 transition-transform duration-200">?</div>
                      <span className="hover:text-blue-400 transition-colors duration-200">Help & Support</span>
                    </div>
                  </Link>

                  {/* Logout button */}
                  {localStorage.getItem("token") && (
                    <div
                      onClick={handleLogout}
                      className="flex items-center space-x-3 cursor-pointer hover:bg-gray-700 hover:rounded-lg transition-all duration-200 p-1"
                    >
                      <div className="bg-gray-400 rounded-full w-8 h-8 flex items-center justify-center text-xl text-black hover:scale-105 transition-transform duration-200">→</div>
                      <span className="hover:text-blue-400 transition-colors duration-200">Log Out</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User profile avatar */}
            {profile && (
              <Link to="/profile" className="flex items-center rounded-lg group">
                <img
                  src={profile.imageUrl || defaultProfile}
                  alt="User Avatar"
                  className={`h-8 w-8 lg:h-10 lg:w-10 rounded-full transition-all duration-200
                  ${location.pathname === "/profile" ? "border-2 border-blue-400" : "border-2 border-transparent group-hover:border-blue-400"}`}
                />
              </Link>
            )}
          </div>

          {/* Mobile menu toggle button */}
          <button
            className="lg:hidden text-white text-2xl p-2"
            onClick={(e) => {
              e.stopPropagation();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
          >
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {/* Overlay for mobile menu */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Mobile menu content */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden absolute top-20 left-0 w-full bg-gray-800 p-5 
               flex flex-col space-y-4 text-center z-40 max-h-screen overflow-y-auto"
          >
            {/* Mobile Search Bar */}
            <div className="mb-4">
              <div className="bg-gradient-to-r from-[#01C0D3] to-[#2059B6] p-[2px] rounded-full">
                <div className="relative flex items-center bg-gray-800 bg-gradient-to-r from-[#01C0D34C] to-[#2059B64C] rounded-full px-3">
                  <img src={search} alt="Search" className="w-5 h-5 opacity-70 mr-2" />
                  <input
                    type="text"
                    className="bg-transparent text-white placeholder-white/70 p-2 w-full focus:outline-none"
                    placeholder="Search Gamer"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const query = e.target.value.trim();
                        if (query) {
                          navigate(`/search?query=${encodeURIComponent(query)}`);
                          setMobileMenuOpen(false);
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Mobile navigation links */}
            {[
              { path: "/", label: "Home" },
              { path: "/allprof", label: "Friends" },
              { path: "/notifications", label: "Notifications" },
              { path: "/chat", label: "Chat" },
              { path: "/suggest", label: "Game Suggestions" },
              { path: "/group", label: "Groups" },
              { path: "/save", label: "Saved Items" },
              { path: "/help-support", label: "Help & Support" },
              { path: "/profile", label: "Your Profile" }
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2
                  ${location.pathname === item.path ? "bg-gradient-to-r from-[#2059B6] to-[#0E2750] text-white" : "hover:bg-gray-700"}`}
              >
                {/* Icons for mobile menu */}
                {item.path === "/" && <img src={home} alt="home" className="h-5 w-5" />}
                {item.path === "/allprof" && <img src={friends} alt="friends" className="h-5 w-5" />}
                {item.path === "/notifications" && (
                  <div className="relative">
                    <img src={notifi} alt="notifications" className="h-5 w-5" />
                    {showNotiRedDot && <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border-2 border-gray-800" />}
                  </div>
                )}
                {item.path === "/chat" && (
                  <div className="relative">
                    <img src={chat} alt="chat" className="h-5 w-5" />
                    {showChatRedDot && <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border-2 border-gray-800" />}
                  </div>
                )}
                <span>{item.label}</span>
              </Link>
            ))}

            {/* Logout button for mobile */}
            {localStorage.getItem("token") && (
              <div
                onClick={handleLogout}
                className="py-3 px-4 rounded-lg cursor-pointer hover:bg-gray-700 transition-all duration-200 flex items-center justify-center space-x-2 mt-2"
              >
                <div className="bg-gray-400 rounded-full w-6 h-6 flex items-center justify-center text-lg text-black">→</div>
                <span>Log Out</span>
              </div>
            )}
          </div>
        )}
      </nav>
    </div>
  );
};

export default NavBar;