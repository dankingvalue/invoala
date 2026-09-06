import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { hreflangAlternates, localizedPath } from "@/lib/i18n";
import { SeoNav, SeoFooter, FaqSection, CtaBlock, JsonLd } from "@/components/seo/SeoPage";
import { SetHtmlLang } from "@/components/SetHtmlLang";
import { ProPricing } from "@/components/ProPricing";
import { faqSchema } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Precios — Gratis para Siempre, Mejora Cuando lo Necesites",
    description:
      "Precios de Invoala: un generador de facturas verdaderamente gratuito, más los planes Pro y Teams para clientes guardados, cotizaciones y facturación de equipo. No se requiere tarjeta de crédito para empezar.",
    path: "/es/pricing",
    keywords: ["precios invoala", "software de facturación gratis", "costo del generador de facturas"],
    hreflang: hreflangAlternates("/pricing"),
    ogLocale: "es_ES",
  });
}

const faqs = [
  {
    question: "¿Invoala es realmente gratis?",
    answer:
      "Sí. El generador de facturas es gratis para siempre: facturas ilimitadas, PDFs profesionales, sin marca de agua, sin necesidad de registro. No hay una prueba que termine.",
  },
  {
    question: "¿Qué añade el plan Pro?",
    answer:
      "Pro añade perfiles de clientes guardados con historial, cotizaciones y presupuestos, perfiles de múltiples negocios y soporte prioritario. Conservas todo lo del plan gratuito.",
  },
  {
    question: "¿Puedo cancelar en cualquier momento?",
    answer:
      "Sí. Las suscripciones se pueden cancelar en cualquier momento desde tu panel, y conservas el acceso hasta el final del período de facturación.",
  },
  {
    question: "¿Qué métodos de pago aceptan?",
    answer:
      "El pago es gestionado por Polar y acepta todas las principales tarjetas de crédito y débito, además de métodos de pago locales populares donde estén disponibles.",
  },
  {
    question: "¿Ofrecen reembolsos?",
    answer: "Los reembolsos se gestionan según los Términos de Servicio. Contacta a hello@invoala.com con cualquier pregunta sobre facturación.",
  },
];

export default function PricingPageEs() {
  return (
    <>
      <SetHtmlLang lang="es" />
      <JsonLd data={faqSchema(faqs)} />
      <SeoNav locale="es" />
      <main className="pt-28 pb-16">
        <div className="mx-auto max-w-[1024px] px-6">
          <section className="mb-14 text-center">
            <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[56px]">
              Empieza gratis. Mejora cuando lo necesites.
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              El generador de facturas es gratis para siempre — sin prueba, sin
              tarjeta de crédito. Los planes Pro y Teams añaden potencia para
              negocios en crecimiento.
            </p>
          </section>
        </div>

        {/* Full-bleed pricing band — same treatment as the homepage section */}
        <ProPricing />

        <div className="mx-auto max-w-[1024px] px-6">
          <section className="mb-14">
            <FaqSection items={faqs} title="Preguntas frecuentes" />
          </section>

          <section className="mb-10">
            <CtaBlock
              title="Prueba primero el generador gratis"
              description="Crea tu primera factura en menos de dos minutos — decide sobre los planes después."
              buttonText="Crear una factura"
              buttonHref={localizedPath("/invoice-generator", "es")}
            />
          </section>
        </div>
      </main>
      <SeoFooter locale="es" />
    </>
  );
}
