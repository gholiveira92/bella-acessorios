"use client";

import { useState } from "react";
import Link from "next/link";
import { FiHeart } from "react-icons/fi";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    promotionalPrice: number | null;
    image: string;
    images?: string[];
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const images = product.images && product.images.length > 0 
    ? [product.image, ...product.images.filter((img: string) => img !== product.image)].slice(0, 2)
    : [product.image];

  const hasMultipleImages = images.length > 1;

  return (
    <Link 
      href={`/product/${product.slug}`}
      className="group block"
      onMouseEnter={() => {
        setIsHovered(true);
        if (hasMultipleImages) setImageIndex(1);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setImageIndex(0);
      }}
    >
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 -translate-y-0.5 group-hover:-translate-y-1">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-brand-bg-light">
          <img
            src={images[imageIndex]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            loading="lazy"
          />
          
          {/* Favorite Button */}
          <button 
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-text-muted hover:text-brand-gold transition-colors z-10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <FiHeart size={16} />
          </button>

          {/* Discount Badge */}
          {product.promotionalPrice && (
            <span className="absolute top-3 left-3 bg-brand-gold text-white text-[10px] font-medium px-2 py-1 rounded-full">
              {Math.round((1 - product.promotionalPrice / product.price) * 100)}% OFF
            </span>
          )}
        </div>

        {/* Product Info */}
        <div className="p-3 md:p-4">
          <h3 className="font-sans text-sm font-medium text-text-primary mb-1.5 group-hover:text-brand-gold transition-colors line-clamp-1">
            {product.name}
          </h3>
          
          <div className="flex items-baseline gap-2 mb-1">
            {product.promotionalPrice ? (
              <>
                <span className="text-brand-gold-dark font-semibold text-base">
                  R$ {product.promotionalPrice.toFixed(2).replace(".", ",")}
                </span>
                <span className="text-text-muted line-through text-xs">
                  R$ {product.price.toFixed(2).replace(".", ",")}
                </span>
              </>
            ) : (
              <span className="text-brand-gold-dark font-semibold text-base">
                R$ {product.price.toFixed(2).replace(".", ",")}
              </span>
            )}
          </div>

          {/* Installment Info */}
          <p className="text-[11px] text-text-muted">
            ou 3x sem juros de R$ {((product.promotionalPrice || product.price) / 3).toFixed(2).replace(".", ",")}
          </p>
        </div>
      </div>
    </Link>
  );
}