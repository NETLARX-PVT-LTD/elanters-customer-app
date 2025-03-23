import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(() => {
    // Get location from localStorage if it exists
    return localStorage.getItem("userLocation") || "New York";
  });
  const [location] = useLocation();
  const { toast } = useToast();
  
  // Listen for localStorage changes in other components
  useEffect(() => {
    const handleStorageChange = () => {
      const savedLocation = localStorage.getItem("userLocation");
      if (savedLocation && savedLocation !== currentLocation) {
        setCurrentLocation(savedLocation);
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    // Also check on mount and focus
    window.addEventListener("focus", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleStorageChange);
    };
  }, [currentLocation]);
  
  // Get only main categories for a simplified header
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Only show main shopping categories in the header (excluding duplicates and service-related items)
  const mainCategories = categories?.filter(cat => 
    ['plants', 'pots', 'soil', 'accessories'].includes(cat.slug) && 
    !['tools', 'gardeners'].includes(cat.slug) // Exclude duplicates
  ) || [];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center">
          {title ? (
            <div className="flex items-center">
              <Link href="/">
                <div className="cursor-pointer mr-2 touch-target p-1">
                  <i className="fas fa-arrow-left text-gray-700"></i>
                </div>
              </Link>
              <h1 className="font-heading font-semibold text-base sm:text-lg line-clamp-1">{title}</h1>
            </div>
          ) : (
            <>
              {/* Home link when no title is provided */}
              <Link href="/">
                <div className="font-heading font-bold text-lg sm:text-xl flex items-center cursor-pointer">
                  {/* Empty div to maintain layout structure */}
                  <span className="hidden sm:inline text-xs text-primary">Home</span>
                </div>
              </Link>
              
              {/* Location selector that navigates to location page */}
              <div className="ml-1 sm:ml-3">
                <Link href="/location">
                  <div className="flex items-center cursor-pointer py-1 px-1 sm:px-2 touch-target">
                    <i className="fas fa-map-marker-alt text-primary mr-1"></i>
                    <div className="flex items-center max-w-[120px] sm:max-w-none">
                      <span className="font-medium text-xs sm:text-sm truncate">{currentLocation}</span>
                      <i className="fas fa-chevron-down text-[10px] sm:text-xs ml-1 text-gray-500"></i>
                    </div>
                  </div>
                </Link>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center">
          <div 
            className="relative cursor-pointer touch-target p-1.5"
            onClick={() => {
              toast({
                title: "Notifications",
                description: "You have new notifications: Special offers on garden accessories and your order has been shipped!",
                variant: "default",
              });
            }}
          >
            <i className="fas fa-bell text-dark text-sm sm:text-base"></i>
          </div>
          {/* Removed duplicate user account button as it's already in bottom navigation */}
        </div>
      </div>
      
      {/* Simplified Categories Bar - Hide on gardener-booking page */}
      {!isLoading && mainCategories && !location.includes('gardener-booking') && (
        <div className="p-1.5 sm:p-2 overflow-x-scroll no-scrollbar">
          <div className="flex gap-2 px-2 w-max justify-start sm:justify-center">
            <Link href="/">
              <button 
                className={`px-3 sm:px-4 py-1.5 flex items-center gap-1.5 ${location === '/' ? 'bg-primary text-white' : 'bg-white border border-gray-200'} rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap`}
                aria-label="Show all categories"
              >
                <i className="fas fa-th-large"></i>
                <span>All</span>
              </button>
            </Link>
            
            {mainCategories.map((category) => {
              // Define icons for each category
              let icon = "";
              switch(category.slug) {
                case "plants":
                  icon = "fas fa-seedling";
                  break;
                case "soil":
                  icon = "fas fa-fill-drip";
                  break;
                case "accessories":
                  icon = "fas fa-hand-sparkles";
                  break;
                case "pots":
                  icon = "fas fa-cubes";
                  break;
                default:
                  icon = "fas fa-box";
              }
              
              return (
                <Link key={category.id} href={`/category/${category.slug}`}>
                  <button 
                    className={`px-3 sm:px-4 py-1.5 flex items-center gap-1.5 ${location === `/category/${category.slug}` ? 'bg-primary text-white' : 'bg-white border border-gray-200'} rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap`}
                    aria-label={`Show ${category.name} category`}
                  >
                    <i className={icon}></i>
                    <span>{category.name}</span>
                  </button>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}