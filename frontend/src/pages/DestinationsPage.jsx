import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import { Link } from "react-router-dom";
import { FaSearch, FaStar, FaHeart } from "react-icons/fa";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import TawkToScript from "../components/TawkToScript";
import Footer from "../components/Footer";

function DestinationPage({ theme, toggleTheme }) {
    const [destinations, setDestinations] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filteredDestinations, setFilteredDestinations] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(8);

    // Fetch destinations and their reviews from Firestore
    useEffect(() => {
        const fetchDestinationsAndReviews = async () => {
            try {
                setLoading(true);
                // Fetch destinations
                const destinationsQuery = query(collection(db, "destinations"));
                const destinationsSnapshot = await getDocs(destinationsQuery);

                if (destinationsSnapshot.empty) {
                    setError("No destinations available.");
                    return;
                }

                // Fetch reviews for each destination and calculate average rating
                const fetchedDestinations = await Promise.all(
                    destinationsSnapshot.docs.map(async (doc) => {
                        const destinationData = doc.data();
                        const reviewsQuery = query(collection(db, "reviews"), where("destinationId", "==", doc.id));
                        const reviewsSnapshot = await getDocs(reviewsQuery);
                        const reviews = reviewsSnapshot.docs.map((reviewDoc) => reviewDoc.data());

                        // Calculate average rating
                        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
                        const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : null;

                        return {
                            id: doc.id,
                            ...destinationData,
                            averageRating,
                        };
                    })
                );

                setDestinations(fetchedDestinations);
                setFilteredDestinations(fetchedDestinations);
            } catch (err) {
                console.error("Error fetching destinations:", err);
                setError("Failed to load destinations.");
            } finally {
                setLoading(false);
            }
        };

        fetchDestinationsAndReviews();
    }, []);

    // Filter destinations based on search term and category
    useEffect(() => {
        let filtered = destinations.filter((destination) =>
            destination.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (selectedCategory !== "All") {
            filtered = filtered.filter((destination) => destination.category === selectedCategory);
        }
        setFilteredDestinations(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    }, [searchTerm, selectedCategory, destinations]);

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredDestinations.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredDestinations.length / itemsPerPage);

    // Hero carousel settings
    const heroImages = [
        "https://images.unsplash.com/photo-1614046058536-2f0ded689015?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1672575659699-33e02d8a51a5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1672576499995-52b950a63142?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1672575659057-a2061f9a576b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ];

    const settings = {
        dots: true,
        infinite: false,
        speed: 800,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
    };

    return (
        <>
            <NavBar theme={theme} toggleTheme={toggleTheme} />

            {/* Hero Carousel */}
            <div className="w-full h-[300px] sm:h-[400px]">
                <Slider {...settings}>
                    {heroImages.map((image, index) => (
                        <div
                            key={index}
                            className="relative w-full h-[300px] sm:h-[400px] bg-cover bg-center flex items-center justify-center text-white bg-white"
                            style={{ backgroundImage: `url(${image})` }}
                        >
                            <div className="bg-black bg-opacity-50 p-8 rounded-lg">
                                <h1 className="text-4xl font-bold">Explore the Wonders of Burundi</h1>
                                <p className="text-lg mt-2">Discover breathtaking landscapes, cultural gems, and hidden treasures.</p>
                            </div>
                        </div>
                    ))}
                </Slider>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-wrap justify-center items-center gap-4 p-6 bg-gray-50">
                <div className="flex items-center border rounded-lg px-4 py-2 bg-white shadow-md w-full max-w-md text-black">
                    <FaSearch className="text-gray-500 mr-2" />
                    <input
                        type="text"
                        placeholder="Search destinations..."
                        className="bg-transparent outline-none w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <select
                    className="border rounded-lg px-4 py-2 bg-white shadow-md text-black"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    <option value="All">All Categories</option>
                    <option value="Nature">Nature</option>
                    <option value="Wildlife">Wildlife</option>
                    <option value="Culture">Culture</option>
                    <option value="Beach">Beach</option>
                </select>
            </div>

            {/* Destinations Grid */}
            <div className="font-poppins bg-white grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6 bg-white">
                {loading ? (
                    Array.from({ length: 8 }).map((_, index) => (
                        <div key={index} className="bg-white shadow-lg rounded-lg overflow-hidden">
                            <Skeleton height={200} />
                            <div className="p-4">
                                <Skeleton count={2} />
                            </div>
                        </div>
                    ))
                ) : error ? (
                    <p className="text-center text-red-500 col-span-full">{error}</p>
                ) : currentItems.length === 0 ? (
                    <p className="text-center text-gray-500 col-span-full">No destinations found.</p>
                ) : (
                    currentItems.map((destination) => (
                        <div
                            key={destination.id}
                            className="bg-white text-black shadow-lg rounded-lg overflow-hidden transform transition hover:scale-105 hover:shadow-xl flex flex-col h-[500px]" // Fixed height for the card
                        >
                            <img
                                src={destination.imageUrl || "https://source.unsplash.com/400x300/?travel"}
                                alt={destination.title}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4 flex flex-col flex-grow">
                                <h3 className="text-lg font-semibold">{destination.title}</h3>
                                <h4 className="text-sm text-gray-600 overflow-hidden">
                                    {destination.description.length > 150
                                        ? `${destination.description.substring(0, 150)}...`
                                        : destination.description}
                                </h4>
                                <p className="text-gray-500 text-sm mt-2">Category: {destination.category}</p>
                                <div className="flex items-center mt-2">
                                    <FaStar className="text-yellow-500" />
                                    <span className="ml-1 text-sm">
                                        {destination.averageRating || "No ratings yet"}
                                    </span>
                                </div>
                                <Link to={`/destination-details/${destination.id}`} className="mt-auto">
                                    <button className="mt-4 w-full bg-khaki text-white py-2 rounded-lg transition">
                                        View More
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex bg-white justify-center items-center gap-2 py-6">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-400 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="text-green font-bold">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-400 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
            {/* <TawkToScript /> */}
            <Footer />
        </>
    );
}

export default DestinationPage;