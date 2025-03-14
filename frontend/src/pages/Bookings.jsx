import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { FaHome, FaCreditCard, FaSpinner } from "react-icons/fa";
import PaymentForm from "../components/PaymentForm";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [filter, setFilter] = useState("upcoming"); // Filter state: "upcoming", "today", or "past"
  const navigate = useNavigate();

  // Set userId once when auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUserId(user?.uid || null);
      if (!user) {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch bookings
  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    const bookingsRef = collection(db, "bookings");
    const q = query(bookingsRef, where("userId", "==", userId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const bookingsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBookings(bookingsList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching bookings:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Handle payment completion
  const handlePaymentComplete = async (bookingId) => {
    try {
      setProcessingPayment(bookingId);

      const bookingRef = doc(db, "bookings", bookingId);
      await updateDoc(bookingRef, { status: "Paid" });

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "Paid" } : b))
      );

      // Close payment modal
      setSelectedBooking(null);
      toast.success("Payment successful!");
    } catch (error) {
      console.error("Payment update failed:", error);
      toast.error("Payment update failed. Please try again.");
    } finally {
      setProcessingPayment(null);
    }
  };

  // Open payment modal
  const openPaymentModal = (booking) => {
    setSelectedBooking(booking);
  };

  // Close payment modal
  const closePaymentModal = () => {
    setSelectedBooking(null);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter and sort bookings
  const filteredBookings = bookings
    .filter((booking) => {
      const today = new Date().toISOString().split("T")[0];
      const bookingDate = booking.date.split("T")[0];

      if (filter === "upcoming") {
        return bookingDate >= today;
      } else if (filter === "today") {
        return bookingDate === today;
      } else if (filter === "past") {
        return bookingDate < today;
      }
      return true;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white min-h-screen">
      <ToastContainer />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Bookings</h1>
        <button
          onClick={() => navigate("/")}
          className="flex items-center space-x-2 px-4 py-2 bg-khaki text-white rounded-lg hover:bg-khaki transition-colors"
        >
          <FaHome />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilter("upcoming")}
          className={`px-4 py-2 rounded-lg ${
            filter === "upcoming"
              ? "bg-khaki text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          Upcoming Tours
        </button>
        <button
          onClick={() => setFilter("today")}
          className={`px-4 py-2 rounded-lg ${
            filter === "today"
              ? "bg-khaki text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          Today's Tours
        </button>
        <button
          onClick={() => setFilter("past")}
          className={`px-4 py-2 rounded-lg ${
            filter === "past"
              ? "bg-khaki text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          Past Tours
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-60">
          <FaSpinner className="animate-spin text-4xl text-blue-500" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg">You don't have any bookings yet.</p>
          <button
            onClick={() => navigate("/destinations")}
            className="mt-4 px-6 py-2 bg-khaki text-white rounded-lg hover:bg-khaki transition-colors"
          >
            Explore Destinations
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destination
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guide
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDate(booking.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {booking.destination}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {booking.guideName || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {booking.status !== "Paid" && (
                      <button
                        onClick={() => openPaymentModal(booking)}
                        disabled={processingPayment === booking.id}
                        className="flex items-center space-x-2 bg-khaki text-white py-2 px-4 rounded-md transition-colors disabled:bg-green-400"
                      >
                        {processingPayment === booking.id ? (
                          <>
                            <FaSpinner className="animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <FaCreditCard />
                            <span>Pay Now</span>
                          </>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payment Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-w-md w-full">
            <PaymentForm
              onPaymentSuccess={() => handlePaymentComplete(selectedBooking.id)}
              onCancel={closePaymentModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;