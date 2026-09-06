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
    title: "Generador de Presupuestos — Presupuestos de Trabajo Gratis",
    description:
      "Crea un presupuesto de trabajo profesional en segundos. Delimita costos antes de comenzar, gana el proyecto y luego convierte el presupuesto en factura con un clic. Gratis, sin registro.",
    path: "/es/estimate-generator",
    keywords: [
      "generador de presupuestos",
      "creador de presupuestos gratis",
      "presupuesto de trabajo",
      "estimación de costos",
      "plantilla de presupuesto",
    ],
    ogDescription:
      "Crea un presupuesto de trabajo profesional en segundos y conviértelo en factura cuando se apruebe el trabajo. Gratis, sin registro.",
    hreflang: hreflangAlternates("/estimate-generator"),
    ogLocale: "es_ES",
  });
}

const faqs = [
  {
    q: "¿Cuál es la diferencia entre un presupuesto y una cotización?",
    a: "Ambos delimitan costos antes de empezar el trabajo. Un presupuesto suele ser una cifra aproximada que puede cambiar; una cotización es un precio fijo al que el cliente puede exigirte que te ciñas. El modo de presupuesto de Invoala muestra un total estimado y una fecha de validez.",
  },
  {
    q: "¿Qué debe incluir un presupuesto de trabajo?",
    a: "Los datos de tu negocio, los datos del cliente, una descripción del trabajo como artículos de línea, cantidades y tarifas, un total estimado y cuánto tiempo es válido el presupuesto.",
  },
  {
    q: "¿Puedo convertir un presupuesto en una factura?",
    a: "Sí. Cuando el cliente apruebe, haz clic en \"Convertir a factura\" — los mismos artículos se trasladan y se establece automáticamente una fecha de vencimiento. Sin volver a escribir nada.",
  },
  {
    q: "¿Los presupuestos son legalmente vinculantes?",
    a: "Los presupuestos generalmente no son vinculantes a menos que indiques lo contrario. Una cotización se trata como una oferta en firme. Siempre anota un período de validez para que los precios antiguos no vuelvan a perseguirte.",
  },
  {
    q: "¿El generador de presupuestos es gratis?",
    a: "Sí — sin registro, sin marca de agua, sin límites. Descarga tantos PDFs de presupuesto como necesites.",
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

export default async function EstimateGeneratorPageEs() {
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
          <section className="mb-12 text-center">
            <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[56px]">
              Generador de Presupuestos
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              Ponle precio a tu próximo trabajo antes de comenzarlo. El
              generador de abajo está en modo presupuesto — delimita el
              trabajo, establece una fecha de validez y conviértelo en
              factura cuando el cliente diga que sí.
            </p>
            <p className="mt-4 text-[14px] text-[#9ca3af]">
              Gratis para siempre &middot; Sin registro &middot; Sin marca de agua
            </p>
          </section>

          <section className="mb-20">
            <InvoiceGenerator
              user={user ? { email: user.email } : null}
              preset={{
                docType: "estimate",
                invoiceNumber: "EST-001",
                notes: "Este presupuesto es válido por 30 días.",
              }}
              ai={false}
              quoteMode
            />
          </section>

          <section className="mb-20 mx-auto max-w-[1024px]">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Presupuesto &rarr; aprobado &rarr; factura
            </h2>
            <div className="mt-8 grid gap-12 sm:grid-cols-3">
              {[
                {
                  n: "01",
                  title: "Cotiza el trabajo",
                  desc: "Divide el trabajo en artículos de línea con cantidades y tarifas. El total estimado se actualiza en vivo.",
                },
                {
                  n: "02",
                  title: "Envía para aprobación",
                  desc: "Descarga un PDF de presupuesto profesional con fecha de validez. El cliente sabe exactamente qué está aprobando.",
                },
                {
                  n: "03",
                  title: "Convierte al aprobarse",
                  desc: "Haz clic en \"Convertir a factura\" y el presupuesto se convierte en una factura real con fecha de vencimiento — nada que volver a escribir.",
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

          <section className="mb-20 mx-auto max-w-[1024px] rounded-xl bg-[#f3f4f6] p-8 md:p-12">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Presupuestos que ganan trabajo
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              {[
                {
                  title: "Alcance claro, menos disputas",
                  desc: "Un presupuesto detallado por artículos le dice al cliente exactamente por qué está pagando — y qué no está incluido.",
                },
                {
                  title: "Decisiones más rápidas",
                  desc: "El formato profesional y una fecha de validez crean una urgencia sutil sin tácticas de presión.",
                },
                {
                  title: "Precios consistentes",
                  desc: "Usa artículos y clientes guardados para que los trabajos recurrentes se cotícen igual cada vez.",
                },
                {
                  title: "Cero reescritura",
                  desc: "Cuando se aprueba el presupuesto, conviértelo directamente en una factura con los mismos artículos y montos.",
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
                  Generador de Recibos
                </Link>
              </li>
              <li>
                <Link href="/estimates-and-invoices" className="text-[#166534] hover:underline">
                  Presupuestos y Facturas
                </Link>
              </li>
              <li>
                <Link href="/learn/invoice-vs-estimate" className="text-[#166534] hover:underline">
                  Factura vs Presupuesto: Cuándo Enviar Cada Uno
                </Link>
              </li>
              <li>
                <Link href="/templates" className="text-[#166534] hover:underline">
                  Plantillas de Facturas
                </Link>
              </li>
            </ul>
          </section>

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
