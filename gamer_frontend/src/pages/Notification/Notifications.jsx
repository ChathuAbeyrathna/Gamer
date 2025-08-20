import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Sidebar from "../../components/SideBar";
import FeedCard from "../../components/FeedCard";
import ViewBlog from "../../components/ViewBlog";
import axios from "axios";
import moment from "moment";

const Notifications = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalItem, setModalItem] = useState(null);
  const [openBlog, setOpenBlog] = useState(null);
  const [openCommentSection, setOpenCommentSection] = useState(false);
  const [openBoostSection, setOpenBoostSection] = useState(false);

  const navigate = useNavigate();

  // Fetch notifications on mount
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

  // Lock scroll when modal or blog is open
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

  const openItemModal = async (id, shouldOpenComment = false, shouldOpenBoost = false) => {
    try {
      const token = localStorage.getItem("token");
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : { withCredentials: true };

      setModalItem(null);
      setOpenBlog(null);
      setOpenCommentSection(false);
      setOpenBoostSection(false);

      try {
        const postRes = await axios.get(`http://localhost:8080/api/posts/${id}`, config);
        setModalItem({ ...postRes.data, type: "post" });
      } catch (postErr) {
        if (postErr.response && postErr.response.status === 404) {
          const blogRes = await axios.get(`http://localhost:8080/api/blogs/${id}`, config);
          setModalItem({ ...blogRes.data, type: "blog" });
        } else {
          throw postErr;
        }
      }

      setOpenCommentSection(shouldOpenComment);
      setOpenBoostSection(shouldOpenBoost);
    } catch (err) {
      console.error("Error fetching item (post/blog):", err);
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
    );

    if ((notification.type === "COMMENT" || notification.type === "BOOST") && notification.postId) {
      openItemModal(
        notification.postId,
        notification.type === "COMMENT",
        notification.type === "BOOST"
      );
    } else if (notification.type === "FOLLOW") {
      navigate(`/profile/view/${notification.senderId}`);
    }
  };

  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed top-0 left-0 w-full h-full bg-gray-900 z-[-1]" />
      <NavBar />
      <div className="flex mt-4">
        <div className="w-1/4">
          <Sidebar />
        </div>

        <div className="w-3/4 px-4 mt-28 mb-20 mr-24 ml-24">
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
                  <img
                    src={
                      n.senderImageUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(n.senderName || n.senderId)}&background=random`
                    }
                    alt="avatar"
                    className="w-10 h-10 rounded-full mr-3"
                  />
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

      {modalItem && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 z-50 overflow-auto"
          aria-modal="true"
          role="dialog"
          tabIndex={-1}
        >
          <div className="flex justify-center items-start min-h-screen py-10 px-4">
            <div className="bg-gray-900 rounded-lg p-8 max-w-xl w-full relative">
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

      {openBlog && <ViewBlog blog={openBlog} onClose={() => setOpenBlog(null)} />}
    </div>
  );
};

export default Notifications;
