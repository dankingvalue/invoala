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
      style={{ background: filled ? "#166534" : "#e5e7eb" }}
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
      <section className="px-6 pb-14 pt-2">
        <a
          href={TRUSTPILOT.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mx-auto flex w-fit items-center gap-3 text-[13px] text-subtle transition-opacity hover:opacity-70"
        >
          <span className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <StarTile key={i} filled />
            ))}
          </span>
          <span>
            Rate us on <span className="font-semibold text-ink">Trustpilot</span> — help other freelancers find Invoala
          </span>
        </a>
      </section>
    );
  }

  const stars = Array.from({ length: TRUSTPILOT.stars }, (_, i) => i + 1);

  return (
    <section className="px-6 pb-14 pt-2">
      <a
        href={TRUSTPILOT.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mx-auto flex w-fit items-center gap-3 text-[13px] text-subtle transition-opacity hover:opacity-70"
      >
        <span className="text-[14px] font-semibold text-ink">Trustpilot</span>
        <span className="flex items-center gap-1">
          {stars.map((i) => (
            <StarTile key={i} filled />
          ))}
        </span>
        <span>
          <span className="font-semibold text-ink">Excellent</span> · {TRUSTPILOT.score}/5 ·{" "}
          {TRUSTPILOT.reviewCount.toLocaleString()} reviews
        </span>
      </a>
    </section>
  );
}
