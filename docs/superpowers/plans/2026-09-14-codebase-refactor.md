# Web Studio App Cleanup, Refactoring & UX Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modularize the three 1,000+ line monoliths (`exportEngine.ts`, `Sidebar.tsx`, `PreviewCanvas.tsx`), upgrade the Sidebar UX with intuitive categorized tabs, eliminate full-tree re-renders via atomic Zustand selectors, and centralize domain types with zero test regressions.

**Architecture:** 
Decompose the codebase into clear single-responsibility domain modules under `src/types/`, `src/lib/export/`, `src/components/sidebar/`, and `src/components/preview/`. Provide backward-compatible public facades (`src/lib/exportEngine.ts` and `src/store/useThemeStore.ts`) so all 191 existing unit tests continue to pass without changes to their imports.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Zustand 5, Tailwind CSS 4, JSZip 3, Vitest 5.

## Global Constraints

- Must maintain 100% backward compatibility for all existing public functions in `exportEngine.ts` and `useThemeStore.ts`.
- All 191 unit tests across 24 test suites must pass at every task boundary.
- Zero TypeScript compiler errors (`npx tsc --noEmit`).
- No file in the refactored architecture should exceed ~350 lines.

---

### Task 1: Centralize Shared Domain Types (`src/types/theme.ts`)

**Files:**
- Create: `theme-creator-web/src/types/theme.ts`
- Modify: `theme-creator-web/src/store/useThemeStore.ts:1-120`

**Interfaces:**
- Consumes: None
- Produces: `MaterialStyle`, `RunningIndicatorStyle`, `StartButtonType`, `StartButtonPresetId`, `StartButtonConfig`, `RunningIndicatorConfig`, `ContextMenuOverride`, `FileExplorerOverride`, `PreviewViewMode`, `GradientStop`, `GradientConfig`, `ComponentOverride`, `TypographyConfig`, `AnimationConfig`, `SavedTheme`, `ThemeConfigSnapshot`, `ThemeState`.

- [ ] **Step 1: Write `src/types/theme.ts`**

```typescript
export type MaterialStyle = 'fluent-acrylic' | 'pure-black-neon' | 'linear-gradient' | 'matte-slate' | 'mica' | 'mica-alt';
export type RunningIndicatorStyle = 'line' | 'dot' | 'pill' | 'glow' | 'off' | 'bar' | 'standard' | 'hidden';

export type StartButtonType = 'default' | 'preset' | 'custom';
export type StartButtonPresetId =
  | 'win11-minimal'
  | 'win98-retro'
  | 'apple-glyph'
  | 'cyberpunk-hex'
  | 'linux-tux'
  | 'minimal-diamond'
  | 'gaming-rog'
  | 'fluent-orb';

export interface StartButtonConfig {
  type: StartButtonType;
  presetId?: StartButtonPresetId;
  customIconUrl?: string | null;
  colorMode: 'accent' | 'secondary' | 'custom';
  customColor: string;
  size: number;
}

export interface RunningIndicatorConfig {
  style: RunningIndicatorStyle;
  activeColorMode: 'accent' | 'white' | 'custom';
  activeCustomColor: string;
  inactiveColorMode: 'subtle-white' | 'accent' | 'custom';
  inactiveCustomColor: string;
  indicatorSize: number;
}

export interface ComponentOverride {
  enabled: boolean;
  materialStyle?: MaterialStyle;
  customColor?: string;
  gradient?: GradientConfig;
  opacity?: number;
  blur?: number;
  cornerRadius?: number;
  borderThickness?: number;
}

export interface ContextMenuOverride extends ComponentOverride {
  enableClassicMenu?: boolean;
  itemHoverAccent?: boolean;
}

export interface FileExplorerOverride extends ComponentOverride {
  tabStyle: 'integrated' | 'floating' | 'accent-border';
  showCommandBarTint: boolean;
  activeTabColorMode: 'accent' | 'surface';
}

export type PreviewViewMode = 'desktop' | 'file-explorer' | 'terminal' | 'context-menu';

export interface GradientStop {
  id: string;
  color: string;
  offset: number;
}

export interface GradientConfig {
  type: 'linear' | 'radial';
  angle: number;
  stops: GradientStop[];
}

export interface TypographyConfig {
  fontFamily: string;
  fontWeight: '300' | '400' | '500' | '600' | '700';
  characterSpacing: number;
}

export interface AnimationConfig {
  speed: 'instant' | 'snappy' | 'default' | 'smooth';
  durationMs: number;
  easing: 'fluent-spring' | 'decelerate' | 'linear';
}

export interface ThemeConfigSnapshot {
  themeName: string;
  accentColor: string;
  secondaryAccent: string;
  isLightMode: boolean;
  taskbarMode: 'blur' | 'gradient';
  materialStyle: MaterialStyle;
  cornerRadius: number;
  borderThickness: number;
  dockMode: boolean;
  dockMargin: number;
  runningIndicatorStyle: RunningIndicatorStyle;
  colorHarmony: string;
  noiseOpacity: number;
  tintSaturation: number;
  wallpaperUrl: string | null;
  customStartIconUrl: string | null;
  hideRecommended: boolean;
  compactSearch: boolean;
  dynamicNotificationHeight: boolean;
  removeDropShadows: boolean;
  taskbarBlur: number;
  startMenuBlur: number;
  notificationBlur: number;
  taskbarOpacity: number;
  startMenuOpacity: number;
  notificationOpacity: number;
  globalGradient: GradientConfig;
  taskbarOverride: ComponentOverride;
  startMenuOverride: ComponentOverride;
  flyoutOverride: ComponentOverride;
  contextMenuOverride: ContextMenuOverride;
  fileExplorerOverride: FileExplorerOverride;
  typography: TypographyConfig;
  animations: AnimationConfig;
  startButton: StartButtonConfig;
  runningIndicators: RunningIndicatorConfig;
}

export interface SavedTheme {
  id: string;
  name: string;
  date: string;
  config: ThemeConfigSnapshot;
}
```

- [ ] **Step 2: Update `src/store/useThemeStore.ts` to import and re-export these types**

Import all types from `../types/theme` and re-export them from `useThemeStore.ts`.

- [ ] **Step 3: Run TypeScript compiler and test suite**

Run: `npx tsc --noEmit` and `npm test -- --run` in `theme-creator-web`.  
Expected: 0 type errors, 191 tests passing.

- [ ] **Step 4: Commit**

```bash
git add src/types/theme.ts src/store/useThemeStore.ts
git commit -m "refactor(types): centralize shared domain types into src/types/theme.ts"
```

---

### Task 2: Decompose Export Engine (`src/lib/export/`)

**Files:**
- Create: `theme-creator-web/src/lib/export/xamlGenerators.ts`
- Create: `theme-creator-web/src/lib/export/regBuilder.ts`
- Create: `theme-creator-web/src/lib/export/zipBundler.ts`
- Create: `theme-creator-web/src/lib/export/index.ts`
- Modify: `theme-creator-web/src/lib/exportEngine.ts`

**Interfaces:**
- `xamlGenerators.ts`: `calculateGradientPoints`, `generateGradientBrushXaml`, `buildSurfaceFill`, `buildTaskbarMod`, `buildStartMenuMod`, `buildNotificationCenterMod`, `buildContextMenuMod`, `buildFileExplorerMod`, `buildRunningIndicatorMod`.
- `regBuilder.ts`: `escapeRegStr`, `generateRegFileContent`, classic menu & tweak registry generators.
- `zipBundler.ts`: `generateBatScript`, `generateZipPayload`, `generateDirectApplyPayload`.
- `index.ts`: Re-exports all functions from above modules.
- `exportEngine.ts`: Simple facade re-exporting `* from './export'`.

- [ ] **Step 1: Extract `src/lib/export/xamlGenerators.ts`**

Move gradient math, brush XAML generation, surface fill resolvers, and Windhawk styler mod builders into `xamlGenerators.ts`.

- [ ] **Step 2: Extract `src/lib/export/regBuilder.ts`**

Move `escapeRegStr` and `generateRegFileContent` into `regBuilder.ts`.

- [ ] **Step 3: Extract `src/lib/export/zipBundler.ts`**

Move `generateBatScript`, `generateZipPayload`, and `generateDirectApplyPayload` into `zipBundler.ts`.

- [ ] **Step 4: Create `src/lib/export/index.ts` and convert `src/lib/exportEngine.ts` into a re-export facade**

```typescript
// src/lib/exportEngine.ts
export * from './export';
```

- [ ] **Step 5: Run tests and type check**

Run: `npx tsc --noEmit` and `npm test -- src/lib/exportEngine.test.ts`  
Expected: All 23 export engine tests pass without modifying `exportEngine.test.ts`.

- [ ] **Step 6: Commit**

```bash
git add src/lib/export/ src/lib/exportEngine.ts
git commit -m "refactor(export): split monolithic exportEngine into domain-driven modules"
```

---

### Task 3: Modularize Preview Canvas (`src/components/preview/`)

**Files:**
- Create: `theme-creator-web/src/components/preview/DesktopBackground.tsx`
- Create: `theme-creator-web/src/components/preview/TaskbarPreview.tsx`
- Create: `theme-creator-web/src/components/preview/StartMenuPreview.tsx`
- Create: `theme-creator-web/src/components/preview/FlyoutsPreview.tsx`
- Modify: `theme-creator-web/src/components/PreviewCanvas.tsx`

**Interfaces:**
- `DesktopBackground`: Renders wallpaper, desktop icons, and active floating windows.
- `TaskbarPreview`: Renders dock mode taskbar, start button, active running apps, indicators, and system tray.
- `StartMenuPreview`: Renders search bar, pinned apps, recommended items, and profile footer.
- `FlyoutsPreview`: Renders action center, quick settings, and calendar.
- `PreviewCanvas.tsx`: Canvas toolbar, zoom/scale container, embeds above 4 subviews.

- [ ] **Step 1: Create `TaskbarPreview.tsx`**

Extract taskbar layout, start button SVG rendering, running app indicators, and tray clock into `src/components/preview/TaskbarPreview.tsx`.

- [ ] **Step 2: Create `StartMenuPreview.tsx`**

Extract the Start Menu modal/popup and search bar into `src/components/preview/StartMenuPreview.tsx`.

- [ ] **Step 3: Create `FlyoutsPreview.tsx`**

Extract Quick Settings, Action Center, and Calendar flyouts into `src/components/preview/FlyoutsPreview.tsx`.

- [ ] **Step 4: Create `DesktopBackground.tsx`**

Extract desktop icons and container for floating windows into `src/components/preview/DesktopBackground.tsx`.

- [ ] **Step 5: Refactor `PreviewCanvas.tsx` into clean orchestrator**

Import and compose the 4 sub-views. Keep all data attributes and test IDs (`data-testid="preview-canvas"`, etc.) so tests pass unchanged.

- [ ] **Step 6: Run tests and type check**

Run: `npm test -- src/components/PreviewCanvas.test.tsx`  
Expected: All 23 tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/components/preview/ src/components/PreviewCanvas.tsx
git commit -m "refactor(preview): modularize PreviewCanvas into dedicated shell preview components"
```

---

### Task 4: Modularize Sidebar & Implement Tabbed UX (`src/components/sidebar/`)

**Files:**
- Create: `theme-creator-web/src/components/sidebar/SidebarHeader.tsx`
- Create: `theme-creator-web/src/components/sidebar/PaletteSection.tsx`
- Create: `theme-creator-web/src/components/sidebar/ShellSection.tsx`
- Create: `theme-creator-web/src/components/sidebar/ComponentsSection.tsx`
- Create: `theme-creator-web/src/components/sidebar/LibrarySection.tsx`
- Modify: `theme-creator-web/src/components/Sidebar.tsx`

**Interfaces:**
- `SidebarHeader`: Theme name input, undo/redo buttons, reset, import, share, collapse toggle.
- `PaletteSection`: Accent/secondary color popovers, color harmony selector, 5-swatch palette display, wallpaper upload & extract palette button.
- `ShellSection`: Taskbar mode (blur/gradient), materials, blur/opacity sliders, start button & indicators section, shell tweaks.
- `ComponentsSection`: Component isolation accordion & typography/animation section.
- `LibrarySection`: Theme presets gallery, saved themes drawer, theme diff trigger, download ZIP & direct apply buttons.
- `Sidebar.tsx`: Tab state (`'palette' | 'shell' | 'components' | 'library'`), renders sticky header, tab bar, active panel, and gradient modal.

- [ ] **Step 1: Create `SidebarHeader.tsx`**

Extract theme name, undo/redo, reset, import, share, and collapse button.

- [ ] **Step 2: Create `PaletteSection.tsx`**

Extract primary and secondary color pickers, harmony selector, swatches, wallpaper upload, and auto-extraction.

- [ ] **Step 3: Create `ShellSection.tsx`**

Extract taskbar mode, material styling, sliders, start button & indicator section, and shell tweaks.

- [ ] **Step 4: Create `ComponentsSection.tsx`**

Extract component isolation and typography/animations.

- [ ] **Step 5: Create `LibrarySection.tsx`**

Extract presets gallery, saved themes drawer, theme diff trigger, and export buttons.

- [ ] **Step 6: Refactor `Sidebar.tsx` with top tab bar and panel switching**

Render the tab navigation (`[🎨 Colors]`, `[💻 Shell]`, `[🧩 Components]`, `[📦 Library]`) and mount the appropriate sub-section. Ensure all test queries continue to find elements.

- [ ] **Step 7: Run tests and type check**

Run: `npm test -- src/components/Sidebar.test.tsx`  
Expected: All 14 tests pass.

- [ ] **Step 8: Commit**

```bash
git add src/components/sidebar/ src/components/Sidebar.tsx
git commit -m "feat(ui): implement tabbed sidebar navigation and modularize sub-sections"
```

---

### Task 5: State Selector & Re-render Optimization

**Files:**
- Modify: `theme-creator-web/src/components/sidebar/*.tsx`
- Modify: `theme-creator-web/src/components/preview/*.tsx`
- Modify: `theme-creator-web/src/components/Sidebar.tsx`
- Modify: `theme-creator-web/src/components/PreviewCanvas.tsx`

**Interfaces:**
- Replace bulk `const state = useThemeStore()` with atomic selectors:
  ```typescript
  const accentColor = useThemeStore((s) => s.accentColor);
  const setAccentColor = useThemeStore((s) => s.setAccentColor);
  ```

- [ ] **Step 1: Optimize selectors in `SidebarHeader.tsx` & `PaletteSection.tsx`**
- [ ] **Step 2: Optimize selectors in `ShellSection.tsx`, `ComponentsSection.tsx`, `LibrarySection.tsx`**
- [ ] **Step 3: Optimize selectors in `TaskbarPreview.tsx`, `StartMenuPreview.tsx`, `FlyoutsPreview.tsx`, `DesktopBackground.tsx`**
- [ ] **Step 4: Verify full test suite passes**

Run: `npm test -- --run`  
Expected: All 191 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/
git commit -m "perf(state): replace bulk store destructuring with atomic selectors to eliminate re-render cascades"
```

---

### Task 6: Full Regression Verification & Production Build

**Files:**
- Entire `theme-creator-web` workspace

- [ ] **Step 1: Run TypeScript compiler**

Run: `npx tsc --noEmit`  
Expected: 0 errors.

- [ ] **Step 2: Run all Vitest suites**

Run: `npm test -- --run`  
Expected: 24 test files passed, 191 tests passed.

- [ ] **Step 3: Run production Next.js build**

Run: `npm run build`  
Expected: Build successfully completes with 0 errors.

- [ ] **Step 4: Final commit & Walkthrough documentation**

```bash
git commit --allow-empty -m "chore: complete web studio codebase refactoring and optimization"
```
