import React from "react";
import NavBar from "../../components/NavBar";
import Sidebar from "../../components/SideBar";

const Suggest = () => {

  return (
    <div className="bg-gray-900 text-white min-h-screen"> 
      <NavBar/>
      
        <div className="container mx-auto flex mt-4 space-x-4 px-4">
            {/* Sidebar */}
            <div className="w-1/4">
            <Sidebar />
            </div>

            {/* Main Content */}
            <div className="w-full flex flex-col m-28">
            <h2 className="text-3xl ml-40 self-start">Categories</h2>

  <div className="flex flex-col space-y-6 w-3/4 mt-10 ml-40">
    <div className="flex items-center space-x-4 bg-black p-4 rounded-md">
      <span className="text-2xl">🎯</span>
      <span className="text-lg font-semibold">Action Game</span>
    </div>
    <div className="flex items-center space-x-4 bg-black p-4 rounded-md">
      <span className="text-2xl">🏹</span>
      <span className="text-lg font-semibold">Adventure Game</span>
    </div>
    <div className="flex items-center space-x-4 bg-black p-4 rounded-md">
      <span className="text-2xl">🎮</span>
      <span className="text-lg font-semibold">RPG Game</span>
    </div>
    <div className="flex items-center space-x-4 bg-black p-4 rounded-md">
      <span className="text-2xl">🧑‍🏫</span>
      <span className="text-lg font-semibold">Simulation Game</span>
    </div>
    <div className="flex items-center space-x-4 bg-black p-4 rounded-md">
      <span className="text-2xl">🏓</span>
      <span className="text-lg font-semibold">Sports Game</span>
    </div>
    <div className="flex items-center space-x-4 bg-black p-4 rounded-md">
      <span className="text-2xl">🏆</span>
      <span className="text-lg font-semibold">Others</span>
    </div>
  </div>
</div>

        </div>
    </div>
  );
};

export default Suggest;
