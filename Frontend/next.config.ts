import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // =====================================================
  // Docker: standalone output giúp giảm kích thước image
  // =====================================================
  output: "standalone",

  // =====================================================
  // Performance: loại bỏ X-Powered-By, bật compression
  // =====================================================
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,

  // =====================================================
  // Image Optimization
  // =====================================================
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 604800, // Cache ảnh 7 ngày — augment/item icons không đổi thường xuyên
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    qualities: [75, 85, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ddragon.leagueoflegends.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "raw.communitydragon.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.communitydragon.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "magazine.artstation.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.tftmeta.gg",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.metatft.com",
        pathname: "/**",
      },
    ],
  },

  // =====================================================
  // HTTP Headers
  // =====================================================
  async headers() {
    return [
      {
        // X-Robots-Tag cho toàn bộ tran
        source: "/(.*)",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
          },
          // Security headers (bonus)
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Bật HTTP/2 Server Push hints cho font
          {
            key: "Link",
            value: [
              "</fonts/geist.woff2>; rel=preload; as=font; crossorigin",
            ].join(", "),
          },
        ],
      },
      {
        // Cache headers cho static assets
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Cache cho robots.txt và sitemap
        source: "/(robots.txt|sitemap.xml)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },

  // =====================================================
  // Experimental: tối ưu CSS và package imports
  // =====================================================
  experimental: {
    // Tối ưu import của các thư viện lớn (tree-shaking tốt hơn)
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
