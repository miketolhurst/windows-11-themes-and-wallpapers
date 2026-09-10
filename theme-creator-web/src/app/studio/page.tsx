"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Sidebar from "../../components/Sidebar";
import PreviewCanvas from "../../components/PreviewCanvas";
import PostDownloadModal from "../../components/PostDownloadModal";
import { useThemeStore } from "../../store/useThemeStore";
import { decodeThemeFromUrl } from "../../lib/urlSharing";

export default function StudioPage() {
  const { isSidebarCollapsed, toggleSidebar, applyThemeConfig } = useThemeStore();

  // Load shared theme from URL params on initial mount
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search) {
      const decoded = decodeThemeFromUrl(window.location.search);
      if (decoded) {
        applyThemeConfig(decoded);
      }
    }
  }, [applyThemeConfig]);

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-black font-sans relative">
      <Sidebar />
      <PreviewCanvas />

      {/* Top Header Floating Quick Navigation */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
        <Link
          href="/"
          className="bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs px-3 py-2 rounded-xl shadow-xl font-medium flex items-center gap-1.5 border border-neutral-700/80 backdrop-blur transition-all hover:scale-105 active:scale-95"
          title="Back to Landing Page & Guide"
        >
          <span>←</span>
          <span>Showcase & Guide</span>
        </Link>
      </div>

      {/* Floating expand sidebar button when collapsed */}
      {isSidebarCollapsed && (
        <button
          onClick={toggleSidebar}
          className="absolute top-4 left-4 z-40 bg-neutral-900/90 hover:bg-neutral-800 text-white text-xs px-3.5 py-2 rounded-xl shadow-xl font-medium flex items-center gap-2 border border-neutral-700/80 backdrop-blur transition-all cursor-pointer hover:scale-105 active:scale-95"
          title="Open Theme Settings"
        >
          <span>⚙️</span>
          <span>Customize Theme</span>
        </button>
      )}

      {/* Post-Download Instructions Modal */}
      <PostDownloadModal />
    </main>
  );
}
