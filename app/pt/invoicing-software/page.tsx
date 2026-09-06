import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { hreflangAlternates, localizedPath } from "@/lib/i18n";
import { SeoFooter } from "@/components/seo/SeoPage";
import { SetHtmlLang } from "@/components/SetHtmlLang";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Software de Faturamento — Faturamento Simples para Negócios Modernos",
    description:
      "A Invoala é um software de faturamento simples para freelancers e pequenas empresas. Crie faturas profissionais, acompanhe pagamentos e receba mais rápido — tudo grátis.",
    path: "/pt/invoicing-software",
    keywords: [
      "software de faturamento",
      "software de faturas",
      "faturamento online",
      "software de faturamento para pequenas empresas",
    ],
    hreflang: hreflangAlternates("/invoicing-software"),
    ogLocale: "pt_BR",
  });
}

const faqs = [
  {
    q: "O que é software de faturamento?",
    a: "Software de faturamento é uma ferramenta que ajuda você a criar, enviar e gerenciar faturas para o seu negócio. Ele automatiza cálculos, acompanha o status de pagamento e gera PDFs profissionais que você pode enviar por e-mail aos clientes.",
  },
  {
    q: "A Invoala é um software de faturamento gratuito?",
    a: "Sim. A Invoala é totalmente gratuita — sem testes, sem paywalls, sem marcas d'água. Crie faturas ilimitadas, baixe PDFs e acompanhe pagamentos sem gastar um centavo.",
  },
  {
    q: "Posso usar software de faturamento para minha pequena empresa?",
    a: "Claro. O software de faturamento é feito para freelancers, consultores, agências, prestadores de serviço e pequenas empresas de todos os tipos. Economiza tempo e parece mais profissional do que planilhas.",
  },
  {
    q: "Quais recursos um bom software de faturamento deve ter?",
    a: "Procure criação de faturas, exportação em PDF, acompanhamento de pagamentos, gestão de clientes, faturas recorrentes, cálculos de impostos e suporte a múltiplas moedas. A Invoala inclui tudo isso.",
  },
  {
    q: "Como o software de faturamento é diferente de uma planilha?",
    a: "Planilhas exigem formatação manual e configuração de fórmulas. O software de faturamento oferece um modelo pronto, totais automáticos, cálculo de impostos, geração de PDF e acompanhamento de pagamentos em uma única ferramenta.",
  },
  {
    q: "Posso enviar faturas diretamente pela Invoala?",
    a: "Sim. Se você tem uma conta, pode enviar faturas por e-mail diretamente aos seus clientes pelo painel. Usuários gratuitos podem baixar o PDF e enviá-lo pelo próprio e-mail.",
  },
  {
    q: "A Invoala oferece faturas recorrentes?",
    a: "Sim. Você pode salvar dados de clientes e modelos de fatura para reutilização rápida. O agendamento completo de faturas recorrentes está disponível no plano Pro para ciclos de cobrança regulares.",
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

export default function InvoicingSoftwarePagePt() {
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
          <Link
            href="/#generate"
            className="rounded-lg bg-[#14532d] px-5 py-2 text-[14px] font-semibold text-white transition hover:bg-[#0f3d22]"
          >
            Criar Fatura
          </Link>
        </div>
      </nav>

      <main className="pt-28 pb-16">
        <div className="mx-auto max-w-[1024px] px-6">
          {/* Hero */}
          <section className="mb-20 text-center">
            <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[56px]">
              Software de Faturamento Simples para Negócios Modernos
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              Pare de lutar com planilhas. A Invoala oferece tudo o que
              você precisa para criar, enviar e acompanhar faturas — sem a
              complexidade ou o custo.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                href="/#generate"
                className="rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0f3d22]"
              >
                Crie sua primeira fatura
              </Link>
              <Link
                href={localizedPath("/invoice-generator", "pt")}
                className="text-[16px] font-medium text-[#166534] hover:underline"
              >
                Experimente o gerador &rsaquo;
              </Link>
            </div>
          </section>

          {/* What is invoicing software */}
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              O que é software de faturamento?
            </h2>
            <div className="mt-6 space-y-4 text-[16px] leading-relaxed text-[#374151]">
              <p>
                Software de faturamento é uma ferramenta digital que
                permite às empresas criar, enviar e gerenciar faturas em um
                único lugar. Em vez de criar faturas em um processador de
                texto ou planilha, você preenche um formulário e o
                software cuida da formatação, cálculos de impostos,
                numeração e geração de PDF automaticamente.
              </p>
              <p>
                Um bom software de faturamento também acompanha o status
                de pagamento, para que você sempre saiba quais faturas
                estão pagas, quais estão vencidas e quanto de receita está
                pendente. Ele substitui um mosaico de ferramentas por um
                fluxo de trabalho otimizado.
              </p>
              <p>
                A Invoala vai além ao incluir redação de faturas com IA,
                gestão de clientes e suporte a faturas recorrentes — tudo
                gratuitamente.
              </p>
            </div>
          </section>

          {/* Why use it */}
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 md:p-12">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Por que usar software de faturamento?
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              {[
                {
                  title: "Economize tempo",
                  desc: "Modelos, preenchimento automático e dados de clientes salvos significam ir de uma página em branco a uma fatura pronta em menos de dois minutos.",
                },
                {
                  title: "Pareça profissional",
                  desc: "PDFs limpos e personalizados transmitem credibilidade. Clientes levam seu negócio mais a sério quando a fatura parece profissional.",
                },
                {
                  title: "Receba mais rápido",
                  desc: "Condições de pagamento claras, datas de vencimento e entrega instantânea garantem que os clientes saibam exatamente quando e como pagar.",
                },
                {
                  title: "Mantenha-se organizado",
                  desc: "Acompanhe cada fatura por status — paga, pendente ou vencida — para que nada passe despercebido.",
                },
                {
                  title: "Reduza erros",
                  desc: "Cálculos automáticos de impostos e totais eliminam os erros que ocorrem com planilhas manuais.",
                },
                {
                  title: "Trabalhe de qualquer lugar",
                  desc: "O software de faturamento baseado em nuvem funciona no seu navegador. Crie faturas no laptop, tablet ou celular.",
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
              Recursos que tornam a Invoala diferente
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Acompanhe pagamentos",
                  desc: "Marque faturas como pagas, pendentes ou vencidas. Veja seu saldo pendente de relance.",
                },
                {
                  title: "Gerencie clientes",
                  desc: "Salve os dados do cliente uma vez e selecione-os em um menu suspenso em cada fatura futura.",
                },
                {
                  title: "Faturas recorrentes",
                  desc: "Configure faturas repetidas para trabalho contínuo. Nunca esqueça de cobrar por mensalidades fixas.",
                },
                {
                  title: "Lembretes de pagamento",
                  desc: "Lembretes automáticos mantêm seu fluxo de caixa saudável sem e-mails de cobrança constrangedores.",
                },
                {
                  title: "Redação de faturas com IA",
                  desc: "Descreva o que você fez em palavras simples e a IA transforma isso em uma fatura pronta com itens e totais.",
                },
                {
                  title: "Múltiplas moedas",
                  desc: "Cobre clientes em qualquer uma das 154 moedas mundiais com símbolos e formatação decimal corretos.",
                },
                {
                  title: "Download em PDF",
                  desc: "Exporte um PDF A4 limpo e pronto para impressão que fica perfeito em qualquer dispositivo ou impressora.",
                },
                {
                  title: "Cálculos de impostos",
                  desc: "Insira sua taxa de IVA, GST ou imposto sobre vendas e o total é atualizado em tempo real enquanto você digita.",
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
              Para quem é a Invoala?
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Freelancers",
                  desc: "Envie faturas profissionais para projetos, marcos e trabalho por hora sem pagar por software que você não precisa.",
                },
                {
                  title: "Pequenas empresas",
                  desc: "Gerencie a cobrança de uma equipe em crescimento. Acompanhe quem pagou e quem deve — tudo em um painel.",
                },
                {
                  title: "Consultores",
                  desc: "Cobre por sua expertise com faturas profissionais que refletem a qualidade do seu trabalho.",
                },
                {
                  title: "Agências",
                  desc: "Gerencie múltiplos clientes e projetos com dados de clientes salvos e cobrança recorrente.",
                },
                {
                  title: "Prestadores de serviço",
                  desc: "Crie faturas no local pelo celular. Baixe o PDF e envie por e-mail antes de sair do trabalho.",
                },
                {
                  title: "Trabalhos extras",
                  desc: "Receba de forma profissional por trabalho freelance sem investir em ferramentas de faturamento caras.",
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
              Como a Invoala se compara
            </h2>
            <div className="mt-8 space-y-4 text-[16px] leading-relaxed text-[#374151]">
              <p>
                A maioria dos softwares de faturamento se divide em dois
                grupos: ferramentas gratuitas com recursos limitados, ou
                plataformas caras com curvas de aprendizado íngremes. A
                Invoala fica no ponto ideal — completa em recursos e
                verdadeiramente gratuita.
              </p>
              <p>
                Diferente de modelos de planilha, a Invoala lida com
                formatação, cálculo de impostos e geração de PDF
                automaticamente. Diferente de ferramentas pagas como
                FreshBooks ou QuickBooks, não há assinatura, sem taxa por
                fatura e sem restrição de recursos.
              </p>
              <p>
                Você tem faturas profissionais, gestão de clientes,
                acompanhamento de pagamentos, redação com IA e suporte a
                154 moedas — tudo sem inserir um cartão de crédito.
              </p>
            </div>
          </section>

          {/* CTA */}
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 text-center">
            <h2 className="text-[24px] font-bold tracking-tight">
              Pronto para simplificar seu faturamento?
            </h2>
            <p className="mt-2 text-[16px] text-[#6b7280]">
              Crie sua primeira fatura profissional em menos de dois
              minutos. Não é necessário cadastro.
            </p>
            <Link
              href="/#generate"
              className="mt-6 inline-block rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0f3d22]"
            >
              Criar Fatura
            </Link>
          </section>

          {/* Related links */}
          <section className="mb-20 border-t border-[#e5e7eb] pt-8">
            <h3 className="text-[16px] font-semibold">Páginas relacionadas</h3>
            <ul className="mt-3 space-y-2 text-[15px]">
              <li>
                <Link href="/online-invoicing" className="text-[#166534] hover:underline">
                  Faturamento Online
                </Link>
              </li>
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
                <Link href="/invoice-maker" className="text-[#166534] hover:underline">
                  Criador de Faturas
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
          <section className="mb-20">
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
