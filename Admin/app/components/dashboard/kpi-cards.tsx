"use client";

import {
  IndianRupee, ShoppingBag, TrendingUp, Users,
  Crown, TriangleAlert, ArrowUpRight, ArrowDownRight,
  Loader2,
} from "lucide-react";
import { useDashboard } from "./dashboard-provider";

const iconMap = {
  IndianRupee, ShoppingBag, TrendingUp, Users, Crown, TriangleAlert,
} as const;

export default function KpiCards() {
  const { data, loading } = useDashboard();

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 animate-pulse"
          >
            <div className="flex items-start justify-between">
              <div className="h-11 w-11 rounded-xl bg-pink-50" />
              <div className="h-6 w-14 rounded-lg bg-gray-100" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-7 w-24 rounded bg-gray-100" />
              <div className="h-4 w-20 rounded bg-gray-50" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {data.kpiStats.map((stat) => {
        const Icon = iconMap[stat.icon as keyof typeof iconMap];
        const isUp = stat.change >= 0;

        return (
          <div
            key={stat.id}
            className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div
                className={[
                  "h-11 w-11 rounded-xl flex items-center justify-center",
                  stat.variant === "primary"
                    ? "bg-[#a1005b] text-white"
                    : "bg-pink-50 text-[#a1005b]",
                ].join(" ")}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>

              <span
                className={[
                  "flex items-center gap-0.5 text-xs font-medium px-2 py-1 rounded-lg",
                  isUp ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700",
                ].join(" ")}
              >
                {isUp
                  ? <ArrowUpRight className="h-3 w-3" />
                  : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(stat.change)}%
              </span>
            </div>

            <div className="mt-4">
              <div className="text-2xl font-bold text-gray-900 tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}