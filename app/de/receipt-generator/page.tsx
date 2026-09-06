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
    title: "Quittungsgenerator — Erstellen Sie Professionelle Quittungen Kostenlos",
    description:
      "Erstellen Sie in Sekunden eine professionelle Quittung. Erfassen Sie Zahlungen, zeigen Sie, was wann bezahlt wurde, und laden Sie eine druckfertige PDF-Quittung herunter. Kostenlos, keine Anmeldung.",
    path: "/de/receipt-generator",
    keywords: [
      "Quittungsgenerator",
      "kostenloser Quittungsersteller",
      "Quittung erstellen",
      "Zahlungsquittung",
      "Verkaufsquittung",
    ],
    ogDescription:
      "Erstellen Sie in Sekunden eine professionelle Quittung. Erfassen Sie Zahlungen und laden Sie eine druckfertige PDF herunter. Kostenlos, keine Anmeldung.",
    hreflang: hreflangAlternates("/receipt-generator"),
    ogLocale: "de_DE",
  });
}

const faqs = [
  {
    q: "Was ist der Unterschied zwischen einer Rechnung und einer Quittung?",
    a: "Eine Rechnung fordert eine Zahlung an; eine Quittung bestätigt, dass die Zahlung eingegangen ist. Nachdem ein Kunde Ihre Rechnung bezahlt hat, senden Sie eine Quittung mit dem gezahlten Betrag, dem Datum und dem Zweck.",
  },
  {
    q: "Wann sollte ich eine Quittung senden?",
    a: "Senden Sie jedes Mal eine Quittung, wenn Sie eine Zahlung erhalten — teilweise oder vollständig. Kunden benötigen Quittungen oft für ihre eigene Buchhaltung, Spesenabrechnungen und Steuerunterlagen.",
  },
  {
    q: "Ist dieser Quittungsgenerator kostenlos?",
    a: "Ja. Erstellen Sie unbegrenzt Quittungen ohne Wasserzeichen und ohne Anmeldung. Füllen Sie das Formular aus, sehen Sie sich die Live-Vorschau an und laden Sie eine druckfertige PDF herunter.",
  },
  {
    q: "Kann ich mein Logo und meine Firmendaten hinzufügen?",
    a: "Ja. Laden Sie Ihr Logo hoch, geben Sie Firmenname, Adresse und E-Mail ein. Ihre Quittung enthält einen BEZAHLT-Vermerk und eine klare Positionsübersicht.",
  },
  {
    q: "Benötigen Quittungen eine Rechnungsnummer?",
    a: "Quittungen verweisen normalerweise auf ihre eigene Nummer oder die zugehörige Rechnung. Verwenden Sie das Nummernfeld für eine Quittungsnummer (z. B. RCPT-001) oder fügen Sie die Rechnungsnummer als benutzerdefiniertes Feld hinzu.",
  },
  {
    q: "Kann ich Teilzahlungen erfassen?",
    a: "Ja. Listen Sie nur die Positionen oder Beträge auf, die durch diese Zahlung abgedeckt sind. Notieren Sie bei einer Teilzahlung den verbleibenden Restbetrag im Bemerkungsfeld.",
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

export default async function ReceiptGeneratorPageDe() {
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
              Quittungsgenerator
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              Bestätigen Sie jede Zahlung mit einer professionellen
              Quittung. Der Generator unten ist auf den Quittungsmodus
              eingestellt — fügen Sie hinzu, was wann und von wem bezahlt
              wurde, und laden Sie dann ein makelloses PDF herunter.
            </p>
            <p className="mt-4 text-[14px] text-[#9ca3af]">
              Für immer kostenlos &middot; Keine Anmeldung &middot; Kein Wasserzeichen
            </p>
          </section>

          <section className="mb-20">
            <InvoiceGenerator
              user={user ? { email: user.email } : null}
              preset={{
                docType: "receipt",
                invoiceNumber: "RCPT-001",
                notes: "Vielen Dank für Ihr Vertrauen!",
              }}
              ai={false}
              quoteMode
            />
          </section>

          <section className="mb-20 mx-auto max-w-[1024px]">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Von der Rechnung zur Quittung in einem Schritt
            </h2>
            <div className="mt-8 grid gap-12 sm:grid-cols-3">
              {[
                {
                  n: "01",
                  title: "Zahlung erfassen",
                  desc: "Geben Sie ein, was wann bezahlt wurde. Die Quittung zeigt das Zahlungsdatum anstelle eines Fälligkeitsdatums an.",
                },
                {
                  n: "02",
                  title: "Positionen auflisten",
                  desc: "Listen Sie die Produkte oder Dienstleistungen auf, die die Zahlung abdeckt, genau wie auf der ursprünglichen Rechnung.",
                },
                {
                  n: "03",
                  title: "Herunterladen und senden",
                  desc: "Erhalten Sie eine druckfertige PDF-Quittung mit einem BEZAHLT-Vermerk. Per E-Mail senden oder direkt vor Ort übergeben.",
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
              Warum überhaupt Quittungen versenden?
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              {[
                {
                  title: "Zahlungsnachweis",
                  desc: "Quittungen dokumentieren, dass Geld den Besitzer gewechselt hat — das schützt Sie und Ihren Kunden, falls später Fragen auftauchen.",
                },
                {
                  title: "Kunden erwarten sie",
                  desc: "Geschäftskunden benötigen Quittungen für Spesenabrechnungen und Steuererklärungen. Eine automatisch zu senden macht die Zusammenarbeit mit Ihnen einfach.",
                },
                {
                  title: "Saubere Unterlagen",
                  desc: "Eine nummerierte Quittungshistorie erleichtert den Abgleich zur Steuerzeit, besonders bei Bar- und Kartenzahlungen.",
                },
                {
                  title: "Professionelle Nachbereitung",
                  desc: "Eine Zahlung mit einer Quittung zu bestätigen ist eine professionelle Geste, die die Transaktion positiv abschließt.",
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
                <Link href="/estimate-generator" className="text-[#166534] hover:underline">
                  Kostenvoranschlag-Generator
                </Link>
              </li>
              <li>
                <Link href="/learn/invoice-vs-receipt" className="text-[#166534] hover:underline">
                  Rechnung vs. Quittung: Was ist der Unterschied?
                </Link>
              </li>
              <li>
                <Link href="/invoice-payment-tracking" className="text-[#166534] hover:underline">
                  Rechnungszahlungsverfolgung
                </Link>
              </li>
              <li>
                <Link href="/learn/how-to-track-unpaid-invoices" className="text-[#166534] hover:underline">
                  Wie man Unbezahlte Rechnungen Verfolgt
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
