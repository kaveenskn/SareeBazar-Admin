"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
} from "recharts";
import { useDashboard } from "./dashboard-provider";

const PRIMARY   = "#a1005b";
const GRID      = "#f3f4f6";
const TICK      = "#9ca3af";

const tooltipStyle = {
  backgroundColor: "#fff",
  border: "1px solid #f3f4f6",
  borderRadius: "12px",
  fontSize: "12px",
  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
};

function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div className="animate-pulse" style={{ height }}>
      <div className="h-full w-full rounded-xl bg-gray-50 flex items-center justify-center">
        <div className="text-gray-300 text-sm">Loading chart…</div>
      </div>
    </div>
  );
}

// ── Revenue Flow ──────────────────────────────────────────────────────────────
export function RevenueChart() {
  const { data, loading } = useDashboard();

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 xl:col-span-2">
      <h2 className="font-serif text-xl text-gray-900">Revenue Flow</h2>
      <p className="text-sm text-gray-500 mt-0.5 mb-5">Monthly income across the year</p>
      {loading ? (
        <ChartSkeleton />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data.revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={PRIMARY} stopOpacity={0.25} />
                <stop offset="100%" stopColor={PRIMARY} stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: TICK }} axisLine={false} tickLine={false} />
            <YAxis
              tickFormatter={(v) => `${v / 1000}k`}
              tick={{ fontSize: 12, fill: TICK }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v: any) => [`₹${(Number(v) / 100000).toFixed(1)}L`, "Revenue"]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={PRIMARY}
              strokeWidth={2.5}
              fill="url(#revGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// ── Category Mix ──────────────────────────────────────────────────────────────
export function CategoryChart() {
  const { data, loading } = useDashboard();

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
      <h2 className="font-serif text-xl text-gray-900">Category Mix</h2>
      <p className="text-sm text-gray-500 mt-0.5 mb-5">Sales by occasion</p>
      {loading ? (
        <ChartSkeleton height={200} />
      ) : (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data.categoryData}
                cx="50%" cy="50%"
                innerRadius={55} outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {data.categoryData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="#fff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: any) => [`${Number(v)}%`, "Share"]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {data.categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: cat.color }} />
                  <span className="text-gray-700">{cat.name}</span>
                </div>
                <span className="text-gray-500 font-medium">{cat.value}%</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Peak Shopping Hours ───────────────────────────────────────────────────────
export function PeakHoursChart() {
  const { data, loading } = useDashboard();

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
      <h2 className="font-serif text-xl text-gray-900">Peak Shopping Hours</h2>
      <p className="text-sm text-gray-500 mt-0.5 mb-5">Highest selling time periods</p>
      {loading ? (
        <ChartSkeleton height={240} />
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data.peakHoursData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
            <XAxis dataKey="period" tick={{ fontSize: 12, fill: TICK }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: TICK }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="orders" fill={PRIMARY} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// ── Weekly Orders ─────────────────────────────────────────────────────────────
export function WeeklyOrdersChart() {
  const { data, loading } = useDashboard();

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
      <h2 className="font-serif text-xl text-gray-900">Weekly Orders</h2>
      <p className="text-sm text-gray-500 mt-0.5 mb-5">Last 7 days</p>
      {loading ? (
        <ChartSkeleton height={240} />
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data.weeklyOrdersData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: TICK }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: TICK }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line
              type="monotone"
              dataKey="orders"
              stroke={PRIMARY}
              strokeWidth={3}
              dot={{ fill: PRIMARY, strokeWidth: 0, r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}