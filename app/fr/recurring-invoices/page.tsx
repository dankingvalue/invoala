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
    title: "Factures Récurrentes — Automatisez la Facturation Répétitive",
    description:
      "Configurez des factures récurrentes pour automatiser la facturation répétitive. Gagnez du temps, ne manquez jamais un cycle de facturation et soyez payé à temps avec la facturation récurrente gratuite d'Invoala.",
    path: "/fr/recurring-invoices",
    keywords: [
      "factures récurrentes",
      "facturation récurrente",
      "factures automatiques",
      "facturation par abonnement",
      "modèle de facture récurrente",
    ],
    ogDescription:
      "Configurez des factures récurrentes pour automatiser la facturation répétitive. Gagnez du temps, ne manquez jamais un cycle de facturation et soyez payé à temps.",
    hreflang: hreflangAlternates("/recurring-invoices"),
    ogLocale: "fr_FR",
  });
}

const faqs = [
  {
    q: "Que sont les factures récurrentes ?",
    a: "Les factures récurrentes sont des factures générées automatiquement et envoyées selon un calendrier régulier — hebdomadaire, mensuel, trimestriel ou annuel. Au lieu de créer manuellement la même facture chaque période, vous la configurez une fois et le système s'occupe du reste.",
  },
  {
    q: "Comment fonctionnent les factures récurrentes ?",
    a: "Vous définissez la fréquence de facturation (hebdomadaire, mensuelle, trimestrielle ou annuelle), les coordonnées du client, les articles et le montant. Le système crée et envoie ensuite la facture automatiquement à chaque date programmée, sans intervention manuelle.",
  },
  {
    q: "Quels types d'entreprises utilisent les factures récurrentes ?",
    a: "Toute entreprise avec une facturation répétée en bénéficie — agences sous contrat, entreprises SaaS avec abonnements, consultants avec contrats continus, prestataires de maintenance, espaces de coworking et gestionnaires immobiliers comptent tous sur les factures récurrentes.",
  },
  {
    q: "Puis-je modifier une facture récurrente avant son envoi ?",
    a: "Oui. Vous pouvez examiner et modifier une facture récurrente avant chaque cycle. Si vous devez changer le montant, ajouter un nouvel article ou suspendre temporairement le calendrier, vous avez un contrôle total.",
  },
  {
    q: "Que se passe-t-il si le moyen de paiement d'un client expire ?",
    a: "La facturation récurrente envoie la facture comme prévu, quel que soit le moyen de paiement. Vous verrez le statut de la facture passer en retard et pourrez relancer le client. Si vous utilisez aussi les paiements récurrents, vous pouvez configurer des alertes pour les paiements échoués.",
  },
  {
    q: "Les factures récurrentes sont-elles différentes des abonnements ?",
    a: "Elles sont étroitement liées. Les abonnements incluent généralement la collecte automatique des paiements. Les factures récurrentes concernent la génération et l'envoi automatiques de la facture. Invoala se concentre sur la facturation : vous créez la facture et décidez comment percevoir le paiement.",
  },
  {
    q: "Puis-je configurer des factures récurrentes gratuitement avec Invoala ?",
    a: "Oui. Le forfait gratuit d'Invoala inclut la planification de factures récurrentes. Configurez votre client, définissez la fréquence et les articles, et laissez Invoala s'occuper du reste — aucune carte bancaire requise.",
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

export default function RecurringInvoicesPageFr() {
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
              Factures Récurrentes — Automatisez la Facturation Répétitive
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              Arrêtez d'envoyer la même facture chaque mois. Configurez
              des factures récurrentes une fois et laissez Invoala
              s'occuper du reste — automatiquement, à temps, à chaque
              fois.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                href="/#generate"
                className="rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0f3d22]"
              >
                Configurer des factures récurrentes
              </Link>
              <Link
                href={localizedPath("/invoice-generator", "fr")}
                className="text-[16px] font-medium text-[#166534] hover:underline"
              >
                Voir comment ça marche &rsaquo;
              </Link>
            </div>
          </section>

          {/* What are recurring invoices */}
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Que sont les factures récurrentes ?
            </h2>
            <div className="mt-6 space-y-4 text-[16px] leading-relaxed text-[#374151]">
              <p>
                Les factures récurrentes sont des factures générées et
                envoyées automatiquement aux clients selon un calendrier
                défini. Plutôt que de créer manuellement la même facture
                chaque semaine, mois ou trimestre, vous la configurez une
                fois — coordonnées du client, articles, montants et
                fréquence — et le système s'occupe du reste.
              </p>
              <p>
                Voyez cela comme un abonnement pour votre facturation.
                Que vous facturiez 500 € par mois pour des prestations
                récurrentes ou 200 € par trimestre pour de la
                maintenance, les factures récurrentes garantissent que
                vous n'oubliez jamais d'envoyer une facture ni de
                manquer un cycle de paiement.
              </p>
              <p>
                Invoala rend cela sans effort. Créez une facture,
                définissez la fréquence, et votre client la reçoit à
                temps — sans travail manuel de votre part.
              </p>
            </div>
          </section>

          {/* Why use them */}
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 md:p-12">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Pourquoi utiliser des factures récurrentes ?
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              {[
                {
                  title: "Gagnez des heures chaque mois",
                  desc: "La facturation manuelle pour des clients récurrents est fastidieuse. Les factures récurrentes éliminent la répétition — configurez une fois et récupérez votre temps.",
                },
                {
                  title: "Ne manquez plus jamais un cycle de facturation",
                  desc: "La vie s'accélère. Les factures récurrentes garantissent que vous facturez à temps, à chaque fois, pour que votre trésorerie ne souffre pas de factures oubliées.",
                },
                {
                  title: "Soyez payé plus vite",
                  desc: "Lorsque les factures partent automatiquement, les clients les reçoivent plus tôt. Une livraison plus rapide signifie un paiement plus rapide et une trésorerie plus saine.",
                },
                {
                  title: "Réduisez les erreurs humaines",
                  desc: "Fini le copier-coller d'articles ou les erreurs de calcul de totaux. Le système génère une facture identique avec des calculs précis à chaque cycle.",
                },
                {
                  title: "Améliorez l'expérience client",
                  desc: "Les clients apprécient la constance. Lorsqu'ils savent exactement quand et comment ils seront facturés, cela renforce la confiance et le professionnalisme.",
                },
                {
                  title: "Développez votre activité",
                  desc: "À mesure que votre liste de clients grandit, la facturation récurrente évolue avec vous. Gérez 10 ou 1 000 clients récurrents sans charge administrative supplémentaire.",
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

          {/* How they work */}
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Comment fonctionnent les factures récurrentes
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-[#374151]">
              Les factures récurrentes suivent un calendrier simple.
              Vous choisissez la fréquence de facturation et Invoala
              gère la génération :
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  freq: "Hebdomadaire",
                  desc: "Idéal pour les services continus facturés chaque semaine — ménage, maintenance ou conseil à l'heure avec un plafond hebdomadaire fixe.",
                },
                {
                  freq: "Mensuel",
                  desc: "Le cycle le plus courant. Parfait pour les honoraires forfaitaires, les abonnements, les loyers et les contrats de service continus.",
                },
                {
                  freq: "Trimestriel",
                  desc: "Idéal pour les services saisonniers, le conseil trimestriel, les contrats de maintenance et les entreprises préférant moins de factures mais plus importantes.",
                },
                {
                  freq: "Annuel",
                  desc: "Idéal pour les abonnements annuels, les honoraires forfaitaires annuels, les primes d'assurance et les renouvellements de licence facturés une fois par an.",
                },
              ].map((item) => (
                <div
                  key={item.freq}
                  className="rounded-xl border border-[#e5e7eb] bg-white p-6"
                >
                  <h3 className="text-[17px] font-bold tracking-tight text-[#111827]">
                    {item.freq}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-[#6b7280]">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Features */}
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Fonctionnalités des factures récurrentes
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Calendrier flexible",
                  desc: "Choisissez une facturation hebdomadaire, mensuelle, trimestrielle ou annuelle — ou définissez un intervalle personnalisé adapté à votre activité.",
                },
                {
                  title: "Gestion des clients",
                  desc: "Enregistrez les coordonnées du client une fois. Chaque facture récurrente utilise la même fiche client — rien à ressaisir.",
                },
                {
                  title: "Modifiable avant l'envoi",
                  desc: "Examinez et ajustez chaque facture avant qu'elle ne parte. Ajoutez de nouveaux articles, modifiez les montants, ou sautez un cycle.",
                },
                {
                  title: "Génération PDF automatique",
                  desc: "Chaque cycle produit un PDF professionnel prêt à imprimer, cohérent avec votre image de marque.",
                },
                {
                  title: "Suivi du statut de paiement",
                  desc: "Visualisez en un coup d'œil quelles factures récurrentes sont payées, en attente ou en retard chez tous vos clients.",
                },
                {
                  title: "Plusieurs devises",
                  desc: "Facturez vos clients internationaux dans leur devise. Invoala prend en charge 154 devises avec le bon formatage.",
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

          {/* Who benefits */}
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 md:p-12">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Qui bénéficie des factures récurrentes ?
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
              {[
                {
                  title: "Agences sous contrat",
                  desc: "Agences de marketing, de design et de développement qui facturent aux clients des honoraires mensuels fixes pour un travail continu. Les factures récurrentes éliminent l'étape manuelle répétitive.",
                },
                {
                  title: "Entreprises SaaS et par abonnement",
                  desc: "Éditeurs de logiciels facturant mensuellement ou annuellement l'accès. Les factures récurrentes maintiennent le cycle de facturation sans équipe de facturation dédiée.",
                },
                {
                  title: "Consultants et coachs",
                  desc: "Consultants d'affaires, coachs de vie et conseillers avec des relations clients continues. Facturez mensuellement l'accès, les appels ou l'accompagnement stratégique.",
                },
                {
                  title: "Prestataires de maintenance et de services",
                  desc: "Paysagistes, agents d'entretien, techniciens CVC et gestionnaires immobiliers fournissant des services réguliers selon un calendrier fixe.",
                },
                {
                  title: "Espaces de coworking et locations",
                  desc: "Fournisseurs d'espaces de travail et gestionnaires immobiliers facturant mensuellement aux locataires des postes de travail, du stockage ou des frais d'utilisation.",
                },
                {
                  title: "Freelances avec des clients de longue date",
                  desc: "Freelances travaillant avec le même client mois après mois. Gagnez du temps en automatisant la facture qui ne change jamais.",
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

          {/* CTA */}
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 text-center">
            <h2 className="text-[24px] font-bold tracking-tight">
              Automatisez votre facturation dès aujourd'hui
            </h2>
            <p className="mt-2 text-[16px] text-[#6b7280]">
              Configurez votre première facture récurrente en moins de
              deux minutes. Gratuit, aucune inscription requise.
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
                <Link href="/invoice-payment-tracking" className="text-[#166534] hover:underline">
                  Suivi des Paiements de Factures
                </Link>
              </li>
              <li>
                <Link href="/invoice-reminders" className="text-[#166534] hover:underline">
                  Rappels de Facture
                </Link>
              </li>
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
