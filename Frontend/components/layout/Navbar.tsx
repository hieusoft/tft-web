"use client";

import Link from "next/link";
import { useState } from "react";
import { NAV_LINKS, SITE_CONFIG } from "@/lib/constants";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#1a1a1a] border-b border-[#2a2a2a]">
      {/* Top bar */}
      <div className="mx-auto max-w-[1400px] px-4">
        <div className="flex h-14 items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-yellow-500 shadow-lg shadow-yellow-500/30">
              <svg className="h-4 w-4 text-black" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="text-base font-bold text-white tracking-tight">MetaTFT</span>
          </Link>

          {/* Search bar */}
          <div className="flex-1 max-w-sm hidden md:block">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                suppressHydrationWarning
                type="text"
                placeholder="Tìm trang, người chơi, tướng, trang bị..."
                className="w-full rounded border border-[#3a3a3a] bg-[#111111] pl-9 pr-4 py-1.5 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-yellow-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded border border-[#3a3a3a] bg-[#111] px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-gray-400">Patch {SITE_CONFIG.patch}</span>
            </div>
            <button
              suppressHydrationWarning
              className="hidden sm:flex items-center gap-1.5 rounded bg-red-600 hover:bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors"
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Nav row */}
        <nav className="hidden md:flex items-end gap-0 border-t border-[#2a2a2a]">
          {NAV_LINKS.map((link) => (
            <div
              key={link.href}
              className="relative group"
              onMouseEnter={() => setActiveMenu(link.href)}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <Link
                href={link.href}
                className="flex items-center gap-1 px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white border-b-2 border-transparent hover:border-yellow-500 transition-colors"
              >
                {link.label}
                {link.sub.length > 0 && (
                  <svg className="h-3 w-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </Link>
              {/* Dropdown */}
              {link.sub.length > 0 && activeMenu === link.href && (
                <div className="absolute top-full left-0 mt-0 w-44 bg-[#222] border border-[#333] rounded-b shadow-xl z-50">
                  {link.sub.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-[#2a2a2a] transition-colors"
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#2a2a2a] bg-[#1a1a1a] px-4 py-3">
          {/* Mobile search */}
          <div className="relative mb-3">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              suppressHydrationWarning
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full rounded border border-[#3a3a3a] bg-[#111] pl-9 pr-4 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none"
            />
          </div>
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <div key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded transition-colors"
                >
                  {link.label}
                </Link>
                {link.sub.length > 0 && (
                  <div className="ml-4 flex flex-col gap-0.5">
                    {link.sub.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={() => setMobileOpen(false)}
                        className="block px-3 py-1.5 text-xs text-gray-500 hover:text-white transition-colors"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
