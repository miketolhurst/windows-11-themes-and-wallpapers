import React from "react";
import Link from "next/link";

interface NavbarProps {
  isStudio?: boolean;
}

export function Navbar({ isStudio = false }: NavbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-neutral-950/80 border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="text-2xl filter drop-shadow group-hover:scale-110 transition-transform">🎨</span>
            <div className="flex flex-col">
              <span className="text-white font-bold text-base sm:text-lg tracking-tight group-hover:text-blue-400 transition-colors">
                Windhawk Theme Studio
              </span>
              <span className="text-neutral-400 text-xs hidden sm:block">
                Windows 11 Customization Suite
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation & CTAs */}
        <nav className="flex items-center gap-4 sm:gap-6">
          {!isStudio ? (
            <>
              <a
                href="#showcase"
                className="text-neutral-300 hover:text-white text-sm font-medium transition-colors hidden md:inline-block"
              >
                Showcase
              </a>
              <a
                href="#prerequisites"
                className="text-neutral-300 hover:text-white text-sm font-medium transition-colors hidden md:inline-block"
              >
                Prerequisites & Setup
              </a>
              <a
                href="#faq"
                className="text-neutral-300 hover:text-white text-sm font-medium transition-colors hidden sm:inline-block"
              >
                FAQ
              </a>
              <Link
                href="/studio"
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-lg shadow-blue-500/20 border border-blue-400/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
              >
                <span>Launch Theme Studio</span>
                <span>→</span>
              </Link>
            </>
          ) : (
            <Link
              href="/"
              className="bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 hover:text-white text-xs sm:text-sm px-3.5 py-1.5 rounded-xl border border-white/10 transition-all flex items-center gap-2"
            >
              <span>←</span>
              <span>Showcase & Guide</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
