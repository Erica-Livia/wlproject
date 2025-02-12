import React from "react";

function DestinationCard({ theme }) {
    return (
        <div
            className={`w-72 h-96 flex flex-col rounded-xl shadow-lg transition-all duration-100 
                ${theme === "dark" ? "text-black" : "text-white"}`}
        >
            <div
                className={`picture rounded-xl h-1/2 transition-all duration-100 
                    ${theme === "dark" ? "bg-gray-600" : "bg-gray-300"}`}
            ></div>
            <div
                className={`title h-1/4 flex items-center px-2 font-bold text-lg transition-all
                    `}
            >
                Destination Title
            </div>
            <div
                className={`smallDescription showMore h-2/5 flex items-center justify-center px-2 text-sm transition-all
                    `}
            >
                A short description of the destination goes here.
            </div>
        </div>
    );
}

export default DestinationCard;
