import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { getUserEmail } from "../authUtils";
import game from '../images/game.png';
import group from '../images/group.png';
import save from '../images/save.png';
import defaultProfile from '../images/defaultProfile.png';

const SideBar = () => {
  const email = getUserEmail();
  const [profile, setProfile] = useState(null);

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

  return (
    <div className="w-1/4 bg-black-800 p-4 hidden lg:block fixed h-full left-6 mt-[6%]">

      {profile && (
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center mb-4 p-2 rounded-lg transition duration-300 ease-in-out 
            ${isActive ? "bg-gray-700 text-blue-400" : "hover:bg-gray-700 hover:text-blue-400"}`
          }
        >
          <img
            src={profile.imageUrl || defaultProfile}
            alt="User Avatar"
            className="h-8 w-8 rounded-full mr-2"
          />
          <span className="font-semibold">{profile.gamerName}</span>
        </NavLink>
      )}

      <ul>
        <NavLink
          to="/suggest"
          className={({ isActive }) =>
            `flex items-center mb-4 p-2 rounded-lg transition duration-300 ease-in-out 
              ${isActive ? "bg-gray-700 text-blue-400" : "hover:bg-gray-700 hover:text-blue-400"}`
          }
        >
          <li className="flex items-center space-x-3 hover:bg-gray-700 rounded">
            <button className="w-8 h-8 rounded-full bg-gradient-to-b from-[#01C0D3] to-[#2059B6] flex items-center justify-center text-white">
              <img src={game} alt="game" className="h-7 w-7" />
            </button>
            <span>Game Suggestions</span>
          </li>
        </NavLink>

        <NavLink
          to="/group"
          className={({ isActive }) =>
            `flex items-center mb-4 p-2 rounded-lg transition duration-300 ease-in-out 
              ${isActive ? "bg-gray-700 text-blue-400" : "hover:bg-gray-700 hover:text-blue-400"}`
          }
        >
          <li className="flex items-center space-x-3 hover:bg-gray-700 rounded">
            <button className="w-8 h-8 rounded-full bg-gradient-to-b from-[#01C0D3] to-[#2059B6] flex items-center justify-center text-white">
              <img src={group} alt="group" className="h-6 w-7" />
            </button>
            <span>Groups</span>
          </li>
        </NavLink>

        {email && (
          <NavLink
            to="/save"
            className={({ isActive }) =>
              `flex items-center mb-4 p-2 rounded-lg transition duration-300 ease-in-out 
              ${isActive ? "bg-gray-700 text-blue-400" : "hover:bg-gray-700 hover:text-blue-400"}`
            }
          >
            <li className="flex items-center space-x-3 hover:bg-gray-700 rounded">
              <button className="w-8 h-8 rounded-full bg-gradient-to-b from-[#01C0D3] to-[#2059B6] flex items-center justify-center text-white">
                <img src={save} alt="save" className="h-6 w-6" />
              </button>
              <span>Saved Items</span>
            </li>
          </NavLink>
        )}

      </ul>
    </div>
  );
};

export default SideBar;
