/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { hreflangAlternates, localizedPath } from "@/lib/i18n";
import { SeoFooter } from "@/components/seo/SeoPage";
import { SetHtmlLang } from "@/components/SetHtmlLang";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Logiciel de Facturation — Facturation Simple pour Entreprises Modernes",
    description:
      "Invoala est un logiciel de facturation simple pour les freelances et les petites entreprises. Créez des factures professionnelles, suivez les paiements et soyez payé plus vite — gratuitement.",
    path: "/fr/invoicing-software",
    keywords: [
      "logiciel de facturation",
      "logiciel de factures",
      "facturation en ligne",
      "logiciel de facturation pour petites entreprises",
    ],
    hreflang: hreflangAlternates("/invoicing-software"),
    ogLocale: "fr_FR",
  });
}

const faqs = [
  {
    q: "Qu'est-ce qu'un logiciel de facturation ?",
    a: "Un logiciel de facturation est un outil qui vous aide à créer, envoyer et gérer les factures de votre entreprise. Il automatise les calculs, suit le statut des paiements et génère des PDF professionnels que vous pouvez envoyer par e-mail à vos clients.",
  },
  {
    q: "Invoala est-il un logiciel de facturation gratuit ?",
    a: "Oui. Invoala est entièrement gratuit — sans essai, sans mur payant, sans filigrane. Créez des factures illimitées, téléchargez des PDF et suivez les paiements sans dépenser un centime.",
  },
  {
    q: "Puis-je utiliser un logiciel de facturation pour ma petite entreprise ?",
    a: "Absolument. Le logiciel de facturation est conçu pour les freelances, consultants, agences, entrepreneurs et petites entreprises de toutes sortes. Il fait gagner du temps et paraît plus professionnel que les tableurs.",
  },
  {
    q: "Quelles fonctionnalités un bon logiciel de facturation doit-il avoir ?",
    a: "Recherchez la création de factures, l'export PDF, le suivi des paiements, la gestion des clients, les factures récurrentes, les calculs de taxes et la prise en charge de plusieurs devises. Invoala inclut tout cela.",
  },
  {
    q: "En quoi un logiciel de facturation diffère-t-il d'un tableur ?",
    a: "Les tableurs nécessitent une mise en forme manuelle et une configuration de formules. Un logiciel de facturation vous offre un modèle soigné, des totaux automatiques, le calcul des taxes, la génération de PDF et le suivi des paiements dans un seul outil.",
  },
  {
    q: "Puis-je envoyer des factures directement depuis Invoala ?",
    a: "Oui. Si vous avez un compte, vous pouvez envoyer des factures par e-mail directement à vos clients depuis le tableau de bord. Les utilisateurs gratuits peuvent télécharger le PDF et l'envoyer depuis leur propre messagerie.",
  },
  {
    q: "Invoala prend-il en charge les factures récurrentes ?",
    a: "Oui. Vous pouvez enregistrer les coordonnées des clients et des modèles de factures pour une réutilisation rapide. La planification complète des factures récurrentes est disponible dans le forfait Pro pour les cycles de facturation réguliers.",
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

export default function InvoicingSoftwarePageFr() {
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
          <Link
            href="/#generate"
            className="rounded-lg bg-[#14532d] px-5 py-2 text-[14px] font-semibold text-white transition hover:bg-[#0f3d22]"
          >
            Créer une Facture
          </Link>
        </div>
      </nav>

      <main className="pt-28 pb-16">
        <div className="mx-auto max-w-[1024px] px-6">
          {/* Hero */}
          <section className="mb-20 text-center">
            <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[56px]">
              Logiciel de Facturation Simple pour Entreprises Modernes
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              Arrêtez de vous battre avec des tableurs. Invoala vous donne
              tout ce dont vous avez besoin pour créer, envoyer et suivre
              vos factures — sans la complexité ni le coût.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                href="/#generate"
                className="rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0f3d22]"
              >
                Créez votre première facture
              </Link>
              <Link
                href={localizedPath("/invoice-generator", "fr")}
                className="text-[16px] font-medium text-[#166534] hover:underline"
              >
                Essayer le générateur &rsaquo;
              </Link>
            </div>
          </section>

          {/* What is invoicing software */}
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Qu'est-ce qu'un logiciel de facturation ?
            </h2>
            <div className="mt-6 space-y-4 text-[16px] leading-relaxed text-[#374151]">
              <p>
                Un logiciel de facturation est un outil numérique qui
                permet aux entreprises de créer, envoyer et gérer des
                factures depuis un seul endroit. Au lieu de créer des
                factures dans un traitement de texte ou un tableur, vous
                remplissez un formulaire et le logiciel gère
                automatiquement la mise en forme, le calcul des taxes, la
                numérotation et la génération de PDF.
              </p>
              <p>
                Un bon logiciel de facturation suit également le statut
                des paiements, afin que vous sachiez toujours quelles
                factures sont payées, lesquelles sont en retard et combien
                de revenus sont en attente. Il remplace une mosaïque
                d'outils par un flux de travail simplifié.
              </p>
              <p>
                Invoala va plus loin en incluant la rédaction de factures
                par IA, la gestion des clients et la prise en charge des
                factures récurrentes — le tout gratuitement.
              </p>
            </div>
          </section>

          {/* Why use it */}
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 md:p-12">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Pourquoi utiliser un logiciel de facturation ?
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              {[
                {
                  title: "Gagnez du temps",
                  desc: "Modèles, remplissage automatique et coordonnées clients enregistrées : passez d'une page blanche à une facture terminée en moins de deux minutes.",
                },
                {
                  title: "Paraissez professionnel",
                  desc: "Des PDF soignés et à votre image renforcent votre crédibilité. Les clients prennent votre entreprise plus au sérieux quand la facture est soignée.",
                },
                {
                  title: "Soyez payé plus vite",
                  desc: "Des conditions de paiement claires, des dates d'échéance et un envoi instantané permettent aux clients de savoir exactement quand et comment payer.",
                },
                {
                  title: "Restez organisé",
                  desc: "Suivez chaque facture par statut — payée, en attente ou en retard — pour que rien ne vous échappe.",
                },
                {
                  title: "Réduisez les erreurs",
                  desc: "Le calcul automatique des taxes et des totaux élimine les erreurs de calcul propres aux tableurs manuels.",
                },
                {
                  title: "Travaillez de n'importe où",
                  desc: "Le logiciel de facturation dans le cloud fonctionne dans votre navigateur. Créez des factures sur ordinateur, tablette ou téléphone.",
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
              Les fonctionnalités qui font la différence d'Invoala
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Suivi des paiements",
                  desc: "Marquez les factures comme payées, en attente ou en retard. Visualisez votre solde en attente en un coup d'œil.",
                },
                {
                  title: "Gestion des clients",
                  desc: "Enregistrez les coordonnées du client une fois et sélectionnez-les dans un menu déroulant sur chaque future facture.",
                },
                {
                  title: "Factures récurrentes",
                  desc: "Configurez des factures répétées pour un travail continu. N'oubliez plus jamais de facturer vos abonnements mensuels.",
                },
                {
                  title: "Rappels de paiement",
                  desc: "Des rappels automatiques maintiennent votre trésorerie saine sans e-mails de relance gênants.",
                },
                {
                  title: "Rédaction de factures par IA",
                  desc: "Décrivez ce que vous avez fait en mots simples et l'IA en fait une facture terminée avec articles et totaux.",
                },
                {
                  title: "Plusieurs devises",
                  desc: "Facturez vos clients dans l'une des 154 devises mondiales avec les bons symboles et le bon format décimal.",
                },
                {
                  title: "Téléchargement PDF",
                  desc: "Exportez un PDF A4 propre et prêt à imprimer qui a fière allure sur tout appareil ou toute imprimante.",
                },
                {
                  title: "Calculs de taxes",
                  desc: "Saisissez votre taux de TVA, GST ou taxe de vente et le total se met à jour en direct au fur et à mesure de votre saisie.",
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
              À qui s'adresse Invoala ?
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Freelances",
                  desc: "Envoyez des factures soignées pour vos projets, jalons et travail à l'heure sans payer pour un logiciel dont vous n'avez pas besoin.",
                },
                {
                  title: "Petites entreprises",
                  desc: "Gérez la facturation d'une équipe en croissance. Suivez qui a payé et qui vous doit — le tout depuis un tableau de bord.",
                },
                {
                  title: "Consultants",
                  desc: "Facturez votre expertise avec des factures professionnelles qui reflètent la qualité de votre travail.",
                },
                {
                  title: "Agences",
                  desc: "Gérez plusieurs clients et projets avec des coordonnées clients enregistrées et une facturation récurrente.",
                },
                {
                  title: "Entrepreneurs",
                  desc: "Créez des factures sur site depuis votre téléphone. Téléchargez le PDF et envoyez-le par e-mail avant de quitter le chantier.",
                },
                {
                  title: "Activités complémentaires",
                  desc: "Soyez payé professionnellement pour votre travail freelance sans investir dans des outils de facturation coûteux.",
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
              Comment Invoala se compare
            </h2>
            <div className="mt-8 space-y-4 text-[16px] leading-relaxed text-[#374151]">
              <p>
                La plupart des logiciels de facturation se répartissent en
                deux camps : les outils gratuits aux fonctionnalités
                limitées, ou les plateformes coûteuses à la courbe
                d'apprentissage abrupte. Invoala se situe au point idéal —
                complet en fonctionnalités et véritablement gratuit.
              </p>
              <p>
                Contrairement aux modèles de tableur, Invoala gère
                automatiquement la mise en forme, le calcul des taxes et
                la génération de PDF. Contrairement aux outils payants
                comme FreshBooks ou QuickBooks, il n'y a ni abonnement, ni
                frais par facture, ni restriction de fonctionnalités.
              </p>
              <p>
                Vous obtenez des factures professionnelles, la gestion des
                clients, le suivi des paiements, la rédaction par IA et la
                prise en charge de 154 devises — sans jamais entrer de
                carte bancaire.
              </p>
            </div>
          </section>

          {/* CTA */}
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 text-center">
            <h2 className="text-[24px] font-bold tracking-tight">
              Prêt à simplifier votre facturation ?
            </h2>
            <p className="mt-2 text-[16px] text-[#6b7280]">
              Créez votre première facture professionnelle en moins de
              deux minutes. Aucune inscription requise.
            </p>
            <Link
              href="/#generate"
              className="mt-6 inline-block rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0f3d22]"
            >
              Créer une Facture
            </Link>
          </section>

          {/* Related links */}
          <section className="mb-20 border-t border-[#e5e7eb] pt-8">
            <h3 className="text-[16px] font-semibold">Pages associées</h3>
            <ul className="mt-3 space-y-2 text-[15px]">
              <li>
                <Link href="/online-invoicing" className="text-[#166534] hover:underline">
                  Facturation en Ligne
                </Link>
              </li>
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
                <Link href="/invoice-maker" className="text-[#166534] hover:underline">
                  Créateur de Factures
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
          <section className="mb-20">
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
