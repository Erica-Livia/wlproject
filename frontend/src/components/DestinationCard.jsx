import React from "react";
import { FaStar } from "react-icons/fa"; // Import the star icon
import { Link } from "react-router-dom"; // Import Link for navigation

function DestinationCard({ theme, destination }) {
    if (!destination) {
        return (
            <div
                className={`w-72 h-96 flex flex-col items-center justify-center rounded-xl shadow-lg transform transition-transform duration-300 hover:scale-105
                    ${theme === "light" ? "bg-khaki text-gray-100" : "bg-white text-gray-800"}`}
            >
                <p className="text-red-500 font-semibold">Destination data missing</p>
            </div>
        );
    }

    return (
        <div
            className={`w-72 h-[500px] flex flex-col rounded-xl shadow-lg transform transition-transform duration-300 overflow-hidden
                ${theme === "light" ? "bg-khaki text-gray-100" : "bg-white text-gray-800"}`}
        >
            {/* Image Section */}
            <img
                src={destination.imageUrl || "https://source.unsplash.com/400x300/?travel"}
                alt={destination.title}
                className="w-full h-48 object-cover"
            />

            {/* Content Section */}
            <div className="p-4 flex flex-col flex-grow">
                {/* Title */}
                <h3 className="text-lg font-semibold">
                    {destination.title || "Destination Name"}
                </h3>

                {/* Short Description */}
                <h4 className="text-sm text-gray-600 mt-2 overflow-hidden">
                    {destination.description
                        ? destination.description.length > 50
                            ? `${destination.description.substring(0, 50)}...` // Limit to 100 characters
                            : destination.description
                        : "A short description of the destination goes here."}
                </h4>

                {/* Category */}
                <p className="text-gray-500 text-sm mt-2">
                    Category: {destination.category || "Uncategorized"}
                </p>

                {/* Rating */}
                <div className="flex items-center mt-2">
                    <FaStar className="text-yellow-500" />
                    <span className="ml-1 text-sm">
                        {destination.averageRating || "No ratings yet"}
                    </span>
                </div>

                {/* Explore Button */}
                <Link
                    to={`/destination-details/${destination.id}`}
                    className="mt-auto"
                >
                    <button
                        className={`mt-4 w-full bg-khaki text-white py-2 rounded-lg transition
                            ${theme === "light" ? "hover:bg-green" : "hover:bg-khaki"}`}
                    >
                        Explore
                    </button>
                </Link>
            </div>
        </div>
    );
}

export default DestinationCard;