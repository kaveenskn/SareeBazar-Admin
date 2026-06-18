"use client";

import { Clock } from "lucide-react";
import { useDashboard } from "./dashboard-provider";
import type { StockStatus } from "@/app/lib/mock-data";

const stockStyle: Record<StockStatus, string> = {
  good:   "bg-emerald-50 text-emerald-700",
  warn:   "bg-amber-50   text-amber-700",
  danger: "bg-rose-50    text-rose-700",
};

export default function BestSellersTable() {
  const { data, loading } = useDashboard();

  if (loading) {
    return (
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
        <h2 className="font-serif text-xl text-gray-900">Best Selling Sarees</h2>
        <p className="text-sm text-gray-500 mt-0.5 mb-5">Top performers this quarter</p>
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gray-100" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 rounded bg-gray-100" />
                <div className="h-3 w-24 rounded bg-gray-50" />
              </div>
              <div className="h-4 w-16 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
      <h2 className="font-serif text-xl text-gray-900">Best Selling Sarees</h2>
      <p className="text-sm text-gray-500 mt-0.5 mb-5">Top performers this quarter</p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400">
              <th className="text-left font-medium py-3">Product</th>
              <th className="text-left font-medium">Category</th>
              <th className="text-right font-medium">Units Sold</th>
              <th className="text-right font-medium">Revenue</th>
              <th className="text-left font-medium pl-6">Peak Time</th>
              <th className="text-right font-medium">Stock</th>
            </tr>
          </thead>
          <tbody>
            {data.bestSellers.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-50 hover:bg-pink-50/40 transition-colors"
              >
                {/* Product cell */}
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-12 w-12 rounded-xl shrink-0 ring-1 ring-gray-200 shadow-sm overflow-hidden"
                      style={{ background: item.gradient }}
                    />
                    <div>
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="text-xs text-gray-400">{item.id}</div>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td>
                  <span className="text-[11px] font-medium px-2 py-1 rounded-md bg-pink-50 text-[#a1005b]">
                    {item.category}
                  </span>
                </td>

                {/* Units */}
                <td className="text-right tabular-nums text-gray-700">{item.unitsSold}</td>

                {/* Revenue */}
                <td className="text-right tabular-nums font-semibold text-gray-900">{item.revenue}</td>

                {/* Peak time */}
                <td className="pl-6">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-md bg-gray-100 text-gray-600">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    {item.peakTime}
                  </span>
                </td>

                {/* Stock */}
                <td className="text-right">
                  <span className={`text-[11px] font-medium px-2 py-1 rounded-md ${stockStyle[item.stockStatus]}`}>
                    {item.stock} left
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}