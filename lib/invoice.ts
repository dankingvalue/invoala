export type LineItem = {
  id: string;
  description: string;
  quantity: number;
  rate: number;
};

export type Invoice = {
  businessName: string;
  businessEmail: string;
  businessAddress: string;
  logoDataUrl: string | null;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  items: LineItem[];
  taxRate: number;
  discount: number;
  notes: string;
  docType: "invoice" | "quote";
  recurring: string;
};

export const RECURRING_OPTIONS = [
  { value: "", label: "One-time" },
  { value: "weekly", label: "Repeats weekly" },
  { value: "biweekly", label: "Repeats every 2 weeks" },
  { value: "monthly", label: "Repeats monthly" },
  { value: "quarterly", label: "Repeats quarterly" },
  { value: "yearly", label: "Repeats yearly" },
] as const;

export const CURRENCIES = [
  { code: "AED", label: "AED — UAE Dirham" },
  { code: "AFN", label: "AFN — Afghan Afghani" },
  { code: "ALL", label: "ALL — Albanian Lek" },
  { code: "AMD", label: "AMD — Armenian Dram" },
  { code: "AOA", label: "AOA — Angolan Kwanza" },
  { code: "ARS", label: "ARS — Argentine Peso" },
  { code: "AUD", label: "AUD — Australian Dollar" },
  { code: "AWG", label: "AWG — Aruban Florin" },
  { code: "AZN", label: "AZN — Azerbaijani Manat" },
  { code: "BAM", label: "BAM — Bosnian Convertible Mark" },
  { code: "BBD", label: "BBD — Barbadian Dollar" },
  { code: "BDT", label: "BDT — Bangladeshi Taka" },
  { code: "BGN", label: "BGN — Bulgarian Lev" },
  { code: "BHD", label: "BHD — Bahraini Dinar" },
  { code: "BIF", label: "BIF — Burundian Franc" },
  { code: "BMD", label: "BMD — Bermudian Dollar" },
  { code: "BND", label: "BND — Brunei Dollar" },
  { code: "BOB", label: "BOB — Bolivian Boliviano" },
  { code: "BRL", label: "BRL — Brazilian Real" },
  { code: "BSD", label: "BSD — Bahamian Dollar" },
  { code: "BTN", label: "BTN — Bhutanese Ngultrum" },
  { code: "BWP", label: "BWP — Botswana Pula" },
  { code: "BYN", label: "BYN — Belarusian Ruble" },
  { code: "BZD", label: "BZD — Belize Dollar" },
  { code: "CAD", label: "CAD — Canadian Dollar" },
  { code: "CDF", label: "CDF — Congolese Franc" },
  { code: "CHF", label: "CHF — Swiss Franc" },
  { code: "CLP", label: "CLP — Chilean Peso" },
  { code: "CNY", label: "CNY — Chinese Yuan" },
  { code: "COP", label: "COP — Colombian Peso" },
  { code: "CRC", label: "CRC — Costa Rican Colón" },
  { code: "CUP", label: "CUP — Cuban Peso" },
  { code: "CVE", label: "CVE — Cape Verdean Escudo" },
  { code: "CZK", label: "CZK — Czech Koruna" },
  { code: "DJF", label: "DJF — Djiboutian Franc" },
  { code: "DKK", label: "DKK — Danish Krone" },
  { code: "DOP", label: "DOP — Dominican Peso" },
  { code: "DZD", label: "DZD — Algerian Dinar" },
  { code: "EGP", label: "EGP — Egyptian Pound" },
  { code: "ERN", label: "ERN — Eritrean Nakfa" },
  { code: "ETB", label: "ETB — Ethiopian Birr" },
  { code: "EUR", label: "EUR — Euro" },
  { code: "FJD", label: "FJD — Fijian Dollar" },
  { code: "FKP", label: "FKP — Falkland Islands Pound" },
  { code: "GBP", label: "GBP — British Pound" },
  { code: "GEL", label: "GEL — Georgian Lari" },
  { code: "GHS", label: "GHS — Ghanaian Cedi" },
  { code: "GIP", label: "GIP — Gibraltar Pound" },
  { code: "GMD", label: "GMD — Gambian Dalasi" },
  { code: "GNF", label: "GNF — Guinean Franc" },
  { code: "GTQ", label: "GTQ — Guatemalan Quetzal" },
  { code: "GYD", label: "GYD — Guyanese Dollar" },
  { code: "HKD", label: "HKD — Hong Kong Dollar" },
  { code: "HNL", label: "HNL — Honduran Lempira" },
  { code: "HTG", label: "HTG — Haitian Gourde" },
  { code: "HUF", label: "HUF — Hungarian Forint" },
  { code: "IDR", label: "IDR — Indonesian Rupiah" },
  { code: "ILS", label: "ILS — Israeli New Shekel" },
  { code: "INR", label: "INR — Indian Rupee" },
  { code: "IQD", label: "IQD — Iraqi Dinar" },
  { code: "IRR", label: "IRR — Iranian Rial" },
  { code: "ISK", label: "ISK — Icelandic Króna" },
  { code: "JMD", label: "JMD — Jamaican Dollar" },
  { code: "JOD", label: "JOD — Jordanian Dinar" },
  { code: "JPY", label: "JPY — Japanese Yen" },
  { code: "KES", label: "KES — Kenyan Shilling" },
  { code: "KGS", label: "KGS — Kyrgyzstani Som" },
  { code: "KHR", label: "KHR — Cambodian Riel" },
  { code: "KMF", label: "KMF — Comorian Franc" },
  { code: "KRW", label: "KRW — South Korean Won" },
  { code: "KWD", label: "KWD — Kuwaiti Dinar" },
  { code: "KYD", label: "KYD — Cayman Islands Dollar" },
  { code: "KZT", label: "KZT — Kazakhstani Tenge" },
  { code: "LAK", label: "LAK — Laotian Kip" },
  { code: "LBP", label: "LBP — Lebanese Pound" },
  { code: "LKR", label: "LKR — Sri Lankan Rupee" },
  { code: "LRD", label: "LRD — Liberian Dollar" },
  { code: "LSL", label: "LSL — Lesotho Loti" },
  { code: "LYD", label: "LYD — Libyan Dinar" },
  { code: "MAD", label: "MAD — Moroccan Dirham" },
  { code: "MDL", label: "MDL — Moldovan Leu" },
  { code: "MGA", label: "MGA — Malagasy Ariary" },
  { code: "MKD", label: "MKD — Macedonian Denar" },
  { code: "MMK", label: "MMK — Myanmar Kyat" },
  { code: "MNT", label: "MNT — Mongolian Tögrög" },
  { code: "MOP", label: "MOP — Macanese Pataca" },
  { code: "MRU", label: "MRU — Mauritanian Ouguiya" },
  { code: "MUR", label: "MUR — Mauritian Rupee" },
  { code: "MVR", label: "MVR — Maldivian Rufiyaa" },
  { code: "MWK", label: "MWK — Malawian Kwacha" },
  { code: "MXN", label: "MXN — Mexican Peso" },
  { code: "MYR", label: "MYR — Malaysian Ringgit" },
  { code: "MZN", label: "MZN — Mozambican Metical" },
  { code: "NAD", label: "NAD — Namibian Dollar" },
  { code: "NGN", label: "NGN — Nigerian Naira" },
  { code: "NIO", label: "NIO — Nicaraguan Córdoba" },
  { code: "NOK", label: "NOK — Norwegian Krone" },
  { code: "NPR", label: "NPR — Nepalese Rupee" },
  { code: "NZD", label: "NZD — New Zealand Dollar" },
  { code: "OMR", label: "OMR — Omani Rial" },
  { code: "PAB", label: "PAB — Panamanian Balboa" },
  { code: "PEN", label: "PEN — Peruvian Sol" },
  { code: "PGK", label: "PGK — Papua New Guinean Kina" },
  { code: "PHP", label: "PHP — Philippine Peso" },
  { code: "PKR", label: "PKR — Pakistani Rupee" },
  { code: "PLN", label: "PLN — Polish Złoty" },
  { code: "PYG", label: "PYG — Paraguayan Guaraní" },
  { code: "QAR", label: "QAR — Qatari Riyal" },
  { code: "RON", label: "RON — Romanian Leu" },
  { code: "RSD", label: "RSD — Serbian Dinar" },
  { code: "RUB", label: "RUB — Russian Ruble" },
  { code: "RWF", label: "RWF — Rwandan Franc" },
  { code: "SAR", label: "SAR — Saudi Riyal" },
  { code: "SBD", label: "SBD — Solomon Islands Dollar" },
  { code: "SCR", label: "SCR — Seychellois Rupee" },
  { code: "SDG", label: "SDG — Sudanese Pound" },
  { code: "SEK", label: "SEK — Swedish Krona" },
  { code: "SGD", label: "SGD — Singapore Dollar" },
  { code: "SHP", label: "SHP — Saint Helena Pound" },
  { code: "SLE", label: "SLE — Sierra Leonean Leone" },
  { code: "SOS", label: "SOS — Somali Shilling" },
  { code: "SRD", label: "SRD — Surinamese Dollar" },
  { code: "SSP", label: "SSP — South Sudanese Pound" },
  { code: "STN", label: "STN — São Tomé Dobra" },
  { code: "SYP", label: "SYP — Syrian Pound" },
  { code: "SZL", label: "SZL — Swazi Lilangeni" },
  { code: "THB", label: "THB — Thai Baht" },
  { code: "TJS", label: "TJS — Tajikistani Somoni" },
  { code: "TMT", label: "TMT — Turkmenistani Manat" },
  { code: "TND", label: "TND — Tunisian Dinar" },
  { code: "TOP", label: "TOP — Tongan Paʻanga" },
  { code: "TRY", label: "TRY — Turkish Lira" },
  { code: "TTD", label: "TTD — Trinidad & Tobago Dollar" },
  { code: "TWD", label: "TWD — New Taiwan Dollar" },
  { code: "TZS", label: "TZS — Tanzanian Shilling" },
  { code: "UAH", label: "UAH — Ukrainian Hryvnia" },
  { code: "UGX", label: "UGX — Ugandan Shilling" },
  { code: "USD", label: "USD — US Dollar" },
  { code: "UYU", label: "UYU — Uruguayan Peso" },
  { code: "UZS", label: "UZS — Uzbekistani Sum" },
  { code: "VES", label: "VES — Venezuelan Bolívar" },
  { code: "VND", label: "VND — Vietnamese Đồng" },
  { code: "VUV", label: "VUV — Vanuatu Vatu" },
  { code: "WST", label: "WST — Samoan Tālā" },
  { code: "XAF", label: "XAF — Central African CFA Franc" },
  { code: "XCD", label: "XCD — East Caribbean Dollar" },
  { code: "XOF", label: "XOF — West African CFA Franc" },
  { code: "XPF", label: "XPF — CFP Franc" },
  { code: "YER", label: "YER — Yemeni Rial" },
  { code: "ZAR", label: "ZAR — South African Rand" },
  { code: "ZMW", label: "ZMW — Zambian Kwacha" },
  { code: "ZWG", label: "ZWG — Zimbabwe Gold" },
] as const;

const DRAFT_KEY = "invoala.draft.v1";
const RECURRING_VALUES = new Set(["", "weekly", "biweekly", "monthly", "quarterly", "yearly"]);

export function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function isoPlusDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function createDefaultInvoice(): Invoice {
  return {
    businessName: "",
    businessEmail: "",
    businessAddress: "",
    logoDataUrl: null,
    clientName: "",
    clientEmail: "",
    clientAddress: "",
    invoiceNumber: "INV-001",
    issueDate: isoPlusDays(0),
    dueDate: isoPlusDays(14),
    currency: "USD",
    items: [{ id: newId(), description: "", quantity: 1, rate: 0 }],
    taxRate: 0,
    discount: 0,
    notes: "Payment due within 14 days. Thank you for your business!",
    docType: "invoice",
    recurring: "",
  };
}

export function loadDraft(): Invoice | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Invoice>;
    if (!parsed || !Array.isArray(parsed.items)) return null;
    const base = createDefaultInvoice();
    const items = parsed.items
      .filter((i) => i && typeof i === "object")
      .map((i) => ({
        id: typeof i.id === "string" ? i.id : newId(),
        description: typeof i.description === "string" ? i.description : "",
        quantity: typeof i.quantity === "number" ? i.quantity : 1,
        rate: typeof i.rate === "number" ? i.rate : 0,
      }));
    return {
      ...base,
      ...parsed,
      items: items.length > 0 ? items : base.items,
      logoDataUrl: typeof parsed.logoDataUrl === "string" ? parsed.logoDataUrl : null,
      taxRate: typeof parsed.taxRate === "number" ? parsed.taxRate : base.taxRate,
      docType: parsed.docType === "quote" ? "quote" : "invoice",
      recurring: RECURRING_VALUES.has(String(parsed.recurring))
        ? String(parsed.recurring)
        : "",
    };
  } catch {
    return null;
  }
}

export function saveDraft(invoice: Invoice): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(invoice));
  } catch {
    // storage full or unavailable; non-critical
  }
}

export function computeTotals(invoice: Invoice): {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
} {
  const subtotal = invoice.items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0),
    0,
  );
  const discountAmount = subtotal * ((Number(invoice.discount) || 0) / 100);
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = afterDiscount * ((Number(invoice.taxRate) || 0) / 100);
  const total = afterDiscount + taxAmount;
  return { subtotal, taxAmount, total, discountAmount };
}

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return amount.toFixed(2);
  }
}

export function formatDate(iso: string): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(iso + "T00:00:00"));
  } catch {
    return iso;
  }
}
