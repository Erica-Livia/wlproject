import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import GuideNav from "../../components/GuideNav";
import { AlertCircle, X } from "lucide-react";

function GuideProfileSetting() {
    const [user] = useAuthState(auth);
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [guideAddress, setGuideAddress] = useState("");
    const [guideContactNumber, setGuideContactNumber] = useState("");
    const [guideEmail, setGuideEmail] = useState("");
    const [bio, setBio] = useState("");
    const [profilePicture, setProfilePicture] = useState(null);
    const [profilePictureUrl, setProfilePictureUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success"); // "success" or "error"

    // Availability States
    const [availabilityList, setAvailabilityList] = useState([]);
    const [day, setDay] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    // Affiliated Destinations
    const [affiliatedDestinations, setAffiliatedDestinations] = useState([]); // Selected destinations
    const [allDestinations, setAllDestinations] = useState([]); // All destinations from Firestore

    // Fetch the guide's profile data and all destinations
    useEffect(() => {
        const fetchGuideProfileAndDestinations = async () => {
            if (!user) return;

            try {
                // Fetch guide profile
                const guideDocRef = doc(db, "guides", user.uid);
                const guideDocSnap = await getDoc(guideDocRef);

                if (guideDocSnap.exists()) {
                    const data = guideDocSnap.data();
                    setName(data.name || "");
                    setCategory(data.category || "");
                    setGuideAddress(data.guideAddress || "");
                    setGuideContactNumber(data.guideContactNumber || "");
                    setGuideEmail(data.guideEmail || user.email || "");
                    setBio(data.bio || "");
                    setProfilePictureUrl(data.profilePictureUrl || "");
                    setAvailabilityList(data.availability || []);
                    setAffiliatedDestinations(data.affiliatedDestinations || []); // Load affiliated destinations
                }

                // Fetch all destinations
                const destinationsCollectionRef = collection(db, "destinations");
                const destinationsSnapshot = await getDocs(destinationsCollectionRef);
                const destinationsList = destinationsSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setAllDestinations(destinationsList);
            } catch (error) {
                console.error("Error fetching data:", error);
                setMessage("Failed to load profile or destinations.");
                setMessageType("error");
            }
        };

        fetchGuideProfileAndDestinations();
    }, [user]);

    // Handle profile picture upload
    const handleProfilePictureChange = (e) => {
        if (e.target.files[0]) {
            setProfilePicture(e.target.files[0]);
        }
    };

    // Handle adding availability
    const handleAddAvailability = (e) => {
        e.preventDefault();

        if (!day || !startTime || !endTime) {
            setMessage("Please fill in all availability fields.");
            setMessageType("error");
            return;
        }

        // Validate time format (startTime should be before endTime)
        if (startTime >= endTime) {
            setMessage("Start time must be before end time.");
            setMessageType("error");
            return;
        }

        const newAvailability = {
            id: Date.now().toString(), // Generate a unique ID
            day,
            startTime,
            endTime,
        };

        setAvailabilityList([...availabilityList, newAvailability]);
        setDay("");
        setStartTime("");
        setEndTime("");
        setMessage("Availability added successfully. Don't forget to save your profile.");
        setMessageType("success");
    };

    // Handle removing availability
    const handleRemoveAvailability = (id) => {
        setAvailabilityList(availabilityList.filter((item) => item.id !== id));
        setMessage("Availability removed. Don't forget to save your profile.");
        setMessageType("success");
    };

    // Handle selecting/deselecting destinations
    const handleDestinationChange = (destinationId) => {
        if (affiliatedDestinations.includes(destinationId)) {
            // Remove destination if already selected
            setAffiliatedDestinations(
                affiliatedDestinations.filter((id) => id !== destinationId)
            );
        } else {
            // Add destination if not selected
            setAffiliatedDestinations([...affiliatedDestinations, destinationId]);
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setMessage("");

        try {
            let profilePictureUrlToSave = profilePictureUrl;

            // Upload new profile picture if selected
            if (profilePicture) {
                const storageRef = ref(storage, `profilePictures/${user.uid}`);
                await uploadBytes(storageRef, profilePicture);
                profilePictureUrlToSave = await getDownloadURL(storageRef);
                setProfilePictureUrl(profilePictureUrlToSave);
            }

            // Save guide data to Firestore
            const guideData = {
                userId: user.uid,
                name,
                category,
                guideAddress,
                guideContactNumber,
                guideEmail,
                bio,
                profilePictureUrl: profilePictureUrlToSave,
                availability: availabilityList,
                affiliatedDestinations, // Include affiliated destinations
                updatedAt: new Date(),
            };

            const guideDocRef = doc(db, "guides", user.uid);
            await setDoc(guideDocRef, guideData, { merge: true });
            setMessage("Profile updated successfully!");
            setMessageType("success");
        } catch (error) {
            console.error("Error saving guide data:", error);
            setMessage("Failed to update profile: " + error.message);
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    return (
        <>
            <div className="flex flex-row bg-white">
                {/* Guide Navigation (Left Side) */}
                <div className="w-1/4">
                    <GuideNav />
                </div>

                {/* Guide Profile Settings (Right Side) */}
                <div className="w-3/4 p-6 text-black">
                    <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg mt-10 p-6">
                        <h2 className="text-2xl font-bold text-center mb-4">Guide Profile Settings</h2>

                        {message && (
                            <div
                                className={`p-4 mb-4 rounded-lg ${
                                    messageType === "success"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                }`}
                            >
                                <div className="flex items-center">
                                    {messageType === "error" && <AlertCircle className="h-5 w-5 mr-2" />}
                                    <p>{message}</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Information Section */}
                            <div className="border-b pb-4">
                                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>

                                {/* Profile Picture */}
                                <div className="mb-4">
                                    <label className="block font-semibold">Profile Picture</label>
                                    <div className="flex items-center mt-2">
                                        {profilePictureUrl && (
                                            <img
                                                src={profilePictureUrl}
                                                alt="Profile"
                                                className="w-24 h-24 rounded-full mr-4 object-cover"
                                            />
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleProfilePictureChange}
                                            className="w-full border rounded-lg p-2"
                                        />
                                    </div>
                                </div>

                                {/* Name (readonly) */}
                                <div className="mb-4">
                                    <label className="block font-semibold">Full Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full border rounded-lg p-2 bg-gray-100"
                                    />
                                </div>

                                {/* Category (Speciality) */}
                                <div className="mb-4">
                                    <label className="block font-semibold">Speciality (Category)</label>
                                    <input
                                        type="text"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        placeholder="e.g. Wildlife Expert, Mountain Guide"
                                        className="w-full border rounded-lg p-2"
                                        required
                                    />
                                </div>

                                {/* Physical Address */}
                                <div className="mb-4">
                                    <label className="block font-semibold">Physical Address</label>
                                    <input
                                        type="text"
                                        value={guideAddress}
                                        onChange={(e) => setGuideAddress(e.target.value)}
                                        placeholder="Enter your address"
                                        className="w-full border rounded-lg p-2"
                                        required
                                    />
                                </div>

                                {/* WhatsApp Contact Number */}
                                <div className="mb-4">
                                    <label className="block font-semibold">WhatsApp Contact</label>
                                    <input
                                        type="text"
                                        value={guideContactNumber}
                                        onChange={(e) => setGuideContactNumber(e.target.value)}
                                        placeholder="+257 123 456 789"
                                        className="w-full border rounded-lg p-2"
                                        required
                                    />
                                </div>

                                {/* Guide Email (readonly) */}
                                <div className="mb-4">
                                    <label className="block font-semibold">Email</label>
                                    <input
                                        type="email"
                                        value={guideEmail}
                                        readOnly
                                        className="w-full border rounded-lg p-2 bg-gray-100"
                                    />
                                </div>

                                {/* Bio */}
                                <div>
                                    <label className="block font-semibold">Bio</label>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="Write a short bio about yourself"
                                        className="w-full border rounded-lg p-2"
                                        rows="4"
                                    />
                                </div>
                            </div>

                            {/* Affiliated Destinations Section */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Affiliated Destinations</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Select the destinations you are affiliated with.
                                </p>

                                {/* Destination Selection */}
                                <div className="space-y-2">
                                    {allDestinations.map((destination) => (
                                        <div key={destination.id} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={destination.id}
                                                checked={affiliatedDestinations.includes(destination.id)}
                                                onChange={() => handleDestinationChange(destination.id)}
                                                className="mr-2"
                                            />
                                            <label htmlFor={destination.id}>{destination.title}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Availability Section */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Availability</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Set your availability for bookings. Clients will be able to book you during these time slots.
                                </p>

                                {/* Add Availability Form */}
                                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                    <h4 className="font-semibold mb-2">Add New Availability</h4>
                                    <div className="flex flex-wrap gap-4">
                                        {/* Day Selection */}
                                        <div className="w-full md:w-auto">
                                            <label className="block text-sm font-medium">Day</label>
                                            <select
                                                value={day}
                                                onChange={(e) => setDay(e.target.value)}
                                                className="w-full border rounded-lg p-2"
                                            >
                                                <option value="">Select Day</option>
                                                {weekdays.map((weekday) => (
                                                    <option key={weekday} value={weekday}>
                                                        {weekday}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Start Time */}
                                        <div className="w-full md:w-auto">
                                            <label className="block text-sm font-medium">Start Time</label>
                                            <input
                                                type="time"
                                                value={startTime}
                                                onChange={(e) => setStartTime(e.target.value)}
                                                className="w-full border rounded-lg p-2"
                                                
                                            />
                                        </div>

                                        {/* End Time */}
                                        <div className="w-full md:w-auto">
                                            <label className="block text-sm font-medium">End Time</label>
                                            <input
                                                type="time"
                                                value={endTime}
                                                onChange={(e) => setEndTime(e.target.value)}
                                                className="w-full border rounded-lg p-2"
                                               
                                            />
                                        </div>

                                        {/* Add Button */}
                                        <div className="w-full md:w-auto flex items-end">
                                            <button
                                                type="button"
                                                onClick={handleAddAvailability}
                                                className="bg-blue-500 text-white py-2 px-4 rounded-lg transition hover:bg-blue-600"
                                            >
                                                Add Slot
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Availability List */}
                                <div>
                                    <h4 className="font-semibold mb-2">Your Availability Slots</h4>
                                    {availabilityList.length === 0 ? (
                                        <p className="text-gray-500 italic">No availability slots added yet.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {availabilityList.map((slot) => (
                                                <div
                                                    key={slot.id}
                                                    className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                                                >
                                                    <div>
                                                        <span className="font-medium">{slot.day}:</span>{" "}
                                                        {slot.startTime} - {slot.endTime}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveAvailability(slot.id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <X size={20} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full bg-khaki text-white py-2 rounded-lg transition hover:bg-green-600"
                                disabled={loading}
                            >
                                {loading ? "Saving..." : "Save Profile"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default GuideProfileSetting;