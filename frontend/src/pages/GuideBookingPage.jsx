import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, collection, addDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { LuDot } from "react-icons/lu";
import { FaClock, FaUser, FaMapMarkerAlt } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PulseLoader } from "react-spinners";

function GuideBookingPage() {
  const { guideId, destinationId } = useParams();
  const [guide, setGuide] = useState(null);
  const [destination, setDestination] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const navigate = useNavigate();

  // Debugging: Log guideId and destinationId
  console.log("Guide ID:", guideId, "Destination ID:", destinationId);

  // Fetch guide and destination details
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Validate guideId and destinationId
        if (!guideId || !destinationId) {
          toast.error("Invalid guide or destination ID.");
          navigate("/");
          return;
        }

        // Fetch guide details
        const guideDoc = await getDoc(doc(db, "guides", guideId));
        if (!guideDoc.exists()) {
          toast.error("Guide not found.");
          navigate("/");
          return;
        }
        const guideData = guideDoc.data();
        if (!guideData.availability || !Array.isArray(guideData.availability)) {
          guideData.availability = [];
        }
        setGuide(guideData);

        // Fetch destination details
        const destinationDoc = await getDoc(doc(db, "destinations", destinationId));
        if (!destinationDoc.exists()) {
          toast.error("Destination not found.");
          navigate("/");
          return;
        }
        setDestination(destinationDoc.data());

        // Generate available slots for the selected date
        generateAvailableSlotsForDate(selectedDate, guideData.availability);
      } catch (error) {
        toast.error("Error fetching data");
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [guideId, destinationId, navigate]);

  // Generate 1-hour time slots from the guide's availability
  const generateTimeSlots = (startTime, endTime) => {
    const slots = [];
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);

    let current = new Date(start);
    while (current < end) {
      const timeString = current.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const nextHour = new Date(current);
      nextHour.setHours(current.getHours() + 1);

      if (nextHour <= end) {
        const endTimeString = nextHour.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });

        slots.push(`${timeString} - ${endTimeString}`);
      }

      current.setHours(current.getHours() + 1);
    }

    return slots;
  };

  // Get available slots for a given date based on guide's weekly schedule
  const generateAvailableSlotsForDate = (date, availability) => {
    if (!availability || !Array.isArray(availability)) {
      setAvailableTimeSlots([]);
      return;
    }

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = dayNames[date.getDay()];

    const dateKey = date.toISOString().split("T")[0];
    const existingBookings = guide?.bookedSlots?.[dateKey] || [];

    const daySchedule = availability.find((schedule) => schedule.day === dayName);

    if (daySchedule) {
      const slots = generateTimeSlots(daySchedule.startTime, daySchedule.endTime);
      const availableSlots = slots.filter((slot) => !existingBookings.includes(slot));
      setAvailableTimeSlots(availableSlots);
    } else {
      setAvailableTimeSlots([]);
    }
  };

  // Handle date selection
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedSlot("");
    generateAvailableSlotsForDate(date, guide?.availability);
  };

  // Handle slot selection
  const handleSlotSelection = (slot) => {
    setSelectedSlot(slot);
  };

  // Handle booking
  const handleBooking = async () => {
    if (!auth.currentUser) {
      toast.warn("Please log in to book a guide.");
      navigate("/login");
      return;
    }

    if (!selectedSlot) {
      toast.warn("Please select a time slot.");
      return;
    }

    setIsBooking(true);
    try {
      const dateKey = selectedDate.toISOString().split("T")[0];

      const booking = {
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || "Anonymous",
        userEmail: auth.currentUser.email,
        guideId,
        guideName: guide.name,
        destinationId, 
        destinationName: destination.title, // Include destination name
        price: destination.price, // Include destination price
        date: dateKey,
        time: selectedSlot,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      // Add booking to Firestore
      await addDoc(collection(db, "bookings"), booking);

      // Update guide's booked slots
      const updatedBookedSlots = { ...(guide.bookedSlots || {}) };

      if (!updatedBookedSlots[dateKey]) {
        updatedBookedSlots[dateKey] = [];
      }

      updatedBookedSlots[dateKey].push(selectedSlot);

      await updateDoc(doc(db, "guides", guideId), {
        bookedSlots: updatedBookedSlots,
      });

      toast.success("Booking successful!");
      setTimeout(() => navigate("/mybookings"), 2000);
    } catch (error) {
      toast.error("Failed to book. Please try again.");
      console.error("Booking error:", error);
    } finally {
      setIsBooking(false);
    }
  };

  // Check if a date has available slots
  const hasAvailableSlots = (date) => {
    if (!guide?.availability || !Array.isArray(guide.availability)) return false;

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = dayNames[date.getDay()];

    return guide.availability.some((schedule) => schedule.day === dayName);
  };

  // Custom tile content for the calendar
  const tileContent = ({ date, view }) => {
    if (view === "month" && hasAvailableSlots(date)) {
      return (
        <div className="flex justify-center text-center">
          <LuDot className="text-blue-500" size={24} />
        </div>
      );
    }
    return null;
  };

  // Custom tile class for the calendar
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      if (hasAvailableSlots(date)) {
        return "available-date";
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        return "past-date";
      }
    }
    return null;
  };

  // Handle cancel
  const handleCancel = () => {
    const confirmCancel = window.confirm(
      "Are you sure you want to leave? Your selections will be lost."
    );
    if (confirmCancel) {
      navigate("/");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <PulseLoader color="#3B82F6" />
      </div>
    );
  }

  if (!guide || !destination) {
    return <p className="text-center p-6">Guide or destination not found.</p>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto font-poppins">
      <ToastContainer />

      {/* Guide Info Header */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md flex flex-col md:flex-row items-center gap-6">
        <div className="md:w-1/4">
          {guide.profilePictureUrl ? (
            <img
              src={guide.profilePictureUrl}
              alt={guide.name}
              className="w-40 h-40 rounded-full object-cover mx-auto border-4 border-blue-100"
            />
          ) : (
            <div className="w-40 h-40 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
              <FaUser size={50} className="text-green" />
            </div>
          )}
        </div>

        <div className="md:w-3/4 text-center md:text-left">
          <h1 className="text-3xl font-bold mb-2">{guide.name}</h1>
          <div className="flex items-center justify-center md:justify-start mb-2">
            <FaMapMarkerAlt className="text-red-500 mr-2" />
            <span>{guide.guideAddress || "Location not specified"}</span>
          </div>
          <div className="flex items-center justify-center md:justify-start mb-4">
            <FaClock className="text-blue-500 mr-2" />
            <span>Available {guide.availability?.length || 0} days a week</span>
          </div>
          <p className="text-gray-700">{guide.bio || "No biography available."}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calendar */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Select a Date</h2>
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            tileContent={tileContent}
            tileClassName={tileClassName}
            minDate={new Date()}
            className="react-calendar mx-auto"
          />
          <div className="mt-4 flex items-center justify-center">
            <div className="flex items-center mr-4">
              <div className="w-4 h-4 rounded-full bg-khaki mr-2"></div>
              <span className="text-sm">Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-gray-300 mr-2"></div>
              <span className="text-sm">Unavailable</span>
            </div>
          </div>
        </div>

        {/* Available Slots */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            Available Times for {selectedDate.toLocaleDateString()}
          </h2>
          {availableTimeSlots.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-2">No slots available for this date.</p>
              <p className="text-sm text-gray-400">Please select another date from the calendar.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {availableTimeSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => handleSlotSelection(slot)}
                  className={`px-4 py-3 rounded-lg transition-all flex items-center justify-center ${selectedSlot === slot
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-blue-100"
                    }`}
                >
                  <FaClock className="mr-2" size={14} />
                  {slot}
                </button>
              ))}
            </div>
          )}

          {/* Booking Summary */}
          {selectedSlot && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Booking Summary</h3>
              <p className="mb-1"><strong>Guide:</strong> {guide.name}</p>
              <p className="mb-1"><strong>Destination:</strong> {destination.title}</p>
              <p className="mb-1"><strong>Date:</strong> {selectedDate.toLocaleDateString()}</p>
              <p className="mb-1"><strong>Time:</strong> {selectedSlot}</p>
              <p className="mb-1"><strong>Price:</strong> {destination.price} BIF</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between gap-4 mt-6">
            <button
              onClick={handleCancel}
              className="bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400 transition-all flex-1"
            >
              Cancel
            </button>
            <button
              onClick={handleBooking}
              disabled={isBooking || !selectedSlot}
              className="bg-khaki text-white px-6 py-3 rounded-lg hover:bg-green transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-1"
            >
              {isBooking ? "Booking..." : "Book Now"}
            </button>
          </div>
        </div>
      </div>

      {/* Custom styles */}
      <style jsx>{`
        .react-calendar {
          border: none;
          width: 100%;
        }
        
        .react-calendar__tile {
          padding: 14px 6px;
        }
        
        .react-calendar__tile--active {
          background: #666048;
          color: white;
        }

        .react-calendar__tile--active:hover {
          background: #283226;
        }
        
        .react-calendar__tile.available-date:not(.react-calendar__tile--active) {
          background-color: #EFF6FF;
          color: #4C4A36;
          position: relative;
        }
        
        .react-calendar__tile.past-date {
          background-color: #F3F4F6;
          color: #9CA3AF;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

export default GuideBookingPage;