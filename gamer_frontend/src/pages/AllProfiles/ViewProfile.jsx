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

const ViewProfile = () => {
  const { email } = useParams();
  const navigate = useNavigate();

  const currentUserEmail = localStorage.getItem("email");

  const [profile, setProfile] = useState(null);
  const [showSquad, setShowSquad] = useState(false);
  const [posts, setPosts] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);

  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const [savedPostIds, setSavedPostIds] = useState([]);
  const [openBlog, setOpenBlog] = useState(null);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [profileRes, postsRes, blogsRes, statusRes] = await Promise.all([
          axios.get(`http://localhost:8080/api/profile/${email}`),
          axios.get(`http://localhost:8080/api/posts/user/${email}`),
          axios.get(`http://localhost:8080/api/blogs/user/${email}`),
          axios.get(`http://localhost:8080/api/follow/status/${email}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          }),
        ]);
        setProfile(profileRes.data);
        setPosts(postsRes.data);
        setBlogs(blogsRes.data);

        setIsFollowing(statusRes.data.isFollowing);

      } catch (err) {
        console.error('Error fetching profile data:', err);
        setProfile(null);
        setPosts([]);
        setBlogs([]);
      } finally {
        setIsLoadingPosts(false);
      }
    };

    fetchAll();
    fetchSavedPosts();
  }, [email]);

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

  // Toggle follow/unfollow
  const toggleFollow = async () => {
    if (!currentUserEmail) {
      navigate("/login");
      return;
    }
    try {
      const res = await axios.post(
        `http://localhost:8080/api/follow/toggle-follow/${email}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      if (res.data.status === "ok") {
        setIsFollowing(!isFollowing);
      }
    } catch (error) {
      console.error("Follow toggle failed", error);
    }
  };


  const toggleSave = async (postId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    const res = await axios.post(
      `http://localhost:8080/api/saved-posts/toggle/${postId}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (res.data) {
      setSavedPostIds((prev) => [...prev, postId]);
    } else {
      setSavedPostIds((prev) => prev.filter((id) => id !== postId));
    }
  };

  const combinedItems = [
    ...posts.map(p => ({ ...p, type: 'post' })),
    ...blogs.map(b => ({ ...b, type: 'blog' }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  useEffect(() => {
  window.scrollTo(0, 0);
}, []);


  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed top-0 left-0 w-full h-full bg-gray-900 z-[-1]" />
      <NavBar />

      <button
        onClick={() => navigate(-1)}
        className="fixed top-24 left-32 mt-4 z-50 text-white hover:text-gray-400"
      >
        <FaArrowLeft className="text-2xl font-light" style={{ strokeWidth: 1 }} />
      </button>

      <div className="max-w-6xl mx-auto mt-20 px-4 py-8">
        {profile && (
          <div className="flex items-center w-full max-w-4xl">
            <img
              src={profile.imageUrl || defaultProfile}
              alt="Profile"
              className="w-48 h-48 rounded-full mr-12 ml-36"
            />

            <div className="flex-1 text-left relative">
              <div>
                <h1 className="text-2xl font-semibold">{profile.gamerName}</h1>
                <p className="text-gray-400 mt-4">{profile.bio}</p>
                <p className="text-gray-400 mt-3">{profile.role?.join(' | ')}</p>
              </div>

              {/* Squad icon */}
              <div onClick={() => setShowSquad(true)} className="absolute top-0 right-0 flex items-center space-x-2 text-gray-300 cursor-pointer select-none"
              >
                <img src={squad} alt="Squad Icon" className="w-6 h-6" />
                <span>Squad</span>
              </div>

              <div className="flex space-x-6 mt-8">
                {/* Follow/Unfollow button */}
                {email !== currentUserEmail && (
                  <button
                    onClick={toggleFollow}
                    className="w-36 py-1 rounded-lg font-medium hover:opacity-90"
                    style={{
                      background:
                        'linear-gradient(to right, rgba(33, 80, 182, 0.5), rgba(1, 192, 211, 0.5))',
                    }}
                  >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                )}

                {/* Message button (could be linked to chat) */}
                {email !== currentUserEmail && (
                  <button
                    className="w-36 py-1 rounded-lg font-medium hover:opacity-90"
                    style={{
                      background:
                        'linear-gradient(to right, rgba(33, 80, 182, 0.5), rgba(1, 192, 211, 0.5))',
                    }}
                    onClick={() => alert("Implement messaging!")}
                  >
                    Message
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Squad popup modal */}
        {showSquad && (
          <div className="fixed inset-0 flex justify-center items-center z-20">
            <SquadModal
              email={profile?.email}
              show={showSquad}
              onClose={() => setShowSquad(false)}
            />
          </div>
        )}

        {/* Posts & Blogs Section */}
        <div className="mt-12 space-y-6">
          {isLoadingPosts ? (
            <p className="text-center text-gray-400">Loading...</p>
          ) : combinedItems.length === 0 ? (
            <p className="text-gray-500 text-center">No posts yet.</p>
          ) : (
            combinedItems.map((item) => (
              <div className="max-w-xl mx-auto" key={item.id || item._id}>
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
          {openBlog && (
            <ViewBlog blog={openBlog} onClose={() => setOpenBlog(null)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;
