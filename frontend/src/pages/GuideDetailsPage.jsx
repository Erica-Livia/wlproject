import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { doc, getDoc, collection, addDoc, query, where, getDocs, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { FaStar, FaChevronLeft } from "react-icons/fa";
import LoginPage from "./LoginPage";
import NavBar from "../components/NavBar";

function GuideDetailsPage({ theme, toggleTheme }) {
    const { guideId } = useParams(); // Get guide ID from URL
    const navigate = useNavigate();
    const [user] = useAuthState(auth);
    const [guide, setGuide] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewTitle, setReviewTitle] = useState("");
    const [reviewDescription, setReviewDescription] = useState("");
    const [reviewRating, setReviewRating] = useState(0);

    useEffect(() => {
        const fetchGuideAndReviews = async () => {
            try {
                // Fetch guide details
                const guideDoc = await getDoc(doc(db, "guides", guideId));
                if (guideDoc.exists()) {
                    setGuide(guideDoc.data());
                } else {
                    console.error("Guide not found");
                }

                // Fetch reviews
                const reviewsQuery = query(collection(db, "guideReviews"), where("guideId", "==", guideId));
                const reviewsSnapshot = await getDocs(reviewsQuery);
                const fetchedReviews = reviewsSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setReviews(fetchedReviews);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchGuideAndReviews();
    }, [guideId]);

    // Handle contact guide
    const handleContactGuide = async () => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }

        try {
            // Log the contact in Firestore
            await addDoc(collection(db, "guideContacts"), {
                guideId,
                userId: user.uid,
                contactedAt: new Date().toISOString(),
            });

            // Update the contact count in the guide document
            const guideRef = doc(db, "guides", guideId);
            const guideSnap = await getDoc(guideRef);
            if (guideSnap.exists()) {
                const currentCount = guideSnap.data().contactCount || 0;
                await updateDoc(guideRef, { contactCount: currentCount + 1 });
            }

            // Navigate to the chat page
            alert("Guide contact logged successfully!");
            navigate(`/chat/${guideId}`);
        } catch (error) {
            console.error("Error logging contact:", error);
        }
    };

    // Handle submit review
    const handleSubmitReview = async () => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }

        if (!reviewTitle || !reviewDescription || reviewRating === 0) {
            alert("Please fill out all fields and provide a rating.");
            return;
        }

        try {
            // Add the review to the guideReviews collection
            await addDoc(collection(db, "guideReviews"), {
                guideId,
                userId: user.uid,
                userName: user.displayName || "Anonymous",
                title: reviewTitle,
                description: reviewDescription,
                rating: reviewRating,
                timestamp: new Date(),
            });

            // Fetch all reviews for the guide
            const reviewsQuery = query(collection(db, "guideReviews"), where("guideId", "==", guideId));
            const reviewsSnapshot = await getDocs(reviewsQuery);
            const fetchedReviews = reviewsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Calculate the new average rating
            const totalRating = fetchedReviews.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = (totalRating / fetchedReviews.length).toFixed(1);

            // Update the guide document with the new average rating
            const guideRef = doc(db, "guides", guideId);
            await updateDoc(guideRef, {
                averageRating: parseFloat(averageRating), // Ensure it's stored as a number
                totalReviews: fetchedReviews.length, // Optional: Store the total number of reviews
            });

            // Refresh reviews in the UI
            setReviews(fetchedReviews);

            // Reset form
            setReviewTitle("");
            setReviewDescription("");
            setReviewRating(0);
            setShowReviewForm(false);
            alert("Review submitted!");
        } catch (error) {
            console.error("Error submitting review:", error);
        }
    };

    // Close login modal
    const handleCloseLoginModal = () => {
        setShowLoginModal(false);
    };

    // Calculate average rating
    const averageRating = guide?.averageRating || "No ratings yet";

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="h-64 bg-gray-200 rounded-lg"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mt-6"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mt-2"></div>
                </div>
            </div>
        );
    }

    if (!guide) {
        return <p className="text-center p-6">Guide not found.</p>;
    }

    return (
        <>
            <NavBar theme={theme} toggleTheme={toggleTheme} />
            <div className="max-w-4xl mx-auto p-6 bg-white text-black rounded-lg mt-10">
                {/* Breadcrumbs */}
                <div className="flex items-center text-sm text-gray-600 mb-4">
                    <button onClick={() => navigate(-1)} className="flex items-center hover:text-blue-500">
                        <FaChevronLeft className="mr-1" /> Back
                    </button>
                    <span className="mx-2">/</span>
                    <span>{guide.name}</span>
                </div>

                {/* Guide Details */}
                <div className="text-center">
                    <img src={guide.profilePictureUrl} alt="Guide" className="w-48 h-48 rounded-full mx-auto border-4 border-white shadow-lg" />
                    <h2 className="text-3xl font-bold mt-4">{guide.name}</h2>
                    <p className="text-gray-500 text-lg mt-1">{guide.category}</p>
                </div>

                <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4">About</h3>
                    <p className="text-gray-700 leading-relaxed text-lg">{guide.bio}</p>
                </div>

                {/* Contact Button */}
                <div className="mt-8 text-center">
                    <Link to={`/chat/${guideId}`}>
                        <button
                            onClick={handleContactGuide}
                            className="bg-khaki text-white px-8 py-4 rounded-lg hover:bg-green transition duration-300 text-lg"
                        >
                            Contact Guide
                        </button>
                    </Link>
                </div>

                {/* Reviews Section */}
                <div className="mt-10">
                    <h3 className="text-xl font-semibold mb-6">Average Rating: {averageRating}</h3>
                    <div className="mt-6">
                        {reviews.length === 0 ? (
                            <p className="text-gray-500 text-lg">No reviews yet. Be the first to write one!</p>
                        ) : (
                            reviews.map((review) => (
                                <div key={review.id} className="bg-gray-50 p-6 rounded-lg mb-6 shadow-sm">
                                    <h4 className="font-semibold text-xl">{review.title}</h4>
                                    <p className="text-gray-600 mt-2 text-lg">{review.description}</p>
                                    <div className="flex items-center mt-4">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <FaStar
                                                key={star}
                                                className={`text-${star <= review.rating ? "yellow-400" : "gray-300"} text-2xl`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-3">
                                        By {review.userName} • {new Date(review.timestamp?.toDate()).toLocaleDateString()}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                    <button
                        onClick={() => (user ? setShowReviewForm(true) : setShowLoginModal(true))}
                        className="mt-6 bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition duration-300 text-lg"
                    >
                        Write a Review
                    </button>
                </div>

                {/* Review Form Modal */}
                {showReviewForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white p-8 rounded-lg w-full max-w-md">
                            <h3 className="text-xl font-semibold mb-6">Write a Review</h3>
                            <input
                                type="text"
                                placeholder="Title"
                                value={reviewTitle}
                                onChange={(e) => setReviewTitle(e.target.value)}
                                className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                            />
                            <textarea
                                placeholder="Description"
                                value={reviewDescription}
                                onChange={(e) => setReviewDescription(e.target.value)}
                                className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                                rows="4"
                            />
                            <div className="flex gap-2 mb-6">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setReviewRating(star)}
                                        className={`text-${star <= reviewRating ? "yellow-400" : "gray-300"} text-3xl`}
                                    >
                                        <FaStar />
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setShowReviewForm(false)}
                                    className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition duration-300 text-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitReview}
                                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300 text-lg"
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Login Modal */}
                {showLoginModal && (
                    <LoginPage onClose={handleCloseLoginModal} />
                )}
            </div>
        </>
    );
}

export default GuideDetailsPage;