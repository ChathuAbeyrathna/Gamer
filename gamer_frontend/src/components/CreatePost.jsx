import { useState, useEffect } from "react";
import axios from "axios";
import { IoMdClose } from "react-icons/io";
import { storage } from "../firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import EmojiPicker from "emoji-picker-react";
import camera from '../images/camera.png';
import defaultProfile from '../images/defaultProfile.png';

/**
 * CreatePost Component
 * Allows creating a new post or editing an existing post.
 * Supports:
 * - Text title with emoji picker
 * - Tag selection (with custom tag option)
 * - Media upload (image/video via Firebase Storage)
 * - Popup messages for errors/success
 *
 * Props:
 * - onClose: function to close the modal
 * - onPostCreated: callback after successful post creation/edit
 * - editingPost: optional post object if editing
 * - groupId: optional group id to associate post with a group
 */
const CreatePost = ({ onClose, onPostCreated, editingPost = null, groupId = null }) => {
  const [title, setTitle] = useState(""); // Post content
  const [tags, setTags] = useState(""); // Selected tag
  const [customTag, setCustomTag] = useState(""); // Custom tag if "Others" is selected
  const [media, setMedia] = useState(null); // Uploaded media file
  const [mediaName, setMediaName] = useState(""); // File name for display
  const [uploading, setUploading] = useState(false); // Upload state
  const [userProfile, setUserProfile] = useState(null); // Logged-in user's profile
  const [existingMediaUrl, setExistingMediaUrl] = useState(""); // For editing post
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // Emoji picker visibility

  // Popup state
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState(""); // 'success' or 'error'
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Prevent background scroll while modal is open
    document.body.style.overflow = 'hidden';

    // Fetch user profile on mount
    fetchUserProfile();

    // Pre-fill fields if editing an existing post
    if (editingPost) {
      setTitle(editingPost.title || "");
      setTags(editingPost.tags?.[0] || "");
      setExistingMediaUrl(editingPost.imageUrl || "");
      if (editingPost.imageUrl) {
        const nameFromUrl = decodeURIComponent(editingPost.imageUrl.split("/").pop().split("?")[0]);
        setMediaName(nameFromUrl);
      }
    }

    return () => {
      document.body.style.overflow = 'auto'; //Cleans up on unmount (restores scrolling)
    };
  }, [editingPost]);

  // Fetch user profile from backend
  const fetchUserProfile = async () => {
    const email = localStorage.getItem("email");
    if (!email) return;

    try {
      const res = await axios.get(`http://localhost:8080/api/profile/${email}`);
      setUserProfile(res.data);
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  // Show temporary popup messages
  const showPopupMessage = (msg, type) => {
    setPopupMessage(msg);
    setPopupType(type);
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
      setPopupMessage("");
      setPopupType("");
    }, 3000);
  };

  // Handle media file upload to Firebase Storage
  const handleMediaUpload = async () => {
    if (!media) return existingMediaUrl || null;

    const fileType = media.type;
    if (!fileType.startsWith("image/") && !fileType.startsWith("video/")) {
      showPopupMessage("Only image and video files are allowed!", "error");
      return null;
    }

    setUploading(true);
    const mediaRef = ref(storage, `gamer/${media.name}`);
    const uploadTask = uploadBytesResumable(mediaRef, media);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        null,
        (error) => {
          console.error("Upload Error:", error);
          setUploading(false);
          showPopupMessage("Upload failed!", "error");
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setUploading(false);
          resolve(downloadURL);
        }
      );
    });
  };

  // Toggle emoji picker
  const toggleEmojiPicker = () => setShowEmojiPicker(val => !val);

  // Insert selected emoji into title
  const onEmojiClick = (emojiObject) => {
    setTitle(prev => prev + emojiObject.emoji);
  };

  // Submit post or edit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!title.trim()) return showPopupMessage("Title is required!", "error");
    if (!tags) return showPopupMessage("Please select a post tag!", "error");
    if (tags === "Others" && !customTag.trim()) return showPopupMessage("Please specify your custom tag!", "error");
    if (!userProfile) return showPopupMessage("User profile not loaded!", "error");

    try {
      const mediaUrl = await handleMediaUpload();
      const finalTags = tags === "Others" ? [customTag] : [tags];

      const postData = {
        title,
        tags: finalTags.map(tag => tag.trim()),
        imageUrl: mediaUrl || null,
        email: userProfile.email,
        userName: userProfile.name,
        userImage: userProfile.imageUrl,
        groupId: groupId || null
      };

      const token = localStorage.getItem("token");
      let response;

      if (editingPost) {
        // Edit existing post
        response = await axios.put(`http://localhost:8080/api/posts/edit/${editingPost.id}`, postData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showPopupMessage("Post updated successfully..!", "success");
      } else {
        // Create new post
        response = await axios.post("http://localhost:8080/api/posts/create", postData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showPopupMessage("Post created successfully..!", "success");
      }

      // Reset fields
      setTitle(""); setTags(""); setCustomTag(""); setMedia(null);

      // Callback and close after short delay
      setTimeout(() => {
        onPostCreated(response.data);
        onClose();
      }, 1500);

    } catch (error) {
      console.error("Error submitting post:", error);
      showPopupMessage("Error submitting post", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 backdrop-blur overflow-y-auto">
      {/* Popup message */}
      {showPopup && (
        <div className="fixed bottom-[50px] left-1/2 transform -translate-x-1/2 z-[1000] w-[90%] max-w-md px-2">
          <div className={`text-white text-center text-sm rounded shadow-md animate-fade-in 
            ${popupType === "success" ? "bg-green-600" : "bg-red-600"}`}>
            {popupMessage}
          </div>
        </div>
      )}

      {/* Centered form modal */}
      <div className="min-h-screen flex justify-center items-start py-6 px-2 sm:px-4 mt-24 mb-20">
        <div className="bg-gray-800 p-4 sm:p-6 rounded-lg w-full max-w-[500px] min-h-[550px] text-white shadow-lg">

          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">{editingPost ? "Edit Post" : "Create Post"}</h2>
            <button onClick={onClose}><IoMdClose size={24} /></button>
          </div>
          <hr className="border-t border-white opacity-50 my-2 mb-6" />

          {/* User info */}
          <div className="flex items-center gap-4 mb-3">
            {userProfile && (
              <>
                <img src={userProfile.imageUrl || defaultProfile} alt="User Avatar" className="h-10 w-10 rounded-full" />
                <div><h2 className="font-semibold text-base sm:text-lg">{userProfile.gamerName}</h2></div>
              </>
            )}
          </div>

          {/* Text area with emoji */}
          <div className="relative">
            <textarea
              placeholder="What's happening in your gaming world?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-32 sm:h-40 mt-3 p-3 bg-gray-800 text-white rounded resize-none pr-10 outline-none"
              required
            />
            <button type="button" onClick={toggleEmojiPicker} className="absolute right-3 top-3">😊</button>

            {showEmojiPicker && (
              <div className="absolute z-50 top-16 right-0">
                <EmojiPicker onEmojiClick={onEmojiClick} theme="dark" height={350} width={300} />
              </div>
            )}
          </div>

          {/* Tag selection */}
          <select
            className="w-full mt-3 p-3 bg-gray-800 rounded border border-white text-white cursor-pointer"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            required
          >
            <option value="">Select Post Tag</option>
            <option value="Action Game">Action Game</option>
            <option value="Adventure Game">Adventure Game</option>
            <option value="RPG Game">RPG Game</option>
            <option value="Simulation Game">Simulation Game</option>
            <option value="Sports Game">Sports Game</option>
            <option value="Others">Others</option>
          </select>

          {/* Custom tag input */}
          {tags === "Others" && (
            <input
              type="text"
              placeholder="Specify your tag"
              className="w-full mt-3 p-3 bg-gray-800 rounded border border-white text-white"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              required
            />
          )}

          {/* Media upload */}
          <div className="w-full mt-3 p-3 bg-gray-800 rounded border border-white flex items-center">
            <label className="flex-grow cursor-pointer flex items-center gap-2">
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => {
                  setMedia(e.target.files[0]);
                  setMediaName(e.target.files[0].name);
                }}
              />
              {mediaName ? mediaName : "Add Media"}
              <img src={camera} alt="Upload" className="w-6 h-6 ml-auto" />
            </label>
          </div>

          {/* Submit button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className={`w-full sm:w-40 mt-9 py-2 px-6 bg-gradient-to-r from-[#0E2750] to-[#2059B6] text-white rounded-md font-semibold border border-white ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={handleSubmit}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : editingPost ? "Update" : "Post"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CreatePost;
