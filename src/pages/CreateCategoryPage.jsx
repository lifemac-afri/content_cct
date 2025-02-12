/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiSave } from "react-icons/fi";
import useBlogStore from "../store/ContentStore";

const CreateCategoryPage = () => {
  const navigate = useNavigate();
  const { createCategory, loading } = useBlogStore();
  const [categoryName, setCategoryName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!categoryName.trim()) {
      setError("Category name is required");
      return;
    }

    try {
      await createCategory({ name: categoryName.trim() });
      navigate("/categories");
    } catch (err) {
      setError(err.message || "Failed to create category");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/categories")}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-4"
          >
            <FiArrowLeft className="mr-2" />
            Back to Categories
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Create New Category
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Add a new category to organize your blog posts
          </p>
        </div>

        {/* Form */}
        <div className="bg-white shadow-lg rounded-lg p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Name Input */}
            <div>
              <label
                htmlFor="categoryName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Category Name
              </label>
              <input
                id="categoryName"
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-offset-2 focus:outline-none transition-colors
                  ${
                    error
                      ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                      : "border-gray-300 focus:border-emerald-400 focus:ring-emerald-200"
                  }`}
                placeholder="Enter category name"
                disabled={loading}
              />
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/categories")}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center px-6 py-2 bg-gradient-to-r from-emerald-500 to-green-600 
                  text-white font-medium rounded-lg shadow-md hover:shadow-lg 
                  transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <FiSave className="mr-2" />
                {loading ? "Creating..." : "Create Category"}
              </button>
            </div>
          </form>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-4">
          <h2 className="text-sm font-medium text-blue-800 mb-2">
            Tips for creating categories:
          </h2>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Use clear and descriptive names</li>
            <li>• Keep names concise but meaningful</li>
            <li>• Avoid duplicate category names</li>
            <li>• Consider using broad topics that can group multiple posts</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateCategoryPage;
