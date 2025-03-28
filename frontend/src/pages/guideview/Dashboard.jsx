import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../../firebase"; // Adjust the path to your Firebase config
import GuideNav from "../../components/GuideNav";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { FaUsers, FaStar, FaDollarSign, FaClock } from "react-icons/fa";
import { GiMoneyStack } from "react-icons/gi";

function GDashboard() {
  const [bookingsCount, setBookingsCount] = useState(0); // Number of confirmed bookings
  const [rating, setRating] = useState(0); // Average rating
  const [totalEarnings, setTotalEarnings] = useState(0); // Total money earned from confirmed bookings
  const [commission, setCommission] = useState(0); // 10% commission
  const [guideRevenue, setGuideRevenue] = useState(0); // Guide's revenue after commission
  const [loading, setLoading] = useState(true); // Loading state
  const [recentBookings, setRecentBookings] = useState([]); // Recent confirmed bookings
  const [chartData, setChartData] = useState([]); // Data for the earnings chart
  const [guideName, setGuideName] = useState(""); // Guide's name

  // Fetch guide data
  useEffect(() => {
    const fetchGuideData = async () => {
      const guideId = auth.currentUser?.uid; // Get the current guide's ID
      if (!guideId) return;

      try {
        // Fetch guide's name
        const guidesQuery = query(collection(db, "guides"), where("uid", "==", guideId));
        const guidesSnapshot = await getDocs(guidesQuery);
        if (!guidesSnapshot.empty) {
          setGuideName(guidesSnapshot.docs[0].data().name);
        }

        // Fetch confirmed bookings
        const bookingsQuery = query(
          collection(db, "bookings"),
          where("guideId", "==", guideId),
          where("status", "==", "Paid")
        );
        const bookingsSnapshot = await getDocs(bookingsQuery);
        const bookings = bookingsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Set bookings count
        setBookingsCount(bookings.length);

        // Calculate total money earned (convert price to number)
        const totalEarnings = bookings.reduce((sum, booking) => {
          const price = parseFloat(booking.price) || 0; // Convert price to a number
          return sum + price;
        }, 0);
        setTotalEarnings(totalEarnings);

        // Calculate commission (8%) and guide revenue (92%)
        const commissionAmount = totalEarnings * 0.08;
        const guideRevenueAmount = totalEarnings - commissionAmount;

        setCommission(commissionAmount);
        setGuideRevenue(guideRevenueAmount);

        // Set recent bookings (sorted by date)
        const sortedBookings = bookings.sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecentBookings(sortedBookings.slice(0, 5));

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

        // Generate real chart data
        const earningsByMonth = calculateEarningsByMonth(bookings);
        setChartData(earningsByMonth);
      } catch (error) {
        console.error("Error fetching guide data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGuideData();
  }, []);

  // Function to calculate earnings by month
  const calculateEarningsByMonth = (bookings) => {
    const earningsByMonth = {};

    bookings.forEach((booking) => {
      const date = new Date(booking.date);
      const month = date.toLocaleString("default", { month: "short" });
      const year = date.getFullYear();

      const key = `${month} ${year}`;

      if (!earningsByMonth[key]) {
        earningsByMonth[key] = 0;
      }

      // Convert price to a number before addition
      const price = parseFloat(booking.price) || 0;
      earningsByMonth[key] += price;
    });

    // Convert to array of objects for the chart
    return Object.keys(earningsByMonth).map((key) => ({
      month: key,
      earnings: earningsByMonth[key],
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-row bg-gray-50 min-h-screen">
        <div className="">
          <GuideNav />
        </div>
        <p className="text-lg text-gray-600 p-6 ml-64 w-full">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-row bg-white font-poppins">
        {/* Guide Navigation (Left Side) */}
        <div className="">
          <GuideNav />
        </div>

        {/* Dashboard Content */}
        <div className="p-6 m-auto w-3/4">
          {/* Welcome Message */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Welcome Back {guideName}!</h1>
            <p className="text-gray-600">Here's what's happening with your tours today.</p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Card 1: Bookings */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 text-center">
              <div className="flex justify-center">
                <FaUsers className="text-2xl text-guidebg mr-2" />
                <h2 className="text-xl font-bold text-gray-700">Bookings</h2>
              </div>
              <p className="text-3xl mt-4">{bookingsCount}</p>
            </div>

            {/* Card 2: Rating */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 text-center">
              <div className="flex justify-center">
                <FaStar className="text-2xl text-guidebg mr-2" />
                <h2 className="text-xl font-bold text-gray-700">Rating</h2>
              </div>
              <p className="text-3xl mt-4">{rating}</p>
            </div>

            {/* Card 3: Money Earned */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 text-center">
              <div className="flex justify-center">
                <GiMoneyStack className="text-2xl text-guidebg mr-2" />
                <h2 className="text-xl font-bold text-gray-700">Money Earned</h2>
              </div>
              <div className="mt-4">
                <div className="flex justify-between">
                  <p className="text-gray-600">Commission (8%)</p>
                  <p className="font-semibold">{commission.toFixed(2)} BIF</p>
                </div>
                <div className="flex justify-between mt-2">
                  <p className="text-gray-600">Revenue</p>
                  <p className="font-semibold">{guideRevenue.toFixed(2)} BIF</p>
                </div>
              </div>
            </div>

            {/* Card 4: Office Hours */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 text-center">
              <div className="flex justify-center">
                <FaClock className="text-2xl text-guidebg mr-2" />
                <h2 className="text-xl font-bold text-gray-700">Office Hours</h2>
              </div>
              <p className="text-xl mt-4">Mon-Fri, 9 AM - 5 PM</p>
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
                <Bar dataKey="earnings" fill="#268750" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Recent Bookings</h2>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex justify-between items-center p-4 border-b border-gray-100">
                  <div>
                    <p className="font-semibold">{booking.userName}</p>
                    <p className="text-gray-600">{booking.date} at {booking.time}</p>
                  </div>
                  <p className="text-green-500 font-semibold">{booking.price || 0} BIF</p>
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