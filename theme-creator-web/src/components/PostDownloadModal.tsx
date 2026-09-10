import React, { useState } from 'react';
import { useThemeStore } from '../store/useThemeStore';

export default function PostDownloadModal() {
  const { showDownloadModal, setShowDownloadModal, themeName, accentColor } = useThemeStore();
  const [copied, setCopied] = useState(false);

  if (!showDownloadModal) return null;

  const instructionsText = `How to apply your "${themeName}" theme:
1. Extract the downloaded Windhawk_${themeName.replace(/[^a-zA-Z0-9_-]/g, '_')}_Theme.zip file.
2. Ensure Windhawk is installed and running on your Windows 11 system.
3. Verify that the following 3 styler mods are installed in Windhawk:
   - Windows 11 Taskbar Styler
   - Windows 11 Start Menu Styler
   - Windows 11 Notification Center Styler
4. Right-click "Apply_Theme.bat" and select "Run as administrator".
5. Windows Explorer will restart and your customized theme will be live!`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(instructionsText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-md bg-neutral-900 border border-neutral-700/80 rounded-2xl shadow-2xl p-6 flex flex-col gap-5 text-white relative"
        style={{ boxShadow: `0 0 40px -10px ${accentColor}33` }}
      >
        {/* Close X */}
        <button
          onClick={() => setShowDownloadModal(false)}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          title="Close"
        >
          ✕
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md text-white font-bold"
            style={{ backgroundColor: accentColor }}
          >
            ✓
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Theme Package Ready!</h3>
            <p className="text-xs text-neutral-400">Your custom Windhawk theme zip has downloaded.</p>
          </div>
        </div>

        {/* Steps */}
        <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-4 flex flex-col gap-3 text-xs">
          <div className="flex gap-2.5">
            <span className="font-bold text-blue-400">1.</span>
            <span className="text-neutral-300">
              <strong className="text-white">Extract</strong> the downloaded <code className="text-blue-300 bg-blue-950/50 px-1 py-0.5 rounded">.zip</code> to any folder.
            </span>
          </div>
          <div className="flex gap-2.5">
            <span className="font-bold text-blue-400">2.</span>
            <span className="text-neutral-300">
              Ensure <strong className="text-white">Windhawk</strong> is running with the Taskbar, Start Menu, and Notification Center Styler mods installed.
            </span>
          </div>
          <div className="flex gap-2.5">
            <span className="font-bold text-blue-400">3.</span>
            <span className="text-neutral-300">
              Right-click <code className="text-blue-300 bg-blue-950/50 px-1 py-0.5 rounded">Apply_Theme.bat</code> and select <strong className="text-white">&quot;Run as administrator&quot;</strong>.
            </span>
          </div>
          <div className="flex gap-2.5">
            <span className="font-bold text-blue-400">4.</span>
            <span className="text-neutral-300">
              Windows Explorer will automatically reload with your new custom colors and blur!
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 py-2 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs font-medium text-neutral-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {copied ? '✓ Copied!' : '📋 Copy Instructions'}
          </button>
          <button
            onClick={() => setShowDownloadModal(false)}
            className="flex-1 py-2 px-3 rounded-lg text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
            style={{ backgroundColor: accentColor }}
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}
