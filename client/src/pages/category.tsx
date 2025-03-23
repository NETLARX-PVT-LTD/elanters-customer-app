import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { ProductCard } from "@/components/home/product-card";
import { useCartContext } from "@/contexts/cart-context";
import { useModalContext } from "@/contexts/modal-context";
import { Product, Category } from "@shared/schema";

export default function CategoryPage() {
  const [, params] = useRoute("/category/:slug");
  const slug = params?.slug;
  const { cartCount } = useCartContext();
  const { openCart, openProductDetail } = useModalContext();
  
  // Search, filter and sort states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]); 
  const [sortBy, setSortBy] = useState<string>("recommended");
  const [showInStockOnly, setShowInStockOnly] = useState<boolean>(false);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  
  // Fetch category data
  const { 
    data: categories,
    isLoading: isLoadingCategories
  } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  const category = categories?.find(c => c.slug === slug);
  
  // Fetch products for this category
  const {
    data: products,
    isLoading: isLoadingProducts
  } = useQuery<Product[]>({
    queryKey: ['/api/products', slug],
    queryFn: async () => {
      // Log for debugging
      console.log("Fetching products for category:", slug);
      const response = await fetch(`/api/products?category=${slug}`);
      const data = await response.json();
      console.log("Received products:", data);
      return data;
    },
    enabled: !!slug,
  });
  
  // Apply search, filters and sorting
  useEffect(() => {
    if (!products) return;
    
    let result = [...products];
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchLower) || 
        product.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply price filter
    result = result.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );
    
    // Apply in-stock filter
    if (showInStockOnly) {
      result = result.filter(product => product.inStock);
    }
    
    // Apply sorting
    switch (sortBy) {
      case "price-low-high":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high-low":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default: // recommended
        // Default sort uses the backend ordering
        break;
    }
    
    setFilteredProducts(result);
  }, [products, searchTerm, priceRange, sortBy, showInStockOnly]);
  
  const isLoading = isLoadingCategories || isLoadingProducts;
  
  // Format price for display
  const formatPrice = (price: number) => {
    return `₹${(price / 100).toFixed(0)}`;
  };
  
  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // No need to update URL here since we're searching within the category
  };
  
  // Reset all filters and search
  const resetFilters = () => {
    setSearchTerm('');
    setPriceRange([0, 100000]);
    setSortBy("recommended");
    setShowInStockOnly(false);
  };
  
  return (
    <div className="max-w-md mx-auto pb-16 min-h-screen relative bg-gray-50">
      <Header title={category ? category.name : 'Category'} />
      
      <main className="pb-4">
        <div className="bg-white p-4 shadow-sm">
          {/* Search Box - Always Visible */}
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <form onSubmit={handleSearch} className="relative">
              <input
                id="category-search"
                type="text"
                placeholder={`Search in ${category?.name || 'this category'}...`}
                className="w-full py-3 px-4 pl-10 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm bg-gray-50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              {searchTerm && (
                <button 
                  type="button"
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={() => setSearchTerm('')}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
              <button 
                type="button"
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${isFilterOpen ? 'text-primary' : 'text-gray-500'} flex items-center justify-center w-6 h-6`}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <i className="fas fa-filter"></i>
              </button>
            </form>
          </div>
        </div>
        
        {/* Active filters display */}
        {(searchTerm || sortBy !== 'recommended' || showInStockOnly || priceRange[0] > 0 || priceRange[1] < 100000) && (
          <div className="py-3 px-4 overflow-x-scroll no-scrollbar">
            <div className="flex gap-2 w-max">
              {searchTerm && (
                <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-medium flex items-center">
                  <span>"{searchTerm}"</span>
                  <button className="ml-2 w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center" onClick={() => setSearchTerm('')}>
                    <i className="fas fa-times text-[10px]"></i>
                  </button>
                </div>
              )}
              {sortBy !== 'recommended' && (
                <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-medium flex items-center whitespace-nowrap">
                  <span>Sort: {sortBy === 'price-low-high' 
                    ? 'Price Low-High' 
                    : sortBy === 'price-high-low' 
                      ? 'Price High-Low' 
                      : 'Highest Rated'}</span>
                  <button className="ml-2 w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center" onClick={() => setSortBy('recommended')}>
                    <i className="fas fa-times text-[10px]"></i>
                  </button>
                </div>
              )}
              {showInStockOnly && (
                <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-medium flex items-center">
                  <span>In Stock Only</span>
                  <button className="ml-2 w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center" onClick={() => setShowInStockOnly(false)}>
                    <i className="fas fa-times text-[10px]"></i>
                  </button>
                </div>
              )}
              {(priceRange[0] > 0 || priceRange[1] < 100000) && (
                <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-medium flex items-center whitespace-nowrap">
                  <span>{formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}</span>
                  <button className="ml-2 w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center" onClick={() => setPriceRange([0, 100000])}>
                    <i className="fas fa-times text-[10px]"></i>
                  </button>
                </div>
              )}
              <button
                className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-xs font-medium flex items-center"
                onClick={resetFilters}
              >
                Reset All
              </button>
            </div>
          </div>
        )}
        
        {/* Filter and Sort Panel */}
        {isFilterOpen && (
          <div className="bg-white p-4 shadow-sm border-b border-gray-100">
            <div className="mb-5">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-sm">Sort By</h3>
                {sortBy !== 'recommended' && (
                  <button 
                    className="text-xs text-primary"
                    onClick={() => setSortBy('recommended')}
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button 
                  className={`flex items-center text-xs py-2 px-3 rounded-full transition-all ${
                    sortBy === 'recommended' 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setSortBy('recommended')}
                >
                  <i className={`fas fa-thumbs-up ${sortBy === 'recommended' ? 'mr-1.5' : ''}`}></i>
                  {sortBy === 'recommended' && <span>Recommended</span>}
                </button>
                <button 
                  className={`flex items-center text-xs py-2 px-3 rounded-full transition-all ${
                    sortBy === 'price-low-high' 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setSortBy('price-low-high')}
                >
                  <i className={`fas fa-sort-amount-down-alt ${sortBy === 'price-low-high' ? 'mr-1.5' : ''}`}></i>
                  {sortBy === 'price-low-high' && <span>Price: Low to High</span>}
                </button>
                <button 
                  className={`flex items-center text-xs py-2 px-3 rounded-full transition-all ${
                    sortBy === 'price-high-low' 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setSortBy('price-high-low')}
                >
                  <i className={`fas fa-sort-amount-up ${sortBy === 'price-high-low' ? 'mr-1.5' : ''}`}></i>
                  {sortBy === 'price-high-low' && <span>Price: High to Low</span>}
                </button>
                <button 
                  className={`flex items-center text-xs py-2 px-3 rounded-full transition-all ${
                    sortBy === 'rating' 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setSortBy('rating')}
                >
                  <i className={`fas fa-star ${sortBy === 'rating' ? 'mr-1.5' : ''}`}></i>
                  {sortBy === 'rating' && <span>Highest Rated</span>}
                </button>
              </div>
            </div>
            
            <div className="mb-5">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-sm">Price Range</h3>
                <div className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                  {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                </div>
              </div>
              <div className="px-2 mt-3">
                <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full" 
                    style={{ width: `${(priceRange[1] / 100000) * 100}%` }}
                  ></div>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100000" 
                  step="5000"
                  value={priceRange[1]} 
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full absolute opacity-0 cursor-pointer -mt-1 h-3"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-3">
                  <span>₹0</span>
                  <span>₹1000</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <label className="inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={showInStockOnly} 
                    onChange={() => setShowInStockOnly(!showInStockOnly)}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  <span className="ms-3 text-sm text-gray-700">In Stock Only</span>
                </label>
              </div>
              
              <button 
                className="text-xs font-medium text-white bg-primary py-2 px-4 rounded-full shadow-sm hover:shadow transition-all"
                onClick={() => setIsFilterOpen(false)}
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
        
        {/* Results count and quick filter buttons */}
        <div className="px-4 py-3">
          {!isLoading && products && (
            <div className="text-sm text-gray-600 font-medium mb-3">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} 
              {searchTerm ? ` for "${searchTerm}"` : ''}
            </div>
          )}
          
          {/* Quick sort buttons */}
          {!isLoading && products && products.length > 0 && (
            <div className="overflow-x-scroll no-scrollbar -mx-1 px-1">
              <div className="flex gap-2 w-max">
                <button 
                  className={`flex items-center text-xs py-1.5 px-3 rounded-full transition-all ${
                    sortBy === 'recommended' 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setSortBy('recommended')}
                >
                  <i className="fas fa-thumbs-up text-xs mr-1.5"></i>
                  <span>Recommended</span>
                </button>
                <button 
                  className={`flex items-center text-xs py-1.5 px-3 rounded-full transition-all whitespace-nowrap ${
                    sortBy === 'price-low-high' 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setSortBy('price-low-high')}
                >
                  <i className="fas fa-sort-amount-down-alt text-xs mr-1.5"></i>
                  <span>Price: Low to High</span>
                </button>
                <button 
                  className={`flex items-center text-xs py-1.5 px-3 rounded-full transition-all whitespace-nowrap ${
                    sortBy === 'price-high-low' 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setSortBy('price-high-low')}
                >
                  <i className="fas fa-sort-amount-up text-xs mr-1.5"></i>
                  <span>Price: High to Low</span>
                </button>
                <button 
                  className={`flex items-center text-xs py-1.5 px-3 rounded-full transition-all whitespace-nowrap ${
                    sortBy === 'rating' 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setSortBy('rating')}
                >
                  <i className="fas fa-star text-xs mr-1.5"></i>
                  <span>Highest Rated</span>
                </button>
                <button
                  className="flex items-center text-xs py-1.5 px-3 rounded-full bg-white border border-gray-200 text-gray-700"
                  onClick={() => setIsFilterOpen(true)}
                >
                  <i className="fas fa-sliders-h text-xs mr-1.5"></i>
                  <span>More Filters</span>
                </button>
              </div>
            </div>
          )}
        </div>
        
        {isLoading ? (
          <div className="px-4 py-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
                  <div className="aspect-square bg-gray-200"></div>
                  <div className="p-2.5">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-7 w-7 bg-gray-200 rounded-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredProducts && filteredProducts.length > 0 ? (
          <div className="px-4 py-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
              {filteredProducts.map(product => (
                <div key={product.id} className="w-full">
                  <ProductCard 
                    product={product}
                    onClick={() => openProductDetail(product.slug)}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-80 bg-white mx-4 rounded-xl my-4 border border-gray-100">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <i className="fas fa-leaf text-primary text-xl"></i>
            </div>
            <h3 className="text-gray-700 font-medium mb-2">No products found</h3>
            <p className="text-gray-500 text-center text-sm max-w-xs">
              {products && products.length > 0 
                ? 'No products match your current filters. Try adjusting your search criteria.' 
                : 'There are no products available in this category at the moment.'}
            </p>
            {products && products.length > 0 && (
              <button 
                className="mt-5 text-white bg-primary text-sm font-medium px-5 py-2.5 rounded-full shadow-sm hover:shadow transition-all"
                onClick={resetFilters}
              >
                Reset All Filters
              </button>
            )}
          </div>
        )}
      </main>
      
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
