import Link from "next/link";
import { SeoNavAuth } from "@/components/SeoNavAuth";
import { SeoNavMobile } from "@/components/SeoNavMobile";
import {
  breadcrumbSchema,
  faqSchema,
  type BreadcrumbItem,
  type FaqItem,
} from "@/lib/seo";

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function SeoNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#e5e7eb] bg-white/95 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 sm:px-8" aria-label="Main navigation">
        <Link href="/" className="flex items-center gap-2 font-bold text-[#111827]" aria-label="Invoala home">
          <svg width="22" height="22" viewBox="0 0 64 64" aria-hidden="true">
            <rect width="64" height="64" rx="14.5" fill="#166534" />
            <path d="M35.5 10 19 37h9.5l-3 17L43 27h-9.5l2-17z" fill="#fff" />
          </svg>
          Invoala
        </Link>
        <div className="hidden items-center gap-6 text-[14px] font-medium text-[#6b7280] md:flex">
          <Link href="/invoicing-software" className="hover:text-[#111827]">Product</Link>
          <Link href="/tools" className="hover:text-[#111827]">Free tools</Link>
          <Link href="/templates" className="hover:text-[#111827]">Templates</Link>
          <Link href="/learn" className="hover:text-[#111827]">Learn</Link>
          <Link href="/pricing" className="hover:text-[#111827]">Pricing</Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <SeoNavAuth />
          </div>
          <Link href="/invoice-generator" className="rounded-lg bg-[#14532d] px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-[#0f3d22]">
            Create invoice
          </Link>
          <SeoNavMobile />
        </div>
      </nav>
    </header>
  );
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-[13px] text-[#6b7280]">
      <JsonLd data={breadcrumbSchema(items)} />
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => (
          <li key={item.href} className="flex items-center gap-1">
            {i > 0 && <span className="text-[#d1d5db]" aria-hidden="true">/</span>}
            {i < items.length - 1 ? (
              <Link href={item.href} className="hover:text-[#166534]">
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-[#111827]" aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function SeoH1({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[56px]">
      {children}
    </h1>
  );
}

export function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-10">
      <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">{children}</h2>
      {sub && <p className="mt-2 text-[16px] text-[#6b7280]">{sub}</p>}
    </div>
  );
}

export function CtaBlock({
  title,
  description,
  buttonText,
  buttonHref,
}: {
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
}) {
  return (
    <section className="rounded-xl bg-[#f3f4f6] p-8 text-center">
      <h2 className="text-[24px] font-bold tracking-tight">{title}</h2>
      <p className="mt-2 text-[16px] text-[#6b7280]">{description}</p>
      <Link
        href={buttonHref}
        className="mt-6 inline-block rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0f3d22]"
      >
        {buttonText}
      </Link>
    </section>
  );
}

export function RelatedLinks({
  title,
  links,
}: {
  title?: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div className="border-t border-[#e5e7eb] pt-8">
      <h3 className="text-[16px] font-semibold">{title || "Related"}</h3>
      <ul className="mt-3 space-y-2 text-[15px]">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-[#166534] hover:underline">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FaqSection({ items, title = "Frequently asked questions" }: { items: FaqItem[]; title?: string }) {
  return (
    <section aria-labelledby="faq-heading">
      <JsonLd data={faqSchema(items)} />
      <h2 id="faq-heading" className="text-[28px] font-extrabold tracking-tight md:text-[36px]">{title}</h2>
      <div className="mt-8 border-t border-[#e5e7eb]">
        {items.map((item) => (
          <details key={item.question} className="border-b border-[#e5e7eb]">
            <summary className="cursor-pointer py-5 text-[17px] font-semibold tracking-tight text-[#111827]">
              {item.question}
            </summary>
            <p className="pb-6 pr-8 text-[15px] leading-relaxed text-[#6b7280]">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function SeoFooter() {
  return (
    <footer className="border-t border-[#e5e7eb] bg-[#f3f4f6] px-6 py-10">
      <div className="mx-auto max-w-[1024px]">
        <div className="grid gap-8 text-[13px] text-[#6b7280] sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <h4 className="mb-3 text-[13px] font-semibold text-[#111827]">Product</h4>
            <ul className="space-y-2">
              <li><Link href="/invoicing-software" className="hover:text-[#166534]">Invoicing Software</Link></li>
              <li><Link href="/invoice-generator" className="hover:text-[#166534]">Invoice Generator</Link></li>
              <li><Link href="/online-invoicing" className="hover:text-[#166534]">Online Invoicing</Link></li>
              <li><Link href="/recurring-invoices" className="hover:text-[#166534]">Recurring Invoices</Link></li>
              <li><Link href="/invoice-payment-tracking" className="hover:text-[#166534]">Payment Tracking</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-[13px] font-semibold text-[#111827]">Solutions</h4>
            <ul className="space-y-2">
              <li><Link href="/invoicing-for-freelancers" className="hover:text-[#166534]">For Freelancers</Link></li>
              <li><Link href="/invoicing-for-small-businesses" className="hover:text-[#166534]">For Small Businesses</Link></li>
              <li><Link href="/invoicing-for-consultants" className="hover:text-[#166534]">For Consultants</Link></li>
              <li><Link href="/invoicing-for-agencies" className="hover:text-[#166534]">For Agencies</Link></li>
              <li><Link href="/invoicing-for-contractors" className="hover:text-[#166534]">For Contractors</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-[13px] font-semibold text-[#111827]">Tools</h4>
            <ul className="space-y-2">
              <li><Link href="/tools/invoice-generator" className="hover:text-[#166534]">Invoice Generator</Link></li>
              <li><Link href="/tools/vat-calculator" className="hover:text-[#166534]">VAT Calculator</Link></li>
              <li><Link href="/tools/profit-margin-calculator" className="hover:text-[#166534]">Profit Margin Calculator</Link></li>
              <li><Link href="/tools/hourly-rate-calculator" className="hover:text-[#166534]">Hourly Rate Calculator</Link></li>
              <li><Link href="/tools/invoice-number-generator" className="hover:text-[#166534]">Invoice Number Generator</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-[13px] font-semibold text-[#111827]">Resources</h4>
            <ul className="space-y-2">
              <li><Link href="/templates" className="hover:text-[#166534]">Templates</Link></li>
              <li><Link href="/learn" className="hover:text-[#166534]">Learning Center</Link></li>
              <li><Link href="/compare" className="hover:text-[#166534]">Comparisons</Link></li>
              <li><Link href="/research/invoice-payment-report" className="hover:text-[#166534]">Payment Research</Link></li>
              <li><Link href="/how-to-create-invoice" className="hover:text-[#166534]">How to Create an Invoice</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-[13px] font-semibold text-[#111827]">Company</h4>
            <ul className="space-y-2">
              <li><Link href="/pricing" className="hover:text-[#166534]">Pricing</Link></li>
              <li><Link href="/about" className="hover:text-[#166534]">About</Link></li>
              <li><Link href="/security" className="hover:text-[#166534]">Security</Link></li>
              <li><Link href="/contact" className="hover:text-[#166534]">Contact</Link></li>
              <li><a href="mailto:hello@invoala.com" className="hover:text-[#166534]">Email Us</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-[#e5e7eb] pt-6 text-[13px] text-[#6b7280] sm:flex-row">
          <div className="flex items-center gap-2 font-bold text-[#111827]">
            <svg width="18" height="18" viewBox="0 0 64 64" aria-hidden="true">
              <rect width="64" height="64" rx="14.5" fill="#166534" />
              <path d="M35.5 10 19 37h9.5l-3 17L43 27h-9.5l2-17z" fill="#fff" />
            </svg>
            Invoala
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/privacy" className="hover:text-[#111827]">Privacy</Link>
            <Link href="/terms" className="hover:text-[#111827]">Terms</Link>
            <Link href="/cookie-policy" className="hover:text-[#111827]">Cookies</Link>
            <Link href="/refund-policy" className="hover:text-[#111827]">Refunds</Link>
            <Link href="/security" className="hover:text-[#111827]">Security</Link>
          </div>
          <p>&copy; 2026 Invoala. All rights reserved.</p>
        </div>
        <p className="mt-4 text-[11px] leading-relaxed text-[#6b7280]">
          Invoala is a free online invoice generator for freelancers and small businesses. Create
          professional invoices with your own logo, line items, tax, and multiple currencies — then
          download them as print-ready PDF files. No account required, and your data never leaves
          your browser.
        </p>
      </div>
    </footer>
  );
}
