import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Product, Category } from '@shared/schema';
import { Header } from '@/components/layout/header';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { ProductCard } from '@/components/home/product-card';
import { useModalContext } from '@/contexts/modal-context';
import { useLocation } from 'wouter';

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { openProductDetail } = useModalContext();
  const [location] = useLocation();
  
  // Parse query parameter from URL on mount and when URL changes
  useEffect(() => {
    const url = new URL(window.location.href);
    const queryParam = url.searchParams.get('q');
    const categoryParam = url.searchParams.get('category');
    
    if (queryParam) {
      setSearchTerm(queryParam);
    }
    
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [location]);
  
  // Get all products
  const { data: products, isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });
  
  // Get categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Filter products based on search term and category
  const filteredProducts = products ? products.filter(product => {
    // Match search term
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Match category if one is selected
    const matchesCategory = !selectedCategory || 
      (categories && categories.find(c => c.slug === selectedCategory)?.id === product.categoryId);
    
    return matchesSearch && matchesCategory;
  }) : [];

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update URL with search term but without navigating
    const url = new URL(window.location.href);
    if (searchTerm) {
      url.searchParams.set('q', searchTerm);
    } else {
      url.searchParams.delete('q');
    }
    window.history.pushState({}, '', url);
  };
  
  // Handle category selection
  const handleCategorySelect = (slug: string) => {
    setSelectedCategory(slug);
    
    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set('category', slug);
    window.history.pushState({}, '', url);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    
    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.delete('q');
    url.searchParams.delete('category');
    window.history.pushState({}, '', url);
  };

  // Navigate to a category-specific search page
  const goToCategorySearch = (categorySlug: string) => {
    window.location.href = `/search?category=${categorySlug}`;
  };

  return (
    <div className="max-w-md mx-auto pb-16 min-h-screen relative bg-white">
      <Header title="Search" />
      
      <main className="p-4">
        {/* Search form */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search plants, pots, soil..."
              className="w-full py-3 px-4 pl-10 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            {(searchTerm || selectedCategory) && (
              <button 
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                onClick={clearFilters}
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </form>
        
        {/* Category filters */}
        {searchTerm === '' && !selectedCategory && (
          <div className="mb-6">
            <h3 className="font-medium text-sm mb-3">Search by Category</h3>
            <div className="grid grid-cols-2 gap-3">
              {categories?.map(category => (
                <div 
                  key={category.id} 
                  className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 flex items-center"
                  onClick={() => goToCategorySearch(category.slug)}
                >
                  <div className="w-10 h-10 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mr-3">
                    <i className={`fas fa-${
                      category.slug === 'plants' ? 'leaf' : 
                      category.slug === 'pots' ? 'box' : 
                      category.slug === 'soil' ? 'mountain' : 
                      'tools'
                    } text-primary`}></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{category.name}</h4>
                    <p className="text-xs text-gray-500">
                      {category.slug === 'plants' ? 'Indoor & outdoor plants' : 
                      category.slug === 'pots' ? 'Ceramic & plastic pots' : 
                      category.slug === 'soil' ? 'Potting soil & compost' : 
                      'Tools & equipment'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Active filters display */}
        {(searchTerm || selectedCategory) && (
          <div className="mb-4">
            {selectedCategory && categories && (
              <div className="text-sm text-gray-600 mb-1">
                Searching in: <span className="font-medium text-primary">{categories.find(c => c.slug === selectedCategory)?.name}</span>
              </div>
            )}
            {searchTerm && (
              <div className="text-sm text-gray-600">
                {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} for "{searchTerm}"
              </div>
            )}
          </div>
        )}
        
        {/* Search results or initial state */}
        {isLoadingProducts ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl overflow-hidden shadow-sm animate-pulse">
                <div className="h-40"></div>
                <div className="p-3">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : searchTerm || selectedCategory ? (
          // Search results 
          filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onClick={() => openProductDetail(product.slug)}
                />
              ))}
            </div>
          ) : (
            // No results found
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-search text-gray-300 text-xl"></i>
              </div>
              <h3 className="font-medium mb-1">No results found</h3>
              <p className="text-gray-500 text-sm mb-4">Try a different search term or browse categories</p>
              <button 
                className="bg-primary text-white px-4 py-2 rounded-lg text-sm"
                onClick={clearFilters}
              >
                Clear Search
              </button>
            </div>
          )
        ) : (
          // Initial empty state
          <div className="text-center py-10">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <i className="fas fa-search text-3xl text-gray-300"></i>
            </div>
            <h3 className="font-medium text-lg mb-1">Search our garden collection</h3>
            <p className="text-gray-500 text-sm mb-5">
              Type to find plants, soil, pots, accessories and more
            </p>
          </div>
        )}
      </main>
      
      <BottomNavigation />
    </div>
  );
}