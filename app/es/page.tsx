import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { hreflangAlternates, localizedPath } from "@/lib/i18n";
import { SetHtmlLang } from "@/components/SetHtmlLang";
import { Reveal } from "@/components/Reveal";
import { LazyInvoiceGenerator } from "@/components/LazyInvoiceGenerator";
import { TrustStrip } from "@/components/TrustStrip";
import { CURRENCIES } from "@/lib/invoice";
import { getFlags } from "@/lib/flags.server";
import { ProPricing } from "@/components/ProPricing";
import { ProductShowcase } from "@/components/ProductShowcase";
import { getCurrentUser } from "@/lib/server-auth";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Invoala — Generador de Facturas Gratis para Freelancers",
    description:
      "Crea facturas profesionales en línea gratis. Agrega artículos, impuestos y tu logotipo, luego descarga un PDF pulido en segundos. Sin registro. Sin marca de agua.",
    path: "/es/",
    keywords: [
      "generador de facturas gratis",
      "creador de facturas",
      "plantilla de factura",
      "factura freelance",
      "factura en pdf",
      "facturación en línea",
    ],
    hreflang: hreflangAlternates("/"),
    ogLocale: "es_ES",
  });
}

const faqs = [
  {
    q: "¿Invoala es realmente gratis?",
    a: "Sí. Crea, previsualiza y descarga facturas ilimitadas gratis — sin pruebas, sin muros de pago, sin marcas de agua en tus PDFs.",
  },
  {
    q: "¿Necesito crear una cuenta?",
    a: "No. No hay registro ni correo requerido. Abre la página, completa tus datos y descarga tu factura.",
  },
  {
    q: "¿Dónde se almacenan mis datos?",
    a: "Todo lo que escribes se guarda solo localmente en tu navegador. Nada se sube a un servidor, así que los datos de tu negocio permanecen privados.",
  },
  {
    q: "¿Qué obtengo al descargar?",
    a: "Un PDF A4 limpio y profesional con tu logotipo, artículos, desglose de impuestos y notas de pago — listo para enviar por correo a cualquier cliente.",
  },
  {
    q: "¿Puedo usarlo también para presupuestos o recibos?",
    a: "Por supuesto. Cambia las fechas y descripciones de artículos para enviar presupuestos antes de un proyecto, o recibos después del pago.",
  },
  {
    q: "¿Qué monedas se admiten?",
    a: "154 monedas mundiales incluyendo USD, EUR, GBP, JPY, CAD, AUD y más. La factura formatea el símbolo y los decimales automáticamente.",
  },
  {
    q: "¿Puedo agregar mi propio logotipo?",
    a: "Sí. Sube tu logotipo y aparecerá en la parte superior de cada factura. Los usuarios gratuitos obtienen un PDF sin marca de agua.",
  },
  {
    q: "¿Calcula impuestos automáticamente?",
    a: "Sí. Ingresa tu tasa de impuesto (IVA, GST, impuesto sobre ventas) y el total se actualiza en vivo mientras escribes.",
  },
  {
    q: "¿Puedo guardar clientes para reutilizarlos?",
    a: "Sí. Guarda los datos del cliente una vez y selecciónalos de un menú desplegable en facturas futuras. Todos los datos permanecen en tu navegador.",
  },
  {
    q: "¿Qué formato de archivo exporta?",
    a: "PDF — formato A4 listo para imprimir que se ve igual en todos los dispositivos y se imprime perfectamente en cualquier impresora.",
  },
  {
    q: "¿Hay un límite de cuántas facturas puedo crear?",
    a: "Sin límite. Crea tantas como quieras, para siempre. No hay topes diarios ni mensuales.",
  },
  {
    q: "¿En qué se diferencia esto de Excel o Google Sheets?",
    a: "Invoala está diseñado específicamente para facturación. Obtienes totales en vivo, cálculo automático de impuestos, formato profesional y descarga en PDF — todo en un solo paso. Sin fórmulas, sin plantillas que configurar.",
  },
  {
    q: "¿Los freelancers pueden usar esto?",
    a: "Por supuesto. Invoala está hecho para freelancers, consultores y operadores independientes que quieren facturas profesionales sin pagar por software.",
  },
  {
    q: "¿Admiten facturas recurrentes?",
    a: "Puedes guardar tus datos e información de clientes para reutilizarlos rápidamente. La programación completa de facturas recurrentes está disponible en el plan Pro.",
  },
];

const features = [
  {
    title: "PDFs pulidos",
    copy: "Voilà — listos para el cliente en el momento en que descargas. PDFs A4 impecables que hacen que el trabajo individual se vea como el de una agencia.",
    glyph: (
      <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm7 1.5V9h4.5M9 13h6m-6 4h6" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    ),
  },
  {
    title: "Listo en segundos",
    copy: "Sin cuenta, sin muro de pago, sin esperas. Complétalo, descárgalo, listo — tus datos se guardan en tu propio dispositivo.",
    glyph: (
      <path d="M13 2 4.5 13.5H11L9.5 22 19 10h-6.5L13 2Z" strokeWidth="1.5" strokeLinejoin="round" />
    ),
  },
  {
    title: "Cualquier moneda",
    copy: `Factura a cualquiera, en cualquier lugar — ${CURRENCIES.length} monedas mundiales, cálculo automático de impuestos, formato correcto por defecto.`,
    glyph: (
      <path d="M12 3v18M16.5 7.5c-.8-1.2-2.4-2-4.5-2-2.5 0-4 1.3-4 3.1 0 4.4 9 2.3 9 6.8 0 1.8-1.7 3.1-4.5 3.1-2.3 0-4-.9-4.8-2.2" strokeWidth="1.5" strokeLinecap="round" />
    ),
  },
  {
    title: "Solo descríbelo",
    copy: "Describe el trabajo en palabras simples — la IA lo convierte en una factura terminada, con artículos y totales incluidos.",
    glyph: (
      <path d="M12 2l2.2 6.6L21 11l-6.8 2.4L12 20l-2.2-6.6L3 11l6.8-2.4L12 2Z" strokeWidth="1.5" strokeLinejoin="round" />
    ),
  },
  {
    title: "Todo en un solo lugar",
    copy: "Crea una cuenta gratis e Invoala recuerda a tus clientes, rastrea quién ha pagado y quién está atrasado, y te avisa el momento en que un cliente abre una factura.",
    glyph: (
      <path d="M4 4h7v7H4V4Zm9 0h7v4h-7V4Zm0 7h7v9h-7v-9ZM4 14h7v6H4v-6Z" strokeWidth="1.5" strokeLinejoin="round" />
    ),
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

export const dynamic = "force-dynamic";

export default async function HomeEs() {
  const { flags, announcement } = await getFlags();
  const user = await getCurrentUser();

  if (flags.maintenanceMode) {
    return (
      <div id="top">
        <SetHtmlLang lang="es" />
        <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <h1 className="text-[40px] font-semibold tracking-tight md:text-[56px]">
            Volveremos enseguida.
          </h1>
          <p className="mt-4 max-w-[420px] text-[17px] leading-relaxed text-subtle">
            Invoala está recibiendo una actualización rápida. Recarga en
            unos minutos — tus facturas guardadas están seguras en tu
            dispositivo.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div id="top" className="scroll-mt-20">
      <SetHtmlLang lang="es" />
      <FaqJsonLd />

      <header className="fixed inset-x-0 top-0 z-50 h-[72px] border-b border-[#e5e7eb] bg-white">
        <nav className="mx-auto flex h-full max-w-[1400px] items-center px-5 sm:px-8">
          <Link href="/es" className="flex shrink-0 items-center gap-2.5">
            <svg width="28" height="28" viewBox="0 0 64 64" aria-hidden="true">
              <rect width="64" height="64" rx="14.5" fill="#166534" />
              <path d="M35.5 10 19 37h9.5l-3 17L43 27h-9.5l2-17z" fill="#fff" />
            </svg>
            <span className="text-[17px] font-bold tracking-tight text-ink">Invoala</span>
          </Link>
          <nav className="hidden flex-1 items-center justify-center gap-8 text-[14px] font-medium md:flex">
            <a href="#features" className="text-subtle transition-colors hover:text-ink">Funciones</a>
            <a href="#how" className="text-subtle transition-colors hover:text-ink">Cómo funciona</a>
            <Link href={localizedPath("/pricing", "es")} className="text-subtle transition-colors hover:text-ink">Precios</Link>
            <a href="#faq" className="text-subtle transition-colors hover:text-ink">Preguntas</a>
          </nav>
          <div className="ml-auto flex shrink-0 items-center gap-3 md:ml-0">
            {user ? (
              <Link href="/dashboard?tab=general" className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-[14px] font-semibold text-ink transition hover:border-[#166534] hover:text-[#166534]">
                Panel
              </Link>
            ) : (
              <Link href="/login" className="text-[14px] font-medium text-subtle hover:text-ink">
                Iniciar sesión
              </Link>
            )}
            <a href="#generate" className="rounded-lg bg-[#14532d] px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-[#0f3d22]">
              Crear factura
            </a>
          </div>
        </nav>
      </header>

      <main>
      {announcement ? (
        <div className="mt-20 px-4 pt-4">
          <p className="rounded-lg bg-[#dcfce7] py-2.5 text-center text-[14px] font-medium text-[#166534]">
            {announcement}
          </p>
        </div>
      ) : null}

      {/* Hero */}
      <section className="px-6 pb-20 pt-36 text-center md:pb-28 md:pt-44">
        <Reveal>
          <p className="text-[13px] font-semibold uppercase tracking-wider text-[#166534]">
            Únete a más de 500 freelancers y agencias que ya facturan con Invoala
          </p>
        </Reveal>
        <Reveal>
          <h1 className="mx-auto mt-3 max-w-[900px] text-[48px] font-extrabold leading-[1.05] tracking-tight md:text-[80px]">
            Facturas que se ven
            <span className="block text-[#166534]">profesionales.</span>
          </h1>
        </Reveal>
        <Reveal delay={100}>
          <p className="mx-auto mt-6 max-w-[640px] text-[19px] font-medium leading-relaxed text-subtle md:text-[21px]">
            Voilà — ahora hacer facturas es simple. Crea una factura
            hermosa y descarga un PDF pulido en segundos.
          </p>
        </Reveal>
        <Reveal delay={200}>
          <div className="mt-9 flex items-center justify-center gap-4">
            <a
              href="#generate"
              className="rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white shadow-sm transition hover:bg-[#0f3d22] active:scale-[0.99]"
            >
              Crea tu factura
            </a>
            <a href="#how" className="text-[16px] font-medium text-[#166534] transition-opacity hover:opacity-70">
              Cómo funciona &rsaquo;
            </a>
          </div>
        </Reveal>
        <Reveal delay={300}>
          <p className="mt-6 text-[13px] text-subtle">
            Gratis para siempre &nbsp;·&nbsp; Sin registro &nbsp;·&nbsp; No se requiere tarjeta de crédito
          </p>
        </Reveal>
      </section>

      {/* Social proof */}
      {flags.trustpilotStrip ? <TrustStrip /> : null}

      {/* Generator */}
      <section className="bg-[#f3f4f6] px-6 py-16 md:py-24">
        <div className="mx-auto max-w-[1200px]">
          <Reveal>
            <div className="mb-12 text-center">
              <h2 className="text-[36px] font-extrabold tracking-tight md:text-[52px]">
                Empieza ahora. Toma dos minutos.
              </h2>
              <p className="mt-3 text-[17px] font-medium text-subtle">
                Complétalo una vez — guardamos tus datos para la próxima.{flags.aiComposer ? " O simplemente describe el trabajo y deja que la IA lo redacte." : ""}
              </p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <LazyInvoiceGenerator />
          </Reveal>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-16 px-6 py-16 md:py-28">
        <div className="mx-auto max-w-[1024px]">
          <Reveal>
            <h2 className="mx-auto max-w-[720px] text-center text-[36px] font-extrabold tracking-tight md:text-[52px]">
              Todo lo que necesitas.
              <span className="block text-subtle">Nada que no.</span>
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 100}>
                <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#f0fdf4]">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#166534"
                      aria-hidden="true"
                    >
                      {f.glyph}
                    </svg>
                  </div>
                  <h3 className="text-[18px] font-bold tracking-tight">{f.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-subtle">{f.copy}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Product showcase — a closer look inside */}
      <ProductShowcase />

      {/* How it works */}
      <section id="how" className="scroll-mt-16 bg-[#f3f4f6] px-6 py-16 md:py-28">
        <div className="mx-auto max-w-[1024px]">
          <Reveal>
            <h2 className="max-w-[680px] text-[36px] font-extrabold tracking-tight md:text-[52px]">
              Tres pasos. Listo.
            </h2>
            <p className="mt-3 max-w-[520px] text-[17px] font-medium text-subtle">
              Tú te encargas del trabajo importante. Invoala se encarga del trabajo tedioso.
            </p>
          </Reveal>
          <div className="mt-14 grid gap-12 sm:grid-cols-3">
            {[
              {
                n: "01",
                title: "Agrega tus datos",
                copy: "Tu nombre, logotipo e información del cliente. Los recordamos para tu próxima visita.",
              },
              {
                n: "02",
                title: "Describe el trabajo",
                copy: "Artículos, cantidades, tarifas, impuestos — los totales se actualizan en vivo mientras escribes.",
              },
              {
                n: "03",
                title: "Descarga y envía",
                copy: "Un clic te da un PDF A4 nítido. Adjúntalo, envíalo, cobra.",
              },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 100}>
                <div>
                  <p className="text-[56px] font-extrabold leading-none tracking-tight text-[#166534]/60 md:text-[64px]">
                    {s.n}
                  </p>
                  <h3 className="mt-4 text-[18px] font-bold tracking-tight">{s.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-subtle">{s.copy}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={200}>
            <div className="mt-16 text-center">
              <a
                href="#generate"
                className="rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white shadow-sm transition hover:bg-[#0f3d22] active:scale-[0.99]"
              >
                Crea tu factura
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Pro pricing */}
      {flags.proTeaser ? <ProPricing /> : null}

      {/* SEO content — What makes a good invoice */}
      <section className="px-6 py-16 md:py-28">
        <div className="mx-auto max-w-[1024px]">
          <Reveal>
            <h2 className="text-center text-[36px] font-extrabold tracking-tight md:text-[52px]">
              ¿Qué hace buena a una factura?
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Artículos claros",
                desc: "Cada servicio o producto se enumera por separado con descripción, cantidad y precio. Sin paquetes vagos.",
              },
              {
                title: "Diseño profesional",
                desc: "Tipografía limpia, espaciado adecuado y tu logotipo. Transmite credibilidad y atención al detalle.",
              },
              {
                title: "Términos de pago claros",
                desc: "Neto 15 o Neto 30 — indica cuándo vence el pago. Incluye tu método preferido y cualquier recargo por atraso.",
              },
              {
                title: "Impuesto correcto",
                desc: "Aplica la tasa correcta para tu jurisdicción. Invoala calcula el total automáticamente.",
              },
              {
                title: "Número de factura único",
                desc: "IDs secuenciales (INV-001, INV-002) te ayudan a ti y a tu cliente a rastrear pagos sin confusión.",
              },
              {
                title: "Datos de contacto",
                desc: "Tu nombre, correo y dirección — para que el cliente sepa exactamente a quién pagar y cómo contactarte.",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 80}>
                <div>
                  <h3 className="text-[17px] font-bold tracking-tight">{item.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[#6b7280]">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={300}>
            <div className="mt-14 text-center">
              <a
                href="#generate"
                className="rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white shadow-sm transition hover:bg-[#0f3d22] active:scale-[0.99]"
              >
                Crea una mejor factura
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Internal links — guides */}
      <section className="bg-[#f3f4f6] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-[1024px]">
          <Reveal>
            <h2 className="text-center text-[36px] font-extrabold tracking-tight md:text-[44px]">
              Aprende más
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <Reveal>
              <Link
                href="/how-to-create-invoice"
                className="block rounded-xl border border-[#e5e7eb] bg-white p-6 transition hover:shadow-md"
              >
                <h3 className="text-[18px] font-bold tracking-tight text-[#111827]">
                  Cómo Crear una Factura
                </h3>
                <p className="mt-2 text-[15px] text-[#6b7280]">
                  Guía paso a paso desde la página en blanco hasta el
                  cliente que paga. Cubre artículos, impuestos, términos
                  de pago y envío.
                </p>
                <span className="mt-3 inline-block text-[14px] font-semibold text-[#166534]">
                  Lee la guía &rsaquo;
                </span>
              </Link>
            </Reveal>
            <Reveal delay={100}>
              <Link
                href={localizedPath("/invoice-template", "es")}
                className="block rounded-xl border border-[#e5e7eb] bg-white p-6 transition hover:shadow-md"
              >
                <h3 className="text-[18px] font-bold tracking-tight text-[#111827]">
                  Plantillas de Factura Gratis
                </h3>
                <p className="mt-2 text-[15px] text-[#6b7280]">
                  Plantillas específicas por industria para freelancers,
                  diseñadores, fotógrafos, contratistas y pequeñas
                  empresas.
                </p>
                <span className="mt-3 inline-block text-[14px] font-semibold text-[#166534]">
                  Ver plantillas &rsaquo;
                </span>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-16 px-6 py-16 md:py-28">
        <div className="mx-auto max-w-[720px]">
          <Reveal>
            <h2 className="text-center text-[36px] font-extrabold tracking-tight md:text-[52px]">
              Preguntas. Respondidas.
            </h2>
          </Reveal>
          <div className="mt-12 border-t border-[#e5e7eb]">
            {faqs.map((f, i) => (
              <Reveal key={f.q} delay={i * 60}>
                <details className="faq group border-b border-[#e5e7eb]">
                  <summary className="flex items-center justify-between gap-4 py-5 text-left">
                    <span className="text-[17px] font-semibold tracking-tight">{f.q}</span>
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
                      className="chev shrink-0"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </summary>
                  <p className="-mt-1 pb-6 pr-8 text-[15px] leading-relaxed text-subtle">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e5e7eb] bg-[#f3f4f6] px-6 py-10">
        <div className="mx-auto max-w-[1024px]">
          <div className="flex flex-col items-center justify-between gap-4 text-[13px] text-subtle md:flex-row">
            <div className="flex items-center gap-2 font-bold text-ink">
              <svg width="18" height="18" viewBox="0 0 64 64" aria-hidden="true">
                <rect width="64" height="64" rx="14.5" fill="#166534" />
                <path d="M35.5 10 19 37h9.5l-3 17L43 27h-9.5l2-17z" fill="#fff" />
              </svg>
              Invoala
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <a href="#features" className="transition-colors hover:text-ink">Funciones</a>
              <a href="#faq" className="transition-colors hover:text-ink">Preguntas</a>
              <Link href="/how-to-create-invoice" className="transition-colors hover:text-ink">Guía</Link>
              <Link href={localizedPath("/invoice-template", "es")} className="transition-colors hover:text-ink">Plantillas</Link>
              <Link href="/roadmap" className="transition-colors hover:text-ink">Hoja de ruta</Link>
              <Link href="/privacy" className="transition-colors hover:text-ink">Privacidad</Link>
              <Link href="/terms" className="transition-colors hover:text-ink">Términos</Link>
              <a href="mailto:hello@invoala.com" className="transition-colors hover:text-ink">
                Contacto
              </a>
            </nav>
            <p>&copy; 2026 Invoala. Todos los derechos reservados.</p>
          </div>
          <p className="mt-6 border-t border-[#e5e7eb] pt-5 text-[11px] leading-relaxed text-subtle">
            Invoala es un generador de facturas en línea gratuito para
            freelancers y pequeñas empresas. Crea facturas profesionales
            con tu propio logotipo, artículos, impuestos y múltiples
            monedas — y descárgalas como archivos PDF listos para
            imprimir. No se necesita cuenta y tus datos nunca salen de
            tu navegador.
          </p>
        </div>
        <div className="mx-auto max-w-[1024px] pt-5">
          <TrustStrip />
        </div>
      </footer>
    </div>
  );
}
