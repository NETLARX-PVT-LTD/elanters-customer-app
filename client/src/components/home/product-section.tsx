import { Link } from 'wouter';
import { ProductCard } from './product-card';
import { Product } from '@shared/schema';
import { useModalContext } from '@/contexts/modal-context';
import { useIsMobile, useIsTablet } from '@/hooks/use-mobile';

interface ProductSectionProps {
  title: string;
  products: Product[] | undefined;
  isLoading: boolean;
  categorySlug?: string;
  layout?: 'grid' | 'scroll';
  description?: string;
}

export function ProductSection({ 
  title, 
  products, 
  isLoading, 
  categorySlug, 
  layout = 'scroll',
  description
}: ProductSectionProps) {
  const { openProductDetail } = useModalContext();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  
  const handleProductClick = (slug: string) => {
    openProductDetail(slug);
  };

  // Determine how many items to show based on screen size
  const getVisibleProducts = () => {
    if (!products) return [];
    
    // For scroll layout, show all products
    if (layout === 'scroll') return products;
    
    // For grid layout, limit products on mobile/tablet
    const limit = isMobile ? 4 : isTablet ? 6 : 8;
    return products.slice(0, limit);
  };

  const visibleProducts = getVisibleProducts();

  const renderScrollProducts = () => {
    return (
      <div className="overflow-x-scroll no-scrollbar -mx-4 px-4 md:-mx-6 md:px-6">
        <div className="flex gap-4 md:gap-5 lg:gap-6 pb-4 w-max">
          {products && products.length > 0 ? (
            products.map((product) => (
              <div key={product.id} className="flex-shrink-0 w-36 md:w-40 lg:w-48 xl:w-56">
                <ProductCard 
                  product={product} 
                  onClick={() => handleProductClick(product.slug)}
                />
              </div>
            ))
          ) : (
            <div className="w-full py-6 sm:py-8 flex flex-col items-center">
              <i className="fas fa-leaf text-gray-300 text-xl sm:text-2xl mb-2"></i>
              <p className="text-gray-500 text-xs sm:text-sm">No products available</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderGridProducts = () => {
    return (
      <div className="flex flex-wrap justify-center gap-4">
        {visibleProducts && visibleProducts.length > 0 ? (
          visibleProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onClick={() => handleProductClick(product.slug)}
            />
          ))
        ) : (
          <div className="w-full py-6 sm:py-8 flex flex-col items-center">
            <i className="fas fa-leaf text-gray-300 text-xl sm:text-2xl mb-2"></i>
            <p className="text-gray-500 text-xs sm:text-sm">No products available</p>
          </div>
        )}
      </div>
    );
  };

  const renderScrollSkeleton = () => {
    const skeletonCount = isMobile ? 3 : isTablet ? 4 : 5;
    
    return (
      <div className="overflow-x-scroll no-scrollbar -mx-4 px-4 md:-mx-6 md:px-6">
        <div className="flex gap-4 md:gap-5 lg:gap-6 pb-2 w-max">
          {[...Array(skeletonCount)].map((_, i) => (
            <div key={i} className="w-36 md:w-40 lg:w-48 xl:w-56 bg-gray-100 rounded-xl overflow-hidden shadow-sm animate-pulse flex-shrink-0">
              <div className="h-32 sm:h-36 md:h-40 lg:h-44 bg-gray-200"></div>
              <div className="p-2.5 sm:p-3.5">
                <div className="h-3 sm:h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-2 sm:h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="flex justify-between items-center">
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-8 w-8 sm:h-9 sm:w-9 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderGridSkeleton = () => {
    const skeletonCount = isMobile ? 4 : isTablet ? 6 : 8;
    
    return (
      <div className="flex flex-wrap justify-center gap-4">
        {[...Array(skeletonCount)].map((_, i) => (
          <div key={i} className="w-36 md:w-40 lg:w-48 xl:w-56 bg-gray-100 rounded-xl overflow-hidden shadow-sm animate-pulse">
            <div className="h-32 sm:h-36 md:h-40 lg:h-44 bg-gray-200"></div>
            <div className="p-2.5 sm:p-3.5">
              <div className="h-3 sm:h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-2 sm:h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-2 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div className="flex justify-between items-center">
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-8 w-8 sm:h-9 sm:w-9 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="mt-6 sm:mt-8 md:mt-10 px-4 md:px-6">
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <div>
          <h2 className="font-heading font-semibold text-base sm:text-lg md:text-xl">{title}</h2>
          {description && (
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">{description}</p>
          )}
        </div>
        {categorySlug && (
          <button 
            className="text-primary text-xs sm:text-sm font-medium flex items-center hover:underline focus:outline-none focus:ring-2 focus:ring-primary/20 px-2 py-1 rounded-md -mr-2"
            onClick={() => {
              window.location.href = `/category/${categorySlug}`;
            }}
          >
            See All
            <i className="fas fa-chevron-right text-[10px] sm:text-xs ml-1"></i>
          </button>
        )}
      </div>
      
      {isLoading 
        ? layout === 'scroll' ? renderScrollSkeleton() : renderGridSkeleton()
        : layout === 'scroll' ? renderScrollProducts() : renderGridProducts()
      }
      
      {/* Show view all link at bottom for grid layout on mobile */}
      {layout === 'grid' && products && products.length > visibleProducts.length && (
        <div className="mt-4 text-center">
          <button 
            className="text-primary text-sm font-medium inline-flex items-center hover:underline"
            onClick={() => {
              window.location.href = `/category/${categorySlug}`;
            }}
          >
            View all {products.length} items
            <i className="fas fa-arrow-right text-xs ml-1"></i>
          </button>
        </div>
      )}
    </div>
  );
}
