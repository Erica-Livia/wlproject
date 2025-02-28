import React from "react";
import GuideNav from "../../components/GuideNav";

function GDashboard() {
    // Dummy data (replace with actual data from your backend or state)
    const userInteractions = 124; // Number of user interactions
    const rating = 4.7; // Average rating
    const officeHours = "Mon-Fri, 9 AM - 5 PM"; // Office hours
    const ranking = 3; // Guide's ranking

    return (
        <>
            <div className="flex flex-row bg-white ">
        {/* Guide Navigation (Left Side) */}
        <div className="w-1/4"> {/* Adjust the width as needed */}
            <GuideNav />
        </div>

            {/* Dashboard Content */}
            <div className="p-6 ml-64"> {/* Adjust margin-left (ml-64) to match the width of your GuideNav */}
                <h1 className="text-3xl font-bold mb-8">Guide Dashboard</h1>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Card 1: User Interactions */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-gray-700">User Interactions</h2>
                        <p className="text-3xl font-bold text-green-600 mt-2">{userInteractions}</p>
                    </div>

                    {/* Card 2: Rating */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-gray-700">Rating</h2>
                        <p className="text-3xl font-bold text-yellow-500 mt-2">{rating}</p>
                    </div>

                    {/* Card 3: Office Hours */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-gray-700">Office Hours</h2>
                        <p className="text-3xl font-bold text-blue-600 mt-2">{officeHours}</p>
                    </div>

                    {/* Card 4: Ranking */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-gray-700">Ranking</h2>
                        <p className="text-3xl font-bold text-purple-600 mt-2">#{ranking}</p>
                    </div>
                </div>
            </div>
            </div>
        </>
    );
}

export default GDashboard;