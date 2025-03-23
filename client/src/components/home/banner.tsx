import { useState, useEffect, useRef } from 'react';
import { useModalContext } from '@/contexts/modal-context';

export function Banner() {
  const { openGardenerModal } = useModalContext();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  
  // Banner slides data showing top offers rather than services
  const bannerSlides = [
    {
      image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      title: "BIG SALE! Get 50% Off",
      subtitle: "Use code PLANTS50 on all indoor plants",
      cta: "Shop Now",
      ctaAction: () => console.log("Shop now clicked")
    },
    {
      image: "https://images.unsplash.com/photo-1551033406-611cf9a28f67?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      title: "Buy 2 Get 1 Free",
      subtitle: "On all garden tools and accessories",
      cta: "Grab Now",
      ctaAction: () => console.log("Explore clicked")
    },
    {
      image: "https://images.unsplash.com/photo-1534710961216-75c88202f43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      title: "Free Shipping",
      subtitle: "On all orders above $99",
      cta: "See Offers",
      ctaAction: () => console.log("See offers clicked")
    }
  ];
  
  // Auto rotate banner slides
  useEffect(() => {
    const startAutoPlay = () => {
      autoPlayRef.current = setInterval(() => {
        setIsTransitioning(true);
        setActiveSlide((prevSlide) => (prevSlide + 1) % bannerSlides.length);
        
        // Reset transition state after animation
        setTimeout(() => {
          setIsTransitioning(false);
        }, 500);
      }, 5000);
    };
    
    startAutoPlay();
    
    // Clean up interval on component unmount
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [bannerSlides.length]);
  
  const goToSlide = (index: number) => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    
    setIsTransitioning(true);
    setActiveSlide(index);
    
    // Reset transition state after animation
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };
  
  const handleCtaClick = (e: React.MouseEvent, ctaAction: () => void) => {
    e.preventDefault();
    ctaAction();
  };
  
  return (
    <div className="relative">
      <div className="relative h-64 overflow-hidden rounded-b-xl shadow-md">
        {bannerSlides.map((slide, index) => (
          <div 
            key={index}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              activeSlide === index 
                ? 'opacity-100 translate-x-0 scale-100' 
                : index < activeSlide 
                  ? 'opacity-0 -translate-x-full scale-95' 
                  : 'opacity-0 translate-x-full scale-95'
            }`}
          >
            <img 
              src={slide.image} 
              alt={slide.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
            <div className="absolute inset-0 flex flex-col justify-end pb-12 px-6">
              <h2 className={`text-white font-heading font-semibold text-2xl mb-2 drop-shadow-md transition-all duration-700 ${
                activeSlide === index ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}>
                {slide.title}
              </h2>
              <p className={`text-white text-sm mb-4 opacity-90 transition-all duration-700 delay-100 ${
                activeSlide === index ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}>
                {slide.subtitle}
              </p>
              <button 
                className={`bg-primary hover:bg-opacity-90 active:scale-95 text-white py-2 px-4 rounded-lg font-medium text-sm w-40 shadow-md transition-all duration-700 delay-200 ${
                  activeSlide === index ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
                onClick={(e) => handleCtaClick(e, slide.ctaAction)}
              >
                {slide.cta}
              </button>
            </div>
          </div>
        ))}
        
        {/* Slide indicators */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-2 z-10">
          {bannerSlides.map((_, index) => (
            <button 
              key={index} 
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeSlide === index ? 'bg-white w-8' : 'bg-white/50 w-2 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
              disabled={isTransitioning}
            />
          ))}
        </div>
      </div>
      
      {/* Book gardener button */}
      <div className="absolute -bottom-6 right-4 z-20">
        <button 
          onClick={openGardenerModal}
          className="bg-primary text-white p-3 rounded-full shadow-lg flex items-center transition-transform hover:scale-105 active:scale-95"
        >
          <i className="fas fa-hands-helping mr-2"></i>
          <span className="text-sm font-medium">Book Gardener</span>
        </button>
      </div>
    </div>
  );
}
