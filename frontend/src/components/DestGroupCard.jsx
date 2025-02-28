import React, { useRef, useState, useEffect } from "react";
import DestinationCard from "./DestinationCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

function DestGroupCard({ theme }) {
  const scrollRef = useRef(null);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // Auto-scroll settings
  const scrollInterval = 4000; // Time between scrolls in ms
  const scrollAmount = 300; // Pixels to scroll each time

  // Check if on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, "destinations"));
        const fetchedDestinations = [];
        
        querySnapshot.forEach((doc) => {
          fetchedDestinations.push({ id: doc.id, ...doc.data() });
        });
        
        setDestinations(fetchedDestinations);
      } catch (err) {
        console.error("Error fetching destinations:", err);
        setError("Failed to load destinations.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDestinations();
  }, []);

  // Manual scroll function
  const scroll = (direction) => {
    const container = scrollRef.current;
    if (!container) return;
    
    // On mobile, scroll exactly one card width
    if (isMobile) {
      const cardWidth = container.querySelector('.card-container')?.offsetWidth || container.offsetWidth;
      const newPosition = container.scrollLeft + (direction === "left" ? -cardWidth : cardWidth);
      
      container.scrollTo({
        left: newPosition,
        behavior: "smooth"
      });
    } else {
      // On desktop, keep the original scroll behavior
      const scrollAmount = container.offsetWidth * 0.8;
      const newPosition = container.scrollLeft + (direction === "left" ? -scrollAmount : scrollAmount);
      
      container.scrollTo({
        left: newPosition,
        behavior: "smooth"
      });
    }
  };

  // Auto-scroll effect
  useEffect(() => {
    if (loading || error || destinations.length <= 1 || isPaused) return;
    
    const container = scrollRef.current;
    if (!container) return;
    
    const totalWidth = container.scrollWidth;
    const visibleWidth = container.offsetWidth;
    
    // Only auto-scroll if there's content beyond what's visible
    if (totalWidth <= visibleWidth) return;
    
    const autoScrollInterval = setInterval(() => {
      // Get the width of a single card for mobile scrolling
      const cardWidth = isMobile 
        ? (container.querySelector('.card-container')?.offsetWidth || 300) 
        : scrollAmount;
        
      let newPosition = scrollPosition + cardWidth;
      
      // If we've scrolled to the end, loop back to the beginning
      if (newPosition >= totalWidth - visibleWidth) {
        newPosition = 0;
      }
      
      container.scrollTo({
        left: newPosition,
        behavior: "smooth"
      });
      
      setScrollPosition(newPosition);
    }, scrollInterval);
    
    return () => clearInterval(autoScrollInterval);
  }, [destinations, loading, error, isPaused, scrollPosition, isMobile]);

  // Update scroll position state when user manually scrolls
  const handleScroll = () => {
    if (scrollRef.current) {
      setScrollPosition(scrollRef.current.scrollLeft);
    }
  };
  
  // Pause auto-scroll on mouse enter/touch
  const handleInteractionStart = () => setIsPaused(true);
  const handleInteractionEnd = () => setIsPaused(false);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    
    container.addEventListener('scroll', handleScroll);
    container.addEventListener('mouseenter', handleInteractionStart);
    container.addEventListener('mouseleave', handleInteractionEnd);
    container.addEventListener('touchstart', handleInteractionStart);
    container.addEventListener('touchend', handleInteractionEnd);
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      container.removeEventListener('mouseenter', handleInteractionStart);
      container.removeEventListener('mouseleave', handleInteractionEnd);
      container.removeEventListener('touchstart', handleInteractionStart);
      container.removeEventListener('touchend', handleInteractionEnd);
    };
  }, []);

  return (
    <div className="relative overflow-hidden my-8">
      {/* Gradient Fade Effects */}
      <div className="absolute left-0 top-0 h-full w-12 z-10 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
      <div className="absolute right-0 top-0 h-full w-12 z-10 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
      
      {/* Scroll Buttons (hide if no destinations) */}
      {destinations.length > 1 && (
        <>
          <button
            onClick={() => scroll("left")}
            className="absolute left-4 top-2/3 -translate-y-1/2 z-20 bg-khaki text-white hover:bg-white hover:text-black p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute right-2 top-2/3 -translate-y-1/2 z-20 bg-khaki text-white hover:bg-white hover:text-black p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Loading and Error States */}
      {loading && <div className="text-center py-10">Loading destinations...</div>}
      {error && <div className="text-center py-10 text-red-500">{error}</div>}
      
      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto py-4 px-2 scrollbar-hide snap-x md:snap-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {destinations.length > 0 ? (
          destinations.map((dest) => (
            <div 
              key={dest.id} 
              className="card-container flex-shrink-0 snap-center md:snap-align-none" 
              style={{ 
                width: isMobile ? 'calc(100% - 2.5rem)' : 'calc(33.333% - 1rem)', 
                maxWidth: isMobile ? '100%' : '300px',
                scrollSnapAlign: isMobile ? 'center' : 'none'
              }}
            >
              <DestinationCard destination={dest} theme={theme} />
            </div>
          ))
        ) : (
          !loading && <div className="text-center py-10">No destinations found.</div>
        )}
      </div>
    </div>
  );
}

export default DestGroupCard;