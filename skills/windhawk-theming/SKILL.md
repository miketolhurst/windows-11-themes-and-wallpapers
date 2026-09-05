---
name: windhawk-theming
description: Use when creating, modifying, troubleshooting, or switching Windows 11 themes, styling the Windows 11 Taskbar, Start Menu, or Notification Center using Windhawk Styler mods, configuring WinUI 3 XAML brushes or WindhawkBlur, generating Windows 11 accent color palettes, or diagnosing registry import and explorer reload issues.
---

# Windhawk & Windows 11 Theming

## Overview

Windows 11 surfaces its primary desktop UI (Taskbar, Start Menu, Notification Center / Quick Settings) via WinUI 3 and UWP XAML. Windhawk styler mods inject custom XAML elements, visual trees, and property overrides directly into these shell processes. 

A complete, working Windows 11 theme requires synchronizing four distinct layers:
1. **Windhawk Styler Mods (HKLM)**: Injected WinUI 3 XAML brushes, gradients, blur effects, corner radii, and layout transforms.
2. **Windows 11 Native Personalization (HKCU)**: 32-byte binary `AccentPalette`, DWM colorization, and light/dark mode.
3. **Desktop Wallpaper**: Win32 `SystemParametersInfo` (Action 20) with `WM_SETTINGCHANGE` broadcast.
4. **Shell Redraw Execution**: Mod reload notification via `SettingsChangeTime` timestamp and `explorer.exe` restart.

---

## When to Use

* Designing or implementing new Windows 11 visual themes.
* Modifying Start Menu, Taskbar, or Notification Center layouts or colors.
* Injecting custom brushes: `<LinearGradientBrush>`, `<WindhawkBlur>`, `<AcrylicBrush>`, `<ImageBrush>`.
* Fixing styling bugs (missing Start Button, unapplied gradients, broken blur, shell crashes).
* Automating theme switching via `.reg`, `.ps1`, and `.bat` files or the `windhawk-styler` MCP server.
* Diagnosing failed registry imports, UAC elevation issues, or Explorer caching.

---

## Architecture & Registry Map

### 1. Windhawk Styler Mod Registry Keys (HKLM)

Windhawk stores mod configurations in flattened registry format under `HKEY_LOCAL_MACHINE\SOFTWARE\Windhawk\Engine\Mods\<mod-name>\Settings`:

| Mod | Correct Registry Key Name | Process Target |
|---|---|---|
| Taskbar Styler | `windows-11-taskbar-styler` | `explorer.exe` |
| Start Menu Styler | `windows-11-start-menu-styler` | `StartMenuExperienceHost.exe` / `explorer.exe` |
| Notification Center Styler | `windows-11-notification-center-styler` | `ShellExperienceHost.exe` / `explorer.exe` |

> [!CRITICAL]
> Mod names use **hyphens**, NOT underscores (`start-menu`, NOT `start_menu`). Keys written with underscores are completely ignored by Windhawk.

### 2. Live Mod Reload Mechanism (`SettingsChangeTime`)

Restarting the Windhawk Windows service is unnecessary and can overwrite registry changes. Windhawk monitors an integer Unix timestamp key:
* Path: `HKLM:\SOFTWARE\Windhawk\Engine\Mods\<mod-name>`
* Value: `SettingsChangeTime` (REG_DWORD)
* Reload Trigger:
  ```powershell
  $t = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
  Set-ItemProperty -Path "HKLM:\SOFTWARE\Windhawk\Engine\Mods\*" -Name "SettingsChangeTime" -Value $t
  ```

### 3. Windows 11 Native Personalization (HKCU)

Windows 11 requires more than a single accent color code. Modern XAML components and Settings rely on an 8-color gradient palette:

* **Accent Palette**: `HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Accent`
  * `AccentPalette`: Binary (32 bytes = 8 colors $\times$ 4 bytes `[R, G, B, 00]`).
    * Entry 0: Lightest shade (~75% white blend)
    * Entry 1: Very light shade (~50% white blend)
    * Entry 2: Light shade (~25% white blend)
    * Entry 3: Base Accent Color
    * Entry 4: Dark shade (~20% black blend)
    * Entry 5: Very dark shade (~40% black blend)
    * Entry 6: Darkest shade (~60% black blend)
    * Entry 7: Complementary / highlight accent
  * `AccentColorMenu`: REG_DWORD (`0xAABBGGRR`, e.g., Pink `#ff007f` = `0xff7f00ff`)
  * `StartColorMenu`: REG_DWORD (`0xAABBGGRR`)
* **DWM Colorization**: `HKCU:\Software\Microsoft\Windows\DWM`
  * `AccentColor`: REG_DWORD (`0xAABBGGRR`)
  * `ColorizationColor`: REG_DWORD (`0xAARRGGBB`, e.g., `0xc4ff007f`)
  * `ColorPrevalence`: REG_DWORD (`1` to show on title bars)
* **Theme History**: `HKCU:\Software\Microsoft\Windows\CurrentVersion\Themes\History\Colors`
  * `ColorHistory0`: REG_DWORD (`0xAABBGGRR` of accent color)
* **Desktop AutoColorization**: `HKCU:\Control Panel\Desktop`
  * `AutoColorization`: REG_DWORD (`0` to prevent Windows from overwriting custom accent from wallpaper)

---

## XAML & Visual Styling Engine

Settings values passed to Windhawk stylers are raw WinUI 3 XAML snippets:

### 1. Gradients (`<LinearGradientBrush>`)
```xml
Fill:=<LinearGradientBrush StartPoint="1.4, 1.4" EndPoint="-0.4, -0.4"><GradientStop Color="#f8101216" Offset="0.0" /><GradientStop Color="#f8ff007f" Offset="0.5" /><GradientStop Color="#f800f3ff" Offset="1.0"/></LinearGradientBrush>
```
* Colors support alpha channel: `#AARRGGBB` (e.g. `#f8...` for 97% opacity).
* Spaces around comma coordinates (`StartPoint="1.4, 1.4"`) are required to ensure strict parser compliance.

### 2. Frosted Glass Blur (`<WindhawkBlur>`)
Windhawk's proprietary GPU blur effect. Far more stable than Microsoft's `AcrylicBrush`:
```xml
Fill:=<WindhawkBlur BlurAmount="22" TintColor="#E615191F" TintOpacity="0.85" TintSaturation="0.8" NoiseOpacity="0.04" NoiseDensity="1.0" FallbackColor="#15191F"/>
```
* `BlurAmount`: Blur radius (default 10; set 25–30 for heavy frosted glass).
* `NoiseOpacity` & `NoiseDensity`: Real procedural noise texture overlay.
* `TintSaturation`: Background saturation (0.0 = desaturated grayscale glass).
* `FallbackColor`: Used when battery saver or system transparency is off.
* *Limitation*: Cannot be combined directly inside a `<LinearGradientBrush>`. Use `WindhawkBlur` on container backgrounds, and gradients on strokes, indicators, and buttons.

### 3. Layout Customizations
* **Full-Height Pinned Apps (Kill "Recommended")**:
  * Collapse headers and containers:
    * `Grid#TopLevelSuggestionsListHeader` $\rightarrow$ `Visibility=Collapsed`
    * `Grid#NoTopLevelSuggestionsText` $\rightarrow$ `Visibility=Collapsed`
    * `Grid#TopLevelSuggestionsContainer` $\rightarrow$ `Visibility=Collapsed`
    * `Grid#ShowMoreSuggestions` $\rightarrow$ `Visibility=Collapsed`
  * Expand pinned items: `StartMenu.PinnedList` $\rightarrow$ `Height=504`
* **Shrink/Hide Start Search Box**:
  * `StartDocked.SearchBoxToggleButton` $\rightarrow$ `Height=0`, `Margin=0,0,0,24`
* **Dynamic Notification Center Height**:
  * `Grid#NotificationCenterGrid` $\rightarrow$ `VerticalAlignment=2` (shrinks to fit active notifications).
* **Remove Drop Shadows**:
  * Targets: `Grid#NotificationCenterGrid`, `Grid#CalendarCenterGrid` $\rightarrow$ `Shadow:=`
* **Custom Start Button Icon**:
  * Target: `Taskbar.ExperienceToggleButton#LaunchListButton[AutomationProperties.AutomationId=StartButton] > Taskbar.TaskListButtonPanel > Border#BackgroundElement`
  * Style: `Background:=<ImageBrush Stretch="Uniform" ImageSource="C:\path\to\icon.png" />`
  * *Warning*: If collapsing `AnimatedVisualPlayer#Icon`, an replacement `ImageBrush` MUST be provided or the Start Button becomes invisible.

---

## Execution & Deployment Model

Windows security separates user profile settings (`HKCU`) from machine settings (`HKLM`). Theme scripts must follow this two-tier execution pattern:

```
Apply_<Theme>_Theme.bat (User double-clicks)
  └── powershell.exe -ExecutionPolicy Bypass -File Apply_Theme.ps1
        ├── [1] SystemParametersInfoW P/Invoke (Sets wallpaper directly in session)
        ├── [2] Sets HKCU AccentPalette, DWM, Colors & Broadcasts WM_SETTINGCHANGE
        ├── [3] Elevates via UAC (RunAs) to import HKLM .reg & touch SettingsChangeTime
        └── [4] Restarts explorer.exe (Refreshes shell UI caches)
```

### Why Batch One-Liners Fail
Do not use inline `powershell -Command "Add-Type -MemberDefinition '...'"` inside `.bat` files. `cmd.exe` strips internal quotes, turning `[DllImport("user32.dll")]` into `[DllImport(" \user32.dll\\)]`, triggering unrecoverable C# compiler errors. Always invoke a dedicated `Apply_Theme.ps1`.

---

## Registry File (`.reg`) Syntax Rules

1. **Section Headers MUST use Single Backslashes**:
   * ✅ `[-HKEY_LOCAL_MACHINE\SOFTWARE\Windhawk\Engine\Mods\windows-11-taskbar-styler\Settings]`
   * ❌ `[-HKEY_LOCAL_MACHINE\\SOFTWARE\\...]` (Fails; `reg.exe` rejects path).
2. **Quote Escaping in String Values**:
   * Quotes inside string values must be escaped with `\"`:
   * ✅ `"controlStyles[0].styles[0]"="Fill:=<LinearGradientBrush StartPoint=\"1, 1\">"`
   * ❌ `"Fill:=<LinearGradientBrush StartPoint=\\"1, 1\\">"` (Double backslash causes parser abortion).
3. **File Encoding**:
   * Always write `.reg` files with UTF-16 LE (`encoding="utf-16"` with BOM).

---

## Tooling & Automation

### 1. `create_theme.py`
Located at `C:\Users\Mike\Theme and Wallpapers\create_theme.py`:
```powershell
python create_theme.py --name "Nordic Frost" --accent "#5e81ac" --secondary "#88c0d0" --bg "#2e3440" --radius 8 --wallpaper "nordic.jpg"
```
Automates palette math, YAML/XAML mod configs, clean UTF-16 `.reg`, `Apply_Theme.ps1`, and 1-click `.bat` launcher into `backups/<Theme Name>/`.

### 2. `windhawk-styler` MCP Server
Configured in `mcp_config.json`:
* `get_styler_settings(mod_name)`: Reads live mod settings as nested dictionary.
* `set_styler_settings(mod_name, settings)`: Writes settings with automatic UAC fallback.
* `refresh_windhawk_mods()`: Updates `SettingsChangeTime` timestamp across all active mods.
* `apply_theme_preset(theme_name_or_path)`: Applies full theme package in one call.
* `create_new_theme(...)`: Exposes `create_theme.py` engine directly via MCP.
* `compute_accent_palette_tool(accent_hex, secondary_hex)`: Computes Windows 11 32-byte binary palette.

---

## Multi-Edition & Directory Architecture

Themes can support multiple visual editions and companion wallpaper sets organized as subdirectories:
* **Base Package** (`backups/<Theme Name>/`): Standard frosted glassmorphism powered by `<WindhawkBlur>`, 32-byte `AccentPalette`, wallpaper, `.reg`, `.ps1`, and 1-click `.bat`.
* **Gradient Edition** (`backups/<Theme Name>/Gradient Edition/`): Alternative edition with multi-stop `<LinearGradientBrush>` styles and its own 1-click `.bat` launcher.
* **Cartoon / Travel Poster Edition** (`backups/<Theme Name>/Cartoon Edition/`): Companion alternative wallpaper directory (`wallpaper.jpg`) matching the theme's core color palette.
* **Script Portability**: Batch launchers must use `%~dp0` and PowerShell scripts must use `$PSScriptRoot` to allow folders and subfolders to be moved, renamed, or nested freely without hardcoded paths breaking.

---

## Wallpaper Generation & Accent Palette Grounding

When generating custom wallpapers for Windows 11 themes:
1. **Resolution & Aspect Ratio**: Specify widescreen 16:9 (`AspectRatio: "16:9"`).
2. **Full-Bleed & Borderless**: Direct the generation model to produce full-bleed artwork that extends seamlessly to all 4 canvas edges with zero white borders, frames, panels, or mats.
3. **Textless Rendering**: Explicitly prohibit text, captions, titles, headers, typography, and signage in prompt instructions for clean desktop backgrounds.
4. **Palette Grounding**: Ground the theme's exact hex colors directly into natural and architectural scene elements (e.g. skies, foliage, illuminated windows, reflections, and atmospheric lighting gradients).

---

## Artifact Image Embed Guidelines

When displaying theme previews and wallpapers in Antigravity markdown artifacts (e.g. `walkthrough.md`, galleries):
* **Forward Slashes Required**: Always use forward slashes in local Windows paths (e.g., `![Alt Text](C:/Users/Mike/.gemini/antigravity/brain/<id>/image.jpg)`). Backslashes (`\`) trigger JSON/webview markdown parser escape sequence bugs.
* **Artifact Directory Grounding**: Markdown webviews only render images located within `<appDataDir>\brain\<conversation-id>\`. Copy images to the brain directory before referencing them in markdown image tags.

---

## Common Mistakes & Troubleshooting

| Symptom / Error | Root Cause | Fix |
|---|---|---|
| **Start Button completely disappears** | `AnimatedVisualPlayer#Icon` collapsed without `<ImageBrush>` background. | Remove `Visibility=Collapsed` from the icon target, or provide an image brush. |
| **`reg import` fails with "Error accessing registry" or syntax error** | Double backslashes in section headers `[HKEY\\...]` or double-escaped quotes `\\"` in values. | Ensure headers have single `\` and internal quotes use single `\"`. |
| **Windhawk styles don't apply after import** | Mod key names had underscores (`start_menu`) or `SettingsChangeTime` wasn't updated. | Use hyphenated names (`start-menu`, `notification-center`) and update `SettingsChangeTime`. |
| **Desktop wallpaper does not update** | C# compilation failed in CMD one-liner due to quote mangling. | Use `Apply_Theme.ps1` with clean `[SystemParametersInfo]` P/Invoke. |
| **Windows 11 accent color does not update** | Missing 32-byte `AccentPalette` binary in HKCU, or reg import ran only under elevated admin token. | Write `AccentPalette` directly to the active user's `HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Accent`. |
| **UI doesn't redraw after applying styles** | `explorer.exe` caching old WinUI visual elements. | Kill and restart `explorer.exe` (`Stop-Process -Name explorer -Force; Start-Process explorer`). |
| **MCP server returns PermissionError** | Attempting direct registry write to HKLM from standard user process. | Use the updated MCP server with auto-UAC elevation fallback or run `Apply_Theme.ps1`. |
| **Markdown artifact images fail to display** | Backslashes used in file paths or image was outside brain artifacts directory. | Use forward slashes (`C:/...`) and reference images from `<appDataDir>\brain\<conversation-id>\`. |

