/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiSave, FiArrowLeft, FiSend } from "react-icons/fi";
import { BiArchive } from "react-icons/bi";
import useBlogStore from "../../store/blogStore";
import Editor from "./Editor";
import toast from "react-hot-toast";

const Edit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    fetchBlogById,
    editBlog,
    selectedBlog,
    fetchCategories,
    categories,
    loading,
    error,
  } = useBlogStore();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBlogById(id);
    fetchCategories();
  }, [id, fetchBlogById, fetchCategories]);

  useEffect(() => {
    if (selectedBlog) {
      setTitle(selectedBlog?.title);
      setCategory(selectedBlog?.category);
      setContent(selectedBlog?.content);
    }
  }, [selectedBlog]);

  const handleSave = async (publishStatus) => {
    if (!title.trim()) {
      toast.error("Please enter a blog title");
      return;
    }

    if (!category) {
      toast.error("Please select a category");
      return;
    }

    try {
      setSaving(true);
      const updatedBlog = {
        title,
        category,
        content,
        published: publishStatus,
        updated_at: new Date().toISOString(),
      };

      await editBlog(id, updatedBlog);

      const action =
        publishStatus === true
          ? "published"
          : publishStatus === false
          ? "unpublished"
          : "saved as draft";

      toast.success(`Blog ${action} successfully`);
      navigate("/posts");
    } catch (err) {
      console.error("Error updating blog:", err);
      toast.error("Failed to update blog");
    } finally {
      setSaving(false);
    }
  };

  if (loading && !selectedBlog)
    return (
      <div className="mx-auto p-6 max-h-screen">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800 transition mb-6"
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

  return (
    <div className="mx-auto p-6 max-h-screen">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800 transition"
        >
          <FiArrowLeft className="mr-2" />
          Back to Blogs
        </button>

        <div className="flex gap-3">
          {selectedBlog?.published ? (
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition"
            >
              <BiArchive className="mr-2" />
              {saving ? "Moving to Draft..." : "Move to Draft"}
            </button>
          ) : (
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="flex items-center px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 font-medium rounded-lg transition"
            >
              <FiSend className="mr-2" />
              {saving ? "Publishing..." : "Save & Publish"}
            </button>
          )}

          <button
            onClick={() => handleSave(selectedBlog?.published)}
            disabled={saving}
            className="flex items-center px-4 py-2 text-white bg-emerald-500 hover:bg-emerald-600 font-medium rounded-lg transition"
          >
            <FiSave className="mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter Blog Title"
        className="w-full text-3xl font-bold mb-6 p-2 border-b-2 border-gray-200 focus:outline-none focus:border-emerald-500 transition"
      />

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4"
      >
        <option value={selectedBlog?.category}>{selectedBlog?.category}</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      <Editor data={content} onChange={setContent} />

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default Edit;
