"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { fetchDashboardData, type DashboardData } from "@/app/lib/dashboard-api";
import * as mock from "@/app/lib/mock-data";

interface DashboardContextType {
  data: DashboardData;
  loading: boolean;
  isLive: boolean;
}

// Build fallback from mock data
const MOCK_FALLBACK: DashboardData = {
  kpiStats: mock.kpiStats as any,
  revenueData: mock.revenueData,
  categoryData: mock.categoryData,
  peakHoursData: mock.peakHoursData,
  weeklyOrdersData: mock.weeklyOrdersData,
  bestSellers: mock.bestSellers as any,
  recentOrders: mock.recentOrders as any,
  latestReviews: mock.latestReviews as any,
  insightCards: mock.insightCards as any,
};

const DashboardContext = createContext<DashboardContextType>({
  data: MOCK_FALLBACK,
  loading: true,
  isLive: false,
});

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DashboardData>(MOCK_FALLBACK);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await fetchDashboardData();
        if (!cancelled && result) {
          // Merge: use live data where available, fallback to mock for empty arrays
          setData({
            kpiStats: result.kpiStats,
            revenueData: result.revenueData.some((d) => d.revenue > 0) ? result.revenueData : MOCK_FALLBACK.revenueData,
            categoryData: result.categoryData?.length > 0 ? result.categoryData : MOCK_FALLBACK.categoryData,
            peakHoursData: result.peakHoursData.some((d) => d.orders > 0) ? result.peakHoursData : MOCK_FALLBACK.peakHoursData,
            weeklyOrdersData: result.weeklyOrdersData.some((d) => d.orders > 0) ? result.weeklyOrdersData : MOCK_FALLBACK.weeklyOrdersData,
            bestSellers: result.bestSellers?.length > 0 ? result.bestSellers : MOCK_FALLBACK.bestSellers,
            recentOrders: result.recentOrders.length > 0 ? result.recentOrders : MOCK_FALLBACK.recentOrders,
            latestReviews: result.latestReviews.length > 0 ? result.latestReviews : MOCK_FALLBACK.latestReviews,
            insightCards: result.insightCards,
          });
          setIsLive(true);
        }
      } catch {
        // Keep mock data on failure
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <DashboardContext.Provider value={{ data, loading, isLive }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  return useContext(DashboardContext);
}
