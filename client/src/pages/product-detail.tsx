import { useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useModalContext } from "@/contexts/modal-context";
import { Product } from "@shared/schema";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:slug");
  const slug = params?.slug;
  const [, navigate] = useLocation();
  const { openProductDetail } = useModalContext();
  
  const { data: product, isLoading, error } = useQuery<Product & { details?: any }>({
    queryKey: ['/api/products', slug],
    queryFn: () => 
      fetch(`/api/products/${slug}`)
        .then(res => res.json()),
    enabled: !!slug,
  });
  
  useEffect(() => {
    if (slug && !isLoading && !error) {
      openProductDetail(slug);
    }
    
    // If product not found, redirect to 404
    if (!isLoading && error) {
      navigate("/not-found");
    }
  }, [slug, isLoading, error, navigate, openProductDetail]);
  
  // This page merely redirects to the product detail modal
  // The actual rendering happens in the ProductDetailModal component
  
  return null;
}
