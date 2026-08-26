import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://invoala.com"),
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
  ],
  openGraph: {
    type: "website",
    url: "https://invoala.com",
    siteName: "Invoala",
    title: "Invoala — Free Invoice Generator for Freelancers",
    description:
      "Create professional invoices online for free. Download a polished PDF in seconds. No sign-up, no watermark.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Invoala — Free Invoice Generator",
    description:
      "Create professional invoices online for free. Polished PDFs in seconds.",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-white text-ink">{children}</body>
    </html>
  );
}
