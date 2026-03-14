import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}

export function RatingStars({ rating, maxRating = 5, size = "md", showValue = false }: RatingStarsProps) {
  const sizeClass = { sm: "text-sm", md: "text-base", lg: "text-xl" };

  return (
    <div className="flex items-center gap-1">
      <div className={cn("flex", sizeClass[size])}>
        {Array.from({ length: maxRating }, (_, i) => (
          <span
            key={i}
            className={cn(
              i < Math.floor(rating) ? "text-amber-400" : "text-gray-200"
            )}
          >
            &#9733;
          </span>
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-gray-600 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
