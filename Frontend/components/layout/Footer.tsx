import Link from "next/link";
import { NAV_LINKS, SITE_CONFIG } from "@/lib/constants";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#2a2a2a] bg-[#111] mt-8">
      <div className="mx-auto max-w-[1400px] px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2 w-fit">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-yellow-500">
                <svg className="h-4 w-4 text-black" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="text-base font-bold text-white">MetaTFT VN</span>
            </Link>
            <p className="text-xs text-gray-600 leading-relaxed max-w-xs">
              {SITE_CONFIG.description}
            </p>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-gray-600">Patch {SITE_CONFIG.patch} — Dữ liệu trực tiếp</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Điều Hướng</h3>
            <ul className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-gray-600 hover:text-gray-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Thông Tin</h3>
            <ul className="flex flex-col gap-2 text-xs text-gray-600">
              <li>Trang fan không chính thức của Riot Games</li>
              <li>Dữ liệu cập nhật mỗi 30 phút</li>
              <li>
                <a href="mailto:contact@metatft.gg" className="hover:text-gray-300 transition-colors">
                  contact@metatft.gg
                </a>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-gray-300 transition-colors">Chính Sách Bảo Mật</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-[#2a2a2a] pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-700">
            © {currentYear} MetaTFT VN. Không liên kết với Riot Games.
          </p>
          <p className="text-xs text-gray-700">
            TFT & Teamfight Tactics là thương hiệu của Riot Games.
          </p>
        </div>
      </div>
    </footer>
  );
}
