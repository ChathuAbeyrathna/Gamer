import React, { useState, useEffect } from "react";
import axios from "axios";
import { IoMdClose } from "react-icons/io";
import { storage } from "../firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import EmojiPicker from "emoji-picker-react";
import camera from '../images/camera.png';
import defaultProfile from '../images/defaultProfile.png';

const WriteBlogModal = ({ onClose, onBlogCreated = () => {}, editingBlog = null, groupId = null }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [customTag, setCustomTag] = useState("");
  const [image, setImage] = useState(null);
  const [imageName, setImageName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("");
  const [showPopup, setShowPopup] = useState(false);

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

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    fetchUserProfile();

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

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [editingBlog]);

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

  const toggleEmojiPicker = () => {
    setShowEmojiPicker((val) => !val);
  };

  const onEmojiClick = (emojiObject) => {
    setTitle((prev) => prev + emojiObject.emoji);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) return showPopupMessage("Title is required!", "error");
    if (!tags) return showPopupMessage("Please select a blog tag!", "error");
    if (tags === "Others" && !customTag.trim()) return showPopupMessage("Please specify your custom tag!", "error");
    if (!userProfile) return showPopupMessage("User profile not loaded!", "error");

    try {
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
        groupId: groupId || null // ✅ Add groupId
      };

      const token = localStorage.getItem("token");

      let response;
      if (editingBlog) {
        response = await axios.put(`http://localhost:8080/api/blogs/edit/${editingBlog.id}`, blogData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showPopupMessage("Blog Updated Successfully..!", "success");
      } else {
        response = await axios.post("http://localhost:8080/api/blogs/create", blogData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showPopupMessage("Blog Published Successfully..!", "success");
      }

      setTitle("");
      setTags("");
      setCustomTag("");
      setImage(null);

      setTimeout(() => {
        onBlogCreated(response.data);
        onClose();
      }, 1500);

    } catch (error) {
      console.error("Error submitting blog:", error);
      showPopupMessage("Error submitting blog", "error");
    }
  };

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

      <div className="min-h-screen flex justify-center items-start py-10 px-4 m-20">
        <div className="bg-gray-800 p-6 rounded-lg text-white w-full max-w-[700px] shadow-lg relative">
          <div className="flex justify-between items-center mb-2">
            <div className="flex justify-center items-center w-full">
              <h2 className="text-lg font-semibold">{editingBlog ? "Edit Blog" : "Write Blog"}</h2>
            </div>
            <button onClick={onClose}><IoMdClose size={24} /></button>
          </div>

          <hr className="border-t border-white opacity-50 my-2 mb-6" />

          <div className="flex items-center space-x-4 mb-4">
            {userProfile && (
              <>
                <img src={userProfile.imageUrl || defaultProfile} alt="User Avatar" className="h-10 w-10 rounded-full" />
                <h2 className="font-semibold">{userProfile.gamerName}</h2>
              </>
            )}
          </div>

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

          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            formats={formats}
            placeholder="Write your gamer blog……"
            className="bg-transparent text-white h-40 mt-3 mb-14 custom-quill"
          />

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
