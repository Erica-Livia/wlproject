import React from "react";
import { Link } from "react-router-dom";
import { FaMapMarkedAlt, FaCompass, FaUser } from "react-icons/fa";
import DestinationCard from "../components/DestinationCard";
import DestGroupCard from "../components/DestGroupCard";
import InteractiveMap from "../components/Map";
import NavBar from "../components/NavBar";

function WelcomePage({ theme, toggleTheme }) {
    return (
        <>
            <NavBar theme={theme} toggleTheme={toggleTheme} />
            <div className={`min-h-screen flex flex-col items-center justify-center px-4 py-12 ${theme === "dark" ? "bg-white text-black" : "bg-green text-white"
                }`}>
                <div className="text-center space-y-6">
                    <h1
                        className={`${theme === "dark" ? "text-green-500" : "text-green-500"
                            } text-88px font-poppins font-bold`}
                    >
                        Welcome to WanderLust
                    </h1>
                    <p
                        className={`${theme === "dark" ? "text-black" : "text-grey"
                            } text-24px max-w-2xl mx-auto mb-8`}
                    >
                        Explore the hidden gems of Burundi, discover new destinations, and meet expert guides who will help you navigate the adventure of a lifetime. Your journey begins here.
                    </p>
                    <div className="flex space-x-8 justify-center">
                        <Link
                            to="/destinations"
                            className={`${theme === "dark"
                                ? "text-black hover:bg-green hover:text-white"
                                : "bg-green-500 text-white hover:bg-green-600"
                                } py-3 px-8 rounded-lg transition duration-300 border border-khaki`}
                        >
                            <FaMapMarkedAlt size={24} className="inline-block mr-2" />
                            Explore Destinations
                        </Link>
                        <Link
                            to="/login"
                            className={`${theme === "dark"
                                ? "bg-khaki text-white hover:bg-gray-700"
                                : "bg-khaki text-white hover:bg-gray-700"
                                } py-3 px-8 rounded-lg transition duration-300`}
                        >
                            <FaUser size={24} className="inline-block mr-2" />
                            Login
                        </Link>
                    </div>
                </div>

                {/* Top Destinations */}
                {/* In this section we display the top destination, ordered by the number of ratings */}
                {/* Destination cards */}
                <div className="mt-16 ">
                    <DestGroupCard theme={theme}/>
                </div>
            

                {/* WHY CHOOSE WANDERLUST */}

                <div className="mt-16 text-center">
                    <h2
                        className={`${theme === "dark" ? "text-green-500" : "text-green-500"
                            } text-48px font-poppins font-semibold mb-4`}
                    >
                        Why Choose WanderLust?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 px-4">
                        <div
                            className={`${theme === "dark"
                                ? "bg-khaki text-white"
                                : "bg-khaki text-white"
                                } p-8 rounded-lg`}
                        >
                            <FaCompass size={40} className="mx-auto mb-4" />
                            <h3 className="text-24px font-bold mb-2">
                                Personalized Adventures
                            </h3>
                            <p className="text-18px">
                                Whether you're a thrill-seeker or a cultural explorer, we offer experiences tailored to your interests.
                            </p>
                        </div>
                        <div
                            className={`${theme === "dark"
                                ? "bg-khaki text-white"
                                : "bg-khaki text-white"
                                } p-8 rounded-lg`}
                        >
                            <FaMapMarkedAlt size={40} className="mx-auto mb-4" />
                            <h3 className="text-24px font-bold mb-2">
                                Explore Hidden Gems
                            </h3>
                            <p className="text-18px">
                                Discover destinations off the beaten path, from serene landscapes to bustling cultural hubs.
                            </p>
                        </div>
                        <div
                            className={`${theme === "dark"
                                ? "bg-khaki text-white"
                                : "bg-khaki text-white"
                                } p-8 rounded-lg`}
                        >
                            <FaUser size={40} className="mx-auto mb-4" />
                            <h3 className="text-24px font-bold mb-2">
                                Experienced Guides
                            </h3>
                            <p className="text-18px">
                                Our local guides provide authentic experiences, ensuring you feel like a part of the culture.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Interactive Map */}

                <div className="w-full px-32 my-6">
                    <InteractiveMap />
                </div>

            </div>
        </>
    );
}

export default WelcomePage;
