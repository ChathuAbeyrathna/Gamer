import { useEffect } from "react";
import moment from "moment";

/**
 * ViewBlogModal component
 * - Displays a blog in a modal with title, image, content, and user info
 * - Locks background scroll while open
 */
const ViewBlogModal = ({ blog, onClose }) => {
  // Lock background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  if (!blog) return null;

  // Format time to "fromNow" (e.g., 2 hours ago)
  const formatTime = (createdAt) => moment(createdAt).fromNow();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 overflow-auto">
      <div className="flex justify-center items-start min-h-screen py-10">
        <div className="bg-gray-800 p-6 rounded-lg w-full max-w-4xl relative">

          {/* Header: User info */}
          <div className="flex items-center space-x-4 mb-5">
            <img
              src={blog.userImage}
              alt="User Avatar"
              className="h-10 w-10 rounded-full object-cover"
            />
            <div>
              <h2 className="font-semibold text-white">{blog.userName}</h2>
              <p className="text-sm text-gray-400">{formatTime(blog.createdAt)}</p>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-white text-2xl font-bold hover:text-gray-400"
            aria-label="Close modal"
          >
            &times;
          </button>

          {/* Blog title */}
          <h2 className="text-2xl text-center font-bold text-white">{blog.title}</h2>

          {/* Blog image (optional) */}
          {blog.imageUrl && (
            <div className="max-w-xl mx-auto mb-5 mt-5">
              <img
                src={blog.imageUrl}
                alt="Blog"
                className="w-auto h-auto rounded"
              />
            </div>
          )}

          {/* Blog content */}
          <div
            className="prose prose-invert max-w-none space-y-0 text-white text-justify"
            dangerouslySetInnerHTML={{ __html: blog.content }} // Renders blog’s rich text (HTML) and allows formatted text, links, etc
          />
        </div>
      </div>
    </div>
  );
};

export default ViewBlogModal;
