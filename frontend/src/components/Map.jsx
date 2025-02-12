import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

const touristSites = [
  {
    id: 1,
    name: "Kibira National Park",
    coordinates: [29.5241, -2.8972],
    description: "Burundi's largest national park, featuring mountain rainforest and rare primates.",
    image: "/api/placeholder/400/300",
  },
  {
    id: 2,
    name: "Lake Tanganyika",
    coordinates: [29.3500, -3.5000],
    description: "One of Africa's Great Lakes, offering beautiful beaches and water activities.",
    image: "/api/placeholder/400/300",
  },
  {
    id: 3,
    name: "Rusizi National Park",
    coordinates: [29.2253, -3.3486],
    description: "Home to hippos and birds, where the Rusizi River meets Lake Tanganyika.",
    image: "/api/placeholder/400/300",
  },
  {
    id: 4,
    name: "Karera Falls",
    coordinates: [30.0847, -3.8456],
    description: "Beautiful waterfalls surrounded by lush vegetation.",
    image: "/api/placeholder/400/300",
  },
  {
    id: 5,
    name: "Gishora Drum Sanctuary",
    coordinates: [29.9246, -3.4284],
    description: "Historic site celebrating Burundi's drumming tradition.",
    image: "/api/placeholder/400/300",
  }
];

const customIcon = new L.Icon({
  iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/43/Red_pinnable_map_marker.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

function InteractiveMap() {
  const [selectedSite, setSelectedSite] = useState(null);

  const MapCenter = () => {
    const map = useMap();
    if (selectedSite) {
      map.flyTo([selectedSite.coordinates[1], selectedSite.coordinates[0]], 11, {
        animate: true,
        duration: 1.5,
      });
    }
    return null;
  };

  return (
    <div className="w-full h-96 relative rounded-xl overflow-hidden shadow-xl">
      <MapContainer center={[-3.3378, 29.9189]} zoom={7.5} scrollWheelZoom={false} className="w-full h-full">
        {/* Stadia Maps Tile Layer */}
        <TileLayer
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
        />

        {/* Marker for Tourist Sites */}
        {touristSites.map((site) => (
          <Marker
            key={site.id}
            position={[site.coordinates[1], site.coordinates[0]]}
            icon={customIcon}
            eventHandlers={{
              click: () => setSelectedSite(site),
            }}
          >
            <Popup>
              <div className="p-2">
                <img
                  src={site.image}
                  alt={site.name}
                  className="w-full h-40 object-cover rounded-lg mb-2"
                />
                <h3 className="text-lg font-semibold mb-1">{site.name}</h3>
                <p className="text-sm text-gray-600">{site.description}</p>
                <button
                  className="mt-2 w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                  onClick={() => {/* Add navigation or more details logic */}}
                >
                  Learn More
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Center map based on selected site */}
        <MapCenter />
      </MapContainer>

      {/* Site List Overlay */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg max-w-xs">
        <h2 className="text-lg font-semibold mb-2">Tourist Attractions</h2>
        <ul className="space-y-1">
          {touristSites.map((site) => (
            <li
              key={site.id}
              className="cursor-pointer hover:text-blue-500 transition-colors"
              onClick={() => {
                setSelectedSite(site);
              }}
            >
              {site.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default InteractiveMap;