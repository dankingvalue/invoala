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
    title: "Creador de Facturas — Crea Facturas Profesionales en Segundos",
    description:
      "Invoala es un creador de facturas que te ayuda a crear facturas profesionales en segundos. Rápido, gratis y sin necesidad de registro. Descarga un PDF pulido ahora.",
    path: "/es/invoice-maker",
    keywords: [
      "creador de facturas",
      "hacer una factura",
      "crear factura",
      "factura profesional",
      "generador de facturas",
    ],
    ogDescription:
      "Invoala es un creador de facturas que te ayuda a crear facturas profesionales en segundos. Rápido, gratis y sin necesidad de registro.",
    hreflang: hreflangAlternates("/invoice-maker"),
    ogLocale: "es_ES",
  });
}

const faqs = [
  {
    q: "¿Qué tan rápido puedo hacer una factura con Invoala?",
    a: "La mayoría de los usuarios crean una factura completa en menos de dos minutos. Si ya guardaste los datos de tu negocio y cliente antes, toma aún menos tiempo — solo selecciona un cliente y agrega tus artículos.",
  },
  {
    q: "¿El creador de facturas es gratis?",
    a: "Sí. El creador de facturas de Invoala es completamente gratis — sin pruebas, sin muros de pago, sin marcas de agua. Crea facturas ilimitadas y descarga PDFs profesionales sin pagar nada.",
  },
  {
    q: "¿Necesito habilidades técnicas para hacer una factura?",
    a: "Para nada. El creador de facturas usa un formulario simple — completa tus datos, agrega artículos y haz clic en descargar. Sin habilidades de diseño, sin fórmulas de hojas de cálculo, sin curva de aprendizaje.",
  },
  {
    q: "¿Puedo personalizar la apariencia de mi factura?",
    a: "Sí. Agrega tu logotipo, elige tu moneda, establece tu tasa de impuesto e incluye notas de pago. El creador de facturas maneja el diseño profesional automáticamente.",
  },
  {
    q: "¿Qué formato de archivo produce el creador de facturas?",
    a: "PDF — un documento A4 limpio y listo para imprimir que se ve igual en todos los dispositivos y se imprime perfectamente en cualquier impresora. Adjúntalo a un correo o imprímelo directamente.",
  },
  {
    q: "¿Puedo hacer facturas en diferentes monedas?",
    a: "Sí. Invoala admite 154 monedas mundiales. Selecciona tu moneda del menú desplegable y el creador de facturas formatea el símbolo y los decimales automáticamente.",
  },
  {
    q: "¿En qué se diferencia esto de usar Word o Excel?",
    a: "Word y Excel requieren formato manual y configuración de fórmulas. El creador de facturas de Invoala está diseñado específicamente para esto — obtienes totales automáticos, cálculo de impuestos, formato profesional y descarga en PDF en un solo paso.",
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

export default async function InvoiceMakerPageEs() {
  const user = await getCurrentUser();

  return (
    <>
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
        <div className="mx-auto max-w-[1200px] px-6">
          {/* Hero */}
          <section className="mb-12 text-center">
            <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[56px]">
              Creador de Facturas — Crea Facturas Profesionales en Segundos
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              La forma más rápida de hacer una factura profesional. Sin
              curva de aprendizaje, sin registro, sin límites. Solo
              completa el formulario y descarga un PDF pulido.
            </p>
            <p className="mt-4 text-[14px] text-[#9ca3af]">
              Gratis para siempre &middot; Sin registro &middot; No se requiere tarjeta de crédito
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
              Haz facturas en segundos, no minutos
            </h2>
            <div className="mt-8 grid gap-12 sm:grid-cols-3">
              {[
                {
                  n: "01",
                  title: "Escribe tus datos",
                  desc: "Nombre del negocio, datos del cliente, artículos. El formulario es corto e intuitivo — no se necesita capacitación.",
                },
                {
                  n: "02",
                  title: "Mira la vista previa",
                  desc: "Observa cómo tu factura toma forma en tiempo real mientras escribes. Ajusta cualquier cosa antes de descargar.",
                },
                {
                  n: "03",
                  title: "Descarga el PDF",
                  desc: "Un clic te da una factura A4 lista para imprimir. Envíasela a tu cliente y cobra.",
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
              ¿Por qué usar un creador de facturas en vez de una hoja de cálculo?
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              {[
                {
                  title: "Sin fórmulas que mantener",
                  desc: "Las hojas de cálculo se rompen cuando agregas filas o cambias tasas de impuesto. Un creador de facturas maneja las matemáticas automáticamente.",
                },
                {
                  title: "Resultado profesional",
                  desc: "Las hojas de cálculo se ven como hojas de cálculo. Un creador de facturas produce un PDF limpio que parece hecho por un diseñador.",
                },
                {
                  title: "Flujo de trabajo más rápido",
                  desc: "Sin configuración, sin plantillas que ajustar. Abre la herramienta, completa el formulario y descarga — listo en minutos.",
                },
                {
                  title: "Sin gestión de archivos",
                  desc: "Sin guardar, nombrar u organizar archivos .xlsx. Tu factura se genera desde cero cada vez y se descarga como PDF.",
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
              Todo lo que incluye el creador de facturas
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Carga de logotipo",
                  desc: "Agrega el logotipo de tu negocio para un look de marca.",
                },
                {
                  title: "Redacción con IA",
                  desc: "Describe el trabajo y la IA crea la factura por ti.",
                },
                {
                  title: "Matemáticas de impuestos",
                  desc: "IVA, GST o impuesto sobre ventas — calculado automáticamente.",
                },
                {
                  title: "154 monedas",
                  desc: "Factura clientes en todo el mundo con formato correcto.",
                },
                {
                  title: "Vista previa en vivo",
                  desc: "Ve cómo se actualiza tu factura en tiempo real mientras escribes.",
                },
                {
                  title: "Exportación a PDF",
                  desc: "Formato A4 listo para imprimir en cualquier dispositivo o impresora.",
                },
                {
                  title: "Guardado de clientes",
                  desc: "Almacena datos de clientes para facturar más rápido en el futuro.",
                },
                {
                  title: "Términos de pago",
                  desc: "Establece fechas de vencimiento, métodos y notas de recargo por atraso.",
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
              Haz tu primera factura ahora
            </h2>
            <p className="mt-2 text-[16px] text-[#6b7280]">
              Desplázate hacia arriba al creador de facturas y comienza a
              completar tus datos. Un PDF profesional está a solo unos
              clics.
            </p>
            <Link
              href="/#generate"
              className="mt-6 inline-block rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0f3d22]"
            >
              Crear Factura
            </Link>
          </section>

          {/* Related links */}
          <section className="mb-20 mx-auto max-w-[1024px] border-t border-[#e5e7eb] pt-8">
            <h3 className="text-[16px] font-semibold">Páginas relacionadas</h3>
            <ul className="mt-3 space-y-2 text-[15px]">
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
                <Link href={localizedPath("/online-invoicing", "es")} className="text-[#166534] hover:underline">
                  Facturación en Línea
                </Link>
              </li>
              <li>
                <Link href={localizedPath("/invoicing-software", "es")} className="text-[#166534] hover:underline">
                  Software de Facturación
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
          <section className="mb-20 mx-auto max-w-[1024px]">
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
