import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SOCIAL_SAME_AS } from "@/lib/social";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.fenadaily.com";
const SITE_NAME = "Fena Daily";
const SITE_DESCRIPTION =
  "Independent coverage of AI, Football, Crypto, Business, Technology, Politics, and Personal Growth.";

const siteSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      logo: {
        "@type": "ImageObject",
        "@id": `${SITE_URL}/#logo`,
        url: `${SITE_URL}/api/og`,
        width: 1200,
        height: 630,
        caption: SITE_NAME,
      },
      sameAs: SOCIAL_SAME_AS,
      contactPoint: {
        "@type": "ContactPoint",
        email: "fenadaily@gmail.com",
        contactType: "editorial",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en-US",
    },
  ],
};

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

  alternates: {
    canonical: "/",
  },

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
      <head>
        {/*
          Google AdSense site-verification script. Deliberately a plain
          <script> tag, not next/script — next/script's `beforeInteractive`
          strategy (tried first) doesn't render this as a literal tag in
          <head>; in this Next.js version it emits a `self.__next_s.push(...)`
          bootstrap call placed in <body>, which Google's AdSense
          verification crawler does not reliably detect when it scans the
          raw HTML for the exact snippet. A plain <script> here is rendered
          by React exactly where it's written, so it appears verbatim inside
          <head> in the initial server response — matching Google's
          "paste between <head></head>" instruction literally. Only one
          instance exists site-wide, via the root layout. No manual ad
          slots are added here — Auto Ads places units automatically once
          the account is approved.
        */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6138950676801278"
          crossOrigin="anonymous"
        />
      </head>
      <body className="flex min-h-full flex-col bg-slate-950 text-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }}
        />
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
