import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/header';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { EditableRating } from '@/components/ui/editable-rating';
import { ReviewForm } from '@/components/reviews/review-form';
import { AddPaymentMethodModal } from '@/components/payment/add-payment-method-modal';
import { CustomerCareModal } from '@/components/support/customer-care-modal';
import { format } from 'date-fns';
import { GardenerBooking, PaymentMethod } from '@shared/schema';

// Mock data for display purposes
const mockOrders = [
  {
    id: 'ORD-12345',
    date: '2023-12-10',
    status: 'Delivered',
    total: 13900,
    items: [
      { name: 'Snake Plant', quantity: 1, price: 34900, image: 'https://images.unsplash.com/photo-1598880513596-cf08398a71d1?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80' },
      { name: 'Organic Potting Soil', quantity: 1, price: 29900, image: 'https://images.unsplash.com/photo-1467205077495-1712e4be58d0?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80' }
    ]
  },
  {
    id: 'ORD-12344',
    date: '2023-11-28',
    status: 'Delivered',
    total: 59900,
    items: [
      { name: 'Ceramic Pot', quantity: 1, price: 59900, image: 'https://images.unsplash.com/photo-1562517634-baa2da3acfbf?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' }
    ]
  },
];

// Mock user data
const mockUser = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  address: '123 Garden Street, Plant City, PC 12345',
  avatarUrl: '',
  memberSince: 'Jan 2023'
};

export default function AccountPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('account');
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCustomerCareOpen, setIsCustomerCareOpen] = useState(false);
  
  // Fetch gardener bookings for ratings tab
  const { data: bookings, isLoading: bookingsLoading, refetch: refetchBookings } = useQuery({
    queryKey: ['/api/gardener-bookings'],
    refetchOnWindowFocus: false
  });
  
  // Fetch payment methods
  const { data: paymentMethods, isLoading: paymentMethodsLoading } = useQuery({
    queryKey: ['/api/payment-methods'],
    refetchOnWindowFocus: false
  });

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
  
  // Format date for display
  const formatBookingDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP'); // e.g., "April 29, 2023"
    } catch (error) {
      return dateString;
    }
  };
  
  // Filter past bookings (these are the ones that can be rated)
  const pastBookings = bookings ? 
    (Array.isArray(bookings) ? bookings.filter((booking: GardenerBooking) => {
      const bookingDate = new Date(booking.date);
      return bookingDate < new Date();
    }) : []) 
    : [];
    
  const handleReviewSuccess = () => {
    setEditingReviewId(null);
    refetchBookings();
    toast({
      title: "Review Updated",
      description: "Your review has been successfully saved.",
      variant: "default",
    });
  };

  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
      variant: "default",
    });
    
    // Redirect to home page
    setLocation('/');
  };

  return (
    <div className="pb-20 flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-1">
        {/* Hero section with cover photo and profile */}
        <div className="relative">
          <div className="h-32 w-full bg-gradient-to-r from-green-600 to-green-400"></div>
          <div className="absolute -bottom-16 left-4 sm:left-8">
            <Avatar className="h-24 w-24 border-4 border-white shadow-md">
              <AvatarImage src={mockUser.avatarUrl} alt={mockUser.name} />
              <AvatarFallback className="bg-primary text-white text-xl">
                {mockUser.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        <div className="pt-20 px-4 sm:px-8 max-w-2xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{mockUser.name}</h1>
            <p className="text-sm text-gray-500">Member since {mockUser.memberSince}</p>
          </div>
          
          {/* Custom Tab Navigation */}
          <div className="mt-8 border-b border-gray-200">
            <div className="flex space-x-8">
              <button
                className={`pb-4 px-1 relative ${activeTab === 'account' 
                  ? 'text-primary font-medium border-b-2 border-primary' 
                  : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('account')}
              >
                <div className="flex items-center">
                  <i className="fas fa-user-circle mr-2"></i>
                  <span>Profile</span>
                </div>
              </button>
              
              <button
                className={`pb-4 px-1 relative ${activeTab === 'orders' 
                  ? 'text-primary font-medium border-b-2 border-primary' 
                  : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('orders')}
              >
                <div className="flex items-center">
                  <i className="fas fa-shopping-bag mr-2"></i>
                  <span>Orders</span>
                </div>
              </button>
              
              <button
                className={`pb-4 px-1 relative ${activeTab === 'wishlist' 
                  ? 'text-primary font-medium border-b-2 border-primary' 
                  : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('wishlist')}
              >
                <div className="flex items-center">
                  <i className="fas fa-heart mr-2"></i>
                  <span>Wishlist</span>
                </div>
              </button>
              
              <button
                className={`pb-4 px-1 relative ${activeTab === 'ratings' 
                  ? 'text-primary font-medium border-b-2 border-primary' 
                  : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('ratings')}
              >
                <div className="flex items-center">
                  <i className="fas fa-star mr-2"></i>
                  <span>Ratings</span>
                </div>
              </button>
              
              <button
                className={`pb-4 px-1 relative ${activeTab === 'payments' 
                  ? 'text-primary font-medium border-b-2 border-primary' 
                  : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('payments')}
              >
                <div className="flex items-center">
                  <i className="fas fa-credit-card mr-2"></i>
                  <span>Payments</span>
                </div>
              </button>
            </div>
          </div>
          
          {/* Profile Tab Content */}
          {activeTab === 'account' && (
            <div className="mt-6 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <i className="fas fa-info-circle text-primary mr-2"></i>
                  Personal Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                    <div className="flex items-center p-2 rounded-lg bg-gray-50 border border-gray-100">
                      <i className="fas fa-envelope text-primary mr-2"></i>
                      <p className="text-gray-800">{mockUser.email}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                    <div className="flex items-center p-2 rounded-lg bg-gray-50 border border-gray-100">
                      <i className="fas fa-phone text-primary mr-2"></i>
                      <p className="text-gray-800">{mockUser.phone}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Shipping Address</label>
                  <div className="flex items-start p-2 rounded-lg bg-gray-50 border border-gray-100">
                    <i className="fas fa-map-marker-alt text-primary mr-2 mt-1"></i>
                    <p className="text-gray-800">{mockUser.address}</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button variant="outline" className="mr-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors">
                    <i className="fas fa-pencil-alt mr-2"></i> Edit Profile
                  </Button>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <i className="fas fa-shield-alt text-primary mr-2"></i>
                  Account Security
                </h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Password</label>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
                    <p className="text-gray-800">••••••••••••</p>
                    <Button variant="outline" size="sm" className="bg-white hover:bg-primary hover:text-white transition-colors">Change Password</Button>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Two-factor Authentication</label>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
                    <p className="text-red-500 font-medium">Not Enabled</p>
                    <Button variant="outline" size="sm" className="bg-white hover:bg-primary hover:text-white transition-colors">Enable</Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Orders Tab Content */}
          {activeTab === 'orders' && (
            <div className="mt-6 space-y-6">
              <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg">
                <div className="p-4 sm:p-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                    <i className="fas fa-shopping-bag text-primary mr-2"></i>
                    Recent Orders
                  </h2>
                </div>
                
                {mockOrders.length > 0 ? (
                  <div>
                    {mockOrders.map((order) => (
                      <div key={order.id} className="p-4 sm:p-6 border-b border-gray-100 hover:bg-gray-50 transition-all duration-300">
                        <div className="flex justify-between items-center mb-3">
                          <div>
                            <h3 className="font-medium text-gray-900">{order.id}</h3>
                            <p className="text-sm text-gray-500">
                              {new Date(order.date).toLocaleDateString()} 
                            </p>
                          </div>
                          <Badge className="bg-green-100 text-green-700 border border-green-200 px-3 py-1 font-medium">
                            {order.status}
                          </Badge>
                        </div>
                        
                        <div className="mt-3 flex flex-wrap gap-3">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center bg-gray-50 rounded-lg p-2 flex-1 min-w-[240px] border border-gray-100 shadow-sm">
                              <div className="w-12 h-12 rounded-md overflow-hidden mr-3">
                                <img 
                                  src={item.image} 
                                  alt={item.name} 
                                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-800">{item.name}</p>
                                <div className="flex justify-between text-sm text-gray-500">
                                  <span>Qty: {item.quantity}</span>
                                  <span className="font-semibold">${(item.price / 100).toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 flex justify-between items-center">
                          <div className="font-medium">
                            Total: <span className="text-primary font-bold">${(order.total / 100).toFixed(2)}</span>
                          </div>
                          <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-white transition-colors">
                            <i className="fas fa-eye mr-2"></i> View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 px-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <i className="fas fa-shopping-bag text-gray-400 text-xl"></i>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800">No orders yet</h3>
                    <p className="text-gray-500 mt-1 max-w-sm mx-auto">
                      When you place orders, they will appear here for you to track
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Wishlist Tab Content */}
          {activeTab === 'wishlist' && (
            <div className="mt-6">
              <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg">
                <div className="p-4 sm:p-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                    <i className="fas fa-heart text-primary mr-2"></i>
                    Saved Plants & Products
                  </h2>
                </div>
                
                <div className="text-center py-10 px-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mb-4 shadow-sm">
                    <i className="fas fa-heart text-gray-400 text-xl"></i>
                  </div>
                  <h3 className="text-lg font-medium text-gray-800">Your wishlist is empty</h3>
                  <p className="text-gray-500 mt-1 max-w-sm mx-auto">
                    Save plants and products to your wishlist to easily find them later
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Ratings & Reviews Tab Content */}
          {activeTab === 'ratings' && (
            <div className="mt-6 space-y-6">
              <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg">
                <div className="p-4 sm:p-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                    <i className="fas fa-star text-primary mr-2"></i>
                    Your Ratings & Reviews
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Rate the gardening services you've received to help us improve
                  </p>
                </div>
                
                {bookingsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : pastBookings.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {pastBookings.map((booking: GardenerBooking) => (
                      <div key={booking.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-all duration-300">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium text-gray-800">{getServiceLabel(booking.serviceType)}</h3>
                            <p className="text-sm text-gray-500">{formatBookingDate(booking.date)}, {booking.timeSlot}</p>
                          </div>
                          
                          {booking.rating ? (
                            <div className="flex items-center">
                              <EditableRating 
                                initialRating={booking.rating} 
                                readonly={true}
                              />
                            </div>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1 font-medium">
                              Not Rated
                            </Badge>
                          )}
                        </div>
                        
                        {/* If a review already exists, show it */}
                        {booking.rating && booking.reviewText && editingReviewId !== booking.id && (
                          <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <p className="text-gray-700 text-sm italic">"{booking.reviewText}"</p>
                          </div>
                        )}
                        
                        {/* Show review form if editing or if no review exists yet */}
                        {editingReviewId === booking.id ? (
                          <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <ReviewForm 
                              bookingId={booking.id}
                              initialRating={booking.rating}
                              initialReviewText={booking.reviewText}
                              onSuccess={handleReviewSuccess}
                              onCancel={() => setEditingReviewId(null)}
                            />
                          </div>
                        ) : (
                          <div className="mt-3 flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-sm border-primary text-primary hover:bg-primary hover:text-white transition-colors"
                              onClick={() => setEditingReviewId(booking.id)}
                            >
                              {booking.rating ? 'Edit Review' : 'Add Review'}
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 px-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mb-4 shadow-sm">
                      <i className="fas fa-star text-gray-400 text-xl"></i>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800">No past services to rate</h3>
                    <p className="text-gray-500 mt-1 max-w-sm mx-auto">
                      After you receive gardening services, you can rate and review them here
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Payment Methods Tab Content */}
          {activeTab === 'payments' && (
            <div className="mt-6 space-y-6">
              <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg">
                <div className="p-4 sm:p-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                    <i className="fas fa-credit-card text-primary mr-2"></i>
                    Saved Payment Methods
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Manage your payment options for faster checkout
                  </p>
                </div>
                
                {paymentMethodsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <>
                    {/* Available payment methods */}
                    <div className="divide-y divide-gray-100">
                      {Array.isArray(paymentMethods) && paymentMethods.map((method) => (
                        <div key={method.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-all duration-300">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className={`w-10 h-10 ${method.isDigitalWallet ? 'bg-blue-50' : method.isCashOption ? 'bg-green-50' : 'bg-gray-50'} rounded-full flex items-center justify-center mr-4`}>
                                <i className={`${method.isDigitalWallet ? 'fab' : 'fas'} fa-${method.icon} ${method.isDigitalWallet ? 'text-blue-600' : method.isCashOption ? 'text-green-600' : 'text-primary'} text-lg`}></i>
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-800">{method.name}</h3>
                                {method.requiresCardDetails && (
                                  <div className="mt-1">
                                    <Button variant="outline" size="sm" className="text-xs border-gray-300 text-gray-600 hover:border-primary hover:text-primary transition-colors">
                                      <i className="fas fa-plus-circle mr-1"></i> Add Card
                                    </Button>
                                  </div>
                                )}
                                {method.code === 'card' && (
                                  <p className="text-sm text-gray-500 mt-1">
                                    No saved cards
                                  </p>
                                )}
                                {method.isDigitalWallet && (
                                  <p className="text-sm text-gray-500">Connect your account for easy checkout</p>
                                )}
                              </div>
                            </div>
                            
                            {method.code === 'cod' && (
                              <Badge className="bg-green-100 text-green-700 border border-green-200 px-3 py-1 font-medium">
                                Available
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Add new payment method button */}
                    <div className="p-4 sm:p-6 flex justify-center">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsPaymentModalOpen(true)}
                        className="border-dashed border-gray-300 text-gray-600 hover:border-primary hover:text-primary transition-colors"
                      >
                        <i className="fas fa-plus mr-2"></i> Add New Payment Method
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          
          {/* Help Button - Always Visible */}
          <div className="mt-12 px-4">
            <Button 
              variant="outline"
              className="w-full py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-primary text-primary hover:bg-primary hover:text-white"
              onClick={() => setIsCustomerCareOpen(true)}
            >
              <i className="fas fa-headset mr-3 text-xl"></i>
              Contact Customer Support
            </Button>
          </div>
          
          {/* Logout Button - Always Visible */}
          <div className="mt-4 mb-24 px-4">
            <Button 
              variant="destructive" 
              className="w-full py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border border-red-600"
              onClick={handleLogout}
            >
              <i className="fas fa-sign-out-alt mr-3 text-xl"></i>
              Logout
            </Button>
          </div>
        </div>
      </main>
      
      <BottomNavigation />
      
      {/* Payment Method Modal */}
      <AddPaymentMethodModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        paymentMethods={Array.isArray(paymentMethods) ? paymentMethods : []}
        onSuccess={() => {
          setIsPaymentModalOpen(false);
          toast({
            title: "Payment Method Added",
            description: "Your payment method has been added successfully.",
            variant: "default",
          });
        }}
      />

      {/* Customer Care Modal */}
      <CustomerCareModal
        isOpen={isCustomerCareOpen}
        onClose={() => setIsCustomerCareOpen(false)}
      />
    </div>
  );
}