export const LOCALES = ["es", "pt", "fr", "de"] as const;
export type Locale = (typeof LOCALES)[number];
export type LocaleOrDefault = Locale | "en";
export const ALL_LOCALES: LocaleOrDefault[] = ["en", ...LOCALES];

export const LOCALE_NAMES: Record<LocaleOrDefault, string> = {
  en: "English",
  es: "Español",
  pt: "Português",
  fr: "Français",
  de: "Deutsch",
};

// English canonical paths that have a full translation in every locale
// above. Grows as each page is translated — keep this in sync with what
// actually exists, since hreflang tags and the nav/footer both read it to
// decide whether to link to a localized URL or fall back to the English one.
export const TRANSLATED_PAGES: string[] = [
  "/invoice-generator",
  "/pricing",
  "/invoicing-software",
  "/receipt-generator",
  "/estimate-generator",
  "/recurring-invoices",
  "/online-invoicing",
  "/invoice-maker",
  "/invoice-template",
  "/",
];

export function isTranslated(enPath: string): boolean {
  return TRANSLATED_PAGES.includes(enPath);
}

/** Nav/footer link target: the localized URL if this page has one, else the English page. */
export function localizedPath(enPath: string, locale: LocaleOrDefault): string {
  if (locale === "en" || !isTranslated(enPath)) return enPath;
  // enPath === "/" would otherwise produce "/es/" — a working but wasteful
  // extra redirect hop through Next's trailing-slash normalization.
  return enPath === "/" ? `/${locale}` : `/${locale}${enPath}`;
}

const SITE_URL = "https://www.invoala.com";

/** hreflang alternates for a translated page's canonical English path. */
export function hreflangAlternates(enPath: string): Record<string, string> {
  const alt: Record<string, string> = {
    "x-default": `${SITE_URL}${enPath}`,
    en: `${SITE_URL}${enPath}`,
  };
  for (const l of LOCALES) {
    if (isTranslated(enPath)) alt[l] = `${SITE_URL}${localizedPath(enPath, l)}`;
  }
  return alt;
}

export type NavLabels = {
  product: string;
  tools: string;
  templates: string;
  learn: string;
  pricing: string;
  createInvoice: string;
  signIn: string;
  dashboard: string;
  upgrade: string;
  menu: string;
};

export const NAV_LABELS: Record<LocaleOrDefault, NavLabels> = {
  en: {
    product: "Product", tools: "Free tools", templates: "Templates", learn: "Learn", pricing: "Pricing",
    createInvoice: "Create invoice", signIn: "Sign in", dashboard: "Dashboard", upgrade: "Upgrade", menu: "Menu",
  },
  es: {
    product: "Producto", tools: "Herramientas gratis", templates: "Plantillas", learn: "Aprender", pricing: "Precios",
    createInvoice: "Crear factura", signIn: "Iniciar sesión", dashboard: "Panel", upgrade: "Mejorar plan", menu: "Menú",
  },
  pt: {
    product: "Produto", tools: "Ferramentas gratuitas", templates: "Modelos", learn: "Aprender", pricing: "Preços",
    createInvoice: "Criar fatura", signIn: "Entrar", dashboard: "Painel", upgrade: "Fazer upgrade", menu: "Menu",
  },
  fr: {
    product: "Produit", tools: "Outils gratuits", templates: "Modèles", learn: "Apprendre", pricing: "Tarifs",
    createInvoice: "Créer une facture", signIn: "Se connecter", dashboard: "Tableau de bord", upgrade: "Améliorer", menu: "Menu",
  },
  de: {
    product: "Produkt", tools: "Kostenlose Tools", templates: "Vorlagen", learn: "Lernen", pricing: "Preise",
    createInvoice: "Rechnung erstellen", signIn: "Anmelden", dashboard: "Dashboard", upgrade: "Upgraden", menu: "Menü",
  },
};

export type FooterLabels = {
  headings: { product: string; solutions: string; tools: string; resources: string; company: string };
  product: { invoicingSoftware: string; invoiceGenerator: string; onlineInvoicing: string; recurringInvoices: string; paymentTracking: string };
  solutions: { freelancers: string; smallBusinesses: string; consultants: string; agencies: string; contractors: string };
  tools: { invoiceGenerator: string; vatCalculator: string; profitMarginCalculator: string; hourlyRateCalculator: string; invoiceNumberGenerator: string };
  resources: { templates: string; learningCenter: string; comparisons: string; paymentResearch: string; howToCreateInvoice: string };
  company: { pricing: string; roadmap: string; about: string; security: string; contact: string; emailUs: string };
  legal: { privacy: string; terms: string; cookies: string; refunds: string; security: string };
  rights: string;
  tagline: string;
};

export const FOOTER_LABELS: Record<LocaleOrDefault, FooterLabels> = {
  en: {
    headings: { product: "Product", solutions: "Solutions", tools: "Tools", resources: "Resources", company: "Company" },
    product: { invoicingSoftware: "Invoicing Software", invoiceGenerator: "Invoice Generator", onlineInvoicing: "Online Invoicing", recurringInvoices: "Recurring Invoices", paymentTracking: "Payment Tracking" },
    solutions: { freelancers: "For Freelancers", smallBusinesses: "For Small Businesses", consultants: "For Consultants", agencies: "For Agencies", contractors: "For Contractors" },
    tools: { invoiceGenerator: "Invoice Generator", vatCalculator: "VAT Calculator", profitMarginCalculator: "Profit Margin Calculator", hourlyRateCalculator: "Hourly Rate Calculator", invoiceNumberGenerator: "Invoice Number Generator" },
    resources: { templates: "Templates", learningCenter: "Learning Center", comparisons: "Comparisons", paymentResearch: "Payment Research", howToCreateInvoice: "How to Create an Invoice" },
    company: { pricing: "Pricing", roadmap: "Roadmap", about: "About", security: "Security", contact: "Contact", emailUs: "Email Us" },
    legal: { privacy: "Privacy", terms: "Terms", cookies: "Cookies", refunds: "Refunds", security: "Security" },
    rights: "© 2026 Invoala. All rights reserved.",
    tagline: "Invoala is a free online invoice generator for freelancers and small businesses. Create professional invoices with your own logo, line items, tax, and multiple currencies — then download them as print-ready PDF files. No account required, and your data never leaves your browser.",
  },
  es: {
    headings: { product: "Producto", solutions: "Soluciones", tools: "Herramientas", resources: "Recursos", company: "Empresa" },
    product: { invoicingSoftware: "Software de Facturación", invoiceGenerator: "Generador de Facturas", onlineInvoicing: "Facturación en Línea", recurringInvoices: "Facturas Recurrentes", paymentTracking: "Seguimiento de Pagos" },
    solutions: { freelancers: "Para Freelancers", smallBusinesses: "Para Pequeñas Empresas", consultants: "Para Consultores", agencies: "Para Agencias", contractors: "Para Contratistas" },
    tools: { invoiceGenerator: "Generador de Facturas", vatCalculator: "Calculadora de IVA", profitMarginCalculator: "Calculadora de Margen", hourlyRateCalculator: "Calculadora de Tarifa por Hora", invoiceNumberGenerator: "Generador de Números de Factura" },
    resources: { templates: "Plantillas", learningCenter: "Centro de Aprendizaje", comparisons: "Comparativas", paymentResearch: "Investigación de Pagos", howToCreateInvoice: "Cómo Crear una Factura" },
    company: { pricing: "Precios", roadmap: "Hoja de Ruta", about: "Acerca de", security: "Seguridad", contact: "Contacto", emailUs: "Envíanos un Correo" },
    legal: { privacy: "Privacidad", terms: "Términos", cookies: "Cookies", refunds: "Reembolsos", security: "Seguridad" },
    rights: "© 2026 Invoala. Todos los derechos reservados.",
    tagline: "Invoala es un generador de facturas en línea gratuito para freelancers y pequeñas empresas. Crea facturas profesionales con tu propio logotipo, líneas de artículos, impuestos y múltiples monedas, y descárgalas como archivos PDF listos para imprimir. No se necesita cuenta y tus datos nunca salen de tu navegador.",
  },
  pt: {
    headings: { product: "Produto", solutions: "Soluções", tools: "Ferramentas", resources: "Recursos", company: "Empresa" },
    product: { invoicingSoftware: "Software de Faturamento", invoiceGenerator: "Gerador de Faturas", onlineInvoicing: "Faturamento Online", recurringInvoices: "Faturas Recorrentes", paymentTracking: "Rastreamento de Pagamentos" },
    solutions: { freelancers: "Para Freelancers", smallBusinesses: "Para Pequenas Empresas", consultants: "Para Consultores", agencies: "Para Agências", contractors: "Para Prestadores de Serviço" },
    tools: { invoiceGenerator: "Gerador de Faturas", vatCalculator: "Calculadora de IVA", profitMarginCalculator: "Calculadora de Margem de Lucro", hourlyRateCalculator: "Calculadora de Taxa Horária", invoiceNumberGenerator: "Gerador de Número de Fatura" },
    resources: { templates: "Modelos", learningCenter: "Central de Aprendizado", comparisons: "Comparações", paymentResearch: "Pesquisa de Pagamentos", howToCreateInvoice: "Como Criar uma Fatura" },
    company: { pricing: "Preços", roadmap: "Roteiro", about: "Sobre", security: "Segurança", contact: "Contato", emailUs: "Enviar Email" },
    legal: { privacy: "Privacidade", terms: "Termos", cookies: "Cookies", refunds: "Reembolsos", security: "Segurança" },
    rights: "© 2026 Invoala. Todos os direitos reservados.",
    tagline: "Invoala é um gerador de faturas online gratuito para freelancers e pequenas empresas. Crie faturas profissionais com seu próprio logotipo, itens de linha, impostos e múltiplas moedas — depois baixe como arquivos PDF prontos para impressão. Não é necessária conta, e seus dados nunca saem do seu navegador.",
  },
  fr: {
    headings: { product: "Produit", solutions: "Solutions", tools: "Outils", resources: "Ressources", company: "Entreprise" },
    product: { invoicingSoftware: "Logiciel de Facturation", invoiceGenerator: "Générateur de Factures", onlineInvoicing: "Facturation en Ligne", recurringInvoices: "Factures Récurrentes", paymentTracking: "Suivi des Paiements" },
    solutions: { freelancers: "Pour les Freelances", smallBusinesses: "Pour les Petites Entreprises", consultants: "Pour les Consultants", agencies: "Pour les Agences", contractors: "Pour les Entrepreneurs" },
    tools: { invoiceGenerator: "Générateur de Factures", vatCalculator: "Calculateur de TVA", profitMarginCalculator: "Calculateur de Marge", hourlyRateCalculator: "Calculateur de Taux Horaire", invoiceNumberGenerator: "Générateur de Numéro de Facture" },
    resources: { templates: "Modèles", learningCenter: "Centre d'Apprentissage", comparisons: "Comparaisons", paymentResearch: "Étude sur les Paiements", howToCreateInvoice: "Comment Créer une Facture" },
    company: { pricing: "Tarifs", roadmap: "Feuille de Route", about: "À Propos", security: "Sécurité", contact: "Contact", emailUs: "Nous Écrire" },
    legal: { privacy: "Confidentialité", terms: "Conditions", cookies: "Cookies", refunds: "Remboursements", security: "Sécurité" },
    rights: "© 2026 Invoala. Tous droits réservés.",
    tagline: "Invoala est un générateur de factures en ligne gratuit pour les freelances et les petites entreprises. Créez des factures professionnelles avec votre propre logo, des lignes d'articles, la taxe et plusieurs devises, puis téléchargez-les en PDF prêtes à imprimer. Aucun compte requis, et vos données ne quittent jamais votre navigateur.",
  },
  de: {
    headings: { product: "Produkt", solutions: "Lösungen", tools: "Tools", resources: "Ressourcen", company: "Unternehmen" },
    product: { invoicingSoftware: "Rechnungssoftware", invoiceGenerator: "Rechnungsgenerator", onlineInvoicing: "Online-Rechnungsstellung", recurringInvoices: "Wiederkehrende Rechnungen", paymentTracking: "Zahlungsverfolgung" },
    solutions: { freelancers: "Für Freelancer", smallBusinesses: "Für Kleinunternehmen", consultants: "Für Berater", agencies: "Für Agenturen", contractors: "Für Auftragnehmer" },
    tools: { invoiceGenerator: "Rechnungsgenerator", vatCalculator: "MwSt-Rechner", profitMarginCalculator: "Gewinnmargenrechner", hourlyRateCalculator: "Stundensatzrechner", invoiceNumberGenerator: "Rechnungsnummerngenerator" },
    resources: { templates: "Vorlagen", learningCenter: "Lernzentrum", comparisons: "Vergleiche", paymentResearch: "Zahlungsstudie", howToCreateInvoice: "Rechnung Erstellen" },
    company: { pricing: "Preise", roadmap: "Roadmap", about: "Über uns", security: "Sicherheit", contact: "Kontakt", emailUs: "E-Mail Senden" },
    legal: { privacy: "Datenschutz", terms: "AGB", cookies: "Cookies", refunds: "Rückerstattungen", security: "Sicherheit" },
    rights: "© 2026 Invoala. Alle Rechte vorbehalten.",
    tagline: "Invoala ist ein kostenloser Online-Rechnungsgenerator für Freelancer und kleine Unternehmen. Erstellen Sie professionelle Rechnungen mit eigenem Logo, Positionen, Steuern und mehreren Währungen — und laden Sie sie als druckfertige PDF-Dateien herunter. Kein Konto erforderlich, und Ihre Daten verlassen niemals Ihren Browser.",
  },
};
