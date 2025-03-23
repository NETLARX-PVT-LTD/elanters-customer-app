import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useModalContext } from '@/contexts/modal-context';
import { useToast } from '@/hooks/use-toast';
import { insertGardenerBookingSchema } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

const bookingFormSchema = insertGardenerBookingSchema.extend({
  serviceType: z.string().min(1, { message: "Service type is required" }),
  date: z.string().min(1, { message: "Date is required" }),
  timeSlot: z.string().min(1, { message: "Time slot is required" }),
  gardenSize: z.string().min(1, { message: "Garden size is required" }),
  contactName: z.string().min(2, { message: "Name is required" }),
  contactPhone: z.string().min(10, { message: "Valid phone number is required" }),
  contactEmail: z.string().email({ message: "Valid email is required" }),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

export function BookGardenerModal() {
  const { isGardenerModalOpen, closeGardenerModal } = useModalContext();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Define service options with more details and icons
  const serviceOptions = [
    { value: "maintenance", label: "Garden Maintenance", icon: "fa-leaf", description: "Regular upkeep including pruning, weeding, and garden bed maintenance" },
    { value: "planting", label: "Plant Installation", icon: "fa-seedling", description: "Expert planting of new trees, shrubs, flowers and garden layouts" },
    { value: "lawn", label: "Lawn Care", icon: "fa-cut", description: "Complete lawn maintenance including mowing, fertilizing and weed control" },
    { value: "irrigation", label: "Irrigation Setup", icon: "fa-tint", description: "Installation and maintenance of watering systems for your garden" }
  ];
  
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      serviceType: "",
      date: "",
      timeSlot: "",
      gardenSize: "",
      notes: "",
      contactName: "",
      contactPhone: "",
      contactEmail: "",
    }
  });
  
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const getServiceIcon = (serviceType: string) => {
    const service = serviceOptions.find(s => s.value === serviceType);
    return service ? service.icon : "fa-question";
  };
  
  const getServiceLabel = (serviceType: string) => {
    const service = serviceOptions.find(s => s.value === serviceType);
    return service ? service.label : "Unknown Service";
  };
  
  if (!isGardenerModalOpen) return null;
  
  // Success confirmation screen
  if (showConfirmation) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-20 flex items-center justify-center">
        <div className="bg-white rounded-lg w-11/12 max-w-md overflow-hidden">
          <div className="bg-green-50 p-8 flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-check text-green-500 text-2xl"></i>
            </div>
            <h3 className="font-heading font-semibold text-lg text-center mb-2">Booking Successful!</h3>
            <p className="text-gray-600 text-center mb-4">
              We've received your gardener booking request. Our team will contact you shortly to confirm the details.
            </p>
            <button 
              onClick={() => {
                setShowConfirmation(false);
                closeGardenerModal();
              }}
              className="bg-primary hover:bg-opacity-90 text-white py-2 px-6 rounded-lg font-medium"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-20 flex items-center justify-center">
      <div className="bg-white rounded-lg w-11/12 max-w-md max-h-90vh overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="font-heading font-semibold text-lg">Book a Gardener</h3>
            <button className="text-gray-500" onClick={closeGardenerModal}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
        
        {/* Progress steps */}
        <div className="px-4 pt-4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                1
              </div>
              <span className="text-xs mt-1">Service</span>
            </div>
            <div className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                2
              </div>
              <span className="text-xs mt-1">Schedule</span>
            </div>
            <div className={`flex-1 h-1 mx-2 ${currentStep >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                3
              </div>
              <span className="text-xs mt-1">Details</span>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          {/* Step 1: Service Selection */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h4 className="font-medium text-lg mb-3">What service do you need?</h4>
              
              <div className="grid grid-cols-1 gap-3">
                {serviceOptions.map((service) => (
                  <label key={service.value} className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${form.watch('serviceType') === service.value ? 'border-primary bg-primary bg-opacity-5' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      value={service.value}
                      {...form.register("serviceType")}
                      className="sr-only"
                    />
                    <div className="mr-3 mt-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${form.watch('serviceType') === service.value ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                        <i className={`fas ${service.icon}`}></i>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{service.label}</p>
                      <p className="text-sm text-gray-500">{service.description}</p>
                    </div>
                  </label>
                ))}
              </div>
              
              {form.formState.errors.serviceType && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.serviceType.message}</p>
              )}
              
              <button 
                type="button" 
                onClick={() => setCurrentStep(2)}
                className="w-full bg-primary hover:bg-opacity-90 text-white p-3 rounded-lg font-medium mt-4"
              >
                Continue
              </button>
            </div>
          )}
          
          {/* Step 2: Schedule */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h4 className="font-medium text-lg mb-3">When would you like the service?</h4>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">Date</label>
                <input 
                  type="date" 
                  className={`w-full p-2 border ${form.formState.errors.date ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none text-sm`}
                  {...form.register("date")}
                />
                {form.formState.errors.date && (
                  <p className="text-red-500 text-xs mt-1">{form.formState.errors.date.message}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">Preferred Time</label>
                <div className="grid grid-cols-3 gap-2">
                  <label className={`flex flex-col items-center p-2 border rounded-lg cursor-pointer ${form.watch('timeSlot') === 'morning' ? 'border-primary bg-primary bg-opacity-5' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      value="morning"
                      {...form.register("timeSlot")}
                      className="sr-only"
                    />
                    <i className="fas fa-sun text-yellow-500 mb-1"></i>
                    <span className="text-sm">Morning</span>
                    <span className="text-xs text-gray-500">9AM-12PM</span>
                  </label>
                  <label className={`flex flex-col items-center p-2 border rounded-lg cursor-pointer ${form.watch('timeSlot') === 'afternoon' ? 'border-primary bg-primary bg-opacity-5' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      value="afternoon"
                      {...form.register("timeSlot")}
                      className="sr-only"
                    />
                    <i className="fas fa-cloud-sun text-blue-500 mb-1"></i>
                    <span className="text-sm">Afternoon</span>
                    <span className="text-xs text-gray-500">1PM-4PM</span>
                  </label>
                  <label className={`flex flex-col items-center p-2 border rounded-lg cursor-pointer ${form.watch('timeSlot') === 'evening' ? 'border-primary bg-primary bg-opacity-5' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      value="evening"
                      {...form.register("timeSlot")}
                      className="sr-only"
                    />
                    <i className="fas fa-moon text-orange-500 mb-1"></i>
                    <span className="text-sm">Evening</span>
                    <span className="text-xs text-gray-500">5PM-7PM</span>
                  </label>
                </div>
                {form.formState.errors.timeSlot && (
                  <p className="text-red-500 text-xs mt-1">{form.formState.errors.timeSlot.message}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">Garden Size</label>
                <div className="grid grid-cols-3 gap-2">
                  <label className={`flex flex-col items-center p-2 border rounded-lg cursor-pointer ${form.watch('gardenSize') === 'small' ? 'border-primary bg-primary bg-opacity-5' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      value="small"
                      {...form.register("gardenSize")}
                      className="sr-only"
                    />
                    <i className="fas fa-seedling text-green-500 mb-1"></i>
                    <span className="text-sm">Small</span>
                    <span className="text-xs text-gray-500">Up to 100 sqft</span>
                  </label>
                  <label className={`flex flex-col items-center p-2 border rounded-lg cursor-pointer ${form.watch('gardenSize') === 'medium' ? 'border-primary bg-primary bg-opacity-5' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      value="medium"
                      {...form.register("gardenSize")}
                      className="sr-only"
                    />
                    <i className="fas fa-tree text-green-500 mb-1"></i>
                    <span className="text-sm">Medium</span>
                    <span className="text-xs text-gray-500">100-500 sqft</span>
                  </label>
                  <label className={`flex flex-col items-center p-2 border rounded-lg cursor-pointer ${form.watch('gardenSize') === 'large' ? 'border-primary bg-primary bg-opacity-5' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      value="large"
                      {...form.register("gardenSize")}
                      className="sr-only"
                    />
                    <i className="fas fa-leaf text-green-500 mb-1"></i>
                    <span className="text-sm">Large</span>
                    <span className="text-xs text-gray-500">500+ sqft</span>
                  </label>
                </div>
                {form.formState.errors.gardenSize && (
                  <p className="text-red-500 text-xs mt-1">{form.formState.errors.gardenSize.message}</p>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button 
                  type="button" 
                  onClick={handleBack}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-lg font-medium"
                >
                  Back
                </button>
                <button 
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="flex-1 bg-primary hover:bg-opacity-90 text-white p-3 rounded-lg font-medium"
                >
                  Continue
                </button>
              </div>
            </div>
          )}
          
          {/* Step 3: Contact details */}
          {currentStep === 3 && (
            <div>
              <h4 className="font-medium text-lg mb-3">Your Contact Details</h4>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">Your Name</label>
                <input 
                  type="text"
                  className={`w-full p-2 border ${form.formState.errors.contactName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none text-sm`}
                  placeholder="Enter your full name"
                  {...form.register("contactName")}
                />
                {form.formState.errors.contactName && (
                  <p className="text-red-500 text-xs mt-1">{form.formState.errors.contactName.message}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">Phone Number</label>
                <input 
                  type="tel"
                  className={`w-full p-2 border ${form.formState.errors.contactPhone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none text-sm`}
                  placeholder="Enter your phone number"
                  {...form.register("contactPhone")}
                />
                {form.formState.errors.contactPhone && (
                  <p className="text-red-500 text-xs mt-1">{form.formState.errors.contactPhone.message}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                <input 
                  type="email"
                  className={`w-full p-2 border ${form.formState.errors.contactEmail ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none text-sm`}
                  placeholder="Enter your email address"
                  {...form.register("contactEmail")}
                />
                {form.formState.errors.contactEmail && (
                  <p className="text-red-500 text-xs mt-1">{form.formState.errors.contactEmail.message}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">Additional Notes</label>
                <textarea 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none text-sm"
                  rows={3}
                  placeholder="Any specific requirements or details about your garden"
                  {...form.register("notes")}
                ></textarea>
              </div>
              
              {/* Service summary */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-sm mb-2">Booking Summary</h5>
                <div className="flex items-center mb-2">
                  <i className={`fas ${getServiceIcon(form.watch('serviceType'))} text-primary mr-2`}></i>
                  <span className="text-sm">{getServiceLabel(form.watch('serviceType'))}</span>
                </div>
                <div className="flex items-center mb-2">
                  <i className="fas fa-calendar text-primary mr-2"></i>
                  <span className="text-sm">{form.watch('date') || 'Date not selected'}</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-clock text-primary mr-2"></i>
                  <span className="text-sm">
                    {form.watch('timeSlot') === 'morning' ? 'Morning (9AM-12PM)' : 
                     form.watch('timeSlot') === 'afternoon' ? 'Afternoon (1PM-4PM)' : 
                     form.watch('timeSlot') === 'evening' ? 'Evening (5PM-7PM)' : 'Time not selected'}
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button 
                  type="button" 
                  onClick={handleBack}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-lg font-medium"
                >
                  Back
                </button>
                <button 
                  type="button" 
                  className="flex-1 bg-primary hover:bg-opacity-90 text-white p-3 rounded-lg font-medium"
                  disabled={isSubmitting}
                  onClick={async () => {
                    try {
                      setIsSubmitting(true);
                      const data = form.getValues();
                      console.log("Submitting booking:", data);
                      await apiRequest('POST', '/api/gardener-booking', data);
                      setShowConfirmation(true);
                      form.reset();
                    } catch (error) {
                      toast({
                        title: "Booking failed",
                        description: error instanceof Error ? error.message : "Something went wrong",
                        variant: "destructive",
                        duration: 5000,
                      });
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                >
                  {isSubmitting ? 'Processing...' : 'Complete Booking'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
