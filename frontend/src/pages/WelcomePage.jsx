import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaMapMarkedAlt, FaCompass, FaUser, FaChevronDown, FaArrowRight } from "react-icons/fa";
import DestinationCard from "../components/DestinationCard";
import DestGroupCard from "../components/DestGroupCard";
import InteractiveMap from "../components/Map";
import NavBar from "../components/NavBar";

function WelcomePage({ theme, toggleTheme }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showScrollIndicator, setShowScrollIndicator] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const images = [
        'url("https://images.unsplash.com/photo-1614046058536-2f0ded689015?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
        'url("https://images.unsplash.com/photo-1672575659699-33e02d8a51a5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
        'url("https://images.unsplash.com/photo-1672576499995-52b950a63142?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
        'url("https://theizytrip.com/wp-content/uploads/2022/10/KAGERA-FALLS.jpg")',
        'url("https://images.unsplash.com/photo-1672575659057-a2061f9a576b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")'
    ];

    useEffect(() => {
        const loginStatus = localStorage.getItem('isLoggedIn') === 'true';
        setIsLoggedIn(loginStatus);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 100) {
                setShowScrollIndicator(false);
            } else {
                setShowScrollIndicator(true);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 8000);

        return () => clearInterval(interval);
    }, [images.length]);

    const scrollToContent = () => {
        const contentSection = document.getElementById('destination-section');
        if (contentSection) {
            contentSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <>
            <NavBar theme={theme} toggleTheme={toggleTheme} />
            
            {/* Hero Section with Parallax Effect */}
            <div 
                className={`relative min-h-screen flex flex-col items-center justify-center ${
                    theme === "dark" ? "bg-white text-black" : "bg-green text-white"
                }`}
                style={{
                    backgroundImage: images[currentImageIndex],
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed',
                    transition: 'background-image 1s ease-in-out'
                }}
            >
                <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                <div className="z-10 w-full px-4 sm:px-6 lg:px-12 py-12 text-center space-y-8">
                    <div className="max-w-5xl mx-auto">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-poppins font-bold text-white mb-4 animate-fadeIn">
                            Welcome to <span className="text-green-400">WanderLust</span>
                        </h1>
                        <p className="text-lg sm:text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto mb-8 animate-fadeIn">
                            Explore the hidden gems of Burundi, discover new destinations, and meet expert guides who will help you navigate the adventure of a lifetime.
                        </p>
                        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 justify-center animate-fadeIn">
                            <Link
                                to="/destinations"
                                className={`group flex items-center justify-center py-3 px-6 rounded-lg transition duration-300 transform hover:scale-105 ${
                                    theme === "dark"
                                        ? "bg-green-500 text-white hover:bg-green-600"
                                        : "bg-green-500 text-white hover:bg-green-600"
                                }`}
                            >
                                <FaMapMarkedAlt size={24} className="inline-block mr-2" />
                                <span>Explore Destinations</span>
                                <FaArrowRight className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </Link>

                            {!isLoggedIn && (
                                <Link
                                    to="/login"
                                    className={`flex items-center justify-center py-3 px-6 rounded-lg transition duration-300 transform hover:scale-105 ${
                                        theme === "dark"
                                            ? "bg-khaki text-white hover:bg-opacity-90"
                                            : "bg-khaki text-white hover:bg-opacity-90"
                                    }`}
                                >
                                    <FaUser size={24} className="inline-block mr-2" />
                                    <span>Login</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
                
                {showScrollIndicator && (
                    <button 
                        onClick={scrollToContent}
                        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce cursor-pointer z-20"
                    >
                        <span className="sr-only">Scroll down</span>
                        <FaChevronDown size={28} />
                    </button>
                )}
            </div>

            {/* Content Container */}
            <div className={`${theme === "dark" ? "bg-white text-black" : "bg-green text-white"}`}>
                
                {/* Top Destinations */}
                <div id="destination-section" className="py-16 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <DestGroupCard theme={theme} />
                    </div>
                </div>

                {/* WHY CHOOSE WANDERLUST */}
                <div className="py-16 px-4 sm:px-6 lg:px-8 bg-opacity-5" style={{
                    background: theme === "dark" ? "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(240,240,240,1) 100%)" : "linear-gradient(180deg, rgba(0,128,0,1) 0%, rgba(0,100,0,1) 100%)"
                }}>
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className={`text-3xl sm:text-4xl md:text-5xl font-poppins font-semibold mb-4 ${
                                theme === "dark" ? "text-green-500" : "text-green-400"
                            }`}>
                                Why Choose WanderLust?
                            </h2>
                            <div className="w-24 h-1 bg-green-500 mx-auto"></div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className={`${
                                theme === "dark"
                                    ? "bg-khaki text-white"
                                    : "bg-khaki text-white"
                                } p-6 rounded-lg shadow-lg transform transition-all duration-300 hover:translate-y-2 hover:shadow-xl`}
                            >
                                <div className="flex flex-col items-center">
                                    <div className="p-3 rounded-full bg-white bg-opacity-20 mb-5">
                                        <FaCompass size={32} className="text-white" />
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-bold mb-3">
                                        Personalized Adventures
                                    </h3>
                                    <p className="text-base md:text-lg text-center">
                                        Whether you're a thrill-seeker or a cultural explorer, we offer experiences tailored to your interests.
                                    </p>
                                </div>
                            </div>
                            
                            <div className={`${
                                theme === "dark"
                                    ? "bg-khaki text-white"
                                    : "bg-khaki text-white"
                                } p-6 rounded-lg shadow-lg transform transition-all duration-300 hover:translate-y-2 hover:shadow-xl`}
                            >
                                <div className="flex flex-col items-center">
                                    <div className="p-3 rounded-full bg-white bg-opacity-20 mb-5">
                                        <FaMapMarkedAlt size={32} className="text-white" />
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-bold mb-3">
                                        Explore Hidden Gems
                                    </h3>
                                    <p className="text-base md:text-lg text-center">
                                        Discover destinations off the beaten path, from serene landscapes to bustling cultural hubs.
                                    </p>
                                </div>
                            </div>
                            
                            <div className={`${
                                theme === "dark"
                                    ? "bg-khaki text-white"
                                    : "bg-khaki text-white"
                                } p-6 rounded-lg shadow-lg transform transition-all duration-300 hover:translate-y-2 hover:shadow-xl`}
                            >
                                <div className="flex flex-col items-center">
                                    <div className="p-3 rounded-full bg-white bg-opacity-20 mb-5">
                                        <FaUser size={32} className="text-white" />
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-bold mb-3">
                                        Experienced Guides
                                    </h3>
                                    <p className="text-base md:text-lg text-center">
                                        Our local guides provide authentic experiences, ensuring you feel like a part of the culture.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Interactive Map Section */}
                <div className="py-16 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className={`text-3xl sm:text-4xl md:text-5xl font-poppins font-semibold mb-4 ${
                                theme === "dark" ? "text-green-500" : "text-green-400"
                            }`}>
                                Explore Burundi
                            </h2>
                            <p className={`text-lg max-w-2xl mx-auto ${
                                theme === "dark" ? "text-gray-600" : "text-gray-200"
                            }`}>
                                Discover beautiful destinations across the country with our interactive map
                            </p>
                            <div className="w-24 h-1 bg-green-500 mx-auto mt-4"></div>
                        </div>
                        
                        <div className="rounded-lg overflow-hidden shadow-lg">
                            <InteractiveMap />
                        </div>
                    </div>
                </div>
                
                {/* Testimonials Section (New) */}
                <div className="py-16 px-4 sm:px-6 lg:px-8" style={{
                    background: theme === "dark" ? "linear-gradient(180deg, rgba(240,240,240,1) 0%, rgba(255,255,255,1) 100%)" : "linear-gradient(180deg, rgba(0,100,0,1) 0%, rgba(0,128,0,1) 100%)"
                }}>
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className={`text-3xl sm:text-4xl md:text-5xl font-poppins font-semibold mb-4 ${
                                theme === "dark" ? "text-green-500" : "text-green-400"
                            }`}>
                                What Travelers Say
                            </h2>
                            <div className="w-24 h-1 bg-green-500 mx-auto"></div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className={`p-6 rounded-lg shadow-lg ${
                                theme === "dark" ? "bg-white" : "bg-white bg-opacity-10"
                            }`}>
                                <div className="flex flex-col h-full">
                                    <div className="flex-grow">
                                        <p className={`text-lg italic mb-4 ${
                                            theme === "dark" ? "text-gray-700" : "text-gray-100"
                                        }`}>
                                            "The guided tour through Kibira National Park was absolutely breathtaking. Our guide knew all the best spots and shared fascinating stories about the local wildlife."
                                        </p>
                                    </div>
                                    <div className="mt-4 flex items-center">
                                        <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-xl font-bold">
                                            S
                                        </div>
                                        <div className="ml-4">
                                            <p className={`font-semibold ${
                                                theme === "dark" ? "text-black" : "text-white"
                                            }`}>Sarah Johnson</p>
                                            <p className={`text-sm ${
                                                theme === "dark" ? "text-gray-600" : "text-gray-300"
                                            }`}>Adventure Enthusiast</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className={`p-6 rounded-lg shadow-lg ${
                                theme === "dark" ? "bg-white" : "bg-white bg-opacity-10"
                            }`}>
                                <div className="flex flex-col h-full">
                                    <div className="flex-grow">
                                        <p className={`text-lg italic mb-4 ${
                                            theme === "dark" ? "text-gray-700" : "text-gray-100"
                                        }`}>
                                            "WanderLust made my family vacation stress-free and unforgettable. The personalized itinerary was perfect for both adults and children, with activities everyone enjoyed."
                                        </p>
                                    </div>
                                    <div className="mt-4 flex items-center">
                                        <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-xl font-bold">
                                            M
                                        </div>
                                        <div className="ml-4">
                                            <p className={`font-semibold ${
                                                theme === "dark" ? "text-black" : "text-white"
                                            }`}>Michael Rodriguez</p>
                                            <p className={`text-sm ${
                                                theme === "dark" ? "text-gray-600" : "text-gray-300"
                                            }`}>Family Traveler</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className={`p-6 rounded-lg shadow-lg ${
                                theme === "dark" ? "bg-white" : "bg-white bg-opacity-10"
                            }`}>
                                <div className="flex flex-col h-full">
                                    <div className="flex-grow">
                                        <p className={`text-lg italic mb-4 ${
                                            theme === "dark" ? "text-gray-700" : "text-gray-100"
                                        }`}>
                                            "As a photographer, I was looking for authentic cultural experiences. The WanderLust team connected me with local artisans and communities, resulting in my best portfolio yet."
                                        </p>
                                    </div>
                                    <div className="mt-4 flex items-center">
                                        <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-xl font-bold">
                                            A
                                        </div>
                                        <div className="ml-4">
                                            <p className={`font-semibold ${
                                                theme === "dark" ? "text-black" : "text-white"
                                            }`}>Aisha Mbeki</p>
                                            <p className={`text-sm ${
                                                theme === "dark" ? "text-gray-600" : "text-gray-300"
                                            }`}>Travel Photographer</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Call to Action (New) */}
                <div className="py-16 px-4 sm:px-6 lg:px-8 text-center">
                    <div className="max-w-4xl mx-auto">
                        <h2 className={`text-3xl sm:text-4xl md:text-5xl font-poppins font-semibold mb-6 ${
                            theme === "dark" ? "text-green-500" : "text-green-400"
                        }`}>
                            Ready for Your Next Adventure?
                        </h2>
                        <p className={`text-lg mb-8 max-w-2xl mx-auto ${
                            theme === "dark" ? "text-gray-700" : "text-gray-200"
                        }`}>
                            Join thousands of travelers who have discovered the beauty of Burundi with WanderLust. Your perfect journey awaits!
                        </p>
                        <Link
                            to="/destinations"
                            className={`inline-flex items-center justify-center py-4 px-8 rounded-lg text-lg font-semibold transition duration-300 transform hover:scale-105 ${
                                theme === "dark"
                                    ? "bg-green-500 text-white hover:bg-green-600"
                                    : "bg-green-500 text-white hover:bg-green-600"
                            }`}
                        >
                            <span>Start Planning Today</span>
                            <FaArrowRight className="ml-2" />
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

export default WelcomePage;