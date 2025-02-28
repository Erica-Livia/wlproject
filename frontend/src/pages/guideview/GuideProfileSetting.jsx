import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../../firebase"; // Import Firebase Storage
import { useAuthState } from "react-firebase-hooks/auth";
import GuideNav from "../../components/GuideNav";

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

    // Fetch the guide's profile data
    useEffect(() => {
        const fetchGuideProfile = async () => {
            if (!user) return;

            try {
                const guideDocRef = doc(db, "guides", user.uid);
                const guideDocSnap = await getDoc(guideDocRef);

                if (guideDocSnap.exists()) {
                    const data = guideDocSnap.data();
                    setName(data.name || "");
                    setCategory(data.category || "");
                    setGuideAddress(data.guideAddress || "");
                    setGuideContactNumber(data.guideContactNumber || "");
                    setGuideEmail(data.guideEmail || "");
                    setBio(data.bio || "");
                    setProfilePictureUrl(data.profilePictureUrl || "");
                }
            } catch (error) {
                console.error("Error fetching guide profile:", error);
            }
        };

        fetchGuideProfile();
    }, [user]);

    // Handle profile picture upload
    const handleProfilePictureChange = (e) => {
        if (e.target.files[0]) {
            setProfilePicture(e.target.files[0]);
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
            };

            const guideDocRef = doc(db, "guides", user.uid);
            await setDoc(guideDocRef, guideData, { merge: true });
            setMessage("Profile updated successfully!");
        } catch (error) {
            console.error("Error saving guide data:", error);
            setMessage("Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="flex flex-row bg-white">
                {/* Guide Navigation (Left Side) */}
                <div className="w-1/4">
                    <GuideNav />
                </div>

                {/* Guide Profile Settings (Right Side) */}
                <div className="w-3/4 p-6 text-black">
                    <div className="max-w-lg mx-auto bg-white shadow-md rounded-lg mt-10 p-6">
                        <h2 className="text-2xl font-bold text-center mb-4">Guide Profile Settings</h2>
                        {message && <p className="text-center text-green-600">{message}</p>}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Profile Picture */}
                            <div>
                                <label className="block font-semibold">Profile Picture</label>
                                {profilePictureUrl && (
                                    <img
                                        src={profilePictureUrl}
                                        alt="Profile"
                                        className="w-24 h-24 rounded-full mb-4"
                                    />
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleProfilePictureChange}
                                    className="w-full border rounded-lg p-2"
                                />
                            </div>

                            {/* Name (readonly) */}
                            <div>
                                <label className="block font-semibold">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    readOnly
                                    className="w-full border rounded-lg p-2 bg-gray-100"
                                />
                            </div>

                            {/* Category (Speciality) */}
                            <div>
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
                            <div>
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
                            <div>
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
                            <div>
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