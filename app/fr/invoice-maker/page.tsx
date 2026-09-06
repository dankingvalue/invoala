/* eslint-disable react/no-unescaped-entities */
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
    title: "Créateur de Factures — Créez des Factures Professionnelles en Quelques Secondes",
    description:
      "Invoala est un créateur de factures qui vous aide à créer des factures professionnelles en quelques secondes. Rapide, gratuit et sans inscription. Téléchargez un PDF soigné dès maintenant.",
    path: "/fr/invoice-maker",
    keywords: [
      "créateur de factures",
      "faire une facture",
      "créer une facture",
      "facture professionnelle",
      "générateur de factures",
    ],
    ogDescription:
      "Invoala est un créateur de factures qui vous aide à créer des factures professionnelles en quelques secondes. Rapide, gratuit et sans inscription.",
    hreflang: hreflangAlternates("/invoice-maker"),
    ogLocale: "fr_FR",
  });
}

const faqs = [
  {
    q: "À quelle vitesse puis-je faire une facture avec Invoala ?",
    a: "La plupart des utilisateurs créent une facture complète en moins de deux minutes. Si vous avez déjà enregistré les informations de votre entreprise et de votre client, c'est encore plus rapide — sélectionnez simplement un client et ajoutez vos articles.",
  },
  {
    q: "Le créateur de factures est-il gratuit ?",
    a: "Oui. Le créateur de factures d'Invoala est entièrement gratuit — sans essai, sans mur payant, sans filigrane. Créez des factures illimitées et téléchargez des PDF professionnels sans rien payer.",
  },
  {
    q: "Ai-je besoin de compétences techniques pour faire une facture ?",
    a: "Pas du tout. Le créateur de factures utilise un formulaire simple — remplissez vos informations, ajoutez des articles et cliquez sur télécharger. Pas de compétences en design, pas de formules de tableur, pas de courbe d'apprentissage.",
  },
  {
    q: "Puis-je personnaliser l'apparence de ma facture ?",
    a: "Oui. Ajoutez votre logo, choisissez votre devise, définissez votre taux de taxe et incluez des notes de paiement. Le créateur de factures gère automatiquement la mise en page professionnelle.",
  },
  {
    q: "Quel format de fichier produit le créateur de factures ?",
    a: "PDF — un document A4 propre et prêt à imprimer qui a la même apparence sur tous les appareils et s'imprime parfaitement sur toute imprimante. Joignez-le à un e-mail ou imprimez-le directement.",
  },
  {
    q: "Puis-je faire des factures dans différentes devises ?",
    a: "Oui. Invoala prend en charge 154 devises mondiales. Sélectionnez votre devise dans le menu déroulant et le créateur de factures formate automatiquement le symbole et les décimales.",
  },
  {
    q: "En quoi est-ce différent d'utiliser Word ou Excel ?",
    a: "Word et Excel nécessitent une mise en forme manuelle et une configuration de formules. Le créateur de factures d'Invoala est conçu pour cela — vous obtenez des totaux automatiques, le calcul des taxes, une mise en forme professionnelle et un téléchargement PDF en une seule étape.",
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

export default async function InvoiceMakerPageFr() {
  const user = await getCurrentUser();

  return (
    <>
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
          <Link
            href="/#generate"
            className="rounded-lg bg-[#14532d] px-5 py-2 text-[14px] font-semibold text-white transition hover:bg-[#0f3d22]"
          >
            Créer une Facture
          </Link>
        </div>
      </nav>

      <main className="pt-28 pb-16">
        <div className="mx-auto max-w-[1200px] px-6">
          {/* Hero */}
          <section className="mb-12 text-center">
            <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[56px]">
              Créateur de Factures — Créez des Factures Professionnelles en Quelques Secondes
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              Le moyen le plus rapide de faire une facture professionnelle.
              Aucune courbe d'apprentissage, aucune inscription, aucune
              limite. Remplissez simplement le formulaire et téléchargez
              un PDF soigné.
            </p>
            <p className="mt-4 text-[14px] text-[#9ca3af]">
              Gratuit pour toujours &middot; Sans inscription &middot; Aucune carte bancaire requise
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
              Faites des factures en secondes, pas en minutes
            </h2>
            <div className="mt-8 grid gap-12 sm:grid-cols-3">
              {[
                {
                  n: "01",
                  title: "Saisissez vos informations",
                  desc: "Nom de l'entreprise, informations client, articles. Le formulaire est court et intuitif — aucune formation nécessaire.",
                },
                {
                  n: "02",
                  title: "Regardez l'aperçu",
                  desc: "Regardez votre facture prendre forme en temps réel pendant que vous tapez. Ajustez tout avant de télécharger.",
                },
                {
                  n: "03",
                  title: "Téléchargez le PDF",
                  desc: "Un clic vous donne une facture A4 prête à imprimer. Envoyez-la à votre client et soyez payé.",
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
              Pourquoi utiliser un créateur de factures plutôt qu'un tableur ?
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              {[
                {
                  title: "Aucune formule à entretenir",
                  desc: "Les tableurs se cassent quand vous ajoutez des lignes ou changez les taux de taxe. Un créateur de factures gère les calculs automatiquement.",
                },
                {
                  title: "Résultat professionnel",
                  desc: "Les tableurs ressemblent à des tableurs. Un créateur de factures produit un PDF propre qui semble sorti des mains d'un designer.",
                },
                {
                  title: "Flux de travail plus rapide",
                  desc: "Aucune configuration, aucun modèle à paramétrer. Ouvrez l'outil, remplissez le formulaire et téléchargez — terminé en quelques minutes.",
                },
                {
                  title: "Aucune gestion de fichiers",
                  desc: "Pas d'enregistrement, de nommage ou d'organisation de fichiers .xlsx. Votre facture est générée à neuf à chaque fois et téléchargée en PDF.",
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
              Tout ce qu'inclut le créateur de factures
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Téléchargement de logo",
                  desc: "Ajoutez le logo de votre entreprise pour un look de marque.",
                },
                {
                  title: "Rédaction par IA",
                  desc: "Décrivez le travail et l'IA crée la facture pour vous.",
                },
                {
                  title: "Calcul des taxes",
                  desc: "TVA, GST ou taxe de vente — calculée automatiquement.",
                },
                {
                  title: "154 devises",
                  desc: "Facturez vos clients partout dans le monde avec le bon formatage.",
                },
                {
                  title: "Aperçu en direct",
                  desc: "Voyez votre facture se mettre à jour en temps réel pendant que vous tapez.",
                },
                {
                  title: "Export PDF",
                  desc: "Format A4 prêt à imprimer sur tout appareil ou imprimante.",
                },
                {
                  title: "Enregistrement des clients",
                  desc: "Stockez les informations clients pour facturer plus vite à l'avenir.",
                },
                {
                  title: "Conditions de paiement",
                  desc: "Définissez dates d'échéance, moyens de paiement et notes de retard.",
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
              Faites votre première facture maintenant
            </h2>
            <p className="mt-2 text-[16px] text-[#6b7280]">
              Remontez jusqu'au créateur de factures et commencez à
              remplir vos informations. Un PDF professionnel n'est qu'à
              quelques clics.
            </p>
            <Link
              href="/#generate"
              className="mt-6 inline-block rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0f3d22]"
            >
              Créer une Facture
            </Link>
          </section>

          {/* Related links */}
          <section className="mb-20 mx-auto max-w-[1024px] border-t border-[#e5e7eb] pt-8">
            <h3 className="text-[16px] font-semibold">Pages associées</h3>
            <ul className="mt-3 space-y-2 text-[15px]">
              <li>
                <Link href={localizedPath("/invoice-generator", "fr")} className="text-[#166534] hover:underline">
                  Générateur de Factures
                </Link>
              </li>
              <li>
                <Link href="/receipt-generator" className="text-[#166534] hover:underline">
                  Générateur de Factures Gratuit
                </Link>
              </li>
              <li>
                <Link href={localizedPath("/online-invoicing", "fr")} className="text-[#166534] hover:underline">
                  Facturation en Ligne
                </Link>
              </li>
              <li>
                <Link href={localizedPath("/invoicing-software", "fr")} className="text-[#166534] hover:underline">
                  Logiciel de Facturation
                </Link>
              </li>
              <li>
                <Link href="/invoicing-for-freelancers" className="text-[#166534] hover:underline">
                  Facturation pour Freelances
                </Link>
              </li>
            </ul>
          </section>

          {/* FAQ */}
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
