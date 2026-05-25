"use client";

import { useState } from "react";
import { Star, Check, X, Reply, Image } from "lucide-react";

type Sentiment = "positive" | "neutral" | "negative";
type Tab       = "Pending" | "Approved" | "Rejected";

interface Review {
  id: number;
  initial: string;
  customer: string;
  product: string;
  time: string;
  rating: number;
  sentiment: Sentiment;
  text: string;
  images: number;
}

const allReviews: Review[] = [
  {
    id: 1,
    initial: "A",
    customer: "Ananya Sharma",
    product: "Banarasi Silk Royale",
    time: "2 days ago",
    rating: 5,
    sentiment: "positive",
    text: "The weave is exquisite. Felt like royalty at my sister's wedding.",
    images: 2,
  },
  {
    id: 2,
    initial: "M",
    customer: "Meera Iyer",
    product: "Kanjivaram Aurora",
    time: "4 days ago",
    rating: 5,
    sentiment: "positive",
    text: "Heirloom quality. The zari work is intricate and the drape flawless.",
    images: 2,
  },
  {
    id: 3,
    initial: "R",
    customer: "Riya Patel",
    product: "Chanderi Whisper",
    time: "1 week ago",
    rating: 4,
    sentiment: "positive",
    text: "Light, breathable, and the pastel hue is exactly as pictured.",
    images: 2,
  },
  {
    id: 4,
    initial: "K",
    customer: "Kavya Reddy",
    product: "Mysore Silk Dusk",
    time: "1 week ago",
    rating: 3,
    sentiment: "neutral",
    text: "Beautiful saree but shipping took longer than promised.",
    images: 2,
  },
];

const sentimentStyle: Record<Sentiment, string> = {
  positive: "bg-emerald-50 text-emerald-700",
  neutral:  "bg-amber-50   text-amber-700",
  negative: "bg-rose-50    text-rose-700",
};

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

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="p-5 rounded-2xl bg-gray-50/80 border border-gray-100">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="h-12 w-12 rounded-xl bg-[#a1005b] text-white flex items-center justify-center font-serif text-lg shrink-0">
          {review.initial}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="font-medium text-gray-900">{review.customer}</div>
              <div className="text-xs text-gray-400">
                on {review.product} · {review.time}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StarRating rating={review.rating} />
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md ${
                  sentimentStyle[review.sentiment]
                }`}
              >
                {review.sentiment}
              </span>
            </div>
          </div>

          {/* Review text */}
          <p className="text-sm text-gray-600 mt-3 italic leading-relaxed">
            &ldquo;{review.text}&rdquo;
          </p>

          {/* Image placeholders */}
          <div className="flex gap-2 mt-3">
            {Array.from({ length: review.images }).map((_, i) => (
              <div
                key={i}
                className="h-16 w-16 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-300"
              >
                <Image className="h-4 w-4" aria-hidden="true" />
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-4">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition-colors">
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              Approve
            </button>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-medium hover:bg-rose-100 transition-colors">
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              Reject
            </button>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-50 text-[#a1005b] text-xs font-medium hover:bg-pink-100 transition-colors">
              <Reply className="h-3.5 w-3.5" aria-hidden="true" />
              Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const TABS: Tab[] = ["Pending", "Approved", "Rejected"];

export default function ReviewModeration() {
  const [activeTab, setActiveTab] = useState<Tab>("Pending");

  // In a real app each tab would filter from different data.
  // Here Pending shows all; the other tabs show empty for now.
  const visible = activeTab === "Pending" ? allReviews : [];

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
          </p>
        </div>

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

      {/* Review list */}
      {visible.length > 0 ? (
        <div className="space-y-4">
          {visible.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-sm text-gray-400">
          No {activeTab.toLowerCase()} reviews right now.
        </div>
      )}
    </div>
  );
}