import JSZip from 'jszip';
import type { ThemeState, ThemeConfigSnapshot } from '../../types/theme';
import { DEFAULT_THEME_STATE } from '../../store/useThemeStore';
import { computeAccentPalette, hexToRgb } from '../paletteEngine';
import { DEFAULT_START_ICON_PNG, buildWindhawkJsonBackups } from './xamlGenerators';
import { generateRegFileString } from './regBuilder';

export function generateRestoreBatString(): string {
  return generateBatScript('Restore_Defaults.ps1');
}

export function generateBatScript(scriptName: string = 'Apply_Theme.ps1'): string {
  return `@echo off\r\npowershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0${scriptName}"\r\npause\r\n`;
}

export function generateRestorePs1Script(): string {
  return `# Restore_Defaults.ps1 - Windows 11 & Windhawk Defaults Restoration
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host " Restoring Windows 11 & Windhawk Defaults" -ForegroundColor Yellow
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Reset Windows 11 Default Accent Color & Light/Dark Mode
Write-Host "[1/3] Restoring Default Windows Accent Palette & Colors..." -ForegroundColor Yellow
$defaultAccentDword = [int]0xffd77800 # Standard Windows Blue
$defaultColorization = [int]0xc40078d4

Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\DWM" -Name "AccentColor" -Value $defaultAccentDword -Type DWord -ErrorAction SilentlyContinue
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\DWM" -Name "ColorizationColor" -Value $defaultColorization -Type DWord -ErrorAction SilentlyContinue
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\DWM" -Name "ColorPrevalence" -Value 0 -Type DWord -ErrorAction SilentlyContinue

Remove-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Accent" -Name "AccentColorMenu" -ErrorAction SilentlyContinue
Remove-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Accent" -Name "StartColorMenu" -ErrorAction SilentlyContinue
Remove-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Accent" -Name "AccentPalette" -ErrorAction SilentlyContinue

# Restore modern Windows 11 context menu if classic override was present
Remove-Item -Path "HKCU:\\Software\\Classes\\CLSID\\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}" -Recurse -ErrorAction SilentlyContinue

# Clean up custom start button icon
Remove-Item -Path "$env:PUBLIC\\Pictures\\Windhawk_start_icon.png" -Force -ErrorAction SilentlyContinue
if (Test-Path "C:\\Users\\Public\\Pictures\\Windhawk_start_icon.png") {
    Remove-Item -Path "C:\\Users\\Public\\Pictures\\Windhawk_start_icon.png" -Force -ErrorAction SilentlyContinue
}

# Broadcast color change to shell
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class Win32MsgHelper {
    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    public static extern IntPtr SendMessageTimeout(
        IntPtr hWnd, uint Msg, UIntPtr wParam, string lParam,
        uint fuFlags, uint uTimeout, out UIntPtr lpdwResult);
}
"@ -ErrorAction SilentlyContinue

$msgResult = [UIntPtr]::Zero
[Win32MsgHelper]::SendMessageTimeout([IntPtr]0xffff, 0x001A, [UIntPtr]::Zero, "ImmersiveColorSet", 2, 1000, [ref]$msgResult) | Out-Null
[Win32MsgHelper]::SendMessageTimeout([IntPtr]0xffff, 0x001A, [UIntPtr]::Zero, "WindowsThemeElement", 2, 1000, [ref]$msgResult) | Out-Null
Write-Host "Windows default colors restored." -ForegroundColor Green
Write-Host ""

# 2. Reset Windhawk Styler Mod Settings (Single Elevated UAC Prompt)
Write-Host "[2/3] Resetting Windhawk Styler Mods to Defaults (Elevated)..." -ForegroundColor Yellow
$t = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$elevatedReset = "reg delete 'HKLM\\SOFTWARE\\Windhawk\\Engine\\Mods\\windows-11-taskbar-styler\\Settings' /f; reg delete 'HKLM\\SOFTWARE\\Windhawk\\Engine\\Mods\\windows-11-start-menu-styler\\Settings' /f; reg delete 'HKLM\\SOFTWARE\\Windhawk\\Engine\\Mods\\windows-11-notification-center-styler\\Settings' /f; Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\Windhawk\\Engine\\Mods\\*' -Name SettingsChangeTime -Value $t -ErrorAction SilentlyContinue"
Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -Command $elevatedReset" -Verb RunAs -Wait
Write-Host "Windhawk styler settings cleared." -ForegroundColor Green
Write-Host ""

# 3. Restart Windows Explorer
Write-Host "[3/3] Restarting Windows Explorer..." -ForegroundColor Yellow
Stop-Process -Name explorer -Force
Start-Process explorer
Write-Host ""
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host " Windows 11 defaults restored successfully!" -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Cyan
`;
}

export function generatePs1Script(state: ThemeConfigSnapshot | ThemeState): string {
  const palette = computeAccentPalette(state.accentColor, state.secondaryAccent);
  const paletteBytesStr = palette.bytes.map((b) => `0x${b.toString(16).padStart(2, '0')}`).join(', ');
  const darkVal = state.isLightMode ? 1 : 0;
  const accentRgb = hexToRgb(state.accentColor);
  const rgbStr = `${accentRgb[0]} ${accentRgb[1]} ${accentRgb[2]}`;

  return `# Apply_Theme.ps1 - ${state.themeName}
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host " Applying ${state.themeName} Theme" -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Desktop Wallpaper
Write-Host "[1/4] Setting Desktop Wallpaper..." -ForegroundColor Yellow
$wpFile = "$PSScriptRoot\\wallpaper.jpg"
if (Test-Path $wpFile) {
    $wallpaperPath = (Resolve-Path $wpFile).Path
    Add-Type @"
using System;
using System.Runtime.InteropServices;
public class WallHelper {
    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);
}
"@ -ErrorAction SilentlyContinue

    $setRes = [WallHelper]::SystemParametersInfo(20, 0, $wallpaperPath, 3)
    Set-ItemProperty -Path "HKCU:\\Control Panel\\Desktop" -Name "WallPaper" -Value $wallpaperPath
    Write-Host "Wallpaper updated successfully." -ForegroundColor Green
} else {
    Write-Host "Wallpaper file '$wpFile' not found. Skipping wallpaper." -ForegroundColor Yellow
}
Write-Host ""

# 2. Windows 11 Personalization Accent Color & Dark Mode
Write-Host "[2/4] Applying Windows 11 Accent Color & Personalization..." -ForegroundColor Yellow
$accentDword = [int]0x${palette.accentDwordHex}
$colorizationDword = [int]${palette.colorizationInt}
$palette = [byte[]]@(${paletteBytesStr})

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
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize" -Name "AppsUseLightTheme" -Value ${darkVal} -Type DWord
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize" -Name "SystemUsesLightTheme" -Value ${darkVal} -Type DWord
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize" -Name "EnableTransparency" -Value 1 -Type DWord

# Colors
New-Item -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\History\\Colors" -Force | Out-Null
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\History\\Colors" -Name "ColorHistory0" -Value $accentDword -Type DWord
Set-ItemProperty -Path "HKCU:\\Control Panel\\Desktop" -Name "AutoColorization" -Value 0 -Type DWord
Set-ItemProperty -Path "HKCU:\\Control Panel\\Colors" -Name "Hilight" -Value "${rgbStr}"
Set-ItemProperty -Path "HKCU:\\Control Panel\\Colors" -Name "HotTrackingColor" -Value "${rgbStr}"

# Broadcast color change to shell
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class Win32MsgHelper {
    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    public static extern IntPtr SendMessageTimeout(
        IntPtr hWnd, uint Msg, UIntPtr wParam, string lParam,
        uint fuFlags, uint uTimeout, out UIntPtr lpdwResult);
}
"@ -ErrorAction SilentlyContinue

$msgResult = [UIntPtr]::Zero
[Win32MsgHelper]::SendMessageTimeout([IntPtr]0xffff, 0x001A, [UIntPtr]::Zero, "ImmersiveColorSet", 2, 1000, [ref]$msgResult) | Out-Null
[Win32MsgHelper]::SendMessageTimeout([IntPtr]0xffff, 0x001A, [UIntPtr]::Zero, "WindowsThemeElement", 2, 1000, [ref]$msgResult) | Out-Null
Write-Host "Windows 11 accent color applied." -ForegroundColor Green
Write-Host ""

# Deploy Custom Start Button Icon if present
$iconFile = "$PSScriptRoot\\start_icon.png"
if (Test-Path $iconFile) {
    Write-Host "[*] Deploying Custom Start Button Icon..." -ForegroundColor Yellow
    $publicDir = "$env:PUBLIC\\Pictures"
    if (-not (Test-Path $publicDir)) {
        New-Item -ItemType Directory -Path $publicDir -Force | Out-Null
    }
    Copy-Item -Path $iconFile -Destination "$publicDir\\Windhawk_start_icon.png" -Force
    if (Test-Path "C:\\Users\\Public\\Pictures") {
        Copy-Item -Path $iconFile -Destination "C:\\Users\\Public\\Pictures\\Windhawk_start_icon.png" -Force -ErrorAction SilentlyContinue
    }
    Write-Host "Start button icon deployed to '$publicDir\\Windhawk_start_icon.png'." -ForegroundColor Green
    Write-Host ""
}

# 3. Windhawk Registry & Mod Refresh (Single Elevated UAC Prompt)
Write-Host "[3/4] Importing Windhawk Styler Mod Settings (Elevated)..." -ForegroundColor Yellow
$regPath = (Resolve-Path "$PSScriptRoot\\theme.reg").Path
$t = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$elevatedCmd = "reg import \`"$regPath\`"; Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\Windhawk\\Engine\\Mods\\*' -Name SettingsChangeTime -Value $t -ErrorAction SilentlyContinue"
Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -Command $elevatedCmd" -Verb RunAs -Wait
Write-Host "Windhawk engine styles refreshed." -ForegroundColor Green
Write-Host ""

# 4. Restart Windows Explorer
Write-Host "[4/4] Restarting Windows Explorer..." -ForegroundColor Yellow
Stop-Process -Name explorer -Force
Start-Process explorer
Write-Host ""
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host " Done! ${state.themeName} is active!" -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Cyan
`;
}

export interface DirectApplyPayload {
  themeName: string;
  accentColor: string;
  secondaryAccent: string;
  isLightMode: boolean;
  dwm: {
    accentDword: number;
    colorizationColor: number;
    colorizationAfterglow: number;
    colorPrevalence: number;
    accentColorInactive: number;
  };
  explorerAccent: {
    accentColorMenu: number;
    startColorMenu: number;
    accentPaletteBytes: number[];
  };
  regFile: string;
  ps1Script: string;
  windhawkMods: {
    taskbar: string;
    startMenu: string;
    notificationCenter: string;
    contextMenu: string;
    fileExplorer: string;
  };
}

export function generateDirectApplyPayload(state: ThemeConfigSnapshot | ThemeState): DirectApplyPayload {
  const fullState = {
    ...DEFAULT_THEME_STATE,
    ...state,
  } as ThemeState;
  const palette = computeAccentPalette(fullState.accentColor, fullState.secondaryAccent);
  const backups = buildWindhawkJsonBackups(fullState);
  const regFile = generateRegFileString(fullState);
  const ps1Script = generatePs1Script(fullState);

  return {
    themeName: fullState.themeName,
    accentColor: fullState.accentColor,
    secondaryAccent: fullState.secondaryAccent,
    isLightMode: fullState.isLightMode,
    dwm: {
      accentDword: parseInt(palette.accentDwordHex, 16),
      colorizationColor: palette.colorizationInt,
      colorizationAfterglow: palette.colorizationInt,
      colorPrevalence: 1,
      accentColorInactive: 0xff22272e,
    },
    explorerAccent: {
      accentColorMenu: parseInt(palette.accentDwordHex, 16),
      startColorMenu: parseInt(palette.accentDwordHex, 16),
      accentPaletteBytes: palette.bytes,
    },
    regFile,
    ps1Script,
    windhawkMods: {
      taskbar: backups.taskbarBackup,
      startMenu: backups.startMenuBackup,
      notificationCenter: backups.notificationCenterBackup,
      contextMenu: backups.contextMenuBackup,
      fileExplorer: backups.fileExplorerBackup,
    },
  };
}

export async function generateZipPayload(state: ThemeState): Promise<Blob> {
  const zip = new JSZip();

  // 1. theme.reg (UTF-16LE with BOM)
  const regContent = generateRegFileString(state);
  const buffer = new ArrayBuffer(regContent.length * 2 + 2);
  const view = new DataView(buffer);
  view.setUint16(0, 0xfeff, true); // BOM
  for (let i = 0; i < regContent.length; i++) {
    view.setUint16(i * 2 + 2, regContent.charCodeAt(i), true);
  }
  zip.file('theme.reg', buffer);

  // 2. Apply_Theme.ps1
  const ps1Content = generatePs1Script(state);
  zip.file('Apply_Theme.ps1', ps1Content);

  // 3. Apply_Theme.bat
  const batContent = generateBatScript('Apply_Theme.ps1');
  zip.file('Apply_Theme.bat', batContent);

  // 4. Restore Defaults
  zip.file('Restore_Defaults.ps1', generateRestorePs1Script());
  zip.file('Restore_Default_Windows11.bat', generateRestoreBatString());

  // 5. Windhawk JSON Backups
  const backups = buildWindhawkJsonBackups(state);
  zip.file('taskbar_backup.json', backups.taskbarBackup);
  zip.file('start_menu_backup.json', backups.startMenuBackup);
  zip.file('notification_center_backup.json', backups.notificationCenterBackup);
  zip.file('context_menu_backup.json', backups.contextMenuBackup);
  zip.file('file_explorer_backup.json', backups.fileExplorerBackup);

  // 6. Wallpaper (Custom upload, active preset, or default Windows 11 wallpaper)
  if (state.wallpaperData) {
    zip.file('wallpaper.jpg', state.wallpaperData);
  } else {
    try {
      const basePath =
        typeof window !== 'undefined' && window.location.pathname.startsWith('/theme-creator')
          ? '/theme-creator'
          : '/theme-creator';

      let targetUrl = state.wallpaperUrl;
      // Fallback to light/dark default wallpaper if no url or if it's an SVG data URI
      if (!targetUrl || targetUrl.startsWith('data:image/svg+xml')) {
        targetUrl = state.isLightMode
          ? `${basePath}/wallpapers/default-light.jpg`
          : `${basePath}/wallpapers/default-dark.jpg`;
      } else if (!targetUrl.startsWith('data:') && !targetUrl.startsWith('http') && !targetUrl.startsWith(basePath)) {
        targetUrl = `${basePath}${targetUrl.startsWith('/') ? '' : '/'}${targetUrl}`;
      }

      if (targetUrl.startsWith('data:')) {
        const parts = targetUrl.split(',');
        if (parts[1]) {
          zip.file('wallpaper.jpg', parts[1], { base64: true });
        }
      } else if (typeof fetch !== 'undefined') {
        const res = await fetch(targetUrl);
        if (res.ok) {
          const buf = await res.arrayBuffer();
          zip.file('wallpaper.jpg', buf);
        } else {
          // Fallback minimal valid JPEG buffer so wallpaper.jpg is always present
          zip.file('wallpaper.jpg', new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]));
        }
      } else {
        zip.file('wallpaper.jpg', new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]));
      }
    } catch {
      zip.file('wallpaper.jpg', new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]));
    }
  }

  // 7. Custom or Preset Start Icon if present
  if (state.customStartIconData) {
    zip.file('start_icon.png', state.customStartIconData);
  } else if (state.customStartIconUrl && state.customStartIconUrl.startsWith('data:')) {
    const parts = state.customStartIconUrl.split(',');
    if (parts[1]) {
      zip.file('start_icon.png', parts[1], { base64: true });
    } else {
      zip.file('start_icon.png', DEFAULT_START_ICON_PNG);
    }
  } else if (state.startButton?.type === 'custom' && state.startButton.customIconUrl?.startsWith('data:')) {
    const parts = state.startButton.customIconUrl.split(',');
    if (parts[1]) {
      zip.file('start_icon.png', parts[1], { base64: true });
    } else {
      zip.file('start_icon.png', DEFAULT_START_ICON_PNG);
    }
  } else if (state.startButton?.type === 'preset' || state.startButton?.type === 'custom') {
    zip.file('start_icon.png', DEFAULT_START_ICON_PNG);
  }

  return await zip.generateAsync({ type: 'blob' });
}
