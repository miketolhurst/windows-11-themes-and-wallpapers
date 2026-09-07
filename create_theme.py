#!/usr/bin/env python3
"""
create_theme.py - Automated Windhawk & Windows 11 Theme Generator
Authored for Mike's Theme and Wallpapers workspace.

Generates a complete, ready-to-use Windows 11 theme package:
1. taskbar_backup.json (YAML/XAML)
2. start_menu_backup.json (YAML/XAML)
3. notification_center_backup.json (YAML/XAML)
4. Apply_<Theme>_Theme.reg (UTF-16 with clean syntax, proper escaping, and full 32-byte AccentPalette)
5. Apply_Theme.ps1 (Powershell automation: Wallpaper, Accent, UAC-elevated Windhawk import, Explorer restart)
6. Apply_<Theme>_Theme.bat (1-click double-clickable launcher)
"""

import argparse
import os
import sys
import yaml

def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    return tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))

def rgb_to_hex(rgb):
    return "#{:02x}{:02x}{:02x}".format(*rgb)

def blend(rgb1, rgb2, factor):
    return tuple(max(0, min(255, int(c1 + (c2 - c1) * factor))) for c1, c2 in zip(rgb1, rgb2))

def compute_accent_palette(accent_hex, secondary_hex=None):
    base_rgb = hex_to_rgb(accent_hex)
    white = (255, 255, 255)
    black = (0, 0, 0)
    
    # Generate 8 shades matching Windows 11 AccentPalette specifications
    c0 = blend(base_rgb, white, 0.75)  # Lightest
    c1 = blend(base_rgb, white, 0.50)
    c2 = blend(base_rgb, white, 0.25)
    c3 = base_rgb                      # Normal accent
    c4 = blend(base_rgb, black, 0.20)
    c5 = blend(base_rgb, black, 0.40)
    c6 = blend(base_rgb, black, 0.60)  # Darkest
    
    if secondary_hex:
        c7 = hex_to_rgb(secondary_hex)
    else:
        # Complementary hue shift
        c7 = ((base_rgb[1] + 128) % 256, (base_rgb[2] + 128) % 256, (base_rgb[0] + 128) % 256)
        
    palette_colors = [c0, c1, c2, c3, c4, c5, c6, c7]
    palette_bytes = []
    for rgb in palette_colors:
        palette_bytes.extend([rgb[0], rgb[1], rgb[2], 0])
        
    palette_hex_str = ",".join(f"{b:02x}" for b in palette_bytes)
    return palette_colors, palette_bytes, palette_hex_str

def flatten_settings(nested_dict: dict) -> dict:
    flat = {}
    for key, value in nested_dict.items():
        if isinstance(value, list):
            for i, item in enumerate(value):
                if isinstance(item, dict):
                    for prop, prop_val in item.items():
                        if isinstance(prop_val, list):
                            for j, sub_item in enumerate(prop_val):
                                flat[f"{key}[{i}].{prop}[{j}]"] = sub_item
                        else:
                            flat[f"{key}[{i}].{prop}"] = prop_val
                else:
                    flat[f"{key}[{i}]"] = item
        else:
            flat[key] = value
    return flat

def escape_reg_str(s):
    if s is None:
        return ""
    s = str(s)
    s = s.replace('\\', '\\\\')
    s = s.replace('"', '\\"')
    return s

class CustomYamlDumper(yaml.SafeDumper):
    def increase_indent(self, flow=False, indentless=False):
        return super(CustomYamlDumper, self).increase_indent(flow, False)

def create_theme(name, accent, secondary=None, bg="#101216", radius=10, wallpaper=None, light_mode=False):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    theme_dir = os.path.join(base_dir, "backups", name)
    os.makedirs(theme_dir, exist_ok=True)
    theme_slug = name.replace(" ", "_")
    
    accent_rgb = hex_to_rgb(accent)
    accent_hex = rgb_to_hex(accent_rgb)
    bg_rgb = hex_to_rgb(bg)
    bg_hex = rgb_to_hex(bg_rgb)
    
    if secondary:
        sec_rgb = hex_to_rgb(secondary)
        sec_hex = rgb_to_hex(sec_rgb)
    else:
        # Compute vibrant complementary
        sec_rgb = ((accent_rgb[1] + 128) % 256, (accent_rgb[2] + 128) % 256, (accent_rgb[0] + 128) % 256)
        sec_hex = rgb_to_hex(sec_rgb)
        
    palette_colors, palette_bytes, palette_hex_str = compute_accent_palette(accent_hex, sec_hex)
    
    # Hex DWords for Registry
    # AccentColor: AABBGGRR
    accent_dword_hex = f"ff{accent_rgb[2]:02x}{accent_rgb[1]:02x}{accent_rgb[0]:02x}"
    accent_dword_int = int(accent_dword_hex, 16)
    
    # ColorizationColor: AARRGGBB
    colorization_hex = f"c4{accent_rgb[0]:02x}{accent_rgb[1]:02x}{accent_rgb[2]:02x}"
    colorization_int = int(colorization_hex, 16)
    if colorization_int >= 0x80000000:
        colorization_int -= 0x100000000  # signed int32 conversion
        
    # Build XAML Gradients
    # Taskbar gradient (Bottom-right to top-left)
    tb_grad = f'<LinearGradientBrush StartPoint="1.4, 1.4" EndPoint="-0.4, -0.4"><GradientStop Color="#f8{bg_rgb[0]:02x}{bg_rgb[1]:02x}{bg_rgb[2]:02x}" Offset="0.0" /><GradientStop Color="#f8{accent_rgb[0]:02x}{accent_rgb[1]:02x}{accent_rgb[2]:02x}" Offset="0.5" /><GradientStop Color="#f8{sec_rgb[0]:02x}{sec_rgb[1]:02x}{sec_rgb[2]:02x}" Offset="1.0"/></LinearGradientBrush>'
    
    # Start menu gradient
    sm_grad = f'<LinearGradientBrush StartPoint="1.2, -0.2" EndPoint="-0.2, 1.2"><GradientStop Color="#f8{bg_rgb[0]:02x}{bg_rgb[1]:02x}{bg_rgb[2]:02x}" Offset="0.0" /><GradientStop Color="#f8{accent_rgb[0]:02x}{accent_rgb[1]:02x}{accent_rgb[2]:02x}" Offset="0.5" /><GradientStop Color="#f8{sec_rgb[0]:02x}{sec_rgb[1]:02x}{sec_rgb[2]:02x}" Offset="1.0"/></LinearGradientBrush>'
    
    # Notification center gradient
    nc_grad = f'<LinearGradientBrush StartPoint="1.2, 1.2" EndPoint="-0.2, -0.2"><GradientStop Color="#f8{bg_rgb[0]:02x}{bg_rgb[1]:02x}{bg_rgb[2]:02x}" Offset="0.0" /><GradientStop Color="#f8{accent_rgb[0]:02x}{accent_rgb[1]:02x}{accent_rgb[2]:02x}" Offset="0.5" /><GradientStop Color="#f8{sec_rgb[0]:02x}{sec_rgb[1]:02x}{sec_rgb[2]:02x}" Offset="1.0"/></LinearGradientBrush>'
    
    # Generate Theme Resource Variables (8 shades)
    c_light3 = rgb_to_hex(palette_colors[0])
    c_light2 = rgb_to_hex(palette_colors[1])
    c_light1 = rgb_to_hex(palette_colors[2])
    c_normal = rgb_to_hex(palette_colors[3])
    c_dark1  = rgb_to_hex(palette_colors[4])
    c_dark2  = rgb_to_hex(palette_colors[5])
    c_dark3  = rgb_to_hex(palette_colors[6])
    
    theme_vars_common = [
        f"SystemAccentColor={c_normal}",
        f"SystemAccentColorLight1={c_light1}",
        f"SystemAccentColorLight2={c_light2}",
        f"SystemAccentColorLight3={c_light3}",
        f"SystemAccentColorDark1={c_dark1}",
        f"SystemAccentColorDark2={c_dark2}",
        f"SystemAccentColorDark3={c_dark3}",
    ]
    
    nc_theme_vars = theme_vars_common + [
        f"ToggleSwitchFillOn={c_normal}",
        f"ToggleSwitchFillOnPointerOver={c_light1}",
        f"ToggleSwitchFillOnPressed={c_dark1}",
        f"SliderTrackValueFill={c_normal}",
        f"SliderTrackValueFillPointerOver={c_light1}",
        f"SliderTrackValueFillPressed={c_dark1}",
        f"SliderThumbBackground={c_normal}",
        f"SliderThumbBackgroundPointerOver={c_light1}",
        f"SliderThumbBackgroundPressed={c_dark1}"
    ]
    
    # 1. taskbar_backup.json
    taskbar_data = {
        "theme": "",
        "styleConstants": [""],
        "controlStyles": [
            {
                "target": "Taskbar.ExperienceToggleButton#LaunchListButton[AutomationPropertiesAutomationId=StartButton] > Taskbar.TaskListButtonPanel > Grid > Border#BackgroundElement",
                "styles": [f"CornerRadius={radius}"]
            },
            {
                "target": "Taskbar.TaskbarBackground#BackgroundControl > Windows.UI.Xaml.Controls.Grid > Windows.UI.Xaml.Shapes.Rectangle#BackgroundFill",
                "styles": [f"Fill:={tb_grad}"]
            },
            {
                "target": "Taskbar.TaskbarBackground#BackgroundControl > Windows.UI.Xaml.Controls.Grid > Windows.UI.Xaml.Shapes.Rectangle#BackgroundStroke",
                "styles": [f"Fill={c_normal}", "Height=2"]
            },
            {
                "target": "Taskbar.TaskListLabeledButtonPanel@RunningIndicatorStates > Rectangle#RunningIndicator",
                "styles": [f"Fill={c_normal}", "Height=3", f"CornerRadius={radius}", f"Fill@ActiveRunningIndicator={c_normal}"]
            },
            {
                "target": "Taskbar.TaskListButtonPanel > Border#BackgroundElement",
                "styles": [f"CornerRadius={radius}", f'Background@ActiveNormal:=<SolidColorBrush Color="{c_normal}" Opacity="0.18"/>']
            }
        ],
        "themeResourceVariables": [""],
        "clickThroughTaskbar": 0,
        "xamlDiagnosticsHandling": ""
    }
    
    # 2. start_menu_backup.json
    start_menu_data = {
        "theme": "",
        "disableNewStartMenuLayout": "",
        "styleConstants": [""],
        "controlStyles": [
            {
                "target": "Border#AcrylicBorder",
                "styles": [
                    f"Background:={sm_grad}",
                    f"BorderBrush={c_normal}",
                    "BorderThickness=2",
                    f"CornerRadius={radius}"
                ]
            },
            {
                "target": "Border#AppBorder",
                "styles": [f"CornerRadius={radius}"]
            },
            {
                "target": "StartDocked.SearchBoxToggleButton",
                "styles": [
                    f"Background={c_normal}EE",
                    f"BorderBrush={c_normal}EE",
                    "BorderThickness=2",
                    f"CornerRadius={radius}"
                ]
            }
        ],
        "themeResourceVariables": theme_vars_common,
        "webContentStyles": [{"target": "", "styles": [""]}],
        "webContentCustomJs": ""
    }
    
    # 3. notification_center_backup.json
    button_radius = max(0, radius - 4) if radius > 4 else radius
    notif_center_data = {
        "theme": "",
        "styleConstants": [""],
        "controlStyles": [
            {
                "target": "Grid#NotificationCenterGrid",
                "styles": [f"Background:={nc_grad}", f"BorderBrush={c_normal}", "BorderThickness=2", f"CornerRadius={radius}"]
            },
            {
                "target": "Grid#CalendarCenterGrid",
                "styles": [f"Background:={nc_grad}", f"BorderBrush={c_normal}", "BorderThickness=2", f"CornerRadius={radius}"]
            },
            {
                "target": "Grid#ControlCenterRegion",
                "styles": [f"Background:={nc_grad}", f"BorderBrush={c_normal}", "BorderThickness=2", f"CornerRadius={radius}"]
            },
            {
                "target": "QuickActions.ControlCenter.AccessibleWindow#PageWindow > ContentPresenter > Grid#FullScreenPageRoot",
                "styles": [f"Background:={nc_grad}", f"BorderBrush={c_normal}", "BorderThickness=2", f"CornerRadius={radius}"]
            },
            {
                "target": "ContentPresenter > Grid#FullScreenPageRoot",
                "styles": [f"Background:={nc_grad}", f"BorderBrush={c_normal}", "BorderThickness=2", f"CornerRadius={radius}"]
            },
            {
                "target": "ContentPresenter#PageContent > Grid > Border",
                "styles": ["Background=Transparent", "BorderBrush=Transparent"]
            },
            {
                "target": "ContentPresenter#PageHeader",
                "styles": ["Background=Transparent", "BorderBrush=Transparent"]
            },
            {
                "target": "QuickActions.AccessibleToggleButton#ToggleButton",
                "styles": [f"CornerRadius={button_radius}"]
            },
            {
                "target": "QuickActions.AccessibleToggleButton#SplitL2Button",
                "styles": [f"CornerRadius={button_radius}"]
            }
        ],
        "themeResourceVariables": nc_theme_vars
    }
    
    # Write YAML/JSON Files
    files_to_write = [
        ("taskbar_backup.json", taskbar_data),
        ("start_menu_backup.json", start_menu_data),
        ("notification_center_backup.json", notif_center_data)
    ]
    
    for filename, data in files_to_write:
        filepath = os.path.join(theme_dir, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            yaml.dump(data, f, Dumper=CustomYamlDumper, default_flow_style=False, sort_keys=False, width=float('inf'))
            
    # 4. Generate .reg file
    mods_for_reg = [
        ("1. Windows 11 Taskbar Styler", "windows-11-taskbar-styler", taskbar_data),
        ("2. Windows 11 Start Menu Styler", "windows-11-start-menu-styler", start_menu_data),
        ("3. Windows 11 Notification Center & Quick Settings Styler", "windows-11-notification-center-styler", notif_center_data)
    ]
    
    reg_lines = [
        "Windows Registry Editor Version 5.00",
        ""
    ]
    
    for label, mod_name, data in mods_for_reg:
        flat = flatten_settings(data)
        key_path = f"HKEY_LOCAL_MACHINE\\SOFTWARE\\Windhawk\\Engine\\Mods\\{mod_name}\\Settings"
        
        reg_lines.append(f"; {'=' * 60}")
        reg_lines.append(f"; {label}")
        reg_lines.append(f"; {'=' * 60}")
        reg_lines.append(f"[-{key_path}]")
        reg_lines.append("")
        reg_lines.append(f"[{key_path}]")
        
        for k, v in flat.items():
            if isinstance(v, int) and not isinstance(v, bool):
                hex_val = hex(v)[2:].zfill(8)
                reg_lines.append(f'"{k}"=dword:{hex_val}')
            else:
                escaped_val = escape_reg_str(v)
                reg_lines.append(f'"{k}"="{escaped_val}"')
                
        reg_lines.append("")
        
    dark_val = 1 if light_mode else 0
    rgb_str = f"{accent_rgb[0]} {accent_rgb[1]} {accent_rgb[2]}"
    
    reg_lines.extend([
        f"; {'=' * 60}",
        "; 4. Windows 11 Personalization Accent Color & Explorer Accent",
        f"; {'=' * 60}",
        r"[HKEY_CURRENT_USER\Software\Microsoft\Windows\DWM]",
        f'"AccentColor"=dword:{accent_dword_hex}',
        f'"ColorizationColor"=dword:{colorization_hex}',
        f'"ColorizationAfterglow"=dword:{colorization_hex}',
        r'"AccentColorInactive"=dword:ff22272e',
        r'"ColorPrevalence"=dword:00000001',
        "",
        r"[HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Explorer\Accent]",
        f'"AccentColorMenu"=dword:{accent_dword_hex}',
        f'"StartColorMenu"=dword:{accent_dword_hex}',
        f'"AccentPalette"=hex:{palette_hex_str}',
        "",
        r"[HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Themes\History\Colors]",
        f'"ColorHistory0"=dword:{accent_dword_hex}',
        "",
        r"[HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize]",
        f'"AppsUseLightTheme"=dword:{dark_val:08x}',
        f'"SystemUsesLightTheme"=dword:{dark_val:08x}',
        r'"EnableTransparency"=dword:00000001',
        "",
        r"[HKEY_CURRENT_USER\Control Panel\Desktop]",
        r'"AutoColorization"=dword:00000000',
        "",
        r"[HKEY_CURRENT_USER\Control Panel\Colors]",
        f'"Hilight"="{rgb_str}"',
        f'"HotTrackingColor"="{rgb_str}"',
        ""
    ])
    
    reg_filename = f"Apply_{theme_slug}_Theme.reg"
    reg_filepath = os.path.join(theme_dir, reg_filename)
    with open(reg_filepath, "w", encoding="utf-16") as f:
        f.write("\r\n".join(reg_lines))
        
    # Determine Wallpaper file
    if wallpaper:
        wp_name = os.path.basename(wallpaper)
        target_wp_path = os.path.join(theme_dir, wp_name)
        if os.path.isabs(wallpaper) and os.path.exists(wallpaper) and os.path.abspath(wallpaper) != os.path.abspath(target_wp_path):
            import shutil
            shutil.copy2(wallpaper, target_wp_path)
    else:
        existing_wps = [f for f in os.listdir(theme_dir) if f.lower().endswith(".jpg") or f.lower().endswith(".png")]
        wp_name = existing_wps[0] if existing_wps else f"{theme_slug}_Wallpaper.jpg"
        
    # 5. Generate Apply_Theme.ps1
    palette_bytes_str = ", ".join([f"0x{b:02x}" for b in palette_bytes])
    ps1_content = f"""# Apply_Theme.ps1 - {name}

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host " Applying {name} Theme" -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Desktop Wallpaper
Write-Host "[1/4] Setting Desktop Wallpaper..." -ForegroundColor Yellow
$wpFile = "$PSScriptRoot\\{wp_name}"
if (Test-Path $wpFile) {{
    $wallpaperPath = (Resolve-Path $wpFile).Path
    Add-Type @"
using System;
using System.Runtime.InteropServices;
public class WallHelper {{
    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);
}}
"@ -ErrorAction SilentlyContinue

    $setRes = [WallHelper]::SystemParametersInfo(20, 0, $wallpaperPath, 3)
    Set-ItemProperty -Path "HKCU:\\Control Panel\\Desktop" -Name "WallPaper" -Value $wallpaperPath
    Write-Host "Wallpaper updated successfully." -ForegroundColor Green
}} else {{
    Write-Host "Wallpaper file '$wpFile' not found. Skipping wallpaper." -ForegroundColor Yellow
}}
Write-Host ""

# 2. Windows 11 Personalization Accent Color & Dark Mode (Direct to HKCU)
Write-Host "[2/4] Applying Windows 11 Accent Color & Dark Mode..." -ForegroundColor Yellow
$accentDword = [int]0x{accent_dword_hex}
$colorizationDword = [int]{colorization_int}
$palette = [byte[]]@({palette_bytes_str})

# DWM
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\DWM" -Name "AccentColor" -Value $accentDword -Type DWord
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\DWM" -Name "ColorizationColor" -Value $colorizationDword -Type DWord
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\DWM" -Name "ColorizationAfterglow" -Value $colorizationDword -Type DWord
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\DWM" -Name "AccentColorInactive" -Value 0xff22272e -Type DWord
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\DWM" -Name "ColorPrevalence" -Value 1 -Type DWord

# Explorer Accent
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Accent" -Name "AccentColorMenu" -Value $accentDword -Type DWord
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Accent" -Name "StartColorMenu" -Value $accentDword -Type DWord
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Accent" -Name "AccentPalette" -Value $palette -Type Binary

# Themes Personalize
New-Item -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize" -Force | Out-Null
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize" -Name "AppsUseLightTheme" -Value {dark_val} -Type DWord
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize" -Name "SystemUsesLightTheme" -Value {dark_val} -Type DWord
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize" -Name "EnableTransparency" -Value 1 -Type DWord

# Settings app history & desktop colors
New-Item -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\History\\Colors" -Force | Out-Null
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\History\\Colors" -Name "ColorHistory0" -Value $accentDword -Type DWord
Set-ItemProperty -Path "HKCU:\\Control Panel\\Desktop" -Name "AutoColorization" -Value 0 -Type DWord
Set-ItemProperty -Path "HKCU:\\Control Panel\\Colors" -Name "Hilight" -Value "{rgb_str}"
Set-ItemProperty -Path "HKCU:\\Control Panel\\Colors" -Name "HotTrackingColor" -Value "{rgb_str}"

# Broadcast color & theme change messages
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class Win32MsgHelper {{
    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    public static extern IntPtr SendMessageTimeout(
        IntPtr hWnd, uint Msg, UIntPtr wParam, string lParam,
        uint fuFlags, uint uTimeout, out UIntPtr lpdwResult);
}}
"@ -ErrorAction SilentlyContinue

$msgResult = [UIntPtr]::Zero
[Win32MsgHelper]::SendMessageTimeout([IntPtr]0xffff, 0x001A, [UIntPtr]::Zero, "ImmersiveColorSet", 2, 1000, [ref]$msgResult) | Out-Null
[Win32MsgHelper]::SendMessageTimeout([IntPtr]0xffff, 0x001A, [UIntPtr]::Zero, "WindowsThemeElement", 2, 1000, [ref]$msgResult) | Out-Null
Write-Host "Windows 11 accent color applied." -ForegroundColor Green
Write-Host ""

# 3. Windhawk Registry & Mod Refresh (Elevated)
Write-Host "[3/4] Importing Windhawk Styler Mod Settings (Elevated)..." -ForegroundColor Yellow
$regPath = (Resolve-Path "$PSScriptRoot\\{reg_filename}").Path
Start-Process reg -ArgumentList "import `"$regPath`"" -Verb RunAs -Wait
$t = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
Start-Process powershell -ArgumentList "-Command", "Set-ItemProperty -Path HKLM:\\SOFTWARE\\Windhawk\\Engine\\Mods\\* -Name SettingsChangeTime -Value $t" -Verb RunAs -Wait
Write-Host "Windhawk engine styles refreshed." -ForegroundColor Green
Write-Host ""

# 4. Restart Windows Explorer
Write-Host "[4/4] Restarting Windows Explorer..." -ForegroundColor Yellow
Stop-Process -Name explorer -Force
Start-Process explorer
Write-Host ""
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host " Done! {name} theme is active!" -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Cyan
"""
    ps1_filepath = os.path.join(theme_dir, "Apply_Theme.ps1")
    with open(ps1_filepath, "w", encoding="utf-8") as f:
        f.write(ps1_content)
        
    # 6. Generate 1-click .bat
    bat_content = f"""@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Apply_Theme.ps1"
pause
"""
    bat_filename = f"Apply_{theme_slug}_Theme.bat"
    bat_filepath = os.path.join(theme_dir, bat_filename)
    with open(bat_filepath, "w", encoding="utf-8") as f:
        f.write(bat_content)
        
    print(f"\n[+] Successfully created theme '{name}' at: {theme_dir}")
    print(f"    - Mod configs: taskbar, start menu, and notification center")
    print(f"    - Registry file: {reg_filename}")
    print(f"    - Automation script: Apply_Theme.ps1")
    print(f"    - 1-Click Launcher: {bat_filename}\n")
    return theme_dir

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate a complete Windhawk & Windows 11 Theme Package.")
    parser.add_argument("--name", required=True, help="Theme Name (e.g. 'Solarized Dark')")
    parser.add_argument("--accent", required=True, help="Primary Accent Hex (e.g. '#b58900' or 'b58900')")
    parser.add_argument("--secondary", default=None, help="Optional Secondary Accent Hex (e.g. '#2aa198')")
    parser.add_argument("--bg", default="#101216", help="Background base color hex (default: #101216)")
    parser.add_argument("--radius", type=int, default=10, help="Corner radius in pixels (default: 10)")
    parser.add_argument("--wallpaper", default=None, help="Path or filename of wallpaper image")
    parser.add_argument("--light", action="store_true", help="Use Light Mode instead of Dark Mode")
    
    args = parser.parse_args()
    create_theme(
        name=args.name,
        accent=args.accent,
        secondary=args.secondary,
        bg=args.bg,
        radius=args.radius,
        wallpaper=args.wallpaper,
        light_mode=args.light
    )
