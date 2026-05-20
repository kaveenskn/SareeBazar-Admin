"use client";

import { useState } from "react";
import {
  Store,
  Palette,
  CreditCard,
  Truck,
  Bell,
  Users,
  Upload,
  Sparkles,
  Plus,
} from "lucide-react";

const navigationItems = [
  { name: "Store", icon: Store },
  { name: "Theme", icon: Palette },
  { name: "Payment", icon: CreditCard },
  { name: "Shipping", icon: Truck },
  { name: "Notifications", icon: Bell },
  { name: "Admins & Roles", icon: Users },
];

const initialPaymentGateways = [
  { name: "Razorpay", description: "UPI, Cards, Net Banking, Wallets", active: true },
  { name: "Stripe", description: "International cards", active: true },
  { name: "PayPal", description: "Cross-border payments", active: false },
  { name: "Cash on Delivery", description: "Eligible pincodes only", active: true },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Payment");
  const [gateways, setGateways] = useState(initialPaymentGateways);

  const toggleGateway = (index: number) => {
    const newGateways = [...gateways];
    newGateways[index].active = !newGateways[index].active;
    setGateways(newGateways);
  };

  return (
    <div className="flex gap-6 max-w-6xl mx-auto h-[calc(100vh-14rem)] min-h-[500px]">
      {/* Left Sidebar */}
      <div className="w-64 bg-white rounded-3xl border border-gray-100 p-3 h-fit shrink-0 shadow-sm shadow-gray-100/50">
        <nav className="flex flex-col gap-1">
          {navigationItems.map((item) => {
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all w-full text-left ${
                  isActive
                    ? "bg-[#a1005b] text-white shadow-sm shadow-[#a1005b]/30"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon size={18} className={isActive ? "text-white" : "text-gray-500"} />
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white rounded-3xl border border-gray-100 p-8 flex flex-col shadow-sm shadow-gray-100/50 overflow-hidden h-full">
        {/* Scrollable Form Content inside the card */}
        <div className="flex-1 overflow-y-auto pr-4 -mr-4 pb-6">
          
          {activeTab === "Store" && (
            <>
              <h2 className="text-2xl font-serif text-gray-900">Store Information</h2>
              <p className="text-sm text-gray-500 mt-1">
                Public details shown to customers
              </p>

              <div className="grid grid-cols-2 gap-x-6 gap-y-6 mt-8">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 tracking-wider uppercase mb-2 block">
                    Store Name
                  </label>
                  <input
                    type="text"
                    defaultValue="Saanvi Saree Atelier"
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#a1005b]/20 focus:border-[#a1005b] transition-all"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 tracking-wider uppercase mb-2 block">
                    Support Email
                  </label>
                  <input
                    type="email"
                    defaultValue="hello@saanvi.in"
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#a1005b]/20 focus:border-[#a1005b] transition-all"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 tracking-wider uppercase mb-2 block">
                    Phone
                  </label>
                  <input
                    type="tel"
                    defaultValue="+91 98765 43210"
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#a1005b]/20 focus:border-[#a1005b] transition-all"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 tracking-wider uppercase mb-2 block">
                    GSTIN
                  </label>
                  <input
                    type="text"
                    defaultValue="27AABCS1234N1Z5"
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#a1005b]/20 focus:border-[#a1005b] transition-all"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] font-bold text-gray-500 tracking-wider uppercase mb-2 block">
                    Address
                  </label>
                  <textarea
                    defaultValue="3rd Floor, Linking Road, Bandra West, Mumbai 400050"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#a1005b]/20 focus:border-[#a1005b] transition-all resize-none"
                  />
                </div>
              </div>

              <div className="mt-8">
                <label className="text-[11px] font-bold text-gray-500 tracking-wider uppercase mb-2 block">
                  Logo
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#a1005b] to-[#be185d] text-white flex items-center justify-center shadow-md shadow-[#a1005b]/20">
                    <Sparkles size={32} />
                  </div>
                  <button className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    <Upload size={16} />
                    Replace Logo
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === "Payment" && (
            <>
              <h2 className="text-2xl font-serif text-gray-900">Payment Gateways</h2>
              
              <div className="flex flex-col gap-4 mt-8">
                {gateways.map((gw, idx) => (
                  <div 
                    key={gw.name} 
                    className="bg-[#fdf2f8] rounded-2xl p-5 flex items-center justify-between"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900">{gw.name}</span>
                      <span className="text-sm text-gray-500 mt-0.5">{gw.description}</span>
                    </div>
                    
                    {/* Toggle Switch */}
                    <button 
                      onClick={() => toggleGateway(idx)}
                      className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${
                        gw.active ? 'bg-[#a1005b]' : 'bg-white border border-gray-200'
                      }`}
                    >
                      <div 
                        className={`w-5 h-5 rounded-full absolute top-[1px] transition-transform ${
                          gw.active 
                            ? 'bg-white translate-x-6' 
                            : 'bg-gray-200 translate-x-[1px]'
                        }`} 
                      />
                    </button>
                  </div>
                ))}

                {/* Add new payment method button */}
                <button className="flex items-center justify-center gap-2 mt-2 py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 hover:text-[#a1005b] hover:border-[#a1005b] hover:bg-[#fdf2f8] transition-all font-medium text-sm">
                  <Plus size={18} />
                  Add New Payment Method
                </button>
              </div>
            </>
          )}
          
          {activeTab !== "Store" && activeTab !== "Payment" && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 py-20">
              <p>Configuration for {activeTab} coming soon.</p>
            </div>
          )}
        </div>

        {/* Bottom Actions (kept fixed at the bottom of the card container) */}
        <div className="pt-6 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-white">
          <button className="px-6 py-2.5 border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Discard
          </button>
          <button className="px-6 py-2.5 bg-[#a1005b] text-white rounded-full text-sm font-medium hover:opacity-90 shadow-sm shadow-[#a1005b]/30 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
