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
    title: "Generador de Recibos — Crea Recibos Profesionales Gratis",
    description:
      "Crea un recibo profesional en segundos. Registra pagos, muestra qué se pagó y cuándo, y descarga un recibo en PDF listo para imprimir. Gratis, sin registro.",
    path: "/es/receipt-generator",
    keywords: [
      "generador de recibos",
      "creador de recibos gratis",
      "crear recibo",
      "recibo de pago",
      "recibo de venta",
    ],
    ogDescription:
      "Crea un recibo profesional en segundos. Registra pagos y descarga un PDF listo para imprimir. Gratis, sin registro.",
    hreflang: hreflangAlternates("/receipt-generator"),
    ogLocale: "es_ES",
  });
}

const faqs = [
  {
    q: "¿Cuál es la diferencia entre una factura y un recibo?",
    a: "Una factura solicita el pago; un recibo confirma que el pago fue recibido. Después de que un cliente pague tu factura, envía un recibo que muestre el monto pagado, la fecha y el concepto.",
  },
  {
    q: "¿Cuándo debo enviar un recibo?",
    a: "Envía un recibo cada vez que recibas un pago — parcial o total. Los clientes a menudo necesitan recibos para su propia contabilidad, informes de gastos y registros fiscales.",
  },
  {
    q: "¿Este generador de recibos es gratis?",
    a: "Sí. Crea recibos ilimitados sin marca de agua y sin registro. Completa el formulario, previsualízalo en vivo y descarga un PDF listo para imprimir.",
  },
  {
    q: "¿Puedo agregar mi logotipo y datos del negocio?",
    a: "Sí. Sube tu logotipo, indica el nombre de tu negocio, dirección y correo electrónico. Tu recibo incluye una marca de PAGADO y un desglose detallado limpio.",
  },
  {
    q: "¿Los recibos necesitan un número de factura?",
    a: "Los recibos normalmente referencian su propio número o la factura a la que corresponden. Usa el campo de número para un número de recibo (ej. RCPT-001) o agrega el número de factura como un campo personalizado.",
  },
  {
    q: "¿Puedo registrar pagos parciales?",
    a: "Sí. Enumera solo los artículos o montos cubiertos por este pago. Para un pago parcial, anota el saldo restante en la sección de notas.",
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

export default async function ReceiptGeneratorPageEs() {
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
              Generador de Recibos
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              Confirma cada pago con un recibo profesional. El generador de
              abajo está configurado en modo recibo — agrega qué se pagó,
              cuándo y por quién, luego descarga un PDF pulido.
            </p>
            <p className="mt-4 text-[14px] text-[#9ca3af]">
              Gratis para siempre &middot; Sin registro &middot; Sin marca de agua
            </p>
          </section>

          <section className="mb-20">
            <InvoiceGenerator
              user={user ? { email: user.email } : null}
              preset={{
                docType: "receipt",
                invoiceNumber: "RCPT-001",
                notes: "¡Gracias por tu preferencia!",
              }}
              ai={false}
              quoteMode
            />
          </section>

          <section className="mb-20 mx-auto max-w-[1024px]">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              De factura a recibo en un solo paso
            </h2>
            <div className="mt-8 grid gap-12 sm:grid-cols-3">
              {[
                {
                  n: "01",
                  title: "Registra el pago",
                  desc: "Ingresa qué se pagó y cuándo. El recibo muestra la fecha de pago en lugar de una fecha de vencimiento.",
                },
                {
                  n: "02",
                  title: "Detalla lo que se cubrió",
                  desc: "Enumera los productos o servicios que cubre el pago, igual que en la factura original.",
                },
                {
                  n: "03",
                  title: "Descarga y envía",
                  desc: "Obtén un recibo en PDF listo para imprimir con una marca de PAGADO. Envíalo por correo o entrégalo en persona.",
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
              ¿Por qué enviar recibos?
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              {[
                {
                  title: "Comprobante de pago",
                  desc: "Los recibos documentan que hubo un intercambio de dinero — protegiéndote a ti y a tu cliente si surgen preguntas más adelante.",
                },
                {
                  title: "Los clientes los esperan",
                  desc: "Los clientes empresariales necesitan recibos para informes de gastos y declaraciones fiscales. Enviar uno automáticamente hace que sea fácil trabajar contigo.",
                },
                {
                  title: "Registros claros",
                  desc: "Un historial numerado de recibos facilita la conciliación en época de impuestos, especialmente para pagos en efectivo y con tarjeta.",
                },
                {
                  title: "Seguimiento profesional",
                  desc: "Confirmar el pago con un recibo es un toque profesional que cierra la transacción con broche de oro.",
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
                <Link href="/estimate-generator" className="text-[#166534] hover:underline">
                  Generador de Presupuestos
                </Link>
              </li>
              <li>
                <Link href="/learn/invoice-vs-receipt" className="text-[#166534] hover:underline">
                  Factura vs Recibo: ¿Cuál es la Diferencia?
                </Link>
              </li>
              <li>
                <Link href="/invoice-payment-tracking" className="text-[#166534] hover:underline">
                  Seguimiento de Pagos de Facturas
                </Link>
              </li>
              <li>
                <Link href="/learn/how-to-track-unpaid-invoices" className="text-[#166534] hover:underline">
                  Cómo Rastrear Facturas Impagas
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
