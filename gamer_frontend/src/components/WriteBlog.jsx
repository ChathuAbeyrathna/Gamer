import React, { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { FaBold, FaItalic, FaListUl, FaListOl, FaLink, FaImage } from "react-icons/fa";
import camera from '../images/camera.png';
import user1 from '../images/user1.png';

const WriteBlogModal = ({ onClose }) => {
  const [image, setImage] = useState(null);
  const [tags, setTags] = useState("");
  const [customTag, setCustomTag] = useState("");

  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 overflow-y-auto">
      <div className="min-h-screen flex justify-center items-start py-10 px-4 m-24">
        <div className="bg-gray-800 p-6 rounded-lg text-white w-full max-w-[700px] shadow-lg">
          
          <div className="flex justify-between items-center mb-2">
            <div className="flex justify-center items-center w-full">
                <h2 className="text-lg font-semibold">Write Blog</h2>
            </div>
            <button onClick={onClose}>
              <IoMdClose size={24} />
            </button>
          </div>

          <hr className="border-t border-white opacity-50 my-2 mb-6" />

          <div className="flex items-center space-x-4 mb-4">
            <img src={user1} alt="User Avatar" className="h-10 w-10 rounded-full" />
            <h2 className="font-semibold">Megna Dewmini</h2>
          </div>

          <div className="flex justify-center items-center gap-4 bg-gray-900 rounded-md p-2 mb-4">
            <select className="bg-transparent text-white outline-none">
              <option>Style</option>
              <option>Normal</option>
              <option>Heading</option>
            </select>
            <FaBold />
            <FaItalic />
            <FaListUl />
            <FaListOl />
            <FaLink />
            <FaImage />
          </div>

          <div className="w-full mt-3 p-3 bg-gray-800 rounded border border-white-600 flex items-center font-light h-18">
            <label className="flex-grow cursor-pointer flex items-center justify-center gap-4">
              <input type="file" className="hidden" onChange={(e) => setImage(e.target.files[0])} />
              {image ? image.name : "Add Cover Image"}
              <img src={camera} alt="Upload" className="w-6 h-6 text-gray-400" />
            </label>
          </div>

          <input
            type="text"
            placeholder="Title"
            className="w-full mt-5 p-3 bg-transparent text-white text-lg font-bold outline-none"
          />
          <textarea
            placeholder="Write your gamer blog……"
            className="w-full h-40 p-3 bg-transparent text-white resize-none outline-none"
          />

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
              className="w-60 mt-9 py-1 px-6 bg-gradient-to-r from-[#0E2750] to-[#2059B6] text-white rounded-md font-semibold border border-white hover:from-[#0C2045] hover:to-[#1C4C9D] transition"
            >
              Publish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WriteBlogModal;
