import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Reveal } from "@/components/Reveal";
import { InvoiceGenerator } from "@/components/InvoiceGenerator";
import { EmailCapture } from "@/components/EmailCapture";
import { TrustStrip } from "@/components/TrustStrip";
import { CURRENCIES } from "@/lib/invoice";
import { getFlags } from "@/lib/flags.server";
import { ProPricing } from "@/components/ProPricing";
import { SignupPrompt } from "@/components/SignupPrompt";
import { getCurrentUser } from "@/lib/server-auth";

const faqs = [
  {
    q: "Is Invoala really free?",
    a: "Yes. Create, preview, and download unlimited invoices for free — no trials, no paywalls, no watermarks on your PDFs.",
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
];

const features = [
  {
    title: "Polished PDFs",
    copy: "Pixel-perfect invoices that make your work look premium. Download an A4 PDF ready to email to any client.",
    glyph: (
      <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm7 1.5V9h4.5M9 13h6m-6 4h6" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    ),
  },
  {
    title: "Yours in seconds",
    copy: "No sign-up, no paywall. Fill the form and download instantly. Your details stay saved right on your device.",
    glyph: (
      <path d="M13 2 4.5 13.5H11L9.5 22 19 10h-6.5L13 2Z" strokeWidth="1.5" strokeLinejoin="round" />
    ),
  },
  {
    title: "Any currency",
    copy: `Charge clients in any of ${CURRENCIES.length} world currencies — with automatic tax math and professional formatting built in.`,
    glyph: (
      <path d="M12 3v18M16.5 7.5c-.8-1.2-2.4-2-4.5-2-2.5 0-4 1.3-4 3.1 0 4.4 9 2.3 9 6.8 0 1.8-1.7 3.1-4.5 3.1-2.3 0-4-.9-4.8-2.2" strokeWidth="1.5" strokeLinecap="round" />
    ),
  },
  {
    title: "Just describe it",
    copy: "Type what you did in plain words — AI turns it into a finished invoice, items and totals included.",
    glyph: (
      <path d="M12 2l2.2 6.6L21 11l-6.8 2.4L12 20l-2.2-6.6L3 11l6.8-2.4L12 2Z" strokeWidth="1.5" strokeLinejoin="round" />
    ),
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

export const dynamic = "force-dynamic";

export default async function Home() {
  const { flags, announcement } = await getFlags();
  const user = await getCurrentUser();

  if (flags.maintenanceMode) {
    return (
      <div id="top">
        <Nav />
        <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <h1 className="text-[40px] font-semibold tracking-tight md:text-[56px]">
            We&rsquo;ll be right back.
          </h1>
          <p className="mt-4 max-w-[420px] text-[17px] leading-relaxed text-subtle">
            Invoala is getting a quick update. Refresh in a few minutes — your
            saved invoices are safe on your device.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div id="top" className="scroll-mt-20">
      <FaqJsonLd />
      <Nav />
      {user || !flags.signupPrompt ? null : <SignupPrompt />}

      {announcement ? (
        <div className="mt-20 px-4 pt-4">
          <p className="rounded-lg bg-[#dcfce7] py-2.5 text-center text-[14px] font-medium text-[#166534]">
            {announcement}
          </p>
        </div>
      ) : null}

      {/* Hero */}
      <section className="px-6 pb-20 pt-36 text-center md:pb-28 md:pt-44">
        <Reveal>
          <h1 className="mx-auto max-w-[900px] text-[48px] font-extrabold leading-[1.05] tracking-tight md:text-[80px]">
            Invoices that look
            <span className="block text-[#166534]">professional.</span>
          </h1>
        </Reveal>
        <Reveal delay={100}>
          <p className="mx-auto mt-6 max-w-[640px] text-[19px] font-medium leading-relaxed text-subtle md:text-[21px]">
            Voilà — now invoices are simple to make. Build a beautiful
            invoice and download a polished PDF in seconds.
          </p>
        </Reveal>
        <Reveal delay={200}>
          <div className="mt-9 flex items-center justify-center gap-4">
            <a
              href="#generate"
              className="rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white shadow-sm transition hover:bg-[#0f3d22] active:scale-[0.99]"
            >
              Create your invoice
            </a>
            <a href="#how" className="text-[16px] font-medium text-[#166534] transition-opacity hover:opacity-70">
              How it works &rsaquo;
            </a>
          </div>
        </Reveal>
        <Reveal delay={300}>
          <p className="mt-6 text-[13px] text-subtle">
            Free forever &nbsp;·&nbsp; No sign-up &nbsp;·&nbsp; No credit card required
          </p>
        </Reveal>
      </section>

      {/* Social proof */}
      {flags.trustpilotStrip ? <TrustStrip /> : null}

      {/* Generator */}
      <section className="bg-[#f3f4f6] px-6 py-16 md:py-24">
        <div className="mx-auto max-w-[1200px]">
          <Reveal>
            <div className="mb-12 text-center">
              <h2 className="text-[36px] font-extrabold tracking-tight md:text-[52px]">
                Start now. It takes two minutes.
              </h2>
              <p className="mt-3 text-[17px] font-medium text-subtle">
                Fill it in once — we save your details for next time.{flags.aiComposer ? " Or just describe the job and let AI draft it." : ""}
              </p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <InvoiceGenerator
              ai={flags.aiComposer}
              print={flags.printButton}
              allowLogo={flags.logoUpload}
              quoteMode={flags.quoteMode}
              recurringTerms={flags.recurringTerms}
              user={user ? { email: user.email } : null}
            />
          </Reveal>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-16 px-6 py-16 md:py-28">
        <div className="mx-auto max-w-[1024px]">
          <Reveal>
            <h2 className="mx-auto max-w-[720px] text-center text-[36px] font-extrabold tracking-tight md:text-[52px]">
              Everything you need.
              <span className="block text-subtle">Nothing you don&rsquo;t.</span>
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-x-12 gap-y-12 sm:grid-cols-2 xl:grid-cols-4">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 100}>
                <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#f0fdf4]">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#166534"
                      aria-hidden="true"
                    >
                      {f.glyph}
                    </svg>
                  </div>
                  <h3 className="text-[18px] font-bold tracking-tight">{f.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-subtle">{f.copy}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-16 bg-[#f3f4f6] px-6 py-16 md:py-28">
        <div className="mx-auto max-w-[1024px]">
          <Reveal>
            <h2 className="max-w-[680px] text-[36px] font-extrabold tracking-tight md:text-[52px]">
              Three steps. Done.
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-12 sm:grid-cols-3">
            {[
              {
                n: "01",
                title: "Add your details",
                copy: "Your name, logo, and client info. We remember them next visit.",
              },
              {
                n: "02",
                title: "Describe the work",
                copy: "Line items, quantities, rates, tax — totals update live as you type.",
              },
              {
                n: "03",
                title: "Download & send",
                copy: "One click gives you a crisp A4 PDF. Attach it, send it, get paid.",
              },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 100}>
                <div>
                  <p className="text-[56px] font-extrabold leading-none tracking-tight text-[#166534]/20 md:text-[64px]">
                    {s.n}
                  </p>
                  <h3 className="mt-4 text-[18px] font-bold tracking-tight">{s.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-subtle">{s.copy}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={200}>
            <div className="mt-16 text-center">
              <a
                href="#generate"
                className="rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white shadow-sm transition hover:bg-[#0f3d22] active:scale-[0.99]"
              >
                Create your invoice
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Pro pricing */}
      {flags.proTeaser ? <ProPricing /> : null}

      {/* FAQ */}
      <section id="faq" className="scroll-mt-16 px-6 py-16 md:py-28">
        <div className="mx-auto max-w-[720px]">
          <Reveal>
            <h2 className="text-center text-[36px] font-extrabold tracking-tight md:text-[52px]">
              Questions. Answered.
            </h2>
          </Reveal>
          <div className="mt-12 border-t border-[#e5e7eb]">
            {faqs.map((f, i) => (
              <Reveal key={f.q} delay={i * 60}>
                <details className="faq group border-b border-[#e5e7eb]">
                  <summary className="flex items-center justify-between gap-4 py-5 text-left">
                    <span className="text-[17px] font-semibold tracking-tight">{f.q}</span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#6b7280"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="chev shrink-0"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </summary>
                  <p className="-mt-1 pb-6 pr-8 text-[15px] leading-relaxed text-subtle">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Email capture */}
      {flags.emailCapture ? <EmailCapture /> : null}

      {/* Footer */}
      <footer className="border-t border-[#e5e7eb] bg-[#f3f4f6] px-6 py-10">
        <div className="mx-auto max-w-[1024px]">
          <div className="flex flex-col items-center justify-between gap-4 text-[13px] text-subtle md:flex-row">
            <div className="flex items-center gap-2 font-bold text-ink">
              <svg width="18" height="18" viewBox="0 0 64 64" aria-hidden="true">
                <rect width="64" height="64" rx="14.5" fill="#166534" />
                <path d="M35.5 10 19 37h9.5l-3 17L43 27h-9.5l2-17z" fill="#fff" />
              </svg>
              Invoala
            </div>
            <nav className="flex items-center gap-6">
              <a href="#features" className="transition-colors hover:text-ink">Features</a>
              <a href="#faq" className="transition-colors hover:text-ink">FAQ</a>
              <Link href="/privacy" className="transition-colors hover:text-ink">Privacy</Link>
              <Link href="/terms" className="transition-colors hover:text-ink">Terms</Link>
              <a href="mailto:hello@invoala.com" className="transition-colors hover:text-ink">
                Contact
              </a>
            </nav>
            <p>&copy; 2026 Invoala. All rights reserved.</p>
          </div>
          <p className="mt-6 border-t border-[#e5e7eb] pt-5 text-[11px] leading-relaxed text-subtle">
            Invoala is a free online invoice generator for freelancers and small businesses. Create
            professional invoices with your own logo, line items, tax, and multiple currencies — then
            download them as print-ready PDF files. No account required, and your data never leaves
            your browser.
          </p>
        </div>
        <div className="mx-auto max-w-[1024px] pt-5">
          <TrustStrip />
        </div>
      </footer>
    </div>
  );
}
