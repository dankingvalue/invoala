import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { hreflangAlternates, localizedPath } from "@/lib/i18n";
import { SeoFooter } from "@/components/seo/SeoPage";
import { InvoiceGenerator } from "@/components/InvoiceGenerator";
import { getCurrentUser } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Criador de Faturas — Crie Faturas Profissionais em Segundos",
    description:
      "A Invoala é um criador de faturas que ajuda você a criar faturas profissionais em segundos. Rápido, grátis e sem necessidade de cadastro. Baixe um PDF impecável agora.",
    path: "/pt/invoice-maker",
    keywords: [
      "criador de faturas",
      "fazer uma fatura",
      "criar fatura",
      "fatura profissional",
      "gerador de faturas",
    ],
    ogDescription:
      "A Invoala é um criador de faturas que ajuda você a criar faturas profissionais em segundos. Rápido, grátis e sem necessidade de cadastro.",
    hreflang: hreflangAlternates("/invoice-maker"),
    ogLocale: "pt_BR",
  });
}

const faqs = [
  {
    q: "Quão rápido posso fazer uma fatura com a Invoala?",
    a: "A maioria dos usuários cria uma fatura completa em menos de dois minutos. Se você já salvou os dados do seu negócio e cliente antes, leva ainda menos tempo — basta selecionar um cliente e adicionar seus itens.",
  },
  {
    q: "O criador de faturas é gratuito?",
    a: "Sim. O criador de faturas da Invoala é totalmente gratuito — sem testes, sem paywalls, sem marcas d'água. Crie faturas ilimitadas e baixe PDFs profissionais sem pagar nada.",
  },
  {
    q: "Preciso de habilidades técnicas para fazer uma fatura?",
    a: "De jeito nenhum. O criador de faturas usa um formulário simples — preencha seus dados, adicione itens e clique em baixar. Sem habilidades de design, sem fórmulas de planilha, sem curva de aprendizado.",
  },
  {
    q: "Posso personalizar a aparência da minha fatura?",
    a: "Sim. Adicione seu logotipo, escolha sua moeda, defina sua taxa de imposto e inclua notas de pagamento. O criador de faturas cuida do layout profissional automaticamente.",
  },
  {
    q: "Qual formato de arquivo o criador de faturas produz?",
    a: "PDF — um documento A4 limpo e pronto para impressão que fica idêntico em qualquer dispositivo e imprime perfeitamente em qualquer impressora. Anexe a um e-mail ou imprima diretamente.",
  },
  {
    q: "Posso fazer faturas em diferentes moedas?",
    a: "Sim. A Invoala suporta 154 moedas mundiais. Selecione sua moeda no menu suspenso e o criador de faturas formata o símbolo e as casas decimais automaticamente.",
  },
  {
    q: "Como isso é diferente de usar Word ou Excel?",
    a: "Word e Excel exigem formatação manual e configuração de fórmulas. O criador de faturas da Invoala foi feito sob medida — você tem totais automáticos, cálculo de impostos, formatação profissional e download em PDF em uma única etapa.",
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

export default async function InvoiceMakerPagePt() {
  const user = await getCurrentUser();

  return (
    <>
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
          <Link
            href="/#generate"
            className="rounded-lg bg-[#14532d] px-5 py-2 text-[14px] font-semibold text-white transition hover:bg-[#0f3d22]"
          >
            Criar Fatura
          </Link>
        </div>
      </nav>

      <main className="pt-28 pb-16">
        <div className="mx-auto max-w-[1200px] px-6">
          {/* Hero */}
          <section className="mb-12 text-center">
            <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[56px]">
              Criador de Faturas — Crie Faturas Profissionais em Segundos
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              A forma mais rápida de fazer uma fatura profissional. Sem
              curva de aprendizado, sem cadastro, sem limites. Basta
              preencher o formulário e baixar um PDF impecável.
            </p>
            <p className="mt-4 text-[14px] text-[#9ca3af]">
              Grátis para sempre &middot; Sem cadastro &middot; Não é necessário cartão de crédito
            </p>
          </section>

          {/* Embedded generator */}
          <section className="mb-20">
            <InvoiceGenerator
              user={user ? { email: user.email } : null}
            />
          </section>

          {/* Speed & ease */}
          <section className="mb-20 mx-auto max-w-[1024px]">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Faça faturas em segundos, não minutos
            </h2>
            <div className="mt-8 grid gap-12 sm:grid-cols-3">
              {[
                {
                  n: "01",
                  title: "Digite seus dados",
                  desc: "Nome do negócio, dados do cliente, itens. O formulário é curto e intuitivo — sem necessidade de treinamento.",
                },
                {
                  n: "02",
                  title: "Veja a prévia",
                  desc: "Observe sua fatura ganhar forma em tempo real enquanto você digita. Ajuste qualquer coisa antes de baixar.",
                },
                {
                  n: "03",
                  title: "Baixe o PDF",
                  desc: "Um clique te dá uma fatura A4 pronta para impressão. Envie ao seu cliente e receba.",
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

          {/* Why use an invoice maker */}
          <section className="mb-20 mx-auto max-w-[1024px] rounded-xl bg-[#f3f4f6] p-8 md:p-12">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Por que usar um criador de faturas em vez de uma planilha?
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              {[
                {
                  title: "Sem fórmulas para manter",
                  desc: "Planilhas quebram quando você adiciona linhas ou muda taxas de imposto. Um criador de faturas cuida da matemática automaticamente.",
                },
                {
                  title: "Resultado profissional",
                  desc: "Planilhas parecem planilhas. Um criador de faturas produz um PDF limpo que parece feito por um designer.",
                },
                {
                  title: "Fluxo de trabalho mais rápido",
                  desc: "Sem configuração, sem modelos para ajustar. Abra a ferramenta, preencha o formulário e baixe — pronto em minutos.",
                },
                {
                  title: "Sem gerenciamento de arquivos",
                  desc: "Sem salvar, nomear ou organizar arquivos .xlsx. Sua fatura é gerada do zero a cada vez e baixada como PDF.",
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
          <section className="mb-20 mx-auto max-w-[1024px]">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Tudo o que o criador de faturas inclui
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Upload de logotipo",
                  desc: "Adicione o logotipo do seu negócio para um visual de marca.",
                },
                {
                  title: "Redação com IA",
                  desc: "Descreva o trabalho e a IA cria a fatura para você.",
                },
                {
                  title: "Matemática de impostos",
                  desc: "IVA, GST ou imposto sobre vendas — calculado automaticamente.",
                },
                {
                  title: "154 moedas",
                  desc: "Cobre clientes ao redor do mundo com formatação correta.",
                },
                {
                  title: "Prévia em tempo real",
                  desc: "Veja sua fatura ser atualizada em tempo real enquanto você digita.",
                },
                {
                  title: "Exportação em PDF",
                  desc: "Formato A4 pronto para impressão em qualquer dispositivo ou impressora.",
                },
                {
                  title: "Salvamento de clientes",
                  desc: "Armazene dados de clientes para faturar mais rápido no futuro.",
                },
                {
                  title: "Condições de pagamento",
                  desc: "Defina datas de vencimento, métodos e notas de multa por atraso.",
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
              Faça sua primeira fatura agora
            </h2>
            <p className="mt-2 text-[16px] text-[#6b7280]">
              Role para cima até o criador de faturas e comece a
              preencher seus dados. Um PDF profissional está a apenas
              alguns cliques.
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
                <Link href={localizedPath("/invoice-generator", "pt")} className="text-[#166534] hover:underline">
                  Gerador de Faturas
                </Link>
              </li>
              <li>
                <Link href="/receipt-generator" className="text-[#166534] hover:underline">
                  Gerador de Faturas Grátis
                </Link>
              </li>
              <li>
                <Link href={localizedPath("/online-invoicing", "pt")} className="text-[#166534] hover:underline">
                  Faturamento Online
                </Link>
              </li>
              <li>
                <Link href={localizedPath("/invoicing-software", "pt")} className="text-[#166534] hover:underline">
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
