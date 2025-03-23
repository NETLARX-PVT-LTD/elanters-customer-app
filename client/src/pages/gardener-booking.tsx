import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GardenerBooking } from "@shared/schema";
import { useModalContext } from "@/contexts/modal-context";
import { format } from "date-fns";
import { Header } from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";

export default function GardenerBookingPage() {
  const { openGardenerModal } = useModalContext();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  
  // Fetch gardener bookings
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['/api/gardener-bookings'],
    refetchOnWindowFocus: false
  });
  
  // Filter bookings by date
  const currentDate = new Date();
  const bookingsArray = bookings ? (Array.isArray(bookings) ? bookings : []) : [];
  
  const upcomingBookings = bookingsArray.filter((booking: GardenerBooking) => {
    const bookingDate = new Date(booking.date);
    return bookingDate >= currentDate;
  });
  
  const pastBookings = bookingsArray.filter((booking: GardenerBooking) => {
    const bookingDate = new Date(booking.date);
    return bookingDate < currentDate;
  });
  
  const displayBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;
  
  // Format date for display
  const formatBookingDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP'); // e.g., "April 29, 2023"
    } catch (error) {
      return dateString;
    }
  };
  
  // Get service label from service type
  const getServiceLabel = (serviceType: string) => {
    const services: Record<string, string> = {
      'maintenance': 'Garden Maintenance',
      'planting': 'Plant Installation',
      'lawn': 'Lawn Care',
      'irrigation': 'Irrigation Setup'
    };
    return services[serviceType] || serviceType;
  };
  
  // Get icon for service type
  const getServiceIcon = (serviceType: string) => {
    const icons: Record<string, string> = {
      'maintenance': 'fa-leaf',
      'planting': 'fa-seedling',
      'lawn': 'fa-cut',
      'irrigation': 'fa-tint'
    };
    return icons[serviceType] || 'fa-question';
  };
  
  return (
    <div className="pb-16 min-h-screen bg-gray-50">
      <Header title="Your Bookings" />
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        <button
          className={`flex-1 py-3 text-sm font-medium ${activeTab === 'upcoming' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium ${activeTab === 'past' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
          onClick={() => setActiveTab('past')}
        >
          Past
        </button>
      </div>
      
      {/* Bookings list */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : displayBookings?.length > 0 ? (
          <div className="space-y-4">
            {displayBookings.map((booking: GardenerBooking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-primary bg-opacity-10 flex items-center justify-center text-primary mr-3">
                    <i className={`fas ${getServiceIcon(booking.serviceType)}`}></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{getServiceLabel(booking.serviceType)}</h3>
                    <div className="mt-1 text-sm text-gray-600 space-y-1">
                      <div className="flex items-center">
                        <i className="fas fa-calendar-day w-4 mr-2 text-gray-400"></i>
                        <span>{formatBookingDate(booking.date)}</span>
                      </div>
                      <div className="flex items-center">
                        <i className="fas fa-clock w-4 mr-2 text-gray-400"></i>
                        <span>{booking.timeSlot}</span>
                      </div>
                      <div className="flex items-center">
                        <i className="fas fa-ruler-combined w-4 mr-2 text-gray-400"></i>
                        <span>Garden Size: {booking.gardenSize}</span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-2">
                    {activeTab === 'upcoming' && (
                      <button className="text-gray-400 hover:text-gray-600">
                        <i className="fas fa-ellipsis-v"></i>
                      </button>
                    )}
                  </div>
                </div>
                {booking.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium text-gray-700">Notes:</span> {booking.notes}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-calendar-day text-gray-400 text-xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-700">No {activeTab} bookings</h3>
            <p className="text-gray-500 mt-1 mb-6">You don't have any {activeTab} gardener services booked.</p>
          </div>
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
}