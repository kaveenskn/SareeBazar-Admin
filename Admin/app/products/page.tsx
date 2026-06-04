"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Download,
  Plus,
  LayoutGrid,
  List,
  Eye,
  Pencil,
  Trash2,
  Star,
  Package,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Clock,
  Box,
  Loader2,
} from "lucide-react";
import { Product, ViewMode, ProductFilters as Filters, CATEGORIES } from "./types";
import ProductFormModal from "./components/ProductFormModal";
import ProductViewModal from "./components/ProductViewModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import { fetchProducts, createProduct, updateProduct, deleteProduct, ApiProduct, fetchCollections, ApiCollection } from "./api";

const ITEMS_PER_PAGE = 8;

/* ── Map API response to frontend Product type ── */
function mapApiToProduct(api: ApiProduct): Product {
  return {
    id: api._id as unknown as number, // We use _id as string identifier
    _id: api._id,
    name: api.name,
    slug: api.slug,
    image: api.image,
    images: api.images,
    video: api.video,
    price: api.price,
    originalPrice: api.originalPrice ?? undefined,
    rating: api.rating,
    reviews: api.reviews,
    category: api.category,
    badge: api.badge || undefined,
    description: api.description,
    fabric: api.fabric,
    color: api.color,
    colorVariants: api.colorVariants,
    inStock: api.inStock,
    stock: api.stock,
    sizes: api.sizes,
    discountPercent: api.discountPercent ?? undefined,
    isFeatured: api.isFeatured,
    isLatest: api.isLatest,
    isTrending: api.isTrending,
    specifications: api.specifications
      ? Object.fromEntries(Object.entries(api.specifications))
      : {},
    tags: api.tags,
    weight: api.weight,
    dimensions: api.dimensions,
    createdAt: api.createdAt,
  };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<ApiCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [filters, setFilters] = useState<Filters>({
    search: "",
    category: "",
    stockStatus: "all",
    badge: "",
    sortField: "createdAt",
    sortDirection: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [activeFilterTab, setActiveFilterTab] = useState("All");

  /* ── Load products and collections from backend ── */
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [apiProducts, apiCollections] = await Promise.all([
        fetchProducts(),
        fetchCollections()
      ]);
      setProducts(apiProducts.map(mapApiToProduct));
      setCollections(apiCollections);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load data";
      setError(message);
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Stats
  const stats = useMemo(() => {
    const total = products.length;
    const inStock = products.filter((p) => p.inStock && (p.stock ?? 0) > 0).length;
    const outOfStock = products.filter((p) => !p.inStock || (p.stock ?? 0) === 0).length;
    const lowStock = products.filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 10).length;
    const featured = products.filter((p) => p.isFeatured).length;
    return [
      { label: "Total Products", value: total.toString(), icon: ShoppingBag },
      { label: "In Stock", value: inStock.toString(), icon: Package },
      { label: "Low Stock", value: lowStock.toString(), icon: AlertTriangle },
      { label: "Out of Stock", value: outOfStock.toString(), icon: Box },
      { label: "Featured", value: featured.toString(), icon: Sparkles },
    ];
  }, [products]);

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category tab filter
    if (activeFilterTab !== "All") {
      result = result.filter((p) => p.category === activeFilterTab);
    }

    // Search
    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          p.category.toLowerCase().includes(s) ||
          p.fabric?.toLowerCase().includes(s)
      );
    }

    // Category dropdown
    if (filters.category) {
      result = result.filter((p) => p.category === filters.category);
    }

    // Stock status
    if (filters.stockStatus === "inStock") result = result.filter((p) => (p.stock ?? 0) > 10);
    else if (filters.stockStatus === "lowStock") result = result.filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 10);
    else if (filters.stockStatus === "outOfStock") result = result.filter((p) => !p.inStock || (p.stock ?? 0) === 0);

    // Sort
    result.sort((a, b) => {
      const dir = filters.sortDirection === "asc" ? 1 : -1;
      switch (filters.sortField) {
        case "name": return a.name.localeCompare(b.name) * dir;
        case "price": return (a.price - b.price) * dir;
        case "stock": return ((a.stock ?? 0) - (b.stock ?? 0)) * dir;
        case "rating": return (a.rating - b.rating) * dir;
        case "createdAt": return ((a.createdAt || "").localeCompare(b.createdAt || "")) * dir;
        default: return 0;
      }
    });

    return result;
  }, [products, filters, activeFilterTab]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Actions — connected to backend
  const handleSave = async (product: Product) => {
    try {
      setSaving(true);
      setError(null);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, _id, ...productData } = product as Product & { _id?: string };

      if (editingProduct && (editingProduct as Product & { _id?: string })._id) {
        // Update existing product
        await updateProduct(
          (editingProduct as Product & { _id?: string })._id!,
          productData as unknown as Record<string, unknown>
        );
      } else {
        // Create new product
        await createProduct(productData as unknown as Record<string, unknown>);
      }

      // Reload products from backend
      await loadProducts();
      setShowFormModal(false);
      setEditingProduct(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save product";
      setError(message);
      console.error("Failed to save product:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    try {
      setSaving(true);
      setError(null);
      const _id = (deletingProduct as Product & { _id?: string })._id;
      if (_id) {
        await deleteProduct(_id);
      }
      await loadProducts();
      setDeletingProduct(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete product";
      setError(message);
      console.error("Failed to delete product:", err);
    } finally {
      setSaving(false);
    }
  };

  const openAdd = () => { setEditingProduct(null); setShowFormModal(true); };
  const openEdit = (p: Product) => { setEditingProduct(p); setShowFormModal(true); };
  const nextId = Math.max(...products.map((p) => (typeof p.id === "number" ? p.id : 0)), 0) + 1;

  const categoryTabs = ["All", ...collections.map(c => c.title)];

  const stockBadge = (product: Product) => {
    const stock = product.stock ?? 0;
    if (stock === 0) return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-500">Out of Stock</span>;
    if (stock <= 10) return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600">Low ({stock})</span>;
    return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600">In Stock ({stock})</span>;
  };

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
      <div className="flex gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="flex-1 bg-white border border-gray-100 rounded-3xl p-5 flex items-center gap-4 shadow-sm shadow-gray-100/50">
            <div className="w-12 h-12 rounded-full bg-[#fdf2f8] text-[#d93097] flex items-center justify-center shrink-0">
              <stat.icon size={22} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 font-medium">{stat.label}</span>
              <span className="text-2xl font-serif text-gray-900 mt-0.5">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-gray-100 rounded-full p-2 flex items-center justify-between shadow-sm shadow-gray-100/50 mt-2">
        <div className="flex items-center pl-4 pr-2 w-[300px]">
          <Search size={18} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search products, SKU, fabric..."
            className="w-full pl-3 pr-2 py-1.5 text-sm bg-transparent outline-none placeholder:text-gray-400"
            value={filters.search}
            onChange={(e) => { setFilters((f) => ({ ...f, search: e.target.value })); setCurrentPage(1); }}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto px-2 scrollbar-hide">
          {categoryTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveFilterTab(tab); setCurrentPage(1); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                activeFilterTab === tab
                  ? "bg-[#d93097] text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 pr-2">
          <button
            onClick={() => setViewMode(viewMode === "table" ? "grid" : "table")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            {viewMode === "table" ? <LayoutGrid size={16} /> : <List size={16} />}
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-1.5 bg-[#a1005b] hover:bg-[#800048] text-white rounded-full text-sm font-medium transition-colors shadow-sm shadow-[#a1005b]/20">
            <Plus size={16} />
            Add Product
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-[#d93097]" />
          <span className="ml-3 text-gray-500">Loading products...</span>
        </div>
      )}

      {/* Table View */}
      {!loading && viewMode === "table" && (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm shadow-gray-100/50 mt-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fafafc] border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product, idx) => (
                <tr key={(product as Product & { _id?: string })._id || product.id} className={`hover:bg-gray-50/50 transition-colors ${idx !== paginatedProducts.length - 1 ? "border-b border-gray-50" : ""}`}>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden shrink-0 border border-gray-100">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={20} /></div>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{product.name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-600">{product.category}</span>
                    {product.badge && (
                      <span className="ml-2 px-2 py-0.5 bg-[#fdf2f8] text-[#d93097] text-[10px] font-medium rounded-full">{product.badge}</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-xs text-gray-400 line-through">${product.originalPrice}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">{stockBadge(product)}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-amber-400 fill-amber-400" />
                      <span className="text-sm text-gray-700">{product.rating}</span>
                      <span className="text-xs text-gray-400">({product.reviews})</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5">
                      {product.isFeatured && <span className="w-2 h-2 rounded-full bg-amber-400" title="Featured" />}
                      {product.isTrending && <span className="w-2 h-2 rounded-full bg-purple-500" title="Trending" />}
                      {product.isLatest && <span className="w-2 h-2 rounded-full bg-blue-500" title="Latest" />}
                      {!product.isFeatured && !product.isTrending && !product.isLatest && <span className="text-xs text-gray-300">—</span>}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setViewingProduct(product)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#d93097] hover:bg-[#fdf2f8] transition-colors" title="View">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => openEdit(product)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => setDeletingProduct(product)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <Package size={40} strokeWidth={1.5} />
                      <span className="text-sm">No products found</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Grid View */}
      {!loading && viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
          {paginatedProducts.map((product) => (
            <div key={(product as Product & { _id?: string })._id || product.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm shadow-gray-100/50 group hover:shadow-md transition-shadow">
              <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={40} strokeWidth={1.5} /></div>
                )}
                {product.badge && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#d93097] text-white text-xs font-medium rounded-full shadow-sm">{product.badge}</span>
                )}
                <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setViewingProduct(product)} className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-600 hover:text-[#d93097] shadow-sm transition-colors"><Eye size={14} /></button>
                  <button onClick={() => openEdit(product)} className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-600 hover:text-blue-600 shadow-sm transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => setDeletingProduct(product)} className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-600 hover:text-red-500 shadow-sm transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  {stockBadge(product)}
                </div>
                <h3 className="text-sm font-semibold text-gray-900 truncate mt-1">{product.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{product.category} · {product.fabric || "—"}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold text-gray-900">${product.price}</span>
                    {product.originalPrice && <span className="text-xs text-gray-400 line-through">${product.originalPrice}</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs text-gray-600">{product.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {paginatedProducts.length === 0 && (
            <div className="col-span-full py-16 text-center">
              <div className="flex flex-col items-center gap-3 text-gray-400">
                <Package size={40} strokeWidth={1.5} />
                <span className="text-sm">No products found</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-6 py-4 shadow-sm shadow-gray-100/50">
          <span className="text-sm text-gray-500">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} products
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-9 h-9 rounded-lg flex items-center justify-center border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button key={page} onClick={() => setCurrentPage(page)} className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${page === currentPage ? "bg-[#a1005b] text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                {page}
              </button>
            ))}
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-9 h-9 rounded-lg flex items-center justify-center border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showFormModal && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => { setShowFormModal(false); setEditingProduct(null); }}
          onSave={handleSave}
          nextId={nextId}
          saving={saving}
        />
      )}
      {viewingProduct && (
        <ProductViewModal
          product={viewingProduct}
          onClose={() => setViewingProduct(null)}
          onEdit={() => { openEdit(viewingProduct); setViewingProduct(null); }}
        />
      )}
      {deletingProduct && (
        <DeleteConfirmModal
          product={deletingProduct}
          onClose={() => setDeletingProduct(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
