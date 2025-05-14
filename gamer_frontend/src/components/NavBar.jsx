import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../images/logo.png";
import home from "../images/home.png";
import friends from "../images/friends.png";
import notifi from "../images/notifi.png";
import menu1 from "../images/menu1.png";
import chat from "../images/chat.png";
import search from "../images/search.png";
import menu2 from "../images/menu2.png";
import game from '../images/game.png';
import group from '../images/group.png';
import save from '../images/save.png';
import { FiMenu, FiX } from "react-icons/fi";

const NavBar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMenu1Popup, setShowMenu1Popup] = useState(false);
  const [showMenu2Popup, setShowMenu2Popup] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove the JWT token
    localStorage.removeItem("email"); // Optional: remove saved email
    navigate("/login"); // Redirect to login page
  };
  
  return (
    <div className="bg-gray-900 text-white relative z-50">
      {/* Navbar */}
      <nav className="bg-gray-800 p-4 fixed top-0 left-0 w-full h-20 shadow-lg">
        <div className="container mx-auto flex items-center justify-between ml-5">
          {/* Left: Logo and Search */}
          <div className="flex items-center space-x-4">
            <img src={logo} alt="Gamer Logo" className="h-14" />
            <div className="relative">
              {/* Gradient Border Wrapper */}
              <div className="bg-gradient-to-r from-[#01C0D3] to-[#2059B6] p-[2px] rounded-full">
                <div className="relative flex items-center bg-gray-800 bg-gradient-to-r from-[#01C0D34C] to-[#2059B64C] rounded-full px-3">
                  {/* Search Icon */}
                  <img src={search} alt="Search" className="w-5 h-5 opacity-70 mr-2" />

                  {/* Input Field */}
                  <input
                    type="text"
                    className="bg-transparent text-white placeholder-white/70 p-2 w-58 focus:outline-none"
                    placeholder="Search Gamer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Center: 4 Circle Buttons */}
          <div className="hidden md:flex space-x-20 absolute left-1/2 transform -translate-x-1/2 ">
          
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

            <div className="relative inline-block rounded-full p-[2px] bg-gradient-to-b from-[#01C0D3] to-[#2059B6]">
              <button className="bg-gray-800 w-10 h-10 rounded-full text-white transition hover:bg-gradient-to-b hover:from-[#2059B6] hover:to-[#0E2750] hover:scale-110 flex items-center justify-center">
                <img src={notifi} alt="notifi" className="h-5 w-5" />
              </button>
            </div>

            <div className="relative inline-block rounded-full p-[2px] bg-gradient-to-b from-[#01C0D3] to-[#2059B6]">
              <button 
                onClick={() => setShowMenu1Popup(!showMenu1Popup)}
                className={`bg-gray-800 w-10 h-10 rounded-full text-white transition flex items-center justify-center
                  ${
                    ["/group", "/suggest", "/save"].includes(location.pathname)
                      ? "bg-gradient-to-b from-[#2059B6] to-[#0E2750] scale-110"
                      : "hover:bg-gradient-to-b hover:from-[#2059B6] hover:to-[#0E2750] hover:scale-110"
                  }
                `}
              >
                <img src={menu1} alt="menu1" className="h-5" />
              </button>
              {/* Popup Menu */}
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
                      <img src={group} alt="game" className="h-6 w-6" />
                    </button>
                    <span>Groups</span>
                  </Link>
                  <Link to="/save" className="flex items-center space-x-3">
                    <button className="w-7 h-7 rounded-full bg-gradient-to-b from-[#01C0D3] to-[#2059B6] flex items-center justify-center text-white">
                      <img src={save} alt="game" className="h-5 w-5" />
                    </button>
                    <span>Saved Items</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right: 2 Circle Buttons */}
          <div className="hidden md:flex space-x-10 absolute right-16">
            <div className="relative inline-block rounded-full p-[2px] bg-gradient-to-b from-[#01C0D3] to-[#2059B6]">
              <button className="bg-gray-800 w-10 h-10 rounded-full text-white transition hover:bg-gradient-to-b hover:from-[#2059B6] hover:to-[#0E2750] hover:scale-110 flex items-center justify-center">
                <img src={chat} alt="chat" className="h-5 w-5" />
              </button>
            </div>
            <div className="relative inline-block rounded-full p-[2px] bg-gradient-to-b from-[#01C0D3] to-[#2059B6]">
              <button
                onClick={() => setShowMenu2Popup(!showMenu2Popup)}
                className="bg-gray-800 w-10 h-10 rounded-full text-white transition hover:bg-gradient-to-b hover:from-[#2059B6] hover:to-[#0E2750] hover:scale-110 flex items-center justify-center ml-50"
              >
                <img src={menu2} alt="menu2" className="h-5" />
              </button>

              {/* Popup Menu */}
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
          </div>

           {/* Mobile Menu Toggle Button */}
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
            <Link to="/" className="text-white py-2" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/friends" className="text-white py-2" onClick={() => setMobileMenuOpen(false)}>Friends</Link>
            <Link to="/notifications" className="text-white py-2" onClick={() => setMobileMenuOpen(false)}>Notifications</Link>
            <Link to="/chat" className="text-white py-2" onClick={() => setMobileMenuOpen(false)}>Chat</Link>
            <Link to="/gamesuggestions" className="text-white py-2" onClick={() => setMobileMenuOpen(false)}>Game Suggestions</Link>
            <Link to="/groups" className="text-white py-2" onClick={() => setMobileMenuOpen(false)}>Groups</Link>
            <Link to="/saved" className="text-white py-2" onClick={() => setMobileMenuOpen(false)}>Saved Items</Link>
            <Link to="/menu" className="text-white py-2" onClick={() => setMobileMenuOpen(false)}>Settings</Link>
            <Link to="/profile" className="text-white py-2" onClick={() => setMobileMenuOpen(false)}>Your Profile</Link>
          </div>
        )}

      </nav>

    </div>
  );
};

export default NavBar;
