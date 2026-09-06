import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { hreflangAlternates, localizedPath } from "@/lib/i18n";
import { SeoFooter } from "@/components/seo/SeoPage";
import { SetHtmlLang } from "@/components/SetHtmlLang";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Faturas Recorrentes — Automatize a Cobrança Repetitiva",
    description:
      "Configure faturas recorrentes para automatizar a cobrança repetitiva. Economize tempo, nunca perca um ciclo de cobrança e receba em dia com o faturamento recorrente gratuito da Invoala.",
    path: "/pt/recurring-invoices",
    keywords: [
      "faturas recorrentes",
      "cobrança recorrente",
      "faturas automáticas",
      "faturamento por assinatura",
      "modelo de fatura recorrente",
    ],
    ogDescription:
      "Configure faturas recorrentes para automatizar a cobrança repetitiva. Economize tempo, nunca perca um ciclo de cobrança e receba em dia.",
    hreflang: hreflangAlternates("/recurring-invoices"),
    ogLocale: "pt_BR",
  });
}

const faqs = [
  {
    q: "O que são faturas recorrentes?",
    a: "Faturas recorrentes são cobranças geradas automaticamente e enviadas em uma programação regular — semanal, mensal, trimestral ou anual. Em vez de criar a mesma fatura manualmente a cada período, você configura uma vez e o sistema cuida do resto.",
  },
  {
    q: "Como funcionam as faturas recorrentes?",
    a: "Você define a frequência de cobrança (semanal, mensal, trimestral ou anual), os dados do cliente, os itens de linha e o valor. O sistema então cria e envia a fatura automaticamente em cada data programada, sem intervenção manual.",
  },
  {
    q: "Que tipos de negócios usam faturas recorrentes?",
    a: "Qualquer negócio com cobrança repetida se beneficia — agências com contratos fixos, empresas SaaS com assinaturas, consultores com contratos contínuos, prestadores de manutenção, coworkings e administradores de imóveis dependem de faturas recorrentes.",
  },
  {
    q: "Posso editar uma fatura recorrente antes de ela ser enviada?",
    a: "Sim. Você pode revisar e modificar uma fatura recorrente antes de cada ciclo. Se precisar alterar o valor, adicionar um novo item ou pausar a programação temporariamente, você tem controle total.",
  },
  {
    q: "O que acontece se o método de pagamento de um cliente expirar?",
    a: "O faturamento recorrente envia a fatura conforme programado, independentemente do método de pagamento. Você verá o status da fatura como vencida e poderá cobrar o cliente. Se também usar pagamentos recorrentes, pode configurar alertas para cobranças falhas.",
  },
  {
    q: "Faturas recorrentes são diferentes de assinaturas?",
    a: "Elas estão intimamente relacionadas. Assinaturas geralmente incluem cobrança automática de pagamento. Faturas recorrentes tratam de gerar e enviar a cobrança automaticamente. A Invoala foca no lado do faturamento, então você cria a fatura e decide como cobrar o pagamento.",
  },
  {
    q: "Posso configurar faturas recorrentes gratuitamente na Invoala?",
    a: "Sim. O plano gratuito da Invoala inclui agendamento de faturas recorrentes. Configure seu cliente, defina a frequência e os itens, e deixe a Invoala cuidar do resto — sem necessidade de cartão de crédito.",
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

export default function RecurringInvoicesPagePt() {
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
              Faturas Recorrentes — Automatize a Cobrança Repetitiva
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              Pare de enviar a mesma fatura todo mês. Configure faturas
              recorrentes uma vez e deixe a Invoala cuidar do resto —
              automaticamente, em dia, sempre.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                href="/#generate"
                className="rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0f3d22]"
              >
                Configure faturas recorrentes
              </Link>
              <Link
                href={localizedPath("/invoice-generator", "pt")}
                className="text-[16px] font-medium text-[#166534] hover:underline"
              >
                Veja como funciona &rsaquo;
              </Link>
            </div>
          </section>

          {/* What are recurring invoices */}
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              O que são faturas recorrentes?
            </h2>
            <div className="mt-6 space-y-4 text-[16px] leading-relaxed text-[#374151]">
              <p>
                Faturas recorrentes são cobranças geradas e enviadas
                automaticamente aos clientes em uma programação
                definida. Em vez de criar manualmente a mesma fatura
                toda semana, mês ou trimestre, você configura uma vez —
                dados do cliente, itens de linha, valores e frequência —
                e o sistema cuida do resto.
              </p>
              <p>
                Pense nisso como configurar uma assinatura para o seu
                faturamento. Seja cobrando um cliente R$500 todo mês por
                serviços de retenção ou R$200 a cada trimestre por
                manutenção, faturas recorrentes garantem que você nunca
                esqueça de enviar uma cobrança ou perca um ciclo de
                pagamento.
              </p>
              <p>
                A Invoala torna isso simples. Crie uma fatura, defina a
                frequência, e seu cliente a recebe em dia — sem trabalho
                manual da sua parte.
              </p>
            </div>
          </section>

          {/* Why use them */}
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 md:p-12">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Por que usar faturas recorrentes?
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              {[
                {
                  title: "Economize horas todo mês",
                  desc: "O faturamento manual para clientes recorrentes é tedioso. Faturas recorrentes eliminam a repetição — configure uma vez e recupere seu tempo.",
                },
                {
                  title: "Nunca perca um ciclo de cobrança",
                  desc: "A vida fica corrida. Faturas recorrentes garantem que você cobre em dia, sempre, para que o fluxo de caixa não sofra com faturas esquecidas.",
                },
                {
                  title: "Receba mais rápido",
                  desc: "Quando as faturas saem automaticamente, os clientes as recebem mais cedo. Entrega mais rápida significa pagamento mais rápido e fluxo de caixa mais saudável.",
                },
                {
                  title: "Reduza erros humanos",
                  desc: "Chega de copiar e colar itens ou errar cálculos de totais. O sistema gera uma fatura idêntica com matemática precisa a cada ciclo.",
                },
                {
                  title: "Melhore a experiência do cliente",
                  desc: "Clientes valorizam consistência. Quando sabem exatamente quando e como serão cobrados, isso gera confiança e profissionalismo.",
                },
                {
                  title: "Escale seu negócio",
                  desc: "À medida que sua lista de clientes cresce, o faturamento recorrente escala com você. Gerencie 10 ou 1.000 clientes recorrentes sem adicionar carga administrativa.",
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
              Como funcionam as faturas recorrentes
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-[#374151]">
              Faturas recorrentes operam em uma programação simples. Você
              escolhe com que frequência quer cobrar e a Invoala cuida
              da geração:
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  freq: "Semanal",
                  desc: "Ideal para serviços contínuos cobrados toda semana — limpeza, manutenção ou consultoria por hora com um teto semanal fixo.",
                },
                {
                  freq: "Mensal",
                  desc: "O ciclo mais comum. Perfeito para taxas de retenção, assinaturas, aluguel e contratos de serviço contínuo.",
                },
                {
                  freq: "Trimestral",
                  desc: "Ótimo para serviços sazonais, consultoria trimestral, contratos de manutenção e negócios que preferem menos faturas, porém maiores.",
                },
                {
                  freq: "Anual",
                  desc: "Ideal para assinaturas anuais, contratos anuais, prêmios de seguro e renovações de licença cobradas uma vez por ano.",
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
              Recursos das faturas recorrentes
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Agendamento flexível",
                  desc: "Escolha cobrança semanal, mensal, trimestral ou anual — ou defina um intervalo personalizado que se encaixe no seu negócio.",
                },
                {
                  title: "Gestão de clientes",
                  desc: "Salve os dados do cliente uma vez. Cada fatura recorrente puxa do mesmo cadastro de cliente — sem redigitar informações.",
                },
                {
                  title: "Editável antes do envio",
                  desc: "Revise e ajuste cada fatura antes de ser enviada. Adicione novos itens, altere valores ou pule um ciclo.",
                },
                {
                  title: "Geração automática de PDF",
                  desc: "Cada ciclo produz um PDF profissional pronto para impressão, consistente com sua marca.",
                },
                {
                  title: "Acompanhamento de status de pagamento",
                  desc: "Veja de relance quais faturas recorrentes estão pagas, pendentes ou vencidas em todos os seus clientes.",
                },
                {
                  title: "Múltiplas moedas",
                  desc: "Cobre clientes internacionais na moeda deles. A Invoala suporta 154 moedas com formatação correta.",
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
              Quem se beneficia de faturas recorrentes?
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
              {[
                {
                  title: "Agências com contratos fixos",
                  desc: "Agências de marketing, design e desenvolvimento que cobram dos clientes uma taxa mensal fixa por trabalho contínuo. Faturas recorrentes eliminam a etapa manual repetitiva.",
                },
                {
                  title: "Negócios SaaS e de assinatura",
                  desc: "Empresas de software que cobram mensal ou anualmente pelo acesso. Faturas recorrentes mantêm o ciclo de cobrança funcionando sem uma equipe de faturamento dedicada.",
                },
                {
                  title: "Consultores e coaches",
                  desc: "Consultores de negócios, coaches de vida e assessores com relacionamentos contínuos com clientes. Cobre mensalmente por acesso, chamadas ou suporte estratégico.",
                },
                {
                  title: "Prestadores de manutenção e serviços",
                  desc: "Jardineiros, faxineiros, técnicos de climatização e administradores de imóveis que prestam serviços regulares em uma programação fixa.",
                },
                {
                  title: "Coworkings e aluguéis",
                  desc: "Provedores de espaço de trabalho e administradores de imóveis que cobram inquilinos mensalmente por mesa, armazenamento ou taxas de uso.",
                },
                {
                  title: "Freelancers com clientes de longo prazo",
                  desc: "Freelancers que trabalham com o mesmo cliente mês após mês. Economize tempo automatizando a fatura que nunca muda.",
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
              Automatize seu faturamento hoje
            </h2>
            <p className="mt-2 text-[16px] text-[#6b7280]">
              Configure sua primeira fatura recorrente em menos de dois
              minutos. Grátis, sem cadastro necessário.
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
                <Link href="/invoicing-software" className="text-[#166534] hover:underline">
                  Software de Faturamento
                </Link>
              </li>
              <li>
                <Link href="/invoice-payment-tracking" className="text-[#166534] hover:underline">
                  Rastreamento de Pagamentos de Faturas
                </Link>
              </li>
              <li>
                <Link href="/invoice-reminders" className="text-[#166534] hover:underline">
                  Lembretes de Fatura
                </Link>
              </li>
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
