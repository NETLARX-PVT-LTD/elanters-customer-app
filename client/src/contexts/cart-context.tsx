import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { CartItem, Product } from '@shared/schema';

interface CartItemWithProduct extends CartItem {
  product?: Product;
}

interface CartContextType {
  cartItems: CartItemWithProduct[];
  cartCount: number;
  totalPrice: number;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cartItems.reduce((total, item) => {
    return total + (item.product?.price || 0) * item.quantity;
  }, 0);
  
  // Load cart on initial mount
  useEffect(() => {
    fetchCart();
  }, []);
  
  const fetchCart = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/cart', {
        headers: sessionId ? { session_id: sessionId } : {}
      });
      
      // Get the session ID from the response headers
      const responseSessionId = response.headers.get('session_id');
      if (responseSessionId) {
        setSessionId(responseSessionId);
        // Store in localStorage for persistence
        localStorage.setItem('cart_session_id', responseSessionId);
      }
      
      const data = await response.json();
      setCartItems(data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initialize session ID from localStorage if available
  useEffect(() => {
    const storedSessionId = localStorage.getItem('cart_session_id');
    if (storedSessionId) {
      setSessionId(storedSessionId);
    }
  }, []);
  
  const addToCart = async (productId: number, quantity: number = 1) => {
    setIsLoading(true);
    try {
      // Use direct fetch with custom headers instead of apiRequest
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionId ? { 'session_id': sessionId } : {})
        },
        body: JSON.stringify({ productId, quantity })
      });
      
      // Get the session ID from the response headers
      const responseSessionId = response.headers.get('session_id');
      if (responseSessionId) {
        setSessionId(responseSessionId);
        localStorage.setItem('cart_session_id', responseSessionId);
      }
      
      // Invalidate cart query to refresh data and fetch updated cart
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      await fetchCart();
    } catch (error) {
      console.error('Failed to add item to cart:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateQuantity = async (cartItemId: number, quantity: number) => {
    setIsLoading(true);
    try {
      // Use direct fetch with custom headers
      await fetch(`/api/cart/${cartItemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionId ? { 'session_id': sessionId } : {})
        },
        body: JSON.stringify({ quantity })
      });
      await fetchCart();
    } catch (error) {
      console.error('Failed to update cart item quantity:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const removeFromCart = async (cartItemId: number) => {
    setIsLoading(true);
    try {
      // Use direct fetch with custom headers
      await fetch(`/api/cart/${cartItemId}`, {
        method: 'DELETE',
        headers: {
          ...(sessionId ? { 'session_id': sessionId } : {})
        }
      });
      await fetchCart();
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const clearCart = async () => {
    setIsLoading(true);
    try {
      // Use direct fetch with custom headers
      await fetch('/api/cart', {
        method: 'DELETE',
        headers: {
          ...(sessionId ? { 'session_id': sessionId } : {})
        }
      });
      setCartItems([]);
    } catch (error) {
      console.error('Failed to clear cart:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      totalPrice,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      isLoading
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
}
