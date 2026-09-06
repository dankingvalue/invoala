/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { hreflangAlternates, localizedPath } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Modèle de Facture Gratuit — Téléchargez et Personnalisez",
    description:
      "Modèles de factures gratuits pour les freelances et les petites entreprises. Personnalisez avec votre logo, vos articles et vos conditions de paiement. Téléchargez en PDF — sans inscription.",
    path: "/fr/invoice-template",
    keywords: [
      "modèle de facture",
      "modèle de facture gratuit",
      "modèle de facture PDF",
      "modèle de facture freelance",
      "modèle de facture pour entreprise",
      "modèle de facture personnalisé",
    ],
    ogDescription: "Modèles de factures gratuits pour les freelances. Personnalisez et téléchargez en PDF.",
    hreflang: hreflangAlternates("/invoice-template"),
    ogLocale: "fr_FR",
  });
}

const industries = [
  {
    name: "Freelances et Consultants",
    description:
      "Facturez le travail à l'heure, les projets fixes ou les honoraires forfaitaires. Incluez le périmètre du travail, les heures et le tarif.",
    items: ["Tarif horaire × heures", "Forfait projet fixe", "Kilométrage / frais"],
  },
  {
    name: "Designers et Développeurs Web",
    description:
      "Détaillez les phases de design, de développement et de révision. Listez chaque livrable séparément.",
    items: ["Design UI/UX", "Développement frontend", "Configuration de l'hébergement"],
  },
  {
    name: "Photographes et Vidéastes",
    description:
      "Facturez par séance, par projet ou par livrable. Incluez les droits d'utilisation le cas échéant.",
    items: ["Tarif de séance", "Montage / post-production", "Tirages / fichiers numériques"],
  },
  {
    name: "Entrepreneurs et Artisans",
    description:
      "Détaillez les matériaux, la main-d'œuvre et les permis. Ajoutez l'adresse du chantier et le calendrier.",
    items: ["Heures de main-d'œuvre", "Matériaux", "Permis / frais"],
  },
  {
    name: "Petites Entreprises",
    description:
      "Ventes de produits, forfaits de services ou abonnements récurrents. Incluez la taxe si nécessaire.",
    items: ["Produit / référence", "Forfait de service", "Abonnement récurrent"],
  },
];

export default function InvoiceTemplateFr() {
  return (
    <div id="top" className="min-h-screen scroll-mt-20">
      {/* Nav */}
      <nav className="fixed inset-x-0 top-0 z-40 border-b border-[#e5e7eb] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1024px] items-center justify-between px-6">
          <Link href={localizedPath("/", "fr")} className="flex items-center gap-2 font-bold text-[#111827]">
            <svg width="20" height="20" viewBox="0 0 64 64" aria-hidden="true">
              <rect width="64" height="64" rx="14.5" fill="#166534" />
              <path d="M35.5 10 19 37h9.5l-3 17L43 27h-9.5l2-17z" fill="#fff" />
            </svg>
            Invoala
          </Link>
          <Link href="/#generate" className="rounded-lg bg-[#14532d] px-5 py-2 text-[14px] font-semibold text-white transition hover:bg-[#0f3d22]">
            Créer une Facture
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pb-12 pt-32 md:pt-40">
        <div className="mx-auto max-w-[720px]">
          <p className="text-[14px] font-medium text-[#166534]">Modèles</p>
          <h1 className="mt-3 text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[56px]">
            Modèle de Facture Gratuit
          </h1>
          <p className="mt-4 text-[18px] leading-relaxed text-[#6b7280]">
            Choisissez un secteur, remplissez les champs, téléchargez un
            PDF soigné. Chaque modèle est gratuit — sans inscription,
            sans filigrane, sans limite.
          </p>
          <Link
            href="/#generate"
            className="mt-6 inline-block rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0f3d22]"
          >
            Commencer avec un modèle
          </Link>
        </div>
      </section>

      {/* Industries */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-[720px]">
          <h2 className="text-[28px] font-extrabold tracking-tight">
            Modèles par Secteur
          </h2>
          <p className="mt-2 text-[16px] text-[#6b7280]">
            Chaque facture suit la même structure — ajoutez les bons
            articles pour votre domaine.
          </p>

          <div className="mt-10 space-y-8">
            {industries.map((ind) => (
              <div
                key={ind.name}
                className="rounded-xl border border-[#e5e7eb] bg-[#fafafa] p-6"
              >
                <h3 className="text-[18px] font-bold tracking-tight">
                  {ind.name}
                </h3>
                <p className="mt-2 text-[15px] text-[#374151]">
                  {ind.description}
                </p>
                <ul className="mt-3 space-y-1">
                  {ind.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-[14px] text-[#6b7280]"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#166534"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What to include */}
      <section className="bg-[#f3f4f6] px-6 py-16">
        <div className="mx-auto max-w-[720px]">
          <h2 className="text-[28px] font-extrabold tracking-tight">
            Toute Bonne Facture Comprend
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {[
              {
                title: "Vos informations",
                desc: "Nom, adresse, e-mail, téléphone — pour que le client sache qui payer.",
              },
              {
                title: "Informations client",
                desc: "À qui vous facturez. Nom, e-mail et adresse.",
              },
              {
                title: "Numéro de facture",
                desc: "Un identifiant unique pour le suivi. INV-001, INV-002, etc.",
              },
              {
                title: "Date et échéance",
                desc: "Quand elle a été émise et quand le paiement est dû.",
              },
              {
                title: "Articles détaillés",
                desc: "Ce que vous avez fait, en quelle quantité et à quel tarif unitaire.",
              },
              {
                title: "Total et taxe",
                desc: "Sous-total, pourcentage de taxe et montant final dû.",
              },
              {
                title: "Conditions de paiement",
                desc: "Net 15, Net 30, ou à réception. Incluez les moyens de paiement.",
              },
              {
                title: "Notes",
                desc: "Message de remerciement, politique de pénalité de retard, ou instructions particulières.",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-3">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#166534] text-[12px] font-bold text-white">
                  ✓
                </span>
                <div>
                  <h3 className="text-[15px] font-semibold">{item.title}</h3>
                  <p className="mt-0.5 text-[14px] text-[#6b7280]">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-[720px] text-center">
          <h2 className="text-[28px] font-extrabold tracking-tight">
            Créez votre facture maintenant
          </h2>
          <p className="mt-2 text-[16px] text-[#6b7280]">
            Choisissez un modèle, remplissez vos informations,
            téléchargez le PDF.
          </p>
          <Link
            href="/#generate"
            className="mt-6 inline-block rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0f3d22]"
          >
            Créez votre facture
          </Link>
        </div>
      </section>

      {/* Internal links */}
      <section className="border-t border-[#e5e7eb] px-6 py-10">
        <div className="mx-auto max-w-[720px]">
          <h3 className="text-[16px] font-semibold">Continuez la lecture</h3>
          <ul className="mt-3 space-y-2 text-[15px]">
            <li>
              <Link href="/how-to-create-invoice" className="text-[#166534] hover:underline">
                Comment Créer une Facture — Guide Étape par Étape
              </Link>
            </li>
            <li>
              <Link href="/#features" className="text-[#166534] hover:underline">
                Fonctionnalités d'Invoala
              </Link>
            </li>
            <li>
              <Link href="/#faq" className="text-[#166534] hover:underline">
                Questions Fréquentes
              </Link>
            </li>
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e5e7eb] bg-[#f3f4f6] px-6 py-10">
        <div className="mx-auto max-w-[1024px] text-center text-[13px] text-[#6b7280]">
          <Link href="/" className="font-bold text-[#111827]">
            Invoala
          </Link>{" "}
          &copy; 2026. Générateur de factures gratuit pour les freelances.
        </div>
      </footer>
    </div>
  );
}
