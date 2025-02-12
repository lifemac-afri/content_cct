/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
} from "react-icons/fi";
import useBlogStore from "../store/blogStore";

// import useBlogStore from "../store/blogStore";

const BlogTableSkeleton = () => {
  return (
    <div className="animate-pulse">
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          className="flex items-center p-4 border-b border-gray-200"
        >
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
          <div className="flex space-x-2">
            <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
            <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

const BlogManagementPage = () => {
  const { blogs, fetchBlogs, loading, deleteBlog } = useBlogStore();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const blogsPerPage = 5;

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  // Get unique categories from blogs
  const categories = ["all", ...new Set(blogs.map((blog) => blog.category))];

  // Filter blogs based on search term and category
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || blog.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination logic
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);
  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Reset page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-extrabold text-gray-600">
            Blog Management
          </h1>
          <button
            className="flex items-center space-x-2 bg-primary_green text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-1"
            onClick={() => navigate("/posts/add")}
          >
            <FiPlus className="text-xl" />
            <span>Create New Blog</span>
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search blogs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary_green focus:border-transparent"
                />
              </div>
            </div>
            <div className="md:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary_green focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Blogs Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <BlogTableSkeleton />
          ) : filteredBlogs.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p className="text-xl">No blogs found</p>
              <p className="text-sm">Try adjusting your search or filter</p>
            </div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date Created
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentBlogs.map((blog) => (
                  <tr
                    key={blog.id}
                    className="hover:bg-gray-50 transition duration-150 ease-in-out"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <Link
                        to={`/posts/${blog.id}`}
                        className="hover:text-primary_green"
                      >
                        {blog.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="w-4/5">{blog.category}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {blog.published ? (
                        <div className="bg-primary_green/55 text-black px-2 py-1 rounded-full text-center">
                          Published
                        </div>
                      ) : (
                        <div className="bg-orange-400/55 text-black px-2 py-1 rounded-full text-center">
                          Draft
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(blog.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2 rounded-full transition duration-300"
                          onClick={() => navigate(`/posts/${blog.id}/edit`)}
                        >
                          <FiEdit2 className="text-lg" />
                        </button>
                        <button
                          className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-full transition duration-300"
                          onClick={() => deleteBlog(blog.id)}
                        >
                          <FiTrash2 className="text-lg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {/* Pagination */}
          {filteredBlogs.length > blogsPerPage && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">{indexOfFirstBlog + 1}</span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(indexOfLastBlog, filteredBlogs.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">{filteredBlogs.length}</span>{" "}
                    blogs
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <FiChevronLeft className="h-5 w-5" />
                    </button>
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index}
                        onClick={() => handlePageChange(index + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === index + 1
                            ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                            : "text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <FiChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogManagementPage;
