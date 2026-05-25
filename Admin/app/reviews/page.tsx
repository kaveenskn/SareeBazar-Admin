import RatingDistribution from "./_components/rating-distribution";
import SentimentAnalysis from "./_components/sentiment-analysis";
import ReviewModeration from "./_components/review-moderation";

export const metadata = {
  title: "Reviews — SareeBazar Admin",
  description: "Curate the voice of your customers.",
};

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      {/* Row 1 — Rating chart (2/3) + Sentiment (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RatingDistribution /> {/* lg:col-span-2 is set inside */}
        <SentimentAnalysis />
      </div>

      {/* Row 2 — Full-width moderation panel */}
      <ReviewModeration />
    </div>
  );
}
