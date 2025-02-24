import React, { useState, useEffect } from "react";
import { FaSearch, FaUserCircle } from "react-icons/fa";

function NavBar({theme, toggleTheme, role}) {
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    
    return (
        <> 
            <div className={`navbar font-poppins sticky top-0 z-50 shadow-xl px-4 xl:px-32 sm:px-4 py-6  ${theme === "dark" ? "bg-white text-green border-b border-white shadow-lg" : "bg-green text-textWhite border-b border-green shadow-lg"
                }`} >
                <div className="md:flex text-center md:justify-between border-none space-y-2 items-center justify-center">
                    {/* Logo/Title */}
                    <div className="text-24px sm:text-center">
                        <a href="/">WanderLust</a>
                    </div>

                    {/* Search Bar */}
                    <div className={`hidden md:flex items-center rounded-lg space-x-2 ${theme === "dark" ? "bg-textWhite text-green border border-green" : "bg-green text-textWhite border border-white"
                        } `}>
                        <input
                            type="text"
                            placeholder="Search for Destinations..."
                            className="bg-transparent focus:outline-none placeholder-gray-400 p-2 rounded-l-lg"
                        />
                        <button className=" p-2 rounded-r-lg">
                            <FaSearch />
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <div className=" flex items-center">
                        <ul className="list-none flex space-x-8 mt-0 sm:mt-0 justify-center">
                            <li>
                                <a href="/destinations">Destinations</a>
                            </li>
                            <li>
                                <a href="/guides">Guides</a>
                            </li>

                            {/* Conditional Links for Logged-In User */}
                            {/* {isLoggedIn ? (
                                <>
                                    <li><a href="/tours">My Tours</a></li>
                                    <li>
                                        <a href="/settings" className="flex items-center justify-center">
                                            <FaUserCircle size={24} />
                                        </a>
                                    </li>
                                </>
                            ) : (
                                <li><a href="/login">Login</a></li>
                            )} */}
                            <li><a href="/login">Login</a></li>
                        </ul>

                        {/* Animated Theme Toggle Button */}
                        <div
                            onClick={toggleTheme}
                            className={`relative w-12 h-6 ml-2 flex items-center rounded-full cursor-pointer transition-all duration-300 ease-in-out ${theme === "dark" ? "bg-gray-400" : "bg-gray-600"
                                }`}
                        ><div
                            className={`absolute w-6 h-6 bg-white border border-gray-400 rounded-full transition-all duration-300 ease-in-out transform ${theme === "dark" ? "translate-x-6" : "translate-x-0"
                                }`}
                        >{theme === "dark" ? "☀️" : "🌙"}</div>
                        </div>
                        
                    </div>
                </div>
            </div>
        </>
    );
}

export default NavBar;
