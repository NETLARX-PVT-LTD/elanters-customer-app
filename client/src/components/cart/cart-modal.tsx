import { useState } from 'react';
import { useLocation } from 'wouter';
import { useCartContext } from '@/contexts/cart-context';
import { CartItem } from './cart-item';
import { useModalContext } from '@/contexts/modal-context';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile, useIsTablet } from '@/hooks/use-mobile';

export function CartModal() {
  const { isCartOpen, closeCart } = useModalContext();
  const { cartItems, totalPrice, clearCart } = useCartContext();
  const [promoCode, setPromoCode] = useState('');
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  
  const handleCheckout = () => {
    // Close cart modal
    closeCart();
    
    // Show toast instead of navigating to checkout
    toast({
      title: "Order Functionality Disabled",
      description: "The order and checkout functionality has been disabled in this version.",
      duration: 3000,
    });
  };
  
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Promo Code",
      description: "Invalid promo code",
      variant: "destructive",
      duration: 2000,
    });
  };
  
  const shippingFee = cartItems.length > 0 ? 9900 : 0; // ₹99
  const tax = Math.round(totalPrice * 0.025); // 2.5% tax
  const grandTotal = totalPrice + shippingFee + tax;
  
  if (!isCartOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-white z-50 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 sm:p-4 border-b border-gray-200 flex justify-between items-center">
          <button 
            className="text-dark p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors" 
            onClick={closeCart}
            aria-label="Close cart"
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <h2 className="font-heading font-semibold text-base sm:text-lg">Shopping Cart</h2>
          <button 
            className="text-gray-400 p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors"
            onClick={() => clearCart()}
            disabled={cartItems.length === 0}
            aria-label="Clear cart"
          >
            <i className="far fa-trash-alt"></i>
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:px-6">
          {/* Cart Items */}
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[40vh]">
              <i className="fas fa-shopping-cart text-gray-300 text-5xl mb-4"></i>
              <p className="text-gray-500 text-center">Your cart is empty</p>
              <button 
                className="mt-6 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium"
                onClick={closeCart}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <CartItem 
                  key={item.id}
                  id={item.id}
                  name={item.product?.name || "Product"}
                  imageUrl={item.product?.imageUrl || ""}
                  price={item.product?.price || 0}
                  quantity={item.quantity}
                />
              ))}
            </div>
          )}
          
          {/* Promo Code & Order Summary */}
          {cartItems.length > 0 && (
            <>
              {/* Promo Code */}
              <div className="mt-6">
                <form onSubmit={handleApplyPromo} className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <input 
                    type="text" 
                    placeholder="Enter promo code" 
                    className="flex-1 p-2 text-sm outline-none"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <button 
                    type="submit"
                    className="bg-primary text-white px-4 py-2 text-sm font-medium"
                    disabled={!promoCode}
                  >
                    Apply
                  </button>
                </form>
              </div>
              
              {/* Order Summary */}
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-base mb-3">Order Summary</h3>
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span>₹{(totalPrice / 100).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span>₹{(shippingFee / 100).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tax</span>
                    <span>₹{(tax / 100).toFixed(0)}</span>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>₹{(grandTotal / 100).toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Checkout Button */}
        {cartItems.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-white shadow-md">
            <div className={isTablet ? "max-w-md mx-auto" : ""}>
              <button 
                className="w-full bg-primary text-white py-3 rounded-lg font-medium transition-colors hover:bg-primary/90 focus:ring-2 focus:ring-primary/20 focus:outline-none"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
