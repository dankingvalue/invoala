/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { hreflangAlternates, localizedPath } from "@/lib/i18n";
import { SetHtmlLang } from "@/components/SetHtmlLang";
import { Reveal } from "@/components/Reveal";
import { LazyInvoiceGenerator } from "@/components/LazyInvoiceGenerator";
import { TrustStrip } from "@/components/TrustStrip";
import { CURRENCIES } from "@/lib/invoice";
import { getFlags } from "@/lib/flags.server";
import { ProPricing } from "@/components/ProPricing";
import { ProductShowcase } from "@/components/ProductShowcase";
import { getCurrentUser } from "@/lib/server-auth";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Invoala — Générateur de Factures Gratuit pour Freelances",
    description:
      "Créez des factures professionnelles en ligne gratuitement. Ajoutez des articles, la taxe et votre logo, puis téléchargez un PDF soigné en quelques secondes. Sans inscription. Sans filigrane.",
    path: "/fr/",
    keywords: [
      "générateur de factures gratuit",
      "créateur de factures",
      "modèle de facture",
      "facture freelance",
      "facture en pdf",
      "facturation en ligne",
    ],
    hreflang: hreflangAlternates("/"),
    ogLocale: "fr_FR",
  });
}

const faqs = [
  {
    q: "Invoala est-il vraiment gratuit ?",
    a: "Oui. Créez, prévisualisez et téléchargez des factures illimitées gratuitement — sans essai, sans mur payant, sans filigrane sur vos PDF.",
  },
  {
    q: "Dois-je créer un compte ?",
    a: "Non. Aucune inscription ni e-mail requis. Ouvrez la page, remplissez vos informations et téléchargez votre facture.",
  },
  {
    q: "Où mes données sont-elles stockées ?",
    a: "Tout ce que vous saisissez est enregistré uniquement localement dans votre navigateur. Rien n'est envoyé sur un serveur, donc les informations de votre entreprise restent privées.",
  },
  {
    q: "Qu'est-ce que j'obtiens en téléchargeant ?",
    a: "Un PDF A4 propre et professionnel avec votre logo, vos articles, le détail des taxes et des notes de paiement — prêt à envoyer par e-mail à n'importe quel client.",
  },
  {
    q: "Puis-je aussi l'utiliser pour des devis ou des reçus ?",
    a: "Absolument. Changez les dates et les descriptions d'articles pour envoyer des devis avant un projet, ou des reçus après paiement.",
  },
  {
    q: "Quelles devises sont prises en charge ?",
    a: "154 devises mondiales dont USD, EUR, GBP, JPY, CAD, AUD et plus. La facture formate automatiquement le symbole et les décimales.",
  },
  {
    q: "Puis-je ajouter mon propre logo ?",
    a: "Oui. Téléchargez votre logo et il apparaîtra en haut de chaque facture. Les utilisateurs gratuits obtiennent un PDF sans filigrane.",
  },
  {
    q: "Calcule-t-il les taxes automatiquement ?",
    a: "Oui. Saisissez votre taux de taxe (TVA, GST, taxe de vente) et le total se met à jour en direct au fur et à mesure de votre saisie.",
  },
  {
    q: "Puis-je enregistrer des clients pour les réutiliser ?",
    a: "Oui. Enregistrez les coordonnées du client une fois et sélectionnez-les dans un menu déroulant sur vos futures factures. Toutes les données restent dans votre navigateur.",
  },
  {
    q: "Quel format de fichier exporte-t-il ?",
    a: "PDF — format A4 prêt à imprimer qui a la même apparence sur tous les appareils et s'imprime parfaitement sur toute imprimante.",
  },
  {
    q: "Y a-t-il une limite au nombre de factures que je peux créer ?",
    a: "Aucune limite. Créez-en autant que vous voulez, pour toujours. Il n'y a pas de plafond quotidien ou mensuel.",
  },
  {
    q: "En quoi est-ce différent d'Excel ou de Google Sheets ?",
    a: "Invoala est conçu spécifiquement pour la facturation. Vous obtenez des totaux en direct, un calcul automatique des taxes, une mise en forme professionnelle et un téléchargement PDF — le tout en une seule étape. Pas de formules, pas de modèles à configurer.",
  },
  {
    q: "Les freelances peuvent-ils l'utiliser ?",
    a: "Absolument. Invoala est conçu pour les freelances, consultants et indépendants qui veulent des factures professionnelles sans payer pour un logiciel.",
  },
  {
    q: "Prenez-vous en charge les factures récurrentes ?",
    a: "Vous pouvez enregistrer vos informations et celles de vos clients pour une réutilisation rapide. La planification complète des factures récurrentes est disponible dans le forfait Pro.",
  },
];

const features = [
  {
    title: "Des PDF soignés",
    copy: "Voilà — prêts pour le client dès le téléchargement. Des PDF A4 impeccables qui donnent au travail en solo l'allure d'une agence.",
    glyph: (
      <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm7 1.5V9h4.5M9 13h6m-6 4h6" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    ),
  },
  {
    title: "Prêt en quelques secondes",
    copy: "Sans compte, sans mur payant, sans attente. Remplissez, téléchargez, terminé — vos informations restent enregistrées sur votre propre appareil.",
    glyph: (
      <path d="M13 2 4.5 13.5H11L9.5 22 19 10h-6.5L13 2Z" strokeWidth="1.5" strokeLinejoin="round" />
    ),
  },
  {
    title: "Toute devise",
    copy: `Facturez n'importe qui, n'importe où — ${CURRENCIES.length} devises mondiales, calcul automatique des taxes, formatage correct par défaut.`,
    glyph: (
      <path d="M12 3v18M16.5 7.5c-.8-1.2-2.4-2-4.5-2-2.5 0-4 1.3-4 3.1 0 4.4 9 2.3 9 6.8 0 1.8-1.7 3.1-4.5 3.1-2.3 0-4-.9-4.8-2.2" strokeWidth="1.5" strokeLinecap="round" />
    ),
  },
  {
    title: "Décrivez-le simplement",
    copy: "Décrivez le travail en mots simples — l'IA le transforme en une facture terminée, avec articles et totaux inclus.",
    glyph: (
      <path d="M12 2l2.2 6.6L21 11l-6.8 2.4L12 20l-2.2-6.6L3 11l6.8-2.4L12 2Z" strokeWidth="1.5" strokeLinejoin="round" />
    ),
  },
  {
    title: "Tout au même endroit",
    copy: "Créez un compte gratuit et Invoala mémorise vos clients, suit qui a payé et qui est en retard, et vous prévient dès qu'un client ouvre une facture.",
    glyph: (
      <path d="M4 4h7v7H4V4Zm9 0h7v4h-7V4Zm0 7h7v9h-7v-9ZM4 14h7v6H4v-6Z" strokeWidth="1.5" strokeLinejoin="round" />
    ),
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

export const dynamic = "force-dynamic";

export default async function HomeFr() {
  const { flags, announcement } = await getFlags();
  const user = await getCurrentUser();

  if (flags.maintenanceMode) {
    return (
      <div id="top">
        <SetHtmlLang lang="fr" />
        <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <h1 className="text-[40px] font-semibold tracking-tight md:text-[56px]">
            Nous revenons très vite.
          </h1>
          <p className="mt-4 max-w-[420px] text-[17px] leading-relaxed text-subtle">
            Invoala reçoit une mise à jour rapide. Rechargez dans
            quelques minutes — vos factures enregistrées sont en
            sécurité sur votre appareil.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div id="top" className="scroll-mt-20">
      <SetHtmlLang lang="fr" />
      <FaqJsonLd />

      <header className="fixed inset-x-0 top-0 z-50 h-[72px] border-b border-[#e5e7eb] bg-white">
        <nav className="mx-auto flex h-full max-w-[1400px] items-center px-5 sm:px-8">
          <Link href="/fr" className="flex shrink-0 items-center gap-2.5">
            <svg width="28" height="28" viewBox="0 0 64 64" aria-hidden="true">
              <rect width="64" height="64" rx="14.5" fill="#166534" />
              <path d="M35.5 10 19 37h9.5l-3 17L43 27h-9.5l2-17z" fill="#fff" />
            </svg>
            <span className="text-[17px] font-bold tracking-tight text-ink">Invoala</span>
          </Link>
          <nav className="hidden flex-1 items-center justify-center gap-8 text-[14px] font-medium md:flex">
            <a href="#features" className="text-subtle transition-colors hover:text-ink">Fonctionnalités</a>
            <a href="#how" className="text-subtle transition-colors hover:text-ink">Comment ça marche</a>
            <Link href={localizedPath("/pricing", "fr")} className="text-subtle transition-colors hover:text-ink">Tarifs</Link>
            <a href="#faq" className="text-subtle transition-colors hover:text-ink">Questions</a>
          </nav>
          <div className="ml-auto flex shrink-0 items-center gap-3 md:ml-0">
            {user ? (
              <Link href="/dashboard?tab=general" className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-[14px] font-semibold text-ink transition hover:border-[#166534] hover:text-[#166534]">
                Tableau de bord
              </Link>
            ) : (
              <Link href="/login" className="text-[14px] font-medium text-subtle hover:text-ink">
                Se connecter
              </Link>
            )}
            <a href="#generate" className="rounded-lg bg-[#14532d] px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-[#0f3d22]">
              Créer une facture
            </a>
          </div>
        </nav>
      </header>

      <main>
      {announcement ? (
        <div className="mt-20 px-4 pt-4">
          <p className="rounded-lg bg-[#dcfce7] py-2.5 text-center text-[14px] font-medium text-[#166534]">
            {announcement}
          </p>
        </div>
      ) : null}

      {/* Hero */}
      <section className="px-6 pb-20 pt-36 text-center md:pb-28 md:pt-44">
        <Reveal>
          <p className="text-[13px] font-semibold uppercase tracking-wider text-[#166534]">
            Rejoignez plus de 500 freelances et agences qui facturent déjà avec Invoala
          </p>
        </Reveal>
        <Reveal>
          <h1 className="mx-auto mt-3 max-w-[900px] text-[48px] font-extrabold leading-[1.05] tracking-tight md:text-[80px]">
            Des factures qui ont l'air
            <span className="block text-[#166534]">professionnelles.</span>
          </h1>
        </Reveal>
        <Reveal delay={100}>
          <p className="mx-auto mt-6 max-w-[640px] text-[19px] font-medium leading-relaxed text-subtle md:text-[21px]">
            Voilà — désormais, faire des factures est simple. Créez une
            belle facture et téléchargez un PDF soigné en quelques
            secondes.
          </p>
        </Reveal>
        <Reveal delay={200}>
          <div className="mt-9 flex items-center justify-center gap-4">
            <a
              href="#generate"
              className="rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white shadow-sm transition hover:bg-[#0f3d22] active:scale-[0.99]"
            >
              Créez votre facture
            </a>
            <a href="#how" className="text-[16px] font-medium text-[#166534] transition-opacity hover:opacity-70">
              Comment ça marche &rsaquo;
            </a>
          </div>
        </Reveal>
        <Reveal delay={300}>
          <p className="mt-6 text-[13px] text-subtle">
            Gratuit pour toujours &nbsp;·&nbsp; Sans inscription &nbsp;·&nbsp; Aucune carte bancaire requise
          </p>
        </Reveal>
      </section>

      {/* Social proof */}
      {flags.trustpilotStrip ? <TrustStrip /> : null}

      {/* Generator */}
      <section className="bg-[#f3f4f6] px-6 py-16 md:py-24">
        <div className="mx-auto max-w-[1200px]">
          <Reveal>
            <div className="mb-12 text-center">
              <h2 className="text-[36px] font-extrabold tracking-tight md:text-[52px]">
                Commencez maintenant. Ça prend deux minutes.
              </h2>
              <p className="mt-3 text-[17px] font-medium text-subtle">
                Remplissez une fois — nous enregistrons vos informations pour la prochaine fois.{flags.aiComposer ? " Ou décrivez simplement le travail et laissez l'IA le rédiger." : ""}
              </p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <LazyInvoiceGenerator />
          </Reveal>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-16 px-6 py-16 md:py-28">
        <div className="mx-auto max-w-[1024px]">
          <Reveal>
            <h2 className="mx-auto max-w-[720px] text-center text-[36px] font-extrabold tracking-tight md:text-[52px]">
              Tout ce dont vous avez besoin.
              <span className="block text-subtle">Rien de plus.</span>
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 100}>
                <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#f0fdf4]">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#166534"
                      aria-hidden="true"
                    >
                      {f.glyph}
                    </svg>
                  </div>
                  <h3 className="text-[18px] font-bold tracking-tight">{f.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-subtle">{f.copy}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Product showcase — a closer look inside */}
      <ProductShowcase />

      {/* How it works */}
      <section id="how" className="scroll-mt-16 bg-[#f3f4f6] px-6 py-16 md:py-28">
        <div className="mx-auto max-w-[1024px]">
          <Reveal>
            <h2 className="max-w-[680px] text-[36px] font-extrabold tracking-tight md:text-[52px]">
              Trois étapes. Terminé.
            </h2>
            <p className="mt-3 max-w-[520px] text-[17px] font-medium text-subtle">
              Vous gérez le travail important. Invoala gère les tâches fastidieuses.
            </p>
          </Reveal>
          <div className="mt-14 grid gap-12 sm:grid-cols-3">
            {[
              {
                n: "01",
                title: "Ajoutez vos informations",
                copy: "Votre nom, logo et informations client. Nous nous en souvenons pour votre prochaine visite.",
              },
              {
                n: "02",
                title: "Décrivez le travail",
                copy: "Articles, quantités, tarifs, taxe — les totaux se mettent à jour en direct au fur et à mesure de votre saisie.",
              },
              {
                n: "03",
                title: "Téléchargez et envoyez",
                copy: "Un clic vous donne un PDF A4 net. Joignez-le, envoyez-le, soyez payé.",
              },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 100}>
                <div>
                  <p className="text-[56px] font-extrabold leading-none tracking-tight text-[#166534]/60 md:text-[64px]">
                    {s.n}
                  </p>
                  <h3 className="mt-4 text-[18px] font-bold tracking-tight">{s.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-subtle">{s.copy}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={200}>
            <div className="mt-16 text-center">
              <a
                href="#generate"
                className="rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white shadow-sm transition hover:bg-[#0f3d22] active:scale-[0.99]"
              >
                Créez votre facture
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Pro pricing */}
      {flags.proTeaser ? <ProPricing /> : null}

      {/* SEO content — What makes a good invoice */}
      <section className="px-6 py-16 md:py-28">
        <div className="mx-auto max-w-[1024px]">
          <Reveal>
            <h2 className="text-center text-[36px] font-extrabold tracking-tight md:text-[52px]">
              Qu'est-ce qui fait une bonne facture ?
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Des articles clairs",
                desc: "Chaque service ou produit est listé séparément avec une description, une quantité et un prix. Pas de forfaits vagues.",
              },
              {
                title: "Une mise en page professionnelle",
                desc: "Typographie propre, espacement correct et votre logo. Cela signale crédibilité et souci du détail.",
              },
              {
                title: "Des conditions de paiement claires",
                desc: "Net 15 ou Net 30 — indiquez quand le paiement est dû. Incluez votre méthode préférée et les éventuels frais de retard.",
              },
              {
                title: "La bonne taxe",
                desc: "Appliquez le taux correct pour votre juridiction. Invoala calcule le total automatiquement.",
              },
              {
                title: "Un numéro de facture unique",
                desc: "Des identifiants séquentiels (INV-001, INV-002) vous aident, vous et votre client, à suivre les paiements sans confusion.",
              },
              {
                title: "Vos coordonnées",
                desc: "Votre nom, e-mail et adresse — pour que le client sache exactement qui payer et comment vous contacter.",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 80}>
                <div>
                  <h3 className="text-[17px] font-bold tracking-tight">{item.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[#6b7280]">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={300}>
            <div className="mt-14 text-center">
              <a
                href="#generate"
                className="rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white shadow-sm transition hover:bg-[#0f3d22] active:scale-[0.99]"
              >
                Créez une meilleure facture
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Internal links — guides */}
      <section className="bg-[#f3f4f6] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-[1024px]">
          <Reveal>
            <h2 className="text-center text-[36px] font-extrabold tracking-tight md:text-[44px]">
              En savoir plus
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <Reveal>
              <Link
                href="/how-to-create-invoice"
                className="block rounded-xl border border-[#e5e7eb] bg-white p-6 transition hover:shadow-md"
              >
                <h3 className="text-[18px] font-bold tracking-tight text-[#111827]">
                  Comment Créer une Facture
                </h3>
                <p className="mt-2 text-[15px] text-[#6b7280]">
                  Guide étape par étape de la page blanche jusqu'au
                  client payé. Couvre les articles, la taxe, les
                  conditions de paiement et l'envoi.
                </p>
                <span className="mt-3 inline-block text-[14px] font-semibold text-[#166534]">
                  Lire le guide &rsaquo;
                </span>
              </Link>
            </Reveal>
            <Reveal delay={100}>
              <Link
                href={localizedPath("/invoice-template", "fr")}
                className="block rounded-xl border border-[#e5e7eb] bg-white p-6 transition hover:shadow-md"
              >
                <h3 className="text-[18px] font-bold tracking-tight text-[#111827]">
                  Modèles de Facture Gratuits
                </h3>
                <p className="mt-2 text-[15px] text-[#6b7280]">
                  Modèles spécifiques par secteur pour freelances,
                  designers, photographes, entrepreneurs et petites
                  entreprises.
                </p>
                <span className="mt-3 inline-block text-[14px] font-semibold text-[#166534]">
                  Voir les modèles &rsaquo;
                </span>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-16 px-6 py-16 md:py-28">
        <div className="mx-auto max-w-[720px]">
          <Reveal>
            <h2 className="text-center text-[36px] font-extrabold tracking-tight md:text-[52px]">
              Questions. Réponses.
            </h2>
          </Reveal>
          <div className="mt-12 border-t border-[#e5e7eb]">
            {faqs.map((f, i) => (
              <Reveal key={f.q} delay={i * 60}>
                <details className="faq group border-b border-[#e5e7eb]">
                  <summary className="flex items-center justify-between gap-4 py-5 text-left">
                    <span className="text-[17px] font-semibold tracking-tight">{f.q}</span>
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
                      className="chev shrink-0"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </summary>
                  <p className="-mt-1 pb-6 pr-8 text-[15px] leading-relaxed text-subtle">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e5e7eb] bg-[#f3f4f6] px-6 py-10">
        <div className="mx-auto max-w-[1024px]">
          <div className="flex flex-col items-center justify-between gap-4 text-[13px] text-subtle md:flex-row">
            <div className="flex items-center gap-2 font-bold text-ink">
              <svg width="18" height="18" viewBox="0 0 64 64" aria-hidden="true">
                <rect width="64" height="64" rx="14.5" fill="#166534" />
                <path d="M35.5 10 19 37h9.5l-3 17L43 27h-9.5l2-17z" fill="#fff" />
              </svg>
              Invoala
            </div>
            <nav className="flex items-center gap-6">
              <a href="#features" className="transition-colors hover:text-ink">Fonctionnalités</a>
              <a href="#faq" className="transition-colors hover:text-ink">Questions</a>
              <Link href="/how-to-create-invoice" className="transition-colors hover:text-ink">Guide</Link>
              <Link href={localizedPath("/invoice-template", "fr")} className="transition-colors hover:text-ink">Modèles</Link>
              <Link href="/roadmap" className="transition-colors hover:text-ink">Feuille de route</Link>
              <Link href="/privacy" className="transition-colors hover:text-ink">Confidentialité</Link>
              <Link href="/terms" className="transition-colors hover:text-ink">Conditions</Link>
              <a href="mailto:hello@invoala.com" className="transition-colors hover:text-ink">
                Contact
              </a>
            </nav>
            <p>&copy; 2026 Invoala. Tous droits réservés.</p>
          </div>
          <p className="mt-6 border-t border-[#e5e7eb] pt-5 text-[11px] leading-relaxed text-subtle">
            Invoala est un générateur de factures en ligne gratuit pour
            les freelances et les petites entreprises. Créez des
            factures professionnelles avec votre propre logo, des
            articles, la taxe et plusieurs devises — puis
            téléchargez-les en fichiers PDF prêts à imprimer. Aucun
            compte requis, et vos données ne quittent jamais votre
            navigateur.
          </p>
        </div>
        <div className="mx-auto max-w-[1024px] pt-5">
          <TrustStrip />
        </div>
      </footer>
    </div>
  );
}
