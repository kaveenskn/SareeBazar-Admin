"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Search,
  Filter,
  Download,
  MapPin,
  CreditCard,
  Box,
  Clock,
  Truck,
  CheckCircle2,
  RefreshCw,
  ChevronDown,
  AlertCircle,
  XCircle,
  Package,
  Loader2,
} from "lucide-react";

const API_BASE = "/api/backend/orders";

/* ─── Types ─── */
interface OrderItem {
  productId: number;
  slug: string;
  name: string;
  selectedColor: string;
  selectedColorHex: string;
  selectedColorImage: string;
  quantity: number;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  fabric?: string;
}

interface Shipping {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface OrderFromDB {
  _id: string;
  orderId: string;
  user: { _id: string; name: string; email: string } | null;
  items: OrderItem[];
  shipping: Shipping;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentId: string;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

/* ─── Helpers ─── */

function formatDate(dateStr: string): string {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "N/A";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays === 0) {
    return `Today, ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}`;
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatPaymentStatus(status: string): string {
  if (!status) return "Pending";
  const map: Record<string, string> = {
    paid: "Paid",
    cod: "COD",
    pending: "Pending",
    failed: "Failed",
    refunded: "Refunded",
  };
  return map[status.toLowerCase()] || status;
}

function formatDeliveryStatus(status: string): string {
  if (!status) return "Pending";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatCurrency(amount: number): string {
  const val = amount || 0;
  return `LKR ${val.toLocaleString("en-LK")}`;
}

/* ─── Badge Components ─── */

const PaymentBadge = ({ status }: { status: string }) => {
  const display = formatPaymentStatus(status);
  const styles: Record<string, string> = {
    Paid: "bg-[#ecfdf5] text-[#059669]",
    COD: "bg-[#fffbeb] text-[#d97706]",
    Pending: "bg-[#fef3c7] text-[#b45309]",
    Failed: "bg-[#fef2f2] text-[#dc2626]",
    Refunded: "bg-[#f3f4f6] text-[#4b5563]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
        styles[display] || "bg-gray-100 text-gray-600"
      }`}
    >
      <CreditCard size={12} />
      {display}
    </span>
  );
};

const DeliveryBadge = ({ status }: { status: string }) => {
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
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
        styles[display] || "bg-gray-100 text-gray-600"
      }`}
    >
      {display}
    </span>
  );
};

/* ─── Status Update Dropdown ─── */

const StatusDropdown = ({
  currentStatus,
  orderId,
  onUpdate,
}: {
  currentStatus: string;
  orderId: string;
  onUpdate: (orderId: string, newStatus: string) => Promise<void>;
}) => {
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const statuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

  const handleSelect = async (status: string) => {
    if (status === currentStatus) {
      setOpen(false);
      return;
    }
    setUpdating(true);
    await onUpdate(orderId, status);
    setUpdating(false);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={updating}
        className="flex items-center gap-1 text-xs text-[#a1005b] font-medium hover:bg-[#fdf2f8] px-2 py-1 rounded-lg transition-colors"
      >
        {updating ? <Loader2 size={12} className="animate-spin" /> : <ChevronDown size={12} />}
        Update
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 min-w-[160px]">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => handleSelect(s)}
                className={`w-full text-left px-4 py-2 text-sm capitalize transition-colors ${
                  s === currentStatus
                    ? "bg-[#fdf2f8] text-[#a1005b] font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/* ─── Main Page ─── */

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderFromDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/admin/all`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch orders");
      setOrders(data.orders || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to fetch orders";
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => fetchOrders(true), 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE}/admin/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      // Update local state
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o))
      );
    } catch {
      // Silently fail — user can retry
    }
  };

  /* ─── Derived data ─── */

  const filteredOrders = useMemo(() => {
    let result = orders;

    // Filter by status
    if (activeFilter !== "All") {
      result = result.filter(
        (o) => o.status.toLowerCase() === activeFilter.toLowerCase()
      );
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.orderId.toLowerCase().includes(q) ||
          o.shipping.fullName.toLowerCase().includes(q) ||
          o.items.some((item) => item.name.toLowerCase().includes(q)) ||
          (o.user?.name || "").toLowerCase().includes(q)
      );
    }

    return result;
  }, [orders, activeFilter, searchQuery]);

  const stats = useMemo(() => {
    const counts = {
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      confirmed: orders.filter((o) => o.status === "confirmed").length,
      processing: orders.filter((o) => o.status === "processing").length,
      shipped: orders.filter((o) => o.status === "shipped").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
    };
    return [
      { label: "Total Orders", value: counts.total.toLocaleString(), icon: Box },
      { label: "Pending", value: counts.pending.toLocaleString(), icon: Clock },
      { label: "Confirmed", value: (counts.confirmed + counts.processing).toLocaleString(), icon: Package },
      { label: "Shipped", value: counts.shipped.toLocaleString(), icon: Truck },
      { label: "Delivered", value: counts.delivered.toLocaleString(), icon: CheckCircle2 },
    ];
  }, [orders]);

  /* ─── Loading State ─── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-11rem)] gap-4">
        <Loader2 size={40} className="text-[#a1005b] animate-spin" />
        <p className="text-gray-500 text-sm">Loading orders...</p>
      </div>
    );
  }

  /* ─── Error State ─── */
  if (error && !orders.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-11rem)] gap-4">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
          <AlertCircle size={32} className="text-red-400" />
        </div>
        <p className="text-gray-700 font-medium">{error}</p>
        <button
          onClick={() => fetchOrders()}
          className="px-5 py-2 bg-[#a1005b] text-white rounded-full text-sm font-medium hover:bg-[#870049] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto h-[calc(100vh-11rem)] min-h-[500px]">
      {/* Stats Row */}
      <div className="flex gap-4 shrink-0">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="flex-1 bg-white border border-gray-100 rounded-3xl p-5 flex items-center gap-4 shadow-sm shadow-gray-100/50"
          >
            <div className="w-12 h-12 rounded-full bg-[#fdf2f8] text-[#a1005b] flex items-center justify-center shrink-0">
              <stat.icon size={22} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 font-medium">
                {stat.label}
              </span>
              <span className="text-2xl font-serif text-gray-900 mt-0.5">
                {stat.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-gray-100 rounded-full p-2 flex items-center justify-between shadow-sm shadow-gray-100/50 shrink-0">
        <div className="flex items-center pl-4 pr-2 w-[340px]">
          <Search size={18} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by order ID, customer, product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-2 py-1.5 text-sm bg-transparent outline-none placeholder:text-gray-400"
          />
        </div>

        <div className="flex items-center gap-2">
          {["All", "Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === tab
                    ? "bg-[#a1005b] text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {tab}
              </button>
            )
          )}
        </div>

        <div className="flex items-center gap-2 pr-2">
          <button
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors">
            <Filter size={16} />
            Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Table (Scrollable Container) */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm shadow-gray-100/50 flex-1 overflow-y-auto pr-2 -mr-2">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
              <XCircle size={32} className="text-gray-300" />
            </div>
            <p className="text-gray-500 text-sm font-medium">
              {orders.length === 0
                ? "No orders yet. Orders will appear here once customers place them."
                : "No orders match your filters."}
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#fafafc] z-10">
              <tr className="border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Product / Variant
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Qty
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, idx) => {
                const itemsList = order.items || [];
                const totalQty = itemsList.reduce((sum, item) => sum + (item.quantity || 0), 0);
                const primaryItem = itemsList[0];
                const additionalItems = Math.max(0, itemsList.length - 1);

                return (
                  <tr
                    key={order._id}
                    className={
                      idx !== filteredOrders.length - 1
                        ? "border-b border-gray-50"
                        : ""
                    }
                  >
                    <td className="py-4 px-6 align-top">
                      <span className="text-sm font-medium text-[#a1005b]">
                        {order.orderId || "—"}
                      </span>
                    </td>
                    <td className="py-4 px-6 align-top">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-gray-900">
                          {order.shipping?.fullName || "Guest Customer"}
                        </span>
                        <span className="flex items-center gap-1 text-[13px] text-gray-500">
                          <MapPin size={12} />
                          {order.shipping?.city || "Unknown City"}{order.shipping?.state ? `, ${order.shipping.state}` : ""}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 align-top">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-gray-900">
                          {primaryItem?.name || "—"}
                        </span>
                        <span className="text-[13px] text-gray-500">
                          {primaryItem?.selectedColor || "—"}
                          {additionalItems > 0 && (
                            <span className="ml-1 text-[#a1005b] font-medium">
                              +{additionalItems} more
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 align-top text-sm font-medium text-gray-900">
                      {totalQty}
                    </td>
                    <td className="py-4 px-6 align-top text-sm font-medium text-gray-900">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="py-4 px-6 align-top text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="py-4 px-6 align-top">
                      <PaymentBadge status={order.paymentStatus || "pending"} />
                    </td>
                    <td className="py-4 px-6 align-top">
                      <div className="flex flex-col gap-1 items-start">
                        <div className="flex items-center gap-2">
                          <DeliveryBadge status={order.status || "pending"} />
                          <StatusDropdown
                            currentStatus={order.status || "pending"}
                            orderId={order.orderId || ""}
                            onUpdate={handleStatusUpdate}
                          />
                        </div>
                        {order.cancelReason && (
                          <span className="text-[11px] text-red-500 italic max-w-[120px] leading-tight">
                            Reason: {order.cancelReason}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
