import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";
import AdminNav from "../../components/AdminNav";
import { Search, Star, Download, MapPin, Users, Map, ArrowUp, ArrowDown } from "lucide-react"; // Added sorting icons
import { saveAs } from "file-saver";

const DestinationsList = () => {
    const [loading, setLoading] = useState(true);
    const [destinations, setDestinations] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRating, setSelectedRating] = useState("all");
    const [showAllDestinations, setShowAllDestinations] = useState(false);
    const [sortCriteria, setSortCriteria] = useState("name"); // Sorting criteria: "name" or "rating"
    const [sortOrder, setSortOrder] = useState("asc"); // Sorting order: "asc" or "desc"

    const navigate = useNavigate();
    const db = getFirestore();

    useEffect(() => {
        const checkAdmin = async () => {
            const user = auth.currentUser;
            if (!user) {
                navigate("/login");
                return;
            }

            const userDoc = await getDoc(doc(db, "users", user.uid));
            const userData = userDoc.data();

            if (!userData || userData.role !== "admin") {
                navigate("/");
                return;
            }

            await fetchDestinations();
            setLoading(false);
        };

        checkAdmin();
    }, [navigate, db]);

    const fetchDestinations = async () => {
        try {
            // Fetch all destinations
            const destinationsSnapshot = await getDocs(collection(db, "destinations"));
            const destinationsData = await Promise.all(
                destinationsSnapshot.docs.map(async (doc) => {
                    const destinationId = doc.id;

                    // Fetch reviews for the destination
                    const reviewsSnapshot = await getDocs(collection(db, "reviews"));
                    const reviews = reviewsSnapshot.docs
                        .filter(review => review.data().destinationId === destinationId)
                        .map(review => review.data().rating);

                    // Calculate average rating
                    const averageRating = reviews.length > 0
                        ? (reviews.reduce((sum, rating) => sum + rating, 0) / reviews.length)
                        : 0;

                    // Fetch all guides
                    const guidesSnapshot = await getDocs(collection(db, "guides"));
                    const guides = guidesSnapshot.docs;

                    // Count affiliated guides for this destination
                    const affiliatedGuides = guides.filter(guide =>
                        guide.data().affiliatedDestinations?.includes(destinationId)
                    ).length;

                    return {
                        id: destinationId,
                        ...doc.data(),
                        rating: averageRating,
                        reviews: reviews.length,
                        guides: affiliatedGuides // Number of affiliated guides
                    };
                })
            );

            setDestinations(destinationsData);
        } catch (error) {
            console.error("Error fetching destinations:", error);
        }
    };

    const handleExportData = () => {
        const headers = ["Destination Name", "Rating", "Number of Reviews", "Affiliated Guides", "Location"];
        const data = filteredDestinations.map(destination => [
            destination.title,
            destination.rating.toFixed(1),
            destination.reviews,
            destination.guides,
            destination.location // Include location in the exported CSV
        ]);

        const csvContent = [
            headers.join(","),
            ...data.map(row => row.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
        saveAs(blob, `destinations_${selectedRating === "all" ? "all" : selectedRating}.csv`);
    };

    const handleSort = (criteria) => {
        if (sortCriteria === criteria) {
            // Toggle sort order if the same criteria is selected
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            // Set new criteria and default to ascending order
            setSortCriteria(criteria);
            setSortOrder("asc");
        }
    };

    const filteredDestinations = showAllDestinations
        ? destinations
        : destinations.filter(destination => {
            const matchesSearch =
                destination.title?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesRating =
                selectedRating === "all" ||
                (destination.rating !== undefined && destination.rating >= parseFloat(selectedRating));

            return matchesSearch && matchesRating;
        });

    // Sort destinations based on criteria and order
    const sortedDestinations = [...filteredDestinations].sort((a, b) => {
        if (sortCriteria === "name") {
            // Sort by name (alphabetical order)
            const nameA = a.title.toLowerCase();
            const nameB = b.title.toLowerCase();
            return sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        } else if (sortCriteria === "rating") {
            // Sort by rating
            return sortOrder === "asc" ? a.rating - b.rating : b.rating - a.rating;
        }
        return 0;
    });

    return (
        <div className="flex flex-row bg-white min-h-screen font-poppins">
            {/* Left Sidebar - Admin Navigation */}
            <div className="">
                <AdminNav />
            </div>

            {/* Right Side - Destinations List */}
            <div className="p-6 w-full">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Destinations Management</h1>
                        </div>
                        <button
                            className="px-4 py-2 bg-adminbg text-white rounded-lg flex items-center"
                            onClick={handleExportData}
                        >
                            <Download size={16} className="mr-2" />
                            Export Data
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex items-center relative flex-1">
                                <Search size={20} className="absolute left-3 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search destinations by name..."
                                    className="pl-10 pr-4 py-2 border rounded-lg w-full"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    disabled={showAllDestinations}
                                />
                            </div>
                            <div className="flex items-center">
                                <label className="mr-2 text-gray-700">Rating:</label>
                                <select
                                    className="border rounded-lg px-3 py-2"
                                    value={selectedRating}
                                    onChange={(e) => setSelectedRating(e.target.value)}
                                    disabled={showAllDestinations}
                                >
                                    <option value="all">All Ratings</option>
                                    <option value="4">4+ Stars</option>
                                    <option value="3">3+ Stars</option>
                                    <option value="2">2+ Stars</option>
                                    <option value="1">1+ Stars</option>
                                </select>
                            </div>
                            <div className="flex items-center">
                                <label className="mr-2 text-gray-700">Show All:</label>
                                <input
                                    type="checkbox"
                                    checked={showAllDestinations}
                                    onChange={(e) => setShowAllDestinations(e.target.checked)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sorting Controls */}
                    <div className="flex gap-4 mb-6">
                        <button
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg flex items-center"
                            onClick={() => handleSort("name")}
                        >
                            Sort by Name
                            {sortCriteria === "name" && (
                                sortOrder === "asc" ? <ArrowUp size={16} className="ml-2" /> : <ArrowDown size={16} className="ml-2" />
                            )}
                        </button>
                        <button
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg flex items-center"
                            onClick={() => handleSort("rating")}
                        >
                            Sort by Rating
                            {sortCriteria === "rating" && (
                                sortOrder === "asc" ? <ArrowUp size={16} className="ml-2" /> : <ArrowDown size={16} className="ml-2" />
                            )}
                        </button>
                        <button
                            className="px-4 py-2 bg-adminbg text-white rounded-lg flex items-center"
                            onClick={() => navigate("/admin-add-destination")}
                        >
                            Add a new destination
                        </button>


                    </div>


                    {/* Destinations Table */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviews</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Affiliated Guides</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {sortedDestinations.length > 0 ? (
                                        sortedDestinations.map((destination) => (
                                            <tr key={destination.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0">
                                                            <MapPin size={24} className="text-gray-500" />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{destination.title}</div>
                                                            <div className="text-sm text-gray-500">ID: {destination.id.slice(0, 8)}...</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <Star size={16} className="text-yellow-500 mr-1" />
                                                        <span className="text-sm text-gray-900">{destination.rating.toFixed(1)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{destination.reviews}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <Users size={16} className="text-gray-500 mr-1" />
                                                        <span className="text-sm text-gray-900">{destination.guides}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <Map size={16} className="text-gray-500 mr-1" />
                                                        <span className="text-sm text-gray-900">{destination.location}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                                No destinations found matching your criteria
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-gray-50 px-6 py-3 flex justify-between items-center">
                            <span className="text-sm text-gray-700">
                                Showing <span className="font-medium">{sortedDestinations.length}</span> destinations
                            </span>
                            <div className="flex space-x-2">
                                <button className="px-3 py-1 border rounded-md text-sm text-gray-600">Previous</button>
                                <button className="px-3 py-1 border rounded-md bg-adminbg text-sm text-white">Next</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DestinationsList;