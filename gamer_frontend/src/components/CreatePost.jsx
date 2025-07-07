import { useState, useEffect } from "react";
import axios from "axios";
import { IoMdClose } from "react-icons/io";
import { storage } from "../firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import camera from '../images/camera.png';
import EmojiPicker from "emoji-picker-react";

const CreatePost = ({ onClose, onPostCreated, editingPost = null }) => {
    const [title, setTitle] = useState("");
    const [tags, setTags] = useState("");
    const [customTag, setCustomTag] = useState("");
    const [media, setMedia] = useState(null);
    const [mediaName, setMediaName] = useState("");
    const [uploading, setUploading] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [existingMediaUrl, setExistingMediaUrl] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        fetchUserProfile();
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
            document.body.style.overflow = 'auto';
        };
    }, [editingPost]);

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

    const handleMediaUpload = async () => {
        if (!media) return existingMediaUrl || null;

        const fileType = media.type;
        if (!fileType.startsWith("image/") && !fileType.startsWith("video/")) {
            alert("Only image and video files are allowed!");
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
      setShowEmojiPicker(val => !val);
    };

    const onEmojiClick = (emojiObject) => {
      setTitle(prev => prev + emojiObject.emoji);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim()) return alert("Title is required!");
        if (!tags) return alert("Please select a post tag!");
        if (tags === "Others" && !customTag.trim()) return alert("Please specify your custom tag!");
        if (!userProfile) return alert("User profile not loaded!");

        try {
            const mediaUrl = await handleMediaUpload();
            const finalTags = tags === "Others" ? [customTag] : [tags];

            const postData = {
                title,
                tags: finalTags.map(tag => tag.trim()),
                imageUrl: mediaUrl || null,
                email: userProfile.email,
                userName: userProfile.name,
                userImage: userProfile.imageUrl
            };

            const token = localStorage.getItem("token");

            let response;
            if (editingPost) {
                response = await axios.put(`http://localhost:8080/api/posts/edit/${editingPost.id}`, postData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Post Updated Successfully!");
            } else {
                response = await axios.post("http://localhost:8080/api/posts/create", postData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Post Created Successfully!");
            }

            onPostCreated(response.data);
            setTitle(""); setTags(""); setCustomTag(""); setMedia(null);
            onClose();
        } catch (error) {
            console.error("Error submitting post:", error);
            alert("Error submitting post");
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 backdrop-blur overflow-y-auto">
            <div className="min-h-screen flex justify-center items-start py-10 px-4 m-20">
                <div className="bg-gray-800 p-6 rounded-lg w-[500px] min-h-[550px] text-white shadow-lg transition-all duration-300">
                    <div className="flex justify-between items-center">
                        <div className="flex justify-center items-center w-full">
                            <h2 className="text-lg font-semibold">{editingPost ? "Edit Post" : "Create Post"}</h2>
                        </div>
                        <button className="text-white" onClick={onClose}><IoMdClose size={24} /></button>
                    </div>
                    <hr className="border-t border-white opacity-50 my-2 mb-6" />

                    <div className="flex items-center space-x-4 mb-3">
                        {userProfile && (
                            <>
                                <img src={userProfile.imageUrl} alt="User Avatar" className="h-10 w-10 rounded-full" />
                                <div><h2 className="font-semibold">{userProfile.gamerName}</h2></div>
                            </>
                        )}
                    </div>

                    {/* Title textarea with emoji picker */}
                    <div className="relative">
                        <textarea
                            placeholder="What's happening in your gaming world?"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full h-40 mt-3 p-3 bg-gray-800 text-white rounded resize-none overflow-y-auto outline-none pr-10"
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
                          <div className="absolute z-50 top-16 right-0">
                            <EmojiPicker
                              onEmojiClick={onEmojiClick}
                              theme="dark"
                              height={350}
                              width={300}
                            />
                          </div>
                        )}
                    </div>

                    <select
                        className="w-full mt-3 p-3 bg-gray-800 rounded border border-white-600 text-white font-light cursor-pointer"
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

                    <div className="w-full mt-3 p-3 bg-gray-800 rounded border border-white-600 flex items-center font-light">
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

                    <div className="flex justify-center">
                        <button
                            type="submit"
                            className={`w-40 mt-9 py-1 px-6 bg-gradient-to-r from-[#0E2750] to-[#2059B6] text-white rounded-md font-semibold border border-white hover:bg-gradient-to-r hover:from-[#0C2045] hover:to-[#1C4C9D] transition mx-auto
                                ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
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
