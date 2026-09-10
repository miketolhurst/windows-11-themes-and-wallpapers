import React from "react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-neutral-950">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[400px] h-[300px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Value Prop Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-neutral-300 text-xs sm:text-sm font-medium mb-8 backdrop-blur shadow-sm">
          <span className="text-blue-400">✨</span>
          <span>100% Free & Open-Source • Non-Destructive User-Space Theming</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight sm:leading-none mb-6">
          Transform Windows 11. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
            Your Way.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed mb-10">
          Design custom Taskbars, Start Menus, and accent palettes in your browser,
          or install hand-crafted community themes with one click — no coding or system file patching required.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/studio"
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm sm:text-base px-7 py-3.5 rounded-xl shadow-xl shadow-blue-500/25 border border-blue-400/40 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>🚀</span>
            <span>Launch Theme Studio</span>
          </Link>
          <a
            href="#prerequisites"
            className="w-full sm:w-auto bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 hover:text-white font-medium text-sm sm:text-base px-6 py-3.5 rounded-xl border border-white/10 transition-all hover:border-white/20 flex items-center justify-center gap-2"
          >
            <span>📖</span>
            <span>How It Works & Setup</span>
          </a>
        </div>
      </div>
    </section>
  );
}
