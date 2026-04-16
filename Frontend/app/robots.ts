import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/constants";

/**
 * robots.txt được generate tự động bởi Next.js.
 * Truy cập: /robots.txt
 *
 * Lưu ý:
 * - `host` directive đã bị bỏ vì không phải chuẩn của Google/Bing — chỉ Yandex dùng.
 *   Google xác định canonical host qua Search Console, không qua robots.txt.
 * - Googlebot được allow riêng để đảm bảo không bị chặn bởi rule chung.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Cho phép tất cả bot crawl toàn bộ site
        userAgent: "*",
        allow: "/",
        // Chặn các path nội bộ không cần index
        disallow: [
          "/api/",
          "/_next/",
          "/static/",
          "/search?", // Trang search results không cần index
        ],
      },
      {
        // Googlebot được phép index tất cả — không disallow gì thêm
        userAgent: "Googlebot",
        allow: "/",
      },
      {
        // Bingbot được phép index tất cả
        userAgent: "Bingbot",
        allow: "/",
      },
    ],
    // Sitemap URL đầy đủ — bắt buộc phải là absolute URL
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
  };
}
