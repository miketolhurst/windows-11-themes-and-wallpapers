# Design Specification: Web Studio App Cleanup, Refactoring & UX Optimization

**Date**: 2026-09-14  
**Scope**: `theme-creator-web`  
**Status**: Approved  

---

## 1. Objective & Problem Statement

The **Theme Creator** web application has expanded rapidly, introducing complex XAML generation, multi-surface component isolation, gradient editors, vector start buttons, and real-time live shell previewing.

While the feature set is complete and backed by 191 passing tests, several monolithic files now present maintenance challenges and performance bottlenecks:
1. **`Sidebar.tsx` (1,231 lines)**: A single monolithic component containing all controls, dialogs, accordions, and full-store subscriptions. Users must scroll through up to 8 vertical accordions to configure a theme.
2. **`exportEngine.ts` (1,123 lines)**: Couples gradient math, WinUI 3 XAML serialization, Windows registry formatting, `.bat` apply scripts, and JSZip bundling in a single file.
3. **`PreviewCanvas.tsx` (1,020 lines)**: Renders the entire Windows 11 desktop, wallpaper, taskbar, start menu, flyouts, and floating windows in one monolithic JSX block.
4. **State Subscriptions & Re-render Bottlenecks**: Top-level full-store destructuring (`const state = useThemeStore()`) triggers full-tree re-renders on every slider or color adjustment.

This design outlines a comprehensive modularization, UX upgrade (tabbed sidebar navigation), and state selector optimization for `theme-creator-web` while ensuring **100% backward compatibility** with zero test regressions.

---

## 2. Directory Structure & Architecture

```text
theme-creator-web/src/
├── types/
│   └── theme.ts                  # Centralized TypeScript definitions & interfaces
├── store/
│   ├── useThemeStore.ts          # Zustand store (preserves full public API)
│   └── useThemeStore.test.ts
├── lib/
│   ├── export/                   # Modular export subsystem
│   │   ├── index.ts              # Unified public API re-exporting all functions
│   │   ├── xamlGenerators.ts     # Gradient math, brush XAML, surface fills
│   │   ├── regBuilder.ts         # .reg content, classic context menu, shell tweaks
│   │   └── zipBundler.ts         # JSZip archive orchestration, batch scripts
│   ├── exportEngine.ts           # Re-export facade for backwards-compatible imports
│   ├── paletteEngine.ts          # Color math, harmonies, and extraction
│   ├── regParser.ts              # .reg import parsing
│   └── urlSharing.ts             # URL hash compression and decompression
├── components/
│   ├── sidebar/                  # Modular Sidebar components
│   │   ├── SidebarHeader.tsx     # Theme name, undo/redo, reset, collapse, share
│   │   ├── PaletteSection.tsx    # Colors, harmonies, wallpaper extraction
│   │   ├── ShellSection.tsx      # Materials, blur, opacity, dock, tweaks
│   │   ├── ComponentsSection.tsx # Component isolation & typography/animation triggers
│   │   └── LibrarySection.tsx    # Presets gallery, saved themes drawer, export triggers
│   ├── preview/                  # Modular Canvas components
│   │   ├── DesktopBackground.tsx # Wallpaper, desktop icons, active floating windows
│   │   ├── TaskbarPreview.tsx    # Start button, running apps, indicators, tray
│   │   ├── StartMenuPreview.tsx  # Search, pinned apps, recommended, power
│   │   └── FlyoutsPreview.tsx    # Action center, quick settings, calendar
│   ├── Sidebar.tsx               # Orchestrator with top tab navigation bar (~120 lines)
│   └── PreviewCanvas.tsx         # Orchestrator for view modes & canvas scale (~150 lines)
```

---

## 3. Detailed Component & Module Specifications

### 3.1 Shared Types (`src/types/theme.ts`)
Consolidates scattered domain types into a single clean module:
- `MaterialStyle`, `RunningIndicatorStyle`, `StartButtonType`, `StartButtonPresetId`
- `StartButtonConfig`, `RunningIndicatorConfig`, `ContextMenuOverride`, `FileExplorerOverride`
- `PreviewViewMode`, `GradientStop`, `GradientConfig`, `ComponentOverride`
- `TypographyConfig`, `AnimationConfig`, `SavedTheme`, `ThemeConfigSnapshot`, `ThemeState`

Both `useThemeStore.ts` and `lib/export/` re-export these types, ensuring external consumers and existing tests require no modifications.

### 3.2 Export Subsystem (`src/lib/export/`)
Splits the 1,123-line `exportEngine.ts` into single-responsibility modules:
- **`xamlGenerators.ts`**:
  - `calculateGradientPoints(angleDeg, expansionFactor)`
  - `generateGradientBrushXaml(config, opacity)`
  - `buildSurfaceFill(material, blurAmount, baseBgRgb, ...)`
  - Target mod builders: `buildTaskbarMod`, `buildStartMenuMod`, `buildNotificationCenterMod`, `buildContextMenuMod`, `buildFileExplorerMod`, `buildRunningIndicatorMod`.
- **`regBuilder.ts`**:
  - `escapeRegStr(str)`
  - `generateRegFileContent(themeConfig)`: Complete `.reg` generation with Windows 11 accent colors, Mica preferences, and Windhawk settings keys.
  - Classic Context Menu CLSID registry keys (`{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}`).
  - Shell tweaks registry entries (Compact Search, Hide Recommended, drop shadows).
- **`zipBundler.ts`**:
  - `generateBatScript(themeName)`: Windows batch file for registry import and Explorer restart.
  - `generateZipPayload(state)`: Coordinates XAML, registry, batch scripts, custom wallpapers, and creates the ZIP via `JSZip`.
  - `generateDirectApplyPayload(state)`: JSON payload for MCP direct application.
- **Public API (`src/lib/export/index.ts` & `src/lib/exportEngine.ts`)**:
  - Re-exports all functions from the three modules so existing imports and tests work transparently.

### 3.3 Sidebar Redesign & Modularization (`src/components/sidebar/`)
Replaces the infinite vertical scroll with an organized 4-tab workflow:

1. **Sticky Header (`SidebarHeader.tsx`)**:
   - Theme Name input with auto-save
   - Undo (`Ctrl+Z`) and Redo (`Ctrl+Y` / `Ctrl+Shift+Z`) buttons with active history indicators
   - Reset to defaults button
   - Import `.reg` file button
   - Share link generator with copy confirmation
   - Collapse Sidebar toggle button

2. **Tab Navigation Bar**:
   - Tabs: `[🎨 Colors]`, `[💻 Shell & Taskbar]`, `[🧩 Components]`, `[📦 Library & Export]`
   - Active state styling with keyboard accessibility.

3. **Tab Panels**:
   - **`PaletteSection.tsx`**: Primary Accent & Secondary Accent pickers, Harmony generator (Complementary, Analogous, Triadic, Monochromatic, Custom), 5-swatch palette display, wallpaper upload & one-click auto-palette extraction.
   - **`ShellSection.tsx`**: Taskbar mode (blur vs gradient), Material Styles (Acrylic, Mica, Mica Alt, Pure Black Neon, Matte Slate), Blur & Opacity sliders, Start Button & Indicators section, Shell Tweaks (Dock mode, dock margin, compact search, hide recommended, remove shadows, dynamic notification height).
   - **`ComponentsSection.tsx`**: Host for `ComponentIsolationSection` (per-surface overrides for Taskbar, Start Menu, Flyouts, Context Menu, File Explorer) and `TypographyAnimationSection`.
   - **`LibrarySection.tsx`**: Built-in Theme Presets with category filters, Saved Themes drawer (save, load, delete snapshots), Theme Diff modal trigger, Export ZIP & Direct Apply buttons.

4. **`Sidebar.tsx` Orchestrator**:
   - Coordinates active tab state (`activeTab`) and modal visibility (`isGradientModalOpen`, `gradientTarget`).
   - Renders modals and active tab view, reduced from 1,231 lines to ~120 lines.

### 3.4 Preview Canvas Modularization (`src/components/preview/`)
Splits `PreviewCanvas.tsx` into modular shell elements:
- **`DesktopBackground.tsx`**: Wallpaper background, desktop icons grid with toggleable visibility, and container for floating windows.
- **`TaskbarPreview.tsx`**: Windows 11 Taskbar with dock mode margins, custom Start Button (SVG presets/custom upload), running applications with indicator styles, and system tray.
- **`StartMenuPreview.tsx`**: Start menu with search bar, pinned grid, recommended items, user profile, and power controls.
- **`FlyoutsPreview.tsx`**: Quick Settings, Action Center notifications, and Calendar flyout.
- **`PreviewCanvas.tsx` Orchestrator**: Manages canvas toolbar (preview mode switcher, desktop icons toggle, window toggles), scale/zoom state, and embeds sub-views.

---

## 4. State & Selector Optimization

Replace bulk store subscriptions:
```typescript
// Unoptimized: Triggers re-render on any store change
const state = useThemeStore();
```
With scoped atomic selectors:
```typescript
// Optimized: Only re-renders when relevant slice changes
const accentColor = useThemeStore((s) => s.accentColor);
const taskbarBlur = useThemeStore((s) => s.taskbarBlur);
const setTaskbarBlur = useThemeStore((s) => s.setTaskbarBlur);
```
This ensures zero unnecessary re-renders during high-frequency slider adjustments and color wheel interactions.

---

## 5. Testing & Verification Plan

1. **Unit Tests**:
   - Execute full test suite: `npm test -- --run`.
   - All 24 test suites and 191 unit tests must pass with 0 failures.
2. **Type Safety & Build**:
   - Run `npx tsc --noEmit` to verify type completeness and clean re-exports.
   - Run `npm run build` to ensure Next.js production bundle succeeds without warnings.
3. **UX & Functional Verification**:
   - Switching sidebar tabs correctly displays each section.
   - Sliders and color pickers update the preview canvas in real time.
   - Presets load correctly.
   - Export ZIP produces valid archives.
