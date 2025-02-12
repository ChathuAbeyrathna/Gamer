import React from 'react';
import photo from '../images/photo.png';
import NavBar from "../components/NavBar";

const CreateProf = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <NavBar/>
      <div className="w-full max-w-lg h-auto bg-gradient-to-r from-[#01C0D34C] to-[#2059B64C] p-12 rounded-lg shadow-lg mt-20">
      <h2 className="text-center text-white text-2xl font-semibold mb-8">Create Your Gamer Profile</h2>

        <form className="space-y-6">
          {/* Profile Photo */}
          <div className="border border-white/90 rounded-md p-4 flex items-center justify-center">
            <label htmlFor="profile-photo" className="cursor-pointer">
              <img 
                src={photo}
                alt="Add a profile" 
                className="w-10 h-10 mx-auto" 
              />
              <span className="text-white text-sm block mt-2">Add a profile photo</span>
            </label>
            <input 
              type="file" 
              id="profile-photo" 
              className="hidden"
              // You can add the onChange handler for uploading the image
            />
          </div>
         
          {/* Gamer Name */}
          <div>
            <input 
              type="text" 
              placeholder="Add a gamer name" 
              className="w-full p-3 border border-white/90 rounded-md bg-transparent text-white placeholder-white/60 outline-none focus:border-blue-500"
            />
          </div>

          {/* Gamer Bio */}
          <div>
            <input 
              type="text" 
              placeholder="Add a gamer bio" 
              className="w-full p-3 border border-white/90 rounded-md bg-transparent text-white placeholder-white/60 outline-none focus:border-blue-500"
            />
          </div>

          {/* Gamer Roles */}
          <div>
            <select 
              className="w-full p-3 border border-white/90 rounded-md bg-transparent text-white outline-none focus:border-blue-500"
            >
              <option className="bg-gray-800" value="" disabled selected>Select gamer roles</option>
              <option className="bg-gray-800" value="player">Player</option>
              <option className="bg-gray-800" value="streamer">Streamer</option>
              <option className="bg-gray-800" value="developer">Developer</option>
              <option className="bg-gray-800" value="blogger">Blogger</option>
              <option className="bg-gray-800" value="blogger">Other</option>
            </select>
          </div>

          <div>
            {/* Submit Button */}
            <button 
              type="submit" 
              className="w-40 mt-9 py-1 px-6 bg-gradient-to-r from-[#0E2750] to-[#2059B6] text-white rounded-md font-semibold border border-white hover:bg-gradient-to-r hover:from-[#0E2750] hover:to-[#2059B6] transition mx-auto block"
            >
              Create Profile
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default CreateProf;
