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
    title: "Générateur de Devis — Devis de Travaux Gratuits",
    description:
      "Créez un devis de travaux professionnel en quelques secondes. Détaillez les coûts avant de commencer, remportez le projet, puis convertissez le devis en facture en un clic. Gratuit, sans inscription.",
    path: "/fr/estimate-generator",
    keywords: [
      "générateur de devis",
      "créateur de devis gratuit",
      "devis de travaux",
      "estimation de coûts",
      "modèle de devis",
    ],
    ogDescription:
      "Créez un devis de travaux professionnel en quelques secondes et convertissez-le en facture une fois le travail approuvé. Gratuit, sans inscription.",
    hreflang: hreflangAlternates("/estimate-generator"),
    ogLocale: "fr_FR",
  });
}

const faqs = [
  {
    q: "Quelle est la différence entre un devis et une estimation ?",
    a: "Les deux détaillent les coûts avant le début des travaux. Une estimation est généralement un chiffre approximatif qui peut changer ; un devis est un prix fixe que le client peut vous demander de respecter. Le mode devis d'Invoala affiche un total estimé et une date de validité.",
  },
  {
    q: "Que doit contenir un devis de travaux ?",
    a: "Les informations de votre entreprise, celles du client, une description du travail sous forme d'articles, de quantités et de tarifs, un total estimé, et la durée de validité du devis.",
  },
  {
    q: "Puis-je transformer un devis en facture ?",
    a: "Oui. Lorsque le client approuve, cliquez sur « Convertir en facture » — les mêmes articles sont repris et une date d'échéance est définie automatiquement. Rien à ressaisir.",
  },
  {
    q: "Les devis sont-ils juridiquement contraignants ?",
    a: "Les devis ne sont généralement pas contraignants, sauf indication contraire de votre part. Une estimation ferme est traitée comme une offre engageante. Indiquez toujours une période de validité pour éviter que d'anciens prix ne reviennent vous hanter.",
  },
  {
    q: "Le générateur de devis est-il gratuit ?",
    a: "Oui — sans inscription, sans filigrane, sans limite. Téléchargez autant de PDF de devis que nécessaire.",
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

export default async function EstimateGeneratorPageFr() {
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
              Générateur de Devis
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              Chiffrez votre prochain chantier avant de le commencer. Le
              générateur ci-dessous est réglé en mode devis — détaillez le
              travail, fixez une date de validité, et convertissez-le en
              facture quand le client dit oui.
            </p>
            <p className="mt-4 text-[14px] text-[#9ca3af]">
              Gratuit pour toujours &middot; Sans inscription &middot; Sans filigrane
            </p>
          </section>

          <section className="mb-20">
            <InvoiceGenerator
              user={user ? { email: user.email } : null}
              preset={{
                docType: "estimate",
                invoiceNumber: "EST-001",
                notes: "Ce devis est valable 30 jours.",
              }}
              ai={false}
              quoteMode
            />
          </section>

          <section className="mb-20 mx-auto max-w-[1024px]">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Devis &rarr; approuvé &rarr; facture
            </h2>
            <div className="mt-8 grid gap-12 sm:grid-cols-3">
              {[
                {
                  n: "01",
                  title: "Chiffrez le travail",
                  desc: "Décomposez le travail en articles avec quantités et tarifs. Le total estimé se met à jour en direct.",
                },
                {
                  n: "02",
                  title: "Envoyez pour approbation",
                  desc: "Téléchargez un PDF de devis professionnel avec une date de validité. Le client sait exactement ce qu'il approuve.",
                },
                {
                  n: "03",
                  title: "Convertissez une fois approuvé",
                  desc: "Cliquez sur « Convertir en facture » et le devis devient une vraie facture avec une date d'échéance — rien à ressaisir.",
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
              Des devis qui remportent des contrats
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              {[
                {
                  title: "Périmètre clair, moins de litiges",
                  desc: "Un devis détaillé par article indique au client exactement ce qu'il paie — et ce qui n'est pas inclus.",
                },
                {
                  title: "Décisions plus rapides",
                  desc: "Une mise en forme professionnelle et une date de validité créent une urgence douce, sans tactiques de pression.",
                },
                {
                  title: "Des tarifs cohérents",
                  desc: "Utilisez des articles et clients enregistrés pour que les travaux récurrents soient tarifés de la même façon à chaque fois.",
                },
                {
                  title: "Zéro ressaisie",
                  desc: "Une fois le devis approuvé, convertissez-le directement en facture avec les mêmes articles et montants.",
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
                <Link href="/receipt-generator" className="text-[#166534] hover:underline">
                  Générateur de Reçus
                </Link>
              </li>
              <li>
                <Link href="/estimates-and-invoices" className="text-[#166534] hover:underline">
                  Devis et Factures
                </Link>
              </li>
              <li>
                <Link href="/learn/invoice-vs-estimate" className="text-[#166534] hover:underline">
                  Facture vs Devis : Quand Envoyer Chacun
                </Link>
              </li>
              <li>
                <Link href="/templates" className="text-[#166534] hover:underline">
                  Modèles de Factures
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
