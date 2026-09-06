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
    title: "Gerador de Recibos — Crie Recibos Profissionais Grátis",
    description:
      "Crie um recibo profissional em segundos. Registre pagamentos, mostre o que foi pago e quando, e baixe um recibo em PDF pronto para impressão. Grátis, sem cadastro.",
    path: "/pt/receipt-generator",
    keywords: [
      "gerador de recibos",
      "criador de recibos grátis",
      "criar recibo",
      "recibo de pagamento",
      "recibo de venda",
    ],
    ogDescription:
      "Crie um recibo profissional em segundos. Registre pagamentos e baixe um PDF pronto para impressão. Grátis, sem cadastro.",
    hreflang: hreflangAlternates("/receipt-generator"),
    ogLocale: "pt_BR",
  });
}

const faqs = [
  {
    q: "Qual a diferença entre fatura e recibo?",
    a: "Uma fatura solicita pagamento; um recibo confirma que o pagamento foi recebido. Depois que um cliente pagar sua fatura, envie um recibo mostrando o valor pago, a data e o motivo.",
  },
  {
    q: "Quando devo enviar um recibo?",
    a: "Envie um recibo toda vez que receber um pagamento — parcial ou total. Clientes geralmente precisam de recibos para sua própria contabilidade, relatórios de despesas e registros fiscais.",
  },
  {
    q: "Este gerador de recibos é gratuito?",
    a: "Sim. Crie recibos ilimitados sem marca d'água e sem cadastro. Preencha o formulário, veja a prévia em tempo real e baixe um PDF pronto para impressão.",
  },
  {
    q: "Posso adicionar meu logotipo e dados do negócio?",
    a: "Sim. Envie seu logotipo, informe o nome do negócio, endereço e e-mail. Seu recibo inclui uma marca de PAGO e um detalhamento limpo.",
  },
  {
    q: "Os recibos precisam de um número de fatura?",
    a: "Recibos geralmente referenciam seu próprio número ou a fatura relacionada. Use o campo de número para um número de recibo (ex. RCPT-001) ou adicione o número da fatura como campo personalizado.",
  },
  {
    q: "Posso registrar pagamentos parciais?",
    a: "Sim. Liste apenas os itens ou valores cobertos por este pagamento. Para um pagamento parcial, anote o saldo restante na seção de observações.",
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

export default async function ReceiptGeneratorPagePt() {
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
              Gerador de Recibos
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              Confirme cada pagamento com um recibo profissional. O gerador
              abaixo está configurado no modo recibo — adicione o que foi
              pago, quando e por quem, depois baixe um PDF impecável.
            </p>
            <p className="mt-4 text-[14px] text-[#9ca3af]">
              Grátis para sempre &middot; Sem cadastro &middot; Sem marca d&apos;água
            </p>
          </section>

          <section className="mb-20">
            <InvoiceGenerator
              user={user ? { email: user.email } : null}
              preset={{
                docType: "receipt",
                invoiceNumber: "RCPT-001",
                notes: "Obrigado pela preferência!",
              }}
              ai={false}
              quoteMode
            />
          </section>

          <section className="mb-20 mx-auto max-w-[1024px]">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              De fatura a recibo em uma etapa
            </h2>
            <div className="mt-8 grid gap-12 sm:grid-cols-3">
              {[
                {
                  n: "01",
                  title: "Registre o pagamento",
                  desc: "Insira o que foi pago e quando. O recibo mostra a data de pagamento em vez de uma data de vencimento.",
                },
                {
                  n: "02",
                  title: "Detalhe o que foi coberto",
                  desc: "Liste os produtos ou serviços que o pagamento cobre, exatamente como na fatura original.",
                },
                {
                  n: "03",
                  title: "Baixe e envie",
                  desc: "Obtenha um recibo em PDF pronto para impressão com uma marca de PAGO. Envie por e-mail ou entregue pessoalmente.",
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
              Por que enviar recibos?
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              {[
                {
                  title: "Comprovante de pagamento",
                  desc: "Recibos documentam que houve troca de dinheiro — protegendo você e seu cliente se surgirem dúvidas depois.",
                },
                {
                  title: "Clientes esperam por eles",
                  desc: "Clientes empresariais precisam de recibos para relatórios de despesas e declarações fiscais. Enviar um automaticamente facilita trabalhar com você.",
                },
                {
                  title: "Registros organizados",
                  desc: "Um histórico numerado de recibos facilita a conciliação na época de impostos, especialmente para pagamentos em dinheiro e cartão.",
                },
                {
                  title: "Acompanhamento profissional",
                  desc: "Confirmar o pagamento com um recibo é um toque profissional que encerra a transação com chave de ouro.",
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
                <Link href="/estimate-generator" className="text-[#166534] hover:underline">
                  Gerador de Orçamentos
                </Link>
              </li>
              <li>
                <Link href="/learn/invoice-vs-receipt" className="text-[#166534] hover:underline">
                  Fatura vs Recibo: Qual a Diferença?
                </Link>
              </li>
              <li>
                <Link href="/invoice-payment-tracking" className="text-[#166534] hover:underline">
                  Rastreamento de Pagamentos de Faturas
                </Link>
              </li>
              <li>
                <Link href="/learn/how-to-track-unpaid-invoices" className="text-[#166534] hover:underline">
                  Como Rastrear Faturas Não Pagas
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
