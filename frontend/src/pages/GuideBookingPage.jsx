import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, collection, addDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { LuDot } from "react-icons/lu";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PulseLoader } from "react-spinners";

function GuideBookingPage() {
  const { guideId } = useParams();
  const [guide, setGuide] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const navigate = useNavigate();

  // Fetch guide's availability
  useEffect(() => {
    const fetchGuide = async () => {
      try {
        const guideDoc = await getDoc(doc(db, "guides", guideId));
        if (guideDoc.exists()) {
          const guideData = guideDoc.data();
          if (!guideData.availability || typeof guideData.availability !== "object") {
            guideData.availability = {};
          }
          setGuide(guideData);
        } else {
          toast.error("Guide not found");
        }
      } catch (error) {
        toast.error("Error fetching guide details");
      } finally {
        setLoading(false);
      }
    };

    fetchGuide();
  }, [guideId]);

  // Handle date selection
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedSlot("");
  };

  // Handle slot selection
  const handleSlotSelection = (slot) => {
    setSelectedSlot(slot);
  };

  // Handle booking
  const handleBooking = async () => {
    if (!selectedSlot) {
      toast.warn("Please select a time slot.");
      return;
    }

    setIsBooking(true);
    try {
      const booking = {
        userId: auth.currentUser?.uid,
        userName: auth.currentUser?.displayName || "Anonymous",
        guideId,
        date: selectedDate.toISOString().split("T")[0],
        time: selectedSlot,
        status: "pending",
      };

      // Add booking to Firestore
      await addDoc(collection(db, "bookings"), booking);

      // Update guide's availability
      const updatedAvailability = { ...guide.availability };
      const dateKey = selectedDate.toISOString().split("T")[0];
      if (updatedAvailability[dateKey]) {
        updatedAvailability[dateKey] = updatedAvailability[dateKey].filter(
          (slot) => slot !== selectedSlot
        );
      }

      await updateDoc(doc(db, "guides", guideId), {
        availability: updatedAvailability,
      });

      toast.success("Booking successful!");
      setTimeout(() => navigate("/mybookings"), 2000); // Redirect after 2 seconds
    } catch (error) {
      toast.error("Failed to book. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    const confirmCancel = window.confirm(
      "Are you sure you want to leave? Your selections will be lost."
    );
    if (confirmCancel) {
      navigate("/"); // Navigate to the homepage
    }
  };

  // Custom tile content for the calendar
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const dateKey = date.toISOString().split("T")[0];
      const slots = guide?.availability[dateKey] || [];
      if (slots.length > 0) {
        return (
          <div className="flex justify-center text-center">
            <LuDot className="text-blue-500" />
          </div>
        );
      }
    }
    return null;
  };

  // Get available slots for the selected date
  const dateKey = selectedDate.toISOString().split("T")[0];
  const availableSlots = guide?.availability[dateKey] || [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <PulseLoader color="#3B82F6" />
      </div>
    );
  }

  if (!guide) {
    return <p className="text-center p-6">Guide not found.</p>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <ToastContainer />
      <h1 className="text-3xl font-bold mb-8 text-center">Book {guide.name}</h1>

      {/* Calendar */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          tileContent={tileContent}
          minDate={new Date()} // Disable past dates
          className="react-calendar"
        />
      </div>

      {/* Available Slots */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Available Slots</h2>
        {availableSlots.length === 0 ? (
          <p className="text-gray-500">No slots available for this date.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {availableSlots.map((slot) => (
              <button
                key={slot}
                onClick={() => handleSlotSelection(slot)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedSlot === slot
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-blue-100"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={handleCancel}
          className="bg-gray-300 text-gray-800 px-8 py-3 rounded-lg hover:bg-gray-400 transition-all"
        >
          Back to Home
        </button>
        <button
          onClick={handleBooking}
          disabled={isBooking || !selectedSlot}
          className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isBooking ? "Booking..." : "Book Now"}
        </button>
      </div>
    </div>
  );
}

export default GuideBookingPage;