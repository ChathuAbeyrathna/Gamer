import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook from React Router
import NavBar from "../../components/NavBar";
import photo from '../../images/photo.png';

const CreateGroup = () => {
  const navigate = useNavigate(); // Initialize the navigate function

  const handleCancel = () => {
    navigate('/group'); // Navigate to the group page
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <NavBar />

      <div className="w-full max-w-lg h-auto bg-gradient-to-r from-[#01C0D34C] to-[#2059B64C] p-12 rounded-lg shadow-lg mt-20">
        <h2 className="text-center text-white text-2xl font-semibold mb-8">Create New Group</h2>

        <form className="space-y-6">
          <div className="border border-white/90 rounded-md p-4 flex items-center justify-center">
            <label htmlFor="profile-photo" className="cursor-pointer">
              <img 
                src={photo}
                alt="Add a profile" 
                className="w-10 h-10 mx-auto" 
              />
              <span className="text-white text-sm block mt-2">Add a cover photo</span>
            </label>
            <input 
              type="file" 
              id="profile-photo" 
              className="hidden"
            />
          </div>
         
          <div>
            <input 
              type="text" 
              placeholder="Add a group name" 
              className="w-full p-3 border border-white/90 rounded-md bg-transparent text-white placeholder-white/60 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <input 
              type="text" 
              placeholder="Add a description" 
              className="w-full p-3 border border-white/90 rounded-md bg-transparent text-white placeholder-white/60 outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-between mt-9">
            {/* Cancel Button */}
            <button 
                type="button" 
                onClick={handleCancel} 
                className="w-40 py-1 px-6 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-md font-semibold border border-white hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-900 transition"
                >
                Cancel
            </button>
            {/* Create Button */}
            <button 
              type="submit" 
              className="w-40 py-1 px-6 bg-gradient-to-r from-[#0E2750] to-[#2059B6] text-white rounded-md font-semibold border border-white hover:bg-gradient-to-r hover:from-[#0E2750] hover:to-[#2059B6] transition"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateGroup;
