import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import Loading from "../components/Loading";
import defaultProfile from "../images/defaultProfile.png";
import { getUserEmail } from "../authUtils";
import { useChat } from "../pages/Chat/ChatContext";

const NavBar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMenu1Popup, setShowMenu1Popup] = useState(false);
  const [showMenu2Popup, setShowMenu2Popup] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // notifications state
  const [hasUnreadAndUnseen, setHasUnreadAndUnseen] = useState(false);

  // chat state
  const { chatList } = useChat();
  const showChatRedDot = chatList.some((c) => c.hasUnread);

  // profile
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();
  const email = getUserEmail();

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("email");
      navigate("/login");
    }, 3000);
  };

  // check notifications
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
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, []);

  const showNotiRedDot = hasUnreadAndUnseen;

  // fetch profile
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

  if (isLoggingOut) return <Loading />;

  return (
    <div className="bg-gray-900 text-white relative z-50">
      <nav className="bg-gray-800 p-4 fixed top-0 left-0 w-full h-20 shadow-lg">
        <div className="container mx-auto flex items-center justify-between ml-5">
          {/* Left: Logo + Search */}
          <div className="flex items-center space-x-4">
            <img src={logo} alt="Gamer Logo" className="h-14" />
            <div className="relative">
              <div className="bg-gradient-to-r from-[#01C0D3] to-[#2059B6] p-[2px] rounded-full">
                <div className="relative flex items-center bg-gray-800 bg-gradient-to-r from-[#01C0D34C] to-[#2059B64C] rounded-full px-3">
                  <img src={search} alt="Search" className="w-5 h-5 opacity-70 mr-2" />
                  <input
                    type="text"
                    className="bg-transparent text-white placeholder-white/70 p-2 w-58 focus:outline-none"
                    placeholder="Search Gamer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Center: Nav Buttons */}
          <div className="hidden md:flex space-x-20 absolute left-1/2 transform -translate-x-1/2 ">
            {/* Home */}
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

            {/* Friends */}
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

            {/* Notifications */}
            <Link to="/notifications">
              <div className="relative inline-block rounded-full p-[2px] bg-gradient-to-b from-[#01C0D3] to-[#2059B6]">
                <button
                  className={`w-10 h-10 rounded-full text-white transition flex items-center justify-center 
                  ${location.pathname === "/notifications" ? "bg-gradient-to-b from-[#2059B6] to-[#0E2750] scale-110" : "bg-gray-800 hover:bg-gradient-to-b hover:from-[#2059B6] hover:to-[#0E2750] hover:scale-110"}`}
                >
                  <img src={notifi} alt="notifi" className="h-5 w-5" />
                  {showNotiRedDot && (
                    <span className="absolute top-1 right-0.5 w-3 h-3 rounded-full bg-red-500 border-2 border-gray-800" />
                  )}
                </button>
              </div>
            </Link>

            {/* Menu1 */}
            <div className="relative inline-block rounded-full p-[2px] bg-gradient-to-b from-[#01C0D3] to-[#2059B6]">
              <button
                onClick={() => setShowMenu1Popup(!showMenu1Popup)}
                className={`bg-gray-800 w-10 h-10 rounded-full text-white transition flex items-center justify-center
                ${["/group", "/suggest", "/save"].includes(location.pathname) ? "bg-gradient-to-b from-[#2059B6] to-[#0E2750] scale-110" : "hover:bg-gradient-to-b hover:from-[#2059B6] hover:to-[#0E2750] hover:scale-110"}`}
              >
                <img src={menu1} alt="menu1" className="h-5" />
              </button>
              {showMenu1Popup && (
                <div className="absolute right-0 mt-2 w-56 bg-gradient-to-b from-[#222] to-[#444] text-white rounded-xl shadow-lg p-4 space-y-4">
                  <Link to="/suggest" className="flex items-center space-x-3">
                    <button className="w-7 h-7 rounded-full bg-gradient-to-b from-[#01C0D3] to-[#2059B6] flex items-center justify-center text-white">
                      <img src={game} alt="game" className="h-6 w-6" />
                    </button>
                    <span>Game Suggestions</span>
                  </Link>
                  <Link to="/group" className="flex items-center space-x-3">
                    <button className="w-7 h-7 rounded-full bg-gradient-to-b from-[#01C0D3] to-[#2059B6] flex items-center justify-center text-white">
                      <img src={group} alt="group" className="h-6 w-6" />
                    </button>
                    <span>Groups</span>
                  </Link>
                  <Link to="/save" className="flex items-center space-x-3">
                    <button className="w-7 h-7 rounded-full bg-gradient-to-b from-[#01C0D3] to-[#2059B6] flex items-center justify-center text-white">
                      <img src={save} alt="save" className="h-5 w-5" />
                    </button>
                    <span>Saved Items</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Menu */}
          <div className="hidden md:flex space-x-10 absolute right-16">
            {/* Chat */}
            <Link to="/chat" className="relative inline-block">
              <div className="relative inline-block rounded-full p-[2px] bg-gradient-to-b from-[#01C0D3] to-[#2059B6]">
                <button
                  className={`bg-gray-800 w-10 h-10 rounded-full text-white transition flex items-center justify-center
                  ${location.pathname.startsWith("/chat") ? "bg-gradient-to-b from-[#2059B6] to-[#0E2750] scale-110" : "hover:bg-gradient-to-b hover:from-[#2059B6] hover:to-[#0E2750] hover:scale-110"}`}
                >
                  <img src={chat} alt="chat" className="h-5 w-5" />
                </button>
              </div>
              {showChatRedDot && (
                <span className="absolute top-1 right-0.5 w-3 h-3 rounded-full bg-red-500 border-2 border-gray-800" />
              )}
            </Link>

            {/* Menu2 */}
            <div className="relative inline-block rounded-full p-[2px] bg-gradient-to-b from-[#01C0D3] to-[#2059B6]">
              <button
                onClick={() => setShowMenu2Popup(!showMenu2Popup)}
                className="bg-gray-800 w-10 h-10 rounded-full text-white transition hover:bg-gradient-to-b hover:from-[#2059B6] hover:to-[#0E2750] hover:scale-110 flex items-center justify-center ml-50"
              >
                <img src={menu2} alt="menu2" className="h-5" />
              </button>
              {showMenu2Popup && (
                <div className="absolute right-0 mt-2 w-56 bg-gradient-to-b from-[#222] to-[#444] text-white rounded-xl shadow-lg p-4 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-400 rounded-full w-8 h-8 flex items-center justify-center text-xl text-black">?</div>
                    <span>Help & Support</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-400 rounded-full w-8 h-8 flex items-center justify-center text-xl text-black">!</div>
                    <span>Give Feedback</span>
                  </div>
                  {localStorage.getItem("token") && (
                    <div onClick={handleLogout} className="flex items-center space-x-3 cursor-pointer">
                      <div className="bg-gray-400 rounded-full w-8 h-8 flex items-center justify-center text-xl text-black">→</div>
                      <span>Log Out</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile */}
            {profile && (
              <Link to="/profile" className="flex items-center rounded-lg group">
                <img
                  src={profile.imageUrl || defaultProfile}
                  alt="User Avatar"
                  className={`h-10 w-10 rounded-full mr-2 transition-all duration-200
                  ${location.pathname === "/profile" ? "border-2 border-blue-400" : "border-2 border-transparent group-hover:border-blue-400"}`}
                />
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white text-2xl"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-gray-800 p-5 flex flex-col space-y-4 text-center">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/friends" onClick={() => setMobileMenuOpen(false)}>Friends</Link>
            <Link to="/notifications" onClick={() => setMobileMenuOpen(false)}>Notifications</Link>
            <Link to="/chat" onClick={() => setMobileMenuOpen(false)}>Chat</Link>
            <Link to="/gamesuggestions" onClick={() => setMobileMenuOpen(false)}>Game Suggestions</Link>
            <Link to="/groups" onClick={() => setMobileMenuOpen(false)}>Groups</Link>
            <Link to="/saved" onClick={() => setMobileMenuOpen(false)}>Saved Items</Link>
            <Link to="/menu" onClick={() => setMobileMenuOpen(false)}>Settings</Link>
            <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>Your Profile</Link>
          </div>
        )}
      </nav>
    </div>
  );
};

export default NavBar;
