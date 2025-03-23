import { Link } from 'wouter';
import { useState } from 'react';
import { useCartContext } from '@/contexts/cart-context';
import { StarRating } from '@/components/ui/star-rating';
import { Product } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile, useIsTablet } from '@/hooks/use-mobile';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const { addToCart } = useCartContext();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart(product.id);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
      duration: 2000,
    });
  };
  
  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Removed from wishlist" : "Added to wishlist",
      description: isFavorite ? `${product.name} has been removed from your wishlist` : `${product.name} has been added to your wishlist`,
      duration: 2000,
    });
  };
  
  const formattedPrice = (price: number) => {
    return `₹${(price / 100).toFixed(0)}`;
  };
  
  // Calculate discount percentage if original price exists
  const calculateDiscount = () => {
    if (product.originalPrice && product.originalPrice > product.price) {
      const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
      return discount;
    }
    return null;
  };
  
  const discount = calculateDiscount();
  
  // Handle optional rating and reviewCount
  const safeRating = product.rating ?? 0;
  const safeReviewCount = product.reviewCount ?? 0;
  
  return (
    <div 
      className="w-full bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 transform hover:-translate-y-1 active:shadow-inner active:transform-none active:translate-y-0 cursor-pointer"
      onClick={onClick}
    >
      <div className="relative">
        <div className="w-full h-32 sm:h-36 md:h-40 lg:h-44 overflow-hidden bg-gray-50">
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        </div>
        
        {/* Discount badge */}
        {discount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg shadow-sm">
            {discount}% OFF
          </div>
        )}
        
        {/* Favorite button */}
        <button 
          className="absolute top-2 right-2 bg-white rounded-full p-1.5 sm:p-2 shadow-md hover:scale-110 transition-transform duration-300 active:scale-95 active:bg-gray-50"
          onClick={handleFavoriteToggle}
          aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
        >
          <i className={`${isFavorite ? 'fas' : 'far'} fa-heart ${isFavorite ? 'text-red-500' : 'text-gray-400'} text-xs sm:text-sm`}></i>
        </button>
        
        {/* Featured badge */}
        {product.featured && (
          <div className="absolute bottom-2 left-2 bg-primary/90 text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-lg shadow-sm">
            Featured
          </div>
        )}
        
        {/* Stock indicator */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <span className="bg-black bg-opacity-80 text-white text-xs font-medium px-3 py-1.5 rounded-md shadow-sm">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      
      <div className="p-2.5 sm:p-3.5">
        <h3 className="font-medium text-xs sm:text-sm mb-1.5 line-clamp-2 min-h-[2.5rem] text-gray-800">{product.name}</h3>
        
        <div className="flex items-center justify-between">
          <StarRating rating={safeRating} reviewCount={safeReviewCount} size="sm" showCount={!isMobile} />
          {isMobile && safeReviewCount > 0 && (
            <span className="text-[10px] text-gray-500">({safeReviewCount})</span>
          )}
        </div>
        
        <div className="flex justify-between items-center mt-2.5">
          <div className="flex flex-col">
            <span className="font-bold text-xs sm:text-sm text-gray-900">{formattedPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-gray-500 text-[10px] sm:text-xs line-through">
                {formattedPrice(product.originalPrice)}
              </span>
            )}
          </div>
          
          <button 
            className="bg-primary text-white p-1.5 sm:p-2 rounded-full shadow-sm hover:shadow-md hover:scale-110 transition-all duration-300 active:scale-95 focus:ring-2 focus:ring-primary/20 focus:outline-none h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center"
            onClick={handleAddToCart}
            disabled={!product.inStock}
            aria-label="Add to cart"
          >
            <i className="fas fa-plus text-xs"></i>
          </button>
        </div>
        
        {/* Express delivery badge */}
        {product.inStock && (
          <div className="mt-2 flex items-center">
            <span className="text-[8px] sm:text-[10px] text-green-600 bg-green-50 rounded-full px-1.5 sm:px-2 py-0.5 flex items-center font-medium border border-green-100">
              <i className="fas fa-truck-fast mr-1 text-[7px] sm:text-[8px]"></i>
              Express Delivery
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
