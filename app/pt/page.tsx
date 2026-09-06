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
    title: "Invoala — Gerador de Faturas Grátis para Freelancers",
    description:
      "Crie faturas profissionais online grátis. Adicione itens, impostos e seu logotipo, depois baixe um PDF impecável em segundos. Sem cadastro. Sem marca d'água.",
    path: "/pt/",
    keywords: [
      "gerador de faturas grátis",
      "criador de faturas",
      "modelo de fatura",
      "fatura freelancer",
      "fatura em pdf",
      "faturamento online",
    ],
    hreflang: hreflangAlternates("/"),
    ogLocale: "pt_BR",
  });
}

const faqs = [
  {
    q: "A Invoala é realmente gratuita?",
    a: "Sim. Crie, visualize e baixe faturas ilimitadas gratuitamente — sem testes, sem paywalls, sem marcas d'água nos seus PDFs.",
  },
  {
    q: "Preciso criar uma conta?",
    a: "Não. Não há cadastro nem e-mail necessário. Abra a página, preencha seus dados e baixe sua fatura.",
  },
  {
    q: "Onde meus dados são armazenados?",
    a: "Tudo o que você digita é salvo apenas localmente no seu navegador. Nada é enviado a um servidor, então os dados do seu negócio permanecem privados.",
  },
  {
    q: "O que eu recebo ao baixar?",
    a: "Um PDF A4 limpo e profissional com seu logotipo, itens, detalhamento de impostos e notas de pagamento — pronto para enviar por e-mail a qualquer cliente.",
  },
  {
    q: "Posso usar também para orçamentos ou recibos?",
    a: "Claro. Altere as datas e descrições de itens para enviar orçamentos antes de um projeto, ou recibos após o pagamento.",
  },
  {
    q: "Quais moedas são suportadas?",
    a: "154 moedas mundiais, incluindo USD, EUR, GBP, JPY, CAD, AUD e mais. A fatura formata o símbolo e as casas decimais automaticamente.",
  },
  {
    q: "Posso adicionar meu próprio logotipo?",
    a: "Sim. Envie seu logotipo e ele aparecerá no topo de cada fatura. Usuários gratuitos recebem um PDF sem marca d'água.",
  },
  {
    q: "Calcula impostos automaticamente?",
    a: "Sim. Insira sua taxa de imposto (IVA, GST, imposto sobre vendas) e o total é atualizado em tempo real enquanto você digita.",
  },
  {
    q: "Posso salvar clientes para reutilizar?",
    a: "Sim. Salve os dados do cliente uma vez e selecione-os em um menu suspenso em faturas futuras. Todos os dados permanecem no seu navegador.",
  },
  {
    q: "Qual formato de arquivo ele exporta?",
    a: "PDF — formato A4 pronto para impressão que fica idêntico em qualquer dispositivo e imprime perfeitamente em qualquer impressora.",
  },
  {
    q: "Há um limite de quantas faturas posso criar?",
    a: "Sem limite. Crie quantas quiser, para sempre. Não há limites diários ou mensais.",
  },
  {
    q: "Como isso é diferente do Excel ou Google Sheets?",
    a: "A Invoala é feita especificamente para faturamento. Você tem totais em tempo real, cálculo automático de impostos, formatação profissional e download em PDF — tudo em uma única etapa. Sem fórmulas, sem modelos para configurar.",
  },
  {
    q: "Freelancers podem usar isso?",
    a: "Claro. A Invoala é feita para freelancers, consultores e profissionais independentes que querem faturas profissionais sem pagar por software.",
  },
  {
    q: "Vocês suportam faturas recorrentes?",
    a: "Você pode salvar seus dados e informações de clientes para reutilização rápida. O agendamento completo de faturas recorrentes está disponível no plano Pro.",
  },
];

const features = [
  {
    title: "PDFs impecáveis",
    copy: "Voilà — prontos para o cliente no momento em que você baixa. PDFs A4 perfeitos que fazem o trabalho individual parecer de uma agência.",
    glyph: (
      <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm7 1.5V9h4.5M9 13h6m-6 4h6" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    ),
  },
  {
    title: "Pronto em segundos",
    copy: "Sem conta, sem paywall, sem espera. Preencha, baixe, pronto — seus dados ficam salvos no seu próprio dispositivo.",
    glyph: (
      <path d="M13 2 4.5 13.5H11L9.5 22 19 10h-6.5L13 2Z" strokeWidth="1.5" strokeLinejoin="round" />
    ),
  },
  {
    title: "Qualquer moeda",
    copy: `Cobre qualquer pessoa, em qualquer lugar — ${CURRENCIES.length} moedas mundiais, cálculo automático de impostos, formatação correta por padrão.`,
    glyph: (
      <path d="M12 3v18M16.5 7.5c-.8-1.2-2.4-2-4.5-2-2.5 0-4 1.3-4 3.1 0 4.4 9 2.3 9 6.8 0 1.8-1.7 3.1-4.5 3.1-2.3 0-4-.9-4.8-2.2" strokeWidth="1.5" strokeLinecap="round" />
    ),
  },
  {
    title: "Só descreva",
    copy: "Descreva o trabalho em palavras simples — a IA transforma isso em uma fatura pronta, com itens e totais incluídos.",
    glyph: (
      <path d="M12 2l2.2 6.6L21 11l-6.8 2.4L12 20l-2.2-6.6L3 11l6.8-2.4L12 2Z" strokeWidth="1.5" strokeLinejoin="round" />
    ),
  },
  {
    title: "Tudo em um só lugar",
    copy: "Crie uma conta gratuita e a Invoala lembra seus clientes, rastreia quem pagou e quem está atrasado, e avisa no momento em que um cliente abre uma fatura.",
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

export default async function HomePt() {
  const { flags, announcement } = await getFlags();
  const user = await getCurrentUser();

  if (flags.maintenanceMode) {
    return (
      <div id="top">
        <SetHtmlLang lang="pt" />
        <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <h1 className="text-[40px] font-semibold tracking-tight md:text-[56px]">
            Já estamos voltando.
          </h1>
          <p className="mt-4 max-w-[420px] text-[17px] leading-relaxed text-subtle">
            A Invoala está passando por uma atualização rápida. Recarregue
            em alguns minutos — suas faturas salvas estão seguras no seu
            dispositivo.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div id="top" className="scroll-mt-20">
      <SetHtmlLang lang="pt" />
      <FaqJsonLd />

      <header className="fixed inset-x-0 top-0 z-50 h-[72px] border-b border-[#e5e7eb] bg-white">
        <nav className="mx-auto flex h-full max-w-[1400px] items-center px-5 sm:px-8">
          <Link href="/pt" className="flex shrink-0 items-center gap-2.5">
            <svg width="28" height="28" viewBox="0 0 64 64" aria-hidden="true">
              <rect width="64" height="64" rx="14.5" fill="#166534" />
              <path d="M35.5 10 19 37h9.5l-3 17L43 27h-9.5l2-17z" fill="#fff" />
            </svg>
            <span className="text-[17px] font-bold tracking-tight text-ink">Invoala</span>
          </Link>
          <nav className="hidden flex-1 items-center justify-center gap-8 text-[14px] font-medium md:flex">
            <a href="#features" className="text-subtle transition-colors hover:text-ink">Recursos</a>
            <a href="#how" className="text-subtle transition-colors hover:text-ink">Como funciona</a>
            <Link href={localizedPath("/pricing", "pt")} className="text-subtle transition-colors hover:text-ink">Preços</Link>
            <a href="#faq" className="text-subtle transition-colors hover:text-ink">Perguntas</a>
          </nav>
          <div className="ml-auto flex shrink-0 items-center gap-3 md:ml-0">
            {user ? (
              <Link href="/dashboard?tab=general" className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-[14px] font-semibold text-ink transition hover:border-[#166534] hover:text-[#166534]">
                Painel
              </Link>
            ) : (
              <Link href="/login" className="text-[14px] font-medium text-subtle hover:text-ink">
                Entrar
              </Link>
            )}
            <a href="#generate" className="rounded-lg bg-[#14532d] px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-[#0f3d22]">
              Criar fatura
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
            Junte-se a mais de 500 freelancers e agências que já faturam com a Invoala
          </p>
        </Reveal>
        <Reveal>
          <h1 className="mx-auto mt-3 max-w-[900px] text-[48px] font-extrabold leading-[1.05] tracking-tight md:text-[80px]">
            Faturas que parecem
            <span className="block text-[#166534]">profissionais.</span>
          </h1>
        </Reveal>
        <Reveal delay={100}>
          <p className="mx-auto mt-6 max-w-[640px] text-[19px] font-medium leading-relaxed text-subtle md:text-[21px]">
            Voilà — agora fazer faturas é simples. Crie uma fatura
            bonita e baixe um PDF impecável em segundos.
          </p>
        </Reveal>
        <Reveal delay={200}>
          <div className="mt-9 flex items-center justify-center gap-4">
            <a
              href="#generate"
              className="rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white shadow-sm transition hover:bg-[#0f3d22] active:scale-[0.99]"
            >
              Crie sua fatura
            </a>
            <a href="#how" className="text-[16px] font-medium text-[#166534] transition-opacity hover:opacity-70">
              Como funciona &rsaquo;
            </a>
          </div>
        </Reveal>
        <Reveal delay={300}>
          <p className="mt-6 text-[13px] text-subtle">
            Grátis para sempre &nbsp;·&nbsp; Sem cadastro &nbsp;·&nbsp; Não é necessário cartão de crédito
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
                Comece agora. Leva dois minutos.
              </h2>
              <p className="mt-3 text-[17px] font-medium text-subtle">
                Preencha uma vez — salvamos seus dados para a próxima.{flags.aiComposer ? " Ou simplesmente descreva o trabalho e deixe a IA redigir." : ""}
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
              Tudo que você precisa.
              <span className="block text-subtle">Nada que não precisa.</span>
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
              Três passos. Pronto.
            </h2>
            <p className="mt-3 max-w-[520px] text-[17px] font-medium text-subtle">
              Você cuida do trabalho importante. A Invoala cuida da parte chata.
            </p>
          </Reveal>
          <div className="mt-14 grid gap-12 sm:grid-cols-3">
            {[
              {
                n: "01",
                title: "Adicione seus dados",
                copy: "Seu nome, logotipo e informações do cliente. Nós lembramos para sua próxima visita.",
              },
              {
                n: "02",
                title: "Descreva o trabalho",
                copy: "Itens, quantidades, valores, impostos — os totais são atualizados em tempo real enquanto você digita.",
              },
              {
                n: "03",
                title: "Baixe e envie",
                copy: "Um clique te dá um PDF A4 nítido. Anexe, envie, receba.",
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
                Crie sua fatura
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
              O que torna uma fatura boa?
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Itens claros",
                desc: "Cada serviço ou produto é listado separadamente com descrição, quantidade e preço. Sem pacotes vagos.",
              },
              {
                title: "Layout profissional",
                desc: "Tipografia limpa, espaçamento adequado e seu logotipo. Transmite credibilidade e atenção aos detalhes.",
              },
              {
                title: "Condições de pagamento claras",
                desc: "Líquido 15 ou Líquido 30 — informe quando o pagamento vence. Inclua seu método preferido e eventuais multas por atraso.",
              },
              {
                title: "Imposto correto",
                desc: "Aplique a taxa correta para sua jurisdição. A Invoala calcula o total automaticamente.",
              },
              {
                title: "Número de fatura único",
                desc: "IDs sequenciais (INV-001, INV-002) ajudam você e seu cliente a rastrear pagamentos sem confusão.",
              },
              {
                title: "Dados de contato",
                desc: "Seu nome, e-mail e endereço — para o cliente saber exatamente a quem pagar e como te contatar.",
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
                Crie uma fatura melhor
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
              Saiba mais
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <Reveal>
              <Link
                href="/how-to-create-invoice"
                className="block rounded-xl border border-[#e5e7eb] bg-white p-6 transition hover:shadow-md"
              >
                <h3 className="text-[18px] font-bold tracking-tight text-[#111827]">
                  Como Criar uma Fatura
                </h3>
                <p className="mt-2 text-[15px] text-[#6b7280]">
                  Guia passo a passo da página em branco até o cliente
                  pagante. Cobre itens, impostos, condições de pagamento
                  e envio.
                </p>
                <span className="mt-3 inline-block text-[14px] font-semibold text-[#166534]">
                  Leia o guia &rsaquo;
                </span>
              </Link>
            </Reveal>
            <Reveal delay={100}>
              <Link
                href={localizedPath("/invoice-template", "pt")}
                className="block rounded-xl border border-[#e5e7eb] bg-white p-6 transition hover:shadow-md"
              >
                <h3 className="text-[18px] font-bold tracking-tight text-[#111827]">
                  Modelos de Fatura Grátis
                </h3>
                <p className="mt-2 text-[15px] text-[#6b7280]">
                  Modelos específicos por indústria para freelancers,
                  designers, fotógrafos, prestadores de serviço e
                  pequenas empresas.
                </p>
                <span className="mt-3 inline-block text-[14px] font-semibold text-[#166534]">
                  Ver modelos &rsaquo;
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
              Perguntas. Respondidas.
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
              <a href="#features" className="transition-colors hover:text-ink">Recursos</a>
              <a href="#faq" className="transition-colors hover:text-ink">Perguntas</a>
              <Link href="/how-to-create-invoice" className="transition-colors hover:text-ink">Guia</Link>
              <Link href={localizedPath("/invoice-template", "pt")} className="transition-colors hover:text-ink">Modelos</Link>
              <Link href="/roadmap" className="transition-colors hover:text-ink">Roteiro</Link>
              <Link href="/privacy" className="transition-colors hover:text-ink">Privacidade</Link>
              <Link href="/terms" className="transition-colors hover:text-ink">Termos</Link>
              <a href="mailto:hello@invoala.com" className="transition-colors hover:text-ink">
                Contato
              </a>
            </nav>
            <p>&copy; 2026 Invoala. Todos os direitos reservados.</p>
          </div>
          <p className="mt-6 border-t border-[#e5e7eb] pt-5 text-[11px] leading-relaxed text-subtle">
            A Invoala é um gerador de faturas online gratuito para
            freelancers e pequenas empresas. Crie faturas profissionais
            com seu próprio logotipo, itens, impostos e múltiplas
            moedas — depois baixe como arquivos PDF prontos para
            impressão. Não é necessária conta, e seus dados nunca saem
            do seu navegador.
          </p>
        </div>
        <div className="mx-auto max-w-[1024px] pt-5">
          <TrustStrip />
        </div>
      </footer>
    </div>
  );
}
