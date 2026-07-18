import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}

const STAR_SIZE = { sm: "w-3 h-3", md: "w-4 h-4", lg: "w-5 h-5" };

export function RatingStars({ rating, maxRating = 5, size = "md", showValue = false }: RatingStarsProps) {
  return (
    <div
      className="flex items-center gap-1"
      role="img"
      aria-label={`Rating: ${rating.toFixed(1)} out of ${maxRating} stars`}
    >
      <div className="flex items-center gap-0.5" aria-hidden="true">
        {Array.from({ length: maxRating }, (_, i) => (
          <svg
            key={i}
            className={cn(STAR_SIZE[size], i < Math.floor(rating) ? "text-amber-600" : "text-gray-500")}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
          </svg>
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
