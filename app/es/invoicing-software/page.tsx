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
    title: "Software de Facturación — Facturación Simple para Negocios Modernos",
    description:
      "Invoala es un software de facturación simple para freelancers y pequeñas empresas. Crea facturas profesionales, rastrea pagos y cobra más rápido — todo gratis.",
    path: "/es/invoicing-software",
    keywords: [
      "software de facturación",
      "software de facturas",
      "facturación en línea",
      "software de facturación para pequeñas empresas",
    ],
    hreflang: hreflangAlternates("/invoicing-software"),
    ogLocale: "es_ES",
  });
}

const faqs = [
  {
    q: "¿Qué es el software de facturación?",
    a: "El software de facturación es una herramienta que te ayuda a crear, enviar y gestionar facturas para tu negocio. Automatiza los cálculos, rastrea el estado de los pagos y genera PDFs profesionales que puedes enviar por correo a tus clientes.",
  },
  {
    q: "¿Invoala es un software de facturación gratuito?",
    a: "Sí. Invoala es completamente gratis — sin pruebas, sin muros de pago, sin marcas de agua. Crea facturas ilimitadas, descarga PDFs y rastrea pagos sin gastar un centavo.",
  },
  {
    q: "¿Puedo usar software de facturación para mi pequeña empresa?",
    a: "Por supuesto. El software de facturación está diseñado para freelancers, consultores, agencias, contratistas y pequeñas empresas de todo tipo. Ahorra tiempo y se ve más profesional que las hojas de cálculo.",
  },
  {
    q: "¿Qué características debe tener un buen software de facturación?",
    a: "Busca creación de facturas, exportación a PDF, seguimiento de pagos, gestión de clientes, facturas recurrentes, cálculos de impuestos y soporte para múltiples monedas. Invoala incluye todo esto.",
  },
  {
    q: "¿En qué se diferencia el software de facturación de una hoja de cálculo?",
    a: "Las hojas de cálculo requieren formato manual y configuración de fórmulas. El software de facturación te ofrece una plantilla pulida, totales automáticos, cálculo de impuestos, generación de PDF y seguimiento de pagos en una sola herramienta.",
  },
  {
    q: "¿Puedo enviar facturas directamente desde Invoala?",
    a: "Sí. Si tienes una cuenta, puedes enviar facturas por correo electrónico directamente a tus clientes desde el panel. Los usuarios gratuitos pueden descargar el PDF y enviarlo desde su propio correo.",
  },
  {
    q: "¿Invoala admite facturas recurrentes?",
    a: "Sí. Puedes guardar los datos de clientes y plantillas de facturas para reutilizarlas rápidamente. La programación completa de facturas recurrentes está disponible en el plan Pro para ciclos de facturación regulares.",
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

export default function InvoicingSoftwarePageEs() {
  return (
    <>
      <SetHtmlLang lang="es" />
      <FaqJsonLd />

      <nav className="fixed inset-x-0 top-0 z-40 border-b border-[#e5e7eb] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1024px] items-center justify-between px-6">
          <Link href={localizedPath("/", "es")} className="flex items-center gap-2 font-bold text-[#111827]">
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
            Crear Factura
          </Link>
        </div>
      </nav>

      <main className="pt-28 pb-16">
        <div className="mx-auto max-w-[1024px] px-6">
          {/* Hero */}
          <section className="mb-20 text-center">
            <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[56px]">
              Software de Facturación Simple para Negocios Modernos
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              Deja de luchar con hojas de cálculo. Invoala te da todo lo que
              necesitas para crear, enviar y rastrear facturas — sin la
              complejidad ni el costo.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                href="/#generate"
                className="rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0f3d22]"
              >
                Crea tu primera factura
              </Link>
              <Link
                href={localizedPath("/invoice-generator", "es")}
                className="text-[16px] font-medium text-[#166534] hover:underline"
              >
                Prueba el generador &rsaquo;
              </Link>
            </div>
          </section>

          {/* What is invoicing software */}
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              ¿Qué es el software de facturación?
            </h2>
            <div className="mt-6 space-y-4 text-[16px] leading-relaxed text-[#374151]">
              <p>
                El software de facturación es una herramienta digital que
                permite a las empresas crear, enviar y gestionar facturas
                desde un solo lugar. En lugar de crear facturas en un
                procesador de texto o una hoja de cálculo, completas un
                formulario y el software se encarga del formato, los
                cálculos de impuestos, la numeración y la generación de PDF
                automáticamente.
              </p>
              <p>
                Un buen software de facturación también rastrea el estado
                de los pagos, para que siempre sepas qué facturas están
                pagadas, cuáles están vencidas y cuánto ingreso está
                pendiente. Reemplaza un mosaico de herramientas con un
                flujo de trabajo optimizado.
              </p>
              <p>
                Invoala va más allá al incluir redacción de facturas con
                IA, gestión de clientes y soporte para facturas
                recurrentes — todo de forma gratuita.
              </p>
            </div>
          </section>

          {/* Why use it */}
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 md:p-12">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              ¿Por qué usar software de facturación?
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              {[
                {
                  title: "Ahorra tiempo",
                  desc: "Plantillas, autocompletado y datos de clientes guardados significan que pasas de una página en blanco a una factura terminada en menos de dos minutos.",
                },
                {
                  title: "Luce profesional",
                  desc: "Los PDFs limpios y con marca transmiten credibilidad. Los clientes toman tu negocio más en serio cuando la factura se ve pulida.",
                },
                {
                  title: "Cobra más rápido",
                  desc: "Términos de pago claros, fechas de vencimiento y entrega instantánea significan que los clientes saben exactamente cuándo y cómo pagar.",
                },
                {
                  title: "Mantente organizado",
                  desc: "Rastrea cada factura por estado — pagada, pendiente o vencida — para que nada se te escape.",
                },
                {
                  title: "Reduce errores",
                  desc: "Los cálculos automáticos de impuestos y totales eliminan los errores de cálculo que ocurren con las hojas de cálculo manuales.",
                },
                {
                  title: "Trabaja desde cualquier lugar",
                  desc: "El software de facturación basado en la nube funciona en tu navegador. Crea facturas en tu laptop, tableta o teléfono.",
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
              Funciones que hacen diferente a Invoala
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Rastrea pagos",
                  desc: "Marca facturas como pagadas, pendientes o vencidas. Ve tu saldo pendiente de un vistazo.",
                },
                {
                  title: "Gestiona clientes",
                  desc: "Guarda los datos del cliente una vez y selecciónalos de un menú desplegable en cada factura futura.",
                },
                {
                  title: "Facturas recurrentes",
                  desc: "Configura facturas repetitivas para trabajo continuo. Nunca olvides facturar por retenedores mensuales.",
                },
                {
                  title: "Recordatorios de pago",
                  desc: "Los recordatorios automáticos mantienen tu flujo de caja saludable sin correos de seguimiento incómodos.",
                },
                {
                  title: "Redacción de facturas con IA",
                  desc: "Describe lo que hiciste en palabras simples y la IA lo convierte en una factura terminada con artículos y totales.",
                },
                {
                  title: "Múltiples monedas",
                  desc: "Factura a clientes en cualquiera de las 154 monedas mundiales con símbolos y formato decimal correctos.",
                },
                {
                  title: "Descarga en PDF",
                  desc: "Exporta un PDF A4 limpio y listo para imprimir que se ve perfecto en cualquier dispositivo o impresora.",
                },
                {
                  title: "Cálculos de impuestos",
                  desc: "Ingresa tu tasa de IVA, GST o impuesto sobre ventas y el total se actualiza en vivo mientras escribes.",
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
              ¿Para quién es Invoala?
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Freelancers",
                  desc: "Envía facturas pulidas para proyectos, hitos y trabajo por horas sin pagar por software que no necesitas.",
                },
                {
                  title: "Pequeñas empresas",
                  desc: "Gestiona la facturación de un equipo en crecimiento. Rastrea quién ha pagado y quién te debe — todo desde un panel.",
                },
                {
                  title: "Consultores",
                  desc: "Factura tu experiencia con facturas profesionales que reflejan la calidad de tu trabajo.",
                },
                {
                  title: "Agencias",
                  desc: "Gestiona múltiples clientes y proyectos con datos de clientes guardados y facturación recurrente.",
                },
                {
                  title: "Contratistas",
                  desc: "Crea facturas en el sitio desde tu teléfono. Descarga el PDF y envíalo por correo antes de salir del trabajo.",
                },
                {
                  title: "Trabajos secundarios",
                  desc: "Cobra de forma profesional por trabajo freelance sin invertir en herramientas de facturación costosas.",
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
              Cómo se compara Invoala
            </h2>
            <div className="mt-8 space-y-4 text-[16px] leading-relaxed text-[#374151]">
              <p>
                La mayoría del software de facturación cae en dos
                categorías: herramientas gratuitas con funciones limitadas,
                o plataformas costosas con curvas de aprendizaje
                pronunciadas. Invoala se sitúa en el punto ideal — completo
                en funciones y verdaderamente gratis.
              </p>
              <p>
                A diferencia de las plantillas de hojas de cálculo, Invoala
                maneja el formato, el cálculo de impuestos y la generación
                de PDF automáticamente. A diferencia de herramientas pagas
                como FreshBooks o QuickBooks, no hay suscripción, sin
                tarifa por factura y sin restricción de funciones.
              </p>
              <p>
                Obtienes facturas profesionales, gestión de clientes,
                seguimiento de pagos, redacción con IA y soporte para 154
                monedas — todo sin ingresar una tarjeta de crédito.
              </p>
            </div>
          </section>

          {/* CTA */}
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 text-center">
            <h2 className="text-[24px] font-bold tracking-tight">
              ¿Listo para simplificar tu facturación?
            </h2>
            <p className="mt-2 text-[16px] text-[#6b7280]">
              Crea tu primera factura profesional en menos de dos minutos.
              No se requiere registro.
            </p>
            <Link
              href="/#generate"
              className="mt-6 inline-block rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0f3d22]"
            >
              Crear Factura
            </Link>
          </section>

          {/* Related links */}
          <section className="mb-20 border-t border-[#e5e7eb] pt-8">
            <h3 className="text-[16px] font-semibold">Páginas relacionadas</h3>
            <ul className="mt-3 space-y-2 text-[15px]">
              <li>
                <Link href="/online-invoicing" className="text-[#166534] hover:underline">
                  Facturación en Línea
                </Link>
              </li>
              <li>
                <Link href={localizedPath("/invoice-generator", "es")} className="text-[#166534] hover:underline">
                  Generador de Facturas
                </Link>
              </li>
              <li>
                <Link href="/receipt-generator" className="text-[#166534] hover:underline">
                  Generador de Facturas Gratis
                </Link>
              </li>
              <li>
                <Link href="/invoice-maker" className="text-[#166534] hover:underline">
                  Creador de Facturas
                </Link>
              </li>
              <li>
                <Link href="/invoicing-for-freelancers" className="text-[#166534] hover:underline">
                  Facturación para Freelancers
                </Link>
              </li>
            </ul>
          </section>

          {/* FAQ */}
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Preguntas frecuentes
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

      <SeoFooter locale="es" />
    </>
  );
}
