"use client";

import { useEffect, useState } from "react";
import { Star, Loader2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

const API_BASE = "/api/backend/reviews";

const PRIMARY = "#a1005b";
const GRID    = "#f3f4f6";
const TICK    = "#9ca3af";

const tooltipStyle = {
  backgroundColor: "#fff",
  border: "1px solid #f3f4f6",
  borderRadius: "12px",
  fontSize: "12px",
  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
};

interface StatsData {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Record<string, number>;
}

export default function RatingDistribution() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/stats`);
        const data = await res.json();
        if (res.ok) {
          setStats(data);
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
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 lg:col-span-2 flex items-center justify-center min-h-[220px]">
        <Loader2 size={28} className="text-[#a1005b] animate-spin" />
      </div>
    );
  }

  const totalReviews = stats?.totalReviews ?? 0;
  const averageRating = stats?.averageRating ?? 0;
  const dist = stats?.ratingDistribution ?? {};

  const ratingData = [
    { star: "5★", count: dist["5"] ?? 0 },
    { star: "4★", count: dist["4"] ?? 0 },
    { star: "3★", count: dist["3"] ?? 0 },
    { star: "2★", count: dist["2"] ?? 0 },
    { star: "1★", count: dist["1"] ?? 0 },
  ];

  const filledStars = Math.round(averageRating);

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 lg:col-span-2">
      <h2 className="font-serif text-xl text-gray-900">Rating Distribution</h2>
      <p className="text-sm text-gray-500 mt-0.5 mb-6">
        {totalReviews.toLocaleString()} reviews across all sarees
      </p>

      {totalReviews === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">
          No reviews yet. Ratings will appear here once customers leave reviews.
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6 items-center">
          {/* Score summary */}
          <div className="col-span-4 text-center">
            <div className="text-6xl font-serif text-[#a1005b]">{averageRating}</div>
            <div className="flex justify-center gap-0.5 my-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < filledStars
                      ? "fill-[#a1005b] text-[#a1005b]"
                      : "text-gray-200"
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
            <div className="text-xs text-gray-500">
              Based on {totalReviews.toLocaleString()} reviews
            </div>
          </div>

          {/* Horizontal bar chart */}
          <div className="col-span-8">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={ratingData}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={GRID}
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: TICK }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="star"
                  tick={{ fontSize: 12, fill: TICK }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar
                  dataKey="count"
                  fill={PRIMARY}
                  radius={[0, 8, 8, 0]}
                  maxBarSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}