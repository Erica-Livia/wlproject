import React from "react";

function DestinationCard({ theme, destination }) {
    if (!destination) {
        return (
            <div className={`w-72 h-96 flex flex-col items-center justify-center rounded-xl shadow-lg transform transition-transform duration-300 hover:scale-105
                ${theme === "light" ? "bg-khaki text-gray-100" : "bg-white text-gray-800"}`}>
                <p className="text-red-500 font-semibold">Destination data missing</p>
            </div>
        );
    }

    return (
        <div
            className={`w-72 h-96 flex flex-col rounded-xl shadow-lg transform transition-transform duration-300 hover:scale-105 overflow-hidden
                ${theme === "light" ? "bg-khaki text-gray-100" : "bg-white text-gray-800"}`}
        >
            <div
                className={`picture rounded-t-xl h-1/2 transition-all duration-300 
                    ${theme === "light" ? "bg-gray-800" : "bg-gray-100"}`}
                style={{
                    backgroundImage: destination?.imageUrl ? `url(${destination.imageUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            ></div>
            <div
                className={`title h-1/4 flex items-center px-4 font-bold text-xl transition-all 
                    ${theme === "light" ? "text-gray-100" : "text-gray-900"}`}
            >
                {destination?.title || "Destination Name"}
            </div>
            <div
                className={`smallDescription h-1/4 flex items-center px-4 text-sm transition-all 
                    ${theme === "light" ? "text-gray-300" : "text-gray-600"}`}
            >
                {destination?.shortdesc || "A short description of the destination goes here."}
            </div>
            <div className="flex items-center justify-center h-1/4">
                <button
                    className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 
                        ${theme === "light" ? "bg-green hover:bg-khaki text-white" : "bg-khaki hover:bg-khaki text-white"}`}
                >
                    Explore
                </button>
            </div>
        </div>
    );
}

export default DestinationCard;