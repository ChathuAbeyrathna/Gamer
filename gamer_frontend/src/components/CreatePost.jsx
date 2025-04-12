import { useState, useEffect } from "react";
import axios from "axios";
import { IoMdClose } from "react-icons/io";
import { storage } from "../firebaseConfig"; // Import Firebase storage
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import user1 from '../images/user1.png';
import camera from '../images/camera.png';

const CreatePost = ({ onClose }) => {
    const [title, setTitle] = useState("");
    const [tags, setTags] = useState("");
    const [customTag, setCustomTag] = useState("");
    const [image, setImage] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
          document.body.style.overflow = 'auto';
        };
      }, []);

    const handleImageUpload = async () => {
        if (!image) return null; // Return null if no image is selected

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

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!title.trim()) {
            alert("Title is required!");
            return;
        }
    
        if (!tags) {
            alert("Please select a post tag!");
            return;
        }
    
        if (tags === "Others" && !customTag.trim()) {
            alert("Please specify your custom tag!");
            return;
        }
    
        try {
            const imageUrl = await handleImageUpload(); // Upload only if an image is selected
    
            const finalTags = tags === "Others" ? [customTag] : [tags];
    
            const postData = {
                title,
                tags: finalTags.map(tag => tag.trim()),
                imageUrl: imageUrl || null,
            };
    
            const token = localStorage.getItem("token");
    
            await axios.post("http://localhost:8080/api/posts/create", postData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
    
            alert("Post Created Successfully!");
            setTitle("");
            setTags("");
            setCustomTag("");
            setImage(null);
            onClose();
        } catch (error) {
            console.error("Error creating post:", error);
            alert("Error creating post");
        }
    };
    
    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 overflow-y-auto">
        <div className="min-h-screen flex justify-center items-start py-10 px-4 m-20">
            <div className="bg-gray-800 p-6 rounded-lg w-[500px] min-h-[550px] text-white shadow-lg transition-all duration-300">
                <div className="flex justify-between items-center">
                    <div className="flex justify-center items-center w-full">
                        <h2 className="text-lg font-semibold">Create Post</h2>
                    </div>                    
                    <button className=" text-white" onClick={onClose}>
                        <IoMdClose size={24} />
                    </button>
                </div>
                <hr className="border-t border-white opacity-50 my-2 mb-6" />

                <div className="flex items-center space-x-4">
                    <img src={user1} alt="User Avatar" className="h-10 w-10 rounded-full"/>
                    <div>
                        <h2 className="font-semibold">Megna Dewmini</h2>
                    </div>
                </div>

                {/* Title Input */}
                <textarea
                    placeholder="What's happening in your gaming world?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full h-40 mt-5 p-3 bg-gray-800 text-white rounded resize-none overflow-y-auto outline-none"
                    required
                />

                {/* Post Tag Dropdown */}
                <select
                    className="w-full mt-3 p-3 bg-gray-800 rounded border border-white-600 text-white font-light"
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

                {/* Show input field if 'Others' is selected */}
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

                {/* Image Upload (Optional) */}
                <div className="w-full mt-3 p-3 bg-gray-800 rounded border border-white-600 flex items-center font-light">
                    <label className="flex-grow cursor-pointer flex items-center gap-2">
                        <input type="file" className="hidden" onChange={(e) => setImage(e.target.files[0])} />
                        {image ? image.name : "Add Media"}
                        <img src={camera} alt="Upload" className="w-6 h-6 text-gray-400 ml-80"/>
                    </label>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center">
                    <button
                        type="submit"
                        className={`w-40 mt-9 py-1 px-6 bg-gradient-to-r from-[#0E2750] to-[#2059B6] text-white rounded-md font-semibold border border-white hover:bg-gradient-to-r hover:from-[#0E2750] hover:to-[#2059B6] transition mx-auto block
                            bg-gradient-to-r from-[#0E2750] to-[#2059B6] 
                            hover:from-[#0C2045] hover:to-[#1C4C9D]
                            ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={handleSubmit}
                        disabled={uploading}
                    >
                        {uploading ? "Uploading..." : "Post"}
                    </button>
                </div>
            </div>
        </div>
        </div>
    );
};

export default CreatePost;
