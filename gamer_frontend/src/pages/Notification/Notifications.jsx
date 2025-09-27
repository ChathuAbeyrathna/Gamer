import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Sidebar from "../../components/SideBar";
import FeedCard from "../../components/FeedCard";
import ViewBlog from "../../components/ViewBlog";
import axios from "axios";
import moment from "moment";

/**
 * Notifications Page Component
 * - Displays all notifications for the logged-in user.
 * - Handles opening posts/blogs in a modal and marking notifications as read.
 *
 * Props:
 *  - userId: string | number
 *      The ID of the logged-in user, used for fetching user-specific notifications.
 */
const Notifications = ({ userId }) => {
  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [modalItem, setModalItem] = useState(null);       // Selected post/blog for modal view
  const [openBlog, setOpenBlog] = useState(null);         // Selected blog for blog modal
  const [openCommentSection, setOpenCommentSection] = useState(false);
  const [openBoostSection, setOpenBoostSection] = useState(false);

  const navigate = useNavigate();

  /**
   * Fetch notifications when the component mounts
   * - Stores the last seen timestamp in localStorage
   */
  useEffect(() => {
    window.scrollTo(0, 0);
    localStorage.setItem("notificationsLastSeenAt", new Date().toISOString());

    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : { withCredentials: true };

        const res = await axios.get("http://localhost:8080/api/notifications", config);
        setNotifications(res.data);
      } catch (err) {
        console.error("Error fetching notifications", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  /**
   * Lock scroll when modal or blog is open
   */
  useEffect(() => {
    if (modalItem || openBlog) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [modalItem, openBlog]);

  /**
   * Mark a notification as read in the backend
   */
  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : { withCredentials: true };

      await axios.patch(`http://localhost:8080/api/notifications/${id}/read`, {}, config);
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  /**
   * Fetch a post or blog by ID and open in modal
   */
  const openItemModal = async (id, shouldOpenComment = false, shouldOpenBoost = false) => {
    try {
      const token = localStorage.getItem("token");
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : { withCredentials: true };

      // Reset previous modal state
      setModalItem(null);
      setOpenBlog(null);
      setOpenCommentSection(false);
      setOpenBoostSection(false);

      try {
        // Try fetching as a post first
        const postRes = await axios.get(`http://localhost:8080/api/posts/${id}`, config);
        setModalItem({ ...postRes.data, type: "post" });
      } catch (postErr) {
        // If post not found, try fetching as a blog
        if (postErr.response && postErr.response.status === 404) {
          const blogRes = await axios.get(`http://localhost:8080/api/blogs/${id}`, config);
          setModalItem({ ...blogRes.data, type: "blog" });
        } else {
          throw postErr;
        }
      }

      // Open optional sections
      setOpenCommentSection(shouldOpenComment);
      setOpenBoostSection(shouldOpenBoost);
    } catch (err) {
      console.error("Error fetching item (post/blog):", err);
    }
  };

  /**
   * Handle notification click
   * - Marks notification as read
   * - Opens post/blog modal or navigates to sender profile
   */
  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);

    // Optimistically update read status in UI
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
    );

    // Open modal for comment/boost notifications
    if ((notification.type === "COMMENT" || notification.type === "COMMENT_REPLY" || notification.type === "BOOST") && notification.postId) {
      openItemModal(
        notification.postId,
        notification.type === "COMMENT" || notification.type === "COMMENT_REPLY",
        notification.type === "BOOST"
      );
    }
    // Navigate to sender's profile for follow notifications
    else if (notification.type === "FOLLOW") {
      navigate(`/profile/view/${notification.senderId}`);
    }
  };

  return (
    <div className="relative min-h-screen text-white">
      {/* Background */}
      <div className="fixed top-0 left-0 w-full h-full bg-gray-900 z-[-1]" />

      <NavBar />

      <div className="flex container mx-auto mt-4">
        {/* Sidebar (hidden on mobile) */}
        <div className="hidden lg:block lg:w-1/4">
          <Sidebar />
        </div>

        {/* Main content */}
        <div className="w-full lg:w-3/4 px-4 mt-20 lg:mt-28 mb-20">
          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : notifications.length === 0 ? (
            <p className="text-gray-400">No notifications yet</p>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-center rounded-lg p-3 cursor-pointer transition
                    ${n.read ? "bg-gray-900 hover:bg-gray-800" : "bg-gray-800"}`}
                  onClick={() => handleNotificationClick(n)}
                >
                  {/* Avatar */}
                  <img
                    src={
                      n.senderImageUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(n.senderName || n.senderId)}&background=random`
                    }
                    alt="avatar"
                    className="w-10 h-10 rounded-full mr-3"
                  />

                  {/* Message content */}
                  <div>
                    <p className="text-sm">
                      <span className="font-semibold">{n.senderName || n.senderId}</span> {n.message}
                    </p>
                    <span className="text-xs text-gray-400">{moment(n.createdAt).fromNow()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal for post/blog */}
      {modalItem && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 z-50 overflow-auto"
          aria-modal="true"
          role="dialog"
          tabIndex={-1}
        >
          <div className="flex justify-center items-start min-h-screen py-10 px-4">
            <div className="bg-gray-900 rounded-lg p-8 max-w-xl w-full relative">
              {/* Close button */}
              <button
                className="absolute top-2 right-2 text-white text-xl font-bold hover:text-gray-500"
                onClick={() => {
                  setModalItem(null);
                  setOpenCommentSection(false);
                  setOpenBoostSection(false);
                }}
                aria-label="Close modal"
              >
                &times;
              </button>

              {/* FeedCard displays the post/blog content */}
              <FeedCard
                item={modalItem}
                currentUserEmail={modalItem.email}
                openCommentSection={openCommentSection}
                openBoostSection={openBoostSection}
                setOpenBlog={setOpenBlog}
                showMenu="hide"
              />
            </div>
          </div>
        </div>
      )}

      {/* Optional blog view modal */}
      {openBlog && <ViewBlog blog={openBlog} onClose={() => setOpenBlog(null)} />}
    </div>
  );
};

export default Notifications;
