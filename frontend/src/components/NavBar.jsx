import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaUserCircle, FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";
import { auth } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { CiLogin } from "react-icons/ci";

function NavBar({ theme, toggleTheme, role }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state
    const [showDropdown, setShowDropdown] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 1124);

    const dropdownRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const navigate = useNavigate();

    // Listen for authentication state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is signed in
                setIsLoggedIn(true);
            } else {
                // User is signed out
                setIsLoggedIn(false);
            }
        });

        // Cleanup the listener on unmount
        return () => unsubscribe();
    }, []);

    // Handle screen resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth <= 1124);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Handle logout
    const handleLogout = async () => {
        try {
            await signOut(auth); // Sign out from Firebase
            setIsLoggedIn(false); // Update login state
            setShowLogoutModal(false); // Close the logout modal
            setMobileMenuOpen(false); // Close the mobile menu
            navigate("/"); // Redirect to home page
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Handle click outside dropdown and mobile menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }

            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
                setMobileMenuOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Disable body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [mobileMenuOpen]);

    return (
        <>
            <div className={`navbar font-poppins sticky top-0 z-50 shadow-xl px-4 xl:px-32 sm:px-4 py-4 ${
                theme === "dark" ? "bg-white text-green border-b border-white shadow-lg" : "bg-green text-textWhite border-b border-green shadow-lg"
            }`}>
                <div className="flex justify-between items-center">
                    {/* Logo/Title */}
                    <div className="text-24px font-bold">
                        <Link to="/">WanderLust</Link>
                    </div>

                    {/* Desktop Navigation */}
                    {!isMobileView && (
                        <>
                            {/* Desktop Navigation Links */}
                            <div className="flex items-center space-x-6">
                                <ul className="list-none flex space-x-6 items-center">
                                    <li className="hover:opacity-75 transition-opacity">
                                        <Link to="/">Home</Link>
                                    </li>
                                    <li className="hover:opacity-75 transition-opacity">
                                        <Link to="/destinations">Destinations</Link>
                                    </li>
                                    <li className="hover:opacity-75 transition-opacity">
                                        <Link to="/guides">Guides</Link>
                                    </li>

                                    {/* Conditional Links for Logged-In User */}
                                    {isLoggedIn ? (
                                        <>
                                            <li className="hover:opacity-90 transition-opacity">
                                                <Link to="/mybookings">My Bookings</Link>
                                            </li>
                                            <li className="hover:opacity-75 transition-opacity">
                                                <Link to="/quizz">Quizzes</Link>
                                            </li>
                                            <li className="relative" ref={dropdownRef}>
                                                <div
                                                    className="flex items-center justify-center cursor-pointer hover:opacity-75 transition-opacity"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowDropdown(!showDropdown);
                                                    }}
                                                >
                                                    <FaUserCircle size={24} />
                                                </div>

                                                {/* User Dropdown */}
                                                {showDropdown && (
                                                    <div
                                                        className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-50 ${
                                                            theme === "dark" ? "bg-white text-green" : "bg-green text-textWhite"
                                                        }`}
                                                    >
                                                        <Link to="/profile" className="block px-4 py-2 hover:bg-opacity-20 hover:bg-gray-200">
                                                            Profile
                                                        </Link>
                                                        <Link to="/settings" className="block px-4 py-2 hover:bg-opacity-20 hover:bg-gray-200">
                                                            Settings
                                                        </Link>
                                                        <button
                                                            onClick={() => {
                                                                setShowLogoutModal(true);
                                                                setShowDropdown(false);
                                                            }}
                                                            className="flex items-center w-full text-left px-4 py-2 hover:bg-opacity-20 hover:bg-gray-200"
                                                        >
                                                            <FaSignOutAlt className="mr-2" /> Logout
                                                        </button>
                                                    </div>
                                                )}
                                            </li>
                                        </>
                                    ) : (
                                        <li className="hover:opacity-75 transition-opacity">
                                            <Link to="/login" className={`py-2 rounded-full flex items-center${
                                                theme === "dark" ? " text-green" : "text-green"
                                            }`}><CiLogin className="text-18px mr-1"/>Login</Link>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </>
                    )}

                    {/* Mobile Navigation */}
                    {isMobileView && (
                        <div className="flex items-center space-x-3">
                            {/* Mobile Search Toggle */}
                            <button
                                onClick={() => setShowMobileSearch(!showMobileSearch)}
                                className="p-2 hover:opacity-75 transition-opacity"
                            >
                                <FaSearch size={20} />
                            </button>

                            {/* Mobile Menu Toggle */}
                            <button
                                className="hamburger-icon p-2 hover:opacity-75 transition-opacity"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setMobileMenuOpen(!mobileMenuOpen);
                                }}
                            >
                                {mobileMenuOpen ? (
                                    <FaTimes size={24} />
                                ) : (
                                    <FaBars size={24} />
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* Mobile Search Bar (Collapsible) */}
                {showMobileSearch && isMobileView && (
                    <div className={`mt-4 rounded-lg ${
                        theme === "dark" ? "bg-textWhite text-green border border-green" : "bg-green text-textWhite border border-white"
                    }`}>
                        <div className="flex items-center">
                            <input
                                type="text"
                                placeholder="Search for Destinations..."
                                className="bg-transparent focus:outline-none placeholder-gray-400 p-3 w-full rounded-l-lg"
                            />
                            <button className="p-3 rounded-r-lg">
                                <FaSearch />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && isMobileView && (
                <div
                    ref={mobileMenuRef}
                    className={`fixed inset-0 z-40 overflow-y-auto pt-16 ${
                        theme === "dark" ? "bg-white text-green" : "bg-green text-textWhite"
                    }`}
                >
                    <div className="container mx-auto px-6 py-8 space-y-6">
                        <ul className="list-none space-y-6 text-lg">
                            <li className="border-b pb-2 hover:opacity-75 transition-opacity">
                                <Link to="/destinations" onClick={() => setMobileMenuOpen(false)}>Destinations</Link>
                            </li>
                            <li className="border-b pb-2 hover:opacity-75 transition-opacity">
                                <Link to="/guides" onClick={() => setMobileMenuOpen(false)}>Guides</Link>
                            </li>

                            {/* Conditional Links for Logged-In User */}
                            {isLoggedIn ? (
                                <>
                                    <li className="border-b pb-2 hover:opacity-75 transition-opacity">
                                        <Link to="/mybookings" onClick={() => setMobileMenuOpen(false)}>My Bookings</Link>
                                    </li>
                                    <li className="border-b pb-2 hover:opacity-75 transition-opacity">
                                        <Link to="/quizz" onClick={() => setMobileMenuOpen(false)}>Quizzes</Link>
                                    </li>
                                    <li className="border-b pb-2 hover:opacity-75 transition-opacity">
                                        <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
                                    </li>
                                    <li className="border-b pb-2 hover:opacity-75 transition-opacity">
                                        <Link to="/settings" onClick={() => setMobileMenuOpen(false)}>Settings</Link>
                                    </li>
                                    <li className="hover:opacity-75 transition-opacity">
                                        <button
                                            onClick={() => {
                                                setShowLogoutModal(true);
                                                setMobileMenuOpen(false);
                                            }}
                                            className="flex items-center text-left"
                                        >
                                            <FaSignOutAlt className="mr-2" /> Logout
                                        </button>
                                    </li>
                                </>
                            ) : (
                                <li className="hover:opacity-75 transition-opacity">
                                    <Link
                                        to="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`inline-block rounded-full text-green flex items-center`}
                                    >
                                        <CiLogin className="text-18px mr-1"/>Login
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            )}

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className={`p-6 rounded-lg shadow-lg max-w-sm w-full ${
                        theme === "dark" ? "bg-white text-green" : "bg-green text-textWhite"
                    }`}>
                        <h3 className="text-lg font-bold mb-4">Confirm Logout</h3>
                        <p className="mb-6">Are you sure you want to log out of your WanderLust account?</p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className={`px-4 py-2 rounded ${
                                    theme === "dark"
                                        ? "bg-gray-200 hover:bg-gray-300 text-green"
                                        : "bg-white hover:bg-gray-100 text-green"
                                }`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogout}
                                className={`px-4 py-2 rounded ${
                                    theme === "dark"
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

export default NavBar;