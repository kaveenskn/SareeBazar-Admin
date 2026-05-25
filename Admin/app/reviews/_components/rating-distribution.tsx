"use client";

import { Star } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

const ratingData = [
  { star: "5★", count: 1890 },
  { star: "4★", count: 512 },
  { star: "3★", count: 154 },
  { star: "2★", count: 88 },
  { star: "1★", count: 54 },
];

const TOTAL = 2698;
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

export default function RatingDistribution() {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 lg:col-span-2">
      <h2 className="font-serif text-xl text-gray-900">Rating Distribution</h2>
      <p className="text-sm text-gray-500 mt-0.5 mb-6">
        {TOTAL.toLocaleString()} reviews across all sarees
      </p>

      <div className="grid grid-cols-12 gap-6 items-center">
        {/* Score summary */}
        <div className="col-span-4 text-center">
          <div className="text-6xl font-serif text-[#a1005b]">4.8</div>
          <div className="flex justify-center gap-0.5 my-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="h-4 w-4 fill-[#a1005b] text-[#a1005b]"
                aria-hidden="true"
              />
            ))}
          </div>
          <div className="text-xs text-gray-500">
            Based on {TOTAL.toLocaleString()} reviews
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
    </div>
  );
}