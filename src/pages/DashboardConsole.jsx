/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import {
  FaBlog,
  FaTags,
  FaPlusCircle,
  FaCheckCircle,
  FaChartLine,
  FaCalendarAlt,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";
import useBlogStore from "../store/ContentStore";

const MetricCard = ({ icon: Icon, title, value, trend, className }) => (
  <div className={`p-6 bg-white rounded-xl shadow-sm ${className}`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-gray-50 rounded-lg">
          <Icon className="text-2xl" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
      {trend && (
        <span className="text-sm font-medium text-green-500">+{trend}%</span>
      )}
    </div>
  </div>
);

const DashboardConsole = () => {
  const { blogs, categories, fetchBlogs, fetchCategories } = useBlogStore();
  const navigate = useNavigate();
  const [timeframe] = useState("month");

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
  }, [fetchBlogs, fetchCategories]);

  // Calculate metrics
  const totalBlogs = blogs.length;
  const publishedBlogs = blogs.filter((blog) => blog.published).length;
  const draftBlogs = blogs.filter((blog) => !blog.published).length;
  const totalCategories = categories.length;

  // Calculate posts by date for chart
  const getPostsByDate = () => {
    const dates = blogs.reduce((acc, blog) => {
      const date = new Date(blog.created_at).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(dates)
      .map(([date, count]) => ({
        date,
        posts: count,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-7); // Last 7 days
  };

  // Get recent activity
  const recentBlogs = [...blogs]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Blog Dashboard</h1>
            <p className="text-gray-500">Track your content performance</p>
          </div>
          <button
            onClick={() => navigate("/posts/add")}
            className="flex items-center space-x-2 bg-primary_green text-white px-4 py-2 rounded-lg hover:bg-dark_green transition-colors duration-200"
          >
            <FaPlusCircle />
            <span>New Post</span>
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={FaBlog}
            title="Total Posts"
            value={totalBlogs}
            trend={8}
          />
          <MetricCard
            icon={FaCheckCircle}
            title="Published"
            value={publishedBlogs}
          />
          <MetricCard icon={FaCalendarAlt} title="Drafts" value={draftBlogs} />
          <MetricCard
            icon={FaTags}
            title="Categories"
            value={totalCategories}
          />
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Post Activity Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Post Activity
              </h2>
              <select
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1"
                value={timeframe}
              >
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
              </select>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getPostsByDate()}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="posts"
                    stroke="#10B981"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Posts
            </h2>
            <div className="space-y-4">
              {recentBlogs.map((blog) => (
                <div
                  key={blog.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                  onClick={() => navigate(`/posts/${blog.id}`)}
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{blog.title}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(blog.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      blog.published
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {blog.published ? "Published" : "Draft"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate("/posts/add")}
            className="flex items-center justify-center space-x-2 p-4 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors duration-200"
          >
            <FaPlusCircle className="text-primary_green" />
            <span>New Blog Post</span>
          </button>
          <button
            onClick={() => navigate("/categories/add")}
            className="flex items-center justify-center space-x-2 p-4 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors duration-200"
          >
            <FaTags className="text-primary_green" />
            <span>New Category</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardConsole;
