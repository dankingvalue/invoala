import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LazyLiveChat } from "@/components/LazyLiveChat";
import { CookieConsent } from "@/components/CookieConsent";
import { Analytics } from "@/components/Analytics";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.invoala.com"),
  title: {
    default: "Invoala — Free Invoice Generator for Freelancers",
    template: "%s — Invoala",
  },
  description:
    "Create professional invoices online for free. Add line items, tax, and your logo, then download a polished PDF in seconds. No sign-up. No watermark.",
  keywords: [
    "free invoice generator",
    "invoice maker",
    "invoice template",
    "freelance invoice",
    "pdf invoice",
    "online invoicing",
    "invoice software",
    "small business invoice",
  ],
  authors: [{ name: "Invoala" }],
  creator: "Invoala",
  alternates: {
    canonical: "https://www.invoala.com",
  },
  openGraph: {
    type: "website",
    url: "https://www.invoala.com",
    siteName: "Invoala",
    title: "Invoala — Free Invoice Generator for Freelancers",
    description:
      "Create professional invoices online for free. Download a polished PDF in seconds. No sign-up, no watermark.",
    images: [
      {
        url: "https://www.invoala.com/api/og",
        width: 1200,
        height: 630,
        alt: "Invoala — Free Invoice Generator for Freelancers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Invoala — Free Invoice Generator",
    description:
      "Create professional invoices online for free. Polished PDFs in seconds.",
    images: ["https://www.invoala.com/api/og"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#166534",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Invoala",
    url: "https://www.invoala.com",
    description: "Free online invoice generator for freelancers and small businesses",
  };

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Invoala",
    url: "https://www.invoala.com",
    logo: "https://www.invoala.com/icon.svg",
    description: "Free online invoice generator for freelancers and small businesses",
    email: "hello@invoala.com",
    sameAs: [],
  };

  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Invoala",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: "https://www.invoala.com",
    description: "Free invoice generator for freelancers. Create professional PDF invoices in seconds.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
        />
      </head>
      <body className="min-h-full bg-white text-ink">
        {children}
        <LazyLiveChat />
        <CookieConsent />
        <Analytics />
      </body>
    </html>
  );
}
