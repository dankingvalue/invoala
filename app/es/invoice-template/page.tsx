import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { hreflangAlternates, localizedPath } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Plantilla de Factura Gratis — Descarga y Personaliza",
    description:
      "Plantillas de factura gratuitas para freelancers y pequeñas empresas. Personaliza con tu logotipo, artículos y términos de pago. Descarga en PDF — sin registro.",
    path: "/es/invoice-template",
    keywords: [
      "plantilla de factura",
      "plantilla de factura gratis",
      "plantilla de factura PDF",
      "plantilla de factura para freelancers",
      "plantilla de factura para negocios",
      "plantilla de factura personalizada",
    ],
    ogDescription: "Plantillas de factura gratuitas para freelancers. Personaliza y descarga en PDF.",
    hreflang: hreflangAlternates("/invoice-template"),
    ogLocale: "es_ES",
  });
}

const industries = [
  {
    name: "Freelancers y Consultores",
    description:
      "Factura por trabajo por horas, proyectos fijos o tarifas de retenedor. Incluye alcance del trabajo, horas y tarifa.",
    items: ["Tarifa por hora × horas", "Tarifa fija de proyecto", "Kilometraje / gastos"],
  },
  {
    name: "Diseñadores y Desarrolladores Web",
    description:
      "Detalla las fases de diseño, desarrollo y revisión. Enumera cada entregable por separado.",
    items: ["Diseño UI/UX", "Desarrollo frontend", "Configuración de hosting"],
  },
  {
    name: "Fotógrafos y Videógrafos",
    description:
      "Cobra por sesión, por proyecto o por entregable. Incluye derechos de uso si aplica.",
    items: ["Tarifa de sesión", "Edición / posproducción", "Impresiones / archivos digitales"],
  },
  {
    name: "Contratistas y Oficios",
    description:
      "Desglosa materiales, mano de obra y permisos. Agrega dirección del proyecto y cronograma.",
    items: ["Horas de mano de obra", "Materiales", "Permisos / tarifas"],
  },
  {
    name: "Pequeñas Empresas",
    description:
      "Venta de productos, paquetes de servicios o suscripciones recurrentes. Incluye impuestos donde corresponda.",
    items: ["Producto / SKU", "Paquete de servicio", "Suscripción recurrente"],
  },
];

export default function InvoiceTemplateEs() {
  return (
    <div id="top" className="min-h-screen scroll-mt-20">
      {/* Nav */}
      <nav className="fixed inset-x-0 top-0 z-40 border-b border-[#e5e7eb] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1024px] items-center justify-between px-6">
          <Link href={localizedPath("/", "es")} className="flex items-center gap-2 font-bold text-[#111827]">
            <svg width="20" height="20" viewBox="0 0 64 64" aria-hidden="true">
              <rect width="64" height="64" rx="14.5" fill="#166534" />
              <path d="M35.5 10 19 37h9.5l-3 17L43 27h-9.5l2-17z" fill="#fff" />
            </svg>
            Invoala
          </Link>
          <Link href="/#generate" className="rounded-lg bg-[#14532d] px-5 py-2 text-[14px] font-semibold text-white transition hover:bg-[#0f3d22]">
            Crear Factura
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pb-12 pt-32 md:pt-40">
        <div className="mx-auto max-w-[720px]">
          <p className="text-[14px] font-medium text-[#166534]">Plantillas</p>
          <h1 className="mt-3 text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[56px]">
            Plantilla de Factura Gratis
          </h1>
          <p className="mt-4 text-[18px] leading-relaxed text-[#6b7280]">
            Elige una industria, completa los espacios, descarga un PDF
            pulido. Cada plantilla es gratis — sin registro, sin marca
            de agua, sin límites.
          </p>
          <Link
            href="/#generate"
            className="mt-6 inline-block rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0f3d22]"
          >
            Empieza con una plantilla
          </Link>
        </div>
      </section>

      {/* Industries */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-[720px]">
          <h2 className="text-[28px] font-extrabold tracking-tight">
            Plantillas por Industria
          </h2>
          <p className="mt-2 text-[16px] text-[#6b7280]">
            Cada factura sigue la misma estructura — agrega los
            artículos correctos para tu área.
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
            Toda Buena Factura Incluye
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {[
              {
                title: "Tu información",
                desc: "Nombre, dirección, correo, teléfono — para que el cliente sepa a quién pagar.",
              },
              {
                title: "Información del cliente",
                desc: "A quién le facturas. Nombre, correo y dirección.",
              },
              {
                title: "Número de factura",
                desc: "Un ID único para rastreo. INV-001, INV-002, etc.",
              },
              {
                title: "Fecha y fecha de vencimiento",
                desc: "Cuándo se emitió y cuándo vence el pago.",
              },
              {
                title: "Artículos de línea",
                desc: "Qué hiciste, cuántos y cuánto por unidad.",
              },
              {
                title: "Total e impuestos",
                desc: "Subtotal, porcentaje de impuesto y monto final adeudado.",
              },
              {
                title: "Términos de pago",
                desc: "Neto 15, Neto 30, o al recibirse. Incluye métodos de pago.",
              },
              {
                title: "Notas",
                desc: "Mensaje de agradecimiento, política de recargo por atraso o instrucciones especiales.",
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
            Crea tu factura ahora
          </h2>
          <p className="mt-2 text-[16px] text-[#6b7280]">
            Elige una plantilla, completa tus datos, descarga el PDF.
          </p>
          <Link
            href="/#generate"
            className="mt-6 inline-block rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0f3d22]"
          >
            Crea tu factura
          </Link>
        </div>
      </section>

      {/* Internal links */}
      <section className="border-t border-[#e5e7eb] px-6 py-10">
        <div className="mx-auto max-w-[720px]">
          <h3 className="text-[16px] font-semibold">Sigue leyendo</h3>
          <ul className="mt-3 space-y-2 text-[15px]">
            <li>
              <Link href="/how-to-create-invoice" className="text-[#166534] hover:underline">
                Cómo Crear una Factura — Guía Paso a Paso
              </Link>
            </li>
            <li>
              <Link href="/#features" className="text-[#166534] hover:underline">
                Funciones de Invoala
              </Link>
            </li>
            <li>
              <Link href="/#faq" className="text-[#166534] hover:underline">
                Preguntas Frecuentes
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
          &copy; 2026. Generador de facturas gratis para freelancers.
        </div>
      </footer>
    </div>
  );
}
