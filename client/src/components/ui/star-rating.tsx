import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md';
  showCount?: boolean;
}

export function StarRating({ rating, reviewCount, size = 'sm', showCount = true }: StarRatingProps) {
  const maxRating = 5;
  
  // Get integer part for full stars and decimal part for partial stars
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.3 && rating - fullStars < 0.8;
  const hasPartialStar = rating - fullStars >= 0.1;
  
  // Determine size classes
  const sizeClasses = {
    sm: 'text-xs space-x-0.5',
    md: 'text-sm space-x-1'
  };
  
  return (
    <div className="flex items-center">
      <div className={cn('flex', sizeClasses[size])}>
        {/* Render full stars */}
        {[...Array(fullStars)].map((_, i) => (
          <i key={`full-${i}`} className="fas fa-star text-yellow-400"></i>
        ))}
        
        {/* Render half star if needed */}
        {hasHalfStar && (
          <i className="fas fa-star-half-alt text-yellow-400"></i>
        )}
        
        {/* Render partial star (less than half) if needed */}
        {hasPartialStar && !hasHalfStar && (
          <i className="fas fa-star-half-alt text-yellow-400"></i>
        )}
        
        {/* Render empty stars */}
        {[...Array(maxRating - fullStars - (hasHalfStar || hasPartialStar ? 1 : 0))].map((_, i) => (
          <i key={`empty-${i}`} className="far fa-star text-gray-300"></i>
        ))}
      </div>
      
      {/* Show review count if provided */}
      {showCount && reviewCount !== undefined && (
        <span className={cn('text-gray-500 ml-1.5', size === 'sm' ? 'text-xs' : 'text-sm')}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
}