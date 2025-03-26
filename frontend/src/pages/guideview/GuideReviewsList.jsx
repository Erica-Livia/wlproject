import React, { useEffect, useState } from "react";
import { collection, query, getDocs, updateDoc, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { FaStar, FaUser, FaReply, FaEyeSlash, FaFileExport } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GuideNav from "../../components/GuideNav";
import { saveAs } from "file-saver";

function GuideReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch reviews for the guide
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const reviewsQuery = query(collection(db, "reviews"));
        const reviewsSnapshot = await getDocs(reviewsQuery);
        const reviewsList = [];

        // Fetch destination details for each review
        for (const reviewDoc of reviewsSnapshot.docs) {
          const reviewData = reviewDoc.data();
          const destinationId = reviewData.destinationId;

          // Fetch destination name
          const destinationRef = doc(db, "destinations", destinationId); // Correct usage of `doc`
          const destinationSnap = await getDoc(destinationRef);
          const destinationName = destinationSnap.exists() ? destinationSnap.data().title : "Unknown Destination";

          // Add destination name to review data
          reviewsList.push({
            id: reviewDoc.id,
            ...reviewData,
            destinationName,
          });
        }

        setReviews(reviewsList);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        toast.error("Failed to load reviews.");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Function to reply to a review
  const handleReply = async (reviewId, replyText) => {
    try {
      const reviewRef = doc(db, "reviews", reviewId);
      await updateDoc(reviewRef, { reply: replyText });
      toast.success("Reply submitted successfully!");
      // Update local state to reflect the reply
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review.id === reviewId ? { ...review, reply: replyText } : review
        )
      );
    } catch (error) {
      console.error("Error replying to review:", error);
      toast.error("Failed to submit reply.");
    }
  };

  // Function to hide a review
  const handleHideReview = async (reviewId, isHidden) => {
    try {
      const reviewRef = doc(db, "reviews", reviewId);
      await updateDoc(reviewRef, {
        hidden: isHidden,
      });

      // Update local state to reflect the hidden status
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review.id === reviewId ? { ...review, hidden: isHidden } : review
        )
      );

      toast.success(`Review ${isHidden ? "hidden" : "unhidden"} successfully!`);
    } catch (error) {
      console.error("Error toggling review visibility:", error);
      toast.error("Failed to toggle review visibility.");
    }
  };

  // Function to export reviews as CSV
  const exportReviewsToCSV = () => {
    const headers = ["User Name", "Destination", "Rating", "Review", "Reply", "Hidden"];
    const rows = reviews.map((review) => [
      review.userName,
      review.destinationName,
      review.rating,
      review.description,
      review.reply || "No reply",
      review.hidden ? "Yes" : "No",
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(","), // Add headers
      ...rows.map((row) => row.join(",")), // Add rows
    ].join("\n");

    // Create a Blob and save the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "reviews.csv");
  };

  if (loading) {
    return (
      <div className="flex flex-row bg-gray-50 min-h-screen">
        <div className="">
          <GuideNav />
        </div>
        <p className="text-lg text-gray-600 p-6 ml-64 w-full">Loading Reviews...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-row bg-gray-50 min-h-screen w-full">
      {/* Guide Navigation (Left Side) */}
      <div className="">
        <GuideNav />
      </div>

      {/* Right Side - Reviews List */}
      <div className="p-6 w-full">
        <ToastContainer />
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Reviews</h1>
          <button
            onClick={exportReviewsToCSV}
            className="flex items-center bg-guidebg text-white px-4 py-2 rounded-lg hover:bg-green transition-colors"
          >
            <FaFileExport className="mr-2" />
            Export as CSV
          </button>
        </div>

        {/* Reviews Table */}
        {reviews.length === 0 ? (
          <p className="text-gray-600">No reviews found.</p>
        ) : (
          <div className="bg-white rounded-lg shadow-md">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destination
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Review
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reply
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaUser className="text-gray-500 mr-2" />
                        <p className="text-gray-700">{review.userName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-gray-700">{review.destinationName}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaStar className="text-yellow-500 mr-2" />
                        <p className="text-gray-700">{review.rating}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-gray-700">{review.description}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {review.reply ? (
                        <p className="text-gray-700 max-w-26 whitespace-normal break-words">
                          {review.reply}
                        </p>
                      ) : (
                        <button
                          onClick={() => {
                            const replyText = prompt("Enter your reply:");
                            if (replyText) handleReply(review.id, replyText);
                          }}
                          className="flex items-center text-blue-500 hover:text-blue-700"
                        >
                          <FaReply className="mr-2" />
                          Reply
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleHideReview(review.id, !review.hidden)}
                        className={`flex items-center ${review.hidden ? "text-green-500 hover:text-green-700" : "text-red-500 hover:text-red-700"
                          }`}
                      >
                        {review.hidden ? (
                          <>
                            <FaEyeSlash className="mr-2" />
                            Unhide
                          </>
                        ) : (
                          <>
                            <FaEyeSlash className="mr-2" />
                            Hide
                          </>
                        )}
                      </button>
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

export default GuideReviewsPage;