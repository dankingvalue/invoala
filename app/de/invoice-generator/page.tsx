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
    title: "Kostenloser Rechnungsgenerator — Professionelle Rechnungen Online Erstellen",
    description:
      "Nutzen Sie den kostenlosen Rechnungsgenerator von Invoala, um in Sekunden professionelle Rechnungen zu erstellen. Keine Anmeldung erforderlich — füllen Sie einfach das Formular aus und laden Sie ein makelloses PDF herunter.",
    path: "/de/invoice-generator",
    keywords: [
      "Rechnungsgenerator",
      "kostenloser Rechnungsgenerator",
      "Online-Rechnungsgenerator",
      "Rechnung erstellen",
    ],
    ogDescription:
      "Nutzen Sie den kostenlosen Rechnungsgenerator von Invoala, um in Sekunden professionelle Rechnungen zu erstellen. Keine Anmeldung erforderlich.",
    hreflang: hreflangAlternates("/invoice-generator"),
    ogLocale: "de_DE",
  });
}

const faqs = [
  {
    q: "Wie benutze ich den Rechnungsgenerator?",
    a: "Geben Sie Ihre Firmendaten ein, fügen Sie die Angaben Ihres Kunden hinzu, tragen Sie Positionen mit Mengen und Sätzen ein, legen Sie bei Bedarf einen Steuersatz fest und klicken Sie auf Herunterladen. Sie erhalten in Sekunden ein professionelles PDF.",
  },
  {
    q: "Ist der Rechnungsgenerator wirklich kostenlos?",
    a: "Ja. Keine versteckten Gebühren, keine Wasserzeichen und keine Limits. Erstellen Sie so viele Rechnungen, wie Sie brauchen — für immer.",
  },
  {
    q: "Muss ich ein Konto erstellen, um den Generator zu nutzen?",
    a: "Nein. Der Rechnungsgenerator funktioniert sofort, ohne Anmeldung. Öffnen Sie die Seite, geben Sie Ihre Daten ein und laden Sie Ihre Rechnung herunter.",
  },
  {
    q: "Kann ich mein Logo zur Rechnung hinzufügen?",
    a: "Ja. Klicken Sie im Formular auf den Logo-Upload-Bereich, um das Logo Ihres Unternehmens hinzuzufügen. Es erscheint oben auf jeder Rechnung für einen professionellen Look.",
  },
  {
    q: "Welche Währungen unterstützt der Generator?",
    a: "Invoala unterstützt 154 Weltwährungen, darunter USD, EUR, GBP, JPY, CAD, AUD und viele mehr. Die Rechnung formatiert das Währungssymbol und die Dezimalstellen automatisch.",
  },
  {
    q: "Berechnet der Generator Steuern?",
    a: "Ja. Geben Sie Ihren Steuersatz ein (MwSt., GST, Umsatzsteuer), und die Summe wird während der Eingabe live aktualisiert. Die Aufschlüsselung sehen Sie in der Vorschau.",
  },
  {
    q: "Kann ich meine Rechnungen speichern?",
    a: "Ihre Daten werden automatisch im lokalen Speicher Ihres Browsers gespeichert. Wenn Sie ein kostenloses Konto erstellen, können Sie Rechnungen auch in der Cloud speichern und von jedem Gerät aus darauf zugreifen.",
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

export default async function InvoiceGeneratorPageDe() {
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
          {/* Hero */}
          <section className="mb-12 text-center">
            <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[56px]">
              Kostenloser Rechnungsgenerator
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              Erstellen Sie in Sekunden professionelle Rechnungen. Keine
              Anmeldung, keine Kreditkarte, keine Wasserzeichen. Einfach
              ein sauberes PDF, bereit zum Versand an Ihren Kunden.
            </p>
          </section>

          {/* Embedded generator */}
          <section className="mb-20">
            <InvoiceGenerator
              user={user ? { email: user.email } : null}
            />
          </section>

          {/* How to use */}
          <section className="mb-20 mx-auto max-w-[1024px]">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              So nutzen Sie den Rechnungsgenerator
            </h2>
            <div className="mt-8 grid gap-12 sm:grid-cols-3">
              {[
                {
                  n: "01",
                  title: "Geben Sie Ihre Daten ein",
                  desc: "Geben Sie Firmenname, E-Mail und Adresse ein. Laden Sie Ihr Logo für einen professionellen Auftritt hoch.",
                },
                {
                  n: "02",
                  title: "Beschreiben Sie Ihre Arbeit",
                  desc: "Fügen Sie Positionen mit Beschreibungen, Mengen und Sätzen hinzu. Oder nutzen Sie KI, um sie aus einfachem Text zu erstellen.",
                },
                {
                  n: "03",
                  title: "Laden Sie das PDF herunter",
                  desc: "Klicken Sie auf die Download-Schaltfläche, um eine makellose A4-Rechnung zu erhalten. Hängen Sie sie an eine E-Mail an und senden Sie sie an Ihren Kunden.",
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

          {/* What's included */}
          <section className="mb-20 mx-auto max-w-[1024px] rounded-xl bg-[#f3f4f6] p-8 md:p-12">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Das ist in jeder Rechnung enthalten
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Professionelles Layout",
                  desc: "Klare Typografie und Abstände, die Ihre Arbeit hochwertig aussehen lassen.",
                },
                {
                  title: "Ihre Marke",
                  desc: "Fügen Sie Ihr Logo und Ihre Firmendaten für ein einheitliches Markenerlebnis hinzu.",
                },
                {
                  title: "Positionen",
                  desc: "Detaillierte Aufschlüsselung von Dienstleistungen oder Produkten mit Mengen und Sätzen.",
                },
                {
                  title: "Steueraufschlüsselung",
                  desc: "Automatische Berechnung von MwSt., GST oder Umsatzsteuer mit klarer Übersicht.",
                },
                {
                  title: "Zahlungsbedingungen",
                  desc: "Fälligkeitsdaten, Zahlungsarten und Hinweise, damit Kunden genau wissen, wie sie zahlen sollen.",
                },
                {
                  title: "Druckfertiges PDF",
                  desc: "A4-Format, das perfekt druckt und auf jedem Gerät identisch aussieht.",
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="rounded-xl border border-[#e5e7eb] bg-white p-6"
                >
                  <h3 className="text-[16px] font-bold tracking-tight text-[#111827]">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-[#6b7280]">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="mb-20 mx-auto max-w-[1024px] rounded-xl bg-[#f3f4f6] p-8 text-center">
            <h2 className="text-[24px] font-bold tracking-tight">
              Bereit, Ihre Rechnung zu erstellen?
            </h2>
            <p className="mt-2 text-[16px] text-[#6b7280]">
              Scrollen Sie nach oben und beginnen Sie mit dem Ausfüllen
              des Formulars. Ihre erste professionelle Rechnung ist nur
              Minuten entfernt.
            </p>
            <Link
              href="/#generate"
              className="mt-6 inline-block rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0f3d22]"
            >
              Rechnung Erstellen
            </Link>
          </section>

          {/* Related links */}
          <section className="mb-20 mx-auto max-w-[1024px] border-t border-[#e5e7eb] pt-8">
            <h3 className="text-[16px] font-semibold">Verwandte Seiten</h3>
            <ul className="mt-3 space-y-2 text-[15px]">
              <li>
                <Link href="/receipt-generator" className="text-[#166534] hover:underline">
                  Quittungsgenerator
                </Link>
              </li>
              <li>
                <Link href="/invoice-maker" className="text-[#166534] hover:underline">
                  Rechnungsersteller
                </Link>
              </li>
              <li>
                <Link href="/online-invoicing" className="text-[#166534] hover:underline">
                  Online-Rechnungsstellung
                </Link>
              </li>
              <li>
                <Link href="/invoicing-software" className="text-[#166534] hover:underline">
                  Rechnungssoftware
                </Link>
              </li>
              <li>
                <Link href="/invoicing-for-freelancers" className="text-[#166534] hover:underline">
                  Rechnungsstellung für Freelancer
                </Link>
              </li>
            </ul>
          </section>

          {/* FAQ */}
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
