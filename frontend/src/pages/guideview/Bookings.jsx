import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../../firebase"; // Adjust the path to your Firebase config
import { useNavigate } from "react-router-dom";
import { FaCalendar, FaUser, FaMapMarkerAlt, FaDollarSign, FaClock, FaFileExport } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GuideNav from "../../components/GuideNav";
import { saveAs } from "file-saver"; // Import file-saver

function GuideBookingsPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalEarnings, setTotalEarnings] = useState(0); // Total earnings from all bookings
    const navigate = useNavigate();

    // Fetch bookings for the guide
    useEffect(() => {
        const fetchBookings = async () => {
            const guideId = auth.currentUser?.uid;
            if (!guideId) return;

            try {
                const bookingsQuery = query(
                    collection(db, "bookings"),
                    where("guideId", "==", guideId)
                );
                const bookingsSnapshot = await getDocs(bookingsQuery);
                const bookingsList = bookingsSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setBookings(bookingsList);

                // Calculate total earnings
                const earnings = bookingsList.reduce((sum, booking) => {
                    // Convert price to a number before addition
                    const price = parseFloat(booking.price) || 0;
                    return sum + price;
                }, 0);
                setTotalEarnings(earnings);
            } catch (error) {
                console.error("Error fetching bookings:", error);
                toast.error("Failed to load bookings.");
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    // Function to export bookings as CSV
    const exportBookingsToCSV = () => {
        const headers = ["User Name", "Destination", "Date", "Time", "Price (BIF)", "Status"];
        const rows = bookings.map((booking) => [
            booking.userName,
            booking.destinationName,
            new Date(booking.date).toLocaleDateString(),
            booking.time,
            booking.price,
            booking.status,
        ]);

        // Create CSV content
        const csvContent = [
            headers.join(","), // Add headers
            ...rows.map((row) => row.join(",")), // Add rows
        ].join("\n");

        // Create a Blob and save the file
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
        saveAs(blob, "bookings.csv");
    };

    if (loading) {
        return (
            <div className="flex flex-row bg-gray-50 min-h-screen">
                <div className="">
                    <GuideNav />
                </div>
                <p className="text-lg text-gray-600 p-6 ml-64 w-full">Loading Booking List...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-row bg-gray-50 min-h-screen">
            {/* Guide Navigation (Left Side) */}
            <div className="">
                <GuideNav />
            </div>

            {/* Right Side - Bookings List */}
            <div className="p-6 w-full">
                <ToastContainer />
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">My Bookings</h1>
                    <button
                        onClick={exportBookingsToCSV}
                        className="flex items-center bg-guidebg text-white px-4 py-2 rounded-lg hover:bg-green transition-colors"
                    >
                        <FaFileExport className="mr-2" />
                        Export as CSV
                    </button>
                </div>

                {/* Summary Section */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Summary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-600">Total Bookings</p>
                            <p className="text-2xl font-bold text-gray-800">{bookings.length}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-600">Total Earnings</p>
                            <p className="text-2xl font-bold text-gray-800">{totalEarnings} BIF</p>
                        </div>
                    </div>
                </div>

                {/* Bookings Table */}
                {bookings.length === 0 ? (
                    <p className="text-gray-600">You don't have any bookings yet.</p>
                ) : (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Destination
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date & Time
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {bookings.map((booking) => (
                                    <tr
                                        key={booking.id}
                                        onClick={() => navigate(`/guide/booking/${booking.id}`)}
                                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <FaUser className="text-gray-500 mr-2" />
                                                <p className="text-gray-700">{booking.userName}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <FaMapMarkerAlt className="text-gray-500 mr-2" />
                                                <p className="text-gray-700">{booking.destinationName}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <FaCalendar className="text-gray-500 mr-2" />
                                                <p className="text-gray-700">
                                                    {new Date(booking.date).toLocaleDateString()} at {booking.time}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <p className="text-gray-700">{booking.price} BIF</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-1 rounded-full text-sm font-medium ${booking.status === "Paid"
                                                        ? "bg-green-100 text-green-800"
                                                        : booking.status === "Pending"
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : "bg-red-100 text-red-800"
                                                    }`}
                                            >
                                                {booking.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default GuideBookingsPage;