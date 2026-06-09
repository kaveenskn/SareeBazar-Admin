"use client";

import { usePathname } from "next/navigation";
import { Search, Plus, MessageSquare, Bell } from "lucide-react";
import { useState, useEffect } from "react";

export default function Topbar() {
  const pathname = usePathname();
  const [storeName, setStoreName] = useState("SareeBazar");

  useEffect(() => {
    fetch("/api/backend/shop-info")
      .then(res => res.json())
      .then(data => {
        if (data && data.storeName) {
          setStoreName(data.storeName);
        }
      })
      .catch(err => console.error("Error fetching shop info:", err));
  }, []);

  const getPageInfo = () => {
    if (pathname === "/orders")
      return {
        title: "Orders",
        subtitle: `Track every saree from ${storeName} to doorstep.`,
      };
    if (pathname?.startsWith("/products"))
      return {
        title: "Products",
        subtitle: "Manage your saree catalog and inventory.",
      };
    if (pathname?.startsWith("/reviews"))
      return {
        title: "Reviews & Feedback",
        subtitle: "Curate the voice of your customers.",
      };
    if (pathname?.startsWith("/customers"))
      return {
        title: "Customers",
        subtitle: "The women who wear your craft.",
      };
    if (pathname?.startsWith("/settings"))
      return {
        title: "Settings",
        subtitle: "Manage your store preferences and configurations.",
      };
    return {
      title: "Good morning, Admin",
      subtitle: `Here's what's weaving today at ${storeName}.`,
    };
  };

  const { title, subtitle } = getPageInfo();

  return (
    <header className="h-24 px-8 flex items-center justify-between bg-[#ffffff] border-b border-gray-100">
      {/* Welcome Message */}
      <div className="flex flex-col">
        <h1 className="text-2xl font-serif text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search sarees, orders, custom"
            className="w-80 pl-10 pr-12 py-2.5 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#a1005b]/20 focus:border-[#a1005b] transition-all shadow-sm"
          />
          <div className="absolute right-3 px-1.5 py-0.5 bg-gray-100 rounded text-[10px] text-gray-500 font-medium">
            ⌘K
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#a1005b] hover:bg-[#800048] text-white rounded-full text-sm font-medium transition-colors shadow-sm shadow-[#a1005b]/20">
            <Plus size={18} />
            New Product
          </button>

          <button className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors">
            <MessageSquare size={18} />
          </button>

          <button className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors relative">
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#a1005b] rounded-full border-2 border-white"></span>
          </button>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2">
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold text-gray-900">
              Store Admin
            </span>
            <span className="text-[11px] text-gray-500">{storeName}</span>
          </div>
          <div className="w-10 h-10 bg-[#d93097] text-white rounded-full flex items-center justify-center font-serif text-lg">
            {storeName.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
}
