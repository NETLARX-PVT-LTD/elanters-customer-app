import { useEffect } from "react";
import { useLocation } from "wouter";
import { useModalContext } from "@/contexts/modal-context";

export default function CartPage() {
  const [, navigate] = useLocation();
  const { openCart } = useModalContext();
  
  useEffect(() => {
    // Open the cart modal when this page is visited
    openCart();
    
    // Navigate back to home when the component unmounts
    return () => {
      navigate("/", { replace: true });
    };
  }, [openCart, navigate]);
  
  // This page merely redirects to the cart modal
  // The actual rendering happens in the CartModal component
  
  return null;
}
