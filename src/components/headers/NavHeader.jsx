import { useState } from "react";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaWhatsapp,
} from "react-icons/fa";
import { FaEllipsis, FaX } from "react-icons/fa6";
import data from "./data"; // Import your nav data and services
import { logo } from "../../assets";
import { BsTwitterX } from "react-icons/bs";
import StableNavigation from "./Sidebar";

const NavHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-gray-50 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        {/* Logo */}
        <div className="flex items-center space-x-2 justify-center">
          <img src={logo} alt="Rowix Logo" className="h-14 w-14" />
          <div className="font-bold text-gray-800 flex flex-col items-center mt-2">
            <span className="text-base">CCT Business Consult </span>
            <span className="text-base"> & Events</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <StableNavigation data={data} />
        {/* Right Section (Desktop only) */}
        <div className="hidden md:flex items-center space-x-4">
          <div className="flex justify-center space-x-4 gap-2">
            <a
              href="https://www.facebook.com/cctbizce"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-primary_green"
            >
              <FaFacebook className="w-5 h-5" />
            </a>
            <a
              href="https://www.instagram.com/cctbizce/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-primary_green"
            >
              <FaInstagram className="w-5 h-5" />
            </a>
            <a
              href="https://www.x.com/cctbizce"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-primary_green"
            >
              <BsTwitterX className="w-5 h-5" />
            </a>
            <a
              href="https://www.linkedin.com/company/cctbizce/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-primary_green"
            >
              <FaLinkedin className="w-5 h-5" />
            </a>
          </div>

          {/* CTA Button */}
          <a
            className="bg-primary_green text-white px-4 py-2 rounded shadow-md hover:bg-primary-dark text-sm font-semibold whitespace-nowrap cursor-pointer flex items-center gap-2"
            href="https://wa.link/49ca5k"
          >
            LET&apos;S TALK{" "}
            <span>
              <FaWhatsapp width={10} height={10} />
            </span>
          </a>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 rounded-full text-gray-800 hover:text-primary"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <FaX className="text-lg" />
          ) : (
            <FaEllipsis className="text-lg" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-md">
          <nav className="flex flex-col space-y-4 px-4 py-2">
            <div className="flex justify-between items-center mb-4">
              <a
                href="https://wa.link/49ca5k"
                className="bg-primary_green text-white px-4 py-2 rounded shadow-md text-sm font-semibold whitespace-nowrap flex items-center gap-2 mt3"
              >
                LET&apos;S TALK{" "}
                <span>
                  <FaWhatsapp width={10} height={10} />
                </span>
              </a>
            </div>
            {/* Navigation Links (for mobile view) */}
            <div className="flex flex-col space-y-2">
              {data.map((item) =>
                item.items && item.items.length > 0 ? (
                  <div key={item.title}>
                    <span className="text-sm font-medium text-gray-800">
                      {item.title}
                    </span>
                    <div className="pl-4">
                      {item.items.map((subItem) => (
                        <a
                          key={subItem.title}
                          href={subItem.href || "#"}
                          className="block text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded"
                        >
                          {subItem.title}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <a
                    key={item.title}
                    href={item.link}
                    className="text-sm font-medium text-gray-800 hover:text-primary"
                  >
                    {item.title}
                  </a>
                )
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default NavHeader;
