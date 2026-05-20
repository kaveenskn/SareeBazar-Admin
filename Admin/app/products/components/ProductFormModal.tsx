"use client";

import { useState, useEffect } from "react";
import { X, Upload, Plus, Trash2, ChevronDown } from "lucide-react";
import { Product, CATEGORIES, FABRICS, SIZES, BADGES } from "../types";

interface ProductFormModalProps {
  product?: Product | null;
  onClose: () => void;
  onSave: (product: Product) => void;
  nextId: number;
}

const emptyProduct: Omit<Product, "id"> = {
  name: "",
  slug: "",
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
  sku: "",
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

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

type FormErrors = Partial<Record<string, string>>;

export default function ProductFormModal({
  product,
  onClose,
  onSave,
  nextId,
}: ProductFormModalProps) {
  const isEditing = !!product;
  const [form, setForm] = useState<Omit<Product, "id">>(
    product ? { ...product } : { ...emptyProduct }
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [activeTab, setActiveTab] = useState<"basic" | "media" | "details" | "seo">("basic");
  const [specKey, setSpecKey] = useState("");
  const [specVal, setSpecVal] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [imageInput, setImageInput] = useState("");

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
    const slug = form.slug || slugify(form.name);
    const saved: Product = {
      ...form,
      id: product?.id ?? nextId,
      slug,
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
    { key: "seo" as const, label: "Tags & Specs" },
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
                  <input type="text" className={inputClass("name")} placeholder="e.g. Kanjivaram Silk Saree" value={form.name} onChange={(e) => { updateField("name", e.target.value); if (!isEditing) updateField("slug", slugify(e.target.value)); }} />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className={labelClass}>SKU</label>
                  <input type="text" className={inputClass()} placeholder="SB-XX-000" value={form.sku || ""} onChange={(e) => updateField("sku", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Slug</label>
                  <input type="text" className={inputClass()} placeholder="auto-generated" value={form.slug} onChange={(e) => updateField("slug", e.target.value)} />
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
                <label className={labelClass}>Color</label>
                <input type="text" className={inputClass()} placeholder="e.g. Gold, Red, Emerald Green" value={form.color || ""} onChange={(e) => updateField("color", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea className={`${inputClass()} min-h-[100px] resize-y`} placeholder="Describe the product..." rows={4} value={form.description || ""} onChange={(e) => updateField("description", e.target.value)} />
              </div>
            </>
          )}

          {activeTab === "media" && (
            <>
              <div>
                <label className={labelClass}>Main Image URL</label>
                <input type="text" className={inputClass()} placeholder="https://... or /images/..." value={form.image} onChange={(e) => updateField("image", e.target.value)} />
                {form.image && (
                  <div className="mt-3 w-32 h-32 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                    <img src={form.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  </div>
                )}
              </div>
              <div>
                <label className={labelClass}>Additional Images</label>
                <div className="flex gap-2">
                  <input type="text" className={`${inputClass()} flex-1`} placeholder="Image URL" value={imageInput} onChange={(e) => setImageInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImage())} />
                  <button onClick={addImage} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors shrink-0">
                    <Plus size={16} />
                  </button>
                </div>
                {(form.images || []).length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {(form.images || []).map((img, i) => (
                      <div key={i} className="relative group aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                        <img src={img} alt={`Image ${i + 1}`} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        <button onClick={() => removeImage(i)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className={labelClass}>Video URL</label>
                <input type="text" className={inputClass()} placeholder="https://... or /videos/..." value={form.video || ""} onChange={(e) => updateField("video", e.target.value)} />
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <div className="flex flex-col items-center gap-2 text-gray-400 py-4">
                  <Upload size={32} strokeWidth={1.5} />
                  <span className="text-sm">Drag & drop images here or use URLs above</span>
                  <span className="text-xs text-gray-300">File upload requires backend integration</span>
                </div>
              </div>
            </>
          )}

          {activeTab === "details" && (
            <>
              <div className="grid grid-cols-3 gap-4">
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
                  <label className={labelClass}>Weight</label>
                  <input type="text" className={inputClass()} placeholder="e.g. 650g" value={form.weight || ""} onChange={(e) => updateField("weight", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Dimensions</label>
                  <input type="text" className={inputClass()} placeholder="L x W x H cm" value={form.dimensions || ""} onChange={(e) => updateField("dimensions", e.target.value)} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Available Sizes</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {SIZES.map((size) => (
                    <button key={size} onClick={() => toggleSize(size)} className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${(form.sizes || []).includes(size) ? "bg-[#a1005b] text-white border-[#a1005b]" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}>
                      {size}
                    </button>
                  ))}
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

          {activeTab === "seo" && (
            <>
              <div>
                <label className={labelClass}>Tags</label>
                <div className="flex gap-2">
                  <input type="text" className={`${inputClass()} flex-1`} placeholder="Add a tag" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} />
                  <button onClick={addTag} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors shrink-0">
                    <Plus size={16} />
                  </button>
                </div>
                {(form.tags || []).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {(form.tags || []).map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                        #{tag}
                        <button onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className={labelClass}>Specifications</label>
                <div className="flex gap-2">
                  <input type="text" className={`${inputClass()} flex-1`} placeholder="Key (e.g. Wash Care)" value={specKey} onChange={(e) => setSpecKey(e.target.value)} />
                  <input type="text" className={`${inputClass()} flex-1`} placeholder="Value (e.g. Dry Clean)" value={specVal} onChange={(e) => setSpecVal(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSpec())} />
                  <button onClick={addSpec} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors shrink-0">
                    <Plus size={16} />
                  </button>
                </div>
                {form.specifications && Object.keys(form.specifications).length > 0 && (
                  <div className="mt-3 border border-gray-100 rounded-xl overflow-hidden">
                    {Object.entries(form.specifications).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between px-4 py-2.5 text-sm border-b border-gray-50 last:border-b-0 hover:bg-gray-50">
                        <div>
                          <span className="text-gray-500">{key}: </span>
                          <span className="font-medium text-gray-900">{val}</span>
                        </div>
                        <button onClick={() => removeSpec(key)} className="text-gray-300 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50/50 shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-6 py-2.5 bg-[#a1005b] text-white rounded-xl text-sm font-medium hover:bg-[#800048] transition-colors shadow-sm shadow-[#a1005b]/20">
            {isEditing ? "Update Product" : "Create Product"}
          </button>
        </div>
      </div>
    </div>
  );
}
