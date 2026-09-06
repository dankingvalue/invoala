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
    title: "Gerador de Faturas Grátis — Crie Faturas Profissionais Online",
    description:
      "Use o gerador de faturas gratuito da Invoala para criar faturas profissionais em segundos. Não é necessário cadastro — basta preencher o formulário e baixar um PDF impecável.",
    path: "/pt/invoice-generator",
    keywords: [
      "gerador de faturas",
      "gerador de faturas grátis",
      "gerador de faturas online",
      "criar fatura",
    ],
    ogDescription:
      "Use o gerador de faturas gratuito da Invoala para criar faturas profissionais em segundos. Não é necessário cadastro.",
    hreflang: hreflangAlternates("/invoice-generator"),
    ogLocale: "pt_BR",
  });
}

const faqs = [
  {
    q: "Como uso o gerador de faturas?",
    a: "Preencha os dados do seu negócio, adicione as informações do cliente, insira os itens com quantidades e valores, defina uma taxa de imposto se necessário, e clique em baixar. Você terá um PDF profissional em segundos.",
  },
  {
    q: "O gerador de faturas é realmente gratuito?",
    a: "Sim. Não há taxas ocultas, marcas d'água ou limites. Crie quantas faturas precisar, para sempre.",
  },
  {
    q: "Preciso criar uma conta para usar o gerador?",
    a: "Não. O gerador de faturas funciona instantaneamente sem necessidade de cadastro. Abra a página, preencha seus dados e baixe sua fatura.",
  },
  {
    q: "Posso adicionar meu logotipo à fatura?",
    a: "Sim. Clique na área de upload de logotipo no formulário para adicionar o logotipo do seu negócio. Ele aparece no topo de cada fatura para um visual profissional.",
  },
  {
    q: "Quais moedas o gerador suporta?",
    a: "A Invoala suporta 154 moedas mundiais, incluindo USD, EUR, GBP, JPY, CAD, AUD e muitas outras. A fatura formata automaticamente o símbolo da moeda e as casas decimais.",
  },
  {
    q: "O gerador calcula impostos?",
    a: "Sim. Insira sua taxa de imposto (IVA, GST, imposto sobre vendas) e o total é atualizado em tempo real enquanto você digita. Você pode ver o detalhamento na prévia.",
  },
  {
    q: "Posso salvar minhas faturas?",
    a: "Seus dados são salvos automaticamente no armazenamento local do seu navegador. Se você criar uma conta gratuita, também pode salvar faturas na nuvem e acessá-las de qualquer dispositivo.",
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

export default async function InvoiceGeneratorPagePt() {
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
          {/* Hero */}
          <section className="mb-12 text-center">
            <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[56px]">
              Gerador de Faturas Grátis
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              Crie faturas profissionais em segundos. Sem cadastro, sem
              cartão de crédito, sem marcas d&apos;água. Apenas um PDF
              limpo pronto para enviar ao seu cliente.
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
              Como usar o gerador de faturas
            </h2>
            <div className="mt-8 grid gap-12 sm:grid-cols-3">
              {[
                {
                  n: "01",
                  title: "Adicione seus dados",
                  desc: "Insira o nome do seu negócio, e-mail e endereço. Envie seu logotipo para um toque profissional.",
                },
                {
                  n: "02",
                  title: "Descreva seu trabalho",
                  desc: "Adicione itens com descrições, quantidades e valores. Ou use IA para redigi-los a partir de texto simples.",
                },
                {
                  n: "03",
                  title: "Baixe o PDF",
                  desc: "Clique no botão de download para obter uma fatura A4 impecável. Anexe-a a um e-mail e envie ao seu cliente.",
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
              O que está incluído em cada fatura
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Layout profissional",
                  desc: "Tipografia e espaçamento limpos que fazem seu trabalho parecer premium.",
                },
                {
                  title: "Sua marca",
                  desc: "Adicione seu logotipo e dados do negócio para uma experiência de marca consistente.",
                },
                {
                  title: "Itens de linha",
                  desc: "Detalhamento de serviços ou produtos com quantidades e valores.",
                },
                {
                  title: "Detalhamento de impostos",
                  desc: "Cálculo automático de IVA, GST ou imposto sobre vendas com um resumo claro.",
                },
                {
                  title: "Condições de pagamento",
                  desc: "Datas de vencimento, formas de pagamento e observações para que os clientes saibam exatamente como pagar.",
                },
                {
                  title: "PDF pronto para impressão",
                  desc: "Formato A4 que imprime perfeitamente e fica idêntico em qualquer dispositivo.",
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
              Pronto para criar sua fatura?
            </h2>
            <p className="mt-2 text-[16px] text-[#6b7280]">
              Role para cima e comece a preencher o formulário. Sua
              primeira fatura profissional está a minutos de distância.
            </p>
            <Link
              href="/#generate"
              className="mt-6 inline-block rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0f3d22]"
            >
              Criar Fatura
            </Link>
          </section>

          {/* Related links */}
          <section className="mb-20 mx-auto max-w-[1024px] border-t border-[#e5e7eb] pt-8">
            <h3 className="text-[16px] font-semibold">Páginas relacionadas</h3>
            <ul className="mt-3 space-y-2 text-[15px]">
              <li>
                <Link href="/receipt-generator" className="text-[#166534] hover:underline">
                  Gerador de Recibos
                </Link>
              </li>
              <li>
                <Link href="/invoice-maker" className="text-[#166534] hover:underline">
                  Criador de Faturas
                </Link>
              </li>
              <li>
                <Link href="/online-invoicing" className="text-[#166534] hover:underline">
                  Faturamento Online
                </Link>
              </li>
              <li>
                <Link href="/invoicing-software" className="text-[#166534] hover:underline">
                  Software de Faturamento
                </Link>
              </li>
              <li>
                <Link href="/invoicing-for-freelancers" className="text-[#166534] hover:underline">
                  Faturamento para Freelancers
                </Link>
              </li>
            </ul>
          </section>

          {/* FAQ */}
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
