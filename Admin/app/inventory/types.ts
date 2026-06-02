/* ─────────────────────────────────────────────
 *  Inventory Types
 *  Types specific to the inventory management page
 * ───────────────────────────────────────────── */

export interface InventoryItem {
  _id: string;
  id: string;
  name: string;
  slug: string;
  image: string;
  category: string;
  stock: number;
  inStock: boolean;
  price: number;
  originalPrice?: number;
  badge?: string;
  fabric?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventorySummary {
  totalProducts: number;
  totalStock: number;
  totalValue: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
}

export interface CategoryBreakdown {
  _id: string;
  count: number;
  totalStock: number;
  value: number;
}

export interface InventoryStats {
  summary: InventorySummary;
  categoryBreakdown: CategoryBreakdown[];
}

export type StockStatus = "all" | "inStock" | "lowStock" | "outOfStock";

export interface InventoryFilters {
  search: string;
  category: string;
  status: StockStatus;
  sortField: string;
  sortDirection: "asc" | "desc";
}

export interface BulkStockUpdate {
  id: string;
  stock: number;
}
