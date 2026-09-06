import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { hreflangAlternates, localizedPath } from "@/lib/i18n";
import { SeoFooter } from "@/components/seo/SeoPage";
import { SetHtmlLang } from "@/components/SetHtmlLang";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Facturas Recurrentes — Automatiza la Facturación Repetitiva",
    description:
      "Configura facturas recurrentes para automatizar la facturación repetitiva. Ahorra tiempo, nunca te pierdas un ciclo de facturación y cobra a tiempo con la facturación recurrente gratuita de Invoala.",
    path: "/es/recurring-invoices",
    keywords: [
      "facturas recurrentes",
      "facturación recurrente",
      "facturas automáticas",
      "facturación por suscripción",
      "plantilla de factura recurrente",
    ],
    ogDescription:
      "Configura facturas recurrentes para automatizar la facturación repetitiva. Ahorra tiempo, nunca te pierdas un ciclo de facturación y cobra a tiempo.",
    hreflang: hreflangAlternates("/recurring-invoices"),
    ogLocale: "es_ES",
  });
}

const faqs = [
  {
    q: "¿Qué son las facturas recurrentes?",
    a: "Las facturas recurrentes son facturas generadas automáticamente y enviadas en un horario regular — semanal, mensual, trimestral o anual. En lugar de crear la misma factura manualmente cada período, la configuras una vez y el sistema se encarga del resto.",
  },
  {
    q: "¿Cómo funcionan las facturas recurrentes?",
    a: "Defines la frecuencia de facturación (semanal, mensual, trimestral o anual), los datos del cliente, los artículos de línea y el monto. El sistema crea y envía la factura automáticamente en cada fecha programada sin intervención manual.",
  },
  {
    q: "¿Qué tipos de negocios usan facturas recurrentes?",
    a: "Cualquier negocio con facturación repetitiva se beneficia — agencias con retenedores, empresas SaaS con suscripciones, consultores con contratos continuos, proveedores de mantenimiento, espacios de coworking y administradores de propiedades dependen de las facturas recurrentes.",
  },
  {
    q: "¿Puedo editar una factura recurrente antes de que se envíe?",
    a: "Sí. Puedes revisar y modificar una factura recurrente antes de cada ciclo. Si necesitas cambiar el monto, agregar un nuevo artículo o pausar el programa temporalmente, tienes control total.",
  },
  {
    q: "¿Qué pasa si el método de pago de un cliente expira?",
    a: "La facturación recurrente envía la factura según lo programado, sin importar el método de pago. Verás el estado de la factura como vencida y podrás dar seguimiento al cliente. Si también usas pagos recurrentes, puedes configurar alertas para cargos fallidos.",
  },
  {
    q: "¿Las facturas recurrentes son diferentes de las suscripciones?",
    a: "Están estrechamente relacionadas. Las suscripciones normalmente incluyen el cobro automático del pago. Las facturas recurrentes tratan de generar y enviar automáticamente la factura. Invoala se enfoca en el lado de la facturación, así que tú creas la factura y decides cómo cobrar el pago.",
  },
  {
    q: "¿Puedo configurar facturas recurrentes gratis con Invoala?",
    a: "Sí. El plan gratuito de Invoala incluye la programación de facturas recurrentes. Configura tu cliente, define la frecuencia y los artículos, y deja que Invoala se encargue del resto — no se requiere tarjeta de crédito.",
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

export default function RecurringInvoicesPageEs() {
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
              Facturas Recurrentes — Automatiza la Facturación Repetitiva
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              Deja de enviar la misma factura cada mes. Configura facturas
              recurrentes una vez y deja que Invoala se encargue del resto —
              automáticamente, a tiempo, cada vez.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                href="/#generate"
                className="rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0f3d22]"
              >
                Configura facturas recurrentes
              </Link>
              <Link
                href={localizedPath("/invoice-generator", "es")}
                className="text-[16px] font-medium text-[#166534] hover:underline"
              >
                Mira cómo funciona &rsaquo;
              </Link>
            </div>
          </section>

          {/* What are recurring invoices */}
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              ¿Qué son las facturas recurrentes?
            </h2>
            <div className="mt-6 space-y-4 text-[16px] leading-relaxed text-[#374151]">
              <p>
                Las facturas recurrentes son facturas que se generan y
                envían automáticamente a los clientes según un horario
                establecido. En lugar de crear manualmente la misma
                factura cada semana, mes o trimestre, la configuras una
                vez — datos del cliente, artículos, montos y frecuencia —
                y el sistema se encarga del resto.
              </p>
              <p>
                Piénsalo como configurar una suscripción para tu
                facturación. Ya sea que cobres a un cliente $500 cada mes
                por servicios de retenedor o $200 cada trimestre por
                mantenimiento, las facturas recurrentes aseguran que
                nunca olvides enviar una factura ni te pierdas un ciclo
                de pago.
              </p>
              <p>
                Invoala hace esto sin esfuerzo. Crea una factura,
                establece la frecuencia, y tu cliente la recibe a
                tiempo — sin trabajo manual de tu parte.
              </p>
            </div>
          </section>

          {/* Why use them */}
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 md:p-12">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              ¿Por qué usar facturas recurrentes?
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              {[
                {
                  title: "Ahorra horas cada mes",
                  desc: "La facturación manual para clientes recurrentes es tediosa. Las facturas recurrentes eliminan la repetición — configúralas una vez y recupera tu tiempo.",
                },
                {
                  title: "Nunca te pierdas un ciclo de facturación",
                  desc: "La vida se pone ocupada. Las facturas recurrentes aseguran que factures a tiempo, siempre, para que el flujo de caja no sufra por facturas olvidadas.",
                },
                {
                  title: "Cobra más rápido",
                  desc: "Cuando las facturas salen automáticamente, los clientes las reciben antes. Una entrega más rápida significa un pago más rápido y un flujo de caja más saludable.",
                },
                {
                  title: "Reduce el error humano",
                  desc: "Se acabó copiar y pegar artículos o calcular mal los totales. El sistema genera una factura idéntica con matemáticas precisas en cada ciclo.",
                },
                {
                  title: "Mejora la experiencia del cliente",
                  desc: "Los clientes aprecian la consistencia. Cuando saben exactamente cuándo y cómo se les facturará, se genera confianza y profesionalismo.",
                },
                {
                  title: "Escala tu negocio",
                  desc: "A medida que crece tu lista de clientes, la facturación recurrente escala contigo. Gestiona 10 o 1,000 clientes recurrentes sin agregar carga administrativa.",
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

          {/* How they work */}
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Cómo funcionan las facturas recurrentes
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-[#374151]">
              Las facturas recurrentes operan según un horario simple.
              Eliges con qué frecuencia quieres facturar e Invoala se
              encarga de la generación:
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  freq: "Semanal",
                  desc: "Ideal para servicios continuos facturados cada semana — limpieza, mantenimiento o consultoría por horas con un tope semanal fijo.",
                },
                {
                  freq: "Mensual",
                  desc: "El ciclo más común. Perfecto para tarifas de retenedor, suscripciones, alquiler y contratos de servicio continuo.",
                },
                {
                  freq: "Trimestral",
                  desc: "Excelente para servicios estacionales, consultoría trimestral, contratos de mantenimiento y negocios que prefieren menos facturas pero más grandes.",
                },
                {
                  freq: "Anual",
                  desc: "Ideal para suscripciones anuales, retenedores anuales, primas de seguro y renovaciones de licencias facturadas una vez al año.",
                },
              ].map((item) => (
                <div
                  key={item.freq}
                  className="rounded-xl border border-[#e5e7eb] bg-white p-6"
                >
                  <h3 className="text-[17px] font-bold tracking-tight text-[#111827]">
                    {item.freq}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-[#6b7280]">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Features */}
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Funciones de las facturas recurrentes
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Programación flexible",
                  desc: "Elige facturación semanal, mensual, trimestral o anual — o configura un intervalo personalizado que se ajuste a tu negocio.",
                },
                {
                  title: "Gestión de clientes",
                  desc: "Guarda los datos del cliente una vez. Cada factura recurrente extrae del mismo registro de cliente — sin volver a escribir información.",
                },
                {
                  title: "Editable antes de enviar",
                  desc: "Revisa y ajusta cada factura antes de que se envíe. Agrega nuevos artículos, cambia montos o salta un ciclo.",
                },
                {
                  title: "Generación automática de PDF",
                  desc: "Cada ciclo produce un PDF profesional listo para imprimir que se ve consistente con tu marca.",
                },
                {
                  title: "Seguimiento del estado de pago",
                  desc: "Ve de un vistazo qué facturas recurrentes están pagadas, pendientes o vencidas en todos tus clientes.",
                },
                {
                  title: "Múltiples monedas",
                  desc: "Factura a clientes internacionales en su moneda. Invoala admite 154 monedas con el formato correcto.",
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

          {/* Who benefits */}
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 md:p-12">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              ¿Quién se beneficia de las facturas recurrentes?
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
              {[
                {
                  title: "Agencias con retenedores",
                  desc: "Agencias de marketing, diseño y desarrollo que cobran a los clientes una tarifa mensual fija por trabajo continuo. Las facturas recurrentes eliminan el paso manual repetitivo.",
                },
                {
                  title: "Negocios SaaS y de suscripción",
                  desc: "Empresas de software que facturan mensual o anualmente por el acceso. Las facturas recurrentes mantienen el ciclo de facturación funcionando sin un equipo de facturación dedicado.",
                },
                {
                  title: "Consultores y coaches",
                  desc: "Consultores de negocios, coaches de vida y asesores con relaciones continuas con clientes. Cobra mensualmente por acceso, llamadas o apoyo estratégico.",
                },
                {
                  title: "Proveedores de mantenimiento y servicios",
                  desc: "Jardineros, limpiadores, técnicos de climatización y administradores de propiedades que brindan servicios regulares en un horario fijo.",
                },
                {
                  title: "Espacios de coworking y alquileres",
                  desc: "Proveedores de espacios de trabajo y administradores de propiedades que cobran a los inquilinos mensualmente por espacio de escritorio, almacenamiento o tarifas de uso.",
                },
                {
                  title: "Freelancers con clientes de largo plazo",
                  desc: "Freelancers que trabajan con el mismo cliente mes tras mes. Ahorra tiempo automatizando la factura que nunca cambia.",
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

          {/* CTA */}
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 text-center">
            <h2 className="text-[24px] font-bold tracking-tight">
              Automatiza tu facturación hoy
            </h2>
            <p className="mt-2 text-[16px] text-[#6b7280]">
              Configura tu primera factura recurrente en menos de dos
              minutos. Gratis, sin registro requerido.
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
                <Link href="/invoice-payment-tracking" className="text-[#166534] hover:underline">
                  Seguimiento de Pagos de Facturas
                </Link>
              </li>
              <li>
                <Link href="/invoice-reminders" className="text-[#166534] hover:underline">
                  Recordatorios de Facturas
                </Link>
              </li>
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
