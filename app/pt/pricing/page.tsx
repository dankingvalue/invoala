import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { hreflangAlternates, localizedPath } from "@/lib/i18n";
import { SeoNav, SeoFooter, FaqSection, CtaBlock, JsonLd } from "@/components/seo/SeoPage";
import { SetHtmlLang } from "@/components/SetHtmlLang";
import { ProPricing } from "@/components/ProPricing";
import { faqSchema } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Preços — Grátis para Sempre, Faça Upgrade Quando Precisar",
    description:
      "Preços da Invoala: um gerador de faturas verdadeiramente gratuito, além dos planos Pro e Teams para clientes salvos, orçamentos e faturamento de equipe. Não é necessário cartão de crédito para começar.",
    path: "/pt/pricing",
    keywords: ["preços invoala", "software de faturamento grátis", "custo do gerador de faturas"],
    hreflang: hreflangAlternates("/pricing"),
    ogLocale: "pt_BR",
  });
}

const faqs = [
  {
    question: "A Invoala é realmente gratuita?",
    answer:
      "Sim. O gerador de faturas é grátis para sempre: faturas ilimitadas, PDFs profissionais, sem marca d'água, sem necessidade de cadastro. Não há teste que termine.",
  },
  {
    question: "O que o plano Pro adiciona?",
    answer:
      "O Pro adiciona perfis de clientes salvos com histórico, orçamentos e estimativas, perfis de múltiplos negócios e suporte prioritário. Você mantém tudo do plano gratuito.",
  },
  {
    question: "Posso cancelar a qualquer momento?",
    answer:
      "Sim. As assinaturas podem ser canceladas a qualquer momento no seu painel, e você mantém o acesso até o final do período de cobrança.",
  },
  {
    question: "Quais métodos de pagamento vocês aceitam?",
    answer:
      "O checkout é processado pela Polar e aceita todos os principais cartões de crédito e débito, além de métodos de pagamento locais populares onde disponíveis.",
  },
  {
    question: "Vocês oferecem reembolsos?",
    answer: "Reembolsos são tratados de acordo com os Termos de Serviço. Entre em contato com hello@invoala.com para dúvidas sobre cobrança.",
  },
];

export default function PricingPagePt() {
  return (
    <>
      <SetHtmlLang lang="pt" />
      <JsonLd data={faqSchema(faqs)} />
      <SeoNav locale="pt" />
      <main className="pt-28 pb-16">
        <div className="mx-auto max-w-[1024px] px-6">
          <section className="mb-14 text-center">
            <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[56px]">
              Comece grátis. Faça upgrade quando precisar.
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              O gerador de faturas é grátis para sempre — sem teste, sem
              cartão de crédito. Os planos Pro e Teams adicionam recursos
              para negócios em crescimento.
            </p>
          </section>
        </div>

        {/* Full-bleed pricing band — same treatment as the homepage section */}
        <ProPricing />

        <div className="mx-auto max-w-[1024px] px-6">
          <section className="mb-14">
            <FaqSection items={faqs} title="Perguntas frequentes" />
          </section>

          <section className="mb-10">
            <CtaBlock
              title="Experimente primeiro o gerador gratuito"
              description="Crie sua primeira fatura em menos de dois minutos — decida sobre os planos depois."
              buttonText="Criar uma fatura"
              buttonHref={localizedPath("/invoice-generator", "pt")}
            />
          </section>
        </div>
      </main>
      <SeoFooter locale="pt" />
    </>
  );
}
