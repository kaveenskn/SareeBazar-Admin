/* ─────────────────────────────────────────────
 *  Admin API Service
 *  Handles all communication with the backend
 * ───────────────────────────────────────────── */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/backend";

/* ── Product Types ── */

export interface ApiProduct {
  _id: string;
  id: string;
  name: string;
  slug: string;
  image: string;
  images: string[];
  video: string;
  price: number;
  originalPrice: number | null;
  rating: number;
  reviews: number;
  category: string;
  collection: string | ApiCollection | null;
  status: string;
  description: string;
  fabric: string;
  color: string;
  colorVariants: { name: string; hex: string; image: string; stock: number }[];
  inStock: boolean;
  stock: number;
  sizes: string[];
  discountPercent: number | null;
  isFeatured: boolean;
  specifications: Record<string, string>;
  tags: string[];
  weight: string;
  dimensions: string;
  createdAt: string;
  updatedAt: string;
}

/* ── Collection Types ── */

export interface ApiCollection {
  _id: string;
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  isFeatured: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

/* ── Product API ── */

export async function fetchProducts(): Promise<ApiProduct[]> {
  const res = await fetch(`${API_BASE}/products`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function fetchProductBySlug(slug: string): Promise<ApiProduct | null> {
  const res = await fetch(`${API_BASE}/products/${slug}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
}

export async function createProduct(data: Record<string, unknown>): Promise<ApiProduct> {
  const res = await fetch(`${API_BASE}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Unknown error" }));
    const errorMessage = err.error ? `${err.message}: ${err.error}` : err.message;
    throw new Error(errorMessage || "Failed to create product");
  }
  return res.json();
}

export async function updateProduct(id: string, data: Record<string, unknown>): Promise<ApiProduct> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Unknown error" }));
    const errorMessage = err.error ? `${err.message}: ${err.error}` : err.message;
    throw new Error(errorMessage || "Failed to update product");
  }
  return res.json();
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(err.message || "Failed to delete product");
  }
}

/* ── Collection API ── */

export async function fetchCollections(): Promise<ApiCollection[]> {
  const res = await fetch(`${API_BASE}/collections`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch collections");
  return res.json();
}

export async function fetchCollection(id: string): Promise<ApiCollection | null> {
  const res = await fetch(`${API_BASE}/collections/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch collection");
  return res.json();
}

export async function createCollection(data: Record<string, unknown>): Promise<ApiCollection> {
  const res = await fetch(`${API_BASE}/collections`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Unknown error" }));
    const errorMessage = err.error ? `${err.message}: ${err.error}` : err.message;
    throw new Error(errorMessage || "Failed to create collection");
  }
  return res.json();
}

export async function updateCollection(id: string, data: Record<string, unknown>): Promise<ApiCollection> {
  const res = await fetch(`${API_BASE}/collections/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Unknown error" }));
    const errorMessage = err.error ? `${err.message}: ${err.error}` : err.message;
    throw new Error(errorMessage || "Failed to update collection");
  }
  return res.json();
}

export async function deleteCollection(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/collections/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(err.message || "Failed to delete collection");
  }
}
