import React, { useState, useEffect, useRef } from 'react';
import { PROVINCES } from '../utils/constants';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Locations = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [mapInitialized, setMapInitialized] = useState(false);
  const mapRef = useRef(null);

  const locations = [
    {
      id: 1,
      province: 'Gauteng',
      cities: ['Johannesburg', 'Pretoria', 'Sandton', 'Centurion'],
      address: '123 Luxury Avenue, Sandton, Johannesburg',
      phone: '+27 11 123 4567',
      hours: 'Mon-Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 4:00 PM',
      coordinates: [-26.107, 28.056]
    },
    {
      id: 2,
      province: 'Western Cape',
      cities: ['Cape Town', 'Stellenbosch', 'Paarl', 'Somerset West'],
      address: '45 Vineyard Road, Cape Town City Centre',
      phone: '+27 21 456 7890',
      hours: 'Mon-Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 4:00 PM',
      coordinates: [-33.925, 18.424]
    },
    {
      id: 3,
      province: 'KwaZulu-Natal',
      cities: ['Durban', 'Umhlanga', 'Ballito', 'Pietermaritzburg'],
      address: '78 Beach Road, Umhlanga Rocks, Durban',
      phone: '+27 31 234 5678',
      hours: 'Mon-Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 4:00 PM',
      coordinates: [-29.717, 31.066]
    },
    {
      id: 4,
      province: 'Eastern Cape',
      cities: ['Port Elizabeth', 'East London', 'Grahamstown'],
      address: '32 Harbour View, Port Elizabeth Central',
      phone: '+27 41 345 6789',
      hours: 'Mon-Fri: 8:00 AM - 5:00 PM, Sat: 9:00 AM - 1:00 PM',
      coordinates: [-33.960, 25.602]
    },
    {
      id: 5,
      province: 'Free State',
      cities: ['Bloemfontein', 'Welkom', 'Bethlehem'],
      address: '15 Park Road, Bloemfontein Central',
      phone: '+27 51 456 7890',
      hours: 'Mon-Fri: 8:00 AM - 5:00 PM, Sat: 9:00 AM - 1:00 PM',
      coordinates: [-29.116, 26.215]
    },
    {
      id: 6,
      province: 'Mpumalanga',
      cities: ['Nelspruit', 'Witbank', 'Middleburg'],
      address: '9 Kruger Street, Nelspruit',
      phone: '+27 13 567 8901',
      hours: 'Mon-Fri: 8:00 AM - 5:00 PM, Sat: 9:00 AM - 1:00 PM',
      coordinates: [-25.475, 30.970]
    },
    {
      id: 7,
      province: 'Limpopo',
      cities: ['Polokwane', 'Tzaneen', 'Modimolle'],
      address: '27 Savannah Street, Polokwane Central',
      phone: '+27 15 678 9012',
      hours: 'Mon-Fri: 8:00 AM - 5:00 PM, Sat: 9:00 AM - 1:00 PM',
      coordinates: [-23.900, 29.450]
    },
    {
      id: 8,
      province: 'North West',
      cities: ['Rustenburg', 'Mahikeng', 'Potchefstroom'],
      address: '34 Platinum Road, Rustenburg',
      phone: '+27 14 789 0123',
      hours: 'Mon-Fri: 8:00 AM - 5:00 PM, Sat: 9:00 AM - 1:00 PM',
      coordinates: [-25.650, 27.240]
    },
    {
      id: 9,
      province: 'Northern Cape',
      cities: ['Kimberley', 'Upington', 'Springbok'],
      address: '12 Diamond Avenue, Kimberley',
      phone: '+27 53 890 1234',
      hours: 'Mon-Fri: 8:00 AM - 5:00 PM, Sat: 9:00 AM - 12:00 PM',
      coordinates: [-28.741, 24.762]
    }
  ];

  // Create custom icons
  const createCustomIcon = (color = 'amber', size = 'normal') => {
    const sizeClass = size === 'large' ? 'text-2xl' : 'text-xl';
    const colorClass = color === 'red' ? 'text-red-600' : 'text-amber-600';
    
    return L.divIcon({
      html: `<i class="fas fa-map-marker-alt ${colorClass} ${sizeClass}"></i>`,
      iconSize: size === 'large' ? [40, 40] : [30, 30],
      className: 'leaflet-custom-icon'
    });
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (mapRef.current && !mapInitialized) {
      try {
        // Initialize map
        const mapInstance = L.map(mapRef.current, {
          zoomControl: true,
          scrollWheelZoom: true
        }).setView([-28.4793, 24.6727], 6);

        // Add tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18,
        }).addTo(mapInstance);

        // Create custom icons
        const defaultIcon = createCustomIcon('amber', 'normal');
        const selectedIcon = createCustomIcon('red', 'large');

        // Add markers for all locations
        const newMarkers = locations.map(location => {
          const marker = L.marker(location.coordinates, {
            icon: defaultIcon
          }).addTo(mapInstance);

          // Create popup content
          const popupContent = `
            <div class="p-3 min-w-64">
              <h3 class="font-bold text-lg text-gray-800">${location.province}</h3>
              <p class="text-gray-600 text-sm mt-1">${location.address}</p>
              <p class="text-gray-600 text-sm">${location.phone}</p>
              <p class="text-gray-500 text-xs mt-2">${location.hours}</p>
              <button 
                onclick="window.selectLocation && window.selectLocation(${location.id})" 
                class="w-full mt-3 bg-amber-500 text-white py-1 px-3 rounded text-sm hover:bg-amber-600 transition-colors"
              >
                View Details
              </button>
            </div>
          `;

          marker.bindPopup(popupContent);

          // Add click event to marker
          marker.on('click', () => {
            handleViewLocation(location);
          });

          return {
            marker,
            location,
            defaultIcon,
            selectedIcon
          };
        });

        setMap(mapInstance);
        setMarkers(newMarkers);
        setMapInitialized(true);

        // Make selectLocation function available globally for popup buttons
        window.selectLocation = (locationId) => {
          const location = locations.find(loc => loc.id === locationId);
          if (location) {
            handleViewLocation(location);
          }
        };

        // Force a small timeout to ensure map is fully rendered
        setTimeout(() => {
          mapInstance.invalidateSize();
        }, 100);

      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }

    // Cleanup function
    return () => {
      if (map) {
        map.remove();
      }
      if (window.selectLocation) {
        window.selectLocation = null;
      }
    };
  }, [mapInitialized]);

  const handleViewLocation = (location) => {
    if (!map || !mapInitialized) {
      console.warn('Map not initialized yet');
      return;
    }

    try {
      setSelectedLocation(location);
      
      // Center map on selected location
      map.setView(location.coordinates, 12);
      
      // Find and open the marker's popup
      const markerObj = markers.find(m => m.location.id === location.id);
      if (markerObj) {
        // Update all markers to default icon first
        markers.forEach(({ marker, defaultIcon }) => {
          marker.setIcon(defaultIcon);
        });
        
        // Set selected marker to selected icon
        markerObj.marker.setIcon(markerObj.selectedIcon);
        markerObj.marker.openPopup();
      }
    } catch (error) {
      console.error('Error handling view location:', error);
    }
  };

  const handleShowAllLocations = () => {
    if (!map || !mapInitialized) return;

    try {
      setSelectedLocation(null);
      
      // Reset to show all of South Africa
      map.setView([-28.4793, 24.6727], 6);
      
      // Reset all markers to default icon
      markers.forEach(({ marker, defaultIcon }) => {
        marker.setIcon(defaultIcon);
        marker.closePopup();
      });
    } catch (error) {
      console.error('Error showing all locations:', error);
    }
  };

  // Safe handler for location buttons
  const safeHandleViewLocation = (location) => {
    if (!mapInitialized) {
      console.warn('Map not ready yet. Please wait...');
      return;
    }
    handleViewLocation(location);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Our Locations</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            With rental locations across all 9 provinces of South Africa, we're never too far away. 
            Find your nearest Safari Wheels branch.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-amber-600 mb-2">9</div>
            <div className="text-gray-600">Provinces Covered</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-amber-600 mb-2">{locations.length}</div>
            <div className="text-gray-600">Cities Nationwide</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-amber-600 mb-2">50+</div>
            <div className="text-gray-600">Rental Locations</div>
          </div>
        </div>

        {/* Selected Location Info */}
        {selectedLocation && (
          <div className="mb-6 bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {selectedLocation.province} Branch
                </h2>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    <i className="fas fa-map-marker-alt text-amber-500 mr-2"></i>
                    {selectedLocation.address}
                  </p>
                  <p className="text-gray-600">
                    <i className="fas fa-phone text-amber-500 mr-2"></i>
                    {selectedLocation.phone}
                  </p>
                  <p className="text-gray-600">
                    <i className="fas fa-clock text-amber-500 mr-2"></i>
                    {selectedLocation.hours}
                  </p>
                  <div className="mt-3">
                    <h4 className="font-semibold text-gray-700 mb-1">Cities Served:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedLocation.cities.map((city, index) => (
                        <span 
                          key={index}
                          className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-sm"
                        >
                          {city}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={handleShowAllLocations}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                disabled={!mapInitialized}
              >
                Show All Locations
              </button>
            </div>
          </div>
        )}

        {/* Locations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {locations.map((location) => (
            <div 
              key={location.id} 
              className={`bg-white rounded-lg shadow-md overflow-hidden border-2 transition-all ${
                selectedLocation?.id === location.id 
                  ? 'border-amber-500 shadow-lg' 
                  : 'border-transparent hover:shadow-lg'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">{location.province}</h3>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    selectedLocation?.id === location.id ? 'bg-amber-600' : 'bg-amber-500'
                  }`}>
                    <i className="fas fa-map-marker-alt text-white"></i>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Cities Served:</h4>
                  <div className="flex flex-wrap gap-2">
                    {location.cities.map((city, cityIndex) => (
                      <span 
                        key={cityIndex}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
                      >
                        {city}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start">
                    <i className="fas fa-map-marker-alt text-amber-500 mt-1 mr-3"></i>
                    <p className="text-gray-600 text-sm">{location.address}</p>
                  </div>
                  
                  <div className="flex items-start">
                    <i className="fas fa-phone text-amber-500 mt-1 mr-3"></i>
                    <p className="text-gray-600 text-sm">{location.phone}</p>
                  </div>
                  
                  <div className="flex items-start">
                    <i className="fas fa-clock text-amber-500 mt-1 mr-3"></i>
                    <p className="text-gray-600 text-sm">{location.hours}</p>
                  </div>
                </div>

                <button 
                  onClick={() => safeHandleViewLocation(location)}
                  disabled={!mapInitialized}
                  className={`w-full mt-6 py-2 px-4 rounded-md transition-colors ${
                    selectedLocation?.id === location.id
                      ? 'bg-amber-600 text-white'
                      : mapInitialized
                      ? 'bg-amber-500 text-white hover:bg-amber-600'
                      : 'bg-gray-400 text-white cursor-not-allowed'
                  }`}
                >
                  {!mapInitialized 
                    ? 'Loading Map...' 
                    : selectedLocation?.id === location.id 
                    ? 'Selected Location' 
                    : 'View Location'
                  }
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Map Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Find Us on the Map {!mapInitialized && '(Loading...)'}
            </h2>
            {selectedLocation && (
              <button
                onClick={handleShowAllLocations}
                disabled={!mapInitialized}
                className={`px-4 py-2 rounded-md transition-colors ${
                  mapInitialized
                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                    : 'bg-gray-400 text-white cursor-not-allowed'
                }`}
              >
                Show All Locations
              </button>
            )}
          </div>
          
          {/* Leaflet Map Container */}
          <div 
            ref={mapRef} 
            className="h-96 rounded-lg border border-gray-200 z-0"
          />
          
          {/* Map Instructions */}
          <div className="mt-4 text-sm text-gray-600 flex items-center justify-between">
            <p>
              <i className="fas fa-info-circle text-amber-500 mr-2"></i>
              {mapInitialized 
                ? 'Click on markers or use the "View Location" buttons to explore our branches'
                : 'Map is loading...'
              }
            </p>
            {mapInitialized && (
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center">
                  <i className="fas fa-map-marker-alt text-amber-600 mr-1"></i>
                  <span>Branch Location</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-map-marker-alt text-red-600 mr-1"></i>
                  <span>Selected Branch</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add CSS for custom icons */}
      <style jsx>{`
        .leaflet-custom-icon {
          background: transparent !important;
          border: none !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        .leaflet-custom-icon.selected {
          z-index: 1000 !important;
        }
      `}</style>
    </div>
  );
};

export default Locations;