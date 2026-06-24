"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Loader2 } from "lucide-react";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const isAuthRoute = pathname === "/login";
    
    if (!token && !isAuthRoute) {
      router.push("/login");
    } else if (token && isAuthRoute) {
      router.push("/");
    } else {
      setIsChecking(false);
    }
  }, [pathname, router]);

  if (isChecking) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#fdf2f8]">
        <Loader2 className="h-8 w-8 animate-spin text-[#d93097]" />
      </div>
    );
  }

  const isAuthRoute = pathname === "/login";
  if (isAuthRoute) {
    return <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>;
  }

  return (
    <>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <Topbar />
        <main className="flex-1 min-h-0 overflow-y-auto p-8">{children}</main>
      </div>
    </>
  );
}
