"use client";

import React from "react";
import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { ProductItem } from "@/lib/constants";

interface ProductLikeButtonProps {
  product: ProductItem | any;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "minimal";
  onToggled?: (isLiked: boolean) => void;
}

export default function ProductLikeButton({
  product,
  className = "",
  size = "sm",
  variant = "default",
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

  if (variant === "minimal") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={liked ? "Hapus dari favorit" : "Sukai produk ini"}
        className={`w-7 h-7 flex items-center justify-center bg-transparent transition-transform duration-200 active:scale-80 cursor-pointer ${className}`}
      >
        <Heart
          className={`w-5 h-5 transition-colors duration-200 ${
            liked
              ? "fill-rose-500 text-rose-500 stroke-rose-500"
              : "text-[#111915]/80 hover:text-rose-500 stroke-[2]"
          }`}
        />
      </button>
    );
  }

  const sizeClasses =
    size === "sm"
      ? "w-[30px] h-[30px]"
      : size === "lg"
      ? "w-[38px] h-[38px]"
      : "w-[32px] h-[32px]";

  const iconSizes =
    size === "sm"
      ? "w-3.5 h-3.5"
      : size === "lg"
      ? "w-[18px] h-[18px]"
      : "w-4 h-4";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={liked ? "Hapus dari favorit" : "Sukai produk ini"}
      className={`rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer select-none active:scale-75 ${sizeClasses} ${
        liked
          ? "bg-white text-rose-500 border border-rose-100 shadow-[0_2px_8px_rgba(244,63,94,0.25)] scale-105"
          : "bg-white/85 hover:bg-white text-stone-600 hover:text-rose-500 backdrop-blur-md border border-white/70 shadow-[0_2px_6px_rgba(0,0,0,0.06)] hover:shadow-xs"
      } ${className}`}
    >
      <Heart
        className={`${iconSizes} transition-all duration-200 ${
          liked
            ? "fill-rose-500 text-rose-500 stroke-rose-500"
            : "stroke-[2] text-[#111915]/80 group-hover:text-rose-500"
        }`}
      />
    </button>
  );
}
