import { Star } from "lucide-react";
import { latestReviews } from "@/app/lib/mock-data";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < rating ? "fill-[#a1005b] text-[#a1005b]" : "text-gray-200"}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export default function LatestReviews() {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
      <h2 className="font-serif text-xl text-gray-900">Latest Reviews</h2>
      <p className="text-sm text-gray-500 mt-0.5 mb-5">Customer love</p>

      <div className="space-y-4">
        {latestReviews.map((review) => (
          <div key={review.id} className="p-4 rounded-xl bg-gray-50/80 border border-gray-100">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="h-10 w-10 rounded-full bg-[#d93097] text-white flex items-center justify-center font-serif shrink-0">
                {review.initial}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-medium text-sm text-gray-900">{review.customer}</div>
                    <div className="text-xs text-gray-400">{review.product}</div>
                  </div>
                  <StarRating rating={review.rating} />
                </div>

                <p className="text-sm text-gray-600 mt-2 italic leading-relaxed">
                  &ldquo;{review.text}&rdquo;
                </p>

                <div className="flex items-center gap-2 mt-3">
                  <span className="text-[11px] font-medium px-2 py-1 rounded-md bg-emerald-50 text-emerald-700">
                    {review.sentiment}
                  </span>
                  <span className="text-xs text-gray-400">{review.time}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}