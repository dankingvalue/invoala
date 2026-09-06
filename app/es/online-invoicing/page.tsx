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
    title: "Facturación en Línea — Crea y Envía Facturas desde Cualquier Lugar",
    description:
      "Crea y envía facturas profesionales desde cualquier dispositivo con la herramienta gratuita de facturación en línea de Invoala. Sin software que instalar — solo abre tu navegador y empieza a facturar.",
    path: "/es/online-invoicing",
    keywords: [
      "facturación en línea",
      "factura en línea",
      "crear factura en línea",
      "enviar factura en línea",
      "facturación en línea gratis",
    ],
    ogDescription:
      "Crea y envía facturas profesionales desde cualquier dispositivo con la herramienta gratuita de facturación en línea de Invoala. Sin software que instalar.",
    hreflang: hreflangAlternates("/online-invoicing"),
    ogLocale: "es_ES",
  });
}

const faqs = [
  {
    q: "¿Qué es la facturación en línea?",
    a: "La facturación en línea te permite crear y enviar facturas a través de un navegador web en lugar de software de escritorio. Completas un formulario, la herramienta genera un PDF profesional, y puedes descargarlo o enviarlo por correo directamente a tu cliente.",
  },
  {
    q: "¿Es segura la facturación en línea?",
    a: "Sí. Invoala procesa todo en tu navegador — tus datos nunca tocan un servidor a menos que elijas guardarlos. Los datos de tu negocio e información de clientes permanecen en tu dispositivo.",
  },
  {
    q: "¿Puedo usar la facturación en línea en mi teléfono?",
    a: "Por supuesto. Invoala funciona en cualquier dispositivo con navegador web — teléfono, tableta o laptop. La interfaz se adapta al tamaño de tu pantalla para que puedas facturar desde cualquier lugar.",
  },
  {
    q: "¿Necesito instalar algo para la facturación en línea?",
    a: "No. La facturación en línea funciona completamente en tu navegador. No hay nada que descargar, instalar o actualizar. Solo abre el sitio web y empieza a crear facturas.",
  },
  {
    q: "¿Qué tan rápido puedo enviar una factura en línea?",
    a: "La mayoría de los usuarios crean y descargan una factura en menos de dos minutos. Si ya guardaste los datos de tu cliente antes, es aún más rápido — solo selecciona el cliente y agrega tus artículos.",
  },
  {
    q: "¿Puedo rastrear facturas en línea después de enviarlas?",
    a: "Sí. Invoala te permite marcar facturas como pagadas, pendientes o vencidas para que siempre sepas tu estado de pago. Puedes ver todas tus facturas y su estado en una sola vista.",
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

export default function OnlineInvoicingPageEs() {
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
              Facturación en Línea — Crea y Envía Facturas desde Cualquier Lugar
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              Tu laptop, tu teléfono, tu tableta — crea facturas
              profesionales en cualquier dispositivo con conexión a
              internet. Sin software que instalar, sin archivos que
              sincronizar.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                href="/#generate"
                className="rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0f3d22]"
              >
                Empieza a facturar ahora
              </Link>
              <Link
                href={localizedPath("/invoice-generator", "es")}
                className="text-[16px] font-medium text-[#166534] hover:underline"
              >
                Mira cómo funciona &rsaquo;
              </Link>
            </div>
          </section>

          {/* What is online invoicing */}
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              ¿Qué es la facturación en línea?
            </h2>
            <div className="mt-6 space-y-4 text-[16px] leading-relaxed text-[#374151]">
              <p>
                La facturación en línea significa crear, enviar y
                gestionar facturas a través de un navegador web. En lugar
                de depender de software de escritorio o plantillas de
                hojas de cálculo, usas una herramienta en línea dedicada
                que se encarga del formato, los cálculos y la generación
                de PDF por ti.
              </p>
              <p>
                La mayor ventaja es la accesibilidad. Puedes crear una
                factura desde cualquier dispositivo — tu computadora de
                oficina, tu laptop en casa o tu teléfono mientras estás
                en un trabajo. No hay nada que instalar, nada que
                actualizar y nada que sincronizar entre dispositivos.
              </p>
              <p>
                Invoala lleva esto más lejos manteniendo todos tus datos
                en tu navegador. Nada se sube a un servidor a menos que
                elijas guardarlo en una cuenta, así que la información de
                tu negocio permanece privada.
              </p>
            </div>
          </section>

          {/* Benefits */}
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 md:p-12">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Beneficios de la facturación en línea con Invoala
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              {[
                {
                  title: "Acceso desde cualquier lugar",
                  desc: "Crea facturas desde cualquier dispositivo con navegador. Trabaja desde casa, la oficina o el sitio de un cliente — tu facturación va contigo.",
                },
                {
                  title: "Sin software que instalar",
                  desc: "Evita las descargas, actualizaciones y dolores de cabeza de compatibilidad. La facturación en línea funciona completamente en tu navegador.",
                },
                {
                  title: "Entrega instantánea",
                  desc: "Descarga un PDF y envíalo por correo a tu cliente en segundos. Sin imprimir, sin escanear, sin demoras postales.",
                },
                {
                  title: "Siempre actualizado",
                  desc: "Siempre usas la última versión. Sin notas de parche, sin avisos de actualización, sin retraso en las funciones.",
                },
                {
                  title: "Funciona en cualquier dispositivo",
                  desc: "El diseño responsivo hace que la experiencia de facturación sea fluida en teléfonos, tabletas y computadoras por igual.",
                },
                {
                  title: "Sin pérdida de datos",
                  desc: "Los datos de tu factura se guardan automáticamente en el almacenamiento local de tu navegador. Cierra la pestaña, vuelve más tarde — sigue ahí.",
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

          {/* How it works */}
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Cómo funciona la facturación en línea
            </h2>
            <div className="mt-8 grid gap-12 sm:grid-cols-3">
              {[
                {
                  n: "01",
                  title: "Abre Invoala",
                  desc: "Navega al generador de facturas en tu navegador. No se necesita registro — estás listo para empezar de inmediato.",
                },
                {
                  n: "02",
                  title: "Completa los datos",
                  desc: "Agrega la información de tu negocio, datos del cliente, artículos y tasa de impuesto. El formulario guarda tu información para la próxima vez.",
                },
                {
                  n: "03",
                  title: "Descarga y envía",
                  desc: "Haz clic en descargar para obtener un PDF profesional. Adjúntalo a un correo, envíalo a través de Invoala o comparte un enlace.",
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

          {/* Security */}
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 md:p-12">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              ¿Es segura la facturación en línea?
            </h2>
            <div className="mt-6 space-y-4 text-[16px] leading-relaxed text-[#374151]">
              <p>
                La seguridad es una preocupación principal al manejar
                datos de negocios y clientes en línea. Invoala aborda
                esto procesando todo localmente en tu navegador. Cuando
                escribes los detalles de la factura, nunca salen de tu
                dispositivo.
              </p>
              <p>
                Tus datos se almacenan en el almacenamiento local de tu
                navegador — no en nuestros servidores. Esto significa
                que incluso si los servidores de Invoala fueran
                comprometidos, la información de tu negocio no estaría
                en riesgo porque nunca se subió en primer lugar.
              </p>
              <p>
                Si eliges crear una cuenta y guardar facturas en la nube,
                los datos se cifran en tránsito (HTTPS) y en reposo.
                Mantienes el control de lo que se almacena y lo que
                permanece local.
              </p>
            </div>
          </section>

          {/* Features */}
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Funciones de facturación en línea
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "PDFs profesionales",
                  desc: "Descarga facturas A4 limpias y listas para imprimir con tu logotipo, artículos y desglose de impuestos.",
                },
                {
                  title: "Redacción con IA",
                  desc: "Describe el trabajo en palabras simples y la IA crea una factura terminada con artículos y totales.",
                },
                {
                  title: "154 monedas",
                  desc: "Factura clientes en todo el mundo con símbolos de moneda correctos y formato decimal automático.",
                },
                {
                  title: "Cálculos de impuestos",
                  desc: "Ingresa tu tasa de IVA, GST o impuesto sobre ventas y los totales se actualizan en vivo mientras escribes.",
                },
                {
                  title: "Gestión de clientes",
                  desc: "Guarda los datos de clientes y selecciónalos de un menú desplegable en facturas futuras.",
                },
                {
                  title: "Seguimiento de pagos",
                  desc: "Marca facturas como pagadas, pendientes o vencidas para mantener tu flujo de caja visible.",
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
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 text-center">
            <h2 className="text-[24px] font-bold tracking-tight">
              Empieza a facturar en línea — gratis, hoy
            </h2>
            <p className="mt-2 text-[16px] text-[#6b7280]">
              Sin registro, sin tarjeta de crédito, sin límites. Crea tu
              primera factura ahora mismo.
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
                <Link href="/invoicing-software" className="text-[#166534] hover:underline">
                  Software de Facturación
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
