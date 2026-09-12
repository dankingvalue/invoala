import { Reveal } from "@/components/Reveal";

// Real reviews left on Invoala's FindYourSaaS listing. Kept short and
// unedited (source: https://findyoursaas.com/tool/invoala-free-invoice-generator-for-freelancers).
const TESTIMONIALS = [
  {
    quote: "Invoala is a clean free invoice generator for freelancers. Quick to use and produces professional-looking invoices without a subscription.",
    name: "Weiyuan Zhou",
  },
  {
    quote: "Straightforward to set up and the interface is uncluttered. Worth a look if you need this.",
    name: "Verified user",
  },
  {
    quote: "Simple to try and the results matched what I expected. Good to see a focused tool rather than a bundle.",
    name: "Verified user",
  },
  {
    quote: "Very useful tool to generate an invoice, pretty easy to use as well.",
    name: "F9XR",
  },
];

export function Testimonials() {
  return (
    <section className="px-6 py-16 md:py-28">
      <div className="mx-auto max-w-[1024px]">
        <Reveal>
          <h2 className="text-center text-[36px] font-extrabold tracking-tight md:text-[52px]">
            What people are saying
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name + i} delay={i * 80}>
              <figure className="h-full rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] p-6">
                <blockquote className="text-[15px] leading-relaxed text-ink">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-4 text-[13px] font-semibold text-subtle">
                  {t.name}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
        <p className="mt-8 text-center text-[13px] text-subtle">
          Real reviews from{" "}
          <a
            href="https://findyoursaas.com/tool/invoala-free-invoice-generator-for-freelancers"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#166534] hover:underline"
          >
            FindYourSaaS
          </a>
        </p>
      </div>
    </section>
  );
}
