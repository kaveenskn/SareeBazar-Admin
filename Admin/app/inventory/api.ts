/* ─────────────────────────────────────────────
 *  Inventory API Service
 *  Handles all communication with the inventory backend
 * ───────────────────────────────────────────── */

import { InventoryItem, InventoryStats, BulkStockUpdate } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function fetchInventory(params?: {
  status?: string;
  category?: string;
  search?: string;
  sort?: string;
  order?: string;
}): Promise<InventoryItem[]> {
  const searchParams = new URLSearchParams();
  if (params?.status && params.status !== "all") searchParams.set("status", params.status);
  if (params?.category) searchParams.set("category", params.category);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.sort) searchParams.set("sort", params.sort);
  if (params?.order) searchParams.set("order", params.order);

  const qs = searchParams.toString();
  const res = await fetch(`${API_BASE}/inventory${qs ? `?${qs}` : ""}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch inventory");
  return res.json();
}

export async function fetchInventorySummary(): Promise<InventoryStats> {
  const res = await fetch(`${API_BASE}/inventory/summary`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch inventory summary");
  return res.json();
}

export async function updateStock(
  id: string,
  stock: number
): Promise<InventoryItem> {
  const res = await fetch(`${API_BASE}/inventory/${id}/stock`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stock }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(err.message || "Failed to update stock");
  }
  return res.json();
}

export async function bulkUpdateStock(
  updates: BulkStockUpdate[]
): Promise<{ message: string; modifiedCount: number }> {
  const res = await fetch(`${API_BASE}/inventory/bulk-update`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ updates }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(err.message || "Failed to bulk update stock");
  }
  return res.json();
}

export async function fetchLowStock(
  threshold?: number
): Promise<InventoryItem[]> {
  const qs = threshold ? `?threshold=${threshold}` : "";
  const res = await fetch(`${API_BASE}/inventory/low-stock${qs}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch low stock items");
  return res.json();
}
