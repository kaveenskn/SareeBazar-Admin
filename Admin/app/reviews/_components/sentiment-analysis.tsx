"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const API_BASE = "/api/backend/reviews";

interface SentimentData {
  positive: number;
  neutral: number;
  negative: number;
  total: number;
}

export default function SentimentAnalysis() {
  const [data, setData] = useState<SentimentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/stats`);
        const json = await res.json();
        if (res.ok) {
          const dist = json.ratingDistribution || {};
          const total = json.totalReviews || 0;

          // Derive sentiment from star ratings:
          // 4-5 stars → positive, 3 stars → neutral, 1-2 stars → negative
          const positive = (dist["5"] || 0) + (dist["4"] || 0);
          const neutral = dist["3"] || 0;
          const negative = (dist["2"] || 0) + (dist["1"] || 0);

          setData({ positive, neutral, negative, total });
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 flex items-center justify-center min-h-[220px]">
        <Loader2 size={28} className="text-[#a1005b] animate-spin" />
      </div>
    );
  }

  const total = data?.total || 0;
  const positivePct = total > 0 ? Math.round(((data?.positive || 0) / total) * 100) : 0;
  const neutralPct = total > 0 ? Math.round(((data?.neutral || 0) / total) * 100) : 0;
  const negativePct = total > 0 ? Math.round(((data?.negative || 0) / total) * 100) : 0;

  const sentiments = [
    { label: "Positive", pct: positivePct, count: data?.positive || 0, barClass: "from-emerald-400 to-emerald-600" },
    { label: "Neutral",  pct: neutralPct,  count: data?.neutral || 0,  barClass: "from-amber-300  to-amber-500" },
    { label: "Negative", pct: negativePct, count: data?.negative || 0, barClass: "from-rose-400   to-rose-600" },
  ];

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
      <h2 className="font-serif text-xl text-gray-900">Sentiment Analysis</h2>
      <p className="text-sm text-gray-500 mt-0.5 mb-6">Based on star ratings</p>

      {total === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">
          No reviews yet.
        </div>
      ) : (
        <div className="space-y-5">
          {sentiments.map(({ label, pct, count, barClass }) => (
            <div key={label}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-gray-800">{label}</span>
                <span className="text-gray-500">{pct}% ({count})</span>
              </div>
              <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${barClass} rounded-full transition-all duration-700`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}