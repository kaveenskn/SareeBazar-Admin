/* ─────────────────────────────────────────────
 *  Admin API Service
 *  Handles all communication with the backend
 * ───────────────────────────────────────────── */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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
  badge: string;
  description: string;
  fabric: string;
  color: string;
  colorVariants: { name: string; hex: string; image: string }[];
  inStock: boolean;
  stock: number;
  sizes: string[];
  discountPercent: number | null;
  isFeatured: boolean;
  isLatest: boolean;
  isTrending: boolean;
  specifications: Record<string, string>;
  tags: string[];
  weight: string;
  dimensions: string;
  createdAt: string;
  updatedAt: string;
}

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
    throw new Error(err.message || "Failed to create product");
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
    throw new Error(err.message || "Failed to update product");
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
