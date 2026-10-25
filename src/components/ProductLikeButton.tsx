"use client";

import React from "react";
import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { ProductItem } from "@/lib/constants";

interface ProductLikeButtonProps {
  product: ProductItem | any;
  className?: string;
  size?: "sm" | "md" | "lg";
  onToggled?: (isLiked: boolean) => void;
}

export default function ProductLikeButton({
  product,
  className = "",
  size = "md",
  onToggled,
}: ProductLikeButtonProps) {
  const { isLiked, toggleWishlist } = useWishlist();
  const liked = isLiked(product.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nowLiked = toggleWishlist(product);
    if (onToggled) {
      onToggled(nowLiked);
    }
  };

  const sizeClasses =
    size === "sm"
      ? "w-7 h-7"
      : size === "lg"
      ? "w-10 h-10"
      : "w-8 h-8";

  const iconSizes =
    size === "sm"
      ? "w-3.5 h-3.5"
      : size === "lg"
      ? "w-5 h-5"
      : "w-4 h-4";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={liked ? "Hapus dari favorit" : "Sukai produk ini"}
      className={`rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer backdrop-blur-xs shadow-sm ${sizeClasses} ${
        liked
          ? "bg-white text-rose-500 ring-2 ring-rose-300/80 shadow-rose-200/50"
          : "bg-white/90 hover:bg-white text-stone-500 hover:text-rose-500 hover:shadow-md"
      } ${className}`}
    >
      <Heart
        className={`${iconSizes} transition-transform ${
          liked ? "fill-rose-500 text-rose-500 scale-105" : "text-stone-500"
        }`}
      />
    </button>
  );
}
