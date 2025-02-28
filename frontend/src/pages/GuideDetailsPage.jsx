import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, setDoc, collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";

function GuideDetailsPage() {
    const { guideId } = useParams(); // Get guide ID from URL
    const [user] = useAuthState(auth);
    const [guide, setGuide] = useState(null);
    const [rating, setRating] = useState(5);
    const [review, setReview] = useState("");
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        const fetchGuideDetails = async () => {
            try {
                const guideDoc = await getDoc(doc(db, "guides", guideId));
                if (guideDoc.exists()) {
                    setGuide(guideDoc.data());
                } else {
                    setGuide({
                        name: "John Doe",
                        category: "Historical Guide",
                        bio: "A passionate tour guide with 10 years of experience in historical tours.",
                        profilePicture: "/default-profile.jpg",
                        guideEmail: "johndoe@example.com",
                        guideContactNumber: "1234567890"
                    });
                }
            } catch (error) {
                console.error("Error fetching guide details:", error);
            }
        };

        const fetchReviews = async () => {
            try {
                const q = query(collection(db, "guideReviews"), where("guideId", "==", guideId));
                const querySnapshot = await getDocs(q);
                const reviewsList = querySnapshot.docs.map(doc => doc.data());
                setReviews(reviewsList.length > 0 ? reviewsList : [{ rating: 5, review: "Amazing guide! Highly recommended." }]);
            } catch (error) {
                console.error("Error fetching reviews:", error);
            }
        };

        fetchGuideDetails();
        fetchReviews();
    }, [guideId]);

    // Log contact to Firestore
    const handleContactGuide = async () => {
        if (!user) return alert("You must be logged in to contact a guide.");

        try {
            await addDoc(collection(db, "guideContacts"), {
                guideId,
                userId: user.uid,
                contactedAt: new Date().toISOString()
            });

            const guideRef = doc(db, "guides", guideId);
            const guideSnap = await getDoc(guideRef);
            if (guideSnap.exists()) {
                const currentCount = guideSnap.data().contactCount || 0;
                await setDoc(guideRef, { contactCount: currentCount + 1 }, { merge: true });
            }

            alert("Guide contact logged successfully!");
            window.open(`https://wa.me/${guide.guideContactNumber}`, "_blank");
        } catch (error) {
            console.error("Error logging contact:", error);
        }
    };

    // Submit review
    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!user) return alert("You must be logged in to submit a review.");

        try {
            await addDoc(collection(db, "guideReviews"), {
                guideId,
                userId: user.uid,
                rating,
                review,
                createdAt: new Date().toISOString()
            });

            alert("Review submitted successfully!");
            setReview("");
        } catch (error) {
            console.error("Error submitting review:", error);
        }
    };

    if (!guide) return <p className="text-center mt-10">Loading guide details...</p>;

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
            <div className="text-center">
                <img src={guide.profilePicture} alt="Guide" className="w-32 h-32 rounded-full mx-auto" />
                <h2 className="text-2xl font-bold mt-2">{guide.name}</h2>
                <p className="text-gray-500">{guide.category}</p>
            </div>

            <div className="mt-6">
                <h3 className="text-lg font-semibold">About</h3>
                <p>{guide.bio}</p>
            </div>

            <div className="mt-6">
                <h3 className="text-lg font-semibold">Contact Information</h3>
                <p><strong>Email:</strong> {guide.guideEmail}</p>
                <p><strong>WhatsApp:</strong> {guide.guideContactNumber}</p>
            </div>

            <div className="mt-6 text-center">
                <button
                    onClick={handleContactGuide}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg"
                >
                    Contact on WhatsApp
                </button>
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-semibold">Rate & Review</h3>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                    <select
                        value={rating}
                        onChange={(e) => setRating(parseInt(e.target.value))}
                        className="w-full border rounded-lg p-2"
                    >
                        {[5, 4, 3, 2, 1].map((num) => (
                            <option key={num} value={num}>{num} Star{num > 1 ? "s" : ""}</option>
                        ))}
                    </select>
                    <textarea
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        placeholder="Write your review here..."
                        className="w-full border rounded-lg p-2"
                        required
                    />
                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg">Submit Review</button>
                </form>
            </div>

            <div className="mt-6">
                <h3 className="text-lg font-semibold">Reviews</h3>
                {reviews.length > 0 ? (
                    reviews.map((rev, index) => (
                        <div key={index} className="border-t pt-2 mt-2">
                            <p><strong>{rev.rating} ⭐</strong> - {rev.review}</p>
                        </div>
                    ))
                ) : (
                    <p>No reviews yet.</p>
                )}
            </div>
        </div>
    );
}

export default GuideDetailsPage;