import { useCartContext } from '@/contexts/cart-context';

interface CartItemProps {
  id: number;
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
  variant?: string;
}

export function CartItem({ id, name, imageUrl, price, quantity, variant }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCartContext();
  
  const formattedPrice = `₹${(price / 100).toFixed(0)}`;
  
  const handleDecrease = () => {
    if (quantity === 1) {
      removeFromCart(id);
    } else {
      updateQuantity(id, quantity - 1);
    }
  };
  
  const handleIncrease = () => {
    updateQuantity(id, quantity + 1);
  };
  
  return (
    <div className="flex items-center border-b border-gray-100 pb-4">
      <div className="w-20 h-20 rounded-lg overflow-hidden mr-3">
        <img 
          src={imageUrl} 
          alt={name} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 mr-2">
        <h3 className="font-medium text-sm">{name}</h3>
        {variant && <p className="text-xs text-gray-500 mb-2">{variant}</p>}
        <div className="flex items-center border border-gray-200 rounded-lg inline-flex">
          <button 
            className="px-2 py-1 text-gray-500"
            onClick={handleDecrease}
          >
            <i className="fas fa-minus text-xs"></i>
          </button>
          <span className="px-2 text-sm">{quantity}</span>
          <button 
            className="px-2 py-1 text-gray-500"
            onClick={handleIncrease}
          >
            <i className="fas fa-plus text-xs"></i>
          </button>
        </div>
      </div>
      <div className="text-right">
        <span className="font-semibold text-sm">{formattedPrice}</span>
      </div>
    </div>
  );
}
