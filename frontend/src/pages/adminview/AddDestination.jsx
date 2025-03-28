import React, { useState } from 'react';
import { db, storage } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AddDestination = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        shortdesc: '',
        description: '',
        location: '',
        price: '',
        category: '',
        bestTime: '',
        activities: '',
        imageUrl: '',
        imageUrl1: '',
        imageUrl2: ''
    });

    const [images, setImages] = useState({
        image0: null,
        image1: null,
        image2: null
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const { name, files } = e.target;
        setImages(prev => ({
            ...prev,
            [name]: files[0]
        }));
    };

    const uploadImage = async (image) => {
        if (!image) return null;
        const storageRef = ref(storage, `destinations/${Date.now()}_${image.name}`);
        const snapshot = await uploadBytes(storageRef, image);
        return await getDownloadURL(snapshot.ref);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Upload images
            const imageUrls = await Promise.all([
                uploadImage(images.image0),
                uploadImage(images.image1),
                uploadImage(images.image2)
            ]);

            // Prepare destination data
            const destinationData = {
                ...formData,
                imageUrl: imageUrls[0] || formData.imageUrl,
                imageUrl1: imageUrls[1] || formData.imageUrl1,
                imageUrl2: imageUrls[2] || formData.imageUrl2,
                activities: formData.activities.split(',').map(a => a.trim()),
                averageRating: 0, // Initialize rating
                price: parseFloat(formData.price)
            };

            // Add to Firestore
            const docRef = await addDoc(collection(db, 'destinations'), destinationData);

            toast.success('Destination added successfully!');
            navigate('/admin/destinations'); // Redirect to destinations list
        } catch (error) {
            console.error('Error adding destination:', error);
            toast.error('Failed to add destination');
        }
    };

    const handleCancel = () => {
        // Use navigate to go back to the previous page or destinations list
        navigate('/admin-destinations-list');
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Add New Destination</h1>
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <div className="grid md:grid-cols-2 gap-4">
                    {/* Basic Information */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Title
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                required
                            />
                        </label>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Short Description
                            <input
                                type="text"
                                name="shortdesc"
                                value={formData.shortdesc}
                                onChange={handleInputChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                required
                            />
                        </label>
                    </div>

                    {/* Location and Price */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Location
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                required
                            />
                        </label>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Price (BIF)
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                required
                            />
                        </label>
                    </div>

                    {/* Detailed Information */}
                    <div className="mb-4 md:col-span-2">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Description
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 h-32"
                                required
                            />
                        </label>
                    </div>

                    {/* Category and Best Time */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Category
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                required
                            >
                                <option value="">Select Category</option>
                                <option value="Nature">Nature</option>
                                <option value="Culture">Culture</option>
                                <option value="Adventure">Adventure</option>
                                <option value="Historical">Historical</option>
                            </select>
                        </label>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Best Time to Visit
                            <select
                                name="bestTime"
                                value={formData.bestTime}
                                onChange={handleInputChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                required
                            >
                                <option value="">Select Season</option>
                                <option value="Summer">Summer</option>
                                <option value="Winter">Winter</option>
                                <option value="Spring">Spring</option>
                                <option value="Autumn">Autumn</option>
                                <option value="Year-round">Year-round</option>
                            </select>
                        </label>
                    </div>

                    {/* Activities */}
                    <div className="mb-4 md:col-span-2">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Activities (comma-separated)
                            <input
                                type="text"
                                name="activities"
                                value={formData.activities}
                                onChange={handleInputChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                placeholder="e.g. cultural tours, sightseeing"
                            />
                        </label>
                    </div>

                    {/* Image Uploads */}
                    {[0, 1, 2].map((index) => (
                        <div key={index} className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Image {index + 1}
                                <input
                                    type="file"
                                    name={`image${index}`}
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                />
                            </label>
                            {formData[`imageUrl${index > 0 ? index : ''}`] && (
                                <div className="mt-2">
                                    <p className="text-sm text-gray-600">Current Image URL:</p>
                                    <input
                                        type="text"
                                        name={`imageUrl${index > 0 ? index : ''}`}
                                        value={formData[`imageUrl${index > 0 ? index : ''}`]}
                                        onChange={handleInputChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                    />
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Button Container */}
                    <div className="md:col-span-2 mt-4 flex justify-between">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="bg-gray-500 text-white font-bold py-2 px-4 rounded hover:bg-gray-600 transition duration-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-adminbg text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
                        >
                            Add Destination
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddDestination;