import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import moment from "moment";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import boost from "../images/fillboost.png";
import commentIcon from "../images/comment.png";
import share from "../images/share.png";
import menuIcon from "../images/option.png";

const FeedCard = ({
  item,
  dropdownOpenId,
  setDropdownOpenId,
  toggleSave,
  savedPostIds,
  setOpenBlog,
  customStyle = "",
  showMenu = false,
  onEdit,
  onDelete,
  profileImage,
  profileName,
  currentUserEmail,
}) => {
  const formatTime = (createdAt) => moment(createdAt).fromNow();
  const stripHtmlTags = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const commentInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpenId(null);
      }
    };

    if (dropdownOpenId === item.id) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpenId, item.id, setDropdownOpenId]);

  useEffect(() => {
    if (showComments) {
      axios
        .get(`http://localhost:8080/api/comments/post/${item.id}`)
        .then((res) => setComments(res.data))
        .catch((err) => console.error(err));
    }
  }, [showComments, item.id]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    axios
      .post("http://localhost:8080/api/comments/add", {
        postId: item.id,
        email: currentUserEmail,
        content: newComment.trim(),
      })
      .then(() => {
        setNewComment("");
        if (commentInputRef.current) commentInputRef.current.focus();
        return axios.get(`http://localhost:8080/api/comments/post/${item.id}`);
      })
      .then((res) => setComments(res.data))
      .catch((err) => console.error(err));
  };

  return (
    <div className={`bg-gray-800 p-4 rounded mb-6 relative w-full ${customStyle}`}>
      {/* Dropdown menu icon */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() =>
            setDropdownOpenId(dropdownOpenId === item.id ? null : item.id)
          }
        >
          <img src={menuIcon} alt="menu" className="h-5" />
        </button>

        {/* Dropdown menu */}
        {dropdownOpenId === item.id && (
          <div
            ref={dropdownRef}
            className="absolute right-0 mt-2 w-40 bg-gradient-to-b from-[#222] to-[#444] text-white rounded shadow z-10"
          >
            {showMenu ? (
              <>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-600"
                  onClick={onEdit}
                >
                  Edit
                </button>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-600"
                  onClick={onDelete}
                >
                  Delete
                </button>
              </>
            ) : (
              <>
                <button
                  className="flex items-center w-full text-left px-4 py-2 hover:bg-gray-600"
                  onClick={() => toggleSave(item.id)}
                >
                  {savedPostIds?.includes(item.id) ? (
                    <FaBookmark className="text-white mr-2" />
                  ) : (
                    <FaRegBookmark className="text-white mr-2" />
                  )}
                  {savedPostIds?.includes(item.id) ? "Unsave" : "Save"}{" "}
                  {item.type === "post" ? "Post" : "Blog"}
                </button>
                <button className="flex items-center w-full text-left px-4 py-2 hover:bg-gray-600">
                  <div className="bg-gray-100 rounded-full w-4 h-4 flex items-center justify-center text-black mr-2">
                    !
                  </div>
                  <span>Report Post</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Header */}
      <div className="flex items-center space-x-4">
        <img
          src={profileImage || item.userImage}
          alt="User Avatar"
          className="h-10 w-10 rounded-full"
        />
        <div>
          <h2 className="font-semibold">{profileName || item.userName}</h2>
          <p className="text-sm text-gray-400">{formatTime(item.createdAt)}</p>
        </div>
      </div>

      {/* Content */}
      <div
        onClick={() => item.type === "blog" && setOpenBlog?.(item)}
        className={`${item.type === "blog"
            ? "bg-gray-700 rounded-md p-2 mt-4 mb-4 cursor-pointer"
            : ""
          }`}
      >
        <p className="mt-2 font-semibold">{item.title}</p>
        <p className="text-sm text-blue-400">
          #{Array.isArray(item.tags) ? item.tags.join(", ") : ""}
        </p>

        {item.imageUrl &&
          (/\.(mp4|webm|ogg)(\?.*)?$/.test(item.imageUrl) ? (
            <video controls className="w-full h-auto rounded my-2 mb-4">
              <source src={item.imageUrl} />
              Your browser does not support the video tag.
            </video>
          ) : (
            <img
              src={item.imageUrl}
              alt="Media"
              className={`object-cover rounded my-2 mb-4 ${item.type === "blog" ? "w-full h-40" : "w-full h-auto"
                }`}
            />
          ))}

        {item.type === "blog" && (
          <p className="mt-2 text-sm text-gray-300">
            {item.content &&
              (stripHtmlTags(item.content).length > 200
                ? stripHtmlTags(item.content).substring(0, 200) + "...see more"
                : stripHtmlTags(item.content))}
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex justify-between text-white font-thin text-sm px-2">
        <span>24 Boosts</span>
        <span>{comments.length} Comments</span>
      </div>
      <hr className="border-t border-white opacity-30 my-2" />
      <div className="flex justify-between text-white font-thin mb-2">
        <button className="flex items-center space-x-1">
          <img src={boost} alt="boost" className="w-7 h-7" />
          <span>Boost</span>
        </button>
        <button
          className="flex items-center space-x-1 cursor-pointer"
          onClick={() => setShowComments((prev) => !prev)}
        >
          <img src={commentIcon} alt="comment" className="w-6 h-6" />
          <span>Comment</span>
        </button>
        <button className="flex items-center space-x-1">
          <img src={share} alt="share" className="w-6 h-6" />
          <span>Share</span>
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="mt-4 p-3 bg-gray-900 rounded max-h-80 overflow-y-auto">
          <div className="flex space-x-2 mb-4">
            <textarea
              ref={commentInputRef}
              className="flex-grow rounded p-2 bg-gray-700 text-white resize-none"
              rows={2}
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
            />
            <button
              onClick={handleAddComment}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded"
            >
              Post
            </button>
          </div>

          {comments.length === 0 ? (
            <p className="text-gray-400 text-sm">No comments yet.</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex space-x-3 mb-3">
                <img
                  src={c.userImage || "/default-avatar.png"}
                  alt={c.userName || "User"}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <div>
                  <div className="text-white font-semibold text-sm">
                    {c.userName || "Unknown User"}{" "}
                    <span className="text-gray-400 text-xs ml-2">
                      {moment(c.createdAt).fromNow()}
                    </span>
                  </div>
                  <div className="text-gray-300 text-sm">{c.content}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default FeedCard;
