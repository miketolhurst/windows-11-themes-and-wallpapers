# Phase 1: Core Theming Engine & Visual Controls Design Spec

**Date:** 2026-09-12  
**Status:** Approved by User  
**Scope:** Phase 1 (Features 1.1–1.5) & Theme Diff Modal (Feature 4.2)  
**Project:** Windows 11 Theme Creator (`theme-creator-web`)

---

## 1. Overview & Goals

This specification defines the architecture, data models, UI components, rendering logic, and WinUI XAML export enhancements for **Phase 1** of the Windows 11 Theme Creator feature expansion:
1. **Advanced Gradient Editor (1.1)**: Multi-stop linear and radial gradients with an interactive stop track, angle dial, and quick presets.
2. **Mica & Mica Alt Material Support (1.2)**: High-fidelity Windows 11 system material simulation in the web canvas and calibrated WindhawkBlur injection.
3. **Component-Level Color Isolation (1.3)**: Independent material, color, gradient, opacity, and blur overrides for the Taskbar, Start Menu, and Notification Center/Flyouts.
4. **Custom Typography (1.4)**: Curated font selection (*Segoe UI Variable*, *Inter*, *JetBrains Mono*, *Fira Code*, *Cascadia Code*, *Roboto* + custom font name input), font weight, and character spacing kerning slider.
5. **Animation Tweaks (1.5)**: Configurable flyout transition speeds (*Instant 0ms*, *Snappy 150ms*, *Default Fluent 250ms*, *Smooth 400ms*) and easing curves (*Fluent Spring*, *Standard Decelerate*, *Linear*).
6. **Theme Analytics & Diff Inspector (4.2)**: Side-by-side comparison modal showing incoming `.reg` values versus current theme settings before applying.

Phases 2 (Extended OS targets: Context Menu, File Explorer), Phase 3 (Real-Time Desktop Sync Daemon), and Phase 4 (Standalone 1-Click `.exe` Installer) are deliberately deferred to subsequent cycles.

---

## 2. Architecture & Data Model

All state extensions reside in `src/store/useThemeStore.ts`, with complete snapshot history (`undo`/`redo`), `localStorage` persistence, and URL sharing hydration.

### 2.1 Gradient Types
```typescript
export interface GradientStop {
  id: string;
  color: string;
  offset: number; // 0 to 100 percentage
}

export interface GradientConfig {
  type: 'linear' | 'radial';
  angle: number; // 0 to 360 degrees
  stops: GradientStop[];
}
```

### 2.2 Material Finishes
```typescript
export type MaterialStyle =
  | 'fluent-acrylic'
  | 'pure-black-neon'
  | 'linear-gradient'
  | 'matte-slate'
  | 'mica'
  | 'mica-alt';
```

### 2.3 Component-Level Overrides
```typescript
export interface ComponentOverride {
  enabled: boolean;
  materialStyle?: MaterialStyle;
  customColor?: string;
  gradient?: GradientConfig;
  opacity?: number;
  blur?: number;
}
```

### 2.4 Typography & Animation Settings
```typescript
export type ShellFontWeight = '300' | '400' | '500' | '600' | '700';

export interface TypographyConfig {
  fontFamily: string; // e.g. "Segoe UI Variable", "Inter", "JetBrains Mono", or custom string
  fontWeight: ShellFontWeight;
  characterSpacing: number; // -50 to 100 (maps to WinUI CharacterSpacing)
}

export type AnimationSpeed = 'instant' | 'snappy' | 'default' | 'smooth';
export type AnimationEasing = 'fluent-spring' | 'decelerate' | 'linear';

export interface AnimationConfig {
  speed: AnimationSpeed;
  durationMs: number; // 0, 150, 250, 400
  easing: AnimationEasing;
}
```

### 2.5 Updated `ThemeConfigSnapshot`
```typescript
export interface ThemeConfigSnapshot {
  // Existing properties...
  themeName: string;
  accentColor: string;
  secondaryAccent: string;
  isLightMode: boolean;
  taskbarMode: 'blur' | 'gradient';
  materialStyle: MaterialStyle;
  cornerRadius: number;
  borderThickness: number;
  wallpaperUrl: string | null;
  wallpaperData: Uint8Array | null;
  customStartIconUrl: string | null;
  customStartIconData: Uint8Array | null;
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
  noiseOpacity: number;
  tintSaturation: number;
  dockMode: boolean;
  dockMargin: number;
  runningIndicatorStyle: RunningIndicatorStyle;
  colorHarmony: ColorHarmonyType;

  // New Phase 1 properties
  globalGradient: GradientConfig;
  taskbarOverride: ComponentOverride;
  startMenuOverride: ComponentOverride;
  flyoutOverride: ComponentOverride;
  typography: TypographyConfig;
  animations: AnimationConfig;
}
```

### 2.6 Default State Values
* `globalGradient`: Linear, 90deg, 2 stops (`accentColor` at 0%, `secondaryAccent` at 100%).
* `taskbarOverride`, `startMenuOverride`, `flyoutOverride`: `{ enabled: false }`.
* `typography`: `{ fontFamily: 'Segoe UI Variable', fontWeight: '400', characterSpacing: 0 }`.
* `animations`: `{ speed: 'default', durationMs: 250, easing: 'fluent-spring' }`.

---

## 3. UI Component Specifications

### 3.1 Interactive Gradient Builder Modal (`GradientEditorModal.tsx`)
* **Trigger**: "Edit Gradient" button displayed when `materialStyle === 'linear-gradient'` or when a component override uses a gradient.
* **Header**: Title with active target indicator (Global Theme / Taskbar / Start Menu / Flyouts) and close button.
* **Visual Stop Track**:
  * Gradient preview bar showing live CSS gradient.
  * Draggable pins below the track displaying the pin color.
  * Clicking on the track adds a stop at that percentage.
  * Selecting a pin activates it for editing (color picker + percentage input).
  * Minimum 2 stops enforced; active stop can be deleted via "Remove Stop" button or `Delete` key.
* **Angle Dial & Snapping**:
  * 360° circular SVG angle wheel with a rotating pointer.
  * Input field allowing direct degree entry (0–360°).
  * Quick-snap chips: `0° (Top)`, `45°`, `90° (Right)`, `135°`, `180° (Bottom)`, `270° (Left)`.
* **Gradient Type Switcher**: Segmented toggle between `Linear` and `Radial`.
* **Preset Swatches**:
  * *Sunset Glow* (Coral -> Amber -> Deep Violet)
  * *Cyber Horizon* (Electric Cyan -> Magenta -> Dark Navy)
  * *Deep Nebula* (Indigo -> Purple -> Pitch Black)
  * *Aurora Borealis* (Emerald Teal -> Mint -> Sky Blue)
  * *Subtle Fluent Sheen* (Translucent Pearl -> Light Slate)
* **Actions**: "Apply to Theme" (commits to store) and "Cancel".

### 3.2 Component-Level Color Isolation Section (`ComponentIsolationSection.tsx`)
* Collapsible accordion in `Sidebar.tsx`.
* 3-tab segmented control: `Taskbar`, `Start Menu`, `Flyouts`.
* Switch: **"Override Global Styling"**.
  * Off: Displays informative badge: *"Inheriting global material, color, and blur settings."*
  * On: Unlocks controls:
    * **Material Finish Dropdown**: Fluent Acrylic, Mica, Mica Alt, Pure Black, Matte Slate, Linear Gradient.
    * **Fill Control**: Solid Color picker or "Open Gradient Editor" button.
    * **Opacity Slider**: 0% to 100%.
    * **Blur Amount Slider**: 0px to 60px.
    * **Reset Override Button**: Restores component to inherit global settings.

### 3.3 Typography & Animation Section (`TypographyAnimationSection.tsx`)
* Collapsible accordion in `Sidebar.tsx`.
* **Typography Controls**:
  * Font dropdown: `Segoe UI Variable (System Default)`, `Inter`, `JetBrains Mono`, `Fira Code`, `Cascadia Code`, `Roboto`, `Custom...`.
  * If `Custom...` selected: Text input for local Windows font family name.
  * Font Weight pills: `Light (300)`, `Regular (400)`, `Medium (500)`, `Semibold (600)`, `Bold (700)`.
  * Letter Spacing slider: `-50` to `+100` with live kerning preview.
* **Animation Controls**:
  * Speed selector pills: `Instant (0ms)`, `Snappy (150ms)`, `Default Fluent (250ms)`, `Smooth (400ms)`.
  * Easing Curve pills: `Fluent Spring`, `Decelerate`, `Linear`.
  * **"Preview Flyout Animation"** test button that triggers the active flyout open/close animation.

### 3.4 Theme Diff & Inspector Modal (`ThemeDiffModal.tsx`)
* Triggered automatically upon importing a `.reg` file, or via an "Inspect Theme" button in the navigation header.
* Shows a clean 3-column table comparing:
  * **Setting Name**: e.g., Theme Name, Accent Color, Taskbar Finish, Start Menu Finish, Font Family, Animation Speed.
  * **Current Value**: Value and color chip currently active in the app.
  * **Incoming / Target Value**: Value parsed from the imported file.
  * Row highlighting: Highlighting rows where changes exist.
* Actions: "Apply Changes" (commits imported values to store) and "Discard / Keep Current".

---

## 4. Canvas Simulation (`PreviewCanvas.tsx`)

1. **Mica & Mica Alt CSS Shaders**:
   * Windows 11 Mica samples desktop wallpaper behind the window with high tint opacity and minimal blur:
     * **Mica**: `backdrop-filter: blur(40px) saturate(1.15); background-color: isLightMode ? rgba(243, 243, 243, 0.88) : rgba(32, 32, 32, 0.88);`
     * **Mica Alt**: `backdrop-filter: blur(45px) saturate(1.10); background-color: isLightMode ? rgba(235, 235, 235, 0.94) : rgba(24, 24, 24, 0.94);`
2. **Component Override Rendering**:
   * `taskbarStyle`: Uses `taskbarOverride` values if enabled, otherwise global values.
   * `startMenuStyle`: Uses `startMenuOverride` values if enabled, otherwise global values.
   * `flyoutStyle`: Uses `flyoutOverride` values if enabled, otherwise global values.
3. **Typography Injection**:
   * Applied dynamically to `.preview-canvas-root` with `font-family`, `font-weight`, and `letter-spacing: (characterSpacing / 1000)em`.
4. **Flyout CSS Transitions**:
   * Flyout open/close animations use CSS variables `--flyout-duration` and `--flyout-easing` determined by `AnimationConfig`.

---

## 5. Windhawk WinUI XAML & Registry Export Engine (`exportEngine.ts`)

1. **Multi-Stop XAML Gradient Serialization**:
   * Angle conversion:
     $$\text{rad} = \theta \times \frac{\pi}{180}$$
     $$\Delta x = \cos(\text{rad}), \quad \Delta y = \sin(\text{rad})$$
     $$x_1 = \text{clamp01}(0.5 - 0.5 \Delta x), \quad y_1 = \text{clamp01}(0.5 - 0.5 \Delta y)$$
     $$x_2 = \text{clamp01}(0.5 + 0.5 \Delta x), \quad y_2 = \text{clamp01}(0.5 + 0.5 \Delta y)$$
   * LinearGradientBrush generated:
     ```xml
     <LinearGradientBrush StartPoint="x1,y1" EndPoint="x2,y2">
       <GradientStop Color="#AARRGGBB" Offset="0.0"/>
       ...
     </LinearGradientBrush>
     ```
   * RadialGradientBrush generated:
     ```xml
     <RadialGradientBrush Center="0.5,0.5" RadiusX="0.5" RadiusY="0.5">
       <GradientStop Color="#AARRGGBB" Offset="0.0"/>
       ...
     </RadialGradientBrush>
     ```
2. **Mica / Mica Alt in Windhawk**:
   * Emitted as calibrated `WindhawkBlur`:
     * Mica: `BlurAmount="38"`, `TintOpacity="0.90"`, `NoiseOpacity="0.02"`.
     * Mica Alt: `BlurAmount="45"`, `TintOpacity="0.95"`, `NoiseOpacity="0.01"`.
3. **Component Isolation in XAML**:
   * `taskbarControlStyles` applies Taskbar override fill/blur if active.
   * `startMenuControlStyles` applies Start Menu override fill/blur if active.
4. **Typography in XAML**:
   * Injects `FontFamily="..."`, `FontWeight="..."`, and `CharacterSpacing="..."` into targeted WinUI controls.
5. **Animation Storyboard Overrides**:
   * Generates storyboard duration overrides for flyout transitions based on `animations.durationMs`.

---

## 6. Backward Compatibility & Serialization

1. **Preset Compatibility**:
   * Existing curated presets in `presets.ts` remain intact; default fallbacks are used when new properties are undefined.
2. **URL Sharing (`urlSharing.ts`)**:
   * New properties are serialized only when they deviate from defaults, keeping shared URLs compact. Legacy shared URLs without new properties hydrate with safe defaults.
3. **Registry Parser (`regParser.ts`)**:
   * Parses legacy `.reg` files without errors, mapping legacy values into current state and exposing structured differences for `ThemeDiffModal`.

---

## 7. Testing & Verification Plan

### 7.1 Automated Unit Tests
* `useThemeStore.test.ts`: Test adding/editing gradient stops, toggling component overrides, updating typography and animations, undo/redo state preservation.
* `exportEngine.test.ts`: Verify multi-stop gradient XAML output, angle-to-vector calculation, Mica/Mica Alt styles, component override styling, typography rules, and storyboard timings.
* `regParser.test.ts` & `urlSharing.test.ts`: Test parsing, URL serialization/deserialization, and backward compatibility.
* Component unit tests: Test rendering and user interactions of `GradientEditorModal`, `ComponentIsolationSection`, `TypographyAnimationSection`, and `ThemeDiffModal`.

### 7.2 Build, Git & Staging Deployment Verification
1. Run `npm run build` to ensure type-checking and production compilation succeed with zero errors.
2. Run `npm run test:run` / `npx vitest run` to verify all unit test suites pass (target: 100% pass rate).
3. Commit all changes and push to GitHub repository (`git push origin main`).
4. Build production bundle and deploy to `mt-webserver-01` (`tolhurst.me` at `/var/www/projects/theme-creator/`).
5. Live browser verification on `https://projects.tolhurst.me/theme-creator/studio/`.
