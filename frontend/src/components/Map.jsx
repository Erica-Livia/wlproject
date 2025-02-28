import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Tourist Sites Data
const touristSites = [
  {
    id: 1,
    name: "Kibira National Park",
    coordinates: [29.5241, -2.8972],
    description: "Burundi's largest national park, featuring mountain rainforest and rare primates.",
    image: "https://media-cdn.tripadvisor.com/media/attractions-splice-spp-674x446/09/a7/38/3e.jpg",
  },
  {
    id: 2,
    name: "Lake Tanganyika",
    coordinates: [29.3500, -3.5000],
    description: "One of Africa's Great Lakes, offering beautiful beaches and water activities.",
    image: "https://live.staticflickr.com/4827/45330425754_112571cca4_b.jpg",
  },
  {
    id: 3,
    name: "Rusizi National Park",
    coordinates: [29.2253, -3.3486],
    description: "Home to hippos and birds, where the Rusizi River meets Lake Tanganyika.",
    image: "https://books.openedition.org/irdeditions/docannexe/image/1758/img-4-small700.jpg",
  },
  {
    id: 4,
    name: "Karera Falls",
    coordinates: [30.0847, -3.8456],
    description: "Beautiful waterfalls surrounded by lush vegetation.",
    image: "https://pbs.twimg.com/media/FabmRC5XgAAyPEV.jpg",
  },
  {
    id: 5,
    name: "Gishora Drum Sanctuary",
    coordinates: [29.9246, -3.4284],
    description: "Historic site celebrating Burundi's drumming tradition.",
    image: "https://media-cdn.tripadvisor.com/media/attractions-splice-spp-674x446/0f/e6/f5/a7.jpg",
  }
];

// Custom Map Marker Icon
const defaultIcon = L.divIcon({
  className: 'custom-map-marker',
  html: '<div style="background-color: #bf2b27; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

function InteractiveMap() {
  const [selectedSite, setSelectedSite] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef({}); // Store marker references

  // MapCenter component to handle map centering
  const MapCenter = () => {
    const map = useMap();

    useEffect(() => {
      setMapLoaded(true);
      if (selectedSite) {
        map.flyTo([selectedSite.coordinates[1], selectedSite.coordinates[0]], 11, {
          animate: true,
          duration: 1,
        });

        // Open the popup for the selected site
        const marker = markersRef.current[selectedSite.id];
        if (marker) marker.openPopup();
      }
    }, [map, selectedSite]);

    return null;
  };

  return (
    <div className="w-full h-screen relative rounded-xl shadow-xl z-10">
      {/* Loading Indicator */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-gray-200 z-10 flex items-center justify-center">
          <div className="text-gray-600">Loading map...</div>
        </div>
      )}

      {/* Site List Overlay */}
      <div className="font-poppins absolute top-0 left-52 bg-textWhite backdrop-blur-sm p-3 rounded-lg shadow-lg max-w-xs z-50">
        <h2 className="text-lg font-semibold mb-2">Top Discoveries</h2>
        <ul className="space-y-1 text-sm">
          {touristSites.map((site) => (
            <li
              key={site.id}
              className="cursor-pointer decoration-none hover:bg-yellow-100 p-1 px-2 rounded transition-colors flex items-center"
              onClick={() => {
                setSelectedSite(site); // Trigger popup when clicking from list
              }}
            >
              <div className="w-2 h-2 rounded-full mr-2"></div>
              {site.name}
            </li>
          ))}
        </ul>
      </div>

      <MapContainer
        center={[-3.3378, 29.9189]}
        zoom={7}
        scrollWheelZoom={false}
        className="w-full h-full -z-10"
        zoomControl={false}
        attributionControl={false} // Move attribution to a custom position
        maxZoom={14}
        minZoom={10}
        preferCanvas={true} // Use canvas for better performance
      >
        {/* OpenStreetMap Tile Layer */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          noWrap={true}
        />

        {/* Markers for Tourist Sites */}
        {touristSites.map((site) => (
          <Marker
            key={site.id}
            position={[site.coordinates[1], site.coordinates[0]]}
            icon={defaultIcon}
            eventHandlers={{
              click: () => setSelectedSite(site),
            }}
            ref={(el) => (markersRef.current[site.id] = el)}
          >
            <Popup>
              <div className="p-2 h-fit">
                <h3 className="text-lg font-semibold mb-1">{site.name}</h3>
                <p className="text-sm text-gray-600">{site.description}</p>
                <div>
                  <img src={site.image} alt={site.name} className="w-full h-auto rounded" />
                </div>
                <button
                  className="mt-2 w-full bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600 transition-colors text-sm"
                  onClick={() => {/* Add navigation or more details logic */ }}
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Center map based on selected site */}
        <MapCenter />
      </MapContainer>

      {/* Attribution Positioned at Bottom */}
      <div className="absolute bottom-1 right-1 text-xs text-gray-600 bg-white/80 px-1 rounded">
        © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>
      </div>
    </div>
  );
}

export default InteractiveMap;
