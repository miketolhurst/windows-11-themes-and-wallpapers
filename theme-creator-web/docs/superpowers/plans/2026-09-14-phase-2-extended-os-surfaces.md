# Phase 2: Extended OS Surfaces & Shell Customization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Phase 2 features for Windows 11 Theme Creator: Independent Context Menu and File Explorer WinUI 3 Theming, Multi-Window WYSIWYG Previews (File Explorer, Terminal, Context Menu), Curated Start Button Vector Icons with HEX colorization, and Customizable Running App Indicators.

**Architecture:** Extend Zustand store schema with backwards-compatible configurations for Start button vectors, running indicators, context menus, and file explorer overrides. Create reusable vector presets in `startButtonVectors.ts`. Build dedicated sidebar controls (`StartButtonAndIndicatorsSection.tsx` and 5-tab `ComponentIsolationSection.tsx`). Expand `PreviewCanvas.tsx` with floating window simulations for File Explorer and Windows Terminal, and canvas right-click context menu simulation. Update `exportEngine.ts` to generate WinUI 3 XAML for context menus, file explorer tabs, indicator geometry, `start_icon.png` bundle packaging, and Windows 10 classic context menu CLSID toggle.

**Tech Stack:** React 19, Next.js 16, TypeScript, Tailwind CSS, Zustand, JSZip, Lucide React, Vitest, React Testing Library.

## Global Constraints

- Preserve 100% backward compatibility with existing saved themes, presets in `presets.ts`, and shared URL formats.
- All unit tests must pass with 0 failures (`npx vitest run`).
- Next.js production build (`npm run build`) must succeed with 0 type errors.
- Ensure all exported Windhawk XAML follows Windows 11 WinUI 3 visual tree targeting rules.
- Color selection for Start button vectors and running indicators must use the HEX-only `ColorPickerPopover`.

---

### Task 1: Theme Store Phase 2 State Extensions & Types

**Files:**
- Modify: `src/store/useThemeStore.ts`
- Modify: `src/store/useThemeStore.test.ts`

**Interfaces:**
- Consumes: Existing `ThemeConfigSnapshot` and `ThemeState` from `src/store/useThemeStore.ts`.
- Produces:
  - `export type StartButtonType = 'default' | 'preset' | 'custom';`
  - `export type StartButtonPresetId = 'win11-minimal' | 'win98-retro' | 'apple-glyph' | 'cyberpunk-hex' | 'linux-tux' | 'minimal-diamond' | 'gaming-rog' | 'fluent-orb';`
  - `export interface StartButtonConfig { type: StartButtonType; presetId?: StartButtonPresetId; customIconUrl?: string | null; colorMode: 'accent' | 'secondary' | 'custom'; customColor: string; size: number; }`
  - `export type RunningIndicatorStyle = 'line' | 'dot' | 'pill' | 'glow' | 'off';`
  - `export interface RunningIndicatorConfig { style: RunningIndicatorStyle; activeColorMode: 'accent' | 'white' | 'custom'; activeCustomColor: string; inactiveColorMode: 'subtle-white' | 'accent' | 'custom'; inactiveCustomColor: string; indicatorSize: number; }`
  - `export interface ContextMenuOverride extends ComponentOverride { enableClassicMenu?: boolean; itemHoverAccent?: boolean; }`
  - `export interface FileExplorerOverride extends ComponentOverride { tabStyle: 'integrated' | 'floating' | 'accent-border'; showCommandBarTint: boolean; activeTabColorMode: 'accent' | 'surface'; }`
  - `export type PreviewViewMode = 'desktop' | 'file-explorer' | 'terminal' | 'context-menu';`
  - Actions: `setStartButton`, `setRunningIndicator`, `setContextMenuOverride`, `setFileExplorerOverride`, `setPreviewViewMode`.

- [ ] **Step 1: Write the failing tests**

Add tests to `src/store/useThemeStore.test.ts`:
```typescript
describe('Phase 2 useThemeStore extensions', () => {
  beforeEach(() => {
    useThemeStore.getState().resetToDefaults();
  });

  it('initializes with default Phase 2 properties', () => {
    const state = useThemeStore.getState();
    expect(state.startButton).toEqual({
      type: 'default',
      presetId: 'win11-minimal',
      customIconUrl: null,
      colorMode: 'accent',
      customColor: '#0078D4',
      size: 20,
    });
    expect(state.runningIndicator).toEqual({
      style: 'line',
      activeColorMode: 'accent',
      activeCustomColor: '#0078D4',
      inactiveColorMode: 'subtle-white',
      inactiveCustomColor: '#FFFFFF',
      indicatorSize: 3,
    });
    expect(state.contextMenuOverride).toEqual({
      enabled: false,
      enableClassicMenu: false,
      itemHoverAccent: true,
      materialStyle: 'fluent-acrylic',
      opacity: 95,
      blur: 20,
      cornerRadius: 8,
      borderThickness: 1,
    });
    expect(state.fileExplorerOverride).toEqual({
      enabled: false,
      tabStyle: 'integrated',
      showCommandBarTint: false,
      activeTabColorMode: 'accent',
      materialStyle: 'mica',
      opacity: 95,
      blur: 20,
    });
    expect(state.previewViewMode).toBe('desktop');
  });

  it('updates start button configuration', () => {
    const { setStartButton } = useThemeStore.getState();
    setStartButton({ type: 'preset', presetId: 'cyberpunk-hex', colorMode: 'custom', customColor: '#00FFCC', size: 24 });
    const state = useThemeStore.getState();
    expect(state.startButton.type).toBe('preset');
    expect(state.startButton.presetId).toBe('cyberpunk-hex');
    expect(state.startButton.customColor).toBe('#00FFCC');
    expect(state.startButton.size).toBe(24);
  });

  it('updates running indicator configuration', () => {
    const { setRunningIndicator } = useThemeStore.getState();
    setRunningIndicator({ style: 'dot', activeColorMode: 'white', indicatorSize: 4 });
    const state = useThemeStore.getState();
    expect(state.runningIndicator.style).toBe('dot');
    expect(state.runningIndicator.activeColorMode).toBe('white');
    expect(state.runningIndicator.indicatorSize).toBe(4);
  });

  it('updates context menu override and file explorer override', () => {
    const { setContextMenuOverride, setFileExplorerOverride, setPreviewViewMode } = useThemeStore.getState();
    setContextMenuOverride({ enabled: true, enableClassicMenu: true });
    setFileExplorerOverride({ enabled: true, tabStyle: 'floating' });
    setPreviewViewMode('file-explorer');
    const state = useThemeStore.getState();
    expect(state.contextMenuOverride.enabled).toBe(true);
    expect(state.contextMenuOverride.enableClassicMenu).toBe(true);
    expect(state.fileExplorerOverride.tabStyle).toBe('floating');
    expect(state.previewViewMode).toBe('file-explorer');
  });

  it('preserves Phase 2 state in snapshot undo and redo', () => {
    const { setStartButton, undo, redo } = useThemeStore.getState();
    setStartButton({ type: 'preset', presetId: 'linux-tux', customColor: '#EAA812' });
    expect(useThemeStore.getState().startButton.presetId).toBe('linux-tux');
    undo();
    expect(useThemeStore.getState().startButton.presetId).toBe('win11-minimal');
    redo();
    expect(useThemeStore.getState().startButton.presetId).toBe('linux-tux');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/store/useThemeStore.test.ts`  
Expected: FAIL with missing properties / actions on `useThemeStore`.

- [ ] **Step 3: Implement Phase 2 state in `src/store/useThemeStore.ts`**

1. Define `StartButtonType`, `StartButtonPresetId`, `StartButtonConfig`, `RunningIndicatorStyle`, `RunningIndicatorConfig`, `ContextMenuOverride`, `FileExplorerOverride`, and `PreviewViewMode`.
2. Extend `ThemeConfigSnapshot` and `ThemeState` with the new fields and actions.
3. Update `DEFAULT_THEME_STATE` with safe defaults:
   - `startButton`: `{ type: 'default', presetId: 'win11-minimal', customIconUrl: null, colorMode: 'accent', customColor: '#0078D4', size: 20 }`
   - `runningIndicator`: `{ style: 'line', activeColorMode: 'accent', activeCustomColor: '#0078D4', inactiveColorMode: 'subtle-white', inactiveCustomColor: '#FFFFFF', indicatorSize: 3 }`
   - `contextMenuOverride`: `{ enabled: false, enableClassicMenu: false, itemHoverAccent: true, materialStyle: 'fluent-acrylic', opacity: 95, blur: 20, cornerRadius: 8, borderThickness: 1 }`
   - `fileExplorerOverride`: `{ enabled: false, tabStyle: 'integrated', showCommandBarTint: false, activeTabColorMode: 'accent', materialStyle: 'mica', opacity: 95, blur: 20 }`
   - `previewViewMode`: `'desktop'`
4. Update `takeSnapshot` to include all new fields in history.
5. Implement `setStartButton`, `setRunningIndicator`, `setContextMenuOverride`, `setFileExplorerOverride`, and `setPreviewViewMode`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/store/useThemeStore.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/store/useThemeStore.ts src/store/useThemeStore.test.ts
git commit -m "feat(store): add Phase 2 state for start buttons, running indicators, context menus, and explorer overrides"
```

---

### Task 2: Start Button Vectors & Running Indicator Sidebar Section

**Files:**
- Create: `src/lib/startButtonVectors.ts`
- Create: `src/lib/startButtonVectors.test.ts`
- Create: `src/components/StartButtonAndIndicatorsSection.tsx`
- Create: `src/components/StartButtonAndIndicatorsSection.test.tsx`
- Modify: `src/components/Sidebar.tsx`
- Modify: `src/components/Sidebar.test.tsx`

**Interfaces:**
- Consumes: `StartButtonConfig`, `RunningIndicatorConfig`, `StartButtonPresetId`, `RunningIndicatorStyle` from `src/store/useThemeStore.ts`.
- Produces:
  - `export interface StartButtonPreset { id: StartButtonPresetId; name: string; renderSvg: (color: string, size: number) => React.ReactNode; }`
  - `export const START_BUTTON_PRESETS: StartButtonPreset[];`
  - `export function renderStartButtonSvg(presetId: StartButtonPresetId, color: string, size: number): React.ReactNode;`
  - `export function StartButtonAndIndicatorsSection(): React.JSX.Element;`

- [ ] **Step 1: Write the failing tests**

1. Create `src/lib/startButtonVectors.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { START_BUTTON_PRESETS, renderStartButtonSvg } from './startButtonVectors';

describe('startButtonVectors', () => {
  it('contains 8 curated presets', () => {
    expect(START_BUTTON_PRESETS).toHaveLength(8);
    const ids = START_BUTTON_PRESETS.map((p) => p.id);
    expect(ids).toContain('win11-minimal');
    expect(ids).toContain('win98-retro');
    expect(ids).toContain('apple-glyph');
    expect(ids).toContain('cyberpunk-hex');
    expect(ids).toContain('linux-tux');
    expect(ids).toContain('minimal-diamond');
    expect(ids).toContain('gaming-rog');
    expect(ids).toContain('fluent-orb');
  });

  it('renders SVG for each preset with the specified color and size', () => {
    START_BUTTON_PRESETS.forEach((preset) => {
      const svg = renderStartButtonSvg(preset.id, '#FF0055', 24);
      expect(svg).toBeDefined();
    });
  });
});
```

2. Create `src/components/StartButtonAndIndicatorsSection.test.tsx`:
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { StartButtonAndIndicatorsSection } from './StartButtonAndIndicatorsSection';
import { useThemeStore } from '@/store/useThemeStore';

describe('StartButtonAndIndicatorsSection', () => {
  beforeEach(() => {
    useThemeStore.getState().resetToDefaults();
  });

  it('renders start button mode selector and preset dropdown', () => {
    render(<StartButtonAndIndicatorsSection />);
    expect(screen.getByText('Start Button & Indicators')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Windows Default/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Vector Presets/i })).toBeInTheDocument();
  });

  it('changes vector preset from dropdown', () => {
    render(<StartButtonAndIndicatorsSection />);
    fireEvent.click(screen.getByRole('button', { name: /Vector Presets/i }));
    const dropdown = screen.getByLabelText(/Start Button Icon/i);
    fireEvent.change(dropdown, { target: { value: 'cyberpunk-hex' } });
    expect(useThemeStore.getState().startButton.presetId).toBe('cyberpunk-hex');
  });

  it('changes running indicator style', () => {
    render(<StartButtonAndIndicatorsSection />);
    const dotButton = screen.getByRole('button', { name: /^Dot$/i });
    fireEvent.click(dotButton);
    expect(useThemeStore.getState().runningIndicator.style).toBe('dot');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/startButtonVectors.test.ts src/components/StartButtonAndIndicatorsSection.test.tsx`  
Expected: FAIL (`Cannot find module './startButtonVectors'`).

- [ ] **Step 3: Implement `src/lib/startButtonVectors.ts` and `src/components/StartButtonAndIndicatorsSection.tsx`**

1. In `src/lib/startButtonVectors.ts`, implement the 8 clean SVG presets using JSX (`win11-minimal`, `win98-retro`, `apple-glyph`, `cyberpunk-hex`, `linux-tux`, `minimal-diamond`, `gaming-rog`, `fluent-orb`), parameterized by `color` and `size`.
2. In `src/components/StartButtonAndIndicatorsSection.tsx`:
   - Start button mode selector (`Windows Default`, `Vector Presets`, `Upload Custom`).
   - For `Vector Presets`: render a compact `<select aria-label="Start Button Icon">` dropdown.
   - Color Mode selection pills: `Sync Accent`, `Sync Secondary`, `Custom HEX` (opening `ColorPickerPopover`).
   - Icon size slider (16px to 32px).
   - Running indicator style pills: `Line`, `Dot`, `Pill`, `Glow`, `Off`.
   - Active & Inactive color choices + size slider (1px to 6px).
3. In `src/components/Sidebar.tsx`:
   - Add `<StartButtonAndIndicatorsSection />` beneath Colors & Styling.
   - Add "Preview Surfaces & Windows" segmented buttons: `[Desktop]`, `[File Explorer]`, `[Terminal]`, `[Context Menu]`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/startButtonVectors.test.ts src/components/StartButtonAndIndicatorsSection.test.tsx src/components/Sidebar.test.tsx`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/startButtonVectors.ts src/lib/startButtonVectors.test.ts src/components/StartButtonAndIndicatorsSection.tsx src/components/StartButtonAndIndicatorsSection.test.tsx src/components/Sidebar.tsx src/components/Sidebar.test.tsx
git commit -m "feat(ui): add Start Button vector presets, running indicators, and sidebar preview surface switcher"
```

---

### Task 3: Extended Component Isolation (Context Menu & File Explorer Tabs)

**Files:**
- Modify: `src/components/ComponentIsolationSection.tsx`
- Modify: `src/components/ComponentIsolationSection.test.tsx`

**Interfaces:**
- Consumes: `ContextMenuOverride`, `FileExplorerOverride`, `setContextMenuOverride`, `setFileExplorerOverride` from `src/store/useThemeStore.ts`.
- Produces: Updated `ComponentIsolationSection` with 5 segmented tabs: `[Taskbar]`, `[Start Menu]`, `[Flyouts]`, `[Context Menu]`, `[File Explorer]`.

- [ ] **Step 1: Write the failing tests**

Update `src/components/ComponentIsolationSection.test.tsx`:
```typescript
it('renders 5 component isolation tabs', () => {
  render(<ComponentIsolationSection />);
  expect(screen.getByRole('button', { name: /^Taskbar$/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /^Start Menu$/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /^Flyouts$/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /^Context Menu$/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /^File Explorer$/i })).toBeInTheDocument();
});

it('toggles context menu override and classic context menu switch', () => {
  render(<ComponentIsolationSection />);
  fireEvent.click(screen.getByRole('button', { name: /^Context Menu$/i }));
  const toggle = screen.getByLabelText(/Enable Context Menu Override/i);
  fireEvent.click(toggle);
  expect(useThemeStore.getState().contextMenuOverride.enabled).toBe(true);

  const classicToggle = screen.getByLabelText(/Use Windows 10 Classic Context Menu/i);
  fireEvent.click(classicToggle);
  expect(useThemeStore.getState().contextMenuOverride.enableClassicMenu).toBe(true);
});

it('toggles file explorer override and tab style', () => {
  render(<ComponentIsolationSection />);
  fireEvent.click(screen.getByRole('button', { name: /^File Explorer$/i }));
  const toggle = screen.getByLabelText(/Enable File Explorer Override/i);
  fireEvent.click(toggle);
  expect(useThemeStore.getState().fileExplorerOverride.enabled).toBe(true);

  const floatingTabButton = screen.getByRole('button', { name: /^Floating$/i });
  fireEvent.click(floatingTabButton);
  expect(useThemeStore.getState().fileExplorerOverride.tabStyle).toBe('floating');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/ComponentIsolationSection.test.tsx`  
Expected: FAIL (`Context Menu` tab not found).

- [ ] **Step 3: Implement 5 tabs in `src/components/ComponentIsolationSection.tsx`**

1. Expand `activeTab` state from `'taskbar' | 'startMenu' | 'flyouts'` to `'taskbar' | 'startMenu' | 'flyouts' | 'contextMenu' | 'fileExplorer'`.
2. Add the Context Menu tab UI:
   - Override toggle (`Enable Context Menu Override`).
   - Material selector (Acrylic, Mica, Mica Alt, Pure Black, Matte Slate, Linear Gradient).
   - Custom color picker (`ColorPickerPopover`) & Edit Gradient (`GradientEditorModal`).
   - Opacity and Blur sliders.
   - Corner Radius and Border Thickness sliders.
   - Checkbox: *Use Windows 10 Classic Context Menu*.
   - Checkbox: *Item Hover Accent Highlight*.
3. Add the File Explorer tab UI:
   - Override toggle (`Enable File Explorer Override`).
   - Material finish (Mica, Mica Alt, Acrylic, Matte Slate).
   - Tab Style pills (`Integrated`, `Floating`, `Accent Border`).
   - Active Tab Color Mode (`Accent Color`, `Surface Match`).
   - Command Bar Tinting toggle.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/ComponentIsolationSection.test.tsx`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/ComponentIsolationSection.tsx src/components/ComponentIsolationSection.test.tsx
git commit -m "feat(ui): add Context Menu and File Explorer tabs to Component Isolation"
```

---

### Task 4: Multi-Window Preview Canvas Simulation

**Files:**
- Create: `src/components/FileExplorerPreviewWindow.tsx`
- Create: `src/components/FileExplorerPreviewWindow.test.tsx`
- Create: `src/components/TerminalPreviewWindow.tsx`
- Create: `src/components/TerminalPreviewWindow.test.tsx`
- Create: `src/components/ContextMenuPreview.tsx`
- Create: `src/components/ContextMenuPreview.test.tsx`
- Modify: `src/components/PreviewCanvas.tsx`
- Modify: `src/components/PreviewCanvas.test.tsx`

**Interfaces:**
- Consumes: `previewViewMode`, `startButton`, `runningIndicator`, `contextMenuOverride`, `fileExplorerOverride`, `typography` from `src/store/useThemeStore.ts`.
- Produces:
  - `export function FileExplorerPreviewWindow(): React.JSX.Element;`
  - `export function TerminalPreviewWindow(): React.JSX.Element;`
  - `export function ContextMenuPreview({ x, y, onClose }: ContextMenuProps): React.JSX.Element;`
  - Updated `PreviewCanvas` rendering simulated windows, right-click context menu, and custom taskbar start icon & indicators.

- [ ] **Step 1: Write the failing tests**

1. Create `src/components/FileExplorerPreviewWindow.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FileExplorerPreviewWindow } from './FileExplorerPreviewWindow';

describe('FileExplorerPreviewWindow', () => {
  it('renders tabs, command bar, and breadcrumbs', () => {
    render(<FileExplorerPreviewWindow />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Downloads')).toBeInTheDocument();
    expect(screen.getByText(/This PC/i)).toBeInTheDocument();
  });
});
```

2. Update `src/components/PreviewCanvas.test.tsx`:
```typescript
it('renders custom vector start button icon and running indicators', () => {
  useThemeStore.getState().setStartButton({ type: 'preset', presetId: 'cyberpunk-hex', customColor: '#00FFCC' });
  useThemeStore.getState().setRunningIndicator({ style: 'dot' });
  render(<PreviewCanvas />);
  expect(screen.getByTestId('custom-start-icon-vector')).toBeInTheDocument();
  expect(screen.getAllByTestId('indicator-dot').length).toBeGreaterThan(0);
});

it('renders File Explorer window when previewViewMode is file-explorer', () => {
  useThemeStore.getState().setPreviewViewMode('file-explorer');
  render(<PreviewCanvas />);
  expect(screen.getByTestId('file-explorer-window')).toBeInTheDocument();
});

it('opens context menu on canvas right click', () => {
  render(<PreviewCanvas />);
  const canvas = screen.getByTestId('preview-canvas-root');
  fireEvent.contextMenu(canvas);
  expect(screen.getByTestId('context-menu-popover')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/FileExplorerPreviewWindow.test.tsx src/components/PreviewCanvas.test.tsx`  
Expected: FAIL (`Cannot find module './FileExplorerPreviewWindow'`).

- [ ] **Step 3: Implement window components and update `PreviewCanvas.tsx`**

1. Create `src/components/FileExplorerPreviewWindow.tsx`:
   - Title bar with min/max/close controls.
   - Tabs (`Home`, `Downloads`, `Projects`) matching `fileExplorerOverride.tabStyle`.
   - Command bar with icons (`New`, `Cut`, `Copy`, `Sort`, `View`).
   - Breadcrumb navigation (`This PC > Local Disk (C:) > Projects`).
   - Split navigation pane and folder item list with accent selection row.
   - Backing surface simulating Mica/Acrylic.
2. Create `src/components/TerminalPreviewWindow.tsx`:
   - Accent color title bar (`ColorPrevalence`).
   - Console command prompt with custom typography (`fontFamily`, `fontWeight`, `letterSpacing`).
3. Create `src/components/ContextMenuPreview.tsx`:
   - WinUI 3 `MenuFlyoutPresenter` layout with quick action row (Cut, Copy, Rename, Share, Delete) and menu items.
   - Or Windows 10 classic full cascading menu if `contextMenuOverride.enableClassicMenu` is true.
4. In `src/components/PreviewCanvas.tsx`:
   - Render vector start button preset via `renderStartButtonSvg`.
   - Render running indicators matching `runningIndicator.style` (`line`, `dot`, `pill`, `glow`, `off`) with custom active/inactive colors.
   - Attach `onContextMenu` handler to canvas root (`e.preventDefault()`, set context menu coords).
   - Render `FileExplorerPreviewWindow`, `TerminalPreviewWindow`, or `ContextMenuPreview` based on `previewViewMode` and state.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/FileExplorerPreviewWindow.test.tsx src/components/TerminalPreviewWindow.test.tsx src/components/ContextMenuPreview.test.tsx src/components/PreviewCanvas.test.tsx`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/FileExplorerPreviewWindow.tsx src/components/FileExplorerPreviewWindow.test.tsx src/components/TerminalPreviewWindow.tsx src/components/TerminalPreviewWindow.test.tsx src/components/ContextMenuPreview.tsx src/components/ContextMenuPreview.test.tsx src/components/PreviewCanvas.tsx src/components/PreviewCanvas.test.tsx
git commit -m "feat(preview): simulate File Explorer, Terminal, Context Menu, and custom Start/Indicator shell elements"
```

---

### Task 5: WinUI XAML Export Engine & Asset Packaging

**Files:**
- Modify: `src/lib/exportEngine.ts`
- Modify: `src/lib/exportEngine.test.ts`

**Interfaces:**
- Consumes: Complete `ThemeConfigSnapshot` from `src/store/useThemeStore.ts`.
- Produces:
  - `export function generateContextMenuStyles(state: ThemeConfigSnapshot): WindhawkStyleBlock[];`
  - `export function generateFileExplorerStyles(state: ThemeConfigSnapshot): WindhawkStyleBlock[];`
  - `export function generateRunningIndicatorStyles(config: RunningIndicatorConfig): string[];`
  - `export function generateThemeZip(state: ThemeConfigSnapshot): Promise<Blob>;` (packaging `start_icon.png` and classic context menu CLSID into `theme.reg`).

- [ ] **Step 1: Write the failing tests**

Update `src/lib/exportEngine.test.ts`:
```typescript
describe('Phase 2 exportEngine enhancements', () => {
  it('generates Context Menu XAML styles', () => {
    const state = {
      ...useThemeStore.getState(),
      contextMenuOverride: {
        enabled: true,
        materialStyle: 'pure-black-neon' as const,
        customColor: '#FF0055',
        cornerRadius: 12,
        borderThickness: 2,
      },
    };
    const pkg = generateWindhawkStylerMod(state);
    expect(pkg.contextMenuStyles).toContain('MenuFlyoutPresenter');
    expect(pkg.contextMenuStyles).toContain('CornerRadius=12');
  });

  it('generates Windows 10 classic context menu CLSID when enabled', () => {
    const state = {
      ...useThemeStore.getState(),
      contextMenuOverride: { enabled: true, enableClassicMenu: true },
    };
    const reg = generateRegFileString(state);
    expect(reg).toContain('{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}');
  });

  it('generates running app indicator geometry rules', () => {
    const state = {
      ...useThemeStore.getState(),
      runningIndicator: {
        style: 'dot' as const,
        activeColorMode: 'white' as const,
        activeCustomColor: '#FFFFFF',
        inactiveColorMode: 'subtle-white' as const,
        inactiveCustomColor: '#888888',
        indicatorSize: 5,
      },
    };
    const pkg = generateWindhawkStylerMod(state);
    expect(pkg.taskbarStyles).toContain('CornerRadius=99');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/exportEngine.test.ts`  
Expected: FAIL (`pkg.contextMenuStyles` undefined).

- [ ] **Step 3: Implement export engine enhancements in `src/lib/exportEngine.ts`**

1. Implement `generateContextMenuStyles(state)` targeting `MenuFlyoutPresenter` and `MenuFlyoutItem`.
2. Implement `generateFileExplorerStyles(state)` targeting `TabViewItem` and `CommandBar`.
3. In `generateRegFileString(state)`:
   - If `contextMenuOverride.enableClassicMenu` is true, write the CLSID registry key.
   - If false, ensure registry instructions remove the key.
   - In `HKCU:\Software\Microsoft\Windows\DWM`, set `ColorPrevalence=1`.
4. In `generateThemeZip(state)`:
   - If `startButton.type === 'preset'` or `'custom'`, generate `start_icon.png` (high-res transparent PNG) and bundle it in the ZIP.
   - In `Apply_Theme.ps1`, add copy logic to place `start_icon.png` in `%APPDATA%\Windhawk\Themes\`.
   - Update `Restore_Default_Windows11.bat` to delete `{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}` CLSID and restore default start button/indicators.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/exportEngine.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/exportEngine.ts src/lib/exportEngine.test.ts
git commit -m "feat(engine): export WinUI XAML for Context Menus, File Explorer, running indicators, and start icon bundles"
```

---

### Task 6: URL Sharing & Registry Parser Diff Ingestion

**Files:**
- Modify: `src/lib/urlSharing.ts`
- Modify: `src/lib/urlSharing.test.ts`
- Modify: `src/lib/regParser.ts`
- Modify: `src/lib/regParser.test.ts`

**Interfaces:**
- Consumes: `ThemeConfigSnapshot` from `src/store/useThemeStore.ts`.
- Produces:
  - `encodeThemeToUrl`: Encodes `sb`, `ind`, `cmOvr`, `feOvr`.
  - `decodeThemeFromUrl`: Decodes `sb`, `ind`, `cmOvr`, `feOvr` with fallback defaults.
  - `compareThemeConfigs`: Compares Start button, running indicators, Context Menu, and File Explorer overrides.

- [ ] **Step 1: Write the failing tests**

1. Update `src/lib/urlSharing.test.ts`:
```typescript
it('encodes and decodes Start button, indicator, and extended surface overrides', () => {
  const base = useThemeStore.getState();
  const modified = {
    ...base,
    startButton: { type: 'preset' as const, presetId: 'cyberpunk-hex' as const, colorMode: 'custom' as const, customColor: '#00FFCC', size: 24 },
    runningIndicator: { style: 'pill' as const, activeColorMode: 'accent' as const, activeCustomColor: '#0078D4', inactiveColorMode: 'subtle-white' as const, inactiveCustomColor: '#FFFFFF', indicatorSize: 4 },
  };
  const url = encodeThemeToUrl(modified);
  const parsed = decodeThemeFromUrl(new URLSearchParams(url));
  expect(parsed.startButton?.presetId).toBe('cyberpunk-hex');
  expect(parsed.startButton?.customColor).toBe('#00FFCC');
  expect(parsed.runningIndicator?.style).toBe('pill');
});
```

2. Update `src/lib/regParser.test.ts`:
```typescript
it('detects diffs in classic context menu and start button configuration', () => {
  const current = useThemeStore.getState();
  const diffs = compareThemeConfigs(current, {
    contextMenuOverride: { enabled: true, enableClassicMenu: true },
  });
  const cmDiff = diffs.find((d) => d.key === 'contextMenuOverride');
  expect(cmDiff?.hasChanged).toBe(true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/urlSharing.test.ts src/lib/regParser.test.ts`  
Expected: FAIL.

- [ ] **Step 3: Implement serialization & diff comparison**

1. In `src/lib/urlSharing.ts`:
   - Serialize `sb` (compact `p:presetId:customColor:size`), `ind` (`style:activeColor:inactiveColor:size`), `cmOvr`, `feOvr`.
   - Deserialize with validation and safe defaults.
2. In `src/lib/regParser.ts`:
   - Add diff entries for `startButton`, `runningIndicator`, `contextMenuOverride`, `fileExplorerOverride`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/urlSharing.test.ts src/lib/regParser.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/urlSharing.ts src/lib/urlSharing.test.ts src/lib/regParser.ts src/lib/regParser.test.ts
git commit -m "feat(sharing): add Phase 2 URL serialization and registry diff comparison"
```

---

### Task 7: End-to-End Build, Test, Git Push & Staging Deployment

**Files:**
- Verify: Full test suite, Next.js production build, staging deployment.

- [ ] **Step 1: Run full unit test suite**

Run: `npx vitest run`  
Expected: All test suites PASS with 0 failures.

- [ ] **Step 2: Run Next.js production build**

Run: `npm run build`  
Expected: Static build completes cleanly with 0 TypeScript errors.

- [ ] **Step 3: Push changes to GitHub**

```bash
git push origin main
```

- [ ] **Step 4: Deploy to `mt-webserver-01` (`tolhurst.me`)**

1. Create tar archive: `tar -czf dist.tar.gz -C out .`
2. SCP to server: `scp dist.tar.gz tolhurst.me:/tmp/dist.tar.gz`
3. Extract on server: `ssh tolhurst.me "tar -xzf /tmp/dist.tar.gz -C /var/www/projects/theme-creator/ && rm /tmp/dist.tar.gz"`
4. Clean up local `dist.tar.gz`.

- [ ] **Step 5: Verify live in browser via Playwright**

Verify `https://projects.tolhurst.me/theme-creator/studio/`:
- Test Start Button dropdown vector presets and custom HEX color picker.
- Test Running Indicator styles (`Line`, `Dot`, `Pill`, `Glow`, `Off`).
- Test switching between `Desktop`, `File Explorer`, `Terminal`, and `Context Menu`.
- Test right-clicking canvas to open context menu.
- Verify download ZIP contains `start_icon.png`, `theme.reg`, `Apply_Theme.ps1`, and `Restore_Default_Windows11.bat`.
