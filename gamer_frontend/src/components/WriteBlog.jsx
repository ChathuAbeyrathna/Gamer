import { useState, useEffect } from "react";
import axios from "axios";
import { IoMdClose } from "react-icons/io";
import { storage } from "../firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import EmojiPicker from "emoji-picker-react";
import camera from '../images/camera.png';
import defaultProfile from '../images/defaultProfile.png';

/**
 * WriteBlogModal Component
 * 
 * Props:
 * - onClose: function to close the modal
 * - onBlogCreated: callback after blog is successfully created/updated
 * - editingBlog: object with blog data if editing, null if creating
 * - groupId: optional group ID to associate the blog with a group
 */
const WriteBlogModal = ({ onClose, onBlogCreated = () => { }, editingBlog = null, groupId = null }) => {

  // Blog state variables
  const [title, setTitle] = useState("");          // Blog title
  const [content, setContent] = useState("");      // Blog content (rich text)
  const [tags, setTags] = useState("");            // Selected tag from dropdown
  const [customTag, setCustomTag] = useState("");  // Custom tag if "Others" is selected
  const [image, setImage] = useState(null);        // Selected image file
  const [imageName, setImageName] = useState("");  // Display name of the selected image
  const [uploading, setUploading] = useState(false); // Flag for upload state
  const [userProfile, setUserProfile] = useState(null); // Logged-in user profile
  const [existingImageUrl, setExistingImageUrl] = useState(""); // Preloaded image URL when editing
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // Emoji picker toggle

  // Popup alert state variables
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  /**
   * Display a temporary popup alert
   * @param {string} msg - Message to display
   * @param {string} type - "success" or "error"
   */
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

  /**
   * useEffect to initialize modal: fetch user profile, preload blog data if editing
   * Also disables body scroll while modal is open
   */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    fetchUserProfile();

    // Preload blog data if editing
    if (editingBlog) {
      setTitle(editingBlog.title || "");
      setContent(editingBlog.content || "");
      setTags(editingBlog.tags?.[0] || "");
      setExistingImageUrl(editingBlog.imageUrl || "");

      if (editingBlog.imageUrl) {
        const nameFromUrl = decodeURIComponent(editingBlog.imageUrl.split("/").pop().split("?")[0]);
        setImageName(nameFromUrl);
      }
    }

    // Cleanup: restore body scroll on modal close
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [editingBlog]);

  /**
   * Fetch logged-in user's profile
   */
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

  /**
   * Upload selected image to Firebase Storage
   * @returns {string|null} URL of uploaded image
   */
  const handleImageUpload = async () => {
    if (!image) return existingImageUrl || null;
    setUploading(true);

    const imageRef = ref(storage, `gamer/${image.name}`);
    const uploadTask = uploadBytesResumable(imageRef, image);

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

  // Toggle emoji picker visibility
  const toggleEmojiPicker = () => setShowEmojiPicker((val) => !val);

  // Add selected emoji to blog title
  const onEmojiClick = (emojiObject) => setTitle((prev) => prev + emojiObject.emoji);

  /**
   * Submit blog: create or update
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!title.trim()) return showPopupMessage("Title is required!", "error");
    if (!tags) return showPopupMessage("Please select a blog tag!", "error");
    if (tags === "Others" && !customTag.trim()) return showPopupMessage("Please specify your custom tag!", "error");
    if (!userProfile) return showPopupMessage("User profile not loaded!", "error");

    try {
      // Upload image if new selected
      const imageUrl = await handleImageUpload();
      const finalTags = tags === "Others" ? [customTag] : [tags];

      const blogData = {
        title,
        content,
        tags: finalTags.map(tag => tag.trim()),
        imageUrl: imageUrl || null,
        email: userProfile.email,
        userName: userProfile.name,
        userImage: userProfile.imageUrl,
        groupId: groupId || null, // Optional group association
      };

      const token = localStorage.getItem("token");
      let response;

      if (editingBlog) {
        // Update existing blog
        response = await axios.put(`http://localhost:8080/api/blogs/edit/${editingBlog.id}`, blogData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showPopupMessage("Blog Updated Successfully!", "success");
      } else {
        // Create new blog
        response = await axios.post("http://localhost:8080/api/blogs/create", blogData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showPopupMessage("Blog Published Successfully!", "success");
      }

      // Reset form fields
      setTitle("");
      setTags("");
      setCustomTag("");
      setImage(null);

      // Notify parent component and close modal
      setTimeout(() => {
        onBlogCreated(response.data);
        onClose();
      }, 1500);

    } catch (error) {
      console.error("Error submitting blog:", error);
      showPopupMessage("Error submitting blog", "error");
    }
  };

  // Quill editor modules and formats
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ header: [1, 2, 3, false] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link', 'image',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 backdrop-blur overflow-y-auto">

      {/* Popup Alert */}
      {showPopup && (
        <div className="fixed bottom-1 left-1/2 transform -translate-x-1/2 z-[1000] w-[90%] max-w-md px-4">
          <div className={`text-white text-center text-sm rounded shadow-md animate-fade-in 
            ${popupType === "success" ? "bg-green-600" : "bg-red-600"}`}>
            {popupMessage}
          </div>
        </div>
      )}

      {/* Modal Container */}
      <div className="min-h-screen flex justify-center items-start py-10 px-4 m-20">
        <div className="bg-gray-800 p-6 rounded-lg text-white w-full max-w-[700px] shadow-lg relative">

          {/* Header */}
          <div className="flex justify-between items-center mb-2">
            <div className="flex justify-center items-center w-full">
              <h2 className="text-lg font-semibold">{editingBlog ? "Edit Blog" : "Write Blog"}</h2>
            </div>
            <button onClick={onClose}><IoMdClose size={24} /></button>
          </div>

          <hr className="border-t border-white opacity-50 my-2 mb-6" />

          {/* User Info */}
          <div className="flex items-center space-x-4 mb-4">
            {userProfile && (
              <>
                <img src={userProfile.imageUrl || defaultProfile} alt="User Avatar" className="h-10 w-10 rounded-full" />
                <h2 className="font-semibold">{userProfile.gamerName}</h2>
              </>
            )}
          </div>

          {/* Cover Image Upload */}
          <div className="w-full mt-3 p-3 bg-gray-800 rounded border border-white-600 flex items-center font-light h-18">
            <label className="flex-grow cursor-pointer flex justify-center items-center gap-3">
              <input type="file" className="hidden" onChange={(e) => {
                setImage(e.target.files[0]);
                setImageName(e.target.files[0].name);
              }} />
              {imageName ? imageName : "Add Cover Image"}
              <img src={camera} alt="Upload" className="w-6 h-6" />
            </label>
          </div>

          {/* Title Input with Emoji Picker */}
          <div className="relative mt-5">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 bg-transparent text-white text-lg font-bold outline-none pr-10"
              required
            />
            <button
              type="button"
              onClick={toggleEmojiPicker}
              className="absolute right-3 top-3 text-white text-xl select-none"
              aria-label="Toggle emoji picker"
            >
              😊
            </button>
            {showEmojiPicker && (
              <div className="absolute z-50 top-12 right-0">
                <EmojiPicker
                  onEmojiClick={onEmojiClick}
                  theme="dark"
                  height={350}
                  width={300}
                />
              </div>
            )}
          </div>

          {/* Quill Rich Text Editor */}
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            formats={formats}
            placeholder="Write your gamer blog……"
            className="bg-transparent text-white h-40 mt-3 mb-14 custom-quill"
          />

          {/* Blog Tag Selection */}
          <select
            className="w-full mt-3 p-3 bg-gray-800 rounded border border-white-600 text-white font-light cursor-pointer"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            required
          >
            <option value="">Select Blog Tag</option>
            <option value="Action Game">Action Game</option>
            <option value="Adventure Game">Adventure Game</option>
            <option value="RPG Game">RPG Game</option>
            <option value="Simulation Game">Simulation Game</option>
            <option value="Sports Game">Sports Game</option>
            <option value="Others">Others</option>
          </select>

          {/* Custom Tag Input */}
          {tags === "Others" && (
            <input
              type="text"
              placeholder="Specify your tag"
              className="w-full mt-3 p-3 bg-gray-800 rounded border border-white-600 text-white font-light"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              required
            />
          )}

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className={`w-60 mt-9 mb-5 py-1 px-6 bg-gradient-to-r from-[#0E2750] to-[#2059B6] text-white rounded-md font-semibold border border-white hover:from-[#0C2045] hover:to-[#1C4C9D] transition
              ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={handleSubmit}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : editingBlog ? "Update" : "Publish"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default WriteBlogModal;
