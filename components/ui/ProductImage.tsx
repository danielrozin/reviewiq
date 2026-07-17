"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductImageProps {
  src?: string | null;
  alt: string;
  brand: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  priority?: boolean;
}

const sizeConfig = {
  sm: { icon: "w-5 h-5", brandBadge: "w-8 h-8 text-sm", nameText: "text-xs" },
  md: { icon: "w-7 h-7", brandBadge: "w-10 h-10 text-base", nameText: "text-xs" },
  lg: { icon: "w-9 h-9", brandBadge: "w-14 h-14 text-xl", nameText: "text-sm" },
};

export function ProductImage({
  src,
  alt,
  brand,
  size = "md",
  className,
  priority = false,
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
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-50 motion-safe:animate-pulse" />
          )}

          {/* Real product image */}
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            priority={priority}
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg=="
            className={cn(
              "object-contain p-3 motion-safe:transition-all duration-300",
              "motion-safe:group-hover:scale-105",
              imgLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        </>
      ) : (
        /* Placeholder design */
        <div role="img" aria-label={alt} className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
          {/* Decorative background pattern */}
          <div aria-hidden="true" className="absolute inset-0 opacity-[0.03]">
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
          <svg aria-hidden="true" className={cn(config.icon, "text-brand-200")} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
          </svg>

          {/* Product name */}
          <span
            aria-hidden="true"
            className={cn(
              "text-gray-600 text-center line-clamp-2 px-2 leading-tight",
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
