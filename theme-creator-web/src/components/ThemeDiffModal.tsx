import React, { useState, useEffect, useMemo } from 'react';
import { compareThemeConfigs, ThemeDiffItem } from '../lib/regParser';
import { useThemeStore, takeSnapshot, ThemeConfigSnapshot } from '../store/useThemeStore';

export interface ThemeDiffModalProps {
  isOpen: boolean;
  incomingConfig: Partial<ThemeConfigSnapshot> | null;
  onClose: () => void;
  onApply: (config: Partial<ThemeConfigSnapshot>) => void;
}

function isHexColor(val: string): boolean {
  return typeof val === 'string' && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(val.trim());
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function DiffIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 3h5v5" />
      <path d="M8 21H3v-5" />
      <path d="M21 3l-7 7" />
      <path d="M3 21l7-7" />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function ThemeDiffModal({
  isOpen,
  incomingConfig,
  onClose,
  onApply,
}: ThemeDiffModalProps): React.JSX.Element | null {
  const themeState = useThemeStore();
  const currentSnapshot = useMemo(() => takeSnapshot(themeState), [themeState]);
  const [searchFilter, setSearchFilter] = useState('');
  const [onlyChanged, setOnlyChanged] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const diffItems: ThemeDiffItem[] = useMemo(() => {
    return compareThemeConfigs(currentSnapshot, incomingConfig || {});
  }, [currentSnapshot, incomingConfig]);

  const changedCount = useMemo(() => {
    return diffItems.filter((d) => d.hasChanged).length;
  }, [diffItems]);

  const filteredItems = useMemo(() => {
    return diffItems.filter((item) => {
      if (onlyChanged && !item.hasChanged) {
        return false;
      }
      if (!searchFilter.trim()) {
        return true;
      }
      const q = searchFilter.toLowerCase();
      return (
        item.label.toLowerCase().includes(q) ||
        item.key.toLowerCase().includes(q) ||
        item.currentValue.toLowerCase().includes(q) ||
        item.incomingValue.toLowerCase().includes(q)
      );
    });
  }, [diffItems, searchFilter, onlyChanged]);

  if (!isOpen) return null;

  const handleApply = () => {
    if (incomingConfig) {
      onApply(incomingConfig);
    }
    onClose();
  };

  const renderValue = (val: string) => {
    if (isHexColor(val)) {
      return (
        <div className="flex items-center gap-2 font-mono text-xs">
          <span
            className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm shrink-0"
            style={{ backgroundColor: val }}
          />
          <span>{val}</span>
        </div>
      );
    }
    return <span className="text-xs break-all">{val}</span>;
  };

  return (
    <div
      data-testid="diff-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="diff-modal-title"
        className="w-full max-w-3xl bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-7 flex flex-col gap-5 text-white relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <DiffIcon />
            </span>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 id="diff-modal-title" className="text-lg font-bold text-white tracking-tight">
                  Theme Inspector & Diff
                </h2>
                {changedCount > 0 ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {changedCount} {changedCount === 1 ? 'change' : 'changes'} detected
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-400 border border-white/10">
                    No changes detected
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Compare current theme settings against incoming configuration or inspect active registry properties.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
            title="Close modal"
          >
            <XIcon />
          </button>
        </div>

        {/* Toolbar: Search and Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter settings..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-zinc-950/70 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer select-none bg-zinc-950/40 border border-white/5 rounded-xl px-3 py-1.5 hover:bg-zinc-800/50 transition-colors">
            <input
              type="checkbox"
              checked={onlyChanged}
              onChange={(e) => setOnlyChanged(e.target.checked)}
              className="rounded border-white/20 bg-zinc-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
            />
            <span>Show only changed</span>
          </label>
        </div>

        {/* Diff Table */}
        <div className="border border-white/10 rounded-xl overflow-hidden bg-zinc-950/50 max-h-[50vh] flex flex-col">
          <div className="overflow-x-auto overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-zinc-900 border-b border-white/10 text-zinc-400 font-semibold z-10">
                <tr>
                  <th className="py-2.5 px-4 w-1/3">Setting Name</th>
                  <th className="py-2.5 px-4 w-1/3">Current Value</th>
                  <th className="py-2.5 px-4 w-1/3">Incoming Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-normal">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-zinc-500">
                      No matching settings found
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr
                      key={item.key}
                      className={`transition-colors ${
                        item.hasChanged
                          ? 'bg-amber-500/10 hover:bg-amber-500/15'
                          : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      <td className="py-2.5 px-4 align-middle">
                        <div className="flex items-center gap-2">
                          {item.hasChanged && (
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 shadow-[0_0_6px_rgba(251,191,36,0.8)]"
                              title="Changed setting"
                            />
                          )}
                          <span className={`font-medium ${item.hasChanged ? 'text-amber-200' : 'text-zinc-200'}`}>
                            {item.label}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-zinc-300 align-middle">
                        {renderValue(item.currentValue)}
                      </td>
                      <td className="py-2.5 px-4 align-middle">
                        <div className="flex items-center justify-between gap-2">
                          <span className={item.hasChanged ? 'text-amber-300 font-medium' : 'text-zinc-300'}>
                            {renderValue(item.incomingValue)}
                          </span>
                          {item.hasChanged && (
                            <span className="px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0">
                              Diff
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div className="text-xs text-zinc-500">
            Showing {filteredItems.length} of {diffItems.length} settings
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 border border-white/10 text-xs font-medium text-zinc-300 hover:text-white transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={!incomingConfig}
              className="py-2 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckIcon />
              <span>Apply Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
