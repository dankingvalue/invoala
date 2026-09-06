/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { hreflangAlternates, localizedPath } from "@/lib/i18n";
import { SeoFooter } from "@/components/seo/SeoPage";
import { SetHtmlLang } from "@/components/SetHtmlLang";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Online-Rechnungsstellung — Rechnungen von Überall Erstellen und Senden",
    description:
      "Erstellen und versenden Sie professionelle Rechnungen von jedem Gerät aus mit Invoalas kostenlosem Online-Rechnungstool. Keine Software zu installieren — öffnen Sie einfach Ihren Browser und legen Sie los.",
    path: "/de/online-invoicing",
    keywords: [
      "Online-Rechnungsstellung",
      "Online-Rechnung",
      "Rechnung online erstellen",
      "Rechnung online senden",
      "kostenlose Online-Rechnungsstellung",
    ],
    ogDescription:
      "Erstellen und versenden Sie professionelle Rechnungen von jedem Gerät aus mit Invoalas kostenlosem Online-Rechnungstool. Keine Software zu installieren.",
    hreflang: hreflangAlternates("/online-invoicing"),
    ogLocale: "de_DE",
  });
}

const faqs = [
  {
    q: "Was ist Online-Rechnungsstellung?",
    a: "Mit Online-Rechnungsstellung erstellen und versenden Sie Rechnungen über einen Webbrowser statt über Desktop-Software. Sie füllen ein Formular aus, das Tool erstellt ein professionelles PDF, und Sie können es herunterladen oder direkt an Ihren Kunden per E-Mail senden.",
  },
  {
    q: "Ist Online-Rechnungsstellung sicher?",
    a: "Ja. Invoala verarbeitet alles in Ihrem Browser — Ihre Daten berühren nie einen Server, es sei denn, Sie speichern sie ausdrücklich. Ihre Firmendaten und Kundendaten bleiben auf Ihrem Gerät.",
  },
  {
    q: "Kann ich Online-Rechnungsstellung auf meinem Handy nutzen?",
    a: "Auf jeden Fall. Invoala funktioniert auf jedem Gerät mit Webbrowser — Handy, Tablet oder Laptop. Die Oberfläche passt sich Ihrer Bildschirmgröße an, sodass Sie von überall Rechnungen stellen können.",
  },
  {
    q: "Muss ich für die Online-Rechnungsstellung etwas installieren?",
    a: "Nein. Online-Rechnungsstellung läuft vollständig in Ihrem Browser. Es gibt nichts herunterzuladen, zu installieren oder zu aktualisieren. Öffnen Sie einfach die Website und beginnen Sie mit dem Erstellen von Rechnungen.",
  },
  {
    q: "Wie schnell kann ich eine Rechnung online versenden?",
    a: "Die meisten Nutzer erstellen und laden eine Rechnung in unter zwei Minuten herunter. Wenn Sie die Kundendaten bereits gespeichert haben, geht es noch schneller — wählen Sie einfach den Kunden aus und fügen Sie Ihre Positionen hinzu.",
  },
  {
    q: "Kann ich Online-Rechnungen nach dem Versand verfolgen?",
    a: "Ja. Mit Invoala können Sie Rechnungen als bezahlt, ausstehend oder überfällig markieren, sodass Sie immer Ihren Zahlungsstatus kennen. Sie sehen alle Ihre Rechnungen und deren Status auf einen Blick.",
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

export default function OnlineInvoicingPageDe() {
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
          <Link
            href="/#generate"
            className="rounded-lg bg-[#14532d] px-5 py-2 text-[14px] font-semibold text-white transition hover:bg-[#0f3d22]"
          >
            Rechnung Erstellen
          </Link>
        </div>
      </nav>

      <main className="pt-28 pb-16">
        <div className="mx-auto max-w-[1024px] px-6">
          {/* Hero */}
          <section className="mb-20 text-center">
            <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[56px]">
              Online-Rechnungsstellung — Rechnungen von Überall Erstellen und Senden
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              Ihr Laptop, Ihr Handy, Ihr Tablet — erstellen Sie
              professionelle Rechnungen auf jedem Gerät mit
              Internetverbindung. Keine Software zu installieren, keine
              Dateien zu synchronisieren.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                href="/#generate"
                className="rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0f3d22]"
              >
                Jetzt mit der Rechnungsstellung beginnen
              </Link>
              <Link
                href={localizedPath("/invoice-generator", "de")}
                className="text-[16px] font-medium text-[#166534] hover:underline"
              >
                Sehen Sie, wie es funktioniert &rsaquo;
              </Link>
            </div>
          </section>

          {/* What is online invoicing */}
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Was ist Online-Rechnungsstellung?
            </h2>
            <div className="mt-6 space-y-4 text-[16px] leading-relaxed text-[#374151]">
              <p>
                Online-Rechnungsstellung bedeutet, Rechnungen über einen
                Webbrowser zu erstellen, zu versenden und zu verwalten.
                Statt sich auf Desktop-Software oder
                Tabellenkalkulations-Vorlagen zu verlassen, nutzen Sie
                ein dediziertes Online-Tool, das Formatierung,
                Berechnungen und PDF-Erstellung für Sie übernimmt.
              </p>
              <p>
                Der größte Vorteil ist die Zugänglichkeit. Sie können
                eine Rechnung von jedem Gerät aus erstellen — Ihrem
                Büro-Desktop, Ihrem Laptop zu Hause oder Ihrem Handy,
                während Sie auf einer Baustelle sind. Es gibt nichts zu
                installieren, nichts zu aktualisieren und nichts
                zwischen Geräten zu synchronisieren.
              </p>
              <p>
                Invoala geht noch weiter, indem alle Ihre Daten in Ihrem
                Browser bleiben. Nichts wird auf einen Server
                hochgeladen, es sei denn, Sie entscheiden sich, es in
                einem Konto zu speichern, sodass Ihre Geschäftsdaten
                privat bleiben.
              </p>
            </div>
          </section>

          {/* Benefits */}
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 md:p-12">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Vorteile der Online-Rechnungsstellung mit Invoala
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              {[
                {
                  title: "Zugriff von überall",
                  desc: "Erstellen Sie Rechnungen von jedem Gerät mit Browser. Arbeiten Sie von zu Hause, dem Büro oder beim Kunden — Ihre Rechnungsstellung ist immer dabei.",
                },
                {
                  title: "Keine Software zu installieren",
                  desc: "Sparen Sie sich Downloads, Updates und Kompatibilitätsprobleme. Online-Rechnungsstellung läuft vollständig in Ihrem Browser.",
                },
                {
                  title: "Sofortige Zustellung",
                  desc: "Laden Sie ein PDF herunter und senden Sie es in Sekunden per E-Mail an Ihren Kunden. Kein Drucken, kein Scannen, keine Postverzögerungen.",
                },
                {
                  title: "Immer aktuell",
                  desc: "Sie verwenden immer die neueste Version. Keine Patch-Notizen, keine Update-Hinweise, keine Funktionsverzögerung.",
                },
                {
                  title: "Funktioniert auf jedem Gerät",
                  desc: "Responsives Design sorgt für ein reibungsloses Rechnungserlebnis auf Handys, Tablets und Desktops gleichermaßen.",
                },
                {
                  title: "Kein Datenverlust",
                  desc: "Ihre Rechnungsdaten werden automatisch im lokalen Speicher Ihres Browsers gespeichert. Schließen Sie den Tab, kommen Sie später zurück — sie sind noch da.",
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

          {/* How it works */}
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              So funktioniert Online-Rechnungsstellung
            </h2>
            <div className="mt-8 grid gap-12 sm:grid-cols-3">
              {[
                {
                  n: "01",
                  title: "Invoala öffnen",
                  desc: "Navigieren Sie in Ihrem Browser zum Rechnungsgenerator. Keine Anmeldung nötig — Sie können sofort loslegen.",
                },
                {
                  n: "02",
                  title: "Details ausfüllen",
                  desc: "Fügen Sie Ihre Firmendaten, Kundendaten, Positionen und Steuersatz hinzu. Das Formular speichert Ihre Angaben für das nächste Mal.",
                },
                {
                  n: "03",
                  title: "Herunterladen und senden",
                  desc: "Klicken Sie auf Herunterladen, um ein professionelles PDF zu erhalten. Hängen Sie es an eine E-Mail an, senden Sie es über Invoala, oder teilen Sie einen Link.",
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

          {/* Security */}
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 md:p-12">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Ist Online-Rechnungsstellung sicher?
            </h2>
            <div className="mt-6 space-y-4 text-[16px] leading-relaxed text-[#374151]">
              <p>
                Sicherheit ist ein zentrales Anliegen beim Umgang mit
                Geschäfts- und Kundendaten online. Invoala löst dies,
                indem alles lokal in Ihrem Browser verarbeitet wird.
                Wenn Sie Rechnungsdetails eingeben, verlassen sie nie
                Ihr Gerät.
              </p>
              <p>
                Ihre Daten werden im lokalen Speicher Ihres Browsers
                gespeichert — nicht auf unseren Servern. Das bedeutet,
                selbst wenn Invoalas Server kompromittiert würden, wären
                Ihre Geschäftsdaten nicht gefährdet, da sie nie
                hochgeladen wurden.
              </p>
              <p>
                Wenn Sie sich entscheiden, ein Konto zu erstellen und
                Rechnungen in der Cloud zu speichern, werden die Daten
                bei der Übertragung (HTTPS) und im Ruhezustand
                verschlüsselt. Sie behalten die Kontrolle darüber, was
                gespeichert wird und was lokal bleibt.
              </p>
            </div>
          </section>

          {/* Features */}
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Funktionen der Online-Rechnungsstellung
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Professionelle PDFs",
                  desc: "Laden Sie saubere, druckfertige A4-Rechnungen mit Ihrem Logo, Positionen und Steueraufschlüsselung herunter.",
                },
                {
                  title: "KI-gestützte Erstellung",
                  desc: "Beschreiben Sie den Auftrag in einfachen Worten, und KI erstellt eine fertige Rechnung mit Positionen und Summen.",
                },
                {
                  title: "154 Währungen",
                  desc: "Berechnen Sie Kunden weltweit mit korrekten Währungssymbolen und automatischer Dezimalformatierung.",
                },
                {
                  title: "Steuerberechnungen",
                  desc: "Geben Sie Ihren MwSt.-, GST- oder Umsatzsteuersatz ein, und die Summen werden während der Eingabe live aktualisiert.",
                },
                {
                  title: "Kundenverwaltung",
                  desc: "Speichern Sie Kundendaten und wählen Sie sie bei zukünftigen Rechnungen aus einem Dropdown aus.",
                },
                {
                  title: "Zahlungsverfolgung",
                  desc: "Markieren Sie Rechnungen als bezahlt, ausstehend oder überfällig, um Ihren Cashflow im Blick zu behalten.",
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
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 text-center">
            <h2 className="text-[24px] font-bold tracking-tight">
              Beginnen Sie noch heute mit der Online-Rechnungsstellung — kostenlos
            </h2>
            <p className="mt-2 text-[16px] text-[#6b7280]">
              Keine Anmeldung, keine Kreditkarte, keine Limits. Erstellen
              Sie jetzt Ihre erste Rechnung.
            </p>
            <Link
              href="/#generate"
              className="mt-6 inline-block rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0f3d22]"
            >
              Rechnung Erstellen
            </Link>
          </section>

          {/* Related links */}
          <section className="mb-20 border-t border-[#e5e7eb] pt-8">
            <h3 className="text-[16px] font-semibold">Verwandte Seiten</h3>
            <ul className="mt-3 space-y-2 text-[15px]">
              <li>
                <Link href="/invoicing-software" className="text-[#166534] hover:underline">
                  Rechnungssoftware
                </Link>
              </li>
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
                <Link href="/invoice-maker" className="text-[#166534] hover:underline">
                  Rechnungsersteller
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
          <section className="mb-20">
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
