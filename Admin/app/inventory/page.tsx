"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  Search, Package, Boxes, AlertTriangle, TrendingDown,
  DollarSign, Loader2, ChevronLeft, ChevronRight, ChevronDown,
  Pencil, CheckSquare, Square, Layers, Box,
  ArrowUpDown, ArrowUp, ArrowDown, RefreshCw,
} from "lucide-react";
import { InventoryItem, InventoryStats, StockStatus } from "./types";
import { fetchInventory, fetchInventorySummary, updateStock, bulkUpdateStock } from "./api";
import StockUpdateModal from "./components/StockUpdateModal";
import BulkStockModal from "./components/BulkStockModal";

const ITEMS_PER_PAGE = 10;

/* ── Color Stock Dropdown for Inventory ── */
function InventoryColorDropdown({ item, stockBadgeFn }: { item: InventoryItem; stockBadgeFn: (stock: number) => React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hasVariants = item.colorVariants && item.colorVariants.length > 0;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!hasVariants) {
    return <>{stockBadgeFn(item.stock)}</>;
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 cursor-pointer group"
      >
        {stockBadgeFn(item.stock)}
        <ChevronDown
          size={14}
          className={`text-gray-400 group-hover:text-gray-600 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-30 bg-white border border-gray-200 rounded-xl shadow-lg p-3 min-w-[220px] animate-[scaleIn_0.15s_ease-out]">
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
            Stock by Color
          </div>
          <div className="space-y-1.5">
            {item.colorVariants!.map((cv) => (
              <div key={cv.name} className="flex items-center gap-2.5 px-1 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                <div
                  className="w-4 h-4 rounded-full border border-gray-200 shrink-0 shadow-sm"
                  style={{ backgroundColor: cv.hex }}
                />
                <span className="text-xs font-medium text-gray-700 flex-1 truncate">
                  {cv.name}
                </span>
                <span
                  className={`text-xs font-bold tabular-nums ${
                    cv.stock === 0
                      ? "text-red-500"
                      : cv.stock <= 5
                        ? "text-amber-600"
                        : "text-green-600"
                  }`}
                >
                  {cv.stock}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between px-1">
            <span className="text-[10px] text-gray-400 font-medium">Total</span>
            <span className="text-xs font-bold text-gray-900">{item.stock}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StockStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortField, setSortField] = useState("stock");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modals
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Inline editing
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [inlineEditValue, setInlineEditValue] = useState(0);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [inv, sum] = await Promise.all([fetchInventory(), fetchInventorySummary()]);
      setItems(inv);
      setStats(sum);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Client-side filtering & sorting
  const filtered = useMemo(() => {
    let result = [...items];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(s) || p.category.toLowerCase().includes(s));
    }
    if (statusFilter === "inStock") result = result.filter(p => p.stock > 10);
    else if (statusFilter === "lowStock") result = result.filter(p => p.stock > 0 && p.stock <= 10);
    else if (statusFilter === "outOfStock") result = result.filter(p => p.stock <= 0);
    if (categoryFilter) result = result.filter(p => p.category === categoryFilter);

    result.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortField === "name") return a.name.localeCompare(b.name) * dir;
      if (sortField === "price") return (a.price - b.price) * dir;
      if (sortField === "stock") return (a.stock - b.stock) * dir;
      if (sortField === "category") return a.category.localeCompare(b.category) * dir;
      return 0;
    });
    return result;
  }, [items, search, statusFilter, categoryFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const categories = [...new Set(items.map(p => p.category))];

  // Handlers
  const handleSingleUpdate = async (id: string, stock: number) => {
    try {
      setSaving(true);
      await updateStock(id, stock);
      await loadData();
      setEditingItem(null);
      setInlineEditId(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const handleBulkUpdate = async (updates: { id: string; stock: number }[]) => {
    try {
      setSaving(true);
      await bulkUpdateStock(updates);
      await loadData();
      setShowBulkModal(false);
      setSelectedIds(new Set());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to bulk update");
    } finally {
      setSaving(false);
    }
  };

  const handleInlineSave = async (id: string) => {
    await handleSingleUpdate(id, inlineEditValue);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginated.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(paginated.map(p => p._id)));
  };

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="text-gray-300" />;
    return sortDir === "asc" ? <ArrowUp size={14} className="text-[#a1005b]" /> : <ArrowDown size={14} className="text-[#a1005b]" />;
  };

  const stockBadge = (stock: number) => {
    if (stock === 0) return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-500">Out of Stock</span>;
    if (stock <= 10) return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600">Low ({stock})</span>;
    return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600">In Stock ({stock})</span>;
  };

  const summaryCards = stats ? [
    { label: "Total SKUs", value: stats.summary.totalProducts, icon: Boxes, color: "bg-[#fdf2f8] text-[#d93097]" },
    { label: "Total Units", value: stats.summary.totalStock.toLocaleString(), icon: Package, color: "bg-blue-50 text-blue-600" },
    { label: "Inventory Value", value: `$${stats.summary.totalValue.toLocaleString()}`, icon: DollarSign, color: "bg-emerald-50 text-emerald-600" },
    { label: "Low Stock", value: stats.summary.lowStock, icon: AlertTriangle, color: "bg-amber-50 text-amber-600" },
    { label: "Out of Stock", value: stats.summary.outOfStock, icon: TrendingDown, color: "bg-red-50 text-red-500" },
  ] : [];

  const statusTabs: { label: string; value: StockStatus; count: number }[] = stats ? [
    { label: "All", value: "all", count: stats.summary.totalProducts },
    { label: "In Stock", value: "inStock", count: stats.summary.inStock },
    { label: "Low Stock", value: "lowStock", count: stats.summary.lowStock },
    { label: "Out of Stock", value: "outOfStock", count: stats.summary.outOfStock },
  ] : [];

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between">
          <span className="text-sm text-red-600">{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 text-sm font-medium">Dismiss</button>
        </div>
      )}

      {/* Stats Row */}
      {stats && (
        <div className="flex gap-4">
          {summaryCards.map((card, i) => (
            <div key={i} className="flex-1 bg-white border border-gray-100 rounded-3xl p-5 flex items-center gap-4 shadow-sm shadow-gray-100/50">
              <div className={`w-12 h-12 rounded-full ${card.color} flex items-center justify-center shrink-0`}>
                <card.icon size={22} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 font-medium">{card.label}</span>
                <span className="text-2xl font-serif text-gray-900 mt-0.5">{card.value}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white border border-gray-100 rounded-full p-2 flex items-center justify-between shadow-sm shadow-gray-100/50">
        <div className="flex items-center pl-4 pr-2 w-[280px]">
          <Search size={18} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-3 pr-2 py-1.5 text-sm bg-transparent outline-none placeholder:text-gray-400"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto px-2 scrollbar-hide">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setStatusFilter(tab.value); setCurrentPage(1); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                statusFilter === tab.value
                  ? "bg-[#d93097] text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 pr-2">
          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors outline-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <button
            onClick={loadData}
            className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>

          {selectedIds.size > 0 && (
            <button
              onClick={() => setShowBulkModal(true)}
              className="flex items-center gap-2 px-4 py-1.5 bg-[#a1005b] hover:bg-[#800048] text-white rounded-full text-sm font-medium transition-colors shadow-sm shadow-[#a1005b]/20"
            >
              <Layers size={16} />
              Bulk Update ({selectedIds.size})
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-[#d93097]" />
          <span className="ml-3 text-gray-500">Loading inventory...</span>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm shadow-gray-100/50">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fafafc] border-b border-gray-100">
                <th className="py-4 px-4 w-12">
                  <button onClick={toggleSelectAll} className="text-gray-400 hover:text-[#a1005b] transition-colors">
                    {selectedIds.size === paginated.length && paginated.length > 0
                      ? <CheckSquare size={18} className="text-[#a1005b]" />
                      : <Square size={18} />}
                  </button>
                </th>
                <th className="py-4 px-4">
                  <button onClick={() => handleSort("name")} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700">
                    Product <SortIcon field="name" />
                  </button>
                </th>
                <th className="py-4 px-4">
                  <button onClick={() => handleSort("category")} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700">
                    Category <SortIcon field="category" />
                  </button>
                </th>
                <th className="py-4 px-4">
                  <button onClick={() => handleSort("price")} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700">
                    Price <SortIcon field="price" />
                  </button>
                </th>
                <th className="py-4 px-4">
                  <button onClick={() => handleSort("stock")} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700">
                    Stock <SortIcon field="stock" />
                  </button>
                </th>
                <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((item, idx) => (
                <tr
                  key={item._id}
                  className={`hover:bg-gray-50/50 transition-colors ${idx !== paginated.length - 1 ? "border-b border-gray-50" : ""} ${selectedIds.has(item._id) ? "bg-[#fdf2f8]/50" : ""}`}
                >
                  <td className="py-4 px-4">
                    <button onClick={() => toggleSelect(item._id)} className="text-gray-400 hover:text-[#a1005b] transition-colors">
                      {selectedIds.has(item._id)
                        ? <CheckSquare size={18} className="text-[#a1005b]" />
                        : <Square size={18} />}
                    </button>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden shrink-0 border border-gray-100">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={18} /></div>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-900 truncate max-w-[180px]">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-600">{item.category}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm font-semibold text-gray-900">${item.price}</span>
                  </td>
                  <td className="py-4 px-4">
                    {inlineEditId === item._id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={0}
                          value={inlineEditValue}
                          onChange={(e) => setInlineEditValue(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-16 text-center text-sm font-semibold border border-[#a1005b] rounded-lg py-1 outline-none bg-white"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleInlineSave(item._id);
                            if (e.key === "Escape") setInlineEditId(null);
                          }}
                        />
                        <button
                          onClick={() => handleInlineSave(item._id)}
                          disabled={saving}
                          className="text-xs px-2 py-1 bg-[#a1005b] text-white rounded-lg hover:bg-[#800048] transition-colors disabled:opacity-50"
                        >
                          {saving ? "..." : "✓"}
                        </button>
                        <button
                          onClick={() => setInlineEditId(null)}
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setInlineEditId(item._id); setInlineEditValue(item.stock); }}
                        className="text-sm font-semibold text-gray-900 hover:text-[#a1005b] cursor-pointer transition-colors underline decoration-dashed underline-offset-4 decoration-gray-300 hover:decoration-[#a1005b]"
                        title="Click to edit inline"
                      >
                        {item.stock}
                      </button>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <InventoryColorDropdown item={item} stockBadgeFn={stockBadge} />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#d93097] hover:bg-[#fdf2f8] transition-colors"
                        title="Update Stock"
                      >
                        <Pencil size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <Box size={40} strokeWidth={1.5} />
                      <span className="text-sm">No inventory items found</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Category Breakdown */}
      {!loading && stats && stats.categoryBreakdown.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm shadow-gray-100/50">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Stock by Category</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {stats.categoryBreakdown.map((cat) => {
              const maxStock = Math.max(...stats.categoryBreakdown.map(c => c.totalStock), 1);
              const pct = (cat.totalStock / maxStock) * 100;
              return (
                <div key={cat._id} className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700 truncate">{cat._id}</span>
                    <span className="text-xs text-gray-500">{cat.count} items</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">{cat.totalStock}</div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div className="bg-[#d93097] h-1.5 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">${cat.value.toLocaleString()} value</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-6 py-4 shadow-sm shadow-gray-100/50">
          <span className="text-sm text-gray-500">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-9 h-9 rounded-lg flex items-center justify-center border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => setCurrentPage(page)} className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${page === currentPage ? "bg-[#a1005b] text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                {page}
              </button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-9 h-9 rounded-lg flex items-center justify-center border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {editingItem && (
        <StockUpdateModal
          product={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleSingleUpdate}
          saving={saving}
        />
      )}
      {showBulkModal && (
        <BulkStockModal
          products={items.filter(p => selectedIds.has(p._id))}
          onClose={() => setShowBulkModal(false)}
          onSave={handleBulkUpdate}
          saving={saving}
        />
      )}
    </div>
  );
}
