import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { getFirestore, doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import AdminNav from "../../components/AdminNav";
import { MapPin, Image, Save, X, ArrowLeft } from "lucide-react";

const CreateDestination = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        country: "",
        description: "",
        featuredImage: null,
        continent: "",
        isPopular: false,
        coordinates: {
            latitude: "",
            longitude: ""
        }
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const navigate = useNavigate();
    const db = getFirestore();
    const storage = getStorage();

    useEffect(() => {
        const checkAdmin = async () => {
            // const user = auth.currentUser;
            // if (!user) {
            //     navigate("/login");
            //     return;
            // }

            const userDoc = await getDoc(doc(db, "users", user.uid));
            const userData = userDoc.data();

            if (!userData || userData.role !== "admin") {
                navigate("/");
                return;
            }

            setLoading(false);
        };

        checkAdmin();
    }, [navigate, db]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name === "latitude" || name === "longitude") {
            setFormData({
                ...formData,
                coordinates: {
                    ...formData.coordinates,
                    [name]: value
                }
            });
        } else {
            setFormData({
                ...formData,
                [name]: type === "checkbox" ? checked : value
            });
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({
                ...formData,
                featuredImage: file
            });
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageRemove = () => {
        setFormData({
            ...formData,
            featuredImage: null
        });
        setImagePreview(null);
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            setError("Destination name is required");
            return false;
        }
        if (!formData.country.trim()) {
            setError("Country is required");
            return false;
        }
        if (!formData.description.trim()) {
            setError("Description is required");
            return false;
        }
        if (!formData.featuredImage) {
            setError("Featured image is required");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        
        if (!validateForm()) return;
        
        setSaving(true);
        
        try {
            // Upload image to Firebase Storage
            const imageRef = ref(storage, `destinations/${Date.now()}_${formData.featuredImage.name}`);
            const uploadResult = await uploadBytes(imageRef, formData.featuredImage);
            const imageUrl = await getDownloadURL(uploadResult.ref);
            
            // Add destination to Firestore
            const destinationData = {
                name: formData.name,
                country: formData.country,
                description: formData.description,
                continent: formData.continent,
                isPopular: formData.isPopular,
                imageUrl: imageUrl,
                coordinates: {
                    latitude: parseFloat(formData.coordinates.latitude) || null,
                    longitude: parseFloat(formData.coordinates.longitude) || null
                },
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            
            await addDoc(collection(db, "destinations"), destinationData);
            
            setSuccess("Destination created successfully!");
            
            // Reset form
            setFormData({
                name: "",
                country: "",
                description: "",
                featuredImage: null,
                continent: "",
                isPopular: false,
                coordinates: {
                    latitude: "",
                    longitude: ""
                }
            });
            setImagePreview(null);
            
        } catch (error) {
            console.error("Error creating destination:", error);
            setError("Failed to create destination: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <p className="text-lg text-gray-600">Loading...</p>
        </div>
    );

    return (
        <div className="flex flex-row bg-gray-50 min-h-screen">
            {/* Left Sidebar - Admin Navigation */}
            <div className="w-1/4">
                <AdminNav />
            </div>

            {/* Right Side - Create Destination Form */}
            <div className="p-6 ml-64 w-full">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center mb-6">
                        <button 
                            onClick={() => navigate("/admin/destinations")}
                            className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Create New Destination</h1>
                            <p className="text-gray-500">Add a new destination to the database</p>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Destination Name*
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Paris"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Country*
                                </label>
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                    placeholder="e.g. France"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Continent
                                </label>
                                <select
                                    name="continent"
                                    value={formData.continent}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select a continent</option>
                                    <option value="Africa">Africa</option>
                                    <option value="Asia">Asia</option>
                                    <option value="Europe">Europe</option>
                                    <option value="North America">North America</option>
                                    <option value="South America">South America</option>
                                    <option value="Australia/Oceania">Australia/Oceania</option>
                                    <option value="Antarctica">Antarctica</option>
                                </select>
                            </div>

                            <div className="col-span-2">
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Description*
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Provide a description of this destination..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-36"
                                    required
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Latitude
                                </label>
                                <input
                                    type="text"
                                    name="latitude"
                                    value={formData.coordinates.latitude}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 48.8566"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Longitude
                                </label>
                                <input
                                    type="text"
                                    name="longitude"
                                    value={formData.coordinates.longitude}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 2.3522"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="col-span-2">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="isPopular"
                                        id="isPopular"
                                        checked={formData.isPopular}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="isPopular" className="ml-2 block text-gray-700 text-sm font-medium">
                                        Mark as popular destination
                                    </label>
                                </div>
                            </div>

                            <div className="col-span-2">
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Featured Image*
                                </label>
                                {!imagePreview ? (
                                    <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                        <div className="space-y-1 text-center">
                                            <Image className="mx-auto h-12 w-12 text-gray-400" />
                                            <div className="flex text-sm text-gray-600">
                                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                                                    <span>Upload an image</span>
                                                    <input
                                                        id="file-upload"
                                                        name="file-upload"
                                                        type="file"
                                                        className="sr-only"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                    />
                                                </label>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                PNG, JPG, GIF up to 10MB
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-2 relative">
                                        <img 
                                            src={imagePreview} 
                                            alt="Preview" 
                                            className="h-64 w-full object-cover rounded-md"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleImageRemove}
                                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                type="button"
                                onClick={() => navigate("/admin/destinations")}
                                className="mr-3 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:bg-blue-400"
                            >
                                {saving ? "Saving..." : (
                                    <>
                                        <Save size={16} className="mr-2" />
                                        Save Destination
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateDestination;