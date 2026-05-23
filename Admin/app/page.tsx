import KpiCards from "./components/dashboard/kpi-cards";
import { RevenueChart, CategoryChart, PeakHoursChart, WeeklyOrdersChart } from "./components/dashboard/charts";
import BestSellersTable from "./components/dashboard/best-sellers-table";
import RecentOrders from "./components/dashboard/recent-orders";
import LatestReviews from "./components/dashboard/latest-reviews";
import InsightCards from "./components/dashboard/insight-cards";

export default function Home() {
  return (
    <div className="space-y-6">
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
  );
}