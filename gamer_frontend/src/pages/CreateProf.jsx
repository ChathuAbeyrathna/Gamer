import React, { useEffect, useState } from 'react';
import { storage } from '../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { getUserEmail } from "../authUtils";
import photo from '../images/photo.png';
import axios from 'axios';

const CreateProf = () => {
  const [image, setImage] = useState(null);
  const [fileName, setFileName] = useState('');
  const [gamerName, setGamerName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [showRoleOptions, setShowRoleOptions] = useState(false);
  const [customRole, setCustomRole] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const email = getUserEmail();

  useEffect(() => {
    const savedName = localStorage.getItem("newUserName");
    if (savedName) {
      setGamerName(savedName); // set default value to input
      localStorage.removeItem("newUserName"); // optional: remove after use
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/profile/${email}`);
        if (res.data) {
          setIsEditMode(true);
          setGamerName(res.data.gamerName || '');
          setBio(res.data.bio || '');
          setSelectedRoles(res.data.role || []);
          if (res.data.imageUrl) {
            setFileName(decodeURIComponent(res.data.imageUrl.split('/').pop().split('?')[0]));
          }
        }
      } catch (err) {
        console.log("No existing profile, creating new one");
      }
    };

    fetchProfile();
  }, [email]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setFileName(file?.name || '');
  };

  const handleRoleChange = (e) => {
    const value = e.target.value;
    setSelectedRoles((prev) =>
      prev.includes(value)
        ? prev.filter((r) => r !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let imageUrl = '';

    try {
      if (image) {
        const imageRef = ref(storage, `gamer/${image.name}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      } else if (isEditMode) {
        // Keep the existing image URL
        const res = await axios.get(`http://localhost:8080/api/profile/${email}`);
        imageUrl = res.data?.imageUrl || '';
      }

      const finalRoles = customRole && selectedRoles.includes("Other")
        ? [...selectedRoles.filter(r => r !== "Other"), customRole]
        : selectedRoles;

      const profileData = {
        email,
        gamerName,
        bio,
        role: finalRoles,
        imageUrl
      };

      if (isEditMode) {
        await axios.put('http://localhost:8080/api/profile/update', profileData);
      } else {
        await axios.post('http://localhost:8080/api/profile/create', profileData);
      }

      navigate('/profile');
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-14">
      <div className="w-full max-w-lg bg-gradient-to-r from-[#01C0D34C] to-[#2059B64C] p-12 rounded-lg shadow-lg">
        <h2 className="text-center text-white text-2xl font-semibold mb-8">
          {isEditMode ? 'Edit Your Gamer Profile' : 'Create Your Gamer Profile'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="border border-white/90 rounded-md p-4 flex items-center justify-center">
            <label htmlFor="profile-photo" className="cursor-pointer">
              <img src={photo} alt="Add profile" className="w-10 h-10 mx-auto" />
              <span className="text-white text-sm block mt-2">{fileName || 'Add a profile photo'}</span>
            </label>
            <input type="file" id="profile-photo" onChange={handleImageChange} className="hidden" />
          </div>

          {/* Gamer Name */}
          <input
            type="text"
            placeholder="Add a gamer name"
            value={gamerName}
            onChange={(e) => setGamerName(e.target.value)}
            className="w-full p-3 border border-white/90 rounded-md bg-transparent text-white placeholder-white/60"
          />

          {/* Gamer Bio */}
          <input
            type="text"
            placeholder="Add a gamer bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-3 border border-white/90 rounded-md bg-transparent text-white placeholder-white/60"
          />

          {/* Role Dropdown */}
          <div>
            <button
              type="button"
              onClick={() => setShowRoleOptions(!showRoleOptions)}
              className="w-full p-3 border border-white/90 rounded-md bg-transparent text-white text-left"
            >
              {selectedRoles.length === 0 ? 'Select gamer roles' : selectedRoles.join(' | ')}
            </button>

            {showRoleOptions && (
              <div className="mt-2 space-y-2 bg-gray-800 p-4 rounded-md border border-white/20">
                {["Player", "Streamer", "Developer", "Blogger", "Other"].map((role) => (
                  <label key={role} className="block text-white">
                    <input
                      type="checkbox"
                      value={role}
                      onChange={handleRoleChange}
                      checked={selectedRoles.includes(role)}
                      className="mr-2"
                    />
                    {role}
                  </label>
                ))}
                {selectedRoles.includes("Other") && (
                  <input
                    type="text"
                    placeholder="Enter your custom role"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    className="mt-2 w-full p-2 rounded bg-gray-700 text-white border border-white/20 placeholder-white/60"
                  />
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-40 mt-9 py-1 px-6 bg-gradient-to-r from-[#0E2750] to-[#2059B6] text-white rounded-md font-semibold border border-white hover:from-[#0E2750] hover:to-[#2059B6] mx-auto block"
            disabled={loading}
          >
            {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Profile' : 'Create Profile')}
          </button>

          {isEditMode && (
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="w-40 mt-3 py-1 px-6 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-md font-semibold border border-white hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-900 transition mx-auto block"
            >
              Cancel
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateProf;
