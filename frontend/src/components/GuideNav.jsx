import React, { useState, useRef, useEffect } from "react";
import { RxDashboard } from "react-icons/rx";
import { FaStarHalfStroke } from "react-icons/fa6";
import { PiUserCircleCheck } from "react-icons/pi";
import { BsCalendar4Week } from "react-icons/bs";
import { PiUserBold } from "react-icons/pi";
import { FiChevronDown, FiChevronUp, FiLogOut } from "react-icons/fi";
import { MdSettings } from "react-icons/md";
import { signOut } from 'firebase/auth';
import { Link } from "react-router-dom";

function GuideNav() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Handle logout
    const handleLogout = async () => {
        try {
            // Sign out from Firebase
            await signOut(auth);

            // Clear local state
            setIsLoggedIn(false);
            setShowLogoutModal(false);
            setMobileMenuOpen(false);

            // Clear localStorage if needed
            localStorage.removeItem('guide'); // Example: Remove user data from localStorage

            // Redirect to the home page
            window.location.href = "/"; // Force a full page reload to reset the app state
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Toggle dropdown
    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <>
            <div className="font-poppins h-screen space-y-8 pl-8 py-8 w-80 bg-guidebg">
                <div className="text-24px font-bold pb-4">
                    <a href="/guide-dashboard">Wanderlust Guide</a>
                </div>

                <div className="text-18px">
                    <ul className="space-y-8">
                        <li>
                            <Link to="/guide-dashboard" className="flex items-center">
                                <RxDashboard className="text-24px mr-2" /> Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link to="/users-list" className="flex items-center">
                                <BsCalendar4Week className="text-24px mr-2" /> Bookings
                            </Link>
                        </li>
                        <li>
                            <Link to="/guide-reviews" className="flex items-center">
                                <FaStarHalfStroke className="text-24px mr-2" /> Reviews
                            </Link>
                        </li>
                        <li ref={dropdownRef} className="relative">
                            <button
                                onClick={toggleDropdown}
                                className="flex items-center w-full text-left focus:outline-none"
                            >
                                <PiUserBold className="text-24px mr-2" />
                                Profile
                                {isDropdownOpen ?
                                    <FiChevronUp className="ml-2" /> :
                                    <FiChevronDown className="ml-2" />
                                }
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute left-8 mt-2 py-2 w-48 bg-white rounded-md shadow-lg z-10 text-16px">
                                    <Link
                                        to="/guide-profile-setting"
                                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100 flex items-center"
                                    >
                                        <MdSettings className="mr-2" /> Profile Settings
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setShowLogoutModal(true);
                                            setMobileMenuOpen(false);
                                        }}
                                        className="flex items-center text-left"
                                    >
                                        <FaSignOutAlt className="mr-2" /> Logout
                                    </button>
                                </div>
                            )}
                        </li>
                    </ul>
                </div>
            </div>
            {showLogoutModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className={`p-6 rounded-lg shadow-lg max-w-sm w-full ${theme === "dark" ? "bg-white text-green" : "bg-green text-textWhite"
                        }`}>
                        <h3 className="text-lg font-bold mb-4">Confirm Logout</h3>
                        <p className="mb-6">Are you sure you want to log out of your WanderLust account?</p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className={`px-4 py-2 rounded ${theme === "dark"
                                    ? "bg-gray-200 hover:bg-gray-300 text-green"
                                    : "bg-white hover:bg-gray-100 text-green"
                                    }`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogout}
                                className={`px-4 py-2 rounded ${theme === "dark"
                                    ? "bg-red-600 hover:bg-red-700 text-white"
                                    : "bg-red-600 hover:bg-red-700 text-white"
                                    }`}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default GuideNav;