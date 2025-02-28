import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaUserCircle, FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";

function NavBar({ theme, toggleTheme, role }) {
    // Check localStorage on component mount
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        return localStorage.getItem('isLoggedIn') === 'true';
    });
    
    // State for dropdown, modal, and mobile menu
    const [showDropdown, setShowDropdown] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    
    const dropdownRef = useRef(null);
    const mobileMenuRef = useRef(null);
    
    // Update localStorage whenever isLoggedIn changes
    useEffect(() => {
        localStorage.setItem('isLoggedIn', isLoggedIn);
    }, [isLoggedIn]);
    
    // Handle logout
    const handleLogout = () => {
        setIsLoggedIn(false);
        setShowLogoutModal(false);
        setMobileMenuOpen(false);
        // Add any additional logout logic here (e.g., clearing other localStorage items, redirecting, etc.)
        window.location.href = "/";
    };
    
    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
            
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && 
                !event.target.classList.contains('hamburger-icon')) {
                setMobileMenuOpen(false);
            }
        };
        
        document.addEventListener('click', handleClickOutside);
        
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);
    
    // Close mobile menu when window resizes to desktop size
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setMobileMenuOpen(false);
                setShowMobileSearch(false);
            }
        };
        
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Toggle body scroll when mobile menu is open
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
                        <a href="/">WanderLust</a>
                    </div>

                    {/* Search Bar (Desktop) */}
                    <div className={`hidden md:flex items-center rounded-lg space-x-2 ${
                        theme === "dark" ? "bg-textWhite text-green border border-green" : "bg-green text-textWhite border border-white"
                    }`}>
                        <input
                            type="text"
                            placeholder="Search for Destinations..."
                            className="bg-transparent focus:outline-none placeholder-gray-400 p-2 rounded-l-lg w-full md:w-64 lg:w-80"
                        />
                        <button className="p-2 rounded-r-lg">
                            <FaSearch />
                        </button>
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center space-x-6">
                        <ul className="list-none flex space-x-6 items-center">
                            <li className="hover:opacity-75 transition-opacity">
                                <a href="/destinations">Destinations</a>
                            </li>
                            <li className="hover:opacity-75 transition-opacity">
                                <a href="/guides">Guides</a>
                            </li>

                            {/* Conditional Links for Logged-In User */}
                            {isLoggedIn ? (
                                <>
                                    <li className="hover:opacity-75 transition-opacity">
                                        <a href="/tours">My Tours</a>
                                    </li>
                                    <li className="hover:opacity-75 transition-opacity">
                                        <a href="/quizz">Quizzes</a>
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
                                                <a href="/profile" className="block px-4 py-2 hover:bg-opacity-20 hover:bg-gray-200">
                                                    Profile
                                                </a>
                                                <a href="/settings" className="block px-4 py-2 hover:bg-opacity-20 hover:bg-gray-200">
                                                    Settings
                                                </a>
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
                                    <a href="/login" className={`px-4 py-2 rounded-full ${
                                        theme === "dark" ? "bg-green text-white" : "bg-white text-green" 
                                    }`}>Login</a>
                                </li>
                            )}
                        </ul>

                        {/* Animated Theme Toggle Button */}
                        <div
                            onClick={toggleTheme}
                            className={`relative w-12 h-6 flex items-center rounded-full cursor-pointer transition-all duration-300 ease-in-out ${
                                theme === "dark" ? "bg-gray-400" : "bg-gray-600"
                            }`}
                        >
                            <div
                                className={`absolute w-6 h-6 bg-white border border-gray-400 rounded-full transition-all duration-300 ease-in-out transform ${
                                    theme === "dark" ? "translate-x-6" : "translate-x-0"
                                } flex items-center justify-center text-xs`}
                            >
                                {theme === "dark" ? "☀️" : "🌙"}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Search and Menu Toggle */}
                    <div className="flex md:hidden items-center space-x-3">
                        <button
                            onClick={() => setShowMobileSearch(!showMobileSearch)}
                            className="p-2 hover:opacity-75 transition-opacity"
                        >
                            <FaSearch size={20} />
                        </button>
                        
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
                </div>
                
                {/* Mobile Search Bar (Collapsible) */}
                {showMobileSearch && (
                    <div className={`mt-4 md:hidden rounded-lg ${
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
            {mobileMenuOpen && (
                <div 
                    ref={mobileMenuRef}
                    className={`fixed inset-0 z-40 md:hidden overflow-y-auto pt-16 ${
                        theme === "dark" ? "bg-white text-green" : "bg-green text-textWhite"
                    }`}
                >
                    <div className="container mx-auto px-6 py-8 space-y-6">
                        <ul className="list-none space-y-6 text-lg">
                            <li className="border-b pb-2 hover:opacity-75 transition-opacity">
                                <a href="/destinations" onClick={() => setMobileMenuOpen(false)}>Destinations</a>
                            </li>
                            <li className="border-b pb-2 hover:opacity-75 transition-opacity">
                                <a href="/guides" onClick={() => setMobileMenuOpen(false)}>Guides</a>
                            </li>

                            {/* Conditional Links for Logged-In User */}
                            {isLoggedIn ? (
                                <>
                                    <li className="border-b pb-2 hover:opacity-75 transition-opacity">
                                        <a href="/tours" onClick={() => setMobileMenuOpen(false)}>My Tours</a>
                                    </li>
                                    <li className="border-b pb-2 hover:opacity-75 transition-opacity">
                                        <a href="/quizz" onClick={() => setMobileMenuOpen(false)}>Quizzes</a>
                                    </li>
                                    <li className="border-b pb-2 hover:opacity-75 transition-opacity">
                                        <a href="/profile" onClick={() => setMobileMenuOpen(false)}>Profile</a>
                                    </li>
                                    <li className="border-b pb-2 hover:opacity-75 transition-opacity">
                                        <a href="/settings" onClick={() => setMobileMenuOpen(false)}>Settings</a>
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
                                    <a 
                                        href="/login" 
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`inline-block px-6 py-3 rounded-full ${
                                            theme === "dark" ? "bg-green text-white" : "bg-white text-green" 
                                        }`}
                                    >
                                        Login
                                    </a>
                                </li>
                            )}
                        </ul>
                        
                        {/* <div className="pt-6 flex items-center justify-between">
                            <span>Change Theme:</span>
                            <div
                                onClick={() => {
                                    toggleTheme();
                                }}
                                className={`relative w-16 h-8 flex items-center rounded-full cursor-pointer transition-all duration-300 ease-in-out ${
                                    theme === "dark" ? "bg-gray-400" : "bg-gray-600"
                                }`}
                            >
                                <div
                                    className={`absolute w-8 h-8 bg-white border border-gray-400 rounded-full transition-all duration-300 ease-in-out transform ${
                                        theme === "dark" ? "translate-x-8" : "translate-x-0"
                                    } flex items-center justify-center text-sm`}
                                >
                                    {theme === "dark" ? "☀️" : "🌙"}
                                </div>
                            </div>
                        </div> */}
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