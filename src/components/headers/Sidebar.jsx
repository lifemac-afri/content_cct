/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FaHome, FaBlog, FaTags, FaUser, FaCog } from "react-icons/fa";
import { BiLogOut } from "react-icons/bi";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { name: "Dashboard", path: "/console", icon: <FaHome /> },
    { name: "Blog Posts", path: "/posts", icon: <FaBlog /> },
    { name: "Categories", path: "/categories", icon: <FaTags /> },
    { name: "Settings", path: "/console/settings", icon: <FaCog /> },
  ];

  return (
    <aside
      className={`h-screen w-full bg-dark_green text-white flex flex-col shadow-lg  relative ${
        isOpen ? "block" : "hidden"
      } md:block`}
    >
      <div className="flex justify-center items-center p-4 text-2xl font-bold text-center gap-5">
        <FaBlog className="w-10 h-10" />
        <span>CMS Panel</span>
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
          {isOpen ? "✖" : "☰"}
        </button>
      </div>
      <nav className="flex flex-col mt-4 space-y-2 px-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                isActive ? "bg-white/30" : "hover:bg-white/20"
              }`
            }
          >
            <span className="text-lg mr-3">{item.icon}</span>
            {isOpen && item.name}
          </NavLink>
        ))}
      </nav>

      <div className=" px-4 absolute bottom-5 w-full ">
        <button className="flex items-center justify-center gap-5  w-full bg-red-400 rounded-md shadow p-2">
          <BiLogOut />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
