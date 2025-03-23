import { useLocation, Link } from 'wouter';
import { useIsMobileOrTablet } from '@/hooks/use-mobile';

export function BottomNavigation() {
  const [location] = useLocation();
  const isMobileOrTablet = useIsMobileOrTablet();
  
  // Only show on mobile/tablet, hide on large screens
  if (!isMobileOrTablet) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-10 md:border-t-2">
      <div className="w-full max-w-xl mx-auto px-2 sm:px-3 py-1 sm:py-2">
        <div className="flex justify-between items-center">
          <Link href="/">
            <div className={`flex flex-col items-center cursor-pointer p-2 touch-target ${location === '/' ? 'text-primary' : 'text-gray-500'}`}>
              <i className="fas fa-home text-base sm:text-lg"></i>
              <span className="text-[10px] sm:text-xs mt-0.5 font-medium">Home</span>
            </div>
          </Link>
          
          <Link href="/gardener-booking">
            <div className={`flex flex-col items-center cursor-pointer p-2 touch-target ${location.includes('/gardener-booking') ? 'text-primary' : 'text-gray-500'}`}>
              <i className="fas fa-calendar-check text-base sm:text-lg"></i>
              <span className="text-[10px] sm:text-xs mt-0.5 font-medium">Bookings</span>
            </div>
          </Link>
          
          <Link href="/account">
            <div className={`flex flex-col items-center cursor-pointer p-2 touch-target ${location === '/account' ? 'text-primary' : 'text-gray-500'}`}>
              <i className="fas fa-user text-base sm:text-lg"></i>
              <span className="text-[10px] sm:text-xs mt-0.5 font-medium">Account</span>
            </div>
          </Link>
        </div>
      </div>
      
      {/* Safe area for iOS devices */}
      <div className="h-safe-area bg-white"></div>
    </nav>
  );
}
