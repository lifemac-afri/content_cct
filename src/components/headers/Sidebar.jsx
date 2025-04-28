/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaHome, FaBlog, FaTags, FaUser, FaCog } from "react-icons/fa";
import { BiLogOut } from "react-icons/bi";
import useAuthStore from "../../store/authstore";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const menuItems = [
    { name: "Dashboard", path: "/console", icon: <FaHome /> },
    { name: "Blog Posts", path: "/posts", icon: <FaBlog /> },
    { name: "Categories", path: "/categories", icon: <FaTags /> },
    { name: "Settings", path: "/console/settings", icon: <FaCog /> },
    { name: "Form Dashboard", path: "/console/form_submits", icon: <FaUser /> },
  ];

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      navigate("/signin");
    }
  };

  return (
    <aside
      className={`h-screen w-full bg-dark_green text-white flex flex-col shadow-lg relative ${
        isOpen ? "block" : "hidden"
      } md:block`}
    >
      <div className="flex justify-center items-center p-4 text-2xl font-bold text-center gap-5">
        <Link to={"/console"}>
          <FaBlog className="w-10 h-10" />
          <span>CMS Panel</span>
        </Link>
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

      <div className="px-4 absolute bottom-5 w-full">
        <button
          className="flex items-center justify-center gap-5 w-full bg-red-400 rounded-md shadow p-2 hover:bg-red-500 transition-colors"
          onClick={handleLogout}
        >
          <BiLogOut />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
