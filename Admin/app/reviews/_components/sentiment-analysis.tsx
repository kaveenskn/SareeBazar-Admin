const sentiments = [
  { label: "Positive", pct: 86, barClass: "from-emerald-400 to-emerald-600" },
  { label: "Neutral",  pct: 10, barClass: "from-amber-300  to-amber-500"   },
  { label: "Negative", pct: 4,  barClass: "from-rose-400   to-rose-600"    },
];

export default function SentimentAnalysis() {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
      <h2 className="font-serif text-xl text-gray-900">Sentiment Analysis</h2>
      <p className="text-sm text-gray-500 mt-0.5 mb-6">AI-powered insights</p>

      <div className="space-y-5">
        {sentiments.map(({ label, pct, barClass }) => (
          <div key={label}>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-medium text-gray-800">{label}</span>
              <span className="text-gray-500">{pct}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${barClass} rounded-full transition-all duration-700`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}