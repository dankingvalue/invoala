import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { hreflangAlternates, localizedPath } from "@/lib/i18n";
import { SeoFooter } from "@/components/seo/SeoPage";
import { SetHtmlLang } from "@/components/SetHtmlLang";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Wiederkehrende Rechnungen — Automatisieren Sie Wiederholte Abrechnungen",
    description:
      "Richten Sie wiederkehrende Rechnungen ein, um wiederholte Abrechnungen zu automatisieren. Sparen Sie Zeit, verpassen Sie nie einen Abrechnungszyklus und werden Sie pünktlich bezahlt mit Invoalas kostenloser wiederkehrender Rechnungsstellung.",
    path: "/de/recurring-invoices",
    keywords: [
      "wiederkehrende Rechnungen",
      "wiederkehrende Abrechnung",
      "automatische Rechnungen",
      "Abo-Rechnungsstellung",
      "Vorlage für wiederkehrende Rechnungen",
    ],
    ogDescription:
      "Richten Sie wiederkehrende Rechnungen ein, um wiederholte Abrechnungen zu automatisieren. Sparen Sie Zeit, verpassen Sie nie einen Abrechnungszyklus und werden Sie pünktlich bezahlt.",
    hreflang: hreflangAlternates("/recurring-invoices"),
    ogLocale: "de_DE",
  });
}

const faqs = [
  {
    q: "Was sind wiederkehrende Rechnungen?",
    a: "Wiederkehrende Rechnungen sind automatisch erstellte Rechnungen, die nach einem regelmäßigen Zeitplan versendet werden — wöchentlich, monatlich, vierteljährlich oder jährlich. Statt jede Periode dieselbe Rechnung manuell zu erstellen, richten Sie sie einmal ein, und das System übernimmt den Rest.",
  },
  {
    q: "Wie funktionieren wiederkehrende Rechnungen?",
    a: "Sie legen die Abrechnungshäufigkeit fest (wöchentlich, monatlich, vierteljährlich oder jährlich), die Kundendaten, Positionen und den Betrag. Das System erstellt und versendet die Rechnung dann automatisch an jedem geplanten Datum ohne manuellen Eingriff.",
  },
  {
    q: "Welche Arten von Unternehmen nutzen wiederkehrende Rechnungen?",
    a: "Jedes Unternehmen mit wiederkehrender Abrechnung profitiert — Agenturen mit Retainer-Verträgen, SaaS-Unternehmen mit Abonnements, Berater mit laufenden Verträgen, Wartungsanbieter, Coworking-Spaces und Immobilienverwalter verlassen sich alle auf wiederkehrende Rechnungen.",
  },
  {
    q: "Kann ich eine wiederkehrende Rechnung bearbeiten, bevor sie versendet wird?",
    a: "Ja. Sie können eine wiederkehrende Rechnung vor jedem Zyklus überprüfen und ändern. Wenn Sie den Betrag ändern, eine neue Position hinzufügen oder den Zeitplan vorübergehend pausieren möchten, haben Sie volle Kontrolle.",
  },
  {
    q: "Was passiert, wenn die Zahlungsmethode eines Kunden abläuft?",
    a: "Die wiederkehrende Rechnungsstellung sendet die Rechnung planmäßig, unabhängig von der Zahlungsmethode. Sie sehen den Rechnungsstatus als überfällig und können den Kunden kontaktieren. Wenn Sie auch wiederkehrende Zahlungen nutzen, können Sie Benachrichtigungen für fehlgeschlagene Abbuchungen einrichten.",
  },
  {
    q: "Unterscheiden sich wiederkehrende Rechnungen von Abonnements?",
    a: "Sie sind eng verwandt. Abonnements umfassen in der Regel den automatischen Zahlungseinzug. Bei wiederkehrenden Rechnungen geht es um das automatische Erstellen und Versenden der Rechnung. Invoala konzentriert sich auf die Rechnungsseite, sodass Sie die Rechnung erstellen und selbst entscheiden, wie Sie die Zahlung einziehen.",
  },
  {
    q: "Kann ich wiederkehrende Rechnungen mit Invoala kostenlos einrichten?",
    a: "Ja. Invoalas kostenloser Plan umfasst die Planung wiederkehrender Rechnungen. Richten Sie Ihren Kunden ein, definieren Sie Häufigkeit und Positionen, und lassen Sie Invoala den Rest erledigen — keine Kreditkarte erforderlich.",
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

export default function RecurringInvoicesPageDe() {
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
              Wiederkehrende Rechnungen — Automatisieren Sie Wiederholte Abrechnungen
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              Hören Sie auf, jeden Monat dieselbe Rechnung zu versenden.
              Richten Sie wiederkehrende Rechnungen einmal ein und lassen
              Sie Invoala den Rest erledigen — automatisch, pünktlich,
              jedes Mal.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                href="/#generate"
                className="rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0f3d22]"
              >
                Wiederkehrende Rechnungen einrichten
              </Link>
              <Link
                href={localizedPath("/invoice-generator", "de")}
                className="text-[16px] font-medium text-[#166534] hover:underline"
              >
                Sehen Sie, wie es funktioniert &rsaquo;
              </Link>
            </div>
          </section>

          {/* What are recurring invoices */}
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Was sind wiederkehrende Rechnungen?
            </h2>
            <div className="mt-6 space-y-4 text-[16px] leading-relaxed text-[#374151]">
              <p>
                Wiederkehrende Rechnungen sind Rechnungen, die automatisch
                erstellt und nach einem festgelegten Zeitplan an Kunden
                gesendet werden. Statt jede Woche, jeden Monat oder jedes
                Quartal manuell dieselbe Rechnung zu erstellen,
                konfigurieren Sie sie einmal — Kundendaten, Positionen,
                Beträge und Häufigkeit — und das System übernimmt den
                Rest.
              </p>
              <p>
                Betrachten Sie es wie das Einrichten eines Abonnements
                für Ihre Rechnungsstellung. Ob Sie einem Kunden 500 € pro
                Monat für Retainer-Leistungen oder 200 € pro Quartal für
                Wartung berechnen — wiederkehrende Rechnungen stellen
                sicher, dass Sie nie vergessen, eine Rechnung zu senden
                oder einen Zahlungszyklus zu verpassen.
              </p>
              <p>
                Invoala macht das mühelos. Erstellen Sie eine Rechnung,
                legen Sie die Häufigkeit fest, und Ihr Kunde erhält sie
                pünktlich — ganz ohne manuelle Arbeit Ihrerseits.
              </p>
            </div>
          </section>

          {/* Why use them */}
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 md:p-12">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Warum wiederkehrende Rechnungen nutzen?
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              {[
                {
                  title: "Sparen Sie jeden Monat Stunden",
                  desc: "Manuelle Rechnungsstellung für wiederkehrende Kunden ist mühsam. Wiederkehrende Rechnungen eliminieren die Wiederholung — einmal einrichten und Zeit zurückgewinnen.",
                },
                {
                  title: "Verpassen Sie nie einen Abrechnungszyklus",
                  desc: "Das Leben wird hektisch. Wiederkehrende Rechnungen sorgen dafür, dass Sie immer pünktlich abrechnen, damit der Cashflow nicht unter vergessenen Rechnungen leidet.",
                },
                {
                  title: "Schneller bezahlt werden",
                  desc: "Wenn Rechnungen automatisch versendet werden, erhalten Kunden sie früher. Schnellere Zustellung bedeutet schnellere Zahlung und einen gesünderen Cashflow.",
                },
                {
                  title: "Menschliche Fehler reduzieren",
                  desc: "Kein Kopieren und Einfügen von Positionen oder Fehlberechnungen mehr. Das System erstellt bei jedem Zyklus eine identische Rechnung mit korrekter Mathematik.",
                },
                {
                  title: "Kundenerfahrung verbessern",
                  desc: "Kunden schätzen Konsistenz. Wenn sie genau wissen, wann und wie sie abgerechnet werden, schafft das Vertrauen und Professionalität.",
                },
                {
                  title: "Ihr Geschäft skalieren",
                  desc: "Wenn Ihre Kundenliste wächst, skaliert die wiederkehrende Rechnungsstellung mit Ihnen. Verwalten Sie 10 oder 1.000 wiederkehrende Kunden, ohne administrativen Aufwand hinzuzufügen.",
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

          {/* How they work */}
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              So funktionieren wiederkehrende Rechnungen
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-[#374151]">
              Wiederkehrende Rechnungen laufen nach einem einfachen
              Zeitplan. Sie wählen, wie oft Sie abrechnen möchten, und
              Invoala übernimmt die Erstellung:
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  freq: "Wöchentlich",
                  desc: "Ideal für laufende Dienstleistungen, die jede Woche abgerechnet werden — Reinigung, Wartung oder stundenweise Beratung mit einer festen wöchentlichen Obergrenze.",
                },
                {
                  freq: "Monatlich",
                  desc: "Der häufigste Zyklus. Perfekt für Retainer-Gebühren, Abonnements, Miete und laufende Dienstleistungsverträge.",
                },
                {
                  freq: "Vierteljährlich",
                  desc: "Ideal für saisonale Leistungen, vierteljährliche Beratung, Wartungsverträge und Unternehmen, die weniger, aber größere Rechnungen bevorzugen.",
                },
                {
                  freq: "Jährlich",
                  desc: "Am besten für jährliche Abonnements, jährliche Retainer, Versicherungsprämien und Lizenzverlängerungen, die einmal im Jahr abgerechnet werden.",
                },
              ].map((item) => (
                <div
                  key={item.freq}
                  className="rounded-xl border border-[#e5e7eb] bg-white p-6"
                >
                  <h3 className="text-[17px] font-bold tracking-tight text-[#111827]">
                    {item.freq}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-[#6b7280]">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Features */}
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Funktionen für wiederkehrende Rechnungen
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Flexible Planung",
                  desc: "Wählen Sie wöchentliche, monatliche, vierteljährliche oder jährliche Abrechnung — oder legen Sie ein individuelles Intervall fest, das zu Ihrem Unternehmen passt.",
                },
                {
                  title: "Kundenverwaltung",
                  desc: "Speichern Sie Kundendaten einmal. Jede wiederkehrende Rechnung greift auf denselben Kundendatensatz zu — kein erneutes Eintippen von Informationen.",
                },
                {
                  title: "Vor dem Versand bearbeitbar",
                  desc: "Überprüfen und passen Sie jede Rechnung an, bevor sie versendet wird. Fügen Sie neue Positionen hinzu, ändern Sie Beträge oder überspringen Sie einen Zyklus.",
                },
                {
                  title: "Automatische PDF-Erstellung",
                  desc: "Jeder Zyklus erzeugt ein professionelles, druckfertiges PDF, das konsistent mit Ihrer Marke aussieht.",
                },
                {
                  title: "Zahlungsstatus-Verfolgung",
                  desc: "Sehen Sie auf einen Blick, welche wiederkehrenden Rechnungen bei allen Ihren Kunden bezahlt, ausstehend oder überfällig sind.",
                },
                {
                  title: "Mehrere Währungen",
                  desc: "Berechnen Sie internationale Kunden in deren Währung. Invoala unterstützt 154 Währungen mit korrekter Formatierung.",
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

          {/* Who benefits */}
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 md:p-12">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Wer profitiert von wiederkehrenden Rechnungen?
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
              {[
                {
                  title: "Agenturen mit Retainer-Verträgen",
                  desc: "Marketing-, Design- und Entwicklungsagenturen, die Kunden eine feste monatliche Gebühr für laufende Arbeit berechnen. Wiederkehrende Rechnungen eliminieren den sich wiederholenden manuellen Schritt.",
                },
                {
                  title: "SaaS- und Abo-Unternehmen",
                  desc: "Softwareunternehmen, die monatlich oder jährlich für Zugang abrechnen. Wiederkehrende Rechnungen halten den Abrechnungszyklus am Laufen, ohne dass ein eigenes Abrechnungsteam nötig ist.",
                },
                {
                  title: "Berater und Coaches",
                  desc: "Unternehmensberater, Life-Coaches und Berater mit laufenden Kundenbeziehungen. Monatliche Abrechnung für Zugang, Gespräche oder strategische Unterstützung.",
                },
                {
                  title: "Wartungs- und Dienstleistungsanbieter",
                  desc: "Landschaftsgärtner, Reinigungskräfte, HLK-Techniker und Immobilienverwalter, die regelmäßige Dienstleistungen nach einem festen Zeitplan erbringen.",
                },
                {
                  title: "Coworking-Spaces und Vermietungen",
                  desc: "Anbieter von Arbeitsräumen und Immobilienverwalter, die Mietern monatlich Schreibtischplätze, Lagerung oder Nutzungsgebühren berechnen.",
                },
                {
                  title: "Freelancer mit langfristigen Kunden",
                  desc: "Freelancer, die Monat für Monat mit demselben Kunden arbeiten. Sparen Sie Zeit, indem Sie die Rechnung automatisieren, die sich nie ändert.",
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

          {/* CTA */}
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 text-center">
            <h2 className="text-[24px] font-bold tracking-tight">
              Automatisieren Sie noch heute Ihre Abrechnung
            </h2>
            <p className="mt-2 text-[16px] text-[#6b7280]">
              Richten Sie Ihre erste wiederkehrende Rechnung in unter
              zwei Minuten ein. Kostenlos, keine Anmeldung erforderlich.
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
                <Link href="/invoice-payment-tracking" className="text-[#166534] hover:underline">
                  Rechnungszahlungsverfolgung
                </Link>
              </li>
              <li>
                <Link href="/invoice-reminders" className="text-[#166534] hover:underline">
                  Rechnungserinnerungen
                </Link>
              </li>
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
