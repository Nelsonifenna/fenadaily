import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fenadaily.com";
const SITE_NAME = "Fena Daily";
const SITE_DESCRIPTION =
  "Independent coverage of AI, Football, Crypto, Business, Technology, and Personal Growth.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ["Fena Daily", "AI", "Football", "Crypto", "Business", "Technology", "Personal Growth"],
  authors: [{ name: "Fena Daily", url: SITE_URL }],
  creator: "Fena Daily",
  publisher: "Fena Daily",

  // Canonical
  alternates: {
    canonical: "/",
  },

  // Indexing
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Open Graph
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },

  // Twitter / X
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/api/og"],
    creator: "@fenadaily",
    site: "@fenadaily",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-white">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
