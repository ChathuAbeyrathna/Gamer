import React from "react";
import { NavLink } from "react-router-dom";
import user1 from '../images/user1.png';
import game from '../images/game.png';
import group from '../images/group.png';
import save from '../images/save.png';

const SideBar = () => {
    
  return (
    <div className="w-1/4 bg-black-800 p-4 hidden lg:block fixed h-full left-6 mt-[6%]">
      <NavLink 
            to="/profile" 
            className={({ isActive }) =>
                `flex items-center mb-4 p-2 rounded-lg transition duration-300 ease-in-out 
                ${isActive ? "bg-gray-700 text-blue-400" : "hover:bg-gray-700 hover:text-blue-400"}`
            }
            >
            <img src={user1} alt="User Avatar" className="h-8 w-8 rounded-full mr-2" />
            <span className="font-semibold">Megna Dewmini</span>
      </NavLink>

      <ul>
        <li className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded mt-4">
          <button className="w-8 h-8 rounded-full bg-gradient-to-b from-[#01C0D3] to-[#2059B6] flex items-center justify-center text-white">
            <img src={game} alt="game" className="h-7 w-7" />
          </button>
          <span>Game Suggestions</span>
        </li>
        <li className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded mt-2">
          <button className="w-8 h-8 rounded-full bg-gradient-to-b from-[#01C0D3] to-[#2059B6] flex items-center justify-center text-white">
            <img src={group} alt="group" className="h-6 w-7" />
          </button>
          <span>Groups</span>
        </li>
        <li className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded mt-2">
          <button className="w-8 h-8 rounded-full bg-gradient-to-b from-[#01C0D3] to-[#2059B6] flex items-center justify-center text-white">
            <img src={save} alt="save" className="h-6 w-6" />
          </button>
          <span>Saved Items</span>
        </li>
      </ul>
    </div>
  );
};

export default SideBar;
