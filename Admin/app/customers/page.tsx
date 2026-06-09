"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Search,
  Users,
  Crown,
  Repeat,
  TrendingUp,
  Mail,
  MapPin,
  Phone,
  ChevronDown,
  ChevronUp,
  Package,
  Loader2,
  AlertCircle,
  ShoppingBag,
  Calendar,
  CreditCard,
  XCircle,
} from "lucide-react";

const API_BASE = "http://localhost:5000/api/customers";

/* ─── Types ─── */
interface OrderItem {
  name: string;
  selectedColor: string;
  quantity: number;
  price: number;
  image: string;
  category: string;
  fabric?: string;
}

interface CustomerOrder {
  orderId: string;
  items: OrderItem[];
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
}

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  totalOrders: number;
  lifetimeSpend: number;
  orders: CustomerOrder[];
  lastOrderDate: string | null;
  firstOrderDate: string | null;
  tier: "VIP" | "Gold" | "Silver";
}

interface Stats {
  totalCustomers: number;
  vipMembers: number;
  repeatRate: number;
  avgLTV: number;
}

/* ─── Helpers ─── */

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDeliveryStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

/* ─── Tier Badge ─── */
const TierBadge = ({ tier }: { tier: string }) => {
  const styles: Record<string, string> = {
    VIP: "bg-gradient-to-r from-[#a1005b] to-[#d93097] text-white",
    Gold: "bg-gradient-to-r from-[#d97706] to-[#f59e0b] text-white",
    Silver: "bg-gray-200 text-gray-600",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${
        styles[tier] || styles.Silver
      }`}
    >
      {tier}
    </span>
  );
};

/* ─── Status Badge ─── */
const StatusBadge = ({ status }: { status: string }) => {
  const display = formatDeliveryStatus(status);
  const styles: Record<string, string> = {
    Delivered: "bg-[#ecfdf5] text-[#059669]",
    Shipped: "bg-[#fdf2f8] text-[#db2777]",
    Processing: "bg-[#f3f4f6] text-[#4b5563]",
    Confirmed: "bg-[#eff6ff] text-[#2563eb]",
    Pending: "bg-[#fffbeb] text-[#d97706]",
    Cancelled: "bg-[#fef2f2] text-[#dc2626]",
  };

  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
        styles[display] || "bg-gray-100 text-gray-600"
      }`}
    >
      {display}
    </span>
  );
};

/* ─── Payment Badge ─── */
const PaymentBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    paid: "Paid",
    cod: "COD",
    pending: "Pending",
    failed: "Failed",
    refunded: "Refunded",
  };
  const display = map[status] || status;
  const styles: Record<string, string> = {
    Paid: "bg-[#ecfdf5] text-[#059669]",
    COD: "bg-[#fffbeb] text-[#d97706]",
    Pending: "bg-[#fef3c7] text-[#b45309]",
    Failed: "bg-[#fef2f2] text-[#dc2626]",
    Refunded: "bg-[#f3f4f6] text-[#4b5563]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
        styles[display] || "bg-gray-100 text-gray-600"
      }`}
    >
      <CreditCard size={10} />
      {display}
    </span>
  );
};

/* ─── Customer Card ─── */
const CustomerCard = ({ customer }: { customer: Customer }) => {
  const [expanded, setExpanded] = useState(false);
  const initial = customer.name.charAt(0).toUpperCase();

  // Avatar gradient based on tier
  const avatarGradient: Record<string, string> = {
    VIP: "from-[#a1005b] to-[#d93097]",
    Gold: "from-[#d97706] to-[#f59e0b]",
    Silver: "from-[#6b7280] to-[#9ca3af]",
  };

  return (
    <div
      className={`bg-white border border-gray-100 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md ${
        expanded ? "col-span-1 row-span-2" : ""
      }`}
    >
      {/* Card Header */}
      <div
        className="p-5 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div
              className={`w-12 h-12 rounded-full bg-gradient-to-br ${
                avatarGradient[customer.tier]
              } flex items-center justify-center text-white font-serif text-xl shrink-0 shadow-md`}
            >
              {initial}
            </div>
            {/* Name & Contact */}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 text-[15px] truncate">
                  {customer.name}
                </span>
                {customer.tier === "VIP" && (
                  <Crown size={14} className="text-[#a1005b] shrink-0" />
                )}
              </div>
              <span className="flex items-center gap-1 text-xs text-gray-500 truncate">
                <Mail size={11} className="shrink-0" />
                {customer.email}
              </span>
              {customer.city && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin size={11} className="shrink-0" />
                  {customer.city}
                  {customer.state ? `, ${customer.state}` : ""}
                </span>
              )}
            </div>
          </div>
          <TierBadge tier={customer.tier} />
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-medium">Orders</span>
            <span className="text-xl font-serif text-gray-900">
              {customer.totalOrders}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-500 font-medium">
              Lifetime Spend
            </span>
            <span className="text-xl font-serif text-gray-900">
              {formatCurrency(customer.lifetimeSpend)}
            </span>
          </div>
          {/* Expand icon */}
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#fdf2f8] text-[#a1005b] ml-2 shrink-0">
            {expanded ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </div>
        </div>
      </div>

      {/* ─── Expanded: Purchase History ─── */}
      {expanded && customer.orders.length > 0 && (
        <div className="border-t border-gray-100 px-5 pb-5">
          <div className="pt-4 pb-2 flex items-center gap-2">
            <ShoppingBag size={14} className="text-[#a1005b]" />
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Purchase History
            </span>
          </div>

          {/* ─── Timeline of Orders ─── */}
          <div className="relative">
            {/* Vertical connector line */}
            {customer.orders.length > 1 && (
              <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-[#a1005b] via-[#d93097] to-gray-200 rounded-full" />
            )}

            <div className="flex flex-col gap-3">
              {customer.orders.map((order, idx) => (
                <div key={order.orderId} className="relative flex gap-3">
                  {/* Timeline dot */}
                  <div className="relative z-10 mt-1.5 shrink-0">
                    <div
                      className={`w-[10px] h-[10px] rounded-full border-2 ${
                        idx === 0
                          ? "bg-[#a1005b] border-[#a1005b] shadow-sm shadow-[#a1005b]/40"
                          : "bg-white border-[#d93097]"
                      }`}
                      style={{ marginLeft: "10px" }}
                    />
                  </div>

                  {/* Order Card */}
                  <div className="flex-1 bg-[#fdf8fb] border border-[#f3e0ec] rounded-xl p-3 hover:bg-[#fdf2f8] transition-colors">
                    {/* Order header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#a1005b]">
                          {order.orderId}
                        </span>
                        <StatusBadge status={order.status} />
                        <PaymentBadge status={order.paymentStatus} />
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-gray-400">
                        <Calendar size={10} />
                        {formatDate(order.createdAt)}
                      </div>
                    </div>

                    {/* Order items */}
                    <div className="flex flex-col gap-1.5">
                      {order.items.map((item, itemIdx) => (
                        <div
                          key={itemIdx}
                          className="flex items-center gap-2.5 group"
                        >
                          {/* Product image */}
                          <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package
                                  size={14}
                                  className="text-gray-400"
                                />
                              </div>
                            )}
                          </div>
                          {/* Product info */}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-gray-800 truncate">
                              {item.name}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500">
                              {item.selectedColor && (
                                <span>{item.selectedColor}</span>
                              )}
                              {item.category && (
                                <>
                                  <span className="text-gray-300">·</span>
                                  <span>{item.category}</span>
                                </>
                              )}
                              <span className="text-gray-300">·</span>
                              <span>Qty: {item.quantity}</span>
                            </div>
                          </div>
                          {/* Price */}
                          <span className="text-xs font-semibold text-gray-700 shrink-0">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Order total */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#f0dce6]">
                      <span className="text-[11px] text-gray-500 font-medium">
                        {order.paymentMethod}
                      </span>
                      <span className="text-sm font-bold text-[#a1005b]">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Main Page ─── */
export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalCustomers: 0,
    vipMembers: 0,
    repeatRate: 0,
    avgLTV: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("All");

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/admin/all`);
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to fetch customers");
      setCustomers(data.customers || []);
      setStats(
        data.stats || {
          totalCustomers: 0,
          vipMembers: 0,
          repeatRate: 0,
          avgLTV: 0,
        }
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to fetch customers";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  /* ─── Filtered customers ─── */
  const filteredCustomers = useMemo(() => {
    let result = customers;

    // Tier filter
    if (tierFilter !== "All") {
      result = result.filter((c) => c.tier === tierFilter);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q)
      );
    }

    return result;
  }, [customers, tierFilter, searchQuery]);

  /* ─── Stat cards ─── */
  const statCards = [
    {
      label: "Total Customers",
      value: stats.totalCustomers.toLocaleString(),
      icon: Users,
      color: "text-[#a1005b]",
      bg: "bg-[#fdf2f8]",
    },
    {
      label: "VIP Members",
      value: stats.vipMembers.toLocaleString(),
      icon: Crown,
      color: "text-[#d97706]",
      bg: "bg-[#fffbeb]",
    },
    {
      label: "Repeat Rate",
      value: `${stats.repeatRate}%`,
      icon: Repeat,
      color: "text-[#059669]",
      bg: "bg-[#ecfdf5]",
    },
    {
      label: "Avg. LTV",
      value: formatCurrency(stats.avgLTV),
      icon: TrendingUp,
      color: "text-[#2563eb]",
      bg: "bg-[#eff6ff]",
    },
  ];

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-11rem)] gap-4">
        <Loader2 size={40} className="text-[#a1005b] animate-spin" />
        <p className="text-gray-500 text-sm">Loading customers...</p>
      </div>
    );
  }

  /* ─── Error ─── */
  if (error && !customers.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-11rem)] gap-4">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
          <AlertCircle size={32} className="text-red-400" />
        </div>
        <p className="text-gray-700 font-medium">{error}</p>
        <button
          onClick={fetchCustomers}
          className="px-5 py-2 bg-[#a1005b] text-white rounded-full text-sm font-medium hover:bg-[#870049] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* ─── Stats Row ─── */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white border border-gray-100 rounded-3xl p-5 flex flex-col gap-1 shadow-sm shadow-gray-100/50"
          >
            <span className="text-sm text-gray-500 font-medium">
              {stat.label}
            </span>
            <span className="text-3xl font-serif text-gray-900 mt-1">
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* ─── Search & Filter Bar ─── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm shadow-gray-100/50">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-[#fdf8fb] border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#a1005b]/20 focus:border-[#a1005b] transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Tier filters */}
          <div className="flex items-center gap-2">
            {["All", "VIP", "Gold", "Silver"].map((tier) => (
              <button
                key={tier}
                onClick={() => setTierFilter(tier)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  tierFilter === tier
                    ? "bg-[#a1005b] text-white shadow-sm shadow-[#a1005b]/20"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Customers Grid ─── */}
      {filteredCustomers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
            <XCircle size={32} className="text-gray-300" />
          </div>
          <p className="text-gray-500 text-sm font-medium">
            {customers.length === 0
              ? "No customers yet. They will appear here once orders come in."
              : "No customers match your search."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredCustomers.map((customer) => (
            <CustomerCard key={customer._id} customer={customer} />
          ))}
        </div>
      )}
    </div>
  );
}
