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
    title: "Faturamento Online — Crie e Envie Faturas de Qualquer Lugar",
    description:
      "Crie e envie faturas profissionais de qualquer dispositivo com a ferramenta gratuita de faturamento online da Invoala. Sem software para instalar — basta abrir o navegador e começar a faturar.",
    path: "/pt/online-invoicing",
    keywords: [
      "faturamento online",
      "fatura online",
      "criar fatura online",
      "enviar fatura online",
      "faturamento online grátis",
    ],
    ogDescription:
      "Crie e envie faturas profissionais de qualquer dispositivo com a ferramenta gratuita de faturamento online da Invoala. Sem software para instalar.",
    hreflang: hreflangAlternates("/online-invoicing"),
    ogLocale: "pt_BR",
  });
}

const faqs = [
  {
    q: "O que é faturamento online?",
    a: "O faturamento online permite criar e enviar faturas por um navegador web em vez de software de desktop. Você preenche um formulário, a ferramenta gera um PDF profissional, e você pode baixá-lo ou enviá-lo por e-mail diretamente ao cliente.",
  },
  {
    q: "O faturamento online é seguro?",
    a: "Sim. A Invoala processa tudo no seu navegador — seus dados nunca tocam um servidor a menos que você escolha salvá-los. Os dados do seu negócio e as informações do cliente permanecem no seu dispositivo.",
  },
  {
    q: "Posso usar o faturamento online no meu celular?",
    a: "Claro. A Invoala funciona em qualquer dispositivo com navegador web — celular, tablet ou notebook. A interface se adapta ao tamanho da sua tela para você faturar de qualquer lugar.",
  },
  {
    q: "Preciso instalar algo para o faturamento online?",
    a: "Não. O faturamento online funciona inteiramente no seu navegador. Não há nada para baixar, instalar ou atualizar. Basta abrir o site e começar a criar faturas.",
  },
  {
    q: "Quão rápido posso enviar uma fatura online?",
    a: "A maioria dos usuários cria e baixa uma fatura em menos de dois minutos. Se você já salvou os dados do cliente antes, fica ainda mais rápido — basta selecionar o cliente e adicionar seus itens.",
  },
  {
    q: "Posso rastrear faturas online depois de enviadas?",
    a: "Sim. A Invoala permite marcar faturas como pagas, pendentes ou vencidas, para que você sempre saiba seu status de pagamento. Você pode ver todas as suas faturas e seus status em uma única tela.",
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

export default function OnlineInvoicingPagePt() {
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
              Faturamento Online — Crie e Envie Faturas de Qualquer Lugar
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              Seu notebook, seu celular, seu tablet — crie faturas
              profissionais em qualquer dispositivo com conexão à
              internet. Sem software para instalar, sem arquivos para
              sincronizar.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                href="/#generate"
                className="rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0f3d22]"
              >
                Comece a faturar agora
              </Link>
              <Link
                href={localizedPath("/invoice-generator", "pt")}
                className="text-[16px] font-medium text-[#166534] hover:underline"
              >
                Veja como funciona &rsaquo;
              </Link>
            </div>
          </section>

          {/* What is online invoicing */}
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              O que é faturamento online?
            </h2>
            <div className="mt-6 space-y-4 text-[16px] leading-relaxed text-[#374151]">
              <p>
                Faturamento online significa criar, enviar e gerenciar
                faturas por um navegador web. Em vez de depender de
                software de desktop ou modelos de planilha, você usa uma
                ferramenta online dedicada que cuida da formatação, dos
                cálculos e da geração de PDF para você.
              </p>
              <p>
                A maior vantagem é a acessibilidade. Você pode criar uma
                fatura de qualquer dispositivo — o computador do
                escritório, seu notebook em casa ou seu celular enquanto
                está em um local de trabalho. Não há nada para instalar,
                nada para atualizar e nada para sincronizar entre
                dispositivos.
              </p>
              <p>
                A Invoala vai além, mantendo todos os seus dados no
                navegador. Nada é enviado a um servidor, a menos que você
                escolha salvá-lo em uma conta, então as informações do
                seu negócio permanecem privadas.
              </p>
            </div>
          </section>

          {/* Benefits */}
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 md:p-12">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Benefícios do faturamento online com a Invoala
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              {[
                {
                  title: "Acesso de qualquer lugar",
                  desc: "Crie faturas de qualquer dispositivo com navegador. Trabalhe de casa, do escritório ou do local de um cliente — seu faturamento vai com você.",
                },
                {
                  title: "Sem software para instalar",
                  desc: "Evite downloads, atualizações e dores de cabeça de compatibilidade. O faturamento online funciona inteiramente no seu navegador.",
                },
                {
                  title: "Entrega instantânea",
                  desc: "Baixe um PDF e envie por e-mail ao cliente em segundos. Sem impressão, sem digitalização, sem atrasos de correio.",
                },
                {
                  title: "Sempre atualizado",
                  desc: "Você sempre usa a versão mais recente. Sem notas de atualização, sem avisos de update, sem atraso de recursos.",
                },
                {
                  title: "Funciona em qualquer dispositivo",
                  desc: "O design responsivo garante uma experiência de faturamento fluida em celulares, tablets e desktops.",
                },
                {
                  title: "Sem perda de dados",
                  desc: "Os dados da sua fatura são salvos automaticamente no armazenamento local do navegador. Feche a aba, volte depois — os dados continuam lá.",
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
              Como funciona o faturamento online
            </h2>
            <div className="mt-8 grid gap-12 sm:grid-cols-3">
              {[
                {
                  n: "01",
                  title: "Abra a Invoala",
                  desc: "Acesse o gerador de faturas no seu navegador. Sem necessidade de cadastro — você já pode começar.",
                },
                {
                  n: "02",
                  title: "Preencha os dados",
                  desc: "Adicione as informações do seu negócio, dados do cliente, itens e taxa de imposto. O formulário salva suas informações para a próxima vez.",
                },
                {
                  n: "03",
                  title: "Baixe e envie",
                  desc: "Clique em baixar para obter um PDF profissional. Anexe a um e-mail, envie pela Invoala ou compartilhe um link.",
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
              O faturamento online é seguro?
            </h2>
            <div className="mt-6 space-y-4 text-[16px] leading-relaxed text-[#374151]">
              <p>
                Segurança é uma preocupação central ao lidar com dados de
                negócios e clientes online. A Invoala resolve isso
                processando tudo localmente no seu navegador. Quando
                você digita os detalhes da fatura, eles nunca saem do
                seu dispositivo.
              </p>
              <p>
                Seus dados são armazenados no armazenamento local do
                navegador — não em nossos servidores. Isso significa que
                mesmo que os servidores da Invoala fossem comprometidos,
                as informações do seu negócio não estariam em risco
                porque nunca foram enviadas.
              </p>
              <p>
                Se você optar por criar uma conta e salvar faturas na
                nuvem, os dados são criptografados em trânsito (HTTPS) e
                em repouso. Você mantém o controle sobre o que é
                armazenado e o que permanece local.
              </p>
            </div>
          </section>

          {/* Features */}
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Recursos de faturamento online
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "PDFs profissionais",
                  desc: "Baixe faturas A4 limpas e prontas para impressão com seu logotipo, itens e detalhamento de impostos.",
                },
                {
                  title: "Redação com IA",
                  desc: "Descreva o trabalho em palavras simples e a IA cria uma fatura pronta com itens e totais.",
                },
                {
                  title: "154 moedas",
                  desc: "Cobre clientes ao redor do mundo com símbolos de moeda corretos e formatação decimal automática.",
                },
                {
                  title: "Cálculos de impostos",
                  desc: "Insira sua taxa de IVA, GST ou imposto sobre vendas e os totais são atualizados em tempo real enquanto você digita.",
                },
                {
                  title: "Gestão de clientes",
                  desc: "Salve os dados dos clientes e selecione-os em um menu suspenso em faturas futuras.",
                },
                {
                  title: "Rastreamento de pagamentos",
                  desc: "Marque faturas como pagas, pendentes ou vencidas para manter seu fluxo de caixa visível.",
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
              Comece a faturar online — grátis, hoje
            </h2>
            <p className="mt-2 text-[16px] text-[#6b7280]">
              Sem cadastro, sem cartão de crédito, sem limites. Crie sua
              primeira fatura agora mesmo.
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
