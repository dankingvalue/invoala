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
    title: "Facturation en Ligne — Créez et Envoyez des Factures depuis N'importe Où",
    description:
      "Créez et envoyez des factures professionnelles depuis n'importe quel appareil avec l'outil de facturation en ligne gratuit d'Invoala. Aucun logiciel à installer — ouvrez simplement votre navigateur et facturez.",
    path: "/fr/online-invoicing",
    keywords: [
      "facturation en ligne",
      "facture en ligne",
      "créer une facture en ligne",
      "envoyer une facture en ligne",
      "facturation en ligne gratuite",
    ],
    ogDescription:
      "Créez et envoyez des factures professionnelles depuis n'importe quel appareil avec l'outil de facturation en ligne gratuit d'Invoala. Aucun logiciel à installer.",
    hreflang: hreflangAlternates("/online-invoicing"),
    ogLocale: "fr_FR",
  });
}

const faqs = [
  {
    q: "Qu'est-ce que la facturation en ligne ?",
    a: "La facturation en ligne vous permet de créer et d'envoyer des factures via un navigateur web plutôt qu'un logiciel de bureau. Vous remplissez un formulaire, l'outil génère un PDF professionnel, et vous pouvez le télécharger ou l'envoyer directement par e-mail à votre client.",
  },
  {
    q: "La facturation en ligne est-elle sécurisée ?",
    a: "Oui. Invoala traite tout dans votre navigateur — vos données ne touchent jamais un serveur à moins que vous ne choisissiez de les enregistrer. Les informations de votre entreprise et de vos clients restent sur votre appareil.",
  },
  {
    q: "Puis-je utiliser la facturation en ligne sur mon téléphone ?",
    a: "Absolument. Invoala fonctionne sur tout appareil doté d'un navigateur web — téléphone, tablette ou ordinateur portable. L'interface s'adapte à la taille de votre écran pour que vous puissiez facturer de n'importe où.",
  },
  {
    q: "Dois-je installer quelque chose pour la facturation en ligne ?",
    a: "Non. La facturation en ligne fonctionne entièrement dans votre navigateur. Rien à télécharger, installer ou mettre à jour. Ouvrez simplement le site et commencez à créer des factures.",
  },
  {
    q: "À quelle vitesse puis-je envoyer une facture en ligne ?",
    a: "La plupart des utilisateurs créent et téléchargent une facture en moins de deux minutes. Si vous avez déjà enregistré les coordonnées de votre client, c'est encore plus rapide — sélectionnez simplement le client et ajoutez vos articles.",
  },
  {
    q: "Puis-je suivre les factures en ligne après leur envoi ?",
    a: "Oui. Invoala vous permet de marquer les factures comme payées, en attente ou en retard afin que vous connaissiez toujours votre statut de paiement. Vous pouvez voir toutes vos factures et leur statut en un seul endroit.",
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

export default function OnlineInvoicingPageFr() {
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
              Facturation en Ligne — Créez et Envoyez des Factures depuis N'importe Où
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              Votre ordinateur portable, votre téléphone, votre
              tablette — créez des factures professionnelles sur tout
              appareil connecté à internet. Aucun logiciel à installer,
              aucun fichier à synchroniser.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                href="/#generate"
                className="rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0f3d22]"
              >
                Commencer à facturer maintenant
              </Link>
              <Link
                href={localizedPath("/invoice-generator", "fr")}
                className="text-[16px] font-medium text-[#166534] hover:underline"
              >
                Voir comment ça marche &rsaquo;
              </Link>
            </div>
          </section>

          {/* What is online invoicing */}
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Qu'est-ce que la facturation en ligne ?
            </h2>
            <div className="mt-6 space-y-4 text-[16px] leading-relaxed text-[#374151]">
              <p>
                La facturation en ligne consiste à créer, envoyer et
                gérer des factures via un navigateur web. Plutôt que de
                dépendre d'un logiciel de bureau ou de modèles de
                tableur, vous utilisez un outil en ligne dédié qui gère
                la mise en forme, les calculs et la génération de PDF
                pour vous.
              </p>
              <p>
                Le plus grand avantage est l'accessibilité. Vous pouvez
                créer une facture depuis n'importe quel appareil — votre
                ordinateur de bureau, votre portable à la maison, ou
                votre téléphone sur un chantier. Rien à installer, rien
                à mettre à jour, rien à synchroniser entre appareils.
              </p>
              <p>
                Invoala va plus loin en conservant toutes vos données
                dans votre navigateur. Rien n'est envoyé sur un serveur
                sauf si vous choisissez de l'enregistrer sur un compte,
                donc les informations de votre entreprise restent
                privées.
              </p>
            </div>
          </section>

          {/* Benefits */}
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 md:p-12">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Avantages de la facturation en ligne avec Invoala
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              {[
                {
                  title: "Accès depuis n'importe où",
                  desc: "Créez des factures depuis tout appareil doté d'un navigateur. Travaillez depuis chez vous, le bureau ou chez un client — votre facturation vous suit.",
                },
                {
                  title: "Aucun logiciel à installer",
                  desc: "Évitez les téléchargements, mises à jour et problèmes de compatibilité. La facturation en ligne fonctionne entièrement dans votre navigateur.",
                },
                {
                  title: "Livraison instantanée",
                  desc: "Téléchargez un PDF et envoyez-le par e-mail à votre client en quelques secondes. Sans impression, sans numérisation, sans délai postal.",
                },
                {
                  title: "Toujours à jour",
                  desc: "Vous utilisez toujours la dernière version. Pas de notes de mise à jour, pas d'invites de mise à jour, pas de retard de fonctionnalités.",
                },
                {
                  title: "Fonctionne sur tout appareil",
                  desc: "Le design réactif garantit une expérience de facturation fluide sur téléphones, tablettes et ordinateurs.",
                },
                {
                  title: "Aucune perte de données",
                  desc: "Les données de votre facture sont automatiquement enregistrées dans le stockage local de votre navigateur. Fermez l'onglet, revenez plus tard — elles sont toujours là.",
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

          {/* How it works */}
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Comment fonctionne la facturation en ligne
            </h2>
            <div className="mt-8 grid gap-12 sm:grid-cols-3">
              {[
                {
                  n: "01",
                  title: "Ouvrez Invoala",
                  desc: "Accédez au générateur de factures dans votre navigateur. Aucune inscription nécessaire — vous êtes prêt immédiatement.",
                },
                {
                  n: "02",
                  title: "Remplissez les informations",
                  desc: "Ajoutez les informations de votre entreprise, les coordonnées du client, les articles et le taux de taxe. Le formulaire enregistre vos informations pour la prochaine fois.",
                },
                {
                  n: "03",
                  title: "Téléchargez et envoyez",
                  desc: "Cliquez sur télécharger pour obtenir un PDF professionnel. Joignez-le à un e-mail, envoyez-le via Invoala, ou partagez un lien.",
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

          {/* Security */}
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 md:p-12">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              La facturation en ligne est-elle sécurisée ?
            </h2>
            <div className="mt-6 space-y-4 text-[16px] leading-relaxed text-[#374151]">
              <p>
                La sécurité est une préoccupation majeure lors du
                traitement des données d'entreprise et de clients en
                ligne. Invoala y répond en traitant tout localement dans
                votre navigateur. Lorsque vous saisissez les détails
                d'une facture, ils ne quittent jamais votre appareil.
              </p>
              <p>
                Vos données sont stockées dans le stockage local de
                votre navigateur — pas sur nos serveurs. Cela signifie
                que même si les serveurs d'Invoala étaient compromis,
                les informations de votre entreprise ne seraient pas en
                danger car elles n'ont jamais été envoyées.
              </p>
              <p>
                Si vous choisissez de créer un compte et d'enregistrer
                des factures dans le cloud, les données sont chiffrées
                en transit (HTTPS) et au repos. Vous gardez le contrôle
                de ce qui est stocké et de ce qui reste local.
              </p>
            </div>
          </section>

          {/* Features */}
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Fonctionnalités de la facturation en ligne
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "PDF professionnels",
                  desc: "Téléchargez des factures A4 propres et prêtes à imprimer avec votre logo, vos articles et le détail des taxes.",
                },
                {
                  title: "Rédaction assistée par IA",
                  desc: "Décrivez le travail en mots simples et l'IA crée une facture terminée avec articles et totaux.",
                },
                {
                  title: "154 devises",
                  desc: "Facturez des clients partout dans le monde avec les bons symboles de devise et un formatage décimal automatique.",
                },
                {
                  title: "Calculs de taxes",
                  desc: "Saisissez votre taux de TVA, GST ou taxe de vente et les totaux se mettent à jour en direct au fur et à mesure de votre saisie.",
                },
                {
                  title: "Gestion des clients",
                  desc: "Enregistrez les coordonnées des clients et sélectionnez-les dans un menu déroulant sur vos futures factures.",
                },
                {
                  title: "Suivi des paiements",
                  desc: "Marquez les factures comme payées, en attente ou en retard pour garder votre trésorerie visible.",
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
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 text-center">
            <h2 className="text-[24px] font-bold tracking-tight">
              Commencez à facturer en ligne — gratuit, dès aujourd'hui
            </h2>
            <p className="mt-2 text-[16px] text-[#6b7280]">
              Aucune inscription, aucune carte bancaire, aucune limite.
              Créez votre première facture dès maintenant.
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
                <Link href="/invoicing-software" className="text-[#166534] hover:underline">
                  Logiciel de Facturation
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
