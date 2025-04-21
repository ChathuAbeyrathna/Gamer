import React, { useEffect } from "react";
import moment from "moment";

const ViewBlogModal = ({ blog, onClose }) => {
  useEffect(() => {
    // Lock background scroll
    document.body.style.overflow = "hidden";
    return () => {
      // Restore scroll on close
      document.body.style.overflow = "auto";
    };
  }, []);

  if (!blog) return null;

  const formatTime = (createdAt) => {
    return moment(createdAt).fromNow();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 overflow-auto">
      <div className="flex justify-center items-start min-h-screen py-10">
        <div className="bg-gray-800 p-6 rounded-lg w-full max-w-4xl relative">
          <div className="flex items-center space-x-4 mb-5">
            <img
              src={blog.userImage}
              alt="User Avatar"
              className="h-10 w-10 rounded-full"
            />
            <div>
              <h2 className="font-semibold">{blog.userName}</h2>
              <p className="text-sm text-gray-400">
                {formatTime(blog.createdAt)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-white text-xl"
          >
            &times;
          </button>
          <h2 className="text-2xl text-center font-bold mb-2">{blog.title}</h2>
          {blog.imageUrl && (
            <div className="max-w-xl mx-auto mb-5 mt-5">
              <img
                src={blog.imageUrl}
                alt="Blog"
                className="w-auto h-auto rounded"
              />
            </div>
          )}
          <div
            className="prose prose-invert max-w-none space-y-0 text-white text-justify"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>
      </div>
    </div>
  );
};

export default ViewBlogModal;
