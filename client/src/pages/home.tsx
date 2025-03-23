import { useQuery } from "@tanstack/react-query";
import { useCartContext } from "@/contexts/cart-context";
import { useModalContext } from "@/contexts/modal-context";
import { Header } from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Banner } from "@/components/home/banner";
import { ProductSection } from "@/components/home/product-section";
import { Product, Category } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { cartCount } = useCartContext();
  const { openCart, openGardenerModal } = useModalContext();
  const { toast } = useToast();
  
  // Fetch featured plants
  const { 
    data: featuredPlants, 
    isLoading: isLoadingFeaturedPlants 
  } = useQuery<Product[]>({
    queryKey: ['/api/products/featured'],
  });
  
  // Fetch categories for accessory and soil products
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  // Fetch plant products
  const {
    data: plantProducts,
    isLoading: isLoadingPlants
  } = useQuery<Product[]>({
    queryKey: ['/api/products', 'plants'],
    queryFn: async () => {
      console.log("Fetching plant products");
      const response = await fetch('/api/products?category=plants');
      const data = await response.json();
      console.log("Plant products:", data);
      return data;
    },
    enabled: !!categories?.some(c => c.slug === 'plants')
  });
  
  // Fetch pot products
  const {
    data: potProducts,
    isLoading: isLoadingPots
  } = useQuery<Product[]>({
    queryKey: ['/api/products', 'pots'],
    queryFn: async () => {
      console.log("Fetching pot products");
      const response = await fetch('/api/products?category=pots');
      const data = await response.json();
      console.log("Pot products:", data);
      return data;
    },
    enabled: !!categories?.some(c => c.slug === 'pots')
  });
  
  // Fetch accessory products
  const {
    data: accessories,
    isLoading: isLoadingAccessories
  } = useQuery<Product[]>({
    queryKey: ['/api/products', 'accessories'],
    queryFn: async () => {
      console.log("Fetching accessories products");
      const response = await fetch('/api/products?category=accessories');
      const data = await response.json();
      console.log("Accessories products:", data);
      return data;
    },
    enabled: !!categories?.some(c => c.slug === 'accessories')
  });
  
  // Fetch soil products
  const {
    data: soilProducts,
    isLoading: isLoadingSoil
  } = useQuery<Product[]>({
    queryKey: ['/api/products', 'soil'],
    queryFn: async () => {
      console.log("Fetching soil products");
      const response = await fetch('/api/products?category=soil');
      const data = await response.json();
      console.log("Soil products:", data);
      return data;
    },
    enabled: !!categories?.some(c => c.slug === 'soil')
  });
  
  const accessoriesCategory = categories?.find(c => c.slug === 'accessories');
  const soilCategory = categories?.find(c => c.slug === 'soil');
  
  // Add plants and pots categories
  const plantsCategory = categories?.find(c => c.slug === 'plants');
  const potsCategory = categories?.find(c => c.slug === 'pots');
  
  return (
    <div className="max-w-md mx-auto pb-16 min-h-screen relative bg-gray-50">
      <Header />
      
      <main className="pb-4">
        {/* Image carousel like Zomato */}
        <div className="bg-white pt-2 pb-4">
          <Banner />
        </div>
        
        {/* Offers have been moved to the banner/slider at the top */}
        
        {/* Order again section like Zomato */}
        <div className="bg-white px-4 py-4 mt-3 mb-3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Order Again</h2>
            <button 
              className="text-primary text-sm font-medium"
              onClick={() => {
                window.location.href = '/category/plants';
              }}
            >See All</button>
          </div>
          <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-3 snap-x snap-mandatory">
            <div className="flex-shrink-0 w-28 snap-start">
              <div className="h-28 w-28 rounded-lg overflow-hidden mb-1">
                <img src="https://images.unsplash.com/photo-1614594975525-e45190c55d0b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8" alt="Plant" className="h-full w-full object-cover" />
              </div>
              <div className="text-sm font-medium truncate">Snake Plant</div>
              <div className="text-xs text-gray-500">2 days ago</div>
            </div>
            <div className="flex-shrink-0 w-28 snap-start">
              <div className="h-28 w-28 rounded-lg overflow-hidden mb-1">
                <img src="https://images.unsplash.com/photo-1512428813834-c702c7702b78?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8" alt="Plant" className="h-full w-full object-cover" />
              </div>
              <div className="text-sm font-medium truncate">Potting Soil</div>
              <div className="text-xs text-gray-500">1 week ago</div>
            </div>
            <div className="flex-shrink-0 w-28 snap-start">
              <div className="h-28 w-28 rounded-lg overflow-hidden mb-1">
                <img src="https://images.unsplash.com/photo-1623910270912-9f140a1a87e1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8" alt="Plant" className="h-full w-full object-cover" />
              </div>
              <div className="text-sm font-medium truncate">Garden Gloves</div>
              <div className="text-xs text-gray-500">1 month ago</div>
            </div>
          </div>
        </div>

        {/* Featured plants in horizontal scrollable format */}
        <div className="mt-3 bg-white px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Featured Plants</h2>
            <button 
              className="text-primary text-sm font-medium"
              onClick={() => {
                window.location.href = '/category/plants';
              }}
            >See All</button>
          </div>
          
          {isLoadingFeaturedPlants ? (
            <div className="overflow-x-scroll no-scrollbar -mx-4 px-4">
              <div className="flex space-x-4 pb-3 w-max">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-36">
                    <div className="h-36 w-36 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded w-full mb-1 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-1 animate-pulse"></div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                      <div className="h-7 w-7 rounded bg-gray-200 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-scroll no-scrollbar -mx-4 px-4">
              <div className="flex space-x-4 pb-3 w-max">
                {featuredPlants?.map(plant => (
                  <div key={plant.id} className="flex-shrink-0 w-36">
                    <div className="h-36 w-36 rounded-lg overflow-hidden mb-2">
                      <img src={plant.imageUrl} alt={plant.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="font-medium text-sm line-clamp-1">{plant.name}</div>
                    <div className="flex items-center text-xs mt-1">
                      <div className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded flex items-center mr-1">
                        <i className="fas fa-star text-xs mr-0.5"></i>
                        <span>{plant.rating || 4.8}</span>
                      </div>
                      <span className="text-gray-500 text-xs">{plant.reviewCount || 128}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="font-medium text-sm">${(plant.price / 100).toFixed(2)}</div>
                      <button 
                        onClick={() => {
                          toast({
                            title: "Added to cart",
                            description: `${plant.name} has been added to your cart`,
                            variant: "default",
                          });
                        }}
                        className="h-7 w-7 rounded flex items-center justify-center bg-primary text-white"
                      >
                        <i className="fas fa-plus text-xs"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* All plants section */}
        <div className="mt-3 bg-white py-4">
          <ProductSection
            title="Popular Plants"
            products={plantProducts}
            isLoading={isLoadingPlants}
            categorySlug={plantsCategory?.slug}
            description="Healthy plants for your home and garden"
          />
        </div>
        
        {/* Pots section */}
        <div className="mt-3 bg-white py-4">
          <ProductSection
            title="Plant Pots"
            products={potProducts}
            isLoading={isLoadingPots}
            categorySlug={potsCategory?.slug}
            description="Beautiful pots for your plants"
          />
        </div>
        
        {/* Soil section */}
        <div className="mt-3 bg-white py-4">
          <ProductSection
            title="Soil & Fertilizers"
            products={soilProducts}
            isLoading={isLoadingSoil}
            categorySlug={soilCategory?.slug}
            description="Premium quality soil for your plants"
          />
        </div>
        
        {/* Accessories section */}
        <div className="mt-3 bg-white py-4">
          <ProductSection
            title="Gardening Accessories"
            products={accessories}
            isLoading={isLoadingAccessories}
            categorySlug={accessoriesCategory?.slug}
            description="Essential tools and accessories"
          />
        </div>
      </main>
      
      {/* Bottom Spacing */}
      <div className="mb-16"></div>
      
      {/* Floating Cart Button */}
      <div className="fixed bottom-20 right-4 z-10">
        <button 
          className="bg-primary text-white p-3 rounded-full shadow-lg relative hover:scale-110 transition-transform active:scale-95"
          onClick={openCart}
        >
          <i className="fas fa-shopping-cart"></i>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>
      
      <BottomNavigation />
    </div>
  );
}
