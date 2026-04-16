import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { generatePageMetadata } from "@/lib/metadata";
import { SITE_CONFIG } from "@/lib/constants";
import JsonLd from "@/components/seo/JsonLd";

// Dynamic import - giam initial JS bundle, chi load CompsClient khi can
// Skeleton loading cai thien perceived performance
const CompsClient = dynamic(() => import("./CompsClient"), {
  loading: () => (
    <div className="flex flex-col gap-2">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="h-16 rounded bg-[#1e1e1e] border border-[#2a2a2a] animate-pulse"
        />
      ))}
    </div>
  ),
});


export const metadata: Metadata = generatePageMetadata({
  title: "Đội Hình TFT Tốt Nhất",
  description:
    "Khám phá đội hình TFT tốt nhất được xếp hạng theo tỷ lệ thắng, top 4 và vị trí trung bình. Cập nhật mọi 30 phút với dữ liệu trực tiếp.",
  path: "/comps",
  keywords: ["đội hình TFT tốt nhất", "meta TFT", "tier list đội hình TFT", "Teamfight Tactics comps", "đội hình Teamfight Tactics"],
});

const compsJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang Chủ", item: SITE_CONFIG.url },
      { "@type": "ListItem", position: 2, name: "Đội Hình", item: `${SITE_CONFIG.url}/comps` },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${SITE_CONFIG.url}/comps#itemlist`,
    name: "Đội Hình TFT Tốt Nhất",
    description: "Xếp hạng đội hình TFT theo tỷ lệ thắng và hiệu suất",
    url: `${SITE_CONFIG.url}/comps`,
  },
];

export default function CompsPage() {
  return (
    <>
      <JsonLd data={compsJsonLd} />

      <div className="bg-[#1a1a1a] min-h-screen">
        <div className="mx-auto max-w-[1400px] px-4 py-6">
          {/* Page header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">
              Đội Hình TFT Tốt Nhất
            </h1>
            <p className="mt-1 text-sm text-gray-500 max-w-3xl">
              Danh sách tier của các đội hình tốt nhất để chơi trong meta TFT hiện tại, được hỗ trợ bởi dữ liệu.
              Click vào đội hình để xem vị trí, cách lên level và nhiều hơn nữa.{" "}
              <a href="#" className="text-yellow-500 hover:text-yellow-400 transition-colors">Thêm thông tin</a>
            </p>

            {/* Info row */}
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                Dữ liệu từ 2.4M+ ván
              </div>
              <div>Xếp hạng: Vàng+ trở lên</div>
              <div>Patch {SITE_CONFIG.patch}</div>
            </div>
          </div>

          <CompsClient />
        </div>
      </div>
    </>
  );
}
