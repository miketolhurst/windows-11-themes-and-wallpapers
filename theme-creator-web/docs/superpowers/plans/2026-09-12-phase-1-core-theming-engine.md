# Phase 1: Core Theming Engine & Visual Controls Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Phase 1 features for Windows 11 Theme Creator: Advanced Multi-Stop Gradient Editor, Mica and Mica Alt Materials, Component-Level Color Isolation, Custom Typography, Animation Speed/Easing Controls, and a Theme Diff Inspector Modal.

**Architecture:** Extend Zustand store schema with backwards-compatible nested configurations for gradients, materials, component overrides, typography, and animations. Update the WinUI 3 XAML generator and registry parser to serialize these structures. Implement dedicated UI components (`GradientEditorModal`, `ComponentIsolationSection`, `TypographyAnimationSection`, `ThemeDiffModal`) and update `PreviewCanvas` to simulate Mica shaders and component overrides.

**Tech Stack:** React 19, Next.js 15, TypeScript, Tailwind CSS, Zustand, Lucide React, Vitest, Testing Library.

## Global Constraints

- Preserve 100% backward compatibility with existing saved themes, presets in `presets.ts`, and shared URL formats.
- All unit tests must pass with 0 failures (`npx vitest run`).
- Next.js production build (`npm run build`) must succeed with 0 type errors.
- Ensure all exported Windhawk XAML follows Windows 11 WinUI 3 visual tree targeting rules.

---

### Task 1: Theme Store State Extensions & Types

**Files:**
- Modify: `src/store/useThemeStore.ts`
- Modify: `src/store/useThemeStore.test.ts`

**Interfaces:**
- Consumes: Existing `ThemeConfigSnapshot` and `ThemeState` from `src/store/useThemeStore.ts`.
- Produces:
  - `export interface GradientStop { id: string; color: string; offset: number; }`
  - `export interface GradientConfig { type: 'linear' | 'radial'; angle: number; stops: GradientStop[]; }`
  - `export type MaterialStyle = 'fluent-acrylic' | 'pure-black-neon' | 'linear-gradient' | 'matte-slate' | 'mica' | 'mica-alt';`
  - `export interface ComponentOverride { enabled: boolean; materialStyle?: MaterialStyle; customColor?: string; gradient?: GradientConfig; opacity?: number; blur?: number; }`
  - `export interface TypographyConfig { fontFamily: string; fontWeight: '300' | '400' | '500' | '600' | '700'; characterSpacing: number; }`
  - `export interface AnimationConfig { speed: 'instant' | 'snappy' | 'default' | 'smooth'; durationMs: number; easing: 'fluent-spring' | 'decelerate' | 'linear'; }`
  - Actions: `setGlobalGradient`, `setTaskbarOverride`, `setStartMenuOverride`, `setFlyoutOverride`, `setTypography`, `setAnimations`.

- [ ] **Step 1: Write the failing tests**

Add tests to `src/store/useThemeStore.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useThemeStore } from './useThemeStore';

describe('Phase 1 useThemeStore extensions', () => {
  beforeEach(() => {
    useThemeStore.getState().resetToDefaults();
  });

  it('initializes with default Phase 1 properties', () => {
    const state = useThemeStore.getState();
    expect(state.globalGradient.type).toBe('linear');
    expect(state.globalGradient.stops.length).toBeGreaterThanOrEqual(2);
    expect(state.taskbarOverride.enabled).toBe(false);
    expect(state.startMenuOverride.enabled).toBe(false);
    expect(state.flyoutOverride.enabled).toBe(false);
    expect(state.typography.fontFamily).toBe('Segoe UI Variable');
    expect(state.animations.speed).toBe('default');
  });

  it('updates global gradient and component overrides with history tracking', () => {
    const store = useThemeStore.getState();
    store.setGlobalGradient({
      type: 'linear',
      angle: 180,
      stops: [
        { id: '1', color: '#FF0000', offset: 0 },
        { id: '2', color: '#0000FF', offset: 100 },
      ],
    });
    expect(useThemeStore.getState().globalGradient.angle).toBe(180);
    expect(useThemeStore.getState().canUndo()).toBe(true);

    store.setTaskbarOverride({ enabled: true, materialStyle: 'mica' });
    expect(useThemeStore.getState().taskbarOverride.enabled).toBe(true);
    expect(useThemeStore.getState().taskbarOverride.materialStyle).toBe('mica');

    store.setTypography({ fontFamily: 'JetBrains Mono', fontWeight: '600', characterSpacing: 20 });
    expect(useThemeStore.getState().typography.fontFamily).toBe('JetBrains Mono');

    store.setAnimations({ speed: 'snappy', durationMs: 150, easing: 'decelerate' });
    expect(useThemeStore.getState().animations.speed).toBe('snappy');
    expect(useThemeStore.getState().animations.durationMs).toBe(150);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/store/useThemeStore.test.ts`  
Expected: FAIL with compilation error on missing properties (`globalGradient`, `setGlobalGradient`, etc.).

- [ ] **Step 3: Write minimal implementation in `src/store/useThemeStore.ts`**

Update `MaterialStyle`, define `GradientStop`, `GradientConfig`, `ComponentOverride`, `TypographyConfig`, `AnimationConfig`, extend `ThemeConfigSnapshot` and `ThemeState`, add default values in `DEFAULT_THEME_STATE`, and implement setter actions with `withHistory`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/store/useThemeStore.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/store/useThemeStore.ts src/store/useThemeStore.test.ts
git commit -m "feat(store): add gradient, mica, component override, typography, and animation state"
```

---

### Task 2: WinUI XAML Export Engine Updates

**Files:**
- Modify: `src/lib/exportEngine.ts`
- Modify: `src/lib/exportEngine.test.ts`

**Interfaces:**
- Consumes: `GradientConfig`, `ComponentOverride`, `TypographyConfig`, `AnimationConfig`, `MaterialStyle` from `src/store/useThemeStore.ts`.
- Produces:
  - `export function generateGradientBrushXaml(config: GradientConfig): string`
  - `export function calculateGradientPoints(angleDeg: number): { start: string; end: string }`
  - Updated `generateWindhawkStylerMod(state: ThemeConfigSnapshot): WindhawkThemePackage` generating:
    - Mica / Mica Alt WindhawkBlur styles.
    - Component-level override styles in `taskbarControlStyles` and `startMenuControlStyles`.
    - Typography styles (`FontFamily`, `FontWeight`, `CharacterSpacing`).
    - Animation storyboard overrides.

- [ ] **Step 1: Write the failing tests**

Add tests to `src/lib/exportEngine.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { generateGradientBrushXaml, calculateGradientPoints, generateWindhawkStylerMod } from './exportEngine';
import { useThemeStore } from '../store/useThemeStore';

describe('exportEngine Phase 1 extensions', () => {
  it('calculates normalized gradient start and end coordinates from degrees', () => {
    const right = calculateGradientPoints(90);
    expect(right.start).toBe('0,0.5');
    expect(right.end).toBe('1,0.5');

    const down = calculateGradientPoints(180);
    expect(down.start).toBe('0.5,0');
    expect(down.end).toBe('0.5,1');
  });

  it('generates multi-stop LinearGradientBrush XAML', () => {
    const xaml = generateGradientBrushXaml({
      type: 'linear',
      angle: 90,
      stops: [
        { id: '1', color: '#0078D4', offset: 0 },
        { id: '2', color: '#EC4899', offset: 50 },
        { id: '3', color: '#8B5CF6', offset: 100 },
      ],
    });
    expect(xaml).toContain('<LinearGradientBrush');
    expect(xaml).toContain('<GradientStop Color="#FF0078D4" Offset="0"/>');
    expect(xaml).toContain('<GradientStop Color="#FFEC4899" Offset="0.5"/>');
    expect(xaml).toContain('<GradientStop Color="#FF8B5CF6" Offset="1"/>');
  });

  it('exports calibrated Mica & Mica Alt WindhawkBlur rules', () => {
    const state = { ...useThemeStore.getState(), materialStyle: 'mica' as const };
    const pkg = generateWindhawkStylerMod(state);
    expect(pkg.taskbarStyles).toContain('BlurAmount=38');
    expect(pkg.taskbarStyles).toContain('TintOpacity=0.9');
  });

  it('applies taskbar component overrides when enabled', () => {
    const state = {
      ...useThemeStore.getState(),
      taskbarOverride: {
        enabled: true,
        materialStyle: 'pure-black-neon' as const,
        customColor: '#FF0055',
        opacity: 80,
      },
    };
    const pkg = generateWindhawkStylerMod(state);
    expect(pkg.taskbarStyles).toContain('#FF0055');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/exportEngine.test.ts`  
Expected: FAIL with functions not defined or missing assertions.

- [ ] **Step 3: Implement export engine enhancements in `src/lib/exportEngine.ts`**

Implement `calculateGradientPoints`, `generateGradientBrushXaml`, Mica/Mica Alt styles in `buildMaterialBackgroundStyle`, component override evaluation for taskbar and start menu, and typography/animation storyboard generation.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/exportEngine.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/exportEngine.ts src/lib/exportEngine.test.ts
git commit -m "feat(engine): support multi-stop gradients, mica materials, and component overrides in export engine"
```

---

### Task 3: URL Sharing & Registry Parser Diff Support

**Files:**
- Modify: `src/lib/urlSharing.ts`
- Modify: `src/lib/urlSharing.test.ts`
- Modify: `src/lib/regParser.ts`
- Modify: `src/lib/regParser.test.ts`

**Interfaces:**
- Consumes: `ThemeConfigSnapshot` from `src/store/useThemeStore.ts`.
- Produces:
  - `export function encodeThemeToUrl(state: ThemeConfigSnapshot): string` (includes optional compact params: `grad`, `tbOvr`, `smOvr`, `flyOvr`, `typo`, `anim`).
  - `export function decodeThemeFromUrl(params: URLSearchParams): Partial<ThemeConfigSnapshot>` (gracefully ignores missing parameters with default fallbacks).
  - `export interface ThemeDiffItem { key: string; label: string; currentValue: string; incomingValue: string; hasChanged: boolean; }`
  - `export function compareThemeConfigs(current: ThemeConfigSnapshot, incoming: Partial<ThemeConfigSnapshot>): ThemeDiffItem[]`

- [ ] **Step 1: Write the failing tests**

Add tests to `src/lib/urlSharing.test.ts` and `src/lib/regParser.test.ts`:
```typescript
it('serializes and deserializes gradient and typography without breaking legacy URLs', () => {
  const base = useThemeStore.getState();
  const url = encodeThemeToUrl(base);
  const parsed = decodeThemeFromUrl(new URLSearchParams(url));
  expect(parsed.typography?.fontFamily).toBe(base.typography.fontFamily);
});

it('computes diffs between current state and imported config', () => {
  const current = useThemeStore.getState();
  const diffs = compareThemeConfigs(current, { accentColor: '#FF0000', typography: { fontFamily: 'Inter', fontWeight: '600', characterSpacing: 10 } });
  const accentDiff = diffs.find(d => d.key === 'accentColor');
  expect(accentDiff?.hasChanged).toBe(true);
  expect(accentDiff?.incomingValue).toBe('#FF0000');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/urlSharing.test.ts src/lib/regParser.test.ts`  
Expected: FAIL on `compareThemeConfigs` not exported.

- [ ] **Step 3: Implement serialization & diff helper**

Implement compact query serialization for new fields in `src/lib/urlSharing.ts` and add `compareThemeConfigs` in `src/lib/regParser.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/urlSharing.test.ts src/lib/regParser.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/urlSharing.ts src/lib/urlSharing.test.ts src/lib/regParser.ts src/lib/regParser.test.ts
git commit -m "feat(parser): add compact url sharing hydration and theme diff comparator"
```

---

### Task 4: Interactive Gradient Editor Modal Component

**Files:**
- Create: `src/components/GradientEditorModal.tsx`
- Create: `src/components/GradientEditorModal.test.tsx`

**Interfaces:**
- Consumes: `GradientConfig`, `GradientStop` from `src/store/useThemeStore.ts`.
- Produces:
  - `export interface GradientEditorModalProps { isOpen: boolean; title: string; initialGradient: GradientConfig; onSave: (config: GradientConfig) => void; onClose: () => void; }`
  - Visual track with draggable pins, color popover, angle dial, snap chips, linear/radial toggle, and preset swatches.

- [ ] **Step 1: Write the failing tests**

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GradientEditorModal } from './GradientEditorModal';

describe('GradientEditorModal', () => {
  const mockGradient = {
    type: 'linear' as const,
    angle: 90,
    stops: [
      { id: '1', color: '#0078D4', offset: 0 },
      { id: '2', color: '#8B5CF6', offset: 100 },
    ],
  };

  it('renders gradient editor modal when open', () => {
    render(<GradientEditorModal isOpen={true} title="Edit Taskbar Gradient" initialGradient={mockGradient} onSave={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByText('Edit Taskbar Gradient')).toBeInTheDocument();
    expect(screen.getByText('90°')).toBeInTheDocument();
  });

  it('calls onSave when apply button is clicked', () => {
    const onSave = vi.fn();
    render(<GradientEditorModal isOpen={true} title="Edit Taskbar Gradient" initialGradient={mockGradient} onSave={onSave} onClose={vi.fn()} />);
    fireEvent.click(screen.getByText('Apply to Theme'));
    expect(onSave).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/GradientEditorModal.test.tsx`  
Expected: FAIL (`Cannot find module './GradientEditorModal'`).

- [ ] **Step 3: Implement `src/components/GradientEditorModal.tsx`**

Build modal UI with accessible controls:
- Visual gradient bar.
- Interactive color stop pins.
- Angle wheel with SVG circle and 45° snap buttons.
- Linear / Radial toggle buttons.
- Preset swatches: Sunset Glow, Cyber Horizon, Deep Nebula, Aurora Borealis, Subtle Sheen.
- Save and Close actions.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/GradientEditorModal.test.tsx`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/GradientEditorModal.tsx src/components/GradientEditorModal.test.tsx
git commit -m "feat(ui): create interactive gradient editor modal with visual track and angle dial"
```

---

### Task 5: Component Isolation & Typography / Animation Sidebar Sections

**Files:**
- Create: `src/components/ComponentIsolationSection.tsx`
- Create: `src/components/TypographyAnimationSection.tsx`
- Modify: `src/components/Sidebar.tsx`

**Interfaces:**
- Consumes: Store actions (`setTaskbarOverride`, `setStartMenuOverride`, `setFlyoutOverride`, `setTypography`, `setAnimations`, `setMaterialStyle`).
- Produces:
  - `ComponentIsolationSection`: 3-tab segmented control (`Taskbar`, `Start Menu`, `Flyouts`), override toggle, material finish selector, custom color picker, gradient editor trigger.
  - `TypographyAnimationSection`: Font family selector, weight selector, character spacing slider, speed pills, easing curve pills, and test animation trigger.

- [ ] **Step 1: Write the failing tests**

Create `src/components/ComponentIsolationSection.test.tsx`:
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ComponentIsolationSection } from './ComponentIsolationSection';

describe('ComponentIsolationSection', () => {
  it('renders component isolation tabs and toggles override', () => {
    render(<ComponentIsolationSection onOpenGradientEditor={() => {}} />);
    expect(screen.getByText('Taskbar')).toBeInTheDocument();
    expect(screen.getByText('Start Menu')).toBeInTheDocument();
    expect(screen.getByText('Flyouts')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/ComponentIsolationSection.test.tsx`  
Expected: FAIL (`Cannot find module './ComponentIsolationSection'`).

- [ ] **Step 3: Implement components and integrate into `Sidebar.tsx`**

1. Create `src/components/ComponentIsolationSection.tsx`.
2. Create `src/components/TypographyAnimationSection.tsx`.
3. Add Mica & Mica Alt to `MaterialStyle` selector in `Sidebar.tsx`.
4. Embed both sections as collapsible accordions in `Sidebar.tsx`.
5. Connect gradient editor modal trigger.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/Sidebar.test.tsx src/components/ComponentIsolationSection.test.tsx`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/ComponentIsolationSection.tsx src/components/TypographyAnimationSection.tsx src/components/Sidebar.tsx src/components/ComponentIsolationSection.test.tsx
git commit -m "feat(ui): add component isolation and typography/animation sections to sidebar"
```

---

### Task 6: Preview Canvas Updates (Mica Shaders, Overrides, Typography, Transitions)

**Files:**
- Modify: `src/components/PreviewCanvas.tsx`
- Modify: `src/components/PreviewCanvas.test.tsx`

**Interfaces:**
- Consumes: `taskbarOverride`, `startMenuOverride`, `flyoutOverride`, `typography`, `animations`, `materialStyle` from `useThemeStore`.
- Produces: High-fidelity CSS simulation for Mica / Mica Alt materials, component-specific overrides, dynamic font-family/weight/kerning, and responsive flyout animation transitions.

- [ ] **Step 1: Write the failing tests**

Add tests to `src/components/PreviewCanvas.test.tsx`:
```typescript
it('applies typography styles to the preview canvas root', () => {
  useThemeStore.getState().setTypography({ fontFamily: 'JetBrains Mono', fontWeight: '700', characterSpacing: 25 });
  render(<PreviewCanvas />);
  const canvas = screen.getByTestId('preview-canvas-root');
  expect(canvas.style.fontFamily).toContain('JetBrains Mono');
});

it('renders mica material styling when selected', () => {
  useThemeStore.getState().setMaterialStyle('mica');
  render(<PreviewCanvas />);
  const taskbar = screen.getByTestId('taskbar-container');
  expect(taskbar).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/PreviewCanvas.test.tsx`  
Expected: FAIL on missing test ids or styles.

- [ ] **Step 3: Implement canvas rendering updates in `src/components/PreviewCanvas.tsx`**

1. Calculate component-specific styles by resolving `taskbarOverride`, `startMenuOverride`, and `flyoutOverride`.
2. Implement CSS styles for Mica and Mica Alt finishes with wallpaper backdrop sampling and tinting.
3. Apply font family, font weight, and character spacing to the canvas root.
4. Apply CSS transition duration and easing curves to flyout open/close states.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/PreviewCanvas.test.tsx`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/PreviewCanvas.tsx src/components/PreviewCanvas.test.tsx
git commit -m "feat(preview): simulate mica materials, component overrides, custom fonts, and animations in preview canvas"
```

---

### Task 7: Theme Diff & Inspector Modal

**Files:**
- Create: `src/components/ThemeDiffModal.tsx`
- Create: `src/components/ThemeDiffModal.test.tsx`
- Modify: `src/app/studio/page.tsx`

**Interfaces:**
- Consumes: `compareThemeConfigs` from `src/lib/regParser.ts` and `applyThemeConfig` from `src/store/useThemeStore.ts`.
- Produces:
  - `export interface ThemeDiffModalProps { isOpen: boolean; incomingConfig: Partial<ThemeConfigSnapshot> | null; onClose: () => void; onApply: () => void; }`
  - Side-by-side comparison table with color chips, changed row highlights, and apply/cancel controls.

- [ ] **Step 1: Write the failing tests**

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ThemeDiffModal } from './ThemeDiffModal';

describe('ThemeDiffModal', () => {
  it('renders diff comparison table and triggers onApply', () => {
    const onApply = vi.fn();
    render(<ThemeDiffModal isOpen={true} incomingConfig={{ accentColor: '#FF0000' }} onClose={vi.fn()} onApply={onApply} />);
    expect(screen.getByText('Theme Inspector & Diff')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Apply Changes'));
    expect(onApply).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/ThemeDiffModal.test.tsx`  
Expected: FAIL (`Cannot find module './ThemeDiffModal'`).

- [ ] **Step 3: Implement `ThemeDiffModal.tsx` and integrate into `src/app/studio/page.tsx`**

1. Create `src/components/ThemeDiffModal.tsx` rendering diff table.
2. In `src/app/studio/page.tsx`, intercept `.reg` file drag-drop and input changes to open `ThemeDiffModal` if differences exist.
3. Add an "Inspect Theme" button in the Studio navigation bar.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/ThemeDiffModal.test.tsx`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/ThemeDiffModal.tsx src/components/ThemeDiffModal.test.tsx src/app/studio/page.tsx
git commit -m "feat(ui): add theme diff and inspector modal for imported configurations"
```

---

### Task 8: End-to-End Build, Test, Git Push & Staging Deployment

**Files:**
- Verify: Full repository test suite and production build.

**Interfaces:**
- Consumes: All updated components and export engines.
- Produces: Production deployment bundle deployed to `mt-webserver-01`.

- [ ] **Step 1: Run all unit tests**

Run: `npx vitest run`  
Expected: All tests PASS with 0 failures.

- [ ] **Step 2: Run production build**

Run: `npm run build`  
Expected: Build succeeds with 0 type errors.

- [ ] **Step 3: Push changes to GitHub**

```bash
git push origin main
```

- [ ] **Step 4: Deploy to `mt-webserver-01`**

Sync production build to `/var/www/projects/theme-creator/` on `mt-webserver-01` via SSH / rsync.

- [ ] **Step 5: Verify live in browser**

Verify `https://projects.tolhurst.me/theme-creator/studio/`:
- Check Advanced Gradient Builder modal.
- Check Mica & Mica Alt material options.
- Check Component Isolation overrides.
- Check Typography and Animation controls.
- Check Theme Diff Modal on `.reg` import.
