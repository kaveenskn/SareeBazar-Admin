/* ─────────────────────────────────────────────
 *  Admin Product Types
 *  Extended from the SareeBazar collection types
 *  with additional admin-specific fields.
 * ───────────────────────────────────────────── */

export interface ColorVariant {
  name: string;
  hex: string;
  image: string;
}

export interface Product {
  id: number;
  _id?: string;
  name: string;
  slug: string;
  image: string;
  images?: string[];
  video?: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  category: string;
  collection?: string; // Collection ObjectId
  status?: "trending" | "latest" | "sale" | "";
  isWishlisted?: boolean;
  description?: string;
  fabric?: string;
  color?: string;
  colorVariants?: ColorVariant[];
  inStock?: boolean;
  createdAt?: string;
  /* ── Admin-specific fields ── */
  sku?: string;
  stock?: number;
  sizes?: string[];
  discountPercent?: number;
  isFeatured?: boolean;
  specifications?: Record<string, string>;
  tags?: string[];
  weight?: string;
  dimensions?: string;
}

export type ViewMode = "table" | "grid";

export type SortField = "name" | "price" | "stock" | "createdAt" | "rating";
export type SortDirection = "asc" | "desc";

export interface ProductFilters {
  search: string;
  category: string;
  stockStatus: "all" | "inStock" | "outOfStock" | "lowStock";
  status: string;
  sortField: SortField;
  sortDirection: SortDirection;
}

// Collections are now fetched dynamically from the backend
// CATEGORIES constant removed — use fetchCollections() instead

export const FABRICS = [
  "Pure Silk",
  "Banarasi Silk",
  "Tussar Silk",
  "Cotton",
  "Chanderi Cotton",
  "Georgette",
  "Chiffon",
  "Organza",
  "Linen",
  "Crepe",
] as const;

export const SIZES = [
  "Free Size",
  "5.5m",
  "6m",
  "6.3m",
  "6.5m",
  "8m",
  "9m",
] as const;

export const PRODUCT_STATUSES = [
  { value: "trending", label: "Trending" },
  { value: "latest", label: "Latest" },
  { value: "sale", label: "Sale" },
] as const;
