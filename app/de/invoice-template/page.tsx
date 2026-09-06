import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { hreflangAlternates, localizedPath } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Kostenlose Rechnungsvorlage — Herunterladen und Anpassen",
    description:
      "Kostenlose Rechnungsvorlagen für Freelancer und kleine Unternehmen. Passen Sie sie mit Ihrem Logo, Positionen und Zahlungsbedingungen an. Als PDF herunterladen — keine Anmeldung erforderlich.",
    path: "/de/invoice-template",
    keywords: [
      "Rechnungsvorlage",
      "kostenlose Rechnungsvorlage",
      "Rechnungsvorlage PDF",
      "Rechnungsvorlage für Freelancer",
      "Rechnungsvorlage für Unternehmen",
      "individuelle Rechnungsvorlage",
    ],
    ogDescription: "Kostenlose Rechnungsvorlagen für Freelancer. Anpassen und als PDF herunterladen.",
    hreflang: hreflangAlternates("/invoice-template"),
    ogLocale: "de_DE",
  });
}

const industries = [
  {
    name: "Freelancer & Berater",
    description:
      "Rechnung für Stundenarbeit, Festprojekte oder Retainer-Gebühren. Fügen Sie Arbeitsumfang, Stunden und Satz hinzu.",
    items: ["Stundensatz × Stunden", "Festes Projekthonorar", "Kilometergeld / Auslagen"],
  },
  {
    name: "Webdesigner & Entwickler",
    description:
      "Schlüsseln Sie Design-, Entwicklungs- und Überarbeitungsphasen auf. Listen Sie jede Lieferung einzeln auf.",
    items: ["UI/UX-Design", "Frontend-Entwicklung", "Hosting-Einrichtung"],
  },
  {
    name: "Fotografen & Videografen",
    description:
      "Berechnen Sie pro Sitzung, pro Projekt oder pro Lieferung. Fügen Sie ggf. Nutzungsrechte hinzu.",
    items: ["Sitzungsgebühr", "Bearbeitung / Postproduktion", "Abzüge / digitale Dateien"],
  },
  {
    name: "Auftragnehmer & Handwerker",
    description:
      "Schlüsseln Sie Material, Arbeitszeit und Genehmigungen auf. Fügen Sie Projektadresse und Zeitplan hinzu.",
    items: ["Arbeitsstunden", "Material", "Genehmigungen / Gebühren"],
  },
  {
    name: "Kleinunternehmen",
    description:
      "Produktverkäufe, Servicepakete oder wiederkehrende Abonnements. Fügen Sie bei Bedarf Steuern hinzu.",
    items: ["Produkt / SKU", "Servicepaket", "Wiederkehrendes Abonnement"],
  },
];

export default function InvoiceTemplateDe() {
  return (
    <div id="top" className="min-h-screen scroll-mt-20">
      {/* Nav */}
      <nav className="fixed inset-x-0 top-0 z-40 border-b border-[#e5e7eb] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1024px] items-center justify-between px-6">
          <Link href={localizedPath("/", "de")} className="flex items-center gap-2 font-bold text-[#111827]">
            <svg width="20" height="20" viewBox="0 0 64 64" aria-hidden="true">
              <rect width="64" height="64" rx="14.5" fill="#166534" />
              <path d="M35.5 10 19 37h9.5l-3 17L43 27h-9.5l2-17z" fill="#fff" />
            </svg>
            Invoala
          </Link>
          <Link href="/#generate" className="rounded-lg bg-[#14532d] px-5 py-2 text-[14px] font-semibold text-white transition hover:bg-[#0f3d22]">
            Rechnung Erstellen
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pb-12 pt-32 md:pt-40">
        <div className="mx-auto max-w-[720px]">
          <p className="text-[14px] font-medium text-[#166534]">Vorlagen</p>
          <h1 className="mt-3 text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[56px]">
            Kostenlose Rechnungsvorlage
          </h1>
          <p className="mt-4 text-[18px] leading-relaxed text-[#6b7280]">
            Wählen Sie eine Branche, füllen Sie die Lücken aus, laden
            Sie ein makelloses PDF herunter. Jede Vorlage ist kostenlos
            — keine Anmeldung, kein Wasserzeichen, keine Limits.
          </p>
          <Link
            href="/#generate"
            className="mt-6 inline-block rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0f3d22]"
          >
            Mit einer Vorlage starten
          </Link>
        </div>
      </section>

      {/* Industries */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-[720px]">
          <h2 className="text-[28px] font-extrabold tracking-tight">
            Vorlagen nach Branche
          </h2>
          <p className="mt-2 text-[16px] text-[#6b7280]">
            Jede Rechnung folgt der gleichen Struktur — fügen Sie die
            passenden Positionen für Ihr Fachgebiet hinzu.
          </p>

          <div className="mt-10 space-y-8">
            {industries.map((ind) => (
              <div
                key={ind.name}
                className="rounded-xl border border-[#e5e7eb] bg-[#fafafa] p-6"
              >
                <h3 className="text-[18px] font-bold tracking-tight">
                  {ind.name}
                </h3>
                <p className="mt-2 text-[15px] text-[#374151]">
                  {ind.description}
                </p>
                <ul className="mt-3 space-y-1">
                  {ind.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-[14px] text-[#6b7280]"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#166534"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What to include */}
      <section className="bg-[#f3f4f6] px-6 py-16">
        <div className="mx-auto max-w-[720px]">
          <h2 className="text-[28px] font-extrabold tracking-tight">
            Jede Gute Rechnung Enthält
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {[
              {
                title: "Ihre Angaben",
                desc: "Name, Adresse, E-Mail, Telefon — damit der Kunde weiß, an wen er zahlen soll.",
              },
              {
                title: "Kundendaten",
                desc: "Wem Sie in Rechnung stellen. Name, E-Mail und Adresse.",
              },
              {
                title: "Rechnungsnummer",
                desc: "Eine eindeutige ID zur Nachverfolgung. INV-001, INV-002 usw.",
              },
              {
                title: "Datum & Fälligkeitsdatum",
                desc: "Wann sie ausgestellt wurde und wann die Zahlung fällig ist.",
              },
              {
                title: "Positionen",
                desc: "Was Sie getan haben, wie viel und zu welchem Stückpreis.",
              },
              {
                title: "Summe & Steuer",
                desc: "Zwischensumme, Steuerprozentsatz und endgültiger geschuldeter Betrag.",
              },
              {
                title: "Zahlungsbedingungen",
                desc: "Netto 15, Netto 30, oder bei Erhalt. Zahlungsmethoden angeben.",
              },
              {
                title: "Notizen",
                desc: "Dankesnachricht, Mahngebühren-Regelung oder besondere Hinweise.",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-3">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#166534] text-[12px] font-bold text-white">
                  ✓
                </span>
                <div>
                  <h3 className="text-[15px] font-semibold">{item.title}</h3>
                  <p className="mt-0.5 text-[14px] text-[#6b7280]">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-[720px] text-center">
          <h2 className="text-[28px] font-extrabold tracking-tight">
            Erstellen Sie jetzt Ihre Rechnung
          </h2>
          <p className="mt-2 text-[16px] text-[#6b7280]">
            Wählen Sie eine Vorlage, füllen Sie Ihre Daten aus, laden
            Sie das PDF herunter.
          </p>
          <Link
            href="/#generate"
            className="mt-6 inline-block rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0f3d22]"
          >
            Erstellen Sie Ihre Rechnung
          </Link>
        </div>
      </section>

      {/* Internal links */}
      <section className="border-t border-[#e5e7eb] px-6 py-10">
        <div className="mx-auto max-w-[720px]">
          <h3 className="text-[16px] font-semibold">Weiterlesen</h3>
          <ul className="mt-3 space-y-2 text-[15px]">
            <li>
              <Link href="/how-to-create-invoice" className="text-[#166534] hover:underline">
                Wie man eine Rechnung erstellt — Schritt-für-Schritt-Anleitung
              </Link>
            </li>
            <li>
              <Link href="/#features" className="text-[#166534] hover:underline">
                Invoala-Funktionen
              </Link>
            </li>
            <li>
              <Link href="/#faq" className="text-[#166534] hover:underline">
                Häufig gestellte Fragen
              </Link>
            </li>
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e5e7eb] bg-[#f3f4f6] px-6 py-10">
        <div className="mx-auto max-w-[1024px] text-center text-[13px] text-[#6b7280]">
          <Link href="/" className="font-bold text-[#111827]">
            Invoala
          </Link>{" "}
          &copy; 2026. Kostenloser Rechnungsgenerator für Freelancer.
        </div>
      </footer>
    </div>
  );
}
