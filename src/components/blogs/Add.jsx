/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSave, FiArrowLeft, FiSend } from "react-icons/fi";
import useBlogStore from "../../store/blogStore";
import Editor from "./Editor";
import toast from "react-hot-toast";

const Add = () => {
  const navigate = useNavigate();
  const { createBlog, loading, error, fetchCategories, categories } =
    useBlogStore();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSubmit = async (publishStatus) => {
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
      const newBlog = {
        title,
        content,
        category,
        published: publishStatus,
        created_at: new Date().toISOString(),
      };

      await createBlog(newBlog);

      const action = publishStatus ? "published" : "saved as draft";
      toast.success(`Blog ${action} successfully`);
      navigate("/posts");
    } catch (err) {
      console.error("Blog creation error:", err);
      toast.error("Failed to create blog");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto p-6 max-h-screen">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/posts")}
          className="flex items-center text-gray-600 hover:text-gray-800 transition"
        >
          <FiArrowLeft className="mr-2" />
          Back to Blogs
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => handleSubmit(true)}
            disabled={saving}
            className="flex items-center px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 font-medium rounded-lg transition"
          >
            <FiSend className="mr-2" />
            {saving ? "Publishing..." : "Save & Publish"}
          </button>

          <button
            onClick={() => handleSubmit(false)}
            disabled={saving}
            className="flex items-center px-4 py-2 text-white bg-emerald-500 hover:bg-emerald-600 font-medium rounded-lg transition"
          >
            <FiSave className="mr-2" />
            {saving ? "Saving..." : "Save as Draft"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter Blog Title"
          className="w-full text-3xl font-bold mb-6 p-2 border-b-2 border-gray-200 focus:outline-none focus:border-emerald-500 transition"
        />

        <div className="mb-6">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Choose a Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="editor">
          <Editor data={content} onChange={setContent} />
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default Add;
