import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { FaStar } from "react-icons/fa";
import GuideNav from "../../components/GuideNav";

function GuideReviewsList() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch reviews for the current guide
  useEffect(() => {
    const fetchReviews = async () => {
      const guideId = auth.currentUser?.uid; 
      if (!guideId) return;

      try {
        const reviewsQuery = query(
          collection(db, "reviews"),
          where("guideId", "==", guideId)
        );
        const reviewsSnapshot = await getDocs(reviewsQuery);
        const fetchedReviews = reviewsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReviews(fetchedReviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) {
    return <p className="text-center p-6">Loading reviews...</p>;
  }

  return (
    <div className="flex flex-row bg-white">
    {/* Guide Navigation (Left Side) */}
    <div className="w-2/4">
      <GuideNav />
    </div>
    <div className="flex flex-row bg-white w-full mx-10">
      {reviews.length === 0 ? (
        <p className="text-gray-500 my-auto">No reviews yet.</p>
      ) : (
        <div className="space-y-6 py-10">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      className={`text-${star <= review.rating ? "yellow" : "gray"}-400 text-lg`}
                    />
                  ))}
                </div>
                <p className="ml-2 text-gray-600">{review.rating.toFixed(1)}</p>
              </div>
              <h2 className="text-xl font-semibold">{review.title}</h2>
              <p className="text-gray-600">{review.description}</p>
              <p className="text-sm text-gray-500 mt-4">
                By {review.userName} • {new Date(review.timestamp?.toDate()).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
     
    </div>
  );
}

export default GuideReviewsList;