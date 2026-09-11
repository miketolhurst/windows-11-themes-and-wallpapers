"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FeaturedTheme, getThemeStudioUrl } from "../data/featuredThemes";
import { generateZipPayload } from "../lib/exportEngine";
import { ThemeState } from "../store/useThemeStore";

interface ThemeLightboxProps {
  theme: FeaturedTheme | null;
  onClose: () => void;
}

export function ThemeLightbox({ theme, onClose }: ThemeLightboxProps) {
  const [downloading, setDownloading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const basePath = "/theme-creator";

  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!theme) return null;

  const handleDownload = async () => {
    try {
      setDownloading(true);

      // Attempt to fetch the wallpaper binary data for bundling
      let wallpaperData: Uint8Array | null = null;
      try {
        const wpRes = await fetch(`${basePath}/wallpapers/${theme.wallpaperFileName}`);
        if (wpRes.ok) {
          const ab = await wpRes.arrayBuffer();
          wallpaperData = new Uint8Array(ab);
        }
      } catch {
        // Continue without embedded wallpaper if offline/failed
      }

      // Build mock state for export engine
      const state: ThemeState = {
        themeName: theme.name,
        accentColor: theme.config.accentColor,
        secondaryAccent: theme.config.secondaryAccent,
        isLightMode: theme.config.mode === "light",
        taskbarMode: "blur",
        cornerRadius: theme.config.taskbarRadius,
        borderThickness: 2,
        wallpaperUrl: `${basePath}/wallpapers/${theme.wallpaperFileName}`,
        wallpaperData,
        customStartIconUrl: null,
        customStartIconData: null,
        hideRecommended: false,
        compactSearch: false,
        dynamicNotificationHeight: false,
        removeDropShadows: false,
        taskbarBlur: theme.config.taskbarBlur,
        startMenuBlur: theme.config.startMenuBlur,
        notificationBlur: theme.config.ncBlur,
        taskbarOpacity: theme.config.taskbarOpacity,
        startMenuOpacity: 97,
        notificationOpacity: 97,
        materialStyle: theme.config.materialStyle ?? "fluent-acrylic",
        noiseOpacity: 0.05,
        tintSaturation: 0.85,
        dockMode: theme.config.dockMode ?? false,
        dockMargin: theme.config.dockMargin ?? 12,
        runningIndicatorStyle: theme.config.runningIndicatorStyle ?? "bar",
        colorHarmony: "custom",
        activePane: null,
        showDesktopIcons: false,
        showWindowPreview: false,
        isSidebarCollapsed: false,
        showDownloadModal: false,
        savedThemes: [],
        past: [],
        future: [],
        setThemeName: () => {},
        setAccentColor: () => {},
        setSecondaryAccent: () => {},
        setIsLightMode: () => {},
        setTaskbarMode: () => {},
        setMaterialStyle: () => {},
        setNoiseOpacity: () => {},
        setTintSaturation: () => {},
        setDockMode: () => {},
        setDockMargin: () => {},
        setRunningIndicatorStyle: () => {},
        setColorHarmony: () => {},
        setCornerRadius: () => {},
        setBorderThickness: () => {},
        setWallpaper: () => {},
        setCustomStartIcon: () => {},
        setHideRecommended: () => {},
        setCompactSearch: () => {},
        setDynamicNotificationHeight: () => {},
        setRemoveDropShadows: () => {},
        setTaskbarBlur: () => {},
        setStartMenuBlur: () => {},
        setNotificationBlur: () => {},
        setTaskbarOpacity: () => {},
        setStartMenuOpacity: () => {},
        setNotificationOpacity: () => {},
        setActivePane: () => {},
        setShowDesktopIcons: () => {},
        setShowWindowPreview: () => {},
        setIsSidebarCollapsed: () => {},
        toggleSidebar: () => {},
        setShowDownloadModal: () => {},
        saveCurrentTheme: () => {},
        loadSavedTheme: () => {},
        deleteSavedTheme: () => {},
        undo: () => {},
        redo: () => {},
        canUndo: () => false,
        canRedo: () => false,
        applyThemeConfig: () => {},
        resetToDefaults: () => {},
      };

      const zipBlob = await generateZipPayload(state);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${theme.name.replace(/\s+/g, "_")}_Theme.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to generate theme ZIP:", err);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}${getThemeStudioUrl(theme, basePath)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-neutral-900 border border-white/15 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer text-sm"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-400/30">
            {theme.tag}
          </span>
          <span className="text-xs text-neutral-400">
            {theme.config.mode === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
          {theme.name}
        </h3>
        <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
          {theme.description}
        </p>

        {/* Big Wallpaper & Shell Mockup */}
        <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/15 relative mb-6 shadow-2xl bg-neutral-950">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${basePath}/wallpapers/${theme.wallpaperFileName}`}
            alt={theme.name}
            className="w-full h-full object-cover"
          />

          {/* Simulated Windows 11 Taskbar */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-3 shadow-xl">
            <div
              className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold shadow"
              style={{ backgroundColor: theme.config.accentColor }}
            >
              ⊞
            </div>
            <div className="w-4 h-4 rounded bg-white/20" />
            <div className="w-4 h-4 rounded bg-white/20" />
            <div className="w-4 h-4 rounded bg-white/20" />
          </div>
        </div>

        {/* Color Details & Specs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-neutral-950/80 border border-white/10 rounded-xl p-3 text-center">
            <span className="text-[11px] font-semibold text-neutral-400 block mb-1">Primary Accent</span>
            <div className="flex items-center justify-center gap-2">
              <span
                className="w-4 h-4 rounded-full border border-white/20"
                style={{ backgroundColor: theme.config.accentColor }}
              />
              <span className="text-xs font-mono text-white font-bold">{theme.config.accentColor}</span>
            </div>
          </div>

          <div className="bg-neutral-950/80 border border-white/10 rounded-xl p-3 text-center">
            <span className="text-[11px] font-semibold text-neutral-400 block mb-1">Secondary Accent</span>
            <div className="flex items-center justify-center gap-2">
              <span
                className="w-4 h-4 rounded-full border border-white/20"
                style={{ backgroundColor: theme.config.secondaryAccent }}
              />
              <span className="text-xs font-mono text-white font-bold">{theme.config.secondaryAccent}</span>
            </div>
          </div>

          <div className="bg-neutral-950/80 border border-white/10 rounded-xl p-3 text-center">
            <span className="text-[11px] font-semibold text-neutral-400 block mb-1">Material Style</span>
            <span className="text-xs font-semibold text-white capitalize">
              {theme.config.materialStyle?.replace(/-/g, ' ') ?? "Fluent Acrylic"}
            </span>
          </div>

          <div className="bg-neutral-950/80 border border-white/10 rounded-xl p-3 text-center">
            <span className="text-[11px] font-semibold text-neutral-400 block mb-1">Layout Mode</span>
            <span className="text-xs font-semibold text-white">
              {theme.config.dockMode ? "Floating Dock" : "Standard"}
            </span>
          </div>
        </div>

        {/* Package info banner */}
        <div className="mb-6 p-3 bg-neutral-950/60 border border-white/10 rounded-xl text-xs text-neutral-400 flex items-center gap-2.5">
          <span className="text-base">📦</span>
          <span className="leading-relaxed">
            Includes elevated installer (<code className="text-blue-400 font-mono">Install_Theme.ps1</code>), <code className="text-neutral-300 font-mono">Apply_Theme.bat</code>, Windhawk Styler backups, and instant rollback (<code className="text-emerald-400 font-mono">Restore_Defaults.ps1</code>).
          </span>
        </div>

        {/* Modal CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm py-3.5 px-6 rounded-xl shadow-xl shadow-blue-500/25 border border-blue-400/40 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>{downloading ? "⏳" : "⬇️"}</span>
            <span>{downloading ? "Preparing Package..." : "Download Theme (.zip)"}</span>
          </button>

          <Link
            href={getThemeStudioUrl(theme)}
            className="w-full sm:flex-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 hover:text-white font-semibold text-sm py-3.5 px-6 rounded-xl border border-white/15 transition-all flex items-center justify-center gap-2 text-center"
          >
            <span>🎨</span>
            <span>Customize in Studio</span>
          </Link>

          <button
            onClick={handleCopyLink}
            className="w-full sm:w-auto bg-neutral-950 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs py-3.5 px-4 rounded-xl border border-white/10 transition-colors cursor-pointer"
            title="Copy Direct Link"
          >
            {copiedLink ? "✓ Link Copied" : "🔗 Share Link"}
          </button>
        </div>
      </div>
    </div>
  );
}
