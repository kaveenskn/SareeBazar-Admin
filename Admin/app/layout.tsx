import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SareeBazar Admin",
  description: "Admin panel for SareeBazar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-screen flex bg-[#fdf2f8] text-gray-900 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <Topbar />
          <main className="flex-1 min-h-0 overflow-y-auto p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
