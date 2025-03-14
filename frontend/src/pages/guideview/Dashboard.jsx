import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../../firebase"; // Adjust the path to your Firebase config
import GuideNav from "../../components/GuideNav";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { FaUsers, FaStar, FaDollarSign, FaClock } from "react-icons/fa";

function GDashboard() {
  const [userInteractions, setUserInteractions] = useState(0); // Number of users who contacted the guide
  const [rating, setRating] = useState(0); // Average rating
  const [moneyEarned, setMoneyEarned] = useState(0); // Total money earned
  const [loading, setLoading] = useState(true); // Loading state
  const [recentBookings, setRecentBookings] = useState([]); // Recent bookings
  const [chartData, setChartData] = useState([]); // Data for the earnings chart

  // Fetch guide data
  useEffect(() => {
    const fetchGuideData = async () => {
      const guideId = auth.currentUser?.uid; // Get the current guide's ID
      if (!guideId) return;

      try {
        // Fetch user interactions (number of unique users who contacted the guide)
        const chatSessionsQuery = query(
          collection(db, "chatSessions"),
          where("guideId", "==", guideId)
        );
        const chatSessionsSnapshot = await getDocs(chatSessionsQuery);
        const uniqueUsers = new Set(chatSessionsSnapshot.docs.map((doc) => doc.data().userId));
        setUserInteractions(uniqueUsers.size);

        // Fetch average rating from reviews
        const reviewsQuery = query(
          collection(db, "guideReviews"),
          where("guideId", "==", guideId)
        );
        const reviewsSnapshot = await getDocs(reviewsQuery);
        const reviews = reviewsSnapshot.docs.map((doc) => doc.data());
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;
        setRating(averageRating);

        // Fetch money earned (dummy data for now)
        // Replace this with actual logic to calculate earnings
        const earnings = 200;
        setMoneyEarned(earnings);

        // Fetch recent bookings
        const bookingsQuery = query(
          collection(db, "bookings"),
          where("guideId", "==", guideId),
          where("status", "==", "confirmed")
        );
        const bookingsSnapshot = await getDocs(bookingsQuery);
        console.log("Bookings Query Results:", bookingsSnapshot.docs.map((doc) => doc.data()));
        
        const bookings = bookingsSnapshot.docs.map((doc) => doc.data());
        console.log("Bookings:", bookings);
        
        setRecentBookings(bookings.slice(0, 5));

        // Generate chart data (dummy data for now)
        const data = [
          { month: "Jan", earnings: 100 },
          { month: "Feb", earnings: 200 },
          { month: "Mar", earnings: 150 },
          { month: "Apr", earnings: 300 },
          { month: "May", earnings: 400 },
        ];
        setChartData(data);
      } catch (error) {
        console.error("Error fetching guide data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGuideData();
  }, []);

  if (loading) {
    return <p className="text-center p-6">Loading...</p>;
  }

  return (
    <>
      <div className="flex flex-row bg-white">
        {/* Guide Navigation (Left Side) */}
        <div className="w-1/4">
          <GuideNav />
        </div>

        {/* Dashboard Content */}
        <div className="p-6 ml-64 w-3/4">
          {/* Welcome Message */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Welcome Back, Guide!</h1>
            <p className="text-gray-600">Here's what's happening with your tours today.</p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Card 1: User Interactions */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="flex items-center">
                <FaUsers className="text-2xl text-blue-500 mr-2" />
                <h2 className="text-xl font-semibold text-gray-700">User Interactions</h2>
              </div>
              <p className="text-3xl font-bold mt-2">{userInteractions}</p>
            </div>

            {/* Card 2: Rating */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="flex items-center">
                <FaStar className="text-2xl text-yellow-500 mr-2" />
                <h2 className="text-xl font-semibold text-gray-700">Rating</h2>
              </div>
              <p className="text-3xl font-bold mt-2">{rating}</p>
            </div>

            {/* Card 3: Money Earned */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="flex items-center">
                <FaDollarSign className="text-2xl text-green-500 mr-2" />
                <h2 className="text-xl font-semibold text-gray-700">Money Earned</h2>
              </div>
              <p className="text-3xl font-bold mt-2">${moneyEarned}</p>
            </div>

            {/* Card 4: Office Hours */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="flex items-center">
                <FaClock className="text-2xl text-purple-500 mr-2" />
                <h2 className="text-xl font-semibold text-gray-700">Office Hours</h2>
              </div>
              <p className="text-xl font-bold mt-2">Mon-Fri, 9 AM - 5 PM</p>
            </div>
          </div>

          {/* Earnings Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Earnings Overview</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="earnings" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Recent Bookings</h2>
            <div className="space-y-4">
              {recentBookings.map((booking, index) => (
                <div key={index} className="flex justify-between items-center p-4 border-b border-gray-100">
                  <div>
                    <p className="font-semibold">{booking.tourName}</p>
                    <p className="text-gray-600">{booking.date}</p>
                  </div>
                  <p className="text-green-500 font-semibold">${booking.price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default GDashboard;