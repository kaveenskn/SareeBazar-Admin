"use client";

import { useState } from "react";
import { X, Minus, Plus, Package, Loader2 } from "lucide-react";
import { InventoryItem } from "../types";

interface StockUpdateModalProps {
  product: InventoryItem;
  onClose: () => void;
  onSave: (id: string, stock: number) => Promise<void>;
  saving: boolean;
}

export default function StockUpdateModal({
  product,
  onClose,
  onSave,
  saving,
}: StockUpdateModalProps) {
  const [stock, setStock] = useState(product.stock);

  const handleSubmit = async () => {
    await onSave(product._id, stock);
  };

  const diff = stock - product.stock;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-[scaleIn_0.2s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Update Stock</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Product info */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 overflow-hidden shrink-0">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <Package size={20} />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-gray-900 truncate">
                {product.name}
              </span>
              <span className="text-xs text-gray-500">
                {product.category} · Current stock: {product.stock}
              </span>
            </div>
          </div>
        </div>

        {/* Stock control */}
        <div className="px-6 pb-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            New Stock Quantity
          </label>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setStock((s) => Math.max(0, s - 1))}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
            >
              <Minus size={20} />
            </button>
            <input
              type="number"
              min={0}
              value={stock}
              onChange={(e) =>
                setStock(Math.max(0, parseInt(e.target.value) || 0))
              }
              className="w-28 text-center text-3xl font-bold text-gray-900 border-b-2 border-gray-200 focus:border-[#a1005b] outline-none py-2 transition-colors bg-transparent"
            />
            <button
              onClick={() => setStock((s) => s + 1)}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>

          {/* Diff indicator */}
          {diff !== 0 && (
            <div className="mt-3 text-center">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  diff > 0
                    ? "bg-green-50 text-green-600"
                    : "bg-red-50 text-red-500"
                }`}
              >
                {diff > 0 ? `+${diff}` : diff} from current
              </span>
            </div>
          )}

          {/* Quick set buttons */}
          <div className="mt-4 flex gap-2 flex-wrap justify-center">
            {[0, 5, 10, 25, 50, 100].map((v) => (
              <button
                key={v}
                onClick={() => setStock(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  stock === v
                    ? "bg-[#a1005b] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 p-6 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-5 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || stock === product.stock}
            className="flex-1 px-5 py-3 bg-[#a1005b] text-white rounded-xl text-sm font-medium hover:bg-[#800048] transition-colors shadow-sm shadow-[#a1005b]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Updating...
              </>
            ) : (
              "Update Stock"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
