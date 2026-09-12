"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Sidebar from "../../components/Sidebar";
import PreviewCanvas from "../../components/PreviewCanvas";
import PostDownloadModal from "../../components/PostDownloadModal";
import { ThemeDiffModal } from "../../components/ThemeDiffModal";
import { useThemeStore, ThemeConfigSnapshot } from "../../store/useThemeStore";
import { decodeThemeFromUrl } from "../../lib/urlSharing";
import { parseRegFile } from "../../lib/regParser";

export default function StudioPage() {
  const { isSidebarCollapsed, toggleSidebar, applyThemeConfig } = useThemeStore();
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [incomingConfig, setIncomingConfig] = useState<Partial<ThemeConfigSnapshot> | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load shared theme from URL params on initial mount
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search) {
      const decoded = decodeThemeFromUrl(window.location.search);
      if (decoded) {
        applyThemeConfig(decoded);
      }
    }
  }, [applyThemeConfig]);

  const handleRegFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".reg")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        const parsed = parseRegFile(content);
        setIncomingConfig(parsed);
        setIsDiffModalOpen(true);
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleRegFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleRegFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <main
      className="flex h-screen w-screen overflow-hidden bg-black font-sans relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Sidebar />
      <PreviewCanvas />

      {/* Drag & Drop Visual Cue */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-50 pointer-events-none bg-blue-600/20 backdrop-blur-sm border-4 border-dashed border-blue-400 flex items-center justify-center m-4 rounded-3xl animate-fadeIn">
          <div className="bg-zinc-900/90 border border-white/20 p-6 rounded-2xl shadow-2xl text-center">
            <span className="text-4xl block mb-2">📥</span>
            <p className="text-lg font-bold text-white">Drop .reg file to Inspect & Import</p>
            <p className="text-xs text-zinc-400 mt-1">Changes will be shown in the Theme Diff Inspector</p>
          </div>
        </div>
      )}

      {/* Top Header Floating Quick Navigation */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".reg"
          className="hidden"
          onChange={handleFileInputChange}
          aria-label="Upload .reg file"
        />

        <button
          onClick={() => {
            setIncomingConfig(null);
            setIsDiffModalOpen(true);
          }}
          className="bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs px-3 py-2 rounded-xl shadow-xl font-medium flex items-center gap-1.5 border border-neutral-700/80 backdrop-blur transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="Inspect Active Theme Settings or Compare Incoming Diffs"
        >
          <span>🔍</span>
          <span>Inspect Theme</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs px-3 py-2 rounded-xl shadow-xl font-medium flex items-center gap-1.5 border border-neutral-700/80 backdrop-blur transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="Import .reg Theme File and Inspect Diffs"
        >
          <span>📥</span>
          <span>Import .reg</span>
        </button>

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

      {/* Theme Diff & Inspector Modal */}
      <ThemeDiffModal
        isOpen={isDiffModalOpen}
        incomingConfig={incomingConfig}
        onClose={() => {
          setIsDiffModalOpen(false);
          setIncomingConfig(null);
        }}
        onApply={(config) => {
          applyThemeConfig(config);
        }}
      />
    </main>
  );
}
