import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../../components/NavBar';
import SquadModal from '../../components/SquadModal';
import FeedCard from '../../components/FeedCard';
import ViewBlog from "../../components/ViewBlog";
import { FaArrowLeft } from "react-icons/fa";
import defaultProfile from '../../images/defaultProfile.png';
import squad from '../../images/squad.png';

/**
 * Displays a user's profile (avatar, bio, role, squad, etc.)
 * along with their posts and blogs.
 * Supports follow/unfollow, save posts, open squad modal, and chat.
 */
const ViewProfile = () => {
  const { email } = useParams(); // Email of profile being viewed
  const navigate = useNavigate();

  const currentUserEmail = localStorage.getItem("email"); // Logged-in user

  // Profile state
  const [profile, setProfile] = useState(null);
  const [showSquad, setShowSquad] = useState(false);

  // Content state
  const [posts, setPosts] = useState([]);
  const [blogs, setBlogs] = useState([]);

  // Follow state
  const [isFollowing, setIsFollowing] = useState(false);

  // Feed interaction state
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const [savedPostIds, setSavedPostIds] = useState([]);
  const [openBlog, setOpenBlog] = useState(null);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Fetch profile, posts, and blogs on mount or when email changes
   */
  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Fetch profile, posts, and blogs in parallel
        const [profileRes, postsRes, blogsRes] = await Promise.all([
          axios.get(`http://localhost:8080/api/profile/${email}`),
          axios.get(`http://localhost:8080/api/posts/user/${email}`),
          axios.get(`http://localhost:8080/api/blogs/user/${email}`),
        ]);

        setProfile(profileRes.data);
        setPosts(postsRes.data);
        setBlogs(blogsRes.data);

        // Check follow status if logged in and not own profile
        if (token && email !== currentUserEmail) {
          const statusRes = await axios.get(
            `http://localhost:8080/api/follow/status/${email}`,
            { headers }
          );
          setIsFollowing(statusRes.data.isFollowing);
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
    fetchSavedPosts();
  }, [email, currentUserEmail]);

  /**
   * Fetch IDs of saved posts for the logged-in user
   */
  const fetchSavedPosts = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get("http://localhost:8080/api/saved-posts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSavedPostIds(res.data.map((sp) => sp.postId));
    } catch (error) {
      console.error("Error fetching saved posts:", error);
    }
  };

  /**
   * Follow/Unfollow toggle handler
   */
  const toggleFollow = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:8080/api/follow/toggle-follow/${email}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.status === "FOLLOWED") setIsFollowing(true);
      else if (res.data.status === "UNFOLLOWED") setIsFollowing(false);
    } catch (error) {
      console.error("Follow toggle failed", error);
    }
  };

  /**
   * Save/Unsave post toggle handler
   */
  const toggleSave = async (postId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:8080/api/saved-posts/toggle/${postId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update local saved state
      setSavedPostIds((prev) =>
        res.data ? [...prev, postId] : prev.filter((id) => id !== postId)
      );
    } catch (err) {
      console.error("Error toggling save post:", err);
    }
  };

  /**
   * Merge posts + blogs (excluding group items),
   * then sort by creation date (newest first)
   */
  const combinedItems = [
    ...posts.filter((p) => !p.groupId).map((p) => ({ ...p, type: "post" })),
    ...blogs.filter((b) => !b.groupId).map((b) => ({ ...b, type: "blog" })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Loading state UI
  if (isLoading) {
    return (
      <div className="relative min-h-screen text-white bg-gray-900 flex justify-center items-center">
        <NavBar />
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-white">
      {/* Background */}
      <div className="fixed top-0 left-0 w-full h-full bg-gray-900 z-[-1]" />

      {/* Navigation bar */}
      <NavBar />

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-20 md:top-24 left-4 md:left-8 lg:left-32 z-50 text-white hover:text-gray-400"
      >
        <FaArrowLeft className="text-2xl font-light" style={{ strokeWidth: 1 }} />
      </button>

      <div className="max-w-6xl mx-auto mt-20 px-4 py-8">
        {/* Profile header */}
        {profile && (
          <div className="flex flex-col md:flex-row items-center w-full max-w-4xl mx-auto">
            {/* Profile picture */}
            <img
              src={profile.imageUrl || defaultProfile}
              alt="Profile"
              className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover mb-6 md:mb-0 md:mr-12"
            />

            {/* Profile details */}
            <div className="flex-1 w-full text-center md:text-left relative">
              <div>
                <h1 className="text-2xl lg:text-3xl">{profile.gamerName}</h1>
                <p className="text-gray-300 mt-4">{profile.bio}</p>
                <p className="text-gray-400 mt-3">
                  {profile.role?.join(" | ")}
                </p>
              </div>

              {/* Squad button */}
              <div
                onClick={() => setShowSquad(true)}
                className="absolute top-0 right-0 flex items-center space-x-2 text-gray-300 cursor-pointer select-none hover:text-white"
              >
                <img src={squad} alt="Squad Icon" className="w-6 h-6" />
                <span>Squad</span>
              </div>

              {/* Follow & Message buttons (hidden for own profile) */}
              <div className="flex flex-wrap gap-4 mt-8 justify-center md:justify-start">
                {email !== currentUserEmail && (
                  <button
                    onClick={toggleFollow}
                    className="flex-grow md:flex-grow-0 px-8 py-1 rounded-lg font-medium hover:opacity-90 bg-[linear-gradient(to_right,_rgba(33,_80,_182,_0.5),_rgba(1,_192,_211,_0.5))]"
                  >
                    {isFollowing ? "Unfollow" : "Follow"}
                  </button>
                )}
                {email !== currentUserEmail && (
                  <button
                    onClick={() => navigate(`/chat/${email}`)}
                    className="flex-grow md:flex-grow-0 px-8 py-1 rounded-lg font-medium hover:opacity-90 bg-[linear-gradient(to_right,_rgba(33,_80,_182,_0.5),_rgba(1,_192,_211,_0.5))]"
                  >
                    Message
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Squad modal */}
        {showSquad && (
          <div className="fixed inset-0 flex justify-center items-center z-20">
            <SquadModal
              email={profile?.email}
              show={showSquad}
              onClose={() => setShowSquad(false)}
            />
          </div>
        )}

        {/* Posts & Blogs Feed */}
        <div className="mt-12 space-y-6">
          {combinedItems.length === 0 ? (
            <p className="text-gray-500 text-center pt-8">
              This user hasn't posted anything yet.
            </p>
          ) : (
            combinedItems.map((item) => (
              <div className="max-w-xl mx-auto" key={`${item.type}-${item.id}`}>
                <FeedCard
                  item={item}
                  currentUserEmail={currentUserEmail}
                  dropdownOpenId={dropdownOpenId}
                  setDropdownOpenId={setDropdownOpenId}
                  toggleSave={toggleSave}
                  savedPostIds={savedPostIds}
                  setOpenBlog={setOpenBlog}
                />
              </div>
            ))
          )}

          {/* Blog view modal */}
          {openBlog && (
            <ViewBlog blog={openBlog} onClose={() => setOpenBlog(null)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;
