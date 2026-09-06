import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { hreflangAlternates, localizedPath } from "@/lib/i18n";
import { SeoFooter } from "@/components/seo/SeoPage";
import { InvoiceGenerator } from "@/components/InvoiceGenerator";
import { getCurrentUser } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Rechnungsersteller — Professionelle Rechnungen in Sekunden Erstellen",
    description:
      "Invoala ist ein Rechnungsersteller, der Ihnen hilft, in Sekunden professionelle Rechnungen zu erstellen. Schnell, kostenlos und ohne Anmeldung. Laden Sie jetzt ein makelloses PDF herunter.",
    path: "/de/invoice-maker",
    keywords: [
      "Rechnungsersteller",
      "Rechnung erstellen",
      "Rechnung machen",
      "professionelle Rechnung",
      "Rechnungsgenerator",
    ],
    ogDescription:
      "Invoala ist ein Rechnungsersteller, der Ihnen hilft, in Sekunden professionelle Rechnungen zu erstellen. Schnell, kostenlos und ohne Anmeldung.",
    hreflang: hreflangAlternates("/invoice-maker"),
    ogLocale: "de_DE",
  });
}

const faqs = [
  {
    q: "Wie schnell kann ich mit Invoala eine Rechnung erstellen?",
    a: "Die meisten Nutzer erstellen eine vollständige Rechnung in unter zwei Minuten. Wenn Sie Ihre Firmen- und Kundendaten bereits gespeichert haben, geht es noch schneller — wählen Sie einfach einen Kunden aus und fügen Sie Ihre Positionen hinzu.",
  },
  {
    q: "Ist der Rechnungsersteller kostenlos?",
    a: "Ja. Invoalas Rechnungsersteller ist komplett kostenlos — keine Testphasen, keine Bezahlschranken, keine Wasserzeichen. Erstellen Sie unbegrenzt Rechnungen und laden Sie professionelle PDFs herunter, ohne etwas zu bezahlen.",
  },
  {
    q: "Brauche ich technische Fähigkeiten, um eine Rechnung zu erstellen?",
    a: "Überhaupt nicht. Der Rechnungsersteller nutzt ein einfaches Formular — geben Sie Ihre Daten ein, fügen Sie Positionen hinzu und klicken Sie auf Herunterladen. Keine Designkenntnisse, keine Tabellenformeln, keine Lernkurve.",
  },
  {
    q: "Kann ich das Aussehen meiner Rechnung anpassen?",
    a: "Ja. Fügen Sie Ihr Logo hinzu, wählen Sie Ihre Währung, legen Sie Ihren Steuersatz fest und fügen Sie Zahlungshinweise hinzu. Der Rechnungsersteller übernimmt das professionelle Layout automatisch.",
  },
  {
    q: "Welches Dateiformat erstellt der Rechnungsersteller?",
    a: "PDF — ein sauberes, druckfertiges A4-Dokument, das auf jedem Gerät identisch aussieht und auf jedem Drucker perfekt druckt. Hängen Sie es an eine E-Mail an oder drucken Sie es direkt aus.",
  },
  {
    q: "Kann ich Rechnungen in verschiedenen Währungen erstellen?",
    a: "Ja. Invoala unterstützt 154 Weltwährungen. Wählen Sie Ihre Währung aus dem Dropdown, und der Rechnungsersteller formatiert Symbol und Dezimalstellen automatisch.",
  },
  {
    q: "Wie unterscheidet sich das von Word oder Excel?",
    a: "Word und Excel erfordern manuelle Formatierung und Formel-Einrichtung. Invoalas Rechnungsersteller ist speziell dafür gebaut — Sie erhalten automatische Summen, Steuerberechnung, professionelle Formatierung und PDF-Download in einem Schritt.",
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

export default async function InvoiceMakerPageDe() {
  const user = await getCurrentUser();

  return (
    <>
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
          <Link
            href="/#generate"
            className="rounded-lg bg-[#14532d] px-5 py-2 text-[14px] font-semibold text-white transition hover:bg-[#0f3d22]"
          >
            Rechnung Erstellen
          </Link>
        </div>
      </nav>

      <main className="pt-28 pb-16">
        <div className="mx-auto max-w-[1200px] px-6">
          {/* Hero */}
          <section className="mb-12 text-center">
            <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[56px]">
              Rechnungsersteller — Professionelle Rechnungen in Sekunden Erstellen
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              Der schnellste Weg, eine professionelle Rechnung zu
              erstellen. Keine Lernkurve, keine Anmeldung, keine Limits.
              Füllen Sie einfach das Formular aus und laden Sie ein
              makelloses PDF herunter.
            </p>
            <p className="mt-4 text-[14px] text-[#9ca3af]">
              Für immer kostenlos &middot; Keine Anmeldung &middot; Keine Kreditkarte erforderlich
            </p>
          </section>

          {/* Embedded generator */}
          <section className="mb-20">
            <InvoiceGenerator
              user={user ? { email: user.email } : null}
            />
          </section>

          {/* Speed & ease */}
          <section className="mb-20 mx-auto max-w-[1024px]">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Rechnungen in Sekunden statt Minuten erstellen
            </h2>
            <div className="mt-8 grid gap-12 sm:grid-cols-3">
              {[
                {
                  n: "01",
                  title: "Geben Sie Ihre Daten ein",
                  desc: "Firmenname, Kundendaten, Positionen. Das Formular ist kurz und intuitiv — kein Training nötig.",
                },
                {
                  n: "02",
                  title: "Sehen Sie die Vorschau",
                  desc: "Sehen Sie zu, wie Ihre Rechnung in Echtzeit Gestalt annimmt, während Sie tippen. Passen Sie alles vor dem Herunterladen an.",
                },
                {
                  n: "03",
                  title: "Laden Sie das PDF herunter",
                  desc: "Ein Klick gibt Ihnen eine druckfertige A4-Rechnung. Senden Sie sie an Ihren Kunden und werden Sie bezahlt.",
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

          {/* Why use an invoice maker */}
          <section className="mb-20 mx-auto max-w-[1024px] rounded-xl bg-[#f3f4f6] p-8 md:p-12">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Warum einen Rechnungsersteller statt einer Tabellenkalkulation nutzen?
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              {[
                {
                  title: "Keine Formeln zu pflegen",
                  desc: "Tabellenkalkulationen brechen, wenn Sie Zeilen hinzufügen oder Steuersätze ändern. Ein Rechnungsersteller übernimmt die Mathematik automatisch.",
                },
                {
                  title: "Professionelles Ergebnis",
                  desc: "Tabellenkalkulationen sehen aus wie Tabellenkalkulationen. Ein Rechnungsersteller erstellt ein sauberes PDF, das wie von einem Designer gemacht aussieht.",
                },
                {
                  title: "Schnellerer Arbeitsablauf",
                  desc: "Keine Einrichtung, keine Vorlagen zu konfigurieren. Öffnen Sie das Tool, füllen Sie das Formular aus und laden Sie herunter — fertig in Minuten.",
                },
                {
                  title: "Keine Dateiverwaltung",
                  desc: "Kein Speichern, Benennen oder Organisieren von .xlsx-Dateien. Ihre Rechnung wird jedes Mal neu erstellt und als PDF heruntergeladen.",
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

          {/* Features */}
          <section className="mb-20 mx-auto max-w-[1024px]">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Alles, was der Rechnungsersteller bietet
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Logo-Upload",
                  desc: "Fügen Sie Ihr Firmenlogo für einen markengerechten Look hinzu.",
                },
                {
                  title: "KI-Erstellung",
                  desc: "Beschreiben Sie den Auftrag, und die KI erstellt die Rechnung für Sie.",
                },
                {
                  title: "Steuerberechnung",
                  desc: "MwSt., GST oder Umsatzsteuer — automatisch berechnet.",
                },
                {
                  title: "154 Währungen",
                  desc: "Berechnen Sie Kunden weltweit mit korrekter Formatierung.",
                },
                {
                  title: "Live-Vorschau",
                  desc: "Sehen Sie Ihre Rechnung während der Eingabe in Echtzeit aktualisiert.",
                },
                {
                  title: "PDF-Export",
                  desc: "Druckfertiges A4-Format für jedes Gerät oder jeden Drucker.",
                },
                {
                  title: "Kundenspeicherung",
                  desc: "Speichern Sie Kundendaten für schnellere zukünftige Rechnungen.",
                },
                {
                  title: "Zahlungsbedingungen",
                  desc: "Legen Sie Fälligkeitsdaten, Zahlungsarten und Mahngebühr-Hinweise fest.",
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
              Erstellen Sie jetzt Ihre erste Rechnung
            </h2>
            <p className="mt-2 text-[16px] text-[#6b7280]">
              Scrollen Sie nach oben zum Rechnungsersteller und beginnen
              Sie mit dem Ausfüllen Ihrer Daten. Ein professionelles PDF
              ist nur wenige Klicks entfernt.
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
                <Link href={localizedPath("/invoice-generator", "de")} className="text-[#166534] hover:underline">
                  Rechnungsgenerator
                </Link>
              </li>
              <li>
                <Link href="/receipt-generator" className="text-[#166534] hover:underline">
                  Kostenloser Rechnungsgenerator
                </Link>
              </li>
              <li>
                <Link href={localizedPath("/online-invoicing", "de")} className="text-[#166534] hover:underline">
                  Online-Rechnungsstellung
                </Link>
              </li>
              <li>
                <Link href={localizedPath("/invoicing-software", "de")} className="text-[#166534] hover:underline">
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
