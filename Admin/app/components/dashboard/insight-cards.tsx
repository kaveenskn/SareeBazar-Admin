"use client";

import { Crown, Heart, Palette, Sparkles } from "lucide-react";
import { useDashboard } from "./dashboard-provider";

const iconMap = { Crown, Heart, Palette, Sparkles } as const;

export default function InsightCards() {
  const { data, loading } = useDashboard();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-pink-50" />
              <div className="h-3 w-24 rounded bg-gray-100" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-5 w-32 rounded bg-gray-100" />
              <div className="h-3 w-24 rounded bg-gray-50" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {data.insightCards.map((card) => {
        const Icon = iconMap[card.icon as keyof typeof iconMap];
        return (
          <div
            key={card.id}
            className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-pink-50 text-[#a1005b] flex items-center justify-center">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <span className="text-xs uppercase tracking-wider text-gray-400 font-medium">
                {card.label}
              </span>
            </div>
            <div className="mt-4 font-serif text-lg text-gray-900">{card.title}</div>
            <div className="text-xs text-gray-500 mt-1">{card.subtitle}</div>
          </div>
        );
      })}
    </div>
  );
}