import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { hreflangAlternates, localizedPath } from "@/lib/i18n";
import { SeoNav, SeoFooter, FaqSection, CtaBlock, JsonLd } from "@/components/seo/SeoPage";
import { SetHtmlLang } from "@/components/SetHtmlLang";
import { ProPricing } from "@/components/ProPricing";
import { faqSchema } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Tarifs — Gratuit pour Toujours, Passez à un Plan Supérieur Quand Vous Voulez",
    description:
      "Tarifs d'Invoala : un générateur de factures véritablement gratuit, plus les forfaits Pro et Teams pour les clients enregistrés, les devis et la facturation d'équipe. Aucune carte bancaire requise pour commencer.",
    path: "/fr/pricing",
    keywords: ["tarifs invoala", "logiciel de facturation gratuit", "coût du générateur de factures"],
    hreflang: hreflangAlternates("/pricing"),
    ogLocale: "fr_FR",
  });
}

const faqs = [
  {
    question: "Invoala est-il vraiment gratuit ?",
    answer:
      "Oui. Le générateur de factures est gratuit pour toujours : factures illimitées, PDF professionnels, sans filigrane, sans inscription requise. Il n'y a pas d'essai qui se termine.",
  },
  {
    question: "Qu'ajoute le forfait Pro ?",
    answer:
      "Pro ajoute des profils clients enregistrés avec historique, des devis et estimations, des profils multi-entreprises et un support prioritaire. Vous conservez tout ce qui est dans le forfait gratuit.",
  },
  {
    question: "Puis-je annuler à tout moment ?",
    answer:
      "Oui. Les abonnements peuvent être annulés à tout moment depuis votre tableau de bord, et vous conservez l'accès jusqu'à la fin de la période de facturation.",
  },
  {
    question: "Quels moyens de paiement acceptez-vous ?",
    answer:
      "Le paiement est géré par Polar et accepte toutes les principales cartes de crédit et de débit, ainsi que des moyens de paiement locaux populaires lorsqu'ils sont disponibles.",
  },
  {
    question: "Proposez-vous des remboursements ?",
    answer: "Les remboursements sont gérés conformément aux Conditions d'Utilisation. Contactez hello@invoala.com pour toute question de facturation.",
  },
];

export default function PricingPageFr() {
  return (
    <>
      <SetHtmlLang lang="fr" />
      <JsonLd data={faqSchema(faqs)} />
      <SeoNav locale="fr" />
      <main className="pt-28 pb-16">
        <div className="mx-auto max-w-[1024px] px-6">
          <section className="mb-14 text-center">
            <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[56px]">
              Commencez gratuitement. Passez à un plan supérieur quand vous
              en avez besoin.
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              Le générateur de factures est gratuit pour toujours — sans
              essai, sans carte bancaire. Les forfaits Pro et Teams
              ajoutent de la puissance pour les entreprises en croissance.
            </p>
          </section>
        </div>

        {/* Full-bleed pricing band — same treatment as the homepage section */}
        <ProPricing />

        <div className="mx-auto max-w-[1024px] px-6">
          <section className="mb-14">
            <FaqSection items={faqs} title="Questions fréquentes" />
          </section>

          <section className="mb-10">
            <CtaBlock
              title="Essayez d'abord le générateur gratuit"
              description="Créez votre première facture en moins de deux minutes — décidez des forfaits plus tard."
              buttonText="Créer une facture"
              buttonHref={localizedPath("/invoice-generator", "fr")}
            />
          </section>
        </div>
      </main>
      <SeoFooter locale="fr" />
    </>
  );
}
