import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../../firebase"; // Adjust the path to your Firebase config
import GuideNav from "../../components/GuideNav";

function GDashboard() {
  const [userInteractions, setUserInteractions] = useState(0); // Number of users who contacted the guide
  const [rating, setRating] = useState(0); // Average rating
  const [moneyEarned, setMoneyEarned] = useState(0); // Total money earned
  const [loading, setLoading] = useState(true); // Loading state

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
          collection(db, "reviews"),
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
        <div className="p-6 ml-64">
          <h1 className="text-3xl font-bold mb-8">Guide Dashboard</h1>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-black">
            {/* Card 1: User Interactions */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-700">User Interactions</h2>
              <p className="text-3xl font-bold mt-2">{userInteractions}</p>
            </div>

            {/* Card 2: Rating */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-700">Rating</h2>
              <p className="text-3xl font-bold mt-2">{rating}</p>
            </div>

            {/* Card 3: Money Earned */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-700">Money Earned</h2>
              <p className="text-3xl font-bold mt-2">${moneyEarned}</p>
            </div>

            {/* Card 4: Office Hours (Dummy Data) */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-700">Office Hours</h2>
              <p className="text-xl font-bold mt-2">Mon-Fri, 9 AM - 5 PM</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default GDashboard;