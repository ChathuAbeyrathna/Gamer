import { useState } from "react";
import axios from "axios";
import { storage } from "../firebaseConfig"; // Import Firebase storage
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const CreatePost = () => {
    const [title, setTitle] = useState("");
    const [tags, setTags] = useState("");
    const [image, setImage] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleImageUpload = async () => {
        if (!image) {
            alert("Please select an image!");
            return null;
        }
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

        try {
            const imageUrl = await handleImageUpload();
            if (!imageUrl) return;

            const postData = {
                title,
                tags: tags.split(",").map(tag => tag.trim()),
                imageUrl,
            };

            await axios.post("http://localhost:8080/api/posts/create", postData);
            alert("Post Created Successfully!");
            setTitle("");
            setTags("");
            setImage(null);
        } catch (error) {
            console.error("Error creating post:", error);
            alert("Error creating post");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-gray-800 text-white rounded-lg">
            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 mb-2 border border-gray-700 rounded"
                required
            />
            <input
                type="text"
                placeholder="Tags (comma separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full p-2 mb-2 border border-gray-700 rounded"
            />
            <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="w-full p-2 mb-2 border border-gray-700 rounded"
                required
            />
            <button
                type="submit"
                className={`w-full p-2 bg-blue-600 rounded ${uploading ? "opacity-50" : ""}`}
                disabled={uploading}
            >
                {uploading ? "Uploading..." : "Publish Post"}
            </button>
        </form>
    );
};

export default CreatePost;
