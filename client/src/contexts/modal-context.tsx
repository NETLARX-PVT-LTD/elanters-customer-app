import { createContext, useContext, useState, ReactNode } from 'react';

interface ModalContextType {
  isGardenerModalOpen: boolean;
  isCartOpen: boolean;
  isProductDetailOpen: boolean;
  currentProductSlug: string | null;
  openGardenerModal: () => void;
  closeGardenerModal: () => void;
  openCart: () => void;
  closeCart: () => void;
  openProductDetail: (slug: string) => void;
  closeProductDetail: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

interface ModalProviderProps {
  children: ReactNode;
}

export function ModalProvider({ children }: ModalProviderProps) {
  const [isGardenerModalOpen, setIsGardenerModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);
  const [currentProductSlug, setCurrentProductSlug] = useState<string | null>(null);
  
  const openGardenerModal = () => {
    setIsGardenerModalOpen(true);
    // Close other modals if open
    setIsCartOpen(false);
    setIsProductDetailOpen(false);
  };
  
  const closeGardenerModal = () => {
    setIsGardenerModalOpen(false);
  };
  
  const openCart = () => {
    setIsCartOpen(true);
    // Close other modals if open
    setIsGardenerModalOpen(false);
    setIsProductDetailOpen(false);
  };
  
  const closeCart = () => {
    setIsCartOpen(false);
  };
  
  const openProductDetail = (slug: string) => {
    setCurrentProductSlug(slug);
    setIsProductDetailOpen(true);
    // Close other modals if open
    setIsGardenerModalOpen(false);
    setIsCartOpen(false);
  };
  
  const closeProductDetail = () => {
    setIsProductDetailOpen(false);
    setCurrentProductSlug(null);
  };
  
  return (
    <ModalContext.Provider value={{
      isGardenerModalOpen,
      isCartOpen,
      isProductDetailOpen,
      currentProductSlug,
      openGardenerModal,
      closeGardenerModal,
      openCart,
      closeCart,
      openProductDetail,
      closeProductDetail
    }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModalContext() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModalContext must be used within a ModalProvider');
  }
  return context;
}
