import React from "react";

export function Footer() {
  return (
    <footer className="bg-neutral-950 border-t border-white/10 text-neutral-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="flex items-center gap-2 text-white font-semibold">
            <span>🎨</span>
            <span>Windhawk Theme Studio</span>
          </div>
          <p className="text-xs text-neutral-500">
            Automated Windows 11 Personalization, XAML Styling & Styler Management.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
          <a
            href="https://windhawk.net"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Windhawk Official
          </a>
          <a
            href="https://projects.tolhurst.me"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Tolhurst Projects
          </a>
          <a
            href="https://github.com/ramensoftware/windhawk-mods"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Windhawk Mods Catalog
          </a>
        </div>

        <div className="text-xs text-neutral-500 text-center md:text-right">
          <p>© {new Date().getFullYear()} Mike Tolhurst. 100% Free & Open Source.</p>
          <p>Operates strictly in user-space without modifying Windows system files.</p>
        </div>
      </div>
    </footer>
  );
}
