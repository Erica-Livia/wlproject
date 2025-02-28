import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import { Link } from "react-router-dom";
import { FaSearch, FaStar } from "react-icons/fa";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../firebase";
import Skeleton from "react-loading-skeleton";
import TawkToScript from "../components/TawkToScript";
import "react-loading-skeleton/dist/skeleton.css";
import Footer from "../components/Footer";

function GuidesPage({ theme, toggleTheme }) {
    const [guides, setGuides] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filteredGuides, setFilteredGuides] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(8);

    useEffect(() => {
        const fetchGuides = async () => {
            try {
                setLoading(true);
                const guidesQuery = query(collection(db, "guides"));
                const guidesSnapshot = await getDocs(guidesQuery);

                if (guidesSnapshot.empty) {
                    setError("No guides available.");
                    return;
                }

                const fetchedGuides = guidesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                setGuides(fetchedGuides);
                setFilteredGuides(fetchedGuides);
            } catch (err) {
                console.error("Error fetching guides:", err);
                setError("Failed to load guides.");
            } finally {
                setLoading(false);
            }
        };

        fetchGuides();
    }, []);

    useEffect(() => {
        let filtered = guides.filter((guide) =>
            guide.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredGuides(filtered);
        setCurrentPage(1);
    }, [searchTerm, guides]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredGuides.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredGuides.length / itemsPerPage);

    return (
        <>
            <NavBar theme={theme} toggleTheme={toggleTheme} />
            <div className="flex justify-center items-center gap-4 p-6 bg-white">
                <div className="flex items-center border rounded-lg px-4 py-2 bg-white shadow-md w-full max-w-md text-black">
                    <FaSearch className="text-gray-500 mr-2" />
                    <input
                        type="text"
                        placeholder="Search guides..."
                        className="bg-transparent outline-none w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6 bg-white">
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
                    <p className="text-center text-gray-500 col-span-full">No guides found.</p>
                ) : (
                    currentItems.map((guide) => (
                        <div
                            key={guide.id}
                            className="bg-white text-black shadow-lg rounded-lg overflow-hidden transform transition hover:scale-105 hover:shadow-xl"
                        >
                            <img
                                src={guide.imageUrl || "https://source.unsplash.com/400x300/?person"}
                                alt={guide.name}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                                <h3 className="text-lg font-semibold">{guide.name}</h3>
                                <p className="text-gray-500 text-sm mt-2">Specialty: {guide.category}</p>
                                <div className="flex items-center mt-2">
                                    <FaStar className="text-yellow-500" />
                                    <span className="ml-1 text-sm">
                                        {guide.rating ? guide.rating.toFixed(1) : "No ratings yet"}
                                    </span>
                                </div>
                                <Link to={`/guide-details/${guide.id}`}>
                                    <button className="mt-4 w-full bg-khaki text-white py-2 rounded-lg transition">
                                        View Details
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
            {totalPages > 1 && (
                <div className="flex bg-white justify-center items-center gap-2 py-6 ">
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
            <TawkToScript />
            <Footer />
        </>
    );
}

export default GuidesPage;
