"use client";

import React from "react";
import Link from "next/link";
import { FeaturedTheme, FEATURED_THEMES, getThemeStudioUrl } from "../data/featuredThemes";

interface ThemeShowcaseProps {
  onSelectTheme: (theme: FeaturedTheme) => void;
}

export function ThemeShowcase({ onSelectTheme }: ThemeShowcaseProps) {
  const [heroTheme, ...otherThemes] = FEATURED_THEMES;
  const basePath = "/theme-creator";

  return (
    <section id="showcase" className="py-24 px-4 sm:px-6 lg:px-8 bg-neutral-950 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-blue-400 text-xs sm:text-sm font-semibold tracking-wider uppercase">
            Curated Aesthetics
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mt-2 mb-4">
            Featured Themes Gallery
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            Click any theme to inspect high-resolution desktop mockups, download the complete installer package, or open it directly in the Theme Studio to customize every detail.
          </p>
        </div>

        {/* PRIMARY HERO THEME: Google Assistant Wave */}
        {heroTheme && (
          <div className="mb-12 bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 border-2 border-blue-500/40 hover:border-blue-400 rounded-3xl p-6 sm:p-10 shadow-2xl transition-all relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              {/* Left Column: Preview Image */}
              <div className="lg:col-span-7">
                <div
                  onClick={() => onSelectTheme(heroTheme)}
                  className="aspect-video w-full rounded-2xl overflow-hidden border border-white/15 relative shadow-2xl cursor-pointer group/img"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${basePath}/wallpapers/${heroTheme.wallpaperFileName}`}
                    alt={heroTheme.name}
                    className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
                    <div className="flex items-center gap-3">
                      <span className="bg-blue-600 text-white font-semibold text-xs px-3 py-1 rounded-full shadow">
                        🔍 Click for Fullscreen Mockup
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Meta & Actions */}
              <div className="lg:col-span-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                      {heroTheme.tag}
                    </span>
                    <span className="text-xs font-medium text-neutral-400">
                      {heroTheme.config.mode === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode"}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
                    {heroTheme.name}
                  </h3>

                  <p className="text-neutral-300 text-sm leading-relaxed mb-6">
                    {heroTheme.description}
                  </p>

                  {/* Accent Swatches */}
                  <div className="bg-neutral-900/90 border border-white/10 rounded-xl p-4 mb-6">
                    <span className="text-xs font-semibold text-neutral-400 block mb-2">Accent Palette:</span>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-6 h-6 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: heroTheme.config.accentColor }}
                        />
                        <span className="text-xs font-mono text-neutral-300">
                          {heroTheme.config.accentColor}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-6 h-6 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: heroTheme.config.secondaryAccent }}
                        />
                        <span className="text-xs font-mono text-neutral-300">
                          {heroTheme.config.secondaryAccent}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => onSelectTheme(heroTheme)}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-center"
                  >
                    🔍 Preview Details
                  </button>
                  <Link
                    href={getThemeStudioUrl(heroTheme)}
                    className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white font-medium text-xs sm:text-sm py-3 px-4 rounded-xl border border-white/10 transition-all text-center flex items-center justify-center gap-1.5"
                  >
                    <span>🎨</span>
                    <span>Open in Studio</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REMAINING THEMES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherThemes.map((theme) => (
            <div
              key={theme.id}
              className="bg-neutral-900/60 hover:bg-neutral-900 border border-white/10 hover:border-white/20 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-lg group"
            >
              <div>
                {/* Thumbnail */}
                <div
                  onClick={() => onSelectTheme(theme)}
                  className="aspect-video w-full rounded-xl overflow-hidden border border-white/10 relative mb-4 cursor-pointer bg-neutral-950"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${basePath}/wallpapers/${theme.wallpaperFileName}`}
                    alt={theme.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur border border-white/10">
                      {theme.tag}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                    {theme.name}
                  </h4>
                  <span className="text-xs text-neutral-400">
                    {theme.config.mode === "dark" ? "🌙 Dark" : "☀️ Light"}
                  </span>
                </div>

                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed mb-4">
                  {theme.description}
                </p>

                {/* Accent Swatches */}
                <div className="flex items-center gap-2 mb-5">
                  <span
                    className="w-4 h-4 rounded-full border border-white/20"
                    style={{ backgroundColor: theme.config.accentColor }}
                    title={`Primary: ${theme.config.accentColor}`}
                  />
                  <span
                    className="w-4 h-4 rounded-full border border-white/20"
                    style={{ backgroundColor: theme.config.secondaryAccent }}
                    title={`Secondary: ${theme.config.secondaryAccent}`}
                  />
                  <span className="text-[11px] font-mono text-neutral-500">
                    {theme.config.accentColor} / {theme.config.secondaryAccent}
                  </span>
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                <button
                  onClick={() => onSelectTheme(theme)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold py-2 px-3 rounded-lg border border-white/10 transition-colors cursor-pointer text-center"
                >
                  🔍 Preview Details
                </button>
                <Link
                  href={getThemeStudioUrl(theme)}
                  className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-medium py-2 px-3 rounded-lg border border-white/10 transition-colors flex items-center justify-center gap-1"
                  title="Open in Theme Studio"
                >
                  <span>🎨 Studio</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
