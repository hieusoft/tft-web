"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { NAV_LINKS, SITE_CONFIG } from "@/lib/constants";

/* ─── helpers ───────────────────────────────────────────── */
function getActiveIndexFromPath(pathname: string): number {
  for (let i = 0; i < NAV_LINKS.length; i++) {
    const link = NAV_LINKS[i];
    if (pathname === link.href) return i;
    if (link.sub.some((s) => pathname === s.href || pathname.startsWith(s.href + "/"))) return i;
  }
  return 0;
}

export default function Navbar() {
  const pathname = usePathname();
  const [activeIndex, setActiveIndex] = useState(() => getActiveIndexFromPath(pathname));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<number | null>(null);

  useEffect(() => {
    setActiveIndex(getActiveIndexFromPath(pathname));
    setMobileOpen(false);
  }, [pathname]);

  const activeLink = NAV_LINKS[activeIndex];

  /* ─── TFT palette tokens (local for readability) ────────── */
  const TFT = {
    bg: "var(--tft-bg)",
    panel: "var(--tft-panel)",
    panelSoft: "var(--tft-panel-alt)",
    line: "var(--tft-line)",
    lineSoft: "var(--tft-line-soft)",
    gold: "var(--tft-gold)",
    goldBright: "var(--tft-gold-bright)",
    goldDim: "var(--tft-gold-dim)",
    text: "var(--tft-text)",
    textDim: "var(--tft-text-dim)",
    textMute: "var(--tft-text-mute)",
    good: "#4ade80",
    heading: "var(--font-sans)",
    body: "var(--font-sans)",
  } as const;

  return (
    <header className="sticky top-0 z-50 w-full" style={{ minHeight: "auto" }}>
      {/* ═════ ROW 1: Top utility bar ═════ */}
      <div
        className="w-full border-b"
        style={{ background: TFT.panel, borderColor: TFT.line }}
      >
        <div className="mx-auto max-w-[1400px] px-4 flex h-12 items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0 mr-2">
            <Image
              src="/logo.svg"
              alt="MetaTFT VN"
              width={200}
              height={50}
              priority
              className="h-14 w-auto"
            />
          </Link>

          {/* Search bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{ color: TFT.textMute }}
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
                className="w-full pl-9 pr-4 py-1.5 text-xs transition-colors focus:outline-none"
                style={{
                  borderRadius: 0,
                  border: `1px solid ${TFT.line}`,
                  background: TFT.bg,
                  color: TFT.textDim,
                  fontFamily: TFT.body,
                }}
              />
            </div>
          </div>

          {/* Right side actions */}
          <div className="ml-auto flex items-center gap-2 shrink-0">
            {/* Patch badge */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1"
              style={{
                borderRadius: 0,
                border: `1px solid ${TFT.line}`,
                background: TFT.bg,
              }}
            >
              <span className="h-1.5 w-1.5 animate-pulse" style={{ background: TFT.good }} />
              <span
                className="text-xs font-medium"
                style={{ color: TFT.textDim }}
              >
                Patch {SITE_CONFIG.patch}
              </span>
            </div>

            {/* Download App CTA */}
            <button
              suppressHydrationWarning
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-colors"
              style={{
                fontFamily: TFT.heading,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                borderRadius: 0,
                background: TFT.gold,
                color: "#000",
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.25), 0 2px 6px rgba(0,0,0,0.35)`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = TFT.goldBright;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = TFT.gold;
              }}
            >
              Tải Ứng Dụng
            </button>

            {/* Mobile hamburger */}
            <button
              suppressHydrationWarning
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-1.5 transition-colors"
              aria-label="Toggle menu"
              style={{ borderRadius: 0, color: TFT.textMute }}
              onMouseEnter={(e) => { e.currentTarget.style.color = TFT.text; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = TFT.textMute; }}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ═════ ROW 2: Main nav tabs ═════ */}
      <div
        className="hidden md:block w-full border-b"
        style={{ background: TFT.bg, borderColor: TFT.line }}
      >
        <div className="mx-auto max-w-[1400px] px-4">
          <nav className="flex items-center gap-0">
            {NAV_LINKS.map((link, idx) => {
              const isActive = idx === activeIndex;
              const targetHref = link.sub.length > 0 ? link.sub[0].href : link.href;
              return (
                <Link
                  key={link.href}
                  href={targetHref}
                  onClick={() => setActiveIndex(idx)}
                  className="relative flex items-center gap-1.5 px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px"
                  style={{
                    fontFamily: TFT.heading,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? TFT.goldBright : TFT.textDim,
                    borderColor: isActive ? TFT.gold : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = TFT.text;
                      e.currentTarget.style.borderColor = TFT.goldDim;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = TFT.textDim;
                      e.currentTarget.style.borderColor = "transparent";
                    }
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ═════ ROW 3: Sub-nav bar (desktop only) ═════ */}
      <div
        className="hidden md:block w-full border-b"
        style={{ background: TFT.panel, borderColor: TFT.line }}
      >
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
                    className="relative flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px group"
                    style={{
                      fontFamily: TFT.heading,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      fontWeight: isSubActive ? 700 : 500,
                      color: isSubActive ? TFT.gold : TFT.textMute,
                      borderColor: isSubActive ? TFT.gold : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubActive) e.currentTarget.style.color = TFT.textDim;
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubActive) e.currentTarget.style.color = TFT.textMute;
                    }}
                  >
                    <span>{subItem.label}</span>
                    {subItem.badge && (
                      <span
                        className="ml-1 px-1.5 py-0.5 text-[9px] font-bold uppercase leading-none"
                        style={{
                          borderRadius: 0,
                          background: "#dc2626",
                          color: "#fff",
                        }}
                      >
                        {subItem.badge}
                      </span>
                    )}
                  </Link>
                );
              })
            ) : (
              <div className="flex items-center px-4 py-2.5">
                <span className="text-xs italic" style={{ color: TFT.textMute }}>—</span>
              </div>
            )}
          </nav>
        </div>
      </div>

      {/* ═════ Mobile dropdown drawer ═════ */}
      {mobileOpen && (
        <div
          className="md:hidden border-b"
          style={{ background: TFT.panel, borderColor: TFT.line }}
        >
          {/* Mobile search */}
          <div className="px-4 pt-3 pb-2">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{ color: TFT.textMute }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                suppressHydrationWarning
                type="text"
                placeholder="Tìm kiếm..."
                className="w-full pl-9 pr-4 py-2 text-sm focus:outline-none"
                style={{
                  borderRadius: 0,
                  border: `1px solid ${TFT.line}`,
                  background: TFT.bg,
                  color: TFT.textDim,
                }}
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
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors"
                    style={{
                      fontFamily: TFT.heading,
                      letterSpacing: "0.06em",
                      color: isActive ? TFT.gold : TFT.textDim,
                    }}
                  >
                    <span>{link.label}</span>
                    {link.sub.length > 0 && (
                      <svg
                        className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        style={{ color: TFT.textMute }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>

                  {/* Mobile sub-items */}
                  {isExpanded && link.sub.length > 0 && (
                    <div className="border-t" style={{ background: TFT.panelSoft, borderColor: TFT.line }}>
                      {link.sub.map((sub) => {
                        const subItem = sub as { label: string; href: string; icon?: string; badge?: string };
                        const isSubActive = pathname === subItem.href;
                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-2.5 px-7 py-2.5 text-sm transition-colors"
                            style={{
                              color: isSubActive ? TFT.gold : TFT.textMute,
                            }}
                          >
                            <span>{subItem.label}</span>
                            {subItem.badge && (
                              <span
                                className="ml-1 px-1.5 py-0.5 text-[9px] font-bold uppercase leading-none"
                                style={{ borderRadius: 0, background: "#dc2626", color: "#fff" }}
                              >
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
          <div
            className="px-4 py-3 border-t flex items-center justify-between"
            style={{ borderColor: TFT.line }}
          >
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse" style={{ background: TFT.good }} />
              <span className="text-xs" style={{ color: TFT.textMute }}>Patch {SITE_CONFIG.patch}</span>
            </div>
            <button
              className="px-3 py-1.5 text-xs font-bold"
              style={{
                fontFamily: TFT.heading,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                borderRadius: 0,
                background: TFT.gold,
                color: "#000",
              }}
            >
              Tải Ứng Dụng
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
