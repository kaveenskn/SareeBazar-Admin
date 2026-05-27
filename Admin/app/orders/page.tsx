"use client";

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
} from "lucide-react";

const stats = [
  { label: "Total Orders", value: "6,481", icon: Box },
  { label: "Pending", value: "42", icon: Clock },
  { label: "Processing", value: "118", icon: Box },
  { label: "Shipped", value: "264", icon: Truck },
  { label: "Delivered", value: "5,924", icon: CheckCircle2 },
];

const orders = [
  {
    id: "ORD-29481",
    customer: "Ananya Sharma",
    location: "Mumbai",
    product: "Banarasi Silk Royale",
    variant: "Ruby Magenta",
    qty: 1,
    amount: "₹18,999",
    date: "Today, 10:42 AM",
    payment: "Paid",
    delivery: "Delivered",
  },
  {
    id: "ORD-29480",
    customer: "Meera Iyer",
    location: "Chennai",
    product: "Kanjivaram Aurora",
    variant: "Forest Gold",
    qty: 1,
    amount: "₹24,500",
    date: "Today, 09:18 AM",
    payment: "Paid",
    delivery: "Shipped",
  },
  {
    id: "ORD-29479",
    customer: "Riya Patel",
    location: "Ahmedabad",
    product: "Chanderi Whisper",
    variant: "Blush Pink",
    qty: 2,
    amount: "₹8,598",
    date: "Today, 08:03 AM",
    payment: "Paid",
    delivery: "Processing",
  },
  {
    id: "ORD-29478",
    customer: "Kavya Reddy",
    location: "Hyderabad",
    product: "Mysore Silk Dusk",
    variant: "Sunset Ember",
    qty: 1,
    amount: "₹7,899",
    date: "Yesterday",
    payment: "COD",
    delivery: "Pending",
  },
  {
    id: "ORD-29477",
    customer: "Naina Verma",
    location: "Delhi",
    product: "Patola Ember",
    variant: "Ruby Magenta",
    qty: 1,
    amount: "₹9,499",
    date: "Yesterday",
    payment: "Paid",
    delivery: "Delivered",
  },
  {
    id: "ORD-29476",
    customer: "Aditi Singh",
    location: "Bangalore",
    product: "Tussar Sundown",
    variant: "Mustard Glow",
    qty: 3,
    amount: "₹10,497",
    date: "2 days ago",
    payment: "Refunded",
    delivery: "Cancelled",
    cancelReason: "Found a better price elsewhere.",
  },
];

const PaymentBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    Paid: "bg-[#ecfdf5] text-[#059669]",
    COD: "bg-[#fffbeb] text-[#d97706]",
    Refunded: "bg-[#f3f4f6] text-[#4b5563]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      <CreditCard size={12} />
      {status}
    </span>
  );
};

const DeliveryBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    Delivered: "bg-[#ecfdf5] text-[#059669]",
    Shipped: "bg-[#fdf2f8] text-[#db2777]",
    Processing: "bg-[#f3f4f6] text-[#4b5563]",
    Pending: "bg-[#fffbeb] text-[#d97706]",
    Cancelled: "bg-[#fef2f2] text-[#dc2626]",
  };

  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
};

export default function OrdersPage() {
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
            className="w-full pl-3 pr-2 py-1.5 text-sm bg-transparent outline-none placeholder:text-gray-400"
          />
        </div>

        <div className="flex items-center gap-2">
          {["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map(
            (tab) => (
              <button
                key={tab}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  tab === "All"
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
                Delivery
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, idx) => (
              <tr
                key={order.id}
                className={
                  idx !== orders.length - 1 ? "border-b border-gray-50" : ""
                }
              >
                <td className="py-4 px-6 align-top">
                  <span className="text-sm font-medium text-[#a1005b]">
                    {order.id}
                  </span>
                </td>
                <td className="py-4 px-6 align-top">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-gray-900">
                      {order.customer}
                    </span>
                    <span className="flex items-center gap-1 text-[13px] text-gray-500">
                      <MapPin size={12} />
                      {order.location}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6 align-top">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-gray-900">
                      {order.product}
                    </span>
                    <span className="text-[13px] text-gray-500">
                      {order.variant}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6 align-top text-sm font-medium text-gray-900">
                  {order.qty}
                </td>
                <td className="py-4 px-6 align-top text-sm font-medium text-gray-900">
                  {order.amount}
                </td>
                <td className="py-4 px-6 align-top text-sm text-gray-500">
                  {order.date}
                </td>
                <td className="py-4 px-6 align-top">
                  <PaymentBadge status={order.payment} />
                </td>
                <td className="py-4 px-6 align-top">
                  <div className="flex flex-col gap-1 items-start">
                    <DeliveryBadge status={order.delivery} />
                    {order.cancelReason && (
                      <span className="text-[11px] text-red-500 italic max-w-[120px] leading-tight">
                        Reason: {order.cancelReason}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
