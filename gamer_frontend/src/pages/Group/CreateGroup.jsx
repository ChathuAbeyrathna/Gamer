import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { storage } from '../../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import EmojiPicker from "emoji-picker-react";
import NavBar from "../../components/NavBar";
import photo from '../../images/photo.png';

/**
 * CreateGroup component
 * - Handles both creating a new group and editing an existing group
 * - Supports cover photo upload, group name, description, tags, and emoji pickers
 */
const CreateGroup = () => {
  const navigate = useNavigate();
  const { groupId } = useParams(); // Get groupId from URL if editing
  const token = localStorage.getItem("token"); // Auth token

  // Component state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverPhoto, setCoverPhoto] = useState(null); // Selected local file
  const [coverPhotoUrl, setCoverPhotoUrl] = useState(''); // Firebase URL
  const [creating, setCreating] = useState(false); // Loading state
  const [tags, setTags] = useState('');
  const [customTag, setCustomTag] = useState('');
  const [showNameEmojiPicker, setShowNameEmojiPicker] = useState(false);
  const [showDescEmojiPicker, setShowDescEmojiPicker] = useState(false);

  /**
   * If groupId exists, fetch group data for editing
   */
  useEffect(() => {
    if (groupId && token) {
      axios.get(`http://localhost:8080/api/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          const g = res.data;
          setName(g.name);
          setDescription(g.description);
          setCoverPhotoUrl(g.coverPhotoUrl);
          setTags(g.tags?.[0] || '');
          // Handle custom tags
          if (g.tags?.[0] && ![
            "Action Game", "Adventure Game", "RPG Game", "Simulation Game", "Sports Game"
          ].includes(g.tags[0])) {
            setTags("Others");
            setCustomTag(g.tags[0]);
          }
        })
        .catch(err => console.error("Error fetching group for edit:", err));
    }
  }, [groupId, token]);

  // Emoji picker toggles
  const toggleNameEmojiPicker = () => setShowNameEmojiPicker(prev => !prev);
  const toggleDescEmojiPicker = () => setShowDescEmojiPicker(prev => !prev);

  const onNameEmojiClick = (emojiData) => setName(prev => prev + emojiData.emoji);
  const onDescEmojiClick = (emojiData) => setDescription(prev => prev + emojiData.emoji);

  /**
   * Handle form submission for creating or updating a group
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    const email = localStorage.getItem("email");

    let newCoverPhotoUrl = coverPhotoUrl;
    // Upload cover photo to Firebase if changed
    if (coverPhoto) {
      const imageRef = ref(storage, `gamer/${coverPhoto.name}`);
      const snapshot = await uploadBytes(imageRef, coverPhoto);
      newCoverPhotoUrl = await getDownloadURL(snapshot.ref);
    }

    const finalTags = tags === "Others" ? [customTag] : [tags];

    const groupData = {
      name,
      description,
      coverPhotoUrl: newCoverPhotoUrl,
      tags: finalTags.map(tag => tag.trim()),
    };

    try {
      if (groupId) {
        // UPDATE existing group
        await axios.put(`http://localhost:8080/api/groups/${groupId}`, groupData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // CREATE new group
        await axios.post('http://localhost:8080/api/groups', {
          ...groupData,
          ownerEmail: email,
          memberEmails: [email],
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      navigate(`/yourgroups`); // Redirect after success
    } catch (err) {
      alert("Error saving group");
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  // Cancel and go back
  const handleCancel = () => navigate(-1);

  return (
    <div className="relative min-h-screen flex items-center justify-center p-8">
      <div className="fixed top-0 left-0 w-full h-full bg-gray-900 z-[-1]"></div>
      <NavBar />

      <div className="w-full max-w-lg bg-gradient-to-r from-[#01C0D34C] to-[#2059B64C] p-12 rounded-lg shadow-lg mt-24 mb-20">
        <h2 className="text-center text-white text-2xl font-semibold mb-8">
          {groupId ? 'Edit Group' : 'Create New Group'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cover photo upload */}
          <div className="border border-white/90 rounded-md p-4 flex items-center justify-center">
            <label htmlFor="cover-photo" className="cursor-pointer text-center">
              <img
                src={coverPhoto ? URL.createObjectURL(coverPhoto) : (coverPhotoUrl || photo)}
                alt="Add cover"
                className="mx-auto object-cover"
              />
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

          {/* Group name input with emoji picker */}
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Add a group name"
              required
              className="w-full p-3 pr-10 border border-white/90 rounded-md bg-transparent text-white placeholder-white/60 outline-none"
            />
            <button type="button" onClick={toggleNameEmojiPicker} className="absolute right-3 top-3">😊</button>

            {showNameEmojiPicker && (
              <div className="absolute z-50 top-14 right-0">
                <EmojiPicker onEmojiClick={onNameEmojiClick} theme="dark" height={350} width={300} />
              </div>
            )}
          </div>

          {/* Group description input with emoji picker */}
          <div className="relative">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description"
              required
              className="w-full p-3 pr-10 border border-white/90 rounded-md bg-transparent text-white placeholder-white/60 outline-none"
            />
            <button type="button" onClick={toggleDescEmojiPicker} className="absolute right-3 top-3">😊</button>

            {showDescEmojiPicker && (
              <div className="absolute z-50 top-14 right-0">
                <EmojiPicker onEmojiClick={onDescEmojiClick} theme="dark" height={350} width={300} />
              </div>
            )}
          </div>

          {/* Tag selection */}
          <select
            className="w-full p-3 border border-white/90 rounded-md bg-transparent text-white placeholder-white/60 outline-none cursor-pointer"
            style={{ backgroundColor: 'transparent' }}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            required
          >
            <option className="bg-gray-900" value="">Select Group Tag</option>
            <option className="bg-gray-900" value="Action Game">Action Game</option>
            <option className="bg-gray-900" value="Adventure Game">Adventure Game</option>
            <option className="bg-gray-900" value="RPG Game">RPG Game</option>
            <option className="bg-gray-900" value="Simulation Game">Simulation Game</option>
            <option className="bg-gray-900" value="Sports Game">Sports Game</option>
            <option className="bg-gray-900" value="Others">Others</option>
          </select>

          {/* Custom tag input if "Others" selected */}
          {tags === "Others" && (
            <input
              type="text"
              placeholder="Specify your custom tag"
              className="w-full mt-2 p-3 bg-transparent rounded border border-white text-white font-light outline-none"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              required
            />
          )}

          {/* Cancel & Submit buttons */}
          <div className="flex justify-between mt-6 gap-4">
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
              {creating ? (groupId ? "Updating..." : "Creating...") : (groupId ? "Update" : "Create")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroup;
