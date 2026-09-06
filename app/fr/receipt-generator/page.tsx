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
    title: "Générateur de Reçus — Créez des Reçus Professionnels Gratuitement",
    description:
      "Créez un reçu professionnel en quelques secondes. Enregistrez les paiements, indiquez ce qui a été payé et quand, et téléchargez un reçu PDF prêt à imprimer. Gratuit, sans inscription.",
    path: "/fr/receipt-generator",
    keywords: [
      "générateur de reçus",
      "créateur de reçus gratuit",
      "créer un reçu",
      "reçu de paiement",
      "reçu de vente",
    ],
    ogDescription:
      "Créez un reçu professionnel en quelques secondes. Enregistrez les paiements et téléchargez un PDF prêt à imprimer. Gratuit, sans inscription.",
    hreflang: hreflangAlternates("/receipt-generator"),
    ogLocale: "fr_FR",
  });
}

const faqs = [
  {
    q: "Quelle est la différence entre une facture et un reçu ?",
    a: "Une facture demande un paiement ; un reçu confirme que le paiement a été reçu. Après qu'un client a payé votre facture, envoyez un reçu indiquant le montant payé, la date et l'objet.",
  },
  {
    q: "Quand dois-je envoyer un reçu ?",
    a: "Envoyez un reçu à chaque fois que vous recevez un paiement — partiel ou total. Les clients ont souvent besoin de reçus pour leur propre comptabilité, leurs notes de frais et leurs déclarations fiscales.",
  },
  {
    q: "Ce générateur de reçus est-il gratuit ?",
    a: "Oui. Créez des reçus illimités sans filigrane et sans inscription. Remplissez le formulaire, prévisualisez-le en direct et téléchargez un PDF prêt à imprimer.",
  },
  {
    q: "Puis-je ajouter mon logo et les informations de mon entreprise ?",
    a: "Oui. Téléchargez votre logo, indiquez le nom de votre entreprise, votre adresse et votre e-mail. Votre reçu inclut une mention PAYÉ et un détail clair des postes.",
  },
  {
    q: "Les reçus ont-ils besoin d'un numéro de facture ?",
    a: "Les reçus font généralement référence à leur propre numéro ou à la facture concernée. Utilisez le champ numéro pour un numéro de reçu (ex. RCPT-001) ou ajoutez le numéro de facture en champ personnalisé.",
  },
  {
    q: "Puis-je enregistrer des paiements partiels ?",
    a: "Oui. Listez uniquement les articles ou montants couverts par ce paiement. Pour un paiement partiel, notez le solde restant dans la section des notes.",
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

export default async function ReceiptGeneratorPageFr() {
  const user = await getCurrentUser();

  return (
    <>
      <SetHtmlLang lang="fr" />
      <FaqJsonLd />

      <nav className="fixed inset-x-0 top-0 z-40 border-b border-[#e5e7eb] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1024px] items-center justify-between px-6">
          <Link href={localizedPath("/", "fr")} className="flex items-center gap-2 font-bold text-[#111827]">
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
                Tableau de bord
              </Link>
            ) : null}
            <Link
              href="/#generate"
              className="rounded-lg bg-[#14532d] px-5 py-2 text-[14px] font-semibold text-white transition hover:bg-[#0f3d22]"
            >
              Créer une Facture
            </Link>
            <SeoNavMobile locale="fr" />
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-16">
        <div className="mx-auto max-w-[1200px] px-6">
          <section className="mb-12 text-center">
            <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[56px]">
              Générateur de Reçus
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              Confirmez chaque paiement avec un reçu professionnel. Le
              générateur ci-dessous est réglé en mode reçu — ajoutez ce qui
              a été payé, quand et par qui, puis téléchargez un PDF soigné.
            </p>
            <p className="mt-4 text-[14px] text-[#9ca3af]">
              Gratuit pour toujours &middot; Sans inscription &middot; Sans filigrane
            </p>
          </section>

          <section className="mb-20">
            <InvoiceGenerator
              user={user ? { email: user.email } : null}
              preset={{
                docType: "receipt",
                invoiceNumber: "RCPT-001",
                notes: "Merci pour votre confiance !",
              }}
              ai={false}
              quoteMode
            />
          </section>

          <section className="mb-20 mx-auto max-w-[1024px]">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              De la facture au reçu en une étape
            </h2>
            <div className="mt-8 grid gap-12 sm:grid-cols-3">
              {[
                {
                  n: "01",
                  title: "Enregistrez le paiement",
                  desc: "Indiquez ce qui a été payé et quand. Le reçu affiche la date de paiement au lieu d'une date d'échéance.",
                },
                {
                  n: "02",
                  title: "Détaillez ce qui a été couvert",
                  desc: "Listez les produits ou services couverts par le paiement, exactement comme sur la facture d'origine.",
                },
                {
                  n: "03",
                  title: "Téléchargez et envoyez",
                  desc: "Obtenez un reçu PDF prêt à imprimer avec une mention PAYÉ. Envoyez-le par e-mail ou remettez-le en main propre.",
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
              Pourquoi envoyer des reçus ?
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              {[
                {
                  title: "Preuve de paiement",
                  desc: "Les reçus attestent qu'un échange d'argent a eu lieu — vous protégeant, vous et votre client, en cas de questions ultérieures.",
                },
                {
                  title: "Les clients les attendent",
                  desc: "Les clients professionnels ont besoin de reçus pour leurs notes de frais et déclarations fiscales. En envoyer un automatiquement facilite la relation.",
                },
                {
                  title: "Des registres clairs",
                  desc: "Un historique de reçus numérotés simplifie la réconciliation au moment des impôts, notamment pour les paiements en espèces et par carte.",
                },
                {
                  title: "Un suivi professionnel",
                  desc: "Confirmer le paiement avec un reçu est une touche professionnelle qui termine la transaction sur une bonne note.",
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
            <h3 className="text-[16px] font-semibold">Pages associées</h3>
            <ul className="mt-3 space-y-2 text-[15px]">
              <li>
                <Link href={localizedPath("/invoice-generator", "fr")} className="text-[#166534] hover:underline">
                  Générateur de Factures
                </Link>
              </li>
              <li>
                <Link href="/estimate-generator" className="text-[#166534] hover:underline">
                  Générateur de Devis
                </Link>
              </li>
              <li>
                <Link href="/learn/invoice-vs-receipt" className="text-[#166534] hover:underline">
                  Facture vs Reçu : Quelle Différence ?
                </Link>
              </li>
              <li>
                <Link href="/invoice-payment-tracking" className="text-[#166534] hover:underline">
                  Suivi des Paiements de Factures
                </Link>
              </li>
              <li>
                <Link href="/learn/how-to-track-unpaid-invoices" className="text-[#166534] hover:underline">
                  Comment Suivre les Factures Impayées
                </Link>
              </li>
            </ul>
          </section>

          <section className="mb-20 mx-auto max-w-[1024px]">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Questions fréquentes
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

      <SeoFooter locale="fr" />
    </>
  );
}
