import { recentOrders, type OrderStatus } from "@/app/lib/mock-data";

const statusStyle: Record<OrderStatus, string> = {
  Delivered:  "bg-emerald-50 text-emerald-700",
  Shipped:    "bg-blue-50    text-blue-700",
  Processing: "bg-pink-50    text-[#a1005b]",
  Pending:    "bg-amber-50   text-amber-700",
  Cancelled:  "bg-rose-50    text-rose-700",
};

export default function RecentOrders() {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
      <h2 className="font-serif text-xl text-gray-900">Recent Orders</h2>
      <p className="text-sm text-gray-500 mt-0.5 mb-5">Live order stream</p>

      <div className="space-y-2">
        {recentOrders.map((order) => (
          <div
            key={order.id}
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            {/* Avatar */}
            <div className="h-10 w-10 rounded-full bg-[#a1005b] text-white flex items-center justify-center text-sm font-serif shrink-0">
              {order.initial}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-gray-900 truncate">{order.customer}</div>
              <div className="text-xs text-gray-400 truncate">
                {order.product} · #{order.id}
              </div>
            </div>

            {/* Amount + time */}
            <div className="text-right shrink-0">
              <div className="text-sm font-semibold text-gray-900 tabular-nums">{order.amount}</div>
              <div className="text-xs text-gray-400">{order.time}</div>
            </div>

            {/* Status */}
            <span className={`text-[11px] font-medium px-2 py-1 rounded-md shrink-0 ${statusStyle[order.status]}`}>
              {order.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}