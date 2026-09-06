import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { hreflangAlternates, localizedPath } from "@/lib/i18n";
import { SeoFooter } from "@/components/seo/SeoPage";
import { SetHtmlLang } from "@/components/SetHtmlLang";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Rechnungssoftware — Einfache Rechnungsstellung für Moderne Unternehmen",
    description:
      "Invoala ist eine einfache Rechnungssoftware für Freelancer und kleine Unternehmen. Erstellen Sie professionelle Rechnungen, verfolgen Sie Zahlungen und werden Sie schneller bezahlt — alles kostenlos.",
    path: "/de/invoicing-software",
    keywords: [
      "Rechnungssoftware",
      "Rechnungsprogramm",
      "Online-Rechnungsstellung",
      "Rechnungssoftware für Kleinunternehmen",
    ],
    hreflang: hreflangAlternates("/invoicing-software"),
    ogLocale: "de_DE",
  });
}

const faqs = [
  {
    q: "Was ist Rechnungssoftware?",
    a: "Rechnungssoftware ist ein Tool, das Ihnen hilft, Rechnungen für Ihr Unternehmen zu erstellen, zu versenden und zu verwalten. Sie automatisiert Berechnungen, verfolgt den Zahlungsstatus und erstellt professionelle PDFs, die Sie an Kunden per E-Mail senden können.",
  },
  {
    q: "Ist Invoala eine kostenlose Rechnungssoftware?",
    a: "Ja. Invoala ist komplett kostenlos — keine Testphasen, keine Bezahlschranken, keine Wasserzeichen. Erstellen Sie unbegrenzt Rechnungen, laden Sie PDFs herunter und verfolgen Sie Zahlungen, ohne einen Cent auszugeben.",
  },
  {
    q: "Kann ich Rechnungssoftware für mein Kleinunternehmen nutzen?",
    a: "Auf jeden Fall. Rechnungssoftware ist für Freelancer, Berater, Agenturen, Auftragnehmer und Kleinunternehmen aller Art konzipiert. Sie spart Zeit und wirkt professioneller als Tabellenkalkulationen.",
  },
  {
    q: "Welche Funktionen sollte gute Rechnungssoftware haben?",
    a: "Achten Sie auf Rechnungserstellung, PDF-Export, Zahlungsverfolgung, Kundenverwaltung, wiederkehrende Rechnungen, Steuerberechnungen und Unterstützung mehrerer Währungen. Invoala umfasst all das.",
  },
  {
    q: "Wie unterscheidet sich Rechnungssoftware von einer Tabellenkalkulation?",
    a: "Tabellenkalkulationen erfordern manuelle Formatierung und Formel-Einrichtung. Rechnungssoftware bietet Ihnen eine fertige Vorlage, automatische Summen, Steuerberechnung, PDF-Erstellung und Zahlungsverfolgung in einem einzigen Tool.",
  },
  {
    q: "Kann ich Rechnungen direkt aus Invoala versenden?",
    a: "Ja. Wenn Sie ein Konto haben, können Sie Rechnungen direkt aus dem Dashboard per E-Mail an Ihre Kunden senden. Kostenlose Nutzer können das PDF herunterladen und über ihre eigene E-Mail versenden.",
  },
  {
    q: "Unterstützt Invoala wiederkehrende Rechnungen?",
    a: "Ja. Sie können Kundendaten und Rechnungsvorlagen zur schnellen Wiederverwendung speichern. Die vollständige Planung wiederkehrender Rechnungen ist im Pro-Plan für regelmäßige Abrechnungszyklen verfügbar.",
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

export default function InvoicingSoftwarePageDe() {
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
              Einfache Rechnungssoftware für Moderne Unternehmen
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              Kämpfen Sie nicht länger mit Tabellenkalkulationen. Invoala
              bietet alles, was Sie brauchen, um Rechnungen zu erstellen,
              zu versenden und zu verfolgen — ohne Komplexität oder
              Kosten.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                href="/#generate"
                className="rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0f3d22]"
              >
                Erstellen Sie Ihre erste Rechnung
              </Link>
              <Link
                href={localizedPath("/invoice-generator", "de")}
                className="text-[16px] font-medium text-[#166534] hover:underline"
              >
                Generator ausprobieren &rsaquo;
              </Link>
            </div>
          </section>

          {/* What is invoicing software */}
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Was ist Rechnungssoftware?
            </h2>
            <div className="mt-6 space-y-4 text-[16px] leading-relaxed text-[#374151]">
              <p>
                Rechnungssoftware ist ein digitales Tool, mit dem
                Unternehmen Rechnungen an einem einzigen Ort erstellen,
                versenden und verwalten können. Statt Rechnungen in einer
                Textverarbeitung oder Tabellenkalkulation zu erstellen,
                füllen Sie ein Formular aus, und die Software übernimmt
                automatisch Formatierung, Steuerberechnungen, Nummerierung
                und PDF-Erstellung.
              </p>
              <p>
                Gute Rechnungssoftware verfolgt auch den Zahlungsstatus,
                sodass Sie immer wissen, welche Rechnungen bezahlt sind,
                welche überfällig sind und wie viel Umsatz noch aussteht.
                Sie ersetzt einen Flickenteppich aus Tools durch einen
                optimierten Arbeitsablauf.
              </p>
              <p>
                Invoala geht noch weiter mit KI-gestützter
                Rechnungserstellung, Kundenverwaltung und Unterstützung
                für wiederkehrende Rechnungen — alles kostenlos.
              </p>
            </div>
          </section>

          {/* Why use it */}
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 md:p-12">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Warum Rechnungssoftware nutzen?
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              {[
                {
                  title: "Zeit sparen",
                  desc: "Vorlagen, automatisches Ausfüllen und gespeicherte Kundendaten bedeuten: von der leeren Seite zur fertigen Rechnung in unter zwei Minuten.",
                },
                {
                  title: "Professionell wirken",
                  desc: "Saubere, markengerechte PDFs signalisieren Glaubwürdigkeit. Kunden nehmen Ihr Unternehmen ernster, wenn die Rechnung professionell aussieht.",
                },
                {
                  title: "Schneller bezahlt werden",
                  desc: "Klare Zahlungsbedingungen, Fälligkeitsdaten und sofortige Zustellung sorgen dafür, dass Kunden genau wissen, wann und wie sie zahlen sollen.",
                },
                {
                  title: "Organisiert bleiben",
                  desc: "Verfolgen Sie jede Rechnung nach Status — bezahlt, ausstehend oder überfällig — damit nichts durchs Raster fällt.",
                },
                {
                  title: "Fehler reduzieren",
                  desc: "Automatische Steuer- und Summenberechnung eliminiert die Rechenfehler, die bei manuellen Tabellenkalkulationen entstehen.",
                },
                {
                  title: "Von überall arbeiten",
                  desc: "Cloudbasierte Rechnungssoftware läuft in Ihrem Browser. Erstellen Sie Rechnungen auf Laptop, Tablet oder Smartphone.",
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
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Funktionen, die Invoala anders machen
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Zahlungen verfolgen",
                  desc: "Markieren Sie Rechnungen als bezahlt, ausstehend oder überfällig. Sehen Sie Ihren offenen Saldo auf einen Blick.",
                },
                {
                  title: "Kunden verwalten",
                  desc: "Speichern Sie Kundendaten einmal und wählen Sie sie bei jeder zukünftigen Rechnung aus einem Dropdown aus.",
                },
                {
                  title: "Wiederkehrende Rechnungen",
                  desc: "Richten Sie sich wiederholende Rechnungen für laufende Arbeit ein. Vergessen Sie nie wieder monatliche Pauschalen abzurechnen.",
                },
                {
                  title: "Zahlungserinnerungen",
                  desc: "Automatische Erinnerungen halten Ihren Cashflow gesund, ohne unangenehme Nachfass-E-Mails.",
                },
                {
                  title: "KI-Rechnungserstellung",
                  desc: "Beschreiben Sie in einfachen Worten, was Sie getan haben, und KI verwandelt es in eine fertige Rechnung mit Positionen und Summen.",
                },
                {
                  title: "Mehrere Währungen",
                  desc: "Berechnen Sie Kunden in jeder der 154 Weltwährungen mit korrekten Symbolen und Dezimalformatierung.",
                },
                {
                  title: "PDF-Download",
                  desc: "Exportieren Sie ein sauberes, druckfertiges A4-PDF, das auf jedem Gerät und Drucker perfekt aussieht.",
                },
                {
                  title: "Steuerberechnungen",
                  desc: "Geben Sie Ihren MwSt.-, GST- oder Umsatzsteuersatz ein, und die Summe wird während der Eingabe live aktualisiert.",
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

          {/* Who it's for */}
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 md:p-12">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Für wen ist Invoala?
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Freelancer",
                  desc: "Versenden Sie professionelle Rechnungen für Projekte, Meilensteine und Stundenarbeit, ohne für Software zu bezahlen, die Sie nicht brauchen.",
                },
                {
                  title: "Kleinunternehmen",
                  desc: "Verwalten Sie die Abrechnung eines wachsenden Teams. Behalten Sie im Blick, wer bezahlt hat und wer Ihnen noch etwas schuldet — alles über ein Dashboard.",
                },
                {
                  title: "Berater",
                  desc: "Berechnen Sie Ihre Expertise mit professionellen Rechnungen, die die Qualität Ihrer Arbeit widerspiegeln.",
                },
                {
                  title: "Agenturen",
                  desc: "Verwalten Sie mehrere Kunden und Projekte mit gespeicherten Kundendaten und wiederkehrender Abrechnung.",
                },
                {
                  title: "Auftragnehmer",
                  desc: "Erstellen Sie Rechnungen vor Ort direkt vom Smartphone. Laden Sie das PDF herunter und senden Sie es per E-Mail, bevor Sie die Baustelle verlassen.",
                },
                {
                  title: "Nebentätigkeiten",
                  desc: "Werden Sie professionell für freiberufliche Arbeit bezahlt, ohne in teure Rechnungstools zu investieren.",
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

          {/* How Invoala compares */}
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Wie Invoala im Vergleich abschneidet
            </h2>
            <div className="mt-8 space-y-4 text-[16px] leading-relaxed text-[#374151]">
              <p>
                Die meiste Rechnungssoftware fällt in zwei Lager:
                kostenlose Tools mit eingeschränkten Funktionen oder teure
                Plattformen mit steilen Lernkurven. Invoala trifft den
                Sweet Spot — voll ausgestattet und wirklich kostenlos.
              </p>
              <p>
                Anders als Tabellenvorlagen übernimmt Invoala Formatierung,
                Steuerberechnung und PDF-Erstellung automatisch. Anders
                als kostenpflichtige Tools wie FreshBooks oder QuickBooks
                gibt es kein Abonnement, keine Gebühr pro Rechnung und
                keine Funktionsbeschränkungen.
              </p>
              <p>
                Sie erhalten professionelle Rechnungen, Kundenverwaltung,
                Zahlungsverfolgung, KI-Erstellung und Unterstützung für
                154 Währungen — ganz ohne Kreditkarte.
              </p>
            </div>
          </section>

          {/* CTA */}
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 text-center">
            <h2 className="text-[24px] font-bold tracking-tight">
              Bereit, Ihre Rechnungsstellung zu vereinfachen?
            </h2>
            <p className="mt-2 text-[16px] text-[#6b7280]">
              Erstellen Sie Ihre erste professionelle Rechnung in unter
              zwei Minuten. Keine Anmeldung erforderlich.
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
                <Link href="/online-invoicing" className="text-[#166534] hover:underline">
                  Online-Rechnungsstellung
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
