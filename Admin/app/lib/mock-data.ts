// ─── KPI Stats ────────────────────────────────────────────────────────────────
export const kpiStats = [
  {
    id: "revenue",
    icon: "IndianRupee",
    label: "Total Revenue",
    value: "₹52,93,000",
    change: 18.4,
    variant: "primary" as const,
  },
  {
    id: "orders",
    icon: "ShoppingBag",
    label: "Total Orders",
    value: "6,481",
    change: 12.2,
    variant: "primary" as const,
  },
  {
    id: "monthly",
    icon: "TrendingUp",
    label: "Monthly Sales",
    value: "₹7,52,000",
    change: 9.1,
    variant: "soft" as const,
  },
  {
    id: "customers",
    icon: "Users",
    label: "Active Customers",
    value: "2,184",
    change: 6.8,
    variant: "soft" as const,
  },
  {
    id: "bestseller",
    icon: "Crown",
    label: "Best Seller",
    value: "142 sold",
    change: 24.3,
    variant: "soft" as const,
  },
  {
    id: "lowstock",
    icon: "TriangleAlert",
    label: "Low Stock",
    value: "8 items",
    change: -3.2,
    variant: "soft" as const,
  },
];

// ─── Revenue Flow ─────────────────────────────────────────────────────────────
export const revenueData = [
  { month: "Jan", revenue: 320000 },
  { month: "Feb", revenue: 280000 },
  { month: "Mar", revenue: 290000 },
  { month: "Apr", revenue: 270000 },
  { month: "May", revenue: 350000 },
  { month: "Jun", revenue: 390000 },
  { month: "Jul", revenue: 430000 },
  { month: "Aug", revenue: 470000 },
  { month: "Sep", revenue: 510000 },
  { month: "Oct", revenue: 560000 },
  { month: "Nov", revenue: 610000 },
  { month: "Dec", revenue: 680000 },
];

// ─── Category Mix ─────────────────────────────────────────────────────────────
export const categoryData = [
  { name: "Bridal",  value: 32, color: "#a1005b" },
  { name: "Festival", value: 24, color: "#d93097" },
  { name: "Party",   value: 18, color: "#f472b6" },
  { name: "Daily",   value: 14, color: "#c2410c" },
  { name: "Casual",  value: 12, color: "#7c0039" },
];

// ─── Peak Shopping Hours ──────────────────────────────────────────────────────
export const peakHoursData = [
  { period: "Morning",   orders: 205 },
  { period: "Afternoon", orders: 274 },
  { period: "Evening",   orders: 459 },
  { period: "Night",     orders: 332 },
];

// ─── Weekly Orders ────────────────────────────────────────────────────────────
export const weeklyOrdersData = [
  { day: "Mon", orders: 85  },
  { day: "Tue", orders: 102 },
  { day: "Wed", orders: 95  },
  { day: "Thu", orders: 123 },
  { day: "Fri", orders: 148 },
  { day: "Sat", orders: 173 },
  { day: "Sun", orders: 157 },
];

// ─── Best Selling Sarees ──────────────────────────────────────────────────────
export type StockStatus = "good" | "warn" | "danger";

export const bestSellers = [
  {
    id: "SR-BNR-001",
    name: "Banarasi Silk Royale",
    category: "Wedding",
    unitsSold: 142,
    revenue: "₹26,97,858",
    peakTime: "Evening",
    stock: 24,
    stockStatus: "warn" as StockStatus,
    gradient: "linear-gradient(135deg, #7a1a3a, #d4a4b5)",
  },
  {
    id: "SR-KJV-014",
    name: "Kanjivaram Aurora",
    category: "Bridal",
    unitsSold: 118,
    revenue: "₹28,91,000",
    peakTime: "Night",
    stock: 8,
    stockStatus: "danger" as StockStatus,
    gradient: "linear-gradient(135deg, #5b1d1d, #f4c2a1)",
  },
  {
    id: "SR-CHN-022",
    name: "Chanderi Whisper",
    category: "Daily",
    unitsSold: 96,
    revenue: "₹4,12,704",
    peakTime: "Morning",
    stock: 56,
    stockStatus: "good" as StockStatus,
    gradient: "linear-gradient(135deg, #fce7f3, #fbcfe8)",
  },
  {
    id: "SR-MYS-007",
    name: "Mysore Silk Dusk",
    category: "Festival",
    unitsSold: 87,
    revenue: "₹6,87,213",
    peakTime: "Evening",
    stock: 3,
    stockStatus: "danger" as StockStatus,
    gradient: "linear-gradient(135deg, #7c2d12, #fdba74)",
  },
  {
    id: "SR-PTL-019",
    name: "Patola Ember",
    category: "Party",
    unitsSold: 74,
    revenue: "₹7,02,926",
    peakTime: "Afternoon",
    stock: 31,
    stockStatus: "good" as StockStatus,
    gradient: "linear-gradient(135deg, #9d174d, #f9a8d4)",
  },
  {
    id: "SR-TSR-031",
    name: "Tussar Sundown",
    category: "Daily",
    unitsSold: 65,
    revenue: "₹2,27,435",
    peakTime: "Morning",
    stock: 42,
    stockStatus: "good" as StockStatus,
    gradient: "linear-gradient(135deg, #a16207, #fde68a)",
  },
];

// ─── Recent Orders ────────────────────────────────────────────────────────────
export type OrderStatus = "Delivered" | "Shipped" | "Processing" | "Pending" | "Cancelled";

export const recentOrders = [
  { id: "ORD-29481", customer: "Ananya Sharma",  initial: "A", product: "Banarasi Silk Royale", amount: "₹18,999", time: "2h ago",  status: "Delivered"  as OrderStatus },
  { id: "ORD-29480", customer: "Meera Iyer",     initial: "M", product: "Kanjivaram Aurora",    amount: "₹24,500", time: "3h ago",  status: "Shipped"     as OrderStatus },
  { id: "ORD-29479", customer: "Riya Patel",     initial: "R", product: "Chanderi Whisper",     amount: "₹4,299",  time: "5h ago",  status: "Processing"  as OrderStatus },
  { id: "ORD-29478", customer: "Kavya Reddy",    initial: "K", product: "Mysore Silk Dusk",     amount: "₹7,899",  time: "6h ago",  status: "Pending"     as OrderStatus },
  { id: "ORD-29477", customer: "Naina Verma",    initial: "N", product: "Patola Ember",         amount: "₹9,499",  time: "8h ago",  status: "Delivered"   as OrderStatus },
  { id: "ORD-29476", customer: "Aditi Singh",    initial: "A", product: "Tussar Sundown",       amount: "₹3,499",  time: "1d ago",  status: "Cancelled"   as OrderStatus },
];

// ─── Latest Reviews ───────────────────────────────────────────────────────────
export const latestReviews = [
  {
    id: 1,
    customer: "Ananya Sharma",
    initial: "A",
    product: "Banarasi Silk Royale",
    rating: 5,
    text: "The weave is exquisite. Felt like royalty at my sister's wedding.",
    sentiment: "positive" as const,
    time: "2 days ago",
  },
  {
    id: 2,
    customer: "Meera Iyer",
    initial: "M",
    product: "Kanjivaram Aurora",
    rating: 5,
    text: "Heirloom quality. The zari work is intricate and the drape flawless.",
    sentiment: "positive" as const,
    time: "4 days ago",
  },
  {
    id: 3,
    customer: "Riya Patel",
    initial: "R",
    product: "Chanderi Whisper",
    rating: 4,
    text: "Light, breathable, and the pastel hue is exactly as pictured.",
    sentiment: "positive" as const,
    time: "1 week ago",
  },
];

// ─── Insight Cards ────────────────────────────────────────────────────────────
export const insightCards = [
  { id: "top-collection",  icon: "Crown",    label: "Top Collection",  title: "Wedding Couture",    subtitle: "48 sarees · ₹8.4L revenue" },
  { id: "most-wishlisted", icon: "Heart",    label: "Most Wishlisted", title: "Kanjivaram Aurora",  subtitle: "2,184 saves"                },
  { id: "trending-color",  icon: "Palette",  label: "Trending Color",  title: "Ruby Magenta",       subtitle: "↑ 32% this week"            },
  { id: "peak-hour",       icon: "Sparkles", label: "Peak Hour",       title: "8 — 10 PM",          subtitle: "42% of daily orders"        },
];