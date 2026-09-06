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
    title: "Gerador de Orçamentos — Orçamentos de Trabalho Grátis",
    description:
      "Crie um orçamento de trabalho profissional em segundos. Delimite custos antes de começar, conquiste o projeto e depois converta o orçamento em fatura com um clique. Grátis, sem cadastro.",
    path: "/pt/estimate-generator",
    keywords: [
      "gerador de orçamentos",
      "criador de orçamentos grátis",
      "orçamento de trabalho",
      "estimativa de custos",
      "modelo de orçamento",
    ],
    ogDescription:
      "Crie um orçamento de trabalho profissional em segundos e converta-o em fatura quando o trabalho for aprovado. Grátis, sem cadastro.",
    hreflang: hreflangAlternates("/estimate-generator"),
    ogLocale: "pt_BR",
  });
}

const faqs = [
  {
    q: "Qual a diferença entre um orçamento e uma cotação?",
    a: "Ambos delimitam custos antes do início do trabalho. Um orçamento costuma ser um valor aproximado que pode mudar; uma cotação é um preço fixo que o cliente pode exigir que você cumpra. O modo orçamento da Invoala mostra um total estimado e uma data de validade.",
  },
  {
    q: "O que um orçamento de trabalho deve incluir?",
    a: "Os dados do seu negócio, os dados do cliente, uma descrição do trabalho como itens de linha, quantidades e valores, um total estimado e por quanto tempo o orçamento é válido.",
  },
  {
    q: "Posso transformar um orçamento em fatura?",
    a: "Sim. Quando o cliente aprovar, clique em \"Converter em fatura\" — os mesmos itens são transferidos e uma data de vencimento é definida automaticamente. Sem digitar tudo de novo.",
  },
  {
    q: "Orçamentos são juridicamente vinculantes?",
    a: "Orçamentos geralmente não são vinculantes, a menos que você indique o contrário. Uma cotação é tratada como uma oferta firme. Sempre anote um período de validade para que preços antigos não voltem a te assombrar.",
  },
  {
    q: "O gerador de orçamentos é gratuito?",
    a: "Sim — sem cadastro, sem marca d'água, sem limites. Baixe quantos PDFs de orçamento você precisar.",
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

export default async function EstimateGeneratorPagePt() {
  const user = await getCurrentUser();

  return (
    <>
      <SetHtmlLang lang="pt" />
      <FaqJsonLd />

      <nav className="fixed inset-x-0 top-0 z-40 border-b border-[#e5e7eb] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1024px] items-center justify-between px-6">
          <Link href={localizedPath("/", "pt")} className="flex items-center gap-2 font-bold text-[#111827]">
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
                Painel
              </Link>
            ) : null}
            <Link
              href="/#generate"
              className="rounded-lg bg-[#14532d] px-5 py-2 text-[14px] font-semibold text-white transition hover:bg-[#0f3d22]"
            >
              Criar Fatura
            </Link>
            <SeoNavMobile locale="pt" />
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-16">
        <div className="mx-auto max-w-[1200px] px-6">
          <section className="mb-12 text-center">
            <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[56px]">
              Gerador de Orçamentos
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              Precifique seu próximo trabalho antes de começá-lo. O
              gerador abaixo está no modo orçamento — delimite o trabalho,
              defina uma data de validade e converta-o em fatura quando o
              cliente disser sim.
            </p>
            <p className="mt-4 text-[14px] text-[#9ca3af]">
              Grátis para sempre &middot; Sem cadastro &middot; Sem marca d&apos;água
            </p>
          </section>

          <section className="mb-20">
            <InvoiceGenerator
              user={user ? { email: user.email } : null}
              preset={{
                docType: "estimate",
                invoiceNumber: "EST-001",
                notes: "Este orçamento é válido por 30 dias.",
              }}
              ai={false}
              quoteMode
            />
          </section>

          <section className="mb-20 mx-auto max-w-[1024px]">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Orçamento &rarr; aprovado &rarr; fatura
            </h2>
            <div className="mt-8 grid gap-12 sm:grid-cols-3">
              {[
                {
                  n: "01",
                  title: "Precifique o trabalho",
                  desc: "Divida o trabalho em itens de linha com quantidades e valores. O total estimado é atualizado em tempo real.",
                },
                {
                  n: "02",
                  title: "Envie para aprovação",
                  desc: "Baixe um PDF de orçamento profissional com data de validade. O cliente sabe exatamente o que está aprovando.",
                },
                {
                  n: "03",
                  title: "Converta ao ser aprovado",
                  desc: "Clique em \"Converter em fatura\" e o orçamento vira uma fatura real com data de vencimento — nada para digitar de novo.",
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
              Orçamentos que conquistam trabalho
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              {[
                {
                  title: "Escopo claro, menos disputas",
                  desc: "Um orçamento detalhado por itens diz ao cliente exatamente pelo que está pagando — e o que não está incluído.",
                },
                {
                  title: "Decisões mais rápidas",
                  desc: "Formatação profissional e uma data de validade criam uma urgência sutil sem táticas de pressão.",
                },
                {
                  title: "Preços consistentes",
                  desc: "Use itens e clientes salvos para que trabalhos recorrentes sejam precificados sempre da mesma forma.",
                },
                {
                  title: "Zero retrabalho",
                  desc: "Quando o orçamento é aprovado, converta-o diretamente em uma fatura com os mesmos itens e valores.",
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
            <h3 className="text-[16px] font-semibold">Páginas relacionadas</h3>
            <ul className="mt-3 space-y-2 text-[15px]">
              <li>
                <Link href={localizedPath("/invoice-generator", "pt")} className="text-[#166534] hover:underline">
                  Gerador de Faturas
                </Link>
              </li>
              <li>
                <Link href="/receipt-generator" className="text-[#166534] hover:underline">
                  Gerador de Recibos
                </Link>
              </li>
              <li>
                <Link href="/estimates-and-invoices" className="text-[#166534] hover:underline">
                  Orçamentos e Faturas
                </Link>
              </li>
              <li>
                <Link href="/learn/invoice-vs-estimate" className="text-[#166534] hover:underline">
                  Fatura vs Orçamento: Quando Enviar Cada Um
                </Link>
              </li>
              <li>
                <Link href="/templates" className="text-[#166534] hover:underline">
                  Modelos de Fatura
                </Link>
              </li>
            </ul>
          </section>

          <section className="mb-20 mx-auto max-w-[1024px]">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Perguntas frequentes
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

      <SeoFooter locale="pt" />
    </>
  );
}
