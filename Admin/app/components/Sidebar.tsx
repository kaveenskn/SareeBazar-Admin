"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  Box,
  Users,
  Star,
  Tag,
  BarChart,
  Boxes,
  Wallet,
  Settings,
  Sparkles
} from "lucide-react";

export default function Sidebar() {
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

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/" },
    { name: "Products", icon: ShoppingBag, href: "/products" },
    { name: "Collections", icon: Layers, href: "/collections" },
    { name: "Orders", icon: Box, href: "/orders" },
    { name: "Customers", icon: Users, href: "/customers" },
    { name: "Reviews", icon: Star, href: "/reviews" },
    { name: "Offers & Promotions", icon: Tag, href: "/offers" },
    { name: "Inventory", icon: Boxes, href: "/inventory" },
    { name: "Settings", icon: Settings, href: "/settings" },
  ];

  return (
    <aside className="w-64 flex flex-col h-screen border-r border-gray-100 bg-white sticky top-0">
      {/* Logo Section */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-[#a1005b] rounded-full flex items-center justify-center text-white shrink-0">
          <Sparkles size={20} />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-xl text-[#a1005b] leading-none">{storeName}</span>
          <span className="text-[10px] text-gray-500 tracking-wider font-semibold mt-1">SAREE ATELIER</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                  ? "bg-[#a1005b] text-white font-medium shadow-md shadow-[#a1005b]/20"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
            >
              <item.icon size={20} className={isActive ? "text-white" : "text-gray-400"} />
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
