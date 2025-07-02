import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { storage } from '../../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import NavBar from "../../components/NavBar";
import photo from '../../images/photo.png';

const CreateGroup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);

    const email = localStorage.getItem("email");

    let coverPhotoUrl = "";
    if (coverPhoto) {
      const imageRef = ref(storage, `gamer/${coverPhoto.name}`);
      const snapshot = await uploadBytes(imageRef, coverPhoto);
      coverPhotoUrl = await getDownloadURL(snapshot.ref);
    }

    const groupData = {
      name,
      description,
      coverPhotoUrl,
      ownerEmail: email,
      memberEmails: [email]
    };

    try {
      await axios.post('http://localhost:8080/api/groups', groupData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Group created!");
      navigate('/group');
    } catch (err) {
      alert("Error creating group");
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleCancel = () => {
    navigate('/group');
  };

  const token = localStorage.getItem("token");

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <NavBar />
      <div className="w-full max-w-lg bg-gradient-to-r from-[#01C0D34C] to-[#2059B64C] p-12 rounded-lg shadow-lg mt-20">
        <h2 className="text-center text-white text-2xl font-semibold mb-8">Create New Group</h2>

        <form onSubmit={handleCreate} className="space-y-6">
          <div className="border border-white/90 rounded-md p-4 flex items-center justify-center">
            <label htmlFor="cover-photo" className="cursor-pointer">
              <img src={photo} alt="Add cover" className="w-10 h-10 mx-auto" />
              <span className="text-white text-sm block mt-2">Add a cover photo</span>
            </label>
            <input
              type="file"
              id="cover-photo"
              accept="image/*"
              className="hidden"
              onChange={(e) => setCoverPhoto(e.target.files[0])}
            />
          </div>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Add a group name"
            required
            className="w-full p-3 border border-white/90 rounded-md bg-transparent text-white placeholder-white/60 outline-none"
          />

          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description"
            required
            className="w-full p-3 border border-white/90 rounded-md bg-transparent text-white placeholder-white/60 outline-none"
          />

          <div className="flex justify-between mt-9">
            <button
              type="button"
              onClick={handleCancel}
              className="w-40 py-1 px-6 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-md font-semibold border border-white hover:from-gray-700 hover:to-gray-900 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="w-40 py-1 px-6 bg-gradient-to-r from-[#0E2750] to-[#2059B6] text-white rounded-md font-semibold border border-white"
            >
              {creating ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroup;
