import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useCartContext } from '@/contexts/cart-context';
import { useModalContext } from '@/contexts/modal-context';
import { StarRating } from '@/components/ui/star-rating';

export function ProductDetailModal() {
  const { 
    isProductDetailOpen, 
    closeProductDetail,
    currentProductSlug
  } = useModalContext();
  
  const { addToCart } = useCartContext();
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ['/api/products', currentProductSlug],
    queryFn: () => fetch(`/api/products/${currentProductSlug}`).then(res => res.json()),
    enabled: !!currentProductSlug && isProductDetailOpen
  });

  const handleAddToCart = () => {
    if (product) {
      addToCart(product.id);
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart`,
        duration: 2000,
      });
    }
  };

  const formattedPrice = (price?: number) => {
    if (!price) return "";
    return `₹${(price / 100).toFixed(0)}`;
  };

  const calculateDiscount = (original?: number, current?: number) => {
    if (!original || !current || original <= current) return null;
    const discount = Math.round(((original - current) / original) * 100);
    return `${discount}% OFF`;
  };

  if (!isProductDetailOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white z-20">
        <div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <button className="text-dark" onClick={closeProductDetail}>
              <i className="fas fa-arrow-left"></i>
            </button>
            <div className="flex space-x-4">
              <button className="text-dark">
                <i className="far fa-heart"></i>
              </button>
              <button className="text-dark">
                <i className="fas fa-share-alt"></i>
              </button>
            </div>
          </div>
        </div>
        <div className="h-80 bg-gray-100 animate-pulse"></div>
        <div className="p-4">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-white z-20">
      <div className="h-full overflow-y-auto pb-16">
        <div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <button className="text-dark" onClick={closeProductDetail}>
              <i className="fas fa-arrow-left"></i>
            </button>
            <div className="flex space-x-4">
              <button className="text-dark">
                <i className="far fa-heart"></i>
              </button>
              <button className="text-dark">
                <i className="fas fa-share-alt"></i>
              </button>
            </div>
          </div>
        </div>
        
        {/* Image Gallery */}
        <div className="relative h-80">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-80 object-cover"
          />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <div className="flex space-x-1">
              {[...Array(4)].map((_, index) => (
                <div 
                  key={index}
                  className={`w-2 h-2 rounded-full ${index === currentImageIndex ? 'bg-primary' : 'bg-gray-300'}`}
                ></div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Product Info */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h1 className="font-heading font-semibold text-xl">{product.name}</h1>
            <span className="bg-[#8BC34A] bg-opacity-20 text-[#8BC34A] px-2 py-1 rounded text-xs font-medium">
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
          
          <div className="flex items-center mb-2">
            <StarRating rating={product.rating} reviewCount={product.reviewCount} size="md" />
          </div>
          
          <div className="flex items-center mb-4">
            <span className="font-semibold text-lg mr-2">{formattedPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-gray-500 text-sm line-through">{formattedPrice(product.originalPrice)}</span>
            )}
            {product.originalPrice && (
              <span className="ml-2 text-[#FF9800] text-sm font-medium">
                {calculateDiscount(product.originalPrice, product.price)}
              </span>
            )}
          </div>
          
          {/* Plant Specifications */}
          {product.details && (
            <div className="mb-4">
              <h3 className="font-medium text-base mb-2">Plant Specifications</h3>
              <div className="grid grid-cols-2 gap-3">
                {product.details.light && (
                  <div className="flex items-center">
                    <div className="w-9 h-9 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mr-2">
                      <i className="fas fa-sun text-primary"></i>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Light</span>
                      <p className="text-sm">{product.details.light}</p>
                    </div>
                  </div>
                )}
                
                {product.details.water && (
                  <div className="flex items-center">
                    <div className="w-9 h-9 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mr-2">
                      <i className="fas fa-water text-primary"></i>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Water</span>
                      <p className="text-sm">{product.details.water}</p>
                    </div>
                  </div>
                )}
                
                {product.details.height && (
                  <div className="flex items-center">
                    <div className="w-9 h-9 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mr-2">
                      <i className="fas fa-ruler-vertical text-primary"></i>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Height</span>
                      <p className="text-sm">{product.details.height}</p>
                    </div>
                  </div>
                )}
                
                {product.details.temperature && (
                  <div className="flex items-center">
                    <div className="w-9 h-9 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mr-2">
                      <i className="fas fa-thermometer-half text-primary"></i>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Temperature</span>
                      <p className="text-sm">{product.details.temperature}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Description */}
          <div className="mb-4">
            <h3 className="font-medium text-base mb-2">Description</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {product.description}
            </p>
          </div>
          
          {/* Care Instructions */}
          {product.details?.careInstructions && (
            <div className="mb-4">
              <h3 className="font-medium text-base mb-2">Care Instructions</h3>
              <ul className="text-sm text-gray-700 list-disc pl-4 space-y-1">
                {product.details.careInstructions.split('\n').map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      
      {/* Add to Cart Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 flex justify-between items-center">
        <div>
          <span className="font-medium text-lg">{formattedPrice(product.price)}</span>
        </div>
        <button 
          className="bg-primary text-white py-2 px-6 rounded-lg font-medium"
          onClick={handleAddToCart}
          disabled={!product.inStock}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
