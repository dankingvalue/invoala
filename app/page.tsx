import type { Metadata } from "next";
import { HomeContent } from "@/components/HomeContent";
import { hreflangAlternates } from "@/lib/i18n";

// The root layout already sets title/description/OG/canonical for "/" —
// this only adds hreflang alternates. Metadata objects are shallowly
// merged by key, and a nested object (like `alternates`) is replaced
// wholesale by whichever segment defines it, not deep-merged — so the
// layout's canonical has to be repeated here or it would be lost.
export async function generateMetadata(): Promise<Metadata> {
  return {
    alternates: {
      canonical: "https://www.invoala.com",
      languages: hreflangAlternates("/"),
    },
  };
}

const faqs = [
  {
    q: "Is Invoala really free?",
    a: "Yes. Create, preview, and download unlimited invoices for free — no trials, no paywalls. Free PDFs carry a small \"Made with Invoala\" credit line at the bottom; Pro removes it.",
  },
  {
    q: "Do I need to create an account?",
    a: "No. There is no sign-up and no email required. Open the page, fill in your details, and download your invoice.",
  },
  {
    q: "Where is my data stored?",
    a: "Everything you type is saved locally in your browser only. Nothing is uploaded to a server, so your business details stay private.",
  },
  {
    q: "What do I get when I download?",
    a: "A clean, professional A4 PDF with your logo, line items, tax breakdown, and payment notes — ready to email to any client.",
  },
  {
    q: "Can I use it for quotes or receipts too?",
    a: "Absolutely. Change the dates and item descriptions to send estimates before a project, or receipts after payment.",
  },
  {
    q: "What currencies are supported?",
    a: "154 world currencies including USD, EUR, GBP, JPY, CAD, AUD, and more. The invoice formats the symbol and decimals automatically.",
  },
  {
    q: "Can I add my own logo?",
    a: "Yes. Upload your logo and it appears at the top of every invoice.",
  },
  {
    q: "Does it calculate tax automatically?",
    a: "Yes. Enter your tax rate (VAT, GST, sales tax) and the total updates live as you type.",
  },
  {
    q: "Can I save clients for reuse?",
    a: "Yes. Create a free account and save client details once — up to 5 on the Free plan, unlimited on Pro — then pick them from a dropdown on future invoices.",
  },
  {
    q: "What file format does it export?",
    a: "PDF — print-ready A4 format that looks identical on every device and prints perfectly on any printer.",
  },
  {
    q: "Is there a limit on how many invoices I can create?",
    a: "No limit. Create as many as you want, forever. There are no daily or monthly caps.",
  },
  {
    q: "How is this different from Excel or Google Sheets?",
    a: "Invoala is purpose-built for invoicing. You get live totals, automatic tax math, professional formatting, and a PDF download — all in one step. No formulas, no templates to set up.",
  },
  {
    q: "Can freelancers use this?",
    a: "Absolutely. Invoala is built for freelancers, consultants, and solo operators who want professional invoices without paying for software.",
  },
  {
    q: "Do you support recurring invoices?",
    a: "You can save your details and client info for quick reuse. Full recurring invoice scheduling is available on the Pro plan.",
  },
];

function FaqJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// No `dynamic` export — this page now has zero server-side Request-time API
// usage (no cookies(), no DB calls), so it's static and CDN-cacheable.
// Everything that used to require a per-request render (maintenance mode,
// the announcement banner, hiding the signup prompt for logged-in users,
// feature flags, and the nav's auth state) moved into HomeContent, which
// fetches them client-side after the static shell has already loaded.
export default function Home() {
  return (
    <>
      <FaqJsonLd />
      <HomeContent />
    </>
  );
}
