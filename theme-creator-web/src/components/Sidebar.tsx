import React, { useState } from 'react';
import { useThemeStore, GradientConfig } from '../store/useThemeStore';
import GradientEditorModal from './GradientEditorModal';
import {
  SidebarHeader,
  PaletteSection,
  ShellSection,
  ComponentsSection,
  LibrarySection,
} from './sidebar/index';

export type SidebarTab = 'all' | 'colors' | 'shell' | 'components' | 'library';

interface TabItem {
  id: SidebarTab;
  label: string;
}

const NAV_TABS: TabItem[] = [
  { id: 'all', label: 'All' },
  { id: 'colors', label: '🎨 Colors' },
  { id: 'shell', label: '💻 Shell' },
  { id: 'components', label: '🧩 Components' },
  { id: 'library', label: '📦 Library' },
];

export default function Sidebar() {
  const {
    isSidebarCollapsed,
    globalGradient,
    setGlobalGradient,
    taskbarOverride,
    setTaskbarOverride,
    startMenuOverride,
    setStartMenuOverride,
    flyoutOverride,
    setFlyoutOverride,
    contextMenuOverride,
    setContextMenuOverride,
    fileExplorerOverride,
    setFileExplorerOverride,
  } = useThemeStore();

  const [activeTab, setActiveTab] = useState<SidebarTab>('all');
  const [extractedSwatches, setExtractedSwatches] = useState<string[]>([]);
  const [isGradientModalOpen, setIsGradientModalOpen] = useState(false);
  const [gradientTarget, setGradientTarget] = useState<
    'global' | 'taskbar' | 'startMenu' | 'flyout' | 'contextMenu' | 'fileExplorer'
  >('global');

  const handleOpenGradientModal = (
    target: 'global' | 'taskbar' | 'startMenu' | 'flyout' | 'contextMenu' | 'fileExplorer'
  ) => {
    setGradientTarget(target);
    setIsGradientModalOpen(true);
  };

  const getGradientForTarget = (
    target: 'global' | 'taskbar' | 'startMenu' | 'flyout' | 'contextMenu' | 'fileExplorer'
  ): GradientConfig => {
    if (target === 'taskbar') return taskbarOverride?.gradient || globalGradient;
    if (target === 'startMenu') return startMenuOverride?.gradient || globalGradient;
    if (target === 'flyout') return flyoutOverride?.gradient || globalGradient;
    if (target === 'contextMenu') return contextMenuOverride?.gradient || globalGradient;
    if (target === 'fileExplorer') return fileExplorerOverride?.gradient || globalGradient;
    return globalGradient;
  };

  const getModalTitleForTarget = (
    target: 'global' | 'taskbar' | 'startMenu' | 'flyout' | 'contextMenu' | 'fileExplorer'
  ) => {
    if (target === 'taskbar') return 'Edit Taskbar Gradient';
    if (target === 'startMenu') return 'Edit Start Menu Gradient';
    if (target === 'flyout') return 'Edit Flyout Gradient';
    if (target === 'contextMenu') return 'Edit Context Menu Gradient';
    if (target === 'fileExplorer') return 'Edit File Explorer Gradient';
    return 'Edit Global Gradient';
  };

  const handleSaveGradient = (config: GradientConfig) => {
    if (gradientTarget === 'taskbar') {
      setTaskbarOverride({ gradient: config });
    } else if (gradientTarget === 'startMenu') {
      setStartMenuOverride({ gradient: config });
    } else if (gradientTarget === 'flyout') {
      setFlyoutOverride({ gradient: config });
    } else if (gradientTarget === 'contextMenu') {
      setContextMenuOverride({ gradient: config });
    } else if (gradientTarget === 'fileExplorer') {
      setFileExplorerOverride({ gradient: config });
    } else {
      setGlobalGradient(config);
    }
  };

  return (
    <div
      className={`h-full bg-neutral-900 text-white flex flex-col relative z-30 border-r border-neutral-800 transition-all duration-300 select-none overflow-x-hidden ${
        isSidebarCollapsed ? 'w-0 p-0 border-0 opacity-0 overflow-hidden pointer-events-none' : 'w-88 p-4 md:p-5'
      }`}
    >
      <SidebarHeader />

      {/* Tab Navigation Bar */}
      <div
        className="flex items-center gap-1 overflow-x-auto py-2 mb-2 border-b border-neutral-800 no-scrollbar shrink-0"
        role="tablist"
        aria-label="Sidebar Navigation"
      >
        {NAV_TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-neutral-800/80 text-neutral-400 hover:text-white hover:bg-neutral-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Scrollable Subsections */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1 flex flex-col gap-4.5 scrollbar-thin scrollbar-thumb-neutral-700">
        {(activeTab === 'all' || activeTab === 'colors') && (
          <PaletteSection
            extractedSwatches={extractedSwatches}
            setExtractedSwatches={setExtractedSwatches}
          />
        )}

        {(activeTab === 'all' || activeTab === 'shell') && (
          <ShellSection onOpenGradientModal={handleOpenGradientModal} />
        )}

        {(activeTab === 'all' || activeTab === 'components') && (
          <ComponentsSection onOpenGradientModal={handleOpenGradientModal} />
        )}

        {(activeTab === 'all' || activeTab === 'library') && (
          <LibrarySection onResetExtractedSwatches={() => setExtractedSwatches([])} />
        )}
      </div>

      {/* Advanced Gradient Editor Modal */}
      <GradientEditorModal
        isOpen={isGradientModalOpen}
        title={getModalTitleForTarget(gradientTarget)}
        initialGradient={getGradientForTarget(gradientTarget)}
        onSave={handleSaveGradient}
        onClose={() => setIsGradientModalOpen(false)}
      />
    </div>
  );
}
