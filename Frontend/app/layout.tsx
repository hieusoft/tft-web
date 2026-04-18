import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageBanner from "@/components/layout/PageBanner";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_CONFIG } from "@/lib/constants";

// font-display: swap → text hiển thị ngay với font hệ thống, Geist load sau
// Cải thiện FCP đáng kể vì không block render
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "-apple-system", "sans-serif"],
  adjustFontFallback: true, // Giảm CLS khi font swap
});

// metadataBase: dùng domain thật khi production, localhost khi dev
// Đây là URL nền để Next.js resolve tất cả URL tương đối trong metadata (canonical, og:image, ...)
const getMetadataBase = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL);
  }
  if (process.env.NODE_ENV === "production") {
    return new URL(SITE_CONFIG.url);
  }
  // Development: dùng localhost để canonical và og:image resolve đúng
  return new URL("http://localhost:3000");
};

// =========================================================
// Root Metadata — Shared & overridden per-page
// =========================================================
export const metadata: Metadata = {
  // metadataBase: Next.js dùng để resolve tất cả URL tương đối trong metadata
  // → dev: http://localhost:3000, production: https://metatft.gg
  metadataBase: getMetadataBase(),

  // Title template: các trang con chỉ cần khai báo title ngắn
  // Kết quả: "Đội Hình TFT Tốt Nhất | MetaTFT VN"
  title: {
    default: `${SITE_CONFIG.name} - ${SITE_CONFIG.tagline}`,
    template: `%s | ${SITE_CONFIG.name}`,
  },

  description: SITE_CONFIG.description,

  keywords: [
    "TFT",
    "Teamfight Tactics",
    "meta TFT",
    "tier list TFT",
    "đội hình TFT",
    "trang bị TFT",
    "tướng TFT",
    "tăng cường TFT",
    "đội hình tốt nhất TFT",
    "thống kê TFT",
    "MetaTFT VN",
  ],

  authors: [{ name: SITE_CONFIG.name, url: SITE_CONFIG.url }],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,

  // Cho phép bot crawl và index toàn bộ site
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Open Graph mặc định cho homepage
  openGraph: {
    type: "website",
    locale: SITE_CONFIG.locale,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: `${SITE_CONFIG.name} - ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    images: [
      {
        url: SITE_CONFIG.ogImage, // Next.js sẽ resolve với metadataBase
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.name} - TFT Stats & Meta Tiếng Việt`,
        type: "image/png",
      },
    ],
  },

  // Twitter Card mặc định
  twitter: {
    card: "summary_large_image",
    title: `${SITE_CONFIG.name} - ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    images: [{ url: SITE_CONFIG.ogImage, alt: SITE_CONFIG.name }],
    site: SITE_CONFIG.twitterHandle,
    creator: SITE_CONFIG.twitterHandle,
  },

  // Canonical mặc định cho homepage
  alternates: {
    canonical: "/",
    languages: {
      "vi-VN": "/",
      "x-default": "/",
    },
  },

  // Icons
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon-16x16.png",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },

  // PWA manifest
  manifest: "/manifest.json",

  // Màu category cho mobile browser
  // (themeColor được handle bởi viewport export riêng)

  // Google Search Console verification — thay bằng code thật khi deploy
  // verification: { google: "..." },
};

// =========================================================
// Viewport — tách khỏi metadata theo chuẩn Next.js 14+
// =========================================================
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: SITE_CONFIG.themeColor },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// =========================================================
// JSON-LD Structured Data — WebSite schema + SearchAction
// =========================================================
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_CONFIG.url}/#website`,
  name: SITE_CONFIG.name,
  url: SITE_CONFIG.url,
  description: SITE_CONFIG.description,
  inLanguage: SITE_CONFIG.language,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_CONFIG.url}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_CONFIG.url}/#organization`,
  name: SITE_CONFIG.name,
  url: SITE_CONFIG.url,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_CONFIG.url}/logo.png`,
  },
};

// =========================================================
// Root Layout
// =========================================================
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={SITE_CONFIG.language}>
      <head>
        {/* Preconnect → giảm DNS lookup time cho external resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />

        {/* JSON-LD Structured Data */}
        <JsonLd data={websiteJsonLd} />
        <JsonLd data={organizationJsonLd} />
      </head>
      <body
        suppressHydrationWarning
        className={`${geist.variable} font-sans antialiased bg-[#1a1a1a] text-gray-200 min-h-screen flex flex-col`}
      >
        <Navbar />
        <PageBanner />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
