import React from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../images/logo.png";
import home from "../images/home.png";
import friends from "../images/friends.png";
import notifi from "../images/notifi.png";
import menu1 from "../images/menu1.png";
import chat from "../images/chat.png";
import search from "../images/search.png";
import menu2 from "../images/menu2.png";

const NavBar = () => {
  const location = useLocation();
  
  return (
    <div className="bg-gray-900 text-white">
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
          <div className="flex space-x-20 absolute left-1/2 transform -translate-x-1/2">
          
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

            <div className="relative inline-block rounded-full p-[2px] bg-gradient-to-b from-[#01C0D3] to-[#2059B6]">
              <button className="bg-gray-800 w-10 h-10 rounded-full text-white transition hover:bg-gradient-to-b hover:from-[#2059B6] hover:to-[#0E2750] hover:scale-110 flex items-center justify-center">
                <img src={friends} alt="friends" className="h-5 w-5" />
              </button>
            </div>

            <div className="relative inline-block rounded-full p-[2px] bg-gradient-to-b from-[#01C0D3] to-[#2059B6]">
              <button className="bg-gray-800 w-10 h-10 rounded-full text-white transition hover:bg-gradient-to-b hover:from-[#2059B6] hover:to-[#0E2750] hover:scale-110 flex items-center justify-center">
                <img src={notifi} alt="notifi" className="h-5 w-5" />
              </button>
            </div>

            <div className="relative inline-block rounded-full p-[2px] bg-gradient-to-b from-[#01C0D3] to-[#2059B6]">
              <button className="bg-gray-800 w-10 h-10 rounded-full text-white transition hover:bg-gradient-to-b hover:from-[#2059B6] hover:to-[#0E2750] hover:scale-110 flex items-center justify-center">
                <img src={menu1} alt="menu1" className="h-5" />
              </button>
            </div>
          </div>

          {/* Right: 2 Circle Buttons */}
          <div className="flex space-x-14">
            <div className="relative inline-block rounded-full p-[2px] bg-gradient-to-b from-[#01C0D3] to-[#2059B6]">
              <button className="bg-gray-800 w-10 h-10 rounded-full text-white transition hover:bg-gradient-to-b hover:from-[#2059B6] hover:to-[#0E2750] hover:scale-110 flex items-center justify-center">
                <img src={chat} alt="chat" className="h-5 w-5" />
              </button>
            </div>
            <div className="relative inline-block rounded-full p-[2px] bg-gradient-to-b from-[#01C0D3] to-[#2059B6]">
              <button className="bg-gray-800 w-10 h-10 rounded-full text-white transition hover:bg-gradient-to-b hover:from-[#2059B6] hover:to-[#0E2750] hover:scale-110 flex items-center justify-center">
                <img src={menu2} alt="menu2" className="h-5" />
              </button>
            </div>
          </div>

        </div>
      </nav>
    </div>
  );
};

export default NavBar;
