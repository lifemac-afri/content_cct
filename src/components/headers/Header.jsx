/* eslint-disable no-unused-vars */
import React from "react";
import { FaSearch, FaBell, FaUserCircle } from "react-icons/fa";

const Header = () => {
  return (
    <header className="flex justify-between items-center px-4 py-3 bg-gray-100 shadow-md">
      <div className="text-xl font-semibold text-gray-700">Dashboard</div>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <FaSearch className="absolute top-2.5 left-2.5 text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <button className="relative p-2 bg-white rounded-full shadow hover:bg-gray-200">
          <FaBell className="text-gray-600" />
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
        </button>
        <FaUserCircle className="text-3xl text-gray-600 cursor-pointer hover:text-gray-700" />
      </div>
    </header>
  );
};

export default Header;
