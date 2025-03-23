import { useModalContext } from "@/contexts/modal-context";
import { Link } from "wouter";

export function ServicesSection() {
  const { openGardenerModal } = useModalContext();

  return (
    <div className="mt-8 px-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-heading font-semibold text-lg">Expert Services</h2>
        <Link href="/gardener-booking">
          <span className="text-primary text-sm font-medium cursor-pointer">View Bookings</span>
        </Link>
      </div>
      
      <div className="bg-primary/5 rounded-xl p-5">
        <div className="flex items-center mb-4">
          <div className="mr-3 flex-shrink-0">
            <i className="fas fa-tasks text-primary text-xl"></i>
          </div>
          <div>
            <h3 className="font-medium">Professional Garden Services</h3>
            <p className="text-sm text-gray-600 mt-1">Get expert help with all your garden maintenance needs</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center mb-2">
            <i className="fas fa-check text-primary text-sm mr-2"></i>
            <p className="text-sm">Plant care and maintenance</p>
          </div>
          <div className="flex items-center mb-2">
            <i className="fas fa-check text-primary text-sm mr-2"></i>
            <p className="text-sm">Garden design consultation</p>
          </div>
          <div className="flex items-center mb-2">
            <i className="fas fa-check text-primary text-sm mr-2"></i>
            <p className="text-sm">Plant health diagnosis</p>
          </div>
          <div className="flex items-center">
            <i className="fas fa-check text-primary text-sm mr-2"></i>
            <p className="text-sm">Seasonal planting services</p>
          </div>
        </div>
      </div>
    </div>
  );
}
