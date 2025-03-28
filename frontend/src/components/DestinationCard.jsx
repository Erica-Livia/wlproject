import React, { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import { Link } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

function DestinationCard({ theme, destination }) {
    const [averageRating, setAverageRating] = useState(null);
    const [loadingRating, setLoadingRating] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            if (!destination?.id) {
                setLoadingRating(false);
                return;
            }

            try {
                const reviewsQuery = query(
                    collection(db, "reviews"),
                    where("destinationId", "==", destination.id)
                );
                const reviewsSnapshot = await getDocs(reviewsQuery);
                const reviews = reviewsSnapshot.docs.map((doc) => doc.data());

                // Calculate average rating
                const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
                const avgRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : null;
                
                setAverageRating(avgRating);
            } catch (error) {
                console.error("Error fetching reviews:", error);
                setAverageRating(null);
            } finally {
                setLoadingRating(false);
            }
        };

        fetchReviews();
    }, [destination?.id]);

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
            className={`w-72 h-[500px] flex flex-col rounded-xl font-poppins shadow-lg transform transition-transform duration-300 overflow-hidden
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

                {/* Category */}
                <p className="text-gray-500 text-bold text-sm mt-2">
                    {destination.category || "Uncategorized"}
                </p>

                {/* Rating */}
                <div className="flex items-center mt-2">
                    <FaStar className="text-yellow-500" />
                    <span className="ml-1 text-sm">
                        {loadingRating ? (
                            "Loading..."
                        ) : averageRating ? (
                            `${averageRating} (${averageRating >= 4 ? "Excellent" : averageRating >= 3 ? "Good" : "Average"})`
                        ) : (
                            "No ratings yet"
                        )}
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