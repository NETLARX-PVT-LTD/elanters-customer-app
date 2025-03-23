import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function LocationPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentLocation, setCurrentLocation] = useState<string>("");

  // Get the current location from localStorage on component mount
  useEffect(() => {
    const savedLocation = localStorage.getItem("userLocation") || "New York";
    setCurrentLocation(savedLocation);
  }, []);

  // Popular locations
  const popularLocations = [
    "New York",
    "Los Angeles",
    "Chicago",
    "Miami",
    "Seattle",
    "Boston",
    "Austin",
    "San Francisco",
    "Denver",
    "Portland"
  ];

  // Filter locations based on search
  const filteredLocations = popularLocations.filter(
    location => location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle location selection
  const handleSelectLocation = (city: string) => {
    // Save to localStorage
    localStorage.setItem("userLocation", city);
    
    // Show toast notification
    toast({
      title: "Location updated",
      description: `Your location has been set to ${city}`,
      variant: "default",
    });
    
    // Navigate back to previous page
    setTimeout(() => {
      setLocation("/");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm flex items-center">
        <button 
          className="mr-4" 
          onClick={() => setLocation("/")}
        >
          <i className="fas fa-arrow-left"></i>
        </button>
        <h1 className="text-lg font-medium">Select Location</h1>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className="fas fa-search text-gray-400"></i>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="Search for your location"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Use current location button */}
      <div className="px-4 mb-4">
        <button
          className="w-full py-3 bg-white border border-gray-300 rounded-lg flex items-center justify-center font-medium text-primary"
          onClick={() => {
            // This would normally use geolocation API
            toast({
              title: "Location detection",
              description: "Using device location...",
              variant: "default",
            });
            
            // Simulate getting location
            setTimeout(() => {
              handleSelectLocation("New York");
            }, 1000);
          }}
        >
          <i className="fas fa-location-arrow mr-2"></i>
          Use current location
        </button>
      </div>

      {/* Popular locations */}
      <div className="px-4 mb-6">
        <h2 className="text-sm font-medium text-gray-500 mb-2">POPULAR LOCATIONS</h2>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredLocations.length > 0 ? (
            filteredLocations.map((city, index) => (
              <div
                key={city}
                className={`p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 ${
                  index !== filteredLocations.length - 1 ? "border-b border-gray-100" : ""
                }`}
                onClick={() => handleSelectLocation(city)}
              >
                <div className="flex items-center">
                  <i className="fas fa-map-marker-alt text-primary mr-3"></i>
                  <span>{city}</span>
                </div>
                {currentLocation === city && (
                  <i className="fas fa-check text-primary"></i>
                )}
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              No locations found matching "{searchQuery}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}