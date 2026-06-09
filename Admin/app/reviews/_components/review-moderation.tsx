"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Star,
  Check,
  X,
  Reply,
  Loader2,
  RefreshCw,
  Trash2,
  Send,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const API_BASE = "http://localhost:5000/api/reviews";

type Tab = "All" | "Approved" | "Pending";

interface ReviewUser {
  _id: string;
  name: string;
  email: string;
}

interface ReviewProduct {
  _id: string;
  name: string;
  slug: string;
  image?: string;
}

interface ReviewFromDB {
  _id: string;
  user: ReviewUser | null;
  product: ReviewProduct | null;
  rating: number;
  title: string;
  comment: string;
  adminReply: string;
  adminRepliedAt: string | null;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

/* ─── Helpers ─── */

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/* ─── Star Rating ─── */

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating
              ? "fill-[#a1005b] text-[#a1005b]"
              : "text-gray-200"
          }`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

/* ─── Review Card ─── */

function ReviewCard({
  review,
  onApprove,
  onReject,
  onDelete,
  onReply,
}: {
  review: ReviewFromDB;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
  onReply: (id: string, text: string) => void;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState(review.adminReply || "");
  const [sending, setSending] = useState(false);

  const userName = review.user?.name || "Deleted User";
  const initial = userName.charAt(0).toUpperCase();
  const productName = review.product?.name || "Unknown Product";

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    await onReply(review._id, replyText.trim());
    setSending(false);
    setReplyOpen(false);
  };

  return (
    <div className="p-5 rounded-2xl bg-gray-50/80 border border-gray-100 transition-all duration-200 hover:shadow-sm">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="h-12 w-12 rounded-xl bg-[#a1005b] text-white flex items-center justify-center font-serif text-lg shrink-0">
          {initial}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{userName}</span>
                {review.isVerifiedPurchase && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                    <ShieldCheck className="h-3 w-3" />
                    Verified
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-400">
                on {productName} · {timeAgo(review.createdAt)}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StarRating rating={review.rating} />
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md ${
                  review.isApproved
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {review.isApproved ? "Approved" : "Pending"}
              </span>
            </div>
          </div>

          {/* Review title */}
          {review.title && (
            <p className="text-sm font-semibold text-gray-800 mt-2">{review.title}</p>
          )}

          {/* Review text */}
          <p className="text-sm text-gray-600 mt-1.5 italic leading-relaxed">
            &ldquo;{review.comment}&rdquo;
          </p>

          {/* Existing admin reply */}
          {review.adminReply && !replyOpen && (
            <div className="mt-3 pl-4 border-l-2 border-[#a1005b]/30">
              <div className="text-[11px] text-[#a1005b] font-semibold mb-0.5">Admin Reply</div>
              <p className="text-sm text-gray-600">{review.adminReply}</p>
              {review.adminRepliedAt && (
                <span className="text-[10px] text-gray-400">{timeAgo(review.adminRepliedAt)}</span>
              )}
            </div>
          )}

          {/* Reply textarea */}
          {replyOpen && (
            <div className="mt-3 space-y-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a1005b]/20 focus:border-[#a1005b] resize-none transition-all"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleReply}
                  disabled={sending || !replyText.trim()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#a1005b] text-white text-xs font-medium hover:bg-[#870049] transition-colors disabled:opacity-50"
                >
                  {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  Send Reply
                </button>
                <button
                  onClick={() => { setReplyOpen(false); setReplyText(review.adminReply || ""); }}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 mt-4">
            {!review.isApproved ? (
              <button
                onClick={() => onApprove(review._id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition-colors"
              >
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                Approve
              </button>
            ) : (
              <button
                onClick={() => onReject(review._id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-medium hover:bg-amber-100 transition-colors"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                Unapprove
              </button>
            )}
            <button
              onClick={() => setReplyOpen(!replyOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-50 text-[#a1005b] text-xs font-medium hover:bg-pink-100 transition-colors"
            >
              <Reply className="h-3.5 w-3.5" aria-hidden="true" />
              {review.adminReply ? "Edit Reply" : "Reply"}
            </button>
            <button
              onClick={() => onDelete(review._id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-medium hover:bg-rose-100 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Tabs ─── */

const TABS: Tab[] = ["All", "Approved", "Pending"];

/* ─── Main Component ─── */

export default function ReviewModeration() {
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [reviews, setReviews] = useState<ReviewFromDB[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReviews = useCallback(
    async (page = 1, showRefresh = false) => {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "20",
          sort: "createdAt",
          order: "desc",
        });

        if (activeTab === "Approved") params.set("approved", "true");
        if (activeTab === "Pending") params.set("approved", "false");

        const res = await fetch(`${API_BASE}/admin/all?${params}`);
        const data = await res.json();

        if (res.ok) {
          setReviews(data.reviews || []);
          setPagination(data.pagination || { page: 1, limit: 20, total: 0, pages: 0 });
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeTab]
  );

  useEffect(() => {
    fetchReviews(1);
  }, [fetchReviews]);

  /* ─── Actions ─── */

  const handleApprove = async (reviewId: string) => {
    try {
      const res = await fetch(`${API_BASE}/admin/${reviewId}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: true }),
      });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r._id === reviewId ? { ...r, isApproved: true } : r))
        );
      }
    } catch {
      // silently fail
    }
  };

  const handleReject = async (reviewId: string) => {
    try {
      const res = await fetch(`${API_BASE}/admin/${reviewId}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: false }),
      });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r._id === reviewId ? { ...r, isApproved: false } : r))
        );
      }
    } catch {
      // silently fail
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/${reviewId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r._id !== reviewId));
        setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
      }
    } catch {
      // silently fail
    }
  };

  const handleReply = async (reviewId: string, text: string) => {
    try {
      const res = await fetch(`${API_BASE}/admin/${reviewId}/reply`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminReply: text }),
      });
      if (res.ok) {
        const data = await res.json();
        setReviews((prev) =>
          prev.map((r) =>
            r._id === reviewId
              ? { ...r, adminReply: data.review.adminReply, adminRepliedAt: data.review.adminRepliedAt }
              : r
          )
        );
      }
    } catch {
      // silently fail
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
      {/* Header + tab filters */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h2 className="font-serif text-xl text-gray-900">
            Review Moderation
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Approve, reply, or remove customer reviews
            {pagination.total > 0 && (
              <span className="ml-1 text-gray-400">
                · {pagination.total} total
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchReviews(pagination.page, true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
          <div className="flex gap-1.5">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  activeTab === tab
                    ? "bg-[#a1005b] text-white border-transparent shadow-sm"
                    : "border-gray-200 text-gray-600 hover:border-[#a1005b] hover:text-[#a1005b]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="text-[#a1005b] animate-spin" />
        </div>
      ) : reviews.length > 0 ? (
        <>
          {/* Review list */}
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                onApprove={handleApprove}
                onReject={handleReject}
                onDelete={handleDelete}
                onReply={handleReply}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                Page {pagination.page} of {pagination.pages} · {pagination.total} reviews
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchReviews(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={14} />
                  Previous
                </button>
                <button
                  onClick={() => fetchReviews(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="py-16 text-center text-sm text-gray-400">
          No {activeTab.toLowerCase() === "all" ? "" : activeTab.toLowerCase() + " "}reviews right now.
        </div>
      )}
    </div>
  );
}