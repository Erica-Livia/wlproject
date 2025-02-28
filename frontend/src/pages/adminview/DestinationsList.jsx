import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { getFirestore, doc, getDoc, collection, getDocs, deleteDoc, updateDoc, query, orderBy } from "firebase/firestore";
import AdminNav from "../../components/AdminNav";
import { MapPin, Edit, Trash2, Search, Plus, Star, Globe, Filter, ArrowUp, ArrowDown } from "lucide-react";

const DestinationsList = () => {
    const [loading, setLoading] = useState(true);
    const [destinations, setDestinations] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedContinent, setSelectedContinent] = useState("all");
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [destinationToDelete, setDestinationToDelete] = useState(null);
    const [sortField, setSortField] = useState("name");
    const [sortDirection, setSortDirection] = useState("asc");

    const navigate = useNavigate();
    const db = getFirestore();

    useEffect(() => {
        const checkAdmin = async () => {
            const user = auth.currentUser;
            // if (!user) {
            //     navigate("/login");
            //     return;
            // }

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
            const destinationsQuery = query(
                collection(db, "destinations"), 
                orderBy(sortField, sortDirection)
            );
            const destinationsSnapshot = await getDocs(destinationsQuery);
            
            const destinationsData = destinationsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate().toLocaleDateString() || "N/A",
            }));
            
            setDestinations(destinationsData);
        } catch (error) {
            console.error("Error fetching destinations:", error);
        }
    };

    const handleDeleteDestination = async () => {
        if (!destinationToDelete) return;
        
        try {
            await deleteDoc(doc(db, "destinations", destinationToDelete.id));
            setDestinations(destinations.filter(dest => dest.id !== destinationToDelete.id));
            setIsConfirmModalOpen(false);
            setDestinationToDelete(null);
        } catch (error) {
            console.error("Error deleting destination:", error);
        }
    };

    const handlePopularToggle = async (destId, currentStatus) => {
        try {
            await updateDoc(doc(db, "destinations", destId), {
                isPopular: !currentStatus
            });
            
            setDestinations(destinations.map(dest => 
                dest.id === destId ? { ...dest, isPopular: !currentStatus } : dest
            ));
        } catch (error) {
            console.error("Error updating destination popular status:", error);
        }
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
        
        // For frontend sorting when not refetching from Firestore
        const sortedDestinations = [...destinations].sort((a, b) => {
            let aValue = a[field];
            let bValue = b[field];
            
            if (sortDirection === "asc") {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
        
        setDestinations(sortedDestinations);
    };

    const filteredDestinations = destinations.filter(dest => {
        const matchesSearch = 
            dest.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
            dest.country?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesContinent = selectedContinent === "all" || dest.continent === selectedContinent;
        
        return matchesSearch && matchesContinent;
    });

    const getSortIcon = (field) => {
        if (sortField !== field) return null;
        return sortDirection === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
    };

    const continentOptions = [
        "Africa", 
        "Asia", 
        "Europe", 
        "North America", 
        "South America", 
        "Australia/Oceania", 
        "Antarctica"
    ];

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <p className="text-lg text-gray-600">Loading destinations...</p>
        </div>
    );

    return (
        <div className="flex flex-row bg-gray-50 min-h-screen">
            {/* Left Sidebar - Admin Navigation */}
            <div className="w-1/4">
                <AdminNav />
            </div>

            {/* Right Side - Destinations List */}
            <div className="p-6 ml-64 w-full">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Destinations Management</h1>
                            <p className="text-gray-500">Manage your travel destinations</p>
                        </div>
                        <button 
                            className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center"
                            onClick={() => navigate("/admin/destinations/create")}
                        >
                            <Plus size={16} className="mr-2" />
                            Add New Destination
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex items-center relative flex-1">
                                <Search size={20} className="absolute left-3 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search destinations by name or country..."
                                    className="pl-10 pr-4 py-2 border rounded-lg w-full"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center">
                                <Filter size={18} className="text-gray-500 mr-2" />
                                <select
                                    className="border rounded-lg px-3 py-2"
                                    value={selectedContinent}
                                    onChange={(e) => setSelectedContinent(e.target.value)}
                                >
                                    <option value="all">All Continents</option>
                                    {continentOptions.map(continent => (
                                        <option key={continent} value={continent}>
                                            {continent}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Destinations Table */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th 
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            onClick={() => handleSort("name")}
                                        >
                                            <div className="flex items-center">
                                                Destination {getSortIcon("name")}
                                            </div>
                                        </th>
                                        <th 
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            onClick={() => handleSort("country")}
                                        >
                                            <div className="flex items-center">
                                                Country {getSortIcon("country")}
                                            </div>
                                        </th>
                                        <th 
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            onClick={() => handleSort("continent")}
                                        >
                                            <div className="flex items-center">
                                                Continent {getSortIcon("continent")}
                                            </div>
                                        </th>
                                        <th 
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            onClick={() => handleSort("createdAt")}
                                        >
                                            <div className="flex items-center">
                                                Created {getSortIcon("createdAt")}
                                            </div>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredDestinations.length > 0 ? (
                                        filteredDestinations.map((destination) => (
                                            <tr key={destination.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                                                            {destination.imageUrl ? (
                                                                <img className="h-10 w-10 object-cover" src={destination.imageUrl} alt={destination.name} />
                                                            ) : (
                                                                <div className="h-10 w-10 flex items-center justify-center">
                                                                    <MapPin size={20} className="text-gray-400" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900 flex items-center">
                                                                {destination.name}
                                                                {destination.isPopular && (
                                                                    <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                                                                        Popular
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {destination.description?.substring(0, 40)}...
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {destination.country || "Not specified"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <Globe size={16} className="text-gray-400 mr-2" />
                                                        <span className="text-sm text-gray-900">
                                                            {destination.continent || "Not specified"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {destination.createdAt}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        destination.isPopular 
                                                            ? 'bg-yellow-100 text-yellow-800' 
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {destination.isPopular ? 'Popular' : 'Standard'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button 
                                                            onClick={() => navigate(`/admin/destinations/edit/${destination.id}`)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                            title="Edit destination"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={() => {
                                                                setDestinationToDelete(destination);
                                                                setIsConfirmModalOpen(true);
                                                            }}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Delete destination"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handlePopularToggle(destination.id, destination.isPopular)}
                                                            className={`hover:text-yellow-900 ${destination.isPopular ? 'text-yellow-500' : 'text-gray-400'}`}
                                                            title={destination.isPopular ? "Remove from popular" : "Mark as popular"}
                                                        >
                                                            <Star size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                                <div className="flex flex-col items-center justify-center">
                                                    <MapPin size={48} className="text-gray-300 mb-2" />
                                                    <p className="text-lg font-medium">No destinations found</p>
                                                    <p className="text-sm mt-1">Try adjusting your search or filter</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Confirmation Modal */}
            {isConfirmModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete "{destinationToDelete?.name}"? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                        <button 
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                    onClick={() => {
                                        setIsConfirmModalOpen(false);
                                        setDestinationToDelete(null);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                    onClick={handleDeleteDestination}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
            )
            
            }
        </div>
    );
};

export default DestinationsList;