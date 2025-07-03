import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import moment from "moment";
import { FaBookmark, FaRegBookmark, FaEllipsisH } from "react-icons/fa";
import fillBoost from "../images/fillboost.png";
import boostIcon from "../images/boost.png";
import commentIcon from "../images/comment.png";
import shareIcon from "../images/share.png";
import menuIcon from "../images/option.png";
import EmojiPicker from "emoji-picker-react";

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
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedContent, setEditedContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [hiddenReplies, setHiddenReplies] = useState({});
  const [shareMessage, setShareMessage] = useState("");
  const [boosted, setBoosted] = useState(false);
  const [boosts, setBoosts] = useState([]);
  const [showBoostList, setShowBoostList] = useState(false);
  const [animateBoost, setAnimateBoost] = useState(false);

  const commentInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const token = localStorage.getItem("token");

  const formatTime = (createdAt) => moment(createdAt).fromNow();

  const stripHtmlTags = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
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

  // boosts and comments
  useEffect(() => {
    if (!item.id) return;

    axios
      .get(`http://localhost:8080/api/boosts/${item.id}`)
      .then((res) => {
        setBoosts(res.data);
        const isBoosted = res.data.some(
          (b) => b.userEmail?.toLowerCase() === currentUserEmail?.toLowerCase()
        );
        setBoosted(isBoosted);
      })
      .catch(console.error);

    axios
      .get(`http://localhost:8080/api/comments/post/${item.id}`)
      .then((res) => setComments(res.data))
      .catch(console.error);
  }, [item.id, currentUserEmail]);

  const handleToggleBoost = () => {
    if (!token) {
      alert("Please login to boost.");
      window.location.href = "/login";
      return;
    }

    axios
      .post(
        `http://localhost:8080/api/boosts/toggle/${item.id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        const boostedNow = res.data.boosted;
        setBoosted(boostedNow);

        // 👉 Animate only when boosting
        if (boostedNow) {
          setAnimateBoost(true);
          setTimeout(() => setAnimateBoost(false), 300); // Remove after animation
        }

        return axios.get(`http://localhost:8080/api/boosts/${item.id}`);
      })
      .then((res) => {
        setBoosts(res.data);
      })
      .catch(console.error);
  };

  const fetchComments = () => {
    axios
      .get(`http://localhost:8080/api/comments/post/${item.id}`)
      .then((res) => setComments(res.data))
      .catch(console.error);
  };

  const handleAddComment = () => {
    if (!token) {
      alert("Please login to comment.");
      window.location.href = "/login";
      return;
    }
    if (!newComment.trim()) return;

    const payload = {
      postId: item.id,
      email: currentUserEmail,
      content: newComment.trim(),
      ...(replyingTo && { parentCommentId: replyingTo }),
    };

    axios.post(
        `http://localhost:8080/api/comments/${replyingTo ? "addReply" : "add"}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(() => {
        setNewComment("");
        setReplyingTo(null);
        setShowEmojiPicker(false);
        fetchComments();
      })
      .catch(console.error);
  };

  const handleEditComment = (id, content) => {
    axios
      .put(`http://localhost:8080/api/comments/edit/${id}`, { content }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setEditingCommentId(null);
        setEditedContent("");
        fetchComments();
      })
      .catch(console.error);
  };

  const handleDeleteComment = (id) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      axios
        .delete(`http://localhost:8080/api/comments/delete/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(fetchComments)
        .catch(console.error);
    }
  };

  const renderComment = (c, level = 0) => (
    <div key={c.id} className="mb-4" style={{ marginLeft: level > 0 ? 20 : 0 }}>
      <div className="flex space-x-2">
        <img
          src={c.userImage || "/default-avatar.png"}
          alt={c.userName || "User"}
          className="h-8 w-8 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="text-white font-semibold text-sm flex items-center space-x-2">
            <span>{c.userName || "Unknown"}</span>
            <span className="text-gray-400 text-xs flex items-center space-x-2">
              <span>{formatTime(c.createdAt)}</span>

              {c.email === currentUserEmail && (
                <div className="relative">
                  <button
                    onClick={() =>
                      setDropdownOpenId(dropdownOpenId === c.id ? null : c.id)
                    }
                  >
                    <FaEllipsisH className="text-gray-400 hover:text-white text-xs ml-4" />
                  </button>
                  {dropdownOpenId === c.id && (
                    <div className="absolute mt-1 p-1 w-24 bg-gray-800 text-sm text-white rounded shadow z-10">
                      <button
                        className="w-full px-2 py-1 hover:bg-gray-700 text-left"
                        onClick={() => {
                          setEditedContent(c.content);
                          setEditingCommentId(c.id);
                          setDropdownOpenId(null);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="w-full px-2 py-1 hover:bg-gray-700 text-left"
                        onClick={() => {
                          setDropdownOpenId(null);
                          handleDeleteComment(c.id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </span>
          </div>

          {editingCommentId === c.id ? (
            <div className="mt-1">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full p-1 text-sm bg-gray-700 text-white rounded resize-none"
                rows={1}
              />
              <div className="flex space-x-2 mt-1">
                <button
                  className="text-sm text-green-400"
                  onClick={() => handleEditComment(c.id, editedContent)}
                >
                  Save
                </button>
                <button
                  className="text-sm text-red-400"
                  onClick={() => setEditingCommentId(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-gray-300 text-sm mt-1">{c.content}</div>
          )}

          <div className="flex space-x-4 text-xs mt-1 text-blue-400">
            <button onClick={() => setReplyingTo(c.id)}>Reply</button>
            {c.replies?.length > 0 && (
              <button
                onClick={() =>
                  setHiddenReplies((prev) => ({
                    ...prev,
                    [c.id]: !prev[c.id],
                  }))
                }
              >
                {hiddenReplies[c.id] ? "Show replies" : "Hide replies"}
              </button>
            )}
          </div>

          {replyingTo === c.id && (
            <div className="mt-2">
              <textarea
                className="w-full rounded p-1 bg-gray-700 text-sm text-white resize-none"
                rows={1}
                placeholder="Write a reply..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <div className="flex justify-end space-x-2 mt-1">
                <button
                  onClick={() => setReplyingTo(null)}
                  className="text-red-400 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddComment}
                  className="bg-gradient-to-b from-[#2059B6] to-[#407CDE] hover:from-[#1A4EA2] hover:to-[#336BBF] text-white px-2 py-1 rounded text-sm"
                >
                  Reply
                </button>
              </div>
            </div>
          )}

          {c.replies?.length > 0 && !hiddenReplies[c.id] && (
            <div className="mt-3">
              {c.replies.map((reply) => renderComment(reply, level + 1))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const handleShare = () => {
    const postUrl = `${window.location.origin}/posts/${item.id}`;

    if (navigator.share) {
      navigator
        .share({
          title: item.title,
          url: postUrl,
        })
        .catch((error) => {
          console.error("Error sharing:", error);
        });
    } else {
      navigator.clipboard.writeText(postUrl).then(() => {
        setShareMessage("Link copied to clipboard!");
        setTimeout(() => setShareMessage(""), 2000);
      });
    }
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
        {dropdownOpenId === item.id && (
          <div
            ref={dropdownRef}
            className="absolute right-0 mt-2 w-40 bg-gradient-to-b from-[#222] to-[#444] text-white rounded shadow z-10"
          >
            {showMenu ? (
              <>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-600" onClick={onEdit}>Edit</button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-600" onClick={onDelete}>Delete</button>
              </>
            ) : (
              <>
                <button className="flex items-center w-full text-left px-4 py-2 hover:bg-gray-600" onClick={() => toggleSave(item.id)}>
                  {savedPostIds?.includes(item.id) ? <FaBookmark className="text-white mr-2" /> : <FaRegBookmark className="text-white mr-2" />}
                  {savedPostIds?.includes(item.id) ? "Unsave" : "Save"}
                </button>
                <button className="flex items-center w-full text-left px-4 py-2 hover:bg-gray-600">
                  <div className="bg-gray-100 rounded-full w-4 h-4 flex items-center justify-center text-black mr-2">!</div>
                  <span>Report</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Header */}
      <div className="flex items-center space-x-4 mb-2">
        <img
          src={profileImage || item.userImage}
          alt="User Avatar"
          className="h-10 w-10 rounded-full"
        />
        <div>
          <h2 className="font-semibold text-white">
            {profileName || item.userName}
          </h2>
          <p className="text-sm text-gray-400">{formatTime(item.createdAt)}</p>
        </div>
      </div>

      {/* Content */}
      <div
        onClick={() => item.type === "blog" && setOpenBlog?.(item)}
        className={`${item.type === "blog" ? "bg-gray-700 rounded-md p-2 mt-4 mb-4 cursor-pointer" : ""}`}
      >
        <p className={`mt-2 ${item.type === "blog" ? "text-bold" : "text-bold"}`}>
          {item.title}
        </p>
        <p className="text-sm text-blue-400">#{Array.isArray(item.tags) ? item.tags.join(", ") : ""}</p>
        {item.imageUrl && (
          /\.(mp4|webm|ogg)(\?.*)?$/.test(item.imageUrl) ? (
            <video controls className="w-full h-auto rounded my-2 mb-4">
              <source src={item.imageUrl} />
              Your browser does not support the video tag.
            </video>
          ) : (
            <img
              src={item.imageUrl}
              alt="Media"
              className={`object-cover rounded my-2 mb-4 ${item.type === "blog" ? "w-full h-40" : "w-full h-auto"}`}
            />
          )
        )}
        {item.type === "blog" && (
          <p className="mt-2 text-sm text-gray-300">
            {item.content &&
              (stripHtmlTags(item.content).length > 200
                ? stripHtmlTags(item.content).substring(0, 200) + "...see more"
                : stripHtmlTags(item.content))}
          </p>
        )}
      </div>

       {/* Action counts */}
      <div className="flex justify-between text-white font-thin text-sm px-2">
        <span
          className="cursor-pointer hover:underline"
          onClick={() => setShowBoostList(!showBoostList)}
        >
          {boosts.length} Boost{boosts.length !== 1 ? "s" : ""}
        </span>
        <span
          className="cursor-pointer hover:underline"
          onClick={() => setShowComments((prev) => !prev)}
        >
          {comments.length} Comment{comments.length !== 1 ? "s" : ""}
        </span>
      </div>

      <hr className="border-t border-white opacity-30 my-2" />

      {/* Action buttons */}
      <div className="flex justify-between text-white font-thin mb-2">
        <button onClick={handleToggleBoost} className="flex items-center space-x-1">
          <img
            src={boosted ? fillBoost : boostIcon}
            alt="boost"
            className={`w-7 h-7 transition-transform duration-300 ease-in-out ${animateBoost ? "scale-125" : "scale-100"}`}
          />
          <span>Boost</span>
        </button>
        <button
          className="flex items-center space-x-1 cursor-pointer"
          onClick={() => setShowComments((prev) => !prev)}
        >
          <img src={commentIcon} alt="comment" className="w-6 h-6" />
          <span>Comment</span>
        </button>
        <button
          className="flex items-center space-x-1 cursor-pointer"
          onClick={handleShare}
        >
          <img src={shareIcon} alt="share" className="w-6 h-6" />
          <span>Share</span>
        </button>

        {shareMessage && (
          <p className="text-green-400 text-sm mt-1">{shareMessage}</p>
        )}
      </div>

      {/* Comment Section */}
      {showComments && (
        <div className="mt-4 p-3 bg-gray-900 rounded max-h-96 overflow-y-auto">
          {!replyingTo && (
            <div className="relative flex items-start mb-4">
              <textarea
                ref={commentInputRef}
                className="flex-grow rounded p-1 bg-gray-700 text-white resize-none text-sm leading-snug"
                rows={1}
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
                type="button"
                onClick={() => setShowEmojiPicker((v) => !v)}
                className="ml-2 text-xl text-gray-400 hover:text-white"
              >
                😊
              </button>
              <button
                onClick={handleAddComment}
                className="bg-gradient-to-b from-[#2059B6] to-[#407CDE] hover:from-[#1A4EA2] hover:to-[#336BBF] text-white px-2 py-1 rounded text-sm"
              >
                Comment
              </button>

              {showEmojiPicker && (
                <div className="absolute top-full mt-2 right-0 z-20">
                  <EmojiPicker
                    onEmojiClick={(e) => setNewComment((c) => c + e.emoji)}
                    theme="dark"
                    height={350}
                    width={300}
                  />
                </div>
              )}
            </div>
          )}

          {comments.length === 0 ? (
            <p className="text-gray-400 text-sm">No comments yet.</p>
          ) : (
            [...comments].reverse().map((c) => renderComment(c))
          )}
        </div>
      )}

      {showBoostList && (
      <div className="bg-gray-900 p-2 rounded mt-2 max-h-48 overflow-y-auto">
        {boosts.map((b, index) => (
          <div key={b.id || b.email || index} className="flex items-center space-x-2 text-white text-sm mb-2">
            <img
              src={b.userImage || "/default-avatar.png"}
              className="h-8 w-8 rounded-full"
              alt={b.userName || "User"}
            />
            <span>{b.userName || "Unknown"}</span>
          </div>
        ))}
      </div>
    )}


    </div>
  );
};

export default FeedCard;
