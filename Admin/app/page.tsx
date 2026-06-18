"use client";

import { DashboardProvider, useDashboard } from "./components/dashboard/dashboard-provider";
import KpiCards from "./components/dashboard/kpi-cards";
import { RevenueChart, CategoryChart, PeakHoursChart, WeeklyOrdersChart } from "./components/dashboard/charts";
import BestSellersTable from "./components/dashboard/best-sellers-table";
import RecentOrders from "./components/dashboard/recent-orders";
import LatestReviews from "./components/dashboard/latest-reviews";
import InsightCards from "./components/dashboard/insight-cards";
import { Wifi, WifiOff } from "lucide-react";

function DataBadge() {
  const { isLive, loading } = useDashboard();

  if (loading) return null;

  return (
    <div className="flex items-center justify-end mb-2">
      <span
        className={[
          "inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full",
          isLive
            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
            : "bg-amber-50 text-amber-700 border border-amber-100",
        ].join(" ")}
      >
        {isLive ? (
          <>
            <Wifi className="h-3 w-3" />
            Live Data
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            Demo Data
          </>
        )}
      </span>
    </div>
  );
}

export default function Home() {
  return (
    <DashboardProvider>
      <div className="space-y-6">
        <DataBadge />
        <KpiCards />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <RevenueChart />
          <CategoryChart />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <PeakHoursChart />
          <WeeklyOrdersChart />
        </div>

        <BestSellersTable />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <RecentOrders />
          <LatestReviews />
        </div>

        <InsightCards />
      </div>
    </DashboardProvider>
  );
}