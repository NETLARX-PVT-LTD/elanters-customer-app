import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/contexts/cart-context";
import { ModalProvider, useModalContext } from "@/contexts/modal-context";
import { BookGardenerModal } from "@/components/gardener/book-gardener-modal";
import { CartModal } from "@/components/cart/cart-modal";
import { ProductDetailModal } from "@/components/product/product-detail-modal";
import { useIsMobileOrTablet } from "@/hooks/use-mobile";

import Home from "@/pages/home";
import ProductDetail from "@/pages/product-detail";
import CategoryPage from "@/pages/category";
import CartPage from "@/pages/cart";
import CheckoutPage from "@/pages/checkout";
import GardenerBookingPage from "@/pages/gardener-booking";
import SearchPage from "@/pages/search";
import LoginPage from "@/pages/login";
import AccountPage from "@/pages/account";
import LocationPage from "@/pages/location";
import NotFound from "@/pages/not-found";

// Load FontAwesome styles from CDN
function loadFontAwesome() {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
  document.head.appendChild(link);
}

// Load it on mount
loadFontAwesome();

// Floating action button for booking a gardener
function FloatingGardenerButton() {
  const { openGardenerModal } = useModalContext();
  const [location] = useLocation();
  const isMobileOrTablet = useIsMobileOrTablet();
  
  // Don't show on gardener booking page or on mobile/tablet since we have bottom nav
  if (location === '/gardener-booking' || isMobileOrTablet) {
    return null;
  }
  
  return (
    <div className="fixed bottom-8 z-20 left-1/2 transform -translate-x-1/2">
      <button 
        onClick={openGardenerModal}
        className="bg-primary text-white px-6 py-3 rounded-full shadow-lg text-sm font-medium flex items-center hover:bg-primary/90 active:scale-95 transition-all"
      >
        <i className="fas fa-user-cog mr-2"></i>
        Book Professional Gardener
      </button>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/product/:slug" component={ProductDetail} />
      <Route path="/category/:slug" component={CategoryPage} />
      <Route path="/cart" component={CartPage} />
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/gardener-booking" component={GardenerBookingPage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/account" component={AccountPage} />
      <Route path="/location" component={LocationPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <div className="overflow-hidden hide-scrollbar">
      <QueryClientProvider client={queryClient}>
        <ModalProvider>
          <CartProvider>
            <Router />
            <FloatingGardenerButton />
            <Toaster />
            
            {/* Modals */}
            <BookGardenerModal />
            <CartModal />
            <ProductDetailModal />
          </CartProvider>
        </ModalProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
