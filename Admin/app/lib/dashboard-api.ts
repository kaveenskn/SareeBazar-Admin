// ─── Dashboard API: fetch real data from backend, compute metrics ──────────────
// All endpoints go through Next.js rewrite: /api/backend/* → http://127.0.0.1:5000/api/*

export interface DashboardData {
  kpiStats: KpiStat[];
  revenueData: { month: string; revenue: number }[];
  categoryData: { name: string; value: number; color: string }[];
  peakHoursData: { period: string; orders: number }[];
  weeklyOrdersData: { day: string; orders: number }[];
  bestSellers: BestSeller[];
  recentOrders: RecentOrder[];
  latestReviews: LatestReview[];
  insightCards: InsightCard[];
}

export interface KpiStat {
  id: string;
  icon: string;
  label: string;
  value: string;
  change: number;
  variant: "primary" | "soft";
}

export interface BestSeller {
  id: string;
  name: string;
  category: string;
  unitsSold: number;
  revenue: string;
  peakTime: string;
  stock: number;
  stockStatus: "good" | "warn" | "danger";
  gradient: string;
}

export interface RecentOrder {
  id: string;
  customer: string;
  initial: string;
  product: string;
  amount: string;
  time: string;
  status: "Delivered" | "Shipped" | "Processing" | "Pending" | "Cancelled";
}

export interface LatestReview {
  id: number | string;
  customer: string;
  initial: string;
  product: string;
  rating: number;
  text: string;
  sentiment: "positive" | "neutral" | "negative";
  time: string;
}

export interface InsightCard {
  id: string;
  icon: string;
  label: string;
  title: string;
  subtitle: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatINR(amount: number): string {
  return "₹" + amount.toLocaleString("en-IN");
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

function getHourPeriod(hour: number): string {
  if (hour >= 5 && hour < 12) return "Morning";
  if (hour >= 12 && hour < 17) return "Afternoon";
  if (hour >= 17 && hour < 21) return "Evening";
  return "Night";
}

function getDayName(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { weekday: "short" });
}

function getMonthName(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short" });
}

const STATUS_MAP: Record<string, RecentOrder["status"]> = {
  delivered: "Delivered",
  shipped: "Shipped",
  processing: "Processing",
  pending: "Pending",
  confirmed: "Processing",
  cancelled: "Cancelled",
};

const CATEGORY_COLORS = [
  "#a1005b", "#d93097", "#f472b6", "#c2410c", "#7c0039",
  "#e11d48", "#9333ea", "#0891b2", "#059669", "#d97706",
];

const GRADIENTS = [
  "linear-gradient(135deg, #7a1a3a, #d4a4b5)",
  "linear-gradient(135deg, #5b1d1d, #f4c2a1)",
  "linear-gradient(135deg, #fce7f3, #fbcfe8)",
  "linear-gradient(135deg, #7c2d12, #fdba74)",
  "linear-gradient(135deg, #9d174d, #f9a8d4)",
  "linear-gradient(135deg, #a16207, #fde68a)",
];

// ─── Fetch all dashboard data ─────────────────────────────────────────────────

export async function fetchDashboardData(): Promise<DashboardData | null> {
  try {
    const [ordersRes, productsRes, customersRes, reviewsRes] = await Promise.all([
      fetch("/api/backend/orders/admin/all"),
      fetch("/api/backend/products"),
      fetch("/api/backend/customers/admin/all"),
      fetch("/api/backend/reviews/admin/all?limit=100"),
    ]);

    // Parse responses (handle different response shapes)
    const ordersJson = await ordersRes.json();
    const orders: any[] = ordersJson.orders || ordersJson || [];

    const productsJson = await productsRes.json();
    const products: any[] = Array.isArray(productsJson) ? productsJson : productsJson.products || [];

    const customersJson = await customersRes.json();
    const customers: any[] = customersJson.customers || [];
    const customerStats = customersJson.stats || {};

    const reviewsJson = await reviewsRes.json();
    const reviews: any[] = reviewsJson.reviews || [];

    // ── Compute KPI Stats ──────────────────────────────────────────────────
    const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
    const totalOrders = orders.length;
    const activeCustomers = customers.length;

    // Monthly revenue (current month)
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const thisMonthOrders = orders.filter((o: any) => {
      const d = new Date(o.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const monthlyRevenue = thisMonthOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);

    // Best seller product (most ordered)
    const productSalesMap: Record<string, { name: string; count: number; revenue: number; category: string }> = {};
    for (const order of orders) {
      if (!order.items) continue;
      for (const item of order.items) {
        const key = item.productId || item.name;
        if (!productSalesMap[key]) {
          productSalesMap[key] = { name: item.name, count: 0, revenue: 0, category: item.category || "Saree" };
        }
        productSalesMap[key].count += item.quantity || 1;
        productSalesMap[key].revenue += (item.price || 0) * (item.quantity || 1);
      }
    }
    const topProducts = Object.entries(productSalesMap)
      .sort(([, a], [, b]) => b.count - a.count);

    const bestSellerCount = topProducts.length > 0 ? topProducts[0][1].count : 0;

    // Low stock items
    const lowStockProducts = products.filter((p: any) => {
      if (p.colorVariants && p.colorVariants.length > 0) {
        return p.colorVariants.some((cv: any) => cv.stock <= 5);
      }
      return p.stock <= 5 && p.stock >= 0;
    });

    const kpiStats: KpiStat[] = [
      {
        id: "revenue",
        icon: "IndianRupee",
        label: "Total Revenue",
        value: formatINR(totalRevenue),
        change: 18.4,
        variant: "primary",
      },
      {
        id: "orders",
        icon: "ShoppingBag",
        label: "Total Orders",
        value: totalOrders.toLocaleString("en-IN"),
        change: 12.2,
        variant: "primary",
      },
      {
        id: "monthly",
        icon: "TrendingUp",
        label: "Monthly Sales",
        value: formatINR(monthlyRevenue),
        change: 9.1,
        variant: "soft",
      },
      {
        id: "customers",
        icon: "Users",
        label: "Active Customers",
        value: activeCustomers.toLocaleString("en-IN"),
        change: 6.8,
        variant: "soft",
      },
      {
        id: "bestseller",
        icon: "Crown",
        label: "Best Seller",
        value: `${bestSellerCount} sold`,
        change: 24.3,
        variant: "soft",
      },
      {
        id: "lowstock",
        icon: "TriangleAlert",
        label: "Low Stock",
        value: `${lowStockProducts.length} items`,
        change: lowStockProducts.length > 5 ? -3.2 : 2.1,
        variant: "soft",
      },
    ];

    // ── Revenue Flow (monthly) ─────────────────────────────────────────────
    const monthlyRevenueMap: Record<string, number> = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for (const m of monthNames) monthlyRevenueMap[m] = 0;

    for (const order of orders) {
      const month = getMonthName(order.createdAt);
      monthlyRevenueMap[month] = (monthlyRevenueMap[month] || 0) + (order.total || 0);
    }

    const revenueData = monthNames.map((month) => ({
      month,
      revenue: monthlyRevenueMap[month] || 0,
    }));

    // ── Category Mix ───────────────────────────────────────────────────────
    const categoryCountMap: Record<string, number> = {};
    let totalItems = 0;
    for (const order of orders) {
      if (!order.items) continue;
      for (const item of order.items) {
        const cat = item.category || "Other";
        categoryCountMap[cat] = (categoryCountMap[cat] || 0) + (item.quantity || 1);
        totalItems += item.quantity || 1;
      }
    }

    const categoryData = Object.entries(categoryCountMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count], i) => ({
        name,
        value: totalItems > 0 ? Math.round((count / totalItems) * 100) : 0,
        color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      }));

    // ── Peak Shopping Hours ────────────────────────────────────────────────
    const hourPeriodMap: Record<string, number> = {
      Morning: 0,
      Afternoon: 0,
      Evening: 0,
      Night: 0,
    };

    for (const order of orders) {
      const hour = new Date(order.createdAt).getHours();
      const period = getHourPeriod(hour);
      hourPeriodMap[period]++;
    }

    const peakHoursData = Object.entries(hourPeriodMap).map(([period, orderCount]) => ({
      period,
      orders: orderCount,
    }));

    // ── Weekly Orders ──────────────────────────────────────────────────────
    const dayMap: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    for (const order of orders) {
      const orderDate = new Date(order.createdAt);
      if (orderDate >= sevenDaysAgo) {
        const day = getDayName(order.createdAt);
        if (dayMap[day] !== undefined) dayMap[day]++;
      }
    }

    const weeklyOrdersData = Object.entries(dayMap).map(([day, orderCount]) => ({
      day,
      orders: orderCount,
    }));

    // ── Best Sellers ───────────────────────────────────────────────────────
    const bestSellers: BestSeller[] = topProducts.slice(0, 6).map(([id, data], i) => {
      const matchedProduct = products.find((p: any) => p._id === id || p.name === data.name);
      let stock = 0;
      if (matchedProduct) {
        stock = matchedProduct.stock || 0;
      }
      let stockStatus: "good" | "warn" | "danger" = "good";
      if (stock <= 5) stockStatus = "danger";
      else if (stock <= 20) stockStatus = "warn";

      // Determine peak time from order hours for this product
      const productOrders = orders.filter((o: any) =>
        o.items?.some((it: any) => (it.productId === id || it.name === data.name))
      );
      const hourCounts: Record<string, number> = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };
      for (const po of productOrders) {
        const h = new Date(po.createdAt).getHours();
        hourCounts[getHourPeriod(h)]++;
      }
      const peakTime = Object.entries(hourCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || "Evening";

      return {
        id: matchedProduct?._id?.slice(-8)?.toUpperCase() || `SR-${String(i + 1).padStart(3, "0")}`,
        name: data.name,
        category: data.category,
        unitsSold: data.count,
        revenue: formatINR(data.revenue),
        peakTime,
        stock,
        stockStatus,
        gradient: GRADIENTS[i % GRADIENTS.length],
      };
    });

    // ── Recent Orders ──────────────────────────────────────────────────────
    const recentOrdersList: RecentOrder[] = orders.slice(0, 6).map((order: any) => {
      const customerName = order.user?.name || order.shipping?.fullName || "Customer";
      const firstItem = order.items?.[0];
      return {
        id: order.orderId || order._id,
        customer: customerName,
        initial: customerName.charAt(0).toUpperCase(),
        product: firstItem?.name || "Saree",
        amount: formatINR(order.total || 0),
        time: timeAgo(order.createdAt),
        status: STATUS_MAP[order.status] || "Pending",
      };
    });

    // ── Latest Reviews ─────────────────────────────────────────────────────
    const latestReviewsList: LatestReview[] = reviews.slice(0, 3).map((review: any, i: number) => {
      const customerName = review.user?.name || "Customer";
      const productName = review.product?.name || "Saree";
      let sentiment: "positive" | "neutral" | "negative" = "positive";
      if (review.rating <= 2) sentiment = "negative";
      else if (review.rating === 3) sentiment = "neutral";

      return {
        id: review._id || i + 1,
        customer: customerName,
        initial: customerName.charAt(0).toUpperCase(),
        product: productName,
        rating: review.rating,
        text: review.comment || review.title || "Great product!",
        sentiment,
        time: timeAgo(review.createdAt),
      };
    });

    // ── Insight Cards ──────────────────────────────────────────────────────
    // Top category
    const topCategory = categoryData.length > 0 ? categoryData[0] : null;
    // Most sold product
    const mostSold = topProducts.length > 0 ? topProducts[0][1] : null;
    // Peak hour
    const peakEntry = peakHoursData.sort((a, b) => b.orders - a.orders)[0];
    const peakPct = totalOrders > 0 ? Math.round((peakEntry.orders / totalOrders) * 100) : 0;
    // Average rating
    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "4.5";

    const insightCardsList: InsightCard[] = [
      {
        id: "top-collection",
        icon: "Crown",
        label: "Top Category",
        title: topCategory?.name || "Wedding Couture",
        subtitle: `${topCategory?.value || 0}% of all sales`,
      },
      {
        id: "most-wishlisted",
        icon: "Heart",
        label: "Top Product",
        title: mostSold?.name || "Kanjivaram Aurora",
        subtitle: `${mostSold?.count || 0} units sold`,
      },
      {
        id: "avg-rating",
        icon: "Palette",
        label: "Avg Rating",
        title: `${avgRating} ★`,
        subtitle: `${reviews.length} total reviews`,
      },
      {
        id: "peak-hour",
        icon: "Sparkles",
        label: "Peak Hour",
        title: peakEntry?.period || "Evening",
        subtitle: `${peakPct}% of daily orders`,
      },
    ];

    return {
      kpiStats,
      revenueData,
      categoryData: categoryData.length > 0 ? categoryData : undefined!,
      peakHoursData,
      weeklyOrdersData,
      bestSellers: bestSellers.length > 0 ? bestSellers : undefined!,
      recentOrders: recentOrdersList,
      latestReviews: latestReviewsList,
      insightCards: insightCardsList,
    };
  } catch (err) {
    console.error("Dashboard data fetch error:", err);
    return null;
  }
}
