import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { hreflangAlternates, localizedPath } from "@/lib/i18n";
import { SeoFooter } from "@/components/seo/SeoPage";
import { SeoNavMobile } from "@/components/SeoNavMobile";
import { SetHtmlLang } from "@/components/SetHtmlLang";
import { InvoiceGenerator } from "@/components/InvoiceGenerator";
import { getCurrentUser } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Kostenvoranschlag-Generator — Kostenlose Kostenvoranschläge",
    description:
      "Erstellen Sie in Sekunden einen professionellen Kostenvoranschlag. Skizzieren Sie Kosten, bevor die Arbeit beginnt, gewinnen Sie das Projekt und wandeln Sie den Kostenvoranschlag dann mit einem Klick in eine Rechnung um. Kostenlos, keine Anmeldung.",
    path: "/de/estimate-generator",
    keywords: [
      "Kostenvoranschlag-Generator",
      "kostenloser Kostenvoranschlag erstellen",
      "Kostenvoranschlag",
      "Kostenschätzung",
      "Kostenvoranschlag-Vorlage",
    ],
    ogDescription:
      "Erstellen Sie in Sekunden einen professionellen Kostenvoranschlag und wandeln Sie ihn nach Genehmigung der Arbeit in eine Rechnung um. Kostenlos, keine Anmeldung.",
    hreflang: hreflangAlternates("/estimate-generator"),
    ogLocale: "de_DE",
  });
}

const faqs = [
  {
    q: "Was ist der Unterschied zwischen einem Kostenvoranschlag und einem Angebot?",
    a: "Beide skizzieren Kosten vor Arbeitsbeginn. Ein Kostenvoranschlag ist meist eine ungefähre Zahl, die sich noch ändern kann; ein Angebot ist ein Festpreis, an den der Kunde Sie binden kann. Invoalas Kostenvoranschlags-Modus zeigt einen geschätzten Gesamtbetrag und ein Gültigkeitsdatum an.",
  },
  {
    q: "Was sollte ein Kostenvoranschlag enthalten?",
    a: "Ihre Firmendaten, die Kundendaten, eine Beschreibung der Arbeit als Positionen, Mengen und Sätze, einen geschätzten Gesamtbetrag und wie lange der Kostenvoranschlag gültig ist.",
  },
  {
    q: "Kann ich einen Kostenvoranschlag in eine Rechnung umwandeln?",
    a: "Ja. Wenn der Kunde zustimmt, klicken Sie auf „In Rechnung umwandeln\" — dieselben Positionen werden übernommen und ein Fälligkeitsdatum wird automatisch festgelegt. Kein erneutes Eintippen.",
  },
  {
    q: "Sind Kostenvoranschläge rechtlich bindend?",
    a: "Kostenvoranschläge sind in der Regel nicht bindend, sofern Sie nichts anderes angeben. Ein Angebot wird als festes Angebot behandelt. Notieren Sie immer einen Gültigkeitszeitraum, damit alte Preise Sie nicht später einholen.",
  },
  {
    q: "Ist der Kostenvoranschlag-Generator kostenlos?",
    a: "Ja — keine Anmeldung, kein Wasserzeichen, keine Limits. Laden Sie so viele Kostenvoranschlag-PDFs herunter, wie Sie brauchen.",
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

export default async function EstimateGeneratorPageDe() {
  const user = await getCurrentUser();

  return (
    <>
      <SetHtmlLang lang="de" />
      <FaqJsonLd />

      <nav className="fixed inset-x-0 top-0 z-40 border-b border-[#e5e7eb] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1024px] items-center justify-between px-6">
          <Link href={localizedPath("/", "de")} className="flex items-center gap-2 font-bold text-[#111827]">
            <svg width="20" height="20" viewBox="0 0 64 64" aria-hidden="true">
              <rect width="64" height="64" rx="14.5" fill="#166534" />
              <path d="M35.5 10 19 37h9.5l-3 17L43 27h-9.5l2-17z" fill="#fff" />
            </svg>
            Invoala
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/dashboard?tab=general"
                className="hidden rounded-lg border border-[#e5e7eb] px-4 py-2 text-[14px] font-semibold text-[#111827] transition hover:border-[#166534] hover:text-[#166534] md:block"
              >
                Dashboard
              </Link>
            ) : null}
            <Link
              href="/#generate"
              className="rounded-lg bg-[#14532d] px-5 py-2 text-[14px] font-semibold text-white transition hover:bg-[#0f3d22]"
            >
              Rechnung Erstellen
            </Link>
            <SeoNavMobile locale="de" />
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-16">
        <div className="mx-auto max-w-[1200px] px-6">
          <section className="mb-12 text-center">
            <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[56px]">
              Kostenvoranschlag-Generator
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              Kalkulieren Sie Ihren nächsten Auftrag, bevor Sie beginnen.
              Der Generator unten ist im Kostenvoranschlags-Modus —
              skizzieren Sie die Arbeit, legen Sie ein Gültigkeitsdatum
              fest und wandeln Sie ihn in eine Rechnung um, sobald der
              Kunde zustimmt.
            </p>
            <p className="mt-4 text-[14px] text-[#9ca3af]">
              Für immer kostenlos &middot; Keine Anmeldung &middot; Kein Wasserzeichen
            </p>
          </section>

          <section className="mb-20">
            <InvoiceGenerator
              user={user ? { email: user.email } : null}
              preset={{
                docType: "estimate",
                invoiceNumber: "EST-001",
                notes: "Dieser Kostenvoranschlag ist 30 Tage gültig.",
              }}
              ai={false}
              quoteMode
            />
          </section>

          <section className="mb-20 mx-auto max-w-[1024px]">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Kostenvoranschlag &rarr; genehmigt &rarr; Rechnung
            </h2>
            <div className="mt-8 grid gap-12 sm:grid-cols-3">
              {[
                {
                  n: "01",
                  title: "Kalkulieren Sie den Auftrag",
                  desc: "Gliedern Sie die Arbeit in Positionen mit Mengen und Sätzen. Der geschätzte Gesamtbetrag wird live aktualisiert.",
                },
                {
                  n: "02",
                  title: "Zur Genehmigung senden",
                  desc: "Laden Sie ein professionelles Kostenvoranschlag-PDF mit Gültigkeitsdatum herunter. Der Kunde weiß genau, was er genehmigt.",
                },
                {
                  n: "03",
                  title: "Nach Genehmigung umwandeln",
                  desc: "Klicken Sie auf „In Rechnung umwandeln\", und der Kostenvoranschlag wird zu einer echten Rechnung mit Fälligkeitsdatum — nichts erneut eintippen.",
                },
              ].map((s) => (
                <div key={s.n}>
                  <p className="text-[56px] font-extrabold leading-none tracking-tight text-[#166534]/60">
                    {s.n}
                  </p>
                  <h3 className="mt-4 text-[18px] font-bold tracking-tight text-[#111827]">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[#6b7280]">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-20 mx-auto max-w-[1024px] rounded-xl bg-[#f3f4f6] p-8 md:p-12">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Kostenvoranschläge, die Aufträge gewinnen
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              {[
                {
                  title: "Klarer Umfang, weniger Streit",
                  desc: "Ein nach Positionen aufgeschlüsselter Kostenvoranschlag zeigt dem Kunden genau, wofür er bezahlt — und was nicht enthalten ist.",
                },
                {
                  title: "Schnellere Entscheidungen",
                  desc: "Professionelle Formatierung und ein Gültigkeitsdatum schaffen sanfte Dringlichkeit ohne Drucktaktik.",
                },
                {
                  title: "Einheitliche Preise",
                  desc: "Nutzen Sie gespeicherte Positionen und Kunden, damit wiederkehrende Aufträge jedes Mal gleich kalkuliert werden.",
                },
                {
                  title: "Null erneutes Eintippen",
                  desc: "Sobald der Kostenvoranschlag genehmigt ist, wandeln Sie ihn direkt in eine Rechnung mit denselben Positionen und Beträgen um.",
                },
              ].map((item) => (
                <div key={item.title}>
                  <h3 className="text-[17px] font-bold tracking-tight text-[#111827]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[#6b7280]">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-20 mx-auto max-w-[1024px] border-t border-[#e5e7eb] pt-8">
            <h3 className="text-[16px] font-semibold">Verwandte Seiten</h3>
            <ul className="mt-3 space-y-2 text-[15px]">
              <li>
                <Link href={localizedPath("/invoice-generator", "de")} className="text-[#166534] hover:underline">
                  Rechnungsgenerator
                </Link>
              </li>
              <li>
                <Link href="/receipt-generator" className="text-[#166534] hover:underline">
                  Quittungsgenerator
                </Link>
              </li>
              <li>
                <Link href="/estimates-and-invoices" className="text-[#166534] hover:underline">
                  Kostenvoranschläge &amp; Rechnungen
                </Link>
              </li>
              <li>
                <Link href="/learn/invoice-vs-estimate" className="text-[#166534] hover:underline">
                  Rechnung vs. Kostenvoranschlag: Wann Was Senden
                </Link>
              </li>
              <li>
                <Link href="/templates" className="text-[#166534] hover:underline">
                  Rechnungsvorlagen
                </Link>
              </li>
            </ul>
          </section>

          <section className="mb-20 mx-auto max-w-[1024px]">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Häufig gestellte Fragen
            </h2>
            <div className="mt-8 border-t border-[#e5e7eb]">
              {faqs.map((f) => (
                <details
                  key={f.q}
                  className="group border-b border-[#e5e7eb]"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-4 py-5 text-left">
                    <span className="text-[17px] font-semibold tracking-tight text-[#111827]">
                      {f.q}
                    </span>
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
                      className="shrink-0"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </summary>
                  <p className="-mt-1 pb-6 pr-8 text-[15px] leading-relaxed text-[#6b7280]">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </main>

      <SeoFooter locale="de" />
    </>
  );
}
