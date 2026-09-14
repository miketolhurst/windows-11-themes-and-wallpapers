# Phase 2: Extended OS Surfaces, Window Previews & Shell Customization Design Spec

**Date:** 2026-09-14  
**Status:** Approved by User  
**Scope:** Phase 2 (Extended OS Surfaces, Multi-Window Previews, Vector Start Icons, Running App Indicators)  
**Project:** Windows 11 Theme Creator (`theme-creator-web`)

---

## 1. Overview & Objectives

Phase 2 broadens the Windows 11 Theme Creator from core desktop shell surfaces (Taskbar, Start Menu, Quick Settings) to the broader Windows 11 operating system environment:
1. **Extended OS Surfaces (Context Menu & File Explorer)**:
   - Independent WinUI 3 XAML styling for Windows 11 modern context menus (`MenuFlyoutPresenter`, `MenuFlyoutItem`), corner radii, acrylic/mica finishes, border brushes, and item hover highlights.
   - 1-click toggle for the Windows 10 Classic Context Menu via CLSID registry override (`{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}`).
   - Independent File Explorer styling for WinUI 3 tabs (`TabViewItem`), command bar/ribbon tinting, and active window DWM title bar colorization (`ColorPrevalence`).
2. **Multi-Window WYSIWYG Previews on Desktop Canvas (`PreviewCanvas.tsx`)**:
   - Sidebar-driven surface switcher (`Desktop`, `File Explorer`, `Terminal`, `Context Menu`).
   - Photorealistic simulated **File Explorer** window with tabs, ribbon, address bar, navigation tree, and accent selection highlights.
   - Simulated **Windows Terminal** window testing custom typography (Phase 1 fonts, weights, kerning) and DWM accent title bars.
   - Simulated **Modern Context Menu** triggerable via sidebar button or by **right-clicking anywhere on the preview canvas**.
3. **Curated Start Button Vector Icon Library (`StartButtonAndIndicatorsSection.tsx`)**:
   - Compact dropdown menu containing 8 handcrafted vector presets:
     1. *Windows 11 Minimal (Clean 4-tile geometric)*
     2. *Windows 98 / XP Flag (Retro wavy flag)*
     3. *Apple Glyph (Minimal monochrome apple)*
     4. *Cyberpunk Hexagon (Sci-fi tech mesh)*
     5. *Linux Tux (Classic penguin silhouette)*
     6. *Minimal Diamond (Modern rotated square)*
     7. *ROG Gaming Badge (Angled cyber crest)*
     8. *Fluent Orb (Layered circular gradient)*
   - Color Mode: `Sync Primary Accent`, `Sync Secondary Accent`, or `Custom HEX` (via `ColorPickerPopover`).
   - Sizing control from 16px to 32px (default 20px).
   - Bundles `start_icon.png` in the exported `.zip` with automated placement via `Apply_Theme.ps1`.
4. **Customizable Running App Indicators**:
   - Geometry styles: `Line` (3px bar), `Dot` (centered circle), `Pill` (rounded capsule), `Glow` (diffuse radial bloom), `Off` (hidden).
   - Independent active and inactive indicator colors (Accent / White / Subtle / Custom HEX).
   - Indicator thickness / diameter sizing slider (1px to 6px).

---

## 2. Architecture & Data Model

All state extensions reside in `src/store/useThemeStore.ts`, maintaining 100% backward compatibility with existing saved themes, presets, and shared URL formats.

### 2.1 Start Button Configuration
```typescript
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
  customColor: string; // Valid 6-digit hex code e.g. '#0078D4'
  size: number;        // 16 to 32px (default 20px)
}
```

### 2.2 Running App Indicator Configuration
```typescript
export type RunningIndicatorStyle = 'line' | 'dot' | 'pill' | 'glow' | 'off';

export interface RunningIndicatorConfig {
  style: RunningIndicatorStyle;
  activeColorMode: 'accent' | 'white' | 'custom';
  activeCustomColor: string; // Valid 6-digit hex code e.g. '#0078D4'
  inactiveColorMode: 'subtle-white' | 'accent' | 'custom';
  inactiveCustomColor: string; // Valid 6-digit hex code e.g. '#808080'
  indicatorSize: number; // Thickness/size in px (1 to 6px, default 3px)
}
```

### 2.3 Extended Component Overrides
```typescript
export interface ContextMenuOverride extends ComponentOverride {
  enableClassicMenu?: boolean; // Windows 10 full context menu CLSID toggle
  itemHoverAccent?: boolean;   // WinUI accent highlight on hover
}

export interface FileExplorerOverride extends ComponentOverride {
  tabStyle: 'integrated' | 'floating' | 'accent-border';
  showCommandBarTint: boolean;
  activeTabColorMode: 'accent' | 'surface';
}
```

### 2.4 Preview Canvas View Modes
```typescript
export type PreviewViewMode =
  | 'desktop'         // Full desktop canvas with Taskbar & desktop icons
  | 'file-explorer'   // Simulated File Explorer window over desktop
  | 'terminal'        // Simulated Windows Terminal window over desktop
  | 'context-menu';   // Simulated Windows 11 context menu overlay
```

### 2.5 Updated `ThemeConfigSnapshot`
```typescript
export interface ThemeConfigSnapshot {
  // Existing Phase 1 Properties
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
  taskbarBlur: number;
  startMenuBlur: number;
  notificationBlur: number;
  dockMode: boolean;
  runningIndicatorStyle: RunningIndicatorStyle; // Backwards compatible mapping
  noiseOpacity: number;
  tintSaturation: number;
  hideRecommended: boolean;
  compactSearch: boolean;
  dynamicNotificationHeight: boolean;
  removeDropShadows: boolean;
  globalGradient: GradientConfig;
  taskbarOverride: ComponentOverride;
  startMenuOverride: ComponentOverride;
  flyoutOverride: ComponentOverride;
  typography: TypographyConfig;
  animations: AnimationConfig;

  // Phase 2 Properties
  startButton: StartButtonConfig;
  runningIndicator: RunningIndicatorConfig;
  contextMenuOverride: ContextMenuOverride;
  fileExplorerOverride: FileExplorerOverride;
  previewViewMode: PreviewViewMode;
}
```

---

## 3. UI Components & Interactions

### 3.1 Extended `ComponentIsolationSection.tsx`
The 3-tab segmented control is upgraded to **5 tabs**:  
`[Taskbar]` | `[Start Menu]` | `[Flyouts]` | `[Context Menu]` | `[File Explorer]`

* **Context Menu Tab**:
  * Override enable toggle (Inherit Global vs Independent Override).
  * Material finishes: Acrylic Glass, Mica, Mica Alt, OLED Pure Black, Matte Slate, Linear Gradient.
  * Custom Fill Color (`ColorPickerPopover`) & Edit Gradient (`GradientEditorModal`).
  * Corner radius (0–16px) and border thickness (0–4px).
  * *Use Windows 10 Classic Context Menu* toggle (CLSID switch).
  * *Highlight Items on Hover with Accent Color* toggle.

* **File Explorer Tab**:
  * Override enable toggle.
  * Material finishes: Mica, Mica Alt, Acrylic, Matte Slate.
  * Tab Style selector: `Integrated`, `Floating`, or `Accent Top Border`.
  * Active Tab Color Mode: `Accent Color` vs `Surface Match`.
  * Command Bar Tinting toggle with opacity slider.

### 3.2 New `StartButtonAndIndicatorsSection.tsx`
Positioned in `Sidebar.tsx` directly beneath Appearance & Colors:
* **Start Button Controls**:
  * Mode Switch: `[Windows Default]` | `[Vector Presets]` | `[Upload Custom]`.
  * Compact `<select>` dropdown for the 8 vector icons with icon glyphs and names.
  * Color Mode: `Sync Accent` | `Sync Secondary` | `Custom HEX` (opening `ColorPickerPopover`).
  * Icon Size slider (16px to 32px, default 20px).
* **Running App Indicators**:
  * Style pills: `Line`, `Dot`, `Pill`, `Glow`, `Off`.
  * Active Color mode: `Accent` | `White` | `Custom HEX`.
  * Inactive Color mode: `Subtle White` | `Accent` | `Custom HEX`.
  * Indicator Size / Thickness slider (1px to 6px).

### 3.3 Sidebar Preview Mode Control
Located in the sidebar under "Preview Surfaces & Windows":  
Buttons: `[🖥️ Desktop]` | `[📁 File Explorer]` | `[💻 Terminal]` | `[📋 Context Menu]`

---

## 4. WYSIWYG Preview Canvas Simulation (`PreviewCanvas.tsx`)

1. **Desktop View**:
   - Wallpaper, desktop icons, and taskbar.
   - Taskbar renders the selected Start button vector preset with active fill color and sizing.
   - Running app indicators render according to style (`Line`, `Dot`, `Pill`, `Glow`, `Off`) with active/inactive colors.
2. **File Explorer Window**:
   - Floating window with standard window controls (min, max, close).
   - Tab strip (`Home`, `Downloads`, `Projects`) matching `tabStyle` and active tab accent.
   - Command bar ribbon with icons and hover accent tint.
   - Breadcrumb address bar and search box with accent focus ring.
   - Left navigation tree and main file grid with accent-highlighted row selection.
   - Mica / Acrylic window backing filter.
3. **Windows Terminal Window**:
   - Title bar showing active `ColorPrevalence` accent colorization.
   - Tabs: PowerShell, Command Prompt, Azure.
   - Console text rendering the chosen Phase 1 font family, weight, and kerning.
4. **Context Menu Simulation**:
   - Triggerable via sidebar button or **right-clicking anywhere on the preview canvas**.
   - Authentically renders WinUI 3 `MenuFlyoutPresenter`:
     - Top action row (Cut, Copy, Rename, Share, Delete).
     - Menu items (*View*, *Sort by*, *Refresh*, *New*, *Display settings*, *Personalize*, *Open in Windows Terminal*).
     - Custom corner radius, border thickness, acrylic/mica background, and hover accent fill.
     - Automatically switches to Windows 10 Win32 style if Classic Menu is toggled on.

---

## 5. Export Engine & Installer Updates (`exportEngine.ts`, `Apply_Theme.ps1`)

1. **Context Menu XAML & Registry**:
   - Injects XAML targeting `MenuFlyoutPresenter` and `MenuFlyoutItem` in Windhawk stylers.
   - If `enableClassicMenu` is true, injects:
     ```reg
     [HKEY_CURRENT_USER\Software\Classes\CLSID\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}\InprocServer32]
     @=""
     ```
     *(If false, the installer deletes this key).*
2. **File Explorer XAML & Registry**:
   - Injects XAML targeting `Microsoft.UI.Xaml.Controls.TabViewItem` and `CommandBar`.
   - Sets `HKCU\Software\Microsoft\Windows\DWM\ColorPrevalence = 1`.
3. **Start Button Asset Bundling**:
   - When a vector preset or custom upload is selected, renders the icon with the specified color to `start_icon.png` (high-res 64×64 PNG) inside the `.zip`.
   - Configures `Taskbar.TaskbarFrameContent > StartButton` with `<Image Source="%APPDATA%\Windhawk\Themes\start_icon.png" Width="${size}" Height="${size}"/>`.
   - `Apply_Theme.ps1` extracts `start_icon.png` to `%APPDATA%\Windhawk\Themes\`.
4. **Running App Indicator Styling**:
   - Injects geometry rules for `Taskbar.RunningIndicator`:
     - `Line`: `Height=${size}`, `Width=16`, `CornerRadius=1.5`.
     - `Dot`: `Height=${size*1.5}`, `Width=${size*1.5}`, `CornerRadius=99`.
     - `Pill`: `Height=${size}`, `Width=${size*3}`, `CornerRadius=99`.
     - `Glow`: Radial glow brush centered beneath icon.
     - `Off`: `Visibility=Collapsed`.
5. **Theme Restore Script (`Restore_Default_Windows11.bat`)**:
   - Deletes the classic context menu CLSID if set.
   - Restores stock Windows 11 Start button and running indicator geometry.

---

## 6. URL Sharing & Backward Compatibility (`urlSharing.ts`)

- Added compact query parameters:
  - `sb`: Encodes Start button (`p:presetId:color:size` or `d`).
  - `ind`: Encodes running indicator (`style:activeColor:inactiveColor:size`).
  - `cmOvr`: Encodes context menu override.
  - `feOvr`: Encodes file explorer override.
- Legacy URLs without these parameters automatically hydrate with safe defaults.

---

## 7. Verification & Testing Strategy

- Full unit testing with Vitest (`npx vitest run`):
  - `useThemeStore.test.ts`: Phase 2 state mutations, defaults, snapshot history.
  - `StartButtonAndIndicatorsSection.test.tsx`: Dropdown selection, color sync, custom HEX, indicator styles.
  - `ComponentIsolationSection.test.tsx`: 5 segmented tabs, Context Menu and File Explorer controls.
  - `PreviewCanvas.test.tsx`: View modes, right-click context menu, vector start button, indicator shapes.
  - `exportEngine.test.ts`: WinUI 3 XAML generation, classic menu registry, `start_icon.png` packaging.
  - `urlSharing.test.ts`: Roundtrip encode/decode of Phase 2 parameters.
  - `regParser.test.ts`: Diffs comparison with Phase 2 properties.
- Static export build: `npm run build` with 0 TypeScript/Turbopack errors.
- End-to-end smoke testing via Playwright on live staging (`tolhurst.me`).
