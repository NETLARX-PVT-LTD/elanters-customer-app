import { useState } from 'react';
import { cn } from '@/lib/utils';

interface EditableRatingProps {
  initialRating?: number | null;
  size?: 'sm' | 'md' | 'lg';
  onChange?: (rating: number) => void;
  readonly?: boolean;
}

export function EditableRating({ 
  initialRating = 0, 
  size = 'md', 
  onChange,
  readonly = false
}: EditableRatingProps) {
  const [rating, setRating] = useState<number>(initialRating || 0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  
  const maxRating = 5;
  
  const handleRatingChange = (newRating: number) => {
    if (readonly) return;
    setRating(newRating);
    if (onChange) {
      onChange(newRating);
    }
  };
  
  const handleMouseEnter = (index: number) => {
    if (readonly) return;
    setHoverRating(index);
  };
  
  const handleMouseLeave = () => {
    if (readonly) return;
    setHoverRating(0);
  };
  
  // Determine icon size based on the size prop
  const iconSizeClass = {
    'sm': 'text-lg',
    'md': 'text-xl',
    'lg': 'text-2xl'
  }[size];
  
  // Determine spacing between stars
  const spacingClass = {
    'sm': 'space-x-1',
    'md': 'space-x-1.5',
    'lg': 'space-x-2'
  }[size];
  
  return (
    <div 
      className={cn("flex items-center", spacingClass, {
        'cursor-pointer': !readonly,
        'cursor-default': readonly
      })}
    >
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = (hoverRating || rating) >= starValue;
        
        return (
          <span
            key={index}
            className={cn(iconSizeClass, "transition-colors duration-150", {
              'text-yellow-400': isFilled,
              'text-gray-300': !isFilled,
              'hover:text-yellow-400': !readonly,
            })}
            onClick={() => handleRatingChange(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            role={readonly ? undefined : "button"}
            aria-label={readonly ? `Rating: ${rating} out of 5` : `Rate ${starValue} out of 5`}
          >
            <i className="fas fa-star"></i>
          </span>
        );
      })}
    </div>
  );
}