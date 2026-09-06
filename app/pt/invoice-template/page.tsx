import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { hreflangAlternates, localizedPath } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Modelo de Fatura Grátis — Baixe e Personalize",
    description:
      "Modelos de fatura gratuitos para freelancers e pequenas empresas. Personalize com seu logotipo, itens e condições de pagamento. Baixe em PDF — sem cadastro.",
    path: "/pt/invoice-template",
    keywords: [
      "modelo de fatura",
      "modelo de fatura grátis",
      "modelo de fatura PDF",
      "modelo de fatura para freelancers",
      "modelo de fatura para negócios",
      "modelo de fatura personalizado",
    ],
    ogDescription: "Modelos de fatura gratuitos para freelancers. Personalize e baixe em PDF.",
    hreflang: hreflangAlternates("/invoice-template"),
    ogLocale: "pt_BR",
  });
}

const industries = [
  {
    name: "Freelancers e Consultores",
    description:
      "Cobre por trabalho por hora, projetos fixos ou taxas de retenção. Inclua o escopo do trabalho, horas e valor.",
    items: ["Valor por hora × horas", "Taxa fixa de projeto", "Quilometragem / despesas"],
  },
  {
    name: "Designers e Desenvolvedores Web",
    description:
      "Detalhe as fases de design, desenvolvimento e revisão. Liste cada entrega separadamente.",
    items: ["Design UI/UX", "Desenvolvimento frontend", "Configuração de hospedagem"],
  },
  {
    name: "Fotógrafos e Videomakers",
    description:
      "Cobre por sessão, por projeto ou por entrega. Inclua direitos de uso, se aplicável.",
    items: ["Taxa de sessão", "Edição / pós-produção", "Impressões / arquivos digitais"],
  },
  {
    name: "Prestadores de Serviço e Ofícios",
    description:
      "Detalhe materiais, mão de obra e licenças. Adicione endereço do projeto e cronograma.",
    items: ["Horas de mão de obra", "Materiais", "Licenças / taxas"],
  },
  {
    name: "Pequenas Empresas",
    description:
      "Venda de produtos, pacotes de serviço ou assinaturas recorrentes. Inclua impostos onde exigido.",
    items: ["Produto / SKU", "Pacote de serviço", "Assinatura recorrente"],
  },
];

export default function InvoiceTemplatePt() {
  return (
    <div id="top" className="min-h-screen scroll-mt-20">
      {/* Nav */}
      <nav className="fixed inset-x-0 top-0 z-40 border-b border-[#e5e7eb] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1024px] items-center justify-between px-6">
          <Link href={localizedPath("/", "pt")} className="flex items-center gap-2 font-bold text-[#111827]">
            <svg width="20" height="20" viewBox="0 0 64 64" aria-hidden="true">
              <rect width="64" height="64" rx="14.5" fill="#166534" />
              <path d="M35.5 10 19 37h9.5l-3 17L43 27h-9.5l2-17z" fill="#fff" />
            </svg>
            Invoala
          </Link>
          <Link href="/#generate" className="rounded-lg bg-[#14532d] px-5 py-2 text-[14px] font-semibold text-white transition hover:bg-[#0f3d22]">
            Criar Fatura
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pb-12 pt-32 md:pt-40">
        <div className="mx-auto max-w-[720px]">
          <p className="text-[14px] font-medium text-[#166534]">Modelos</p>
          <h1 className="mt-3 text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[56px]">
            Modelo de Fatura Grátis
          </h1>
          <p className="mt-4 text-[18px] leading-relaxed text-[#6b7280]">
            Escolha uma indústria, preencha os espaços, baixe um PDF
            impecável. Cada modelo é grátis — sem cadastro, sem marca
            d&apos;água, sem limites.
          </p>
          <Link
            href="/#generate"
            className="mt-6 inline-block rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0f3d22]"
          >
            Comece com um modelo
          </Link>
        </div>
      </section>

      {/* Industries */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-[720px]">
          <h2 className="text-[28px] font-extrabold tracking-tight">
            Modelos por Indústria
          </h2>
          <p className="mt-2 text-[16px] text-[#6b7280]">
            Toda fatura segue a mesma estrutura — adicione os itens
            certos para sua área.
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
            Toda Boa Fatura Inclui
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {[
              {
                title: "Suas informações",
                desc: "Nome, endereço, e-mail, telefone — para o cliente saber a quem pagar.",
              },
              {
                title: "Informações do cliente",
                desc: "Para quem você está cobrando. Nome, e-mail e endereço.",
              },
              {
                title: "Número da fatura",
                desc: "Um ID único para rastreamento. INV-001, INV-002, etc.",
              },
              {
                title: "Data e vencimento",
                desc: "Quando foi emitida e quando o pagamento vence.",
              },
              {
                title: "Itens de linha",
                desc: "O que você fez, quantos e quanto por unidade.",
              },
              {
                title: "Total e impostos",
                desc: "Subtotal, porcentagem de imposto e valor final devido.",
              },
              {
                title: "Condições de pagamento",
                desc: "Líquido 15, Líquido 30, ou no recebimento. Inclua formas de pagamento.",
              },
              {
                title: "Observações",
                desc: "Mensagem de agradecimento, política de multa por atraso ou instruções especiais.",
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
            Crie sua fatura agora
          </h2>
          <p className="mt-2 text-[16px] text-[#6b7280]">
            Escolha um modelo, preencha seus dados, baixe o PDF.
          </p>
          <Link
            href="/#generate"
            className="mt-6 inline-block rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0f3d22]"
          >
            Crie sua fatura
          </Link>
        </div>
      </section>

      {/* Internal links */}
      <section className="border-t border-[#e5e7eb] px-6 py-10">
        <div className="mx-auto max-w-[720px]">
          <h3 className="text-[16px] font-semibold">Continue lendo</h3>
          <ul className="mt-3 space-y-2 text-[15px]">
            <li>
              <Link href="/how-to-create-invoice" className="text-[#166534] hover:underline">
                Como Criar uma Fatura — Guia Passo a Passo
              </Link>
            </li>
            <li>
              <Link href="/#features" className="text-[#166534] hover:underline">
                Recursos da Invoala
              </Link>
            </li>
            <li>
              <Link href="/#faq" className="text-[#166534] hover:underline">
                Perguntas Frequentes
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
          &copy; 2026. Gerador de faturas grátis para freelancers.
        </div>
      </footer>
    </div>
  );
}
