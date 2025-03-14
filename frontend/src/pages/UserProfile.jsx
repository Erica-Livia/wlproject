import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { FaUserCircle, FaSave, FaSpinner, FaArrowLeft } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function UserProfileSetting() {
    const [user, setUser] = useState(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [bookingsCount, setBookingsCount] = useState(0);
    const navigate = useNavigate();

    // Fetch user data from Firestore
    useEffect(() => {
        const fetchUserData = async () => {
            if (!auth.currentUser) {
                navigate("/login");
                return;
            }

            try {
                const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setUser(userData);
                    setName(userData.name || "");
                    setEmail(userData.email || "");
                }

                const bookingsQuery = query(
                    collection(db, "bookings"),
                    where("userId", "==", auth.currentUser.uid)
                );
                const bookingsSnapshot = await getDocs(bookingsQuery);
                setBookingsCount(bookingsSnapshot.size);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load profile data.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    // Generate initials from the user's name
    const getInitials = (name) => {
        if (!name) return "";
        const names = name.split(" ");
        const initials = names.map((n) => n[0]).join("");
        return initials.toUpperCase();
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!auth.currentUser) return;

        setUpdating(true);

        try {
            // Update user data in Firestore
            await updateDoc(doc(db, "users", auth.currentUser.uid), {
                name,
                email,
            });

            toast.success("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile. Please try again.");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <FaSpinner className="animate-spin text-4xl text-khaki" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <ToastContainer />
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
                <Link
                    to="/"
                    className="flex items-center text-khaki hover:text-blue-600 mb-6"
                >
                    <FaArrowLeft className="mr-2" />
                    Back to Home
                </Link>

                <h1 className="text-2xl font-bold text-gray-800 mb-6">Profile Settings</h1>

                <div className="mb-6">
                    <p className="text-lg text-gray-700">
                        You have made <span className="font-bold">{bookingsCount}</span> bookings so far.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Profile Picture Placeholder */}
                    <div className="flex items-center space-x-6">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-khaki flex items-center justify-center text-white text-2xl font-bold">
                                {getInitials(name)}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Profile picture placeholder with initials.</p>
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-khaki"
                            required
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-khaki"
                            required
                        />
                    </div>

                    {/* Save Button */}
                    <div>
                        <button
                            type="submit"
                            disabled={updating}
                            className="w-full flex items-center justify-center px-4 py-2 bg-khaki text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {updating ? (
                                <>
                                    <FaSpinner className="animate-spin mr-2" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <FaSave className="mr-2" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UserProfileSetting;