import type { Metadata } from "next";
import { SITE_CONFIG } from "./constants";

interface PageMetadataOptions {
  /** Tiêu đề trang — sẽ được thêm "| MetaTFT VN" qua template của layout */
  title: string;
  description: string;
  /** Đường dẫn tương đối, vd: "/comps" */
  path: string;
  ogImage?: string;
  keywords?: string[];
  /** Dùng "article" cho trang nội dung cụ thể, "website" cho trang tổng quan */
  ogType?: "website" | "article";
}

export function generatePageMetadata({
  title,
  description,
  path,
  ogImage,
  keywords,
  ogType = "website",
}: PageMetadataOptions): Metadata {
  // metadataBase đã set trong layout nên chỉ cần path tương đối cho canonical
  const absoluteUrl = `${SITE_CONFIG.url}${path}`;
  const imageUrl = `${SITE_CONFIG.url}${ogImage || SITE_CONFIG.ogImage}`;
  const fullTitle = `${title} | ${SITE_CONFIG.name}`;

  return {
    // title: chỉ cần truyền chuỗi — layout template sẽ append "| MetaTFT VN"
    title,
    description,
    keywords: keywords ?? [
      "TFT",
      "Teamfight Tactics",
      "meta TFT",
      "tier list TFT",
      "đội hình TFT",
      "thống kê TFT",
    ],

    // Canonical — Next.js sẽ resolve với metadataBase
    alternates: {
      canonical: path,
      languages: {
        "vi-VN": path,
        "x-default": path,
      },
    },

    // Open Graph chuẩn
    openGraph: {
      type: ogType,
      locale: SITE_CONFIG.locale,
      url: absoluteUrl,
      siteName: SITE_CONFIG.name,
      title: fullTitle,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
          type: "image/png",
        },
      ],
    },

    // Twitter Card chuẩn
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [
        {
          url: imageUrl,
          alt: title,
        },
      ],
      site: SITE_CONFIG.twitterHandle,
      creator: SITE_CONFIG.twitterHandle,
    },
  };
}
