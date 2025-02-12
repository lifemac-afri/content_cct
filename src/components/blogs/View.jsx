/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiEdit2, FiTrash2 } from "react-icons/fi";
import FroalaEditorView from "react-froala-wysiwyg/FroalaEditorView";
import { BiSend, BiShareAlt } from "react-icons/bi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import toast from "react-hot-toast";
import useBlogStore from "../../store/ContentStore";

const View = () => {
  const navigate = useNavigate();
  const { width, height } = useWindowSize();
  const { id } = useParams();
  const {
    fetchBlogById,
    selectedBlog,
    fetchCategories,
    loading,
    error,
    deleteBlog,
    publishBlog,
    ploading,
  } = useBlogStore();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    fetchBlogById(id);
    fetchCategories();
  }, [id, fetchBlogById, fetchCategories]);

  useEffect(() => {
    if (selectedBlog) {
      setTitle(selectedBlog?.title);
      setCategory(selectedBlog?.category);
      setContent(selectedBlog?.content);
      setPublished(selectedBlog?.published);
    }
  }, [selectedBlog]);

  // Function to calculate word count
  const getWordCount = (text) => {
    const plainText = text.replace(/<\/?[^>]+(>|$)/g, "");
    const words = plainText.split(/\s+/).filter((word) => word.length > 0);
    return words.length;
  };

  const getTimeToRead = (wordCount) => {
    const wordsPerMinute = 200;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return minutes;
  };

  const handlePublish = async (blogId) => {
    setConfetti(false);
    const success = await publishBlog(blogId);

    if (success) {
      setConfetti(true);
      toast.success("Blog post published successfully");

      // Delay navigation to allow confetti to show
      setTimeout(() => {
        setConfetti(false);
        navigate(-1);
      }, 4000); // 2 seconds delay
    } else {
      toast.error("Failed to publish blog post");
    }
  };

  if (loading && !selectedBlog)
    return (
      <div className="mx-auto p-6 max-h-screen">
        <button
          onClick={() => navigate("/posts")}
          className="flex items-center text-gray-600 hover:text-gray-800 transition mb-5"
        >
          <FiArrowLeft className="mr-2" />
          Back to Blogs
        </button>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-3/4 my-5"></div>
          <div className="h-44 rounded-md bg-gray-300 w-3/4"></div>
          {[...Array(2)].map((_, index) => (
            <div
              key={index}
              className="flex items-center p-4 border-b border-gray-200"
            >
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

  if (error) return <p>Error: {error}</p>;

  // Calculate word count and time to read
  const wordCount = getWordCount(content);
  const timeToRead = getTimeToRead(wordCount);

  return (
    <div className="mx-auto p-6 max-h-screen">
      <button
        onClick={() => navigate("/posts")}
        className="flex items-center text-gray-600 hover:text-gree transition mb-5"
      >
        <FiArrowLeft className="mr-2" />
        Back to Blogs
      </button>

      <div className="mb-8">
        <div className="flex justify-between items-center w-full ">
          <h1 className="w-full text-3xl font-semibold p-2">{title}</h1>
          <div className="flex justify-center space-x-2">
            {!published && (
              <button
                className="text-primary_green hover:text-dark_green bg-blue-50 hover:bg-blue-100 p-2 rounded-full transition duration-300"
                onClick={() => handlePublish(id)}
                disabled={ploading}
              >
                {!ploading ? (
                  <BiSend className="text-lg" />
                ) : (
                  <AiOutlineLoading3Quarters className="animate-spin w-5 h-5" />
                )}
              </button>
            )}
            <button
              className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2 rounded-full transition duration-300"
              onClick={() => navigate(`/posts/${id}/edit`)}
            >
              <FiEdit2 className="text-lg" />
            </button>
            <button
              className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-full transition duration-300"
              onClick={() => deleteBlog(id)}
            >
              <FiTrash2 className="text-lg" />
            </button>
          </div>
        </div>
        <div className=" text-gray-600 px-2 flex items-center gap-4">
          <p>Category: {category} </p>
          <p>
            Time to Read: {timeToRead} minute{timeToRead > 1 ? "s" : ""}
          </p>
        </div>
        {!published && (
          <span className="text-xs font-light text-red-400 gap-1 w-full flex items-center px-2">
            This is a draft, click on the <BiSend /> button to publish
          </span>
        )}
      </div>

      <FroalaEditorView model={content} />

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      {confetti && <Confetti width={width} height={height} />}
    </div>
  );
};

export default View;
