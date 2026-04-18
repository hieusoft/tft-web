"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { NAV_LINKS, SITE_CONFIG } from "@/lib/constants";

// Determine which main nav item is active based on current path
function getActiveIndexFromPath(pathname: string): number {
  for (let i = 0; i < NAV_LINKS.length; i++) {
    const link = NAV_LINKS[i];
    // Exact match on main link
    if (pathname === link.href) return i;
    // Exact match on any sub-item
    if (link.sub.some((s) => pathname === s.href || pathname.startsWith(s.href + "/"))) return i;
  }
  return 0; // default to first tab
}

export default function Navbar() {
  const pathname = usePathname();
  const [activeIndex, setActiveIndex] = useState(() => getActiveIndexFromPath(pathname));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<number | null>(null);

  // Sync active tab when navigating via back/forward
  useEffect(() => {
    setActiveIndex(getActiveIndexFromPath(pathname));
    setMobileOpen(false);
  }, [pathname]);

  const activeLink = NAV_LINKS[activeIndex];

  return (
    <header className="sticky top-0 z-50 w-full" style={{ minHeight: "auto" }}>
      {/* ── ROW 1: Top utility bar ── */}
      <div className="w-full bg-[#111111] border-b border-[#1e1e1e]">
        <div className="mx-auto max-w-[1400px] px-4 flex h-12 items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 mr-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-yellow-500 shadow-lg shadow-yellow-500/25">
              <svg className="h-4 w-4 text-black" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-base font-bold text-white tracking-tight hidden sm:block">
              MetaTFT VN
            </span>
          </Link>

          {/* Search bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                suppressHydrationWarning
                type="text"
                placeholder="Tìm trang, người chơi, tướng, trang bị..."
                className="w-full rounded-md border border-[#2a2a2a] bg-[#1a1a1a] pl-9 pr-4 py-1.5 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-yellow-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Right side actions */}
          <div className="ml-auto flex items-center gap-2 shrink-0">
            {/* Patch badge */}
            <div className="hidden sm:flex items-center gap-1.5 rounded border border-[#2a2a2a] bg-[#1a1a1a] px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-gray-400 font-medium">
                Patch {SITE_CONFIG.patch}
              </span>
            </div>

            {/* Download App CTA */}
            <button
              suppressHydrationWarning
              className="hidden sm:flex items-center gap-1.5 rounded bg-red-600 hover:bg-red-500 px-3 py-1.5 text-xs font-bold text-white transition-colors"
            >
              Tải Ứng Dụng
            </button>

            {/* Mobile hamburger */}
            <button
              suppressHydrationWarning
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden rounded p-1.5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── ROW 2: Main nav tabs ── */}
      <div className="hidden md:block w-full bg-[#111111] border-b border-[#1e1e1e]">
        <div className="mx-auto max-w-[1400px] px-4">
          <nav className="flex items-center gap-0">
            {NAV_LINKS.map((link, idx) => {
              const isActive = idx === activeIndex;
              // Khi click label chính → đi thẳng vào sub[0] (hoặc href nếu không có sub)
              const targetHref = link.sub.length > 0 ? link.sub[0].href : link.href;
              return (
                <Link
                  key={link.href}
                  href={targetHref}
                  onClick={() => setActiveIndex(idx)}
                  className={`
                    relative flex items-center gap-1.5 px-5 py-3 text-sm font-medium
                    transition-colors border-b-2 -mb-px
                    ${isActive
                      ? "text-white border-yellow-500"
                      : "text-gray-400 border-transparent hover:text-gray-200 hover:border-gray-600"
                    }
                  `}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ── ROW 3: Sub-nav bar (desktop only) ── */}
      <div className="hidden md:block w-full bg-[#0d0d0d] border-b border-[#1e1e1e]">
        <div className="mx-auto max-w-[1400px] px-4">
          <nav className="flex items-center gap-0">
            {activeLink.sub.length > 0 ? (
              activeLink.sub.map((sub) => {
                const subItem = sub as { label: string; href: string; icon?: string; badge?: string };
                const isSubActive = pathname === subItem.href || pathname.startsWith(subItem.href + "/");
                return (
                  <Link
                    key={subItem.href}
                    href={subItem.href}
                    className={`
                      relative flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium
                      transition-colors border-b-2 -mb-px group
                      ${isSubActive
                        ? "text-yellow-400 border-yellow-500"
                        : "text-gray-500 border-transparent hover:text-gray-200"
                      }
                    `}
                  >
                    {subItem.icon && (
                      <span className="text-sm leading-none">{subItem.icon}</span>
                    )}
                    <span>{subItem.label}</span>
                    {subItem.badge && (
                      <span className="ml-1 rounded bg-red-600 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase leading-none">
                        {subItem.badge}
                      </span>
                    )}
                  </Link>
                );
              })
            ) : (
              // Placeholder row when no sub-items
              <div className="flex items-center px-4 py-2.5">
                <span className="text-xs text-gray-700 italic">—</span>
              </div>
            )}
          </nav>
        </div>
      </div>

      {/* ── Mobile dropdown drawer ── */}
      {mobileOpen && (
        <div className="md:hidden bg-[#111111] border-b border-[#1e1e1e]">
          {/* Mobile search */}
          <div className="px-4 pt-3 pb-2">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                suppressHydrationWarning
                type="text"
                placeholder="Tìm kiếm..."
                className="w-full rounded border border-[#2a2a2a] bg-[#1a1a1a] pl-9 pr-4 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Mobile nav items — accordion style */}
          <nav className="flex flex-col pb-3">
            {NAV_LINKS.map((link, idx) => {
              const isExpanded = mobileExpanded === idx;
              const isActive = idx === activeIndex;
              return (
                <div key={link.href}>
                  <button
                    onClick={() => {
                      setMobileExpanded(isExpanded ? null : idx);
                      setActiveIndex(idx);
                    }}
                    className={`
                      w-full flex items-center justify-between px-4 py-2.5
                      text-sm font-medium transition-colors
                      ${isActive ? "text-yellow-400" : "text-gray-300 hover:text-white"}
                    `}
                  >
                    <span>{link.label}</span>
                    {link.sub.length > 0 && (
                      <svg
                        className={`h-4 w-4 text-gray-500 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    )}
                  </button>

                  {/* Mobile sub-items */}
                  {isExpanded && link.sub.length > 0 && (
                    <div className="bg-[#0d0d0d] border-t border-[#1e1e1e]">
                      {link.sub.map((sub) => {
                        const subItem = sub as { label: string; href: string; icon?: string; badge?: string };
                        const isSubActive = pathname === subItem.href;
                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            onClick={() => setMobileOpen(false)}
                            className={`
                              flex items-center gap-2.5 px-7 py-2.5
                              text-sm transition-colors
                              ${isSubActive
                                ? "text-yellow-400"
                                : "text-gray-500 hover:text-white"
                              }
                            `}
                          >
                            {subItem.icon && (
                              <span className="text-base w-5 text-center leading-none">
                                {subItem.icon}
                              </span>
                            )}
                            <span>{subItem.label}</span>
                            {subItem.badge && (
                              <span className="ml-1 rounded bg-red-600 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase leading-none">
                                {subItem.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Mobile patch + app button */}
          <div className="px-4 py-3 border-t border-[#1e1e1e] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-gray-500">Patch {SITE_CONFIG.patch}</span>
            </div>
            <button className="rounded bg-red-600 px-3 py-1.5 text-xs font-bold text-white">
              Tải Ứng Dụng
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
