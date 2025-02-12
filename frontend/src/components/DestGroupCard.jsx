import React, { useRef } from "react";
import DestinationCard from "./DestinationCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

function DestGroupCard({ theme }) {
  const scrollRef = useRef(null);
  
  // Sample data - replace with your actual data
  const destinations = [
    { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, 
    { id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }
  ];

  const scroll = (direction) => {
    const container = scrollRef.current;
    const scrollAmount = container.offsetWidth * 0.8;
    const newPosition = container.scrollLeft + (direction === "left" ? -scrollAmount : scrollAmount);
    
    container.scrollTo({
      left: newPosition,
      behavior: "smooth"
    });
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 py-8">
      {/* Gradient Fade Effects */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white/80 to-transparent z-10 pointer-events-none" />
      
      {/* Scroll Buttons */}
      <button 
        onClick={() => scroll("left")}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <button 
        onClick={() => scroll("right")}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Scrollable Container */}
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-6 scroll-smooth no-scrollbar pb-4"
      >
        {destinations.map((dest) => (
          <div 
            key={dest.id}
            className="flex-none w-72 transform transition-all duration-300 hover:scale-105"
          >
            <DestinationCard theme={theme} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default DestGroupCard;