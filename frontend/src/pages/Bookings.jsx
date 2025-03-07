import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { FaHome, FaCreditCard, FaSpinner, FaTimes } from "react-icons/fa";
import PaymentForm from "../components/PaymentForm";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
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
    } catch (error) {
      console.error("Payment update failed:", error);
      alert("Payment update failed. Please try again.");
    } finally {
      setProcessingPayment(null);
    }
  };

  const openPaymentModal = (booking) => {
    setSelectedBooking(booking);
  };

  const closePaymentModal = () => {
    setSelectedBooking(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Bookings</h1>
        <button
          onClick={() => navigate("/")}
          className="flex items-center space-x-2 px-4 py-2 bg-khaki text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaHome />
          <span>Back to Home</span>
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
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Explore Destinations
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h3 className="text-lg font-semibold">{booking.destination}</h3>
                <p className="text-sm text-gray-500">
                  Booking ID: {booking.id.substring(0, 8)}...
                </p>
              </div>

              <div className="p-6 space-y-3 bg-textWhite">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{formatDate(booking.date)}</span>
                </div>

                {booking.guests && (
                  <div className="flex justify-between bg-textWhite">
                    <span className="text-gray-600">Guests:</span>
                    <span className="font-medium">{booking.guests}</span>
                  </div>
                )}

                {booking.price && (
                  <div className="flex justify-between bg-textWhite">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-medium">${booking.price}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </span>
                </div>
              </div>

              {booking.status !== "Paid" && (
                <div className="px-6 py-4 bg-gray-50 border-t">
                  <button
                    onClick={() => openPaymentModal(booking)}
                    disabled={processingPayment === booking.id}
                    className="w-full flex items-center justify-center space-x-2 bg-khaki text-white py-2 px-4 rounded-md transition-colors disabled:bg-green-400"
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
                </div>
              )}
            </div>
          ))}
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