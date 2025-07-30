import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number | null;
  setRating?: (rating: number | null) => void;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
}

export default function StarRating({ rating, setRating, size = 'md', readOnly = false }: StarRatingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleStarClick = (starRating: number) => {
    if (readOnly || !setRating) return;
    
    if (rating === starRating) {
      setRating(null); // Unset if clicking the same star
    } else {
      setRating(starRating);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleStarClick(star)}
          disabled={readOnly}
          className={cn(
            "transition-colors duration-200",
            !readOnly && "hover:text-yellow-400 cursor-pointer",
            readOnly && "cursor-default"
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              rating && star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-400"
            )}
          />
        </button>
      ))}
    </div>
  );
}
