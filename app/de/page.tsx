/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { hreflangAlternates, localizedPath } from "@/lib/i18n";
import { SetHtmlLang } from "@/components/SetHtmlLang";
import { Reveal } from "@/components/Reveal";
import { LazyInvoiceGenerator } from "@/components/LazyInvoiceGenerator";
import { TrustStrip } from "@/components/TrustStrip";
import { CURRENCIES } from "@/lib/invoice";
import { getFlags } from "@/lib/flags.server";
import { ProPricing } from "@/components/ProPricing";
import { ProductShowcase } from "@/components/ProductShowcase";
import { getCurrentUser } from "@/lib/server-auth";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Invoala — Kostenloser Rechnungsgenerator für Freelancer",
    description:
      "Erstellen Sie professionelle Rechnungen online kostenlos. Fügen Sie Positionen, Steuern und Ihr Logo hinzu, dann laden Sie in Sekunden ein makelloses PDF herunter. Keine Anmeldung. Kein Wasserzeichen.",
    path: "/de/",
    keywords: [
      "kostenloser Rechnungsgenerator",
      "Rechnungsersteller",
      "Rechnungsvorlage",
      "Freelancer Rechnung",
      "Rechnung als PDF",
      "Online-Rechnungsstellung",
    ],
    hreflang: hreflangAlternates("/"),
    ogLocale: "de_DE",
  });
}

const faqs = [
  {
    q: "Ist Invoala wirklich kostenlos?",
    a: "Ja. Erstellen, sehen und laden Sie unbegrenzt Rechnungen kostenlos herunter — keine Testphasen, keine Bezahlschranken, keine Wasserzeichen auf Ihren PDFs.",
  },
  {
    q: "Muss ich ein Konto erstellen?",
    a: "Nein. Keine Anmeldung und keine E-Mail erforderlich. Öffnen Sie die Seite, füllen Sie Ihre Daten aus und laden Sie Ihre Rechnung herunter.",
  },
  {
    q: "Wo werden meine Daten gespeichert?",
    a: "Alles, was Sie eingeben, wird nur lokal in Ihrem Browser gespeichert. Nichts wird auf einen Server hochgeladen, sodass Ihre Geschäftsdaten privat bleiben.",
  },
  {
    q: "Was bekomme ich beim Herunterladen?",
    a: "Ein sauberes, professionelles A4-PDF mit Ihrem Logo, Positionen, Steueraufschlüsselung und Zahlungshinweisen — bereit, an jeden Kunden per E-Mail gesendet zu werden.",
  },
  {
    q: "Kann ich es auch für Kostenvoranschläge oder Quittungen nutzen?",
    a: "Auf jeden Fall. Ändern Sie die Daten und Positionsbeschreibungen, um Kostenvoranschläge vor einem Projekt oder Quittungen nach der Zahlung zu versenden.",
  },
  {
    q: "Welche Währungen werden unterstützt?",
    a: "154 Weltwährungen, darunter USD, EUR, GBP, JPY, CAD, AUD und mehr. Die Rechnung formatiert Symbol und Dezimalstellen automatisch.",
  },
  {
    q: "Kann ich mein eigenes Logo hinzufügen?",
    a: "Ja. Laden Sie Ihr Logo hoch, und es erscheint oben auf jeder Rechnung. Kostenlose Nutzer erhalten ein PDF ohne Wasserzeichen.",
  },
  {
    q: "Berechnet es Steuern automatisch?",
    a: "Ja. Geben Sie Ihren Steuersatz ein (MwSt., GST, Umsatzsteuer), und die Summe wird während der Eingabe live aktualisiert.",
  },
  {
    q: "Kann ich Kunden zur Wiederverwendung speichern?",
    a: "Ja. Speichern Sie Kundendaten einmal und wählen Sie sie bei zukünftigen Rechnungen aus einem Dropdown aus. Alle Daten bleiben in Ihrem Browser.",
  },
  {
    q: "Welches Dateiformat wird exportiert?",
    a: "PDF — druckfertiges A4-Format, das auf jedem Gerät identisch aussieht und auf jedem Drucker perfekt druckt.",
  },
  {
    q: "Gibt es ein Limit, wie viele Rechnungen ich erstellen kann?",
    a: "Kein Limit. Erstellen Sie so viele, wie Sie möchten, für immer. Es gibt keine täglichen oder monatlichen Obergrenzen.",
  },
  {
    q: "Wie unterscheidet sich das von Excel oder Google Sheets?",
    a: "Invoala ist speziell für die Rechnungsstellung gebaut. Sie erhalten Live-Summen, automatische Steuerberechnung, professionelle Formatierung und PDF-Download — alles in einem Schritt. Keine Formeln, keine Vorlagen zum Einrichten.",
  },
  {
    q: "Können Freelancer das nutzen?",
    a: "Auf jeden Fall. Invoala ist für Freelancer, Berater und Selbstständige gebaut, die professionelle Rechnungen wollen, ohne für Software zu bezahlen.",
  },
  {
    q: "Unterstützen Sie wiederkehrende Rechnungen?",
    a: "Sie können Ihre Daten und Kundeninformationen zur schnellen Wiederverwendung speichern. Die vollständige Planung wiederkehrender Rechnungen ist im Pro-Plan verfügbar.",
  },
];

const features = [
  {
    title: "Makellose PDFs",
    copy: "Voilà — kundenfertig in dem Moment, in dem Sie herunterladen. Pixelgenaue A4-PDFs, die Einzelarbeit wie die einer Agentur aussehen lassen.",
    glyph: (
      <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm7 1.5V9h4.5M9 13h6m-6 4h6" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    ),
  },
  {
    title: "In Sekunden fertig",
    copy: "Kein Konto, keine Bezahlschranke, kein Warten. Ausfüllen, herunterladen, fertig — Ihre Daten bleiben auf Ihrem eigenen Gerät gespeichert.",
    glyph: (
      <path d="M13 2 4.5 13.5H11L9.5 22 19 10h-6.5L13 2Z" strokeWidth="1.5" strokeLinejoin="round" />
    ),
  },
  {
    title: "Jede Währung",
    copy: `Berechnen Sie jeden, überall — ${CURRENCIES.length} Weltwährungen, automatische Steuerberechnung, standardmäßig korrekte Formatierung.`,
    glyph: (
      <path d="M12 3v18M16.5 7.5c-.8-1.2-2.4-2-4.5-2-2.5 0-4 1.3-4 3.1 0 4.4 9 2.3 9 6.8 0 1.8-1.7 3.1-4.5 3.1-2.3 0-4-.9-4.8-2.2" strokeWidth="1.5" strokeLinecap="round" />
    ),
  },
  {
    title: "Einfach beschreiben",
    copy: "Beschreiben Sie den Auftrag in einfachen Worten — KI verwandelt es in eine fertige Rechnung mit Positionen und Summen.",
    glyph: (
      <path d="M12 2l2.2 6.6L21 11l-6.8 2.4L12 20l-2.2-6.6L3 11l6.8-2.4L12 2Z" strokeWidth="1.5" strokeLinejoin="round" />
    ),
  },
  {
    title: "Alles an einem Ort",
    copy: "Erstellen Sie ein kostenloses Konto, und Invoala merkt sich Ihre Kunden, verfolgt, wer bezahlt hat und wer überfällig ist, und informiert Sie, sobald ein Kunde eine Rechnung öffnet.",
    glyph: (
      <path d="M4 4h7v7H4V4Zm9 0h7v4h-7V4Zm0 7h7v9h-7v-9ZM4 14h7v6H4v-6Z" strokeWidth="1.5" strokeLinejoin="round" />
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

export default async function HomeDe() {
  const { flags, announcement } = await getFlags();
  const user = await getCurrentUser();

  if (flags.maintenanceMode) {
    return (
      <div id="top">
        <SetHtmlLang lang="de" />
        <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <h1 className="text-[40px] font-semibold tracking-tight md:text-[56px]">
            Wir sind gleich zurück.
          </h1>
          <p className="mt-4 max-w-[420px] text-[17px] leading-relaxed text-subtle">
            Invoala erhält ein kurzes Update. Laden Sie in ein paar
            Minuten neu — Ihre gespeicherten Rechnungen sind sicher auf
            Ihrem Gerät.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div id="top" className="scroll-mt-20">
      <SetHtmlLang lang="de" />
      <FaqJsonLd />

      <header className="fixed inset-x-0 top-0 z-50 h-[72px] border-b border-[#e5e7eb] bg-white">
        <nav className="mx-auto flex h-full max-w-[1400px] items-center px-5 sm:px-8">
          <Link href="/de" className="flex shrink-0 items-center gap-2.5">
            <svg width="28" height="28" viewBox="0 0 64 64" aria-hidden="true">
              <rect width="64" height="64" rx="14.5" fill="#166534" />
              <path d="M35.5 10 19 37h9.5l-3 17L43 27h-9.5l2-17z" fill="#fff" />
            </svg>
            <span className="text-[17px] font-bold tracking-tight text-ink">Invoala</span>
          </Link>
          <nav className="hidden flex-1 items-center justify-center gap-8 text-[14px] font-medium md:flex">
            <a href="#features" className="text-subtle transition-colors hover:text-ink">Funktionen</a>
            <a href="#how" className="text-subtle transition-colors hover:text-ink">So funktioniert's</a>
            <Link href={localizedPath("/pricing", "de")} className="text-subtle transition-colors hover:text-ink">Preise</Link>
            <a href="#faq" className="text-subtle transition-colors hover:text-ink">FAQ</a>
          </nav>
          <div className="ml-auto flex shrink-0 items-center gap-3 md:ml-0">
            {user ? (
              <Link href="/dashboard?tab=general" className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-[14px] font-semibold text-ink transition hover:border-[#166534] hover:text-[#166534]">
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="text-[14px] font-medium text-subtle hover:text-ink">
                Anmelden
              </Link>
            )}
            <a href="#generate" className="rounded-lg bg-[#14532d] px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-[#0f3d22]">
              Rechnung erstellen
            </a>
          </div>
        </nav>
      </header>

      <main>
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
          <p className="text-[13px] font-semibold uppercase tracking-wider text-[#166534]">
            Schließen Sie sich über 500 Freelancern und Agenturen an, die bereits mit Invoala Rechnungen stellen
          </p>
        </Reveal>
        <Reveal>
          <h1 className="mx-auto mt-3 max-w-[900px] text-[48px] font-extrabold leading-[1.05] tracking-tight md:text-[80px]">
            Rechnungen, die
            <span className="block text-[#166534]">professionell aussehen.</span>
          </h1>
        </Reveal>
        <Reveal delay={100}>
          <p className="mx-auto mt-6 max-w-[640px] text-[19px] font-medium leading-relaxed text-subtle md:text-[21px]">
            Voilà — jetzt ist es einfach, Rechnungen zu erstellen.
            Erstellen Sie eine schöne Rechnung und laden Sie ein
            makelloses PDF in Sekunden herunter.
          </p>
        </Reveal>
        <Reveal delay={200}>
          <div className="mt-9 flex items-center justify-center gap-4">
            <a
              href="#generate"
              className="rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white shadow-sm transition hover:bg-[#0f3d22] active:scale-[0.99]"
            >
              Erstellen Sie Ihre Rechnung
            </a>
            <a href="#how" className="text-[16px] font-medium text-[#166534] transition-opacity hover:opacity-70">
              So funktioniert's &rsaquo;
            </a>
          </div>
        </Reveal>
        <Reveal delay={300}>
          <p className="mt-6 text-[13px] text-subtle">
            Für immer kostenlos &nbsp;·&nbsp; Keine Anmeldung &nbsp;·&nbsp; Keine Kreditkarte erforderlich
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
                Jetzt loslegen. Es dauert zwei Minuten.
              </h2>
              <p className="mt-3 text-[17px] font-medium text-subtle">
                Einmal ausfüllen — wir speichern Ihre Daten für das nächste Mal.{flags.aiComposer ? " Oder beschreiben Sie einfach den Auftrag und lassen Sie die KI ihn verfassen." : ""}
              </p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <LazyInvoiceGenerator />
          </Reveal>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-16 px-6 py-16 md:py-28">
        <div className="mx-auto max-w-[1024px]">
          <Reveal>
            <h2 className="mx-auto max-w-[720px] text-center text-[36px] font-extrabold tracking-tight md:text-[52px]">
              Alles, was Sie brauchen.
              <span className="block text-subtle">Nichts, was Sie nicht brauchen.</span>
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* Product showcase — a closer look inside */}
      <ProductShowcase />

      {/* How it works */}
      <section id="how" className="scroll-mt-16 bg-[#f3f4f6] px-6 py-16 md:py-28">
        <div className="mx-auto max-w-[1024px]">
          <Reveal>
            <h2 className="max-w-[680px] text-[36px] font-extrabold tracking-tight md:text-[52px]">
              Drei Schritte. Fertig.
            </h2>
            <p className="mt-3 max-w-[520px] text-[17px] font-medium text-subtle">
              Sie kümmern sich um die wichtige Arbeit. Invoala kümmert sich um die lästigen Aufgaben.
            </p>
          </Reveal>
          <div className="mt-14 grid gap-12 sm:grid-cols-3">
            {[
              {
                n: "01",
                title: "Geben Sie Ihre Daten ein",
                copy: "Ihr Name, Logo und Kundendaten. Wir merken sie uns für Ihren nächsten Besuch.",
              },
              {
                n: "02",
                title: "Beschreiben Sie die Arbeit",
                copy: "Positionen, Mengen, Sätze, Steuern — die Summen werden während der Eingabe live aktualisiert.",
              },
              {
                n: "03",
                title: "Herunterladen & senden",
                copy: "Ein Klick gibt Ihnen ein scharfes A4-PDF. Anhängen, senden, bezahlt werden.",
              },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 100}>
                <div>
                  <p className="text-[56px] font-extrabold leading-none tracking-tight text-[#166534]/60 md:text-[64px]">
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
                Erstellen Sie Ihre Rechnung
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Pro pricing */}
      {flags.proTeaser ? <ProPricing /> : null}

      {/* SEO content — What makes a good invoice */}
      <section className="px-6 py-16 md:py-28">
        <div className="mx-auto max-w-[1024px]">
          <Reveal>
            <h2 className="text-center text-[36px] font-extrabold tracking-tight md:text-[52px]">
              Was macht eine gute Rechnung aus?
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Klare Positionen",
                desc: "Jede Dienstleistung oder jedes Produkt wird separat mit Beschreibung, Menge und Preis aufgeführt. Keine vagen Pakete.",
              },
              {
                title: "Professionelles Layout",
                desc: "Klare Typografie, richtiger Abstand und Ihr Logo. Das signalisiert Glaubwürdigkeit und Liebe zum Detail.",
              },
              {
                title: "Klare Zahlungsbedingungen",
                desc: "Netto 15 oder Netto 30 — geben Sie an, wann die Zahlung fällig ist. Nennen Sie Ihre bevorzugte Methode und eventuelle Mahngebühren.",
              },
              {
                title: "Korrekte Steuer",
                desc: "Wenden Sie den richtigen Satz für Ihre Gerichtsbarkeit an. Invoala berechnet die Summe automatisch.",
              },
              {
                title: "Eindeutige Rechnungsnummer",
                desc: "Fortlaufende IDs (INV-001, INV-002) helfen Ihnen und Ihrem Kunden, Zahlungen ohne Verwirrung zu verfolgen.",
              },
              {
                title: "Kontaktdaten",
                desc: "Ihr Name, E-Mail und Adresse — damit der Kunde genau weiß, an wen er zahlen und wie er Sie erreichen soll.",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 80}>
                <div>
                  <h3 className="text-[17px] font-bold tracking-tight">{item.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[#6b7280]">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={300}>
            <div className="mt-14 text-center">
              <a
                href="#generate"
                className="rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white shadow-sm transition hover:bg-[#0f3d22] active:scale-[0.99]"
              >
                Erstellen Sie eine bessere Rechnung
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Internal links — guides */}
      <section className="bg-[#f3f4f6] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-[1024px]">
          <Reveal>
            <h2 className="text-center text-[36px] font-extrabold tracking-tight md:text-[44px]">
              Mehr erfahren
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <Reveal>
              <Link
                href="/how-to-create-invoice"
                className="block rounded-xl border border-[#e5e7eb] bg-white p-6 transition hover:shadow-md"
              >
                <h3 className="text-[18px] font-bold tracking-tight text-[#111827]">
                  Wie man eine Rechnung erstellt
                </h3>
                <p className="mt-2 text-[15px] text-[#6b7280]">
                  Schritt-für-Schritt-Anleitung von der leeren Seite bis
                  zum zahlenden Kunden. Behandelt Positionen, Steuern,
                  Zahlungsbedingungen und Versand.
                </p>
                <span className="mt-3 inline-block text-[14px] font-semibold text-[#166534]">
                  Anleitung lesen &rsaquo;
                </span>
              </Link>
            </Reveal>
            <Reveal delay={100}>
              <Link
                href={localizedPath("/invoice-template", "de")}
                className="block rounded-xl border border-[#e5e7eb] bg-white p-6 transition hover:shadow-md"
              >
                <h3 className="text-[18px] font-bold tracking-tight text-[#111827]">
                  Kostenlose Rechnungsvorlagen
                </h3>
                <p className="mt-2 text-[15px] text-[#6b7280]">
                  Branchenspezifische Vorlagen für Freelancer, Designer,
                  Fotografen, Auftragnehmer und kleine Unternehmen.
                </p>
                <span className="mt-3 inline-block text-[14px] font-semibold text-[#166534]">
                  Vorlagen ansehen &rsaquo;
                </span>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-16 px-6 py-16 md:py-28">
        <div className="mx-auto max-w-[720px]">
          <Reveal>
            <h2 className="text-center text-[36px] font-extrabold tracking-tight md:text-[52px]">
              Fragen. Beantwortet.
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
      </main>

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
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <a href="#features" className="transition-colors hover:text-ink">Funktionen</a>
              <a href="#faq" className="transition-colors hover:text-ink">FAQ</a>
              <Link href="/how-to-create-invoice" className="transition-colors hover:text-ink">Anleitung</Link>
              <Link href={localizedPath("/invoice-template", "de")} className="transition-colors hover:text-ink">Vorlagen</Link>
              <Link href="/roadmap" className="transition-colors hover:text-ink">Roadmap</Link>
              <Link href="/privacy" className="transition-colors hover:text-ink">Datenschutz</Link>
              <Link href="/terms" className="transition-colors hover:text-ink">AGB</Link>
              <a href="mailto:hello@invoala.com" className="transition-colors hover:text-ink">
                Kontakt
              </a>
            </nav>
            <p>&copy; 2026 Invoala. Alle Rechte vorbehalten.</p>
          </div>
          <p className="mt-6 border-t border-[#e5e7eb] pt-5 text-[11px] leading-relaxed text-subtle">
            Invoala ist ein kostenloser Online-Rechnungsgenerator für
            Freelancer und kleine Unternehmen. Erstellen Sie
            professionelle Rechnungen mit eigenem Logo, Positionen,
            Steuern und mehreren Währungen — und laden Sie sie als
            druckfertige PDF-Dateien herunter. Kein Konto erforderlich,
            und Ihre Daten verlassen niemals Ihren Browser.
          </p>
        </div>
        <div className="mx-auto max-w-[1024px] pt-5">
          <TrustStrip />
        </div>
      </footer>
    </div>
  );
}
