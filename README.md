# Windows 11 Custom Themes & Windhawk Styler Manager

An automated theming and customization suite for Windows 11, integrating wallpaper management, Windows accent color palettes, WinUI 3 XAML brush styles, and real-time Windhawk Styler injection via a dedicated Model Context Protocol (MCP) server.

## Features

- **Automated Theme Generation (`create_theme.py`)**:
  - Extracts dominant and harmonic color palettes from wallpapers.
  - Computes complete Windows 11 accent color tables (`AccentPalette`, `SystemAccentColorLight1-3`, `SystemAccentColorDark1-3`).
  - Generates `.reg` files for system color scheme and DWM glass/acrylic styling.
  - Generates Windhawk Styler JSON configurations for the Windows 11 Taskbar, Start Menu, and Notification Center.
  - Generates ready-to-run `.bat` and `.ps1` theme switchers.

- **Windhawk Styler MCP Server (`windhawk-mcp-server/`)**:
  - Provides MCP tools for AI-driven desktop theming (`apply_theme_preset`, `create_new_theme`, `get_styler_settings`, `set_styler_settings`, `refresh_windhawk_mods`, `restart_explorer`).
  - Reads and writes directly to Windhawk registry settings with automatic UI reload.

- **Theme Presets (`backups/`)**:
  - Canberra Autumn & Telstra Tower
  - Canberra Parliament & Wattle
  - Cobalt & Porcelain
  - Cyberpunk Neon Noir
  - Deep Ocean Bioluminescence
  - Ethereal Sakura & Cloud Mist
  - Federation Midnight & Eureka
  - Forest Sage & Warm Brass
  - Google Assistant / Rainbow
  - Great Barrier Reef & Whitsundays
  - Minimalist Zen
  - Nordic Frost & Aurora
  - Royal Obsidian & Velvet Gold
  - Sunset Synthwave & Outrun
  - Sydney Harbour & Southern Cross (Original, Cartoon, and Gradient Editions)
  - Tokyo Neon Rain & Arcade
  - Uluru Red Centre Ochre (Original, Cartoon, and Gradient Editions)

- **Antigravity Skill (`.agents/skills/windhawk-theming/`)**:
  - Embedded AI assistant skill defining styling rules, blur effects (WindhawkBlur), WinUI 3 brush targets, and safety checks.

## Quick Start

### 1. Applying a Theme Preset
Run any preset batch or PowerShell script directly from the theme folder:
```powershell
.\Apply_Cobalt_Porcelain_Theme.bat
```

### 2. Generating a New Theme from an Image
```powershell
python create_theme.py "path\to\wallpaper.jpg" --name "My Custom Theme"
```

### 3. Running the MCP Server
```powershell
cd windhawk-mcp-server
.\run.bat
```
