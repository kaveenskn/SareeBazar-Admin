"use client";

import {
  X,
  Star,
  Package,
  Tag,
  Ruler,
  Palette,
  TrendingUp,
  Sparkles,
  Clock,
  Weight,
  Box,
} from "lucide-react";
import { Product } from "../types";

interface ProductViewModalProps {
  product: Product;
  onClose: () => void;
  onEdit: () => void;
}

export default function ProductViewModal({
  product,
  onClose,
  onEdit,
}: ProductViewModalProps) {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden flex flex-col animate-[scaleIn_0.2s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-900">
              Product Details
            </h2>
            {product.badge && (
              <span className="px-2.5 py-1 bg-[#fdf2f8] text-[#d93097] text-xs font-medium rounded-full">
                {product.badge}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Images */}
            <div className="space-y-4">
              {/* Main image */}
              <div className="aspect-[4/5] bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden flex items-center justify-center">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      target.parentElement!.innerHTML = `<div class="flex flex-col items-center gap-2 text-gray-400"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg><span class="text-sm">Image preview</span></div>`;
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Package size={48} strokeWidth={1.5} />
                    <span className="text-sm">No image</span>
                  </div>
                )}
              </div>

              {/* Gallery */}
              {product.images && product.images.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((img, i) => (
                    <div
                      key={i}
                      className="aspect-square bg-gray-50 rounded-xl overflow-hidden border-2 border-transparent hover:border-[#d93097] transition-colors cursor-pointer"
                    >
                      <img
                        src={img}
                        alt={`${product.name} ${i + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "";
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Color Variants */}
              {product.colorVariants && product.colorVariants.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Palette size={14} />
                    Color Variants
                  </h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    {product.colorVariants.map((cv, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full text-xs"
                      >
                        <div
                          className="w-4 h-4 rounded-full border border-gray-200"
                          style={{ backgroundColor: cv.hex }}
                        />
                        <span className="text-gray-700">{cv.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Details */}
            <div className="space-y-5">
              {/* Title & SKU */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 leading-tight">
                  {product.name}
                </h3>
                <div className="flex items-center gap-3 mt-2">
                  {product.sku && (
                    <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
                      {product.sku}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">
                    {product.category}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-gray-900">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-lg text-gray-400 line-through">
                      ${product.originalPrice}
                    </span>
                    <span className="px-2 py-0.5 bg-green-50 text-green-600 text-xs font-medium rounded-full">
                      {discount}% off
                    </span>
                  </>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i < Math.floor(product.rating)
                          ? "text-amber-400 fill-amber-400"
                          : "text-gray-200"
                      }
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>

              {/* Status Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                    product.inStock
                      ? "bg-green-50 text-green-600"
                      : "bg-red-50 text-red-500"
                  }`}
                >
                  <Box size={12} />
                  {product.inStock ? `In Stock (${product.stock || 0})` : "Out of Stock"}
                </span>
                {product.isFeatured && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-full text-xs font-medium">
                    <Sparkles size={12} />
                    Featured
                  </span>
                )}
                {product.isTrending && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-full text-xs font-medium">
                    <TrendingUp size={12} />
                    Trending
                  </span>
                )}
                {product.isLatest && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                    <Clock size={12} />
                    Latest
                  </span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    Description
                  </h4>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                {product.fabric && (
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                      <Tag size={12} />
                      Fabric
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {product.fabric}
                    </span>
                  </div>
                )}
                {product.color && (
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                      <Palette size={12} />
                      Color
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {product.color}
                    </span>
                  </div>
                )}
                {product.weight && (
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                      <Weight size={12} />
                      Weight
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {product.weight}
                    </span>
                  </div>
                )}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                      <Ruler size={12} />
                      Sizes
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {product.sizes.join(", ")}
                    </span>
                  </div>
                )}
              </div>

              {/* Specifications */}
              {product.specifications &&
                Object.keys(product.specifications).length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Specifications
                    </h4>
                    <div className="border border-gray-100 rounded-xl overflow-hidden">
                      {Object.entries(product.specifications).map(
                        ([key, value], i) => (
                          <div
                            key={key}
                            className={`flex items-center justify-between px-4 py-2.5 text-sm ${
                              i % 2 === 0 ? "bg-gray-50" : "bg-white"
                            }`}
                          >
                            <span className="text-gray-500">{key}</span>
                            <span className="font-medium text-gray-900">
                              {value}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dates */}
              {product.createdAt && (
                <div className="pt-3 border-t border-gray-100 text-xs text-gray-400">
                  Created: {new Date(product.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-6 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={onEdit}
            className="px-5 py-2.5 bg-[#a1005b] text-white rounded-xl text-sm font-medium hover:bg-[#800048] transition-colors shadow-sm shadow-[#a1005b]/20"
          >
            Edit Product
          </button>
        </div>
      </div>
    </div>
  );
}
