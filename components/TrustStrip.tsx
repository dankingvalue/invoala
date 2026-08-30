const TRUSTPILOT = {
  hasReviews: false,
  score: "4.9",
  stars: 5,
  reviewCount: 0,
  url: "https://www.trustpilot.com/review/invoala.com",
};

function StarTile({ filled }: { filled: boolean }) {
  return (
    <span
      className="inline-flex h-[22px] w-[22px] items-center justify-center"
      style={{ background: filled ? "#00b67a" : "#dcdce6" }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
        <path d="M12 2.6l2.83 5.98 6.57.72-4.87 4.42 1.32 6.48L12 16.87l-5.85 3.33 1.32-6.48L2.6 9.3l6.57-.72L12 2.6z" />
      </svg>
    </span>
  );
}

export function TrustStrip() {
  if (!TRUSTPILOT.hasReviews) {
    return (
      <section className="bg-[#f3f4f6] px-6 py-6">
        <a
          href={TRUSTPILOT.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mx-auto flex w-fit items-center gap-3 rounded-full border border-[#e5e7eb] bg-white px-5 py-3 text-[14px] text-[#6b7280] shadow-sm transition hover:shadow-md"
        >
          <span className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <StarTile key={i} filled />
            ))}
          </span>
          <span>
            Rate us on <span className="font-semibold text-[#111827]">Trustpilot</span> — help other freelancers find Invoala
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#6b7280]">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
      </section>
    );
  }

  const stars = Array.from({ length: TRUSTPILOT.stars }, (_, i) => i + 1);

  return (
    <section className="bg-[#f3f4f6] px-6 py-6">
      <a
        href={TRUSTPILOT.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mx-auto flex w-fit items-center gap-3 rounded-full border border-[#e5e7eb] bg-white px-5 py-3 text-[14px] text-[#6b7280] shadow-sm transition hover:shadow-md"
      >
        <span className="flex items-center gap-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#00b67a" aria-hidden="true">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span className="font-semibold text-[#111827]">Trustpilot</span>
        </span>
        <span className="flex items-center gap-0.5">
          {stars.map((i) => (
            <StarTile key={i} filled />
          ))}
        </span>
        <span>
          <span className="font-semibold text-[#111827]">Excellent</span> · {TRUSTPILOT.score}/5
        </span>
      </a>
    </section>
  );
}
