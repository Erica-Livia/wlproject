import React, { useState } from "react";
import { RxDashboard } from "react-icons/rx";
import { PiUsersThreeLight, PiUserBold } from "react-icons/pi";
import { GoReport } from "react-icons/go";
import { MapPin } from "lucide-react"; // New icon for destinations
import { Link } from "react-router-dom";
import { FaBars, FaTimes, FaSignOutAlt } from "react-icons/fa"; // Added FaSignOutAlt for logout
import { signOut } from "firebase/auth"; // Import signOut from Firebase
import { auth } from "../firebase"; // Import auth from Firebase config

function AdminNav() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false); // State for profile dropdown

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out from Firebase
      console.log("User signed out successfully");
      // Redirect to login page or home page after logout
      window.location.href = "/login"; // Use window.location.href to force a full page reload
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div
      className={`font-poppins h-screen space-y-8 pl-8 py-8 bg-adminbg text-white transition-all duration-200 ${
        isExpanded ? "w-80" : "w-24"
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute bottom-4 p-2 bg-adminbg rounded-full hover:bg-adminbg-dark transition-colors text-whiteText"
      >
        {isExpanded ? <FaTimes className="text-24px place-holder" /> : <FaBars className="text-24px" />}
      </button>

      {/* Logo */}
      <div className="text-24px font-bold pb-4">
        <a href="/admin-dashboard" className="whitespace-nowrap">
          {isExpanded ? "Wanderlust Admin" : "WA"}
        </a>
      </div>

      {/* Navigation Links */}
      <div className="text-18px">
        <ul className="space-y-8">
          <li>
            <Link to="/admin-dashboard" className="flex items-center hover:underline">
              <RxDashboard className="text-24px mr-2" />
              {isExpanded && "Dashboard"}
            </Link>
          </li>
          <li>
            <Link to="/admin-users-list" className="flex items-center hover:underline">
              <PiUsersThreeLight className="text-24px mr-2" />
              {isExpanded && "Users"}
            </Link>
          </li>
          <li>
            <Link to="/admin-destinations-list" className="flex items-center hover:underline">
              <MapPin className="text-24px mr-2" /> {/* Updated icon for destinations */}
              {isExpanded && "Destinations"}
            </Link>
          </li>
          <li>
            <Link to="/admin-reports-list" className="flex items-center hover:underline">
              <GoReport className="text-24px mr-2" />
              {isExpanded && "Reports"}
            </Link>
          </li>
          <li className="relative">
            <div
              className="flex items-center hover:underline cursor-pointer"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            >
              <PiUserBold className="text-24px mr-2" />
              {isExpanded && "Profile Settings"}
            </div>

            {/* Profile Dropdown */}
            {showProfileDropdown && isExpanded && (
              <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white text-black py-2 z-50">
                <Link
                  to="/profile"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setShowProfileDropdown(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center"
                >
                  <FaSignOutAlt className="mr-2" /> Logout
                </button>
              </div>
            )}
          </li>
        </ul>
      </div>
    </div>
  );
}

export default AdminNav;