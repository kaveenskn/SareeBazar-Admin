"use client";

import { useState } from "react";
import { X, Package, Loader2, Check } from "lucide-react";
import { InventoryItem } from "../types";

interface BulkStockModalProps {
  products: InventoryItem[];
  onClose: () => void;
  onSave: (updates: { id: string; stock: number }[]) => Promise<void>;
  saving: boolean;
}

export default function BulkStockModal({
  products,
  onClose,
  onSave,
  saving,
}: BulkStockModalProps) {
  const [stockValues, setStockValues] = useState<Record<string, number>>(
    Object.fromEntries(products.map((p) => [p._id, p.stock]))
  );

  const handleSubmit = async () => {
    const updates = products
      .filter((p) => stockValues[p._id] !== p.stock)
      .map((p) => ({ id: p._id, stock: stockValues[p._id] }));

    if (updates.length === 0) return;
    await onSave(updates);
  };

  const changedCount = products.filter(
    (p) => stockValues[p._id] !== p.stock
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden animate-[scaleIn_0.2s_ease-out] max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Bulk Stock Update
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {products.length} products selected · {changedCount} modified
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Product list */}
        <div className="flex-1 overflow-y-auto p-6 pb-2">
          <div className="flex flex-col gap-3">
            {products.map((product) => {
              const diff = stockValues[product._id] - product.stock;
              return (
                <div
                  key={product._id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100/80 transition-colors"
                >
                  {/* Image */}
                  <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 overflow-hidden shrink-0">
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
                      <Package size={16} />
                    )}
                  </div>

                  {/* Name */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {product.category} · Was: {product.stock}
                    </span>
                  </div>

                  {/* Stock input */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() =>
                        setStockValues((sv) => ({
                          ...sv,
                          [product._id]: Math.max(
                            0,
                            (sv[product._id] ?? 0) - 1
                          ),
                        }))
                      }
                      className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors text-sm font-bold"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={0}
                      value={stockValues[product._id]}
                      onChange={(e) =>
                        setStockValues((sv) => ({
                          ...sv,
                          [product._id]: Math.max(
                            0,
                            parseInt(e.target.value) || 0
                          ),
                        }))
                      }
                      className="w-16 text-center text-sm font-semibold text-gray-900 border border-gray-200 rounded-lg py-1.5 outline-none focus:border-[#a1005b] transition-colors bg-white"
                    />
                    <button
                      onClick={() =>
                        setStockValues((sv) => ({
                          ...sv,
                          [product._id]: (sv[product._id] ?? 0) + 1,
                        }))
                      }
                      className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors text-sm font-bold"
                    >
                      +
                    </button>

                    {/* Diff */}
                    {diff !== 0 && (
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          diff > 0
                            ? "bg-green-50 text-green-600"
                            : "bg-red-50 text-red-500"
                        }`}
                      >
                        {diff > 0 ? `+${diff}` : diff}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick set all */}
        <div className="px-6 py-3 border-t border-gray-100 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 font-medium mr-1">
              Set all to:
            </span>
            {[0, 10, 25, 50, 100].map((v) => (
              <button
                key={v}
                onClick={() =>
                  setStockValues(
                    Object.fromEntries(products.map((p) => [p._id, v]))
                  )
                }
                className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 p-6 pt-3 border-t border-gray-100 shrink-0">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-5 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || changedCount === 0}
            className="flex-1 px-5 py-3 bg-[#a1005b] text-white rounded-xl text-sm font-medium hover:bg-[#800048] transition-colors shadow-sm shadow-[#a1005b]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Check size={16} />
                Update {changedCount} Product{changedCount !== 1 ? "s" : ""}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
