"use client";

import { useState, useEffect } from "react";
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
  CheckCircle,
  AlertCircle,
  Loader2,
  IndianRupee,
  Banknote,
  Info,
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

interface ShopInfo {
  storeName: string;
  supportEmail: string;
  phone: string;
  address: string;
  openingHours: string;
  tagline: string;
  description: string;
  socialLinks: {
    instagram: string;
    facebook: string;
    twitter: string;
    youtube: string;
  };
  shippingCosts: {
    cardPayment: number;
    cashOnDelivery: number;
  };
}

const defaultShopInfo: ShopInfo = {
  storeName: "",
  supportEmail: "",
  phone: "",
  address: "",
  openingHours: "",
  tagline: "",
  description: "",
  socialLinks: {
    instagram: "",
    facebook: "",
    twitter: "",
    youtube: "",
  },
  shippingCosts: {
    cardPayment: 0,
    cashOnDelivery: 0,
  },
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Store");
  const [gateways, setGateways] = useState(initialPaymentGateways);
  const [shopInfo, setShopInfo] = useState<ShopInfo>(defaultShopInfo);
  const [originalShopInfo, setOriginalShopInfo] = useState<ShopInfo>(defaultShopInfo);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Fetch shop info on mount
  useEffect(() => {
    fetchShopInfo();
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchShopInfo = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/backend/shop-info");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      const info: ShopInfo = {
        storeName: data.storeName || "",
        supportEmail: data.supportEmail || "",
        phone: data.phone || "",
        address: data.address || "",
        openingHours: data.openingHours || "",
        tagline: data.tagline || "",
        description: data.description || "",
        socialLinks: {
          instagram: data.socialLinks?.instagram || "",
          facebook: data.socialLinks?.facebook || "",
          twitter: data.socialLinks?.twitter || "",
          youtube: data.socialLinks?.youtube || "",
        },
        shippingCosts: {
          cardPayment: data.shippingCosts?.cardPayment ?? 0,
          cashOnDelivery: data.shippingCosts?.cashOnDelivery ?? 0,
        },
      };
      setShopInfo(info);
      setOriginalShopInfo(info);
    } catch (error) {
      console.error("Error fetching shop info:", error);
      setToast({ type: "error", message: "Failed to load shop info" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/backend/shop-info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(shopInfo),
      });
      if (!res.ok) throw new Error("Failed to save");
      const data = await res.json();
      const updated: ShopInfo = {
        storeName: data.shopInfo.storeName || "",
        supportEmail: data.shopInfo.supportEmail || "",
        phone: data.shopInfo.phone || "",
        address: data.shopInfo.address || "",
        openingHours: data.shopInfo.openingHours || "",
        tagline: data.shopInfo.tagline || "",
        description: data.shopInfo.description || "",
        socialLinks: {
          instagram: data.shopInfo.socialLinks?.instagram || "",
          facebook: data.shopInfo.socialLinks?.facebook || "",
          twitter: data.shopInfo.socialLinks?.twitter || "",
          youtube: data.shopInfo.socialLinks?.youtube || "",
        },
        shippingCosts: {
          cardPayment: data.shopInfo.shippingCosts?.cardPayment ?? 0,
          cashOnDelivery: data.shopInfo.shippingCosts?.cashOnDelivery ?? 0,
        },
      };
      setShopInfo(updated);
      setOriginalShopInfo(updated);
      setToast({ type: "success", message: "Shop info saved successfully!" });
    } catch (error) {
      console.error("Error saving shop info:", error);
      setToast({ type: "error", message: "Failed to save shop info" });
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setShopInfo({ ...originalShopInfo });
  };

  const hasChanges = JSON.stringify(shopInfo) !== JSON.stringify(originalShopInfo);

  const toggleGateway = (index: number) => {
    const newGateways = [...gateways];
    newGateways[index].active = !newGateways[index].active;
    setGateways(newGateways);
  };

  const updateField = (field: keyof ShopInfo, value: string) => {
    setShopInfo((prev) => ({ ...prev, [field]: value }));
  };

  const updateSocialLink = (platform: keyof ShopInfo["socialLinks"], value: string) => {
    setShopInfo((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value },
    }));
  };

  return (
    <div className="flex gap-6 max-w-6xl mx-auto h-[calc(100vh-14rem)] min-h-[500px] relative">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-lg border text-sm font-medium transition-all animate-[slideIn_0.3s_ease-out] ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle size={18} className="text-emerald-500" />
          ) : (
            <AlertCircle size={18} className="text-red-500" />
          )}
          {toast.message}
        </div>
      )}

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
                Public details shown to customers on the website
              </p>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 size={32} className="animate-spin text-[#a1005b]" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-6 mt-8">
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 tracking-wider uppercase mb-2 block">
                        Store Name
                      </label>
                      <input
                        type="text"
                        value={shopInfo.storeName}
                        onChange={(e) => updateField("storeName", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#a1005b]/20 focus:border-[#a1005b] transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 tracking-wider uppercase mb-2 block">
                        Support Email
                      </label>
                      <input
                        type="email"
                        value={shopInfo.supportEmail}
                        onChange={(e) => updateField("supportEmail", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#a1005b]/20 focus:border-[#a1005b] transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 tracking-wider uppercase mb-2 block">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={shopInfo.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#a1005b]/20 focus:border-[#a1005b] transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 tracking-wider uppercase mb-2 block">
                        Opening Hours
                      </label>
                      <input
                        type="text"
                        value={shopInfo.openingHours}
                        onChange={(e) => updateField("openingHours", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#a1005b]/20 focus:border-[#a1005b] transition-all"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[11px] font-bold text-gray-500 tracking-wider uppercase mb-2 block">
                        Address
                      </label>
                      <textarea
                        value={shopInfo.address}
                        onChange={(e) => updateField("address", e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#a1005b]/20 focus:border-[#a1005b] transition-all resize-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[11px] font-bold text-gray-500 tracking-wider uppercase mb-2 block">
                        Tagline
                      </label>
                      <input
                        type="text"
                        value={shopInfo.tagline}
                        onChange={(e) => updateField("tagline", e.target.value)}
                        placeholder={`e.g. "Elegance in every thread."`}
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#a1005b]/20 focus:border-[#a1005b] transition-all"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[11px] font-bold text-gray-500 tracking-wider uppercase mb-2 block">
                        Store Description
                      </label>
                      <textarea
                        value={shopInfo.description}
                        onChange={(e) => updateField("description", e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#a1005b]/20 focus:border-[#a1005b] transition-all resize-none"
                      />
                    </div>
                  </div>

                  {/* Social Links Section */}
                  <div className="mt-10">
                    <h3 className="text-lg font-serif text-gray-900 mb-1">Social Media Links</h3>
                    <p className="text-sm text-gray-500 mb-6">
                      Add your social media URLs to display on the website
                    </p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                      <div>
                        <label className="text-[11px] font-bold text-gray-500 tracking-wider uppercase mb-2 block">
                          Instagram
                        </label>
                        <input
                          type="url"
                          value={shopInfo.socialLinks.instagram}
                          onChange={(e) => updateSocialLink("instagram", e.target.value)}
                          placeholder="https://instagram.com/..."
                          className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#a1005b]/20 focus:border-[#a1005b] transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-gray-500 tracking-wider uppercase mb-2 block">
                          Facebook
                        </label>
                        <input
                          type="url"
                          value={shopInfo.socialLinks.facebook}
                          onChange={(e) => updateSocialLink("facebook", e.target.value)}
                          placeholder="https://facebook.com/..."
                          className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#a1005b]/20 focus:border-[#a1005b] transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-gray-500 tracking-wider uppercase mb-2 block">
                          Twitter / X
                        </label>
                        <input
                          type="url"
                          value={shopInfo.socialLinks.twitter}
                          onChange={(e) => updateSocialLink("twitter", e.target.value)}
                          placeholder="https://twitter.com/..."
                          className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#a1005b]/20 focus:border-[#a1005b] transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-gray-500 tracking-wider uppercase mb-2 block">
                          YouTube
                        </label>
                        <input
                          type="url"
                          value={shopInfo.socialLinks.youtube}
                          onChange={(e) => updateSocialLink("youtube", e.target.value)}
                          placeholder="https://youtube.com/..."
                          className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#a1005b]/20 focus:border-[#a1005b] transition-all"
                        />
                      </div>
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
          
          {activeTab === "Shipping" && (
            <>
              <h2 className="text-2xl font-serif text-gray-900">Shipping Costs</h2>
              <p className="text-sm text-gray-500 mt-1">
                Configure shipping charges based on payment method. These charges are applied <strong>once per order</strong>, regardless of the number of items.
              </p>

              {/* Info Banner */}
              <div className="mt-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <Info size={18} className="text-amber-600 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-800">
                  Shipping cost is a <strong>flat fee per order</strong>. Whether a customer orders 1 saree or 10 sarees, the same shipping charge applies. Set to <strong>0</strong> to offer free shipping for that payment method.
                </p>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 size={32} className="animate-spin text-[#a1005b]" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  {/* Card / Online Payment Shipping */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                        <CreditCard size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">Card / Online Payment</h3>
                        <p className="text-xs text-gray-500">Razorpay, Stripe, UPI, etc.</p>
                      </div>
                    </div>
                    <label className="text-[11px] font-bold text-gray-500 tracking-wider uppercase mb-2 block">
                      Shipping Charge (₹)
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <IndianRupee size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={shopInfo.shippingCosts.cardPayment}
                        onChange={(e) =>
                          setShopInfo((prev) => ({
                            ...prev,
                            shippingCosts: {
                              ...prev.shippingCosts,
                              cardPayment: Math.max(0, Number(e.target.value) || 0),
                            },
                          }))
                        }
                        className="w-full pl-9 pr-4 py-3 border border-blue-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300/40 focus:border-blue-400 transition-all bg-white"
                        placeholder="0"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Charged when customer pays via card or online</p>
                  </div>

                  {/* Cash on Delivery Shipping */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <Banknote size={20} className="text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">Cash on Delivery</h3>
                        <p className="text-xs text-gray-500">Customer pays at doorstep</p>
                      </div>
                    </div>
                    <label className="text-[11px] font-bold text-gray-500 tracking-wider uppercase mb-2 block">
                      Shipping Charge (₹)
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <IndianRupee size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={shopInfo.shippingCosts.cashOnDelivery}
                        onChange={(e) =>
                          setShopInfo((prev) => ({
                            ...prev,
                            shippingCosts: {
                              ...prev.shippingCosts,
                              cashOnDelivery: Math.max(0, Number(e.target.value) || 0),
                            },
                          }))
                        }
                        className="w-full pl-9 pr-4 py-3 border border-emerald-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-300/40 focus:border-emerald-400 transition-all bg-white"
                        placeholder="0"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Charged when customer opts for cash on delivery</p>
                  </div>
                </div>
              )}

              {/* Summary Preview */}
              {!loading && (
                <div className="mt-8 bg-gray-50 border border-gray-100 rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Preview — How it works</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Customer orders 1 saree via <strong>Card Payment</strong></span>
                      <span className="font-semibold text-gray-900">+ ₹{shopInfo.shippingCosts.cardPayment}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Customer orders 5 sarees via <strong>Card Payment</strong></span>
                      <span className="font-semibold text-gray-900">+ ₹{shopInfo.shippingCosts.cardPayment}</span>
                    </div>
                    <hr className="border-gray-200" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Customer orders 1 saree via <strong>COD</strong></span>
                      <span className="font-semibold text-gray-900">+ ₹{shopInfo.shippingCosts.cashOnDelivery}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Customer orders 5 sarees via <strong>COD</strong></span>
                      <span className="font-semibold text-gray-900">+ ₹{shopInfo.shippingCosts.cashOnDelivery}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab !== "Store" && activeTab !== "Payment" && activeTab !== "Shipping" && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 py-20">
              <p>Configuration for {activeTab} coming soon.</p>
            </div>
          )}
        </div>

        {/* Bottom Actions (kept fixed at the bottom of the card container) */}
        <div className="pt-6 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-white">
          <button
            onClick={handleDiscard}
            disabled={!hasChanges || saving}
            className={`px-6 py-2.5 border border-gray-200 rounded-full text-sm font-medium transition-colors ${
              hasChanges && !saving
                ? "text-gray-700 hover:bg-gray-50"
                : "text-gray-300 cursor-not-allowed"
            }`}
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              hasChanges && !saving
                ? "bg-[#a1005b] text-white hover:opacity-90 shadow-sm shadow-[#a1005b]/30"
                : "bg-[#a1005b]/40 text-white/60 cursor-not-allowed"
            }`}
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
