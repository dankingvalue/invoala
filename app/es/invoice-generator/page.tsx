import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { hreflangAlternates, localizedPath } from "@/lib/i18n";
import { SeoFooter } from "@/components/seo/SeoPage";
import { SeoNavMobile } from "@/components/SeoNavMobile";
import { SetHtmlLang } from "@/components/SetHtmlLang";
import { InvoiceGenerator } from "@/components/InvoiceGenerator";
import { getCurrentUser } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Generador de Facturas Gratis — Crea Facturas Profesionales en Línea",
    description:
      "Usa el generador de facturas gratuito de Invoala para crear facturas profesionales en segundos. No necesitas registrarte — solo completa el formulario y descarga un PDF pulido.",
    path: "/es/invoice-generator",
    keywords: [
      "generador de facturas",
      "generador de facturas gratis",
      "generador de facturas en línea",
      "crear facturas",
    ],
    ogDescription:
      "Usa el generador de facturas gratuito de Invoala para crear facturas profesionales en segundos. No necesitas registrarte.",
    hreflang: hreflangAlternates("/invoice-generator"),
    ogLocale: "es_ES",
  });
}

const faqs = [
  {
    q: "¿Cómo uso el generador de facturas?",
    a: "Completa los datos de tu negocio, agrega la información de tu cliente, ingresa los artículos con cantidades y tarifas, establece una tasa de impuesto si es necesario, y haz clic en descargar. Obtendrás un PDF profesional en segundos.",
  },
  {
    q: "¿El generador de facturas es realmente gratis?",
    a: "Sí. No hay tarifas ocultas, sin marcas de agua y sin límites. Crea todas las facturas que necesites, para siempre.",
  },
  {
    q: "¿Necesito crear una cuenta para usar el generador?",
    a: "No. El generador de facturas funciona al instante sin necesidad de registro. Abre la página, completa tus datos y descarga tu factura.",
  },
  {
    q: "¿Puedo agregar mi logotipo a la factura?",
    a: "Sí. Haz clic en el área de carga de logotipo en el formulario para agregar el logotipo de tu negocio. Aparece en la parte superior de cada factura para un aspecto profesional.",
  },
  {
    q: "¿Qué monedas admite el generador?",
    a: "Invoala admite 154 monedas mundiales, incluyendo USD, EUR, GBP, JPY, CAD, AUD y muchas más. La factura formatea automáticamente el símbolo de la moneda y los decimales.",
  },
  {
    q: "¿El generador calcula impuestos?",
    a: "Sí. Ingresa tu tasa de impuesto (IVA, GST, impuesto sobre ventas) y el total se actualiza en vivo mientras escribes. Puedes ver el desglose en la vista previa.",
  },
  {
    q: "¿Puedo guardar mis facturas?",
    a: "Tus datos se guardan automáticamente en el almacenamiento local de tu navegador. Si creas una cuenta gratuita, también puedes guardar facturas en la nube y acceder a ellas desde cualquier dispositivo.",
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

export default async function InvoiceGeneratorPageEs() {
  const user = await getCurrentUser();

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
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/dashboard?tab=general"
                className="hidden rounded-lg border border-[#e5e7eb] px-4 py-2 text-[14px] font-semibold text-[#111827] transition hover:border-[#166534] hover:text-[#166534] md:block"
              >
                Panel
              </Link>
            ) : null}
            <Link
              href="/#generate"
              className="rounded-lg bg-[#14532d] px-5 py-2 text-[14px] font-semibold text-white transition hover:bg-[#0f3d22]"
            >
              Crear Factura
            </Link>
            <SeoNavMobile locale="es" />
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-16">
        <div className="mx-auto max-w-[1200px] px-6">
          {/* Hero */}
          <section className="mb-12 text-center">
            <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[56px]">
              Generador de Facturas Gratis
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              Crea facturas profesionales en segundos. Sin registro, sin
              tarjeta de crédito, sin marcas de agua. Solo un PDF limpio
              listo para enviar a tu cliente.
            </p>
          </section>

          {/* Embedded generator */}
          <section className="mb-20">
            <InvoiceGenerator
              user={user ? { email: user.email } : null}
            />
          </section>

          {/* How to use */}
          <section className="mb-20 mx-auto max-w-[1024px]">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Cómo usar el generador de facturas
            </h2>
            <div className="mt-8 grid gap-12 sm:grid-cols-3">
              {[
                {
                  n: "01",
                  title: "Agrega tus datos",
                  desc: "Ingresa el nombre de tu negocio, correo electrónico y dirección. Sube tu logotipo para un toque profesional.",
                },
                {
                  n: "02",
                  title: "Describe tu trabajo",
                  desc: "Agrega artículos con descripciones, cantidades y tarifas. O usa IA para redactarlos a partir de texto simple.",
                },
                {
                  n: "03",
                  title: "Descarga el PDF",
                  desc: "Haz clic en el botón de descarga para obtener una factura A4 pulida. Adjúntala a un correo y envíasela a tu cliente.",
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

          {/* What's included */}
          <section className="mb-20 mx-auto max-w-[1024px] rounded-xl bg-[#f3f4f6] p-8 md:p-12">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Qué incluye cada factura
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Diseño profesional",
                  desc: "Tipografía y espaciado limpios que hacen que tu trabajo se vea premium.",
                },
                {
                  title: "Tu marca",
                  desc: "Agrega tu logotipo y datos del negocio para una experiencia de marca consistente.",
                },
                {
                  title: "Artículos de línea",
                  desc: "Desglose detallado de servicios o productos con cantidades y tarifas.",
                },
                {
                  title: "Desglose de impuestos",
                  desc: "Cálculo automático de IVA, GST o impuesto sobre ventas con un resumen claro.",
                },
                {
                  title: "Términos de pago",
                  desc: "Fechas de vencimiento, métodos de pago y notas para que los clientes sepan exactamente cómo pagar.",
                },
                {
                  title: "PDF listo para imprimir",
                  desc: "Formato A4 que se imprime perfectamente y se ve igual en todos los dispositivos.",
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
              ¿Listo para crear tu factura?
            </h2>
            <p className="mt-2 text-[16px] text-[#6b7280]">
              Desplázate hacia arriba y comienza a completar el formulario.
              Tu primera factura profesional está a minutos de distancia.
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
                <Link href="/receipt-generator" className="text-[#166534] hover:underline">
                  Generador de Recibos
                </Link>
              </li>
              <li>
                <Link href="/invoice-maker" className="text-[#166534] hover:underline">
                  Creador de Facturas
                </Link>
              </li>
              <li>
                <Link href="/online-invoicing" className="text-[#166534] hover:underline">
                  Facturación en Línea
                </Link>
              </li>
              <li>
                <Link href="/invoicing-software" className="text-[#166534] hover:underline">
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
