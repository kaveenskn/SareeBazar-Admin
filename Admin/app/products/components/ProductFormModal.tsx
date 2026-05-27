"use client";

import { useState, useEffect } from "react";
import { X, Upload, Plus, Trash2, ChevronDown, ImageIcon, Film } from "lucide-react";
import { Product, CATEGORIES, FABRICS, SIZES, BADGES } from "../types";

interface ProductFormModalProps {
  product?: Product | null;
  onClose: () => void;
  onSave: (product: Product) => void;
  nextId: number;
  saving?: boolean;
}

const emptyProduct: Omit<Product, "id"> = {
  name: "",
  image: "",
  images: [],
  price: 0,
  originalPrice: undefined,
  rating: 0,
  reviews: 0,
  category: "",
  badge: "",
  description: "",
  fabric: "",
  color: "",
  inStock: true,
  createdAt: new Date().toISOString().split("T")[0],
  stock: 0,
  sizes: [],
  discountPercent: undefined,
  isFeatured: false,
  isLatest: false,
  isTrending: false,
  specifications: {},
  tags: [],
  weight: "",
  dimensions: "",
};

function generateSlug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const BASIC_COLORS = [
  { name: "Alice Blue", hex: "#f0f8ff" }, { name: "Antique White", hex: "#faebd7" }, { name: "Aqua", hex: "#00ffff" },
  { name: "Aquamarine", hex: "#7fffd4" }, { name: "Azure", hex: "#f0ffff" }, { name: "Beige", hex: "#f5f5dc" },
  { name: "Bisque", hex: "#ffe4c4" }, { name: "Black", hex: "#000000" }, { name: "Blanched Almond", hex: "#ffebcd" },
  { name: "Blue", hex: "#0000ff" }, { name: "Blue Violet", hex: "#8a2be2" }, { name: "Brown", hex: "#a52a2a" },
  { name: "Burlywood", hex: "#deb887" }, { name: "Cadet Blue", hex: "#5f9ea0" }, { name: "Chartreuse", hex: "#7fff00" },
  { name: "Chocolate", hex: "#d2691e" }, { name: "Coral", hex: "#ff7f50" }, { name: "Cornflower Blue", hex: "#6495ed" },
  { name: "Cornsilk", hex: "#fff8dc" }, { name: "Crimson", hex: "#dc143c" }, { name: "Cyan", hex: "#00ffff" },
  { name: "Dark Blue", hex: "#00008b" }, { name: "Dark Cyan", hex: "#008b8b" }, { name: "Dark Goldenrod", hex: "#b8860b" },
  { name: "Dark Gray", hex: "#a9a9a9" }, { name: "Dark Green", hex: "#006400" }, { name: "Dark Khaki", hex: "#bdb76b" },
  { name: "Dark Magenta", hex: "#8b008b" }, { name: "Dark Olive Green", hex: "#556b2f" }, { name: "Dark Orange", hex: "#ff8c00" },
  { name: "Dark Orchid", hex: "#9932cc" }, { name: "Dark Red", hex: "#8b0000" }, { name: "Dark Salmon", hex: "#e9967a" },
  { name: "Dark Sea Green", hex: "#8fbc8f" }, { name: "Dark Slate Blue", hex: "#483d8b" }, { name: "Dark Slate Gray", hex: "#2f4f4f" },
  { name: "Dark Turquoise", hex: "#00ced1" }, { name: "Dark Violet", hex: "#9400d3" }, { name: "Deep Pink", hex: "#ff1493" },
  { name: "Deep Sky Blue", hex: "#00bfff" }, { name: "Dim Gray", hex: "#696969" }, { name: "Dodger Blue", hex: "#1e90ff" },
  { name: "Firebrick", hex: "#b22222" }, { name: "Floral White", hex: "#fffaf0" }, { name: "Forest Green", hex: "#228b22" },
  { name: "Fuchsia", hex: "#ff00ff" }, { name: "Gainsboro", hex: "#dcdcdc" }, { name: "Ghost White", hex: "#f8f8ff" },
  { name: "Gold", hex: "#ffd700" }, { name: "Goldenrod", hex: "#daa520" }, { name: "Gray", hex: "#808080" },
  { name: "Green", hex: "#008000" }, { name: "Green Yellow", hex: "#adff2f" }, { name: "Honeydew", hex: "#f0fff0" },
  { name: "Hot Pink", hex: "#ff69b4" }, { name: "Indian Red", hex: "#cd5c5c" }, { name: "Indigo", hex: "#4b0082" },
  { name: "Ivory", hex: "#fffff0" }, { name: "Khaki", hex: "#f0e68c" }, { name: "Lavender", hex: "#e6e6fa" },
  { name: "Lavender Blush", hex: "#fff0f5" }, { name: "Lawn Green", hex: "#7cfc00" }, { name: "Lemon Chiffon", hex: "#fffacd" },
  { name: "Light Blue", hex: "#add8e6" }, { name: "Light Coral", hex: "#f08080" }, { name: "Light Cyan", hex: "#e0ffff" },
  { name: "Light Goldenrod Yellow", hex: "#fafad2" }, { name: "Light Gray", hex: "#d3d3d3" }, { name: "Light Green", hex: "#90ee90" },
  { name: "Light Pink", hex: "#ffb6c1" }, { name: "Light Salmon", hex: "#ffa07a" }, { name: "Light Sea Green", hex: "#20b2aa" },
  { name: "Light Sky Blue", hex: "#87cefa" }, { name: "Light Slate Gray", hex: "#778899" }, { name: "Light Steel Blue", hex: "#b0c4de" },
  { name: "Light Yellow", hex: "#ffffe0" }, { name: "Lime", hex: "#00ff00" }, { name: "Lime Green", hex: "#32cd32" },
  { name: "Linen", hex: "#faf0e6" }, { name: "Magenta", hex: "#ff00ff" }, { name: "Maroon", hex: "#800000" },
  { name: "Medium Aquamarine", hex: "#66cdaa" }, { name: "Medium Blue", hex: "#0000cd" }, { name: "Medium Orchid", hex: "#ba55d3" },
  { name: "Medium Purple", hex: "#9370db" }, { name: "Medium Sea Green", hex: "#3cb371" }, { name: "Medium Slate Blue", hex: "#7b68ee" },
  { name: "Medium Spring Green", hex: "#00fa9a" }, { name: "Medium Turquoise", hex: "#48d1cc" }, { name: "Medium Violet Red", hex: "#c71585" },
  { name: "Midnight Blue", hex: "#191970" }, { name: "Mint Cream", hex: "#f5fffa" }, { name: "Misty Rose", hex: "#ffe4e1" },
  { name: "Moccasin", hex: "#ffe4b5" }, { name: "Navajo White", hex: "#ffdead" }, { name: "Navy", hex: "#000080" },
  { name: "Old Lace", hex: "#fdf5e6" }, { name: "Olive", hex: "#808000" }, { name: "Olive Drab", hex: "#6b8e23" },
  { name: "Orange", hex: "#ffa500" }, { name: "Orange Red", hex: "#ff4500" }, { name: "Orchid", hex: "#da70d6" },
  { name: "Pale Goldenrod", hex: "#eee8aa" }, { name: "Pale Green", hex: "#98fb98" }, { name: "Pale Turquoise", hex: "#afeeee" },
  { name: "Pale Violet Red", hex: "#db7093" }, { name: "Papaya Whip", hex: "#ffefd5" }, { name: "Peach Puff", hex: "#ffdab9" },
  { name: "Peru", hex: "#cd853f" }, { name: "Pink", hex: "#ffc0cb" }, { name: "Plum", hex: "#dda0dd" },
  { name: "Powder Blue", hex: "#b0e0e6" }, { name: "Purple", hex: "#800080" }, { name: "Rebecca Purple", hex: "#663399" },
  { name: "Red", hex: "#ff0000" }, { name: "Rosy Brown", hex: "#bc8f8f" }, { name: "Royal Blue", hex: "#4169e1" },
  { name: "Saddle Brown", hex: "#8b4513" }, { name: "Salmon", hex: "#fa8072" }, { name: "Sandy Brown", hex: "#f4a460" },
  { name: "Sea Green", hex: "#2e8b57" }, { name: "Sea Shell", hex: "#fff5ee" }, { name: "Sienna", hex: "#a0522d" },
  { name: "Silver", hex: "#c0c0c0" }, { name: "Sky Blue", hex: "#87ceeb" }, { name: "Slate Blue", hex: "#6a5acd" },
  { name: "Slate Gray", hex: "#708090" }, { name: "Snow", hex: "#fffafa" }, { name: "Spring Green", hex: "#00ff7f" },
  { name: "Steel Blue", hex: "#4682b4" }, { name: "Tan", hex: "#d2b48c" }, { name: "Teal", hex: "#008080" },
  { name: "Thistle", hex: "#d8bfd8" }, { name: "Tomato", hex: "#ff6347" }, { name: "Turquoise", hex: "#40e0d0" },
  { name: "Violet", hex: "#ee82ee" }, { name: "Wheat", hex: "#f5deb3" }, { name: "White", hex: "#ffffff" },
  { name: "White Smoke", hex: "#f5f5f5" }, { name: "Yellow", hex: "#ffff00" }, { name: "Yellow Green", hex: "#9acd32" }
];

function getNearestColorName(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "";
  const r = parseInt(result[1], 16), g = parseInt(result[2], 16), b = parseInt(result[3], 16);
  
  let minDist = Infinity;
  let nearestName = "";
  
  for (const color of BASIC_COLORS) {
    const cResult = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color.hex);
    if (!cResult) continue;
    const cr = parseInt(cResult[1], 16), cg = parseInt(cResult[2], 16), cb = parseInt(cResult[3], 16);
    
    const dist = Math.sqrt(Math.pow(r - cr, 2) + Math.pow(g - cg, 2) + Math.pow(b - cb, 2));
    if (dist < minDist) {
      minDist = dist;
      nearestName = color.name;
    }
  }
  return nearestName;
}

type FormErrors = Partial<Record<string, string>>;

export default function ProductFormModal({
  product,
  onClose,
  onSave,
  nextId,
  saving = false,
}: ProductFormModalProps) {
  const isEditing = !!product;
  const [form, setForm] = useState<Omit<Product, "id">>(
    product ? { ...product } : { ...emptyProduct }
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [activeTab, setActiveTab] = useState<"basic" | "media" | "details">("basic");
  const [specKey, setSpecKey] = useState("");
  const [specVal, setSpecVal] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [imageInput, setImageInput] = useState("");
  const [slotColors, setSlotColors] = useState(
    Array(4).fill({ hex: "#000000", name: "" })
  );

  const updateSlotColor = (index: number, key: "hex" | "name", value: string) => {
    setSlotColors((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      if (key === "hex") {
        next[index].name = getNearestColorName(value);
      }
      return next;
    });
  };

  useEffect(() => {
    if (product) setForm({ ...product });
  }, [product]);

  const updateField = <K extends keyof Omit<Product, "id">>(key: K, value: Omit<Product, "id">[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = "Product name is required";
    if (!form.category) e.category = "Category is required";
    if (form.price <= 0) e.price = "Price must be greater than 0";
    if ((form.stock ?? 0) < 0) e.stock = "Stock cannot be negative";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const saved: Product = {
      ...form,
      id: product?.id ?? nextId,
      slug: generateSlug(form.name),
      inStock: (form.stock ?? 0) > 0,
    };
    onSave(saved);
  };

  const addSpec = () => {
    if (!specKey.trim() || !specVal.trim()) return;
    updateField("specifications", { ...(form.specifications || {}), [specKey]: specVal });
    setSpecKey("");
    setSpecVal("");
  };

  const removeSpec = (key: string) => {
    const specs = { ...(form.specifications || {}) };
    delete specs[key];
    updateField("specifications", specs);
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    const tags = [...(form.tags || []), tagInput.trim().toLowerCase()];
    updateField("tags", [...new Set(tags)]);
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    updateField("tags", (form.tags || []).filter((t) => t !== tag));
  };

  const addImage = () => {
    if (!imageInput.trim()) return;
    updateField("images", [...(form.images || []), imageInput.trim()]);
    setImageInput("");
  };

  const removeImage = (idx: number) => {
    updateField("images", (form.images || []).filter((_, i) => i !== idx));
  };

  const toggleSize = (size: string) => {
    const current = form.sizes || [];
    if (current.includes(size)) {
      updateField("sizes", current.filter((s) => s !== size));
    } else {
      updateField("sizes", [...current, size]);
    }
  };

  const tabs = [
    { key: "basic" as const, label: "Basic Info" },
    { key: "media" as const, label: "Media" },
    { key: "details" as const, label: "Details" },
  ];

  const inputClass = (field?: string) =>
    `w-full px-4 py-2.5 bg-white border rounded-xl text-sm outline-none transition-all ${
      field && errors[field]
        ? "border-red-300 focus:ring-2 focus:ring-red-100 focus:border-red-400"
        : "border-gray-200 focus:ring-2 focus:ring-[#a1005b]/10 focus:border-[#a1005b]"
    }`;

  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 max-h-[92vh] flex flex-col animate-[scaleIn_0.2s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? "Edit Product" : "Add New Product"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 pt-4 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-[#a1005b] text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === "basic" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelClass}>Product Name *</label>
                  <input type="text" className={inputClass("name")} placeholder="e.g. Kanjivaram Silk Saree" value={form.name} onChange={(e) => updateField("name", e.target.value)} />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Category *</label>
                  <div className="relative">
                    <select className={`${inputClass("category")} appearance-none pr-10`} value={form.category} onChange={(e) => updateField("category", e.target.value)}>
                      <option value="">Select category</option>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
                </div>
                <div>
                  <label className={labelClass}>Fabric</label>
                  <div className="relative">
                    <select className={`${inputClass()} appearance-none pr-10`} value={form.fabric || ""} onChange={(e) => updateField("fabric", e.target.value)}>
                      <option value="">Select fabric</option>
                      {FABRICS.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Price ($) *</label>
                  <input type="number" className={inputClass("price")} placeholder="0" value={form.price || ""} onChange={(e) => updateField("price", Number(e.target.value))} />
                  {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
                </div>
                <div>
                  <label className={labelClass}>Original Price ($)</label>
                  <input type="number" className={inputClass()} placeholder="0" value={form.originalPrice || ""} onChange={(e) => updateField("originalPrice", Number(e.target.value) || undefined)} />
                </div>
                <div>
                  <label className={labelClass}>Stock *</label>
                  <input type="number" className={inputClass("stock")} placeholder="0" value={form.stock ?? ""} onChange={(e) => updateField("stock", Number(e.target.value))} />
                  {errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock}</p>}
                </div>
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <textarea className={`${inputClass()} min-h-[100px] resize-y`} placeholder="Describe the product..." rows={4} value={form.description || ""} onChange={(e) => updateField("description", e.target.value)} />
              </div>
            </>
          )}

          {activeTab === "media" && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Image URLs</h3>
                  <span className="text-xs font-medium text-[#a1005b] bg-[#fdf2f8] px-2 py-1 rounded-md">Min 2</span>
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                  {/* Image 1 */}
                  <div className="flex flex-col gap-2">
                    <label className="group aspect-square bg-gray-50 border border-dashed border-gray-200 rounded-xl overflow-hidden relative flex flex-col items-center justify-center p-2 text-center cursor-pointer hover:bg-gray-100 transition-colors">
                      {form.image ? (
                        <>
                          <img src={form.image} alt="Main" className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-300" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <Upload className="text-white" size={24} />
                          </div>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="text-gray-400 mb-1 z-10" size={20} />
                          <span className="text-xs text-gray-400 font-medium z-10">Main Image *</span>
                        </>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) updateField("image", URL.createObjectURL(e.target.files[0])); }} />
                    </label>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="flex items-center flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#a1005b]/10 focus-within:border-[#a1005b] transition-all">
                        <input type="text" className="w-full text-xs px-2 py-1.5 outline-none bg-transparent min-w-0" placeholder="Color Name" value={slotColors[0].name} onChange={(e) => updateSlotColor(0, "name", e.target.value)} />
                        <div className="shrink-0 pr-1.5 flex items-center">
                          <input type="color" className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent" value={slotColors[0].hex} onChange={(e) => updateSlotColor(0, "hex", e.target.value)} />
                        </div>
                      </div>
                      <button className="p-1.5 text-red-500 hover:bg-red-50 rounded-md shrink-0" onClick={() => updateField("image", "")}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Image 2 */}
                  <div className="flex flex-col gap-2">
                    <label className="group aspect-square bg-gray-50 border border-dashed border-gray-200 rounded-xl overflow-hidden relative flex flex-col items-center justify-center p-2 text-center cursor-pointer hover:bg-gray-100 transition-colors">
                      {form.images?.[0] ? (
                        <>
                          <img src={form.images[0]} alt="Image 2" className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-300" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <Upload className="text-white" size={24} />
                          </div>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="text-gray-400 mb-1 z-10" size={20} />
                          <span className="text-xs text-gray-400 font-medium z-10">Image 2 *</span>
                        </>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) { const newImages = [...(form.images || [])]; newImages[0] = URL.createObjectURL(e.target.files[0]); updateField("images", newImages); } }} />
                    </label>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="flex items-center flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#a1005b]/10 focus-within:border-[#a1005b] transition-all">
                        <input type="text" className="w-full text-xs px-2 py-1.5 outline-none bg-transparent min-w-0" placeholder="Color Name" value={slotColors[1].name} onChange={(e) => updateSlotColor(1, "name", e.target.value)} />
                        <div className="shrink-0 pr-1.5 flex items-center">
                          <input type="color" className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent" value={slotColors[1].hex} onChange={(e) => updateSlotColor(1, "hex", e.target.value)} />
                        </div>
                      </div>
                      <button className="p-1.5 text-red-500 hover:bg-red-50 rounded-md shrink-0" onClick={() => { const newImages = [...(form.images || [])]; newImages[0] = ""; updateField("images", newImages); }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Image 3 */}
                  <div className="flex flex-col gap-2">
                    <label className="group aspect-square bg-gray-50 border border-dashed border-gray-200 rounded-xl overflow-hidden relative flex flex-col items-center justify-center p-2 text-center cursor-pointer hover:bg-gray-100 transition-colors">
                      {form.images?.[1] ? (
                        <>
                          <img src={form.images[1]} alt="Image 3" className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-300" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <Upload className="text-white" size={24} />
                          </div>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="text-gray-400 mb-1 z-10" size={20} />
                          <span className="text-xs text-gray-400 font-medium z-10">Image 3</span>
                        </>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) { const newImages = [...(form.images || [])]; newImages[1] = URL.createObjectURL(e.target.files[0]); updateField("images", newImages); } }} />
                    </label>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="flex items-center flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#a1005b]/10 focus-within:border-[#a1005b] transition-all">
                        <input type="text" className="w-full text-xs px-2 py-1.5 outline-none bg-transparent min-w-0" placeholder="Color Name" value={slotColors[2].name} onChange={(e) => updateSlotColor(2, "name", e.target.value)} />
                        <div className="shrink-0 pr-1.5 flex items-center">
                          <input type="color" className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent" value={slotColors[2].hex} onChange={(e) => updateSlotColor(2, "hex", e.target.value)} />
                        </div>
                      </div>
                      <button className="p-1.5 text-red-500 hover:bg-red-50 rounded-md shrink-0" onClick={() => { const newImages = [...(form.images || [])]; newImages[1] = ""; updateField("images", newImages); }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Image 4 */}
                  <div className="flex flex-col gap-2">
                    <label className="group aspect-square bg-gray-50 border border-dashed border-gray-200 rounded-xl overflow-hidden relative flex flex-col items-center justify-center p-2 text-center cursor-pointer hover:bg-gray-100 transition-colors">
                      {form.images?.[2] ? (
                        <>
                          <img src={form.images[2]} alt="Image 4" className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-300" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <Upload className="text-white" size={24} />
                          </div>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="text-gray-400 mb-1 z-10" size={20} />
                          <span className="text-xs text-gray-400 font-medium z-10">Image 4</span>
                        </>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) { const newImages = [...(form.images || [])]; newImages[2] = URL.createObjectURL(e.target.files[0]); updateField("images", newImages); } }} />
                    </label>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="flex items-center flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#a1005b]/10 focus-within:border-[#a1005b] transition-all">
                        <input type="text" className="w-full text-xs px-2 py-1.5 outline-none bg-transparent min-w-0" placeholder="Color Name" value={slotColors[3].name} onChange={(e) => updateSlotColor(3, "name", e.target.value)} />
                        <div className="shrink-0 pr-1.5 flex items-center">
                          <input type="color" className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent" value={slotColors[3].hex} onChange={(e) => updateSlotColor(3, "hex", e.target.value)} />
                        </div>
                      </div>
                      <button className="p-1.5 text-red-500 hover:bg-red-50 rounded-md shrink-0" onClick={() => { const newImages = [...(form.images || [])]; newImages[2] = ""; updateField("images", newImages); }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Add Video (Optional)</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="group aspect-square bg-gray-50 border border-dashed border-gray-200 rounded-xl overflow-hidden relative flex flex-col items-center justify-center p-2 text-center cursor-pointer hover:bg-gray-100 transition-colors">
                      {form.video ? (
                        <>
                          <video src={form.video} className="w-full h-full object-cover absolute inset-0" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <Upload className="text-white" size={24} />
                          </div>
                        </>
                      ) : (
                        <>
                          <Film className="text-gray-400 mb-1 z-10" size={20} />
                          <span className="text-xs text-gray-400 font-medium z-10">Video</span>
                        </>
                      )}
                      <input type="file" accept="video/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) updateField("video", URL.createObjectURL(e.target.files[0])); }} />
                    </label>
                    <div className="flex justify-end mt-1">
                      <button className="p-1.5 text-red-500 hover:bg-red-50 rounded-md" onClick={() => updateField("video", "")}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "details" && (
            <>
              <div>
                <label className={labelClass}>Badge</label>
                <div className="relative">
                  <select className={`${inputClass()} appearance-none pr-10`} value={form.badge || ""} onChange={(e) => updateField("badge", e.target.value)}>
                    <option value="">None</option>
                    {BADGES.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Product Status</label>
                <div className="grid grid-cols-3 gap-3 mt-1">
                  {([
                    { key: "isFeatured" as const, label: "Featured", color: "amber" },
                    { key: "isLatest" as const, label: "Latest", color: "blue" },
                    { key: "isTrending" as const, label: "Trending", color: "purple" },
                  ] as const).map((status) => (
                    <button key={status.key} onClick={() => updateField(status.key, !form[status.key])} className={`p-3 rounded-xl border text-sm font-medium text-center transition-all ${form[status.key] ? `bg-${status.color}-50 border-${status.color}-200 text-${status.color}-700` : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"}`}
                      style={form[status.key] ? { backgroundColor: status.color === "amber" ? "#fffbeb" : status.color === "blue" ? "#eff6ff" : "#faf5ff", borderColor: status.color === "amber" ? "#fcd34d" : status.color === "blue" ? "#93c5fd" : "#c4b5fd", color: status.color === "amber" ? "#b45309" : status.color === "blue" ? "#1d4ed8" : "#7c3aed" } : {}}>
                      {form[status.key] ? "✓ " : ""}{status.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Rating</label>
                  <input type="number" className={inputClass()} placeholder="0-5" min="0" max="5" step="0.5" value={form.rating || ""} onChange={(e) => updateField("rating", Number(e.target.value))} />
                </div>
                <div>
                  <label className={labelClass}>Reviews Count</label>
                  <input type="number" className={inputClass()} placeholder="0" value={form.reviews || ""} onChange={(e) => updateField("reviews", Number(e.target.value))} />
                </div>
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50/50 shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving} className={`px-6 py-2.5 bg-[#a1005b] text-white rounded-xl text-sm font-medium hover:bg-[#800048] transition-colors shadow-sm shadow-[#a1005b]/20 ${saving ? 'opacity-60 cursor-not-allowed' : ''}`}>
            {saving ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
          </button>
        </div>
      </div>
    </div>
  );
}
