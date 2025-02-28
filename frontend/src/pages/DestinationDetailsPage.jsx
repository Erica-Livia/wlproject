import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";
import { FaStar, FaRegStar, FaChevronLeft } from "react-icons/fa";
import NavBar from "../components/NavBar";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import LoginPage from "./LoginPage";

function DestinationDetailsPage({ theme, toggleTheme }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [destination, setDestination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewTitle, setReviewTitle] = useState("");
    const [reviewDescription, setReviewDescription] = useState("");
    const [reviewRating, setReviewRating] = useState(0);
    const user = auth.currentUser;

    useEffect(() => {
        const fetchDestinationAndReviews = async () => {
            try {
                // Fetch destination
                const docRef = doc(db, "destinations", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setDestination(docSnap.data());
                } else {
                    console.error("Destination not found");
                }

                // Fetch reviews
                const reviewsQuery = query(collection(db, "reviews"), where("destinationId", "==", id));
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

        fetchDestinationAndReviews();
    }, [id]);

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
            // Add review to Firestore
            await addDoc(collection(db, "reviews"), {
                destinationId: id,
                userId: user.uid,
                userName: user.displayName || "Anonymous",
                title: reviewTitle,
                description: reviewDescription,
                rating: reviewRating,
                timestamp: new Date(),
            });

            // Refresh reviews
            const reviewsQuery = query(collection(db, "reviews"), where("destinationId", "==", id));
            const reviewsSnapshot = await getDocs(reviewsQuery);
            const fetchedReviews = reviewsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
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

    const handleCloseLoginModal = () => {
        setShowLoginModal(false);
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[1, 2, 3].map((_, index) => (
                            <div key={index} className="h-64 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-full mt-6"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mt-2"></div>
                </div>
            </div>
        );
    }

    if (!destination) {
        return <p className="text-center p-6">Destination not found.</p>;
    }

    // Calculate average rating from reviews
    const averageRating =
        reviews.length > 0
            ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
            : "No ratings yet";

    // Image Carousel Settings
    const carouselSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
    };

    return (
        <>
            <NavBar theme={theme} toggleTheme={toggleTheme} />
            <div className="bg-white text-black font-poppins">
                <div className="max-w-4xl mx-auto p-6">
                    {/* Breadcrumbs */}
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                        <button onClick={() => navigate(-1)} className="flex items-center hover:text-blue-500">
                            <FaChevronLeft className="mr-1" /> Back
                        </button>
                        <span className="mx-2">/</span>
                        <span>{destination.title}</span>
                    </div>

                    {/* Destination Title */}
                    <h1 className="text-3xl font-bold text-center">{destination.title}</h1>
                    <p className="text-center text-gray-600">{destination.category} • {destination.location}</p>

                    {/* Image Carousel */}
                    <div className="mt-6">
                        <Slider {...carouselSettings}>
                            <img src={destination.imageUrl} alt="Main" className="rounded-lg w-full h-64 sm:h-96 object-cover" />
                            <img src={destination.imageUrl1 || destination.imageUrl} alt="Alternate 1" className="rounded-lg w-full h-64 sm:h-96 object-cover" />
                            <img src={destination.imageUrl2 || destination.imageUrl} alt="Alternate 2" className="rounded-lg w-full h-64 sm:h-96 object-cover" />
                        </Slider>
                    </div>

                    {/* Description */}
                    <p className="mt-6 text-gray-700 leading-relaxed">{destination.description}</p>

                    {/* Extra Details */}
                    <div className="mt-6 bg-gray-100 p-4 rounded-lg">
                        <p><strong>Best Time to Visit:</strong> {destination.bestTime || "All year round"}</p>
                        <p><strong>Activities:</strong> {destination.activities || "Hiking, sightseeing, cultural tours"}</p>
                    </div>

                    {/* Combined Rating and Reviews Section */}
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold">Average Rating: {averageRating}</h3>
                        <div className="mt-4">
                            {reviews.length === 0 ? (
                                <p className="text-gray-500">No reviews yet. Be the first to write one!</p>
                            ) : (
                                reviews.map((review) => (
                                    <div key={review.id} className="bg-gray-100 p-4 rounded-lg mb-4">
                                        <h4 className="font-semibold">{review.title}</h4>
                                        <p className="text-gray-600">{review.description}</p>
                                        <div className="flex items-center mt-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <FaStar
                                                    key={star}
                                                    className={`text-${star <= review.rating ? "yellow" : "gray"}-400 text-sm`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-2">
                                            By {review.userName} • {new Date(review.timestamp?.toDate()).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                        <button
                            onClick={() => (user ? setShowReviewForm(true) : setShowLoginModal(true))}
                            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                        >
                            Write a Review
                        </button>
                    </div>

                    {/* Review Form Modal */}
                    {showReviewForm && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <div className="bg-white p-6 rounded-lg w-full max-w-md">
                                <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
                                <input
                                    type="text"
                                    placeholder="Title"
                                    value={reviewTitle}
                                    onChange={(e) => setReviewTitle(e.target.value)}
                                    className="w-full p-2 border rounded-lg mb-4"
                                />
                                <textarea
                                    placeholder="Description"
                                    value={reviewDescription}
                                    onChange={(e) => setReviewDescription(e.target.value)}
                                    className="w-full p-2 border rounded-lg mb-4"
                                    rows="4"
                                />
                                <div className="flex gap-2 mb-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setReviewRating(star)}
                                            className={`text-${star <= reviewRating ? "yellow" : "gray"}-400 text-xl`}
                                        >
                                            <FaStar />
                                        </button>
                                    ))}
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => setShowReviewForm(false)}
                                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmitReview}
                                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                                    >
                                        Submit
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Login Modal */}
            {showLoginModal && (
                <LoginPage onClose={handleCloseLoginModal} />
            )}
        </>
    );
}

export default DestinationDetailsPage;