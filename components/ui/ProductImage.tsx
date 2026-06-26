"use client";

import { useState } from "react";
import Image from "next/image";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductImageProps {
  src?: string | null;
  alt: string;
  brand: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeConfig = {
  sm: { icon: 20, brandBadge: "w-8 h-8 text-sm", nameText: "text-[10px]" },
  md: { icon: 28, brandBadge: "w-10 h-10 text-base", nameText: "text-xs" },
  lg: { icon: 36, brandBadge: "w-14 h-14 text-xl", nameText: "text-sm" },
};

export function ProductImage({
  src,
  alt,
  brand,
  size = "md",
  className,
}: ProductImageProps) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const config = sizeConfig[size];

  const showImage = src && !imgError;

  return (
    <div
      className={cn(
        "relative w-full aspect-[4/3] overflow-hidden",
        "bg-gradient-to-br from-brand-50 via-white to-brand-50",
        className
      )}
    >
      {showImage ? (
        <>
          {/* Loading skeleton */}
          {!imgLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-50 animate-pulse" />
          )}

          {/* Real product image */}
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg=="
            className={cn(
              "object-contain p-3 transition-all duration-300",
              "group-hover:scale-105",
              imgLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        </>
      ) : (
        /* Placeholder design */
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-[0.03]">
            <div
              className="w-full h-full"
              style={{
                backgroundImage:
                  "radial-gradient(circle, currentColor 1px, transparent 1px)",
                backgroundSize: "16px 16px",
              }}
            />
          </div>

          {/* Brand initial badge */}
          <span
            className={cn(
              "relative rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center font-semibold shadow-sm",
              config.brandBadge
            )}
          >
            {brand.charAt(0).toUpperCase()}
          </span>

          {/* Product icon */}
          <Package
            size={config.icon}
            className="text-brand-200"
            strokeWidth={1.5}
          />

          {/* Product name */}
          <span
            className={cn(
              "text-gray-400 text-center line-clamp-2 px-2 leading-tight",
              config.nameText
            )}
          >
            {alt}
          </span>
        </div>
      )}
    </div>
  );
}
