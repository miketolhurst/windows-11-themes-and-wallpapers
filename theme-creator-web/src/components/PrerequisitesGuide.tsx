"use client";

import React, { useState } from "react";

export function PrerequisitesGuide() {
  const [copied, setCopied] = useState(false);

  const handleCopyWinget = async () => {
    try {
      await navigator.clipboard.writeText("winget install RamenSoftware.Windhawk");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <section id="prerequisites" className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-900/40 border-y border-white/5 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-blue-400 text-xs sm:text-sm font-semibold tracking-wider uppercase">
            Simple 3-Step Setup
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mt-2 mb-4">
            How It Works & Prerequisites
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            Windows 11 renders its shell via WinUI 3. We use the free, open-source Windhawk engine to safely inject translucent acrylic materials and accent brushes in memory without modifying a single system DLL.
          </p>
        </div>

        {/* 3 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* STEP 1 */}
          <div className="bg-neutral-950/70 border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-blue-500/40 transition-colors shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold text-sm flex items-center justify-center">
                  1
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Prerequisite Engine
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Install Windhawk Engine
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                Windhawk is a lightweight open-source system customization platform that allows mods to inject UI styling safely into Explorer.
              </p>
            </div>

            <div className="space-y-3">
              <div className="bg-neutral-900/90 border border-white/10 rounded-xl p-2.5 flex items-center justify-between gap-2">
                <code className="text-xs text-neutral-300 font-mono truncate select-all">
                  winget install RamenSoftware.Windhawk
                </code>
                <button
                  onClick={handleCopyWinget}
                  className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs px-2.5 py-1 rounded-lg border border-white/10 transition-colors cursor-pointer shrink-0"
                  aria-label="Copy winget command"
                >
                  {copied ? "✓ Copied!" : "📋 Copy"}
                </button>
              </div>
              <a
                href="https://windhawk.net"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
              >
                Or download installer from Windhawk.net →
              </a>
            </div>
          </div>

          {/* STEP 2 */}
          <div className="bg-neutral-950/70 border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-purple-500/40 transition-colors shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 font-bold text-sm flex items-center justify-center">
                  2
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Mod Extensions
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Enable the 3 Required Mods
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                Inside Windhawk, search the Mods tab and click <em>Details → Accept Risk and Download</em> for these three official stylers:
              </p>
            </div>

            <div className="space-y-2">
              <a
                href="https://windhawk.net/mods/windows-11-taskbar-styler"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 transition-all text-xs group"
              >
                <div className="flex items-center gap-2">
                  <span>🪟</span>
                  <span className="text-neutral-200 font-medium group-hover:text-white">
                    Windows 11 Taskbar Styler
                  </span>
                </div>
                <span className="text-neutral-500 group-hover:text-blue-400">↗</span>
              </a>

              <a
                href="https://windhawk.net/mods/windows-11-start-menu-styler"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 transition-all text-xs group"
              >
                <div className="flex items-center gap-2">
                  <span>🚀</span>
                  <span className="text-neutral-200 font-medium group-hover:text-white">
                    Windows 11 Start Menu Styler
                  </span>
                </div>
                <span className="text-neutral-500 group-hover:text-purple-400">↗</span>
              </a>

              <a
                href="https://windhawk.net/mods/windows-11-notification-center-styler"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 transition-all text-xs group"
              >
                <div className="flex items-center gap-2">
                  <span>🔔</span>
                  <span className="text-neutral-200 font-medium group-hover:text-white">
                    Windows 11 Notification Center Styler
                  </span>
                </div>
                <span className="text-neutral-500 group-hover:text-pink-400">↗</span>
              </a>
            </div>
          </div>

          {/* STEP 3 */}
          <div className="bg-neutral-950/70 border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-emerald-500/40 transition-colors shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-bold text-sm flex items-center justify-center">
                  3
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  One-Click Install
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Download & Apply Any Theme
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                Download a preset below or design your own in the Studio. Extract the <code className="text-xs text-emerald-400 bg-emerald-950/40 px-1 py-0.5 rounded">.zip</code> and run <code className="text-xs text-white bg-neutral-800 px-1.5 py-0.5 rounded">Apply_Theme.bat</code> as Administrator.
              </p>
            </div>

            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 text-xs text-neutral-300 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <span>⚡</span>
                <span>Under 3 Seconds</span>
              </div>
              <p className="text-neutral-400">
                The script writes registry accent palettes, updates the wallpaper, injects Windhawk XAML styles, and reloads Explorer automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
