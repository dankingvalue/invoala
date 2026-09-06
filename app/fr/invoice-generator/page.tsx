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
    title: "Générateur de Factures Gratuit — Créez des Factures Professionnelles en Ligne",
    description:
      "Utilisez le générateur de factures gratuit d'Invoala pour créer des factures professionnelles en quelques secondes. Aucune inscription requise — remplissez simplement le formulaire et téléchargez un PDF soigné.",
    path: "/fr/invoice-generator",
    keywords: [
      "générateur de factures",
      "générateur de factures gratuit",
      "générateur de factures en ligne",
      "créer une facture",
    ],
    ogDescription:
      "Utilisez le générateur de factures gratuit d'Invoala pour créer des factures professionnelles en quelques secondes. Aucune inscription requise.",
    hreflang: hreflangAlternates("/invoice-generator"),
    ogLocale: "fr_FR",
  });
}

const faqs = [
  {
    q: "Comment utiliser le générateur de factures ?",
    a: "Renseignez les informations de votre entreprise, ajoutez les coordonnées de votre client, saisissez les articles avec quantités et tarifs, définissez un taux de taxe si nécessaire, puis cliquez sur télécharger. Vous obtiendrez un PDF professionnel en quelques secondes.",
  },
  {
    q: "Le générateur de factures est-il vraiment gratuit ?",
    a: "Oui. Aucun frais caché, aucun filigrane et aucune limite. Créez autant de factures que vous le souhaitez, pour toujours.",
  },
  {
    q: "Dois-je créer un compte pour utiliser le générateur ?",
    a: "Non. Le générateur de factures fonctionne instantanément sans inscription. Ouvrez la page, renseignez vos informations et téléchargez votre facture.",
  },
  {
    q: "Puis-je ajouter mon logo à la facture ?",
    a: "Oui. Cliquez sur la zone de téléchargement de logo dans le formulaire pour ajouter le logo de votre entreprise. Il apparaît en haut de chaque facture pour un rendu professionnel.",
  },
  {
    q: "Quelles devises le générateur prend-il en charge ?",
    a: "Invoala prend en charge 154 devises mondiales, dont USD, EUR, GBP, JPY, CAD, AUD et bien d'autres. La facture formate automatiquement le symbole de la devise et les décimales.",
  },
  {
    q: "Le générateur calcule-t-il les taxes ?",
    a: "Oui. Saisissez votre taux de taxe (TVA, GST, taxe de vente) et le total se met à jour en direct au fur et à mesure de votre saisie. Vous pouvez voir le détail dans l'aperçu.",
  },
  {
    q: "Puis-je enregistrer mes factures ?",
    a: "Vos données sont automatiquement enregistrées dans le stockage local de votre navigateur. Si vous créez un compte gratuit, vous pouvez également enregistrer vos factures dans le cloud et y accéder depuis n'importe quel appareil.",
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

export default async function InvoiceGeneratorPageFr() {
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
          {/* Hero */}
          <section className="mb-12 text-center">
            <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[56px]">
              Générateur de Factures Gratuit
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              Créez des factures professionnelles en quelques secondes.
              Sans inscription, sans carte bancaire, sans filigrane. Juste
              un PDF soigné prêt à envoyer à votre client.
            </p>
          </section>

          {/* Embedded generator */}
          <section className="mb-20">
            <InvoiceGenerator
              user={user ? { email: user.email } : null}
            />
          </section>

          {/* How to use */}
          <section className="mb-20 mx-auto max-w-[1024px]">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Comment utiliser le générateur de factures
            </h2>
            <div className="mt-8 grid gap-12 sm:grid-cols-3">
              {[
                {
                  n: "01",
                  title: "Ajoutez vos informations",
                  desc: "Indiquez le nom de votre entreprise, votre e-mail et votre adresse. Ajoutez votre logo pour une touche professionnelle.",
                },
                {
                  n: "02",
                  title: "Décrivez votre travail",
                  desc: "Ajoutez des articles avec descriptions, quantités et tarifs. Ou utilisez l'IA pour les rédiger à partir d'un texte simple.",
                },
                {
                  n: "03",
                  title: "Téléchargez le PDF",
                  desc: "Cliquez sur le bouton de téléchargement pour obtenir une facture A4 soignée. Joignez-la à un e-mail et envoyez-la à votre client.",
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

          {/* What's included */}
          <section className="mb-20 mx-auto max-w-[1024px] rounded-xl bg-[#f3f4f6] p-8 md:p-12">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Ce qui est inclus dans chaque facture
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Mise en page professionnelle",
                  desc: "Une typographie et un espacement soignés qui donnent à votre travail un rendu premium.",
                },
                {
                  title: "Votre image de marque",
                  desc: "Ajoutez votre logo et les informations de votre entreprise pour une expérience de marque cohérente.",
                },
                {
                  title: "Articles détaillés",
                  desc: "Détail des services ou produits avec quantités et tarifs.",
                },
                {
                  title: "Détail des taxes",
                  desc: "Calcul automatique de la TVA, GST ou taxe de vente avec un résumé clair.",
                },
                {
                  title: "Conditions de paiement",
                  desc: "Dates d'échéance, moyens de paiement et notes pour que les clients sachent exactement comment payer.",
                },
                {
                  title: "PDF prêt à imprimer",
                  desc: "Format A4 qui s'imprime parfaitement et reste identique sur tous les appareils.",
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
              Prêt à créer votre facture ?
            </h2>
            <p className="mt-2 text-[16px] text-[#6b7280]">
              Remontez et commencez à remplir le formulaire. Votre
              première facture professionnelle est à quelques minutes.
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
                <Link href="/receipt-generator" className="text-[#166534] hover:underline">
                  Générateur de Reçus
                </Link>
              </li>
              <li>
                <Link href="/invoice-maker" className="text-[#166534] hover:underline">
                  Créateur de Factures
                </Link>
              </li>
              <li>
                <Link href="/online-invoicing" className="text-[#166534] hover:underline">
                  Facturation en Ligne
                </Link>
              </li>
              <li>
                <Link href="/invoicing-software" className="text-[#166534] hover:underline">
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
