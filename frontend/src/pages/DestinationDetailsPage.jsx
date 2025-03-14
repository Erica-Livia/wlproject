import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, addDoc, query, where, getDocs, serverTimestamp, updateDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { FaStar, FaRegStar, FaChevronLeft } from "react-icons/fa";
import NavBar from "../components/NavBar";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import LoginPage from "./LoginPage";
import StartChat from "../components/StartChat";
import { CiEdit } from "react-icons/ci";
import { IoTrashBinOutline } from "react-icons/io5";

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
    const [editingReview, setEditingReview] = useState(null);
    const [editReviewTitle, setEditReviewTitle] = useState("");
    const [editReviewDescription, setEditReviewDescription] = useState("");
    const [editReviewRating, setEditReviewRating] = useState(0);
    const [guides, setGuides] = useState([]);
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

                // Fetch affiliated guides
                const guidesQuery = query(collection(db, "guides"), where("affiliatedDestinations", "array-contains", id));
                const guidesSnapshot = await getDocs(guidesQuery);
                const fetchedGuides = guidesSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setGuides(fetchedGuides);
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

    const handleEditReview = (review) => {
        setEditingReview(review);
        setEditReviewTitle(review.title);
        setEditReviewDescription(review.description);
        setEditReviewRating(review.rating);
    };

    const handleUpdateReview = async () => {
        if (!editReviewTitle || !editReviewDescription || editReviewRating === 0) {
            alert("Please fill out all fields and provide a rating.");
            return;
        }

        try {
            const reviewRef = doc(db, "reviews", editingReview.id);
            await updateDoc(reviewRef, {
                title: editReviewTitle,
                description: editReviewDescription,
                rating: editReviewRating,
                timestamp: serverTimestamp(),
            });

            // Refresh reviews
            const reviewsQuery = query(collection(db, "reviews"), where("destinationId", "==", id));
            const reviewsSnapshot = await getDocs(reviewsQuery);
            const fetchedReviews = reviewsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setReviews(fetchedReviews);

            // Reset editing state
            setEditingReview(null);
            alert("Review updated successfully!");
        } catch (error) {
            console.error("Error updating review:", error);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (window.confirm("Are you sure you want to delete this review?")) {
            try {
                await deleteDoc(doc(db, "reviews", reviewId));

                // Refresh reviews
                const reviewsQuery = query(collection(db, "reviews"), where("destinationId", "==", id));
                const reviewsSnapshot = await getDocs(reviewsQuery);
                const fetchedReviews = reviewsSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setReviews(fetchedReviews);

                alert("Review deleted successfully!");
            } catch (error) {
                console.error("Error deleting review:", error);
            }
        }
    };

    const handleReportReview = async (reviewId) => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }

        try {
            // Add the reported review to the "reportedReviews" collection
            await addDoc(collection(db, "reportedReviews"), {
                reviewId,
                reportedBy: user.uid,
                timestamp: serverTimestamp(),
            });

            alert("Review reported successfully. An admin will review it.");
        } catch (error) {
            console.error("Error reporting review:", error);
        }
    };

    const handleContactGuide = async (guideId) => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }

        try {
            // Check if a chat session already exists
            const chatSessionQuery = query(
                collection(db, "chatSessions"),
                where("guideId", "==", guideId),
                where("userId", "==", user.uid)
            );
            const chatSessionSnapshot = await getDocs(chatSessionQuery);

            let chatId;

            if (chatSessionSnapshot.empty) {
                // Create a new chat session
                const newChatSession = await addDoc(collection(db, "chatSessions"), {
                    guideId,
                    userId: user.uid,
                    userName: user.displayName || "Anonymous",
                    guideName: guides.find((g) => g.id === guideId)?.name || "Guide",
                    lastMessage: "Chat started",
                    lastMessageTimestamp: serverTimestamp(),
                    status: "active",
                });

                chatId = newChatSession.id;

                // Add the first message to the chats collection
                await addDoc(collection(db, "chats"), {
                    guideId,
                    userId: user.userId,
                    userName: user.name,
                    message: "Hello, I need help!",
                    timestamp: serverTimestamp(),
                });
            } else {
                // Use the existing chat session ID
                chatId = chatSessionSnapshot.docs[0].id;
            }

            // Redirect to the chat page
            navigate(`/chat/${guideId}`);
        } catch (error) {
            console.error("Error starting chat:", error);
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

                    {/* Affiliated Guides Section */}
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-4">Tour Guides</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {guides.map((guide) => (
                                <div key={guide.id} className="bg-gray-100 p-4 rounded-lg shadow-sm">
                                    <img src={guide.profilePictureUrl} alt={guide.name} className="w-24 h-24 rounded-full mx-auto mb-4" />
                                    <h4 className="text-center font-semibold">{guide.name}</h4>
                                    <p className="text-center text-sm text-gray-600">{guide.category}</p>
                                    <button
                                        onClick={() => navigate(`/book-guide/${guide.id}`)}
                                        className="mt-4 w-full bg-khaki text-white px-4 py-2 rounded-lg hover:bg-green"
                                    >
                                        Book Now
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Combined Rating and Reviews Section */}
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-8">Average Rating: {averageRating}⭐</h3>
                        <h4>Want to share an experience from this destination? Leave a review bellow!</h4>
                        <button
                            onClick={() => (user ? setShowReviewForm(true) : setShowLoginModal(true))}
                            className="mt-4 bg-khaki text-white px-4 py-2 rounded-lg hover:bg-green transition"
                        >
                            Leave a Review
                        </button>
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
                                        {/* Edit and Delete Buttons */}
                                        {user && review.userId === user.uid && (
                                            <div className="flex gap-2 mt-4">
                                                <button
                                                    onClick={() => handleEditReview(review)}
                                                    className="bg-textWhite text-black px-2 py-1 text-24px rounded-lg hover:bg-khaki hover:text-white"
                                                >
                                                    <CiEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteReview(review.id)}
                                                    className="bg-textThite text-red-600  text-24px px-2 py-1 rounded-lg hover:bg-red-400 hover:text-white"
                                                >
                                                    <IoTrashBinOutline />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                        
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

                    {editingReview && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <div className="bg-white p-6 rounded-lg w-full max-w-md">
                                <h3 className="text-lg font-semibold mb-4">Edit Review</h3>
                                <input
                                    type="text"
                                    placeholder="Title"
                                    value={editReviewTitle}
                                    onChange={(e) => setEditReviewTitle(e.target.value)}
                                    className="w-full p-2 border rounded-lg mb-4"
                                />
                                <textarea
                                    placeholder="Description"
                                    value={editReviewDescription}
                                    onChange={(e) => setEditReviewDescription(e.target.value)}
                                    className="w-full p-2 border rounded-lg mb-4"
                                    rows="4"
                                />
                                <div className="flex gap-2 mb-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setEditReviewRating(star)}
                                            className={`text-${star <= editReviewRating ? "yellow" : "gray"}-400 text-xl`}
                                        >
                                            <FaStar />
                                        </button>
                                    ))}
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => setEditingReview(null)}
                                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdateReview}
                                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                                    >
                                        Update
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* {user && reviews.userId !== user.uid && (
                        <button
                            onClick={() => handleReportReview(reviews.id)}
                            className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600"
                        >
                            Report
                        </button>
                    )} */}
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