import React from 'react';
import { useThemeStore } from '../../store/useThemeStore';
import FileExplorerPreviewWindow from '../FileExplorerPreviewWindow';
import TerminalPreviewWindow from '../TerminalPreviewWindow';
import ContextMenuPreview from '../ContextMenuPreview';

export interface DesktopBackgroundProps {
  showContextMenu?: boolean;
  contextMenuPos?: { x: number; y: number } | null;
  onCloseContextMenu?: () => void;
  onDismiss?: () => void;
}

export default function DesktopBackground({
  showContextMenu = false,
  contextMenuPos = null,
  onCloseContextMenu = () => {},
  onDismiss = () => {},
}: DesktopBackgroundProps) {
  const showDesktopIcons = useThemeStore((s) => s.showDesktopIcons);
  const showWindowPreview = useThemeStore((s) => s.showWindowPreview);
  const setShowWindowPreview = useThemeStore((s) => s.setShowWindowPreview);
  const previewViewMode = useThemeStore((s) => s.previewViewMode);
  const setPreviewViewMode = useThemeStore((s) => s.setPreviewViewMode);

  return (
    <>
      {/* Mobile warning overlay */}
      <div className="lg:hidden absolute top-3 left-3 right-3 z-50 bg-amber-500/90 text-neutral-950 px-3 py-2 rounded-lg text-xs font-medium shadow flex items-center gap-2">
        <span>⚠️</span>
        <span>Windhawk Studio is optimized for larger displays to accurately render the desktop canvas.</span>
      </div>

      {/* Desktop click area to dismiss open flyouts */}
      <div
        className="absolute inset-0 z-10"
        onClick={onDismiss}
      />

      {/* Desktop Icons Layer */}
      {showDesktopIcons && (
        <div className="absolute left-5 top-5 flex flex-col gap-4 pointer-events-auto z-15">
          {[
            { name: 'Recycle Bin', icon: '🗑️' },
            { name: 'This PC', icon: '💻' },
            { name: 'Files', icon: '📁' },
            { name: 'Edge', icon: '🌐' },
          ].map((item) => (
            <div
              key={item.name}
              className="w-20 p-2 rounded-lg flex flex-col items-center text-center cursor-pointer border border-transparent hover:bg-white/15 hover:border-white/20 transition-all group"
            >
              <span className="text-3xl mb-1 filter drop-shadow-md">{item.icon}</span>
              <span className="text-[11px] text-white font-normal leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] truncate max-w-full">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Active Preview Window according to previewViewMode or showWindowPreview */}
      <div className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 max-w-[95%] max-h-[80%] flex items-center justify-center pointer-events-auto z-15">
        {previewViewMode === 'file-explorer' ? (
          <FileExplorerPreviewWindow onClose={() => setPreviewViewMode('desktop')} />
        ) : previewViewMode === 'terminal' ? (
          <TerminalPreviewWindow onClose={() => setPreviewViewMode('desktop')} />
        ) : previewViewMode === 'context-menu' ? (
          <ContextMenuPreview isFloating={true} />
        ) : showWindowPreview ? (
          <FileExplorerPreviewWindow onClose={() => setShowWindowPreview(false)} />
        ) : null}
      </div>

      {/* Right-click Context Menu overlay */}
      {showContextMenu && (
        <ContextMenuPreview
          x={contextMenuPos?.x}
          y={contextMenuPos?.y}
          onClose={onCloseContextMenu}
        />
      )}
    </>
  );
}
