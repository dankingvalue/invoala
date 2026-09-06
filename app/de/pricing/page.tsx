import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { hreflangAlternates, localizedPath } from "@/lib/i18n";
import { SeoNav, SeoFooter, FaqSection, CtaBlock, JsonLd } from "@/components/seo/SeoPage";
import { SetHtmlLang } from "@/components/SetHtmlLang";
import { ProPricing } from "@/components/ProPricing";
import { faqSchema } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Preise — Für Immer Kostenlos, Upgraden Wenn Sie Bereit Sind",
    description:
      "Invoala-Preise: ein wirklich kostenloser Rechnungsgenerator, plus Pro- und Teams-Pläne für gespeicherte Kunden, Angebote und Team-Abrechnung. Keine Kreditkarte zum Starten erforderlich.",
    path: "/de/pricing",
    keywords: ["invoala Preise", "kostenlose Rechnungssoftware", "Kosten des Rechnungsgenerators"],
    hreflang: hreflangAlternates("/pricing"),
    ogLocale: "de_DE",
  });
}

const faqs = [
  {
    question: "Ist Invoala wirklich kostenlos?",
    answer:
      "Ja. Der Rechnungsgenerator ist für immer kostenlos: unbegrenzte Rechnungen, professionelle PDFs, kein Wasserzeichen, keine Anmeldung erforderlich. Es gibt keine Testphase, die endet.",
  },
  {
    question: "Was bietet der Pro-Plan zusätzlich?",
    answer:
      "Pro bietet gespeicherte Kundenprofile mit Verlauf, Angebote und Kostenvoranschläge, mehrere Firmenprofile und bevorzugten Support. Sie behalten alles aus dem kostenlosen Plan.",
  },
  {
    question: "Kann ich jederzeit kündigen?",
    answer:
      "Ja. Abonnements können jederzeit über Ihr Dashboard gekündigt werden, und Sie behalten den Zugriff bis zum Ende des Abrechnungszeitraums.",
  },
  {
    question: "Welche Zahlungsmethoden akzeptieren Sie?",
    answer:
      "Der Checkout wird von Polar abgewickelt und akzeptiert alle gängigen Kredit- und Debitkarten sowie beliebte lokale Zahlungsmethoden, sofern verfügbar.",
  },
  {
    question: "Bieten Sie Rückerstattungen an?",
    answer: "Rückerstattungen erfolgen gemäß den Nutzungsbedingungen. Kontaktieren Sie hello@invoala.com bei Fragen zur Abrechnung.",
  },
];

export default function PricingPageDe() {
  return (
    <>
      <SetHtmlLang lang="de" />
      <JsonLd data={faqSchema(faqs)} />
      <SeoNav locale="de" />
      <main className="pt-28 pb-16">
        <div className="mx-auto max-w-[1024px] px-6">
          <section className="mb-14 text-center">
            <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[56px]">
              Kostenlos starten. Upgraden, wenn Sie es brauchen.
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              Der Rechnungsgenerator ist für immer kostenlos — keine
              Testphase, keine Kreditkarte. Die Pro- und Teams-Pläne
              bieten mehr Leistung für wachsende Unternehmen.
            </p>
          </section>
        </div>

        {/* Full-bleed pricing band — same treatment as the homepage section */}
        <ProPricing />

        <div className="mx-auto max-w-[1024px] px-6">
          <section className="mb-14">
            <FaqSection items={faqs} title="Häufig gestellte Fragen" />
          </section>

          <section className="mb-10">
            <CtaBlock
              title="Testen Sie zuerst den kostenlosen Generator"
              description="Erstellen Sie Ihre erste Rechnung in weniger als zwei Minuten — entscheiden Sie sich später für einen Plan."
              buttonText="Rechnung erstellen"
              buttonHref={localizedPath("/invoice-generator", "de")}
            />
          </section>
        </div>
      </main>
      <SeoFooter locale="de" />
    </>
  );
}
