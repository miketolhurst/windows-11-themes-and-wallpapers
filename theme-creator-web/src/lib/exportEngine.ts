import JSZip from 'jszip';
import { ThemeState } from '../store/useThemeStore';
import {
  computeAccentPalette,
  hexToRgb,
  rgbToHex,
  buildLinearGradientBrush,
} from './paletteEngine';

function escapeRegStr(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export function generateRegFileString(state: ThemeState): string {
  const palette = computeAccentPalette(state.accentColor, state.secondaryAccent);
  const accentRgb = hexToRgb(state.accentColor);
  const secRgb = hexToRgb(state.secondaryAccent);
  const baseBgRgb = state.isLightMode ? [240, 240, 245] as [number, number, number] : [16, 18, 22] as [number, number, number];

  const cNormal = rgbToHex(accentRgb);
  const cLight1 = rgbToHex(palette.colors[2]);
  const cLight2 = rgbToHex(palette.colors[1]);
  const cLight3 = rgbToHex(palette.colors[0]);
  const cDark1 = rgbToHex(palette.colors[4]);
  const cDark2 = rgbToHex(palette.colors[5]);
  const cDark3 = rgbToHex(palette.colors[6]);

  const tbFill =
    state.taskbarMode === 'gradient'
      ? buildLinearGradientBrush('1.4, 1.4', '-0.4, -0.4', baseBgRgb, accentRgb, secRgb)
      : `<WindhawkBlur BlurAmount="${state.taskbarBlur}" />`;

  const smGrad = buildLinearGradientBrush('1.2, -0.2', '-0.2, 1.2', baseBgRgb, accentRgb, secRgb);
  const ncGrad = buildLinearGradientBrush('1.2, 1.2', '-0.2, -0.2', baseBgRgb, accentRgb, secRgb);

  const radius = state.cornerRadius;
  const buttonRadius = Math.max(0, radius - 4);
  const darkVal = state.isLightMode ? 1 : 0;
  const rgbStr = `${accentRgb[0]} ${accentRgb[1]} ${accentRgb[2]}`;

  const regLines: string[] = [
    'Windows Registry Editor Version 5.00',
    '',
    '; ============================================================',
    '; 1. Windows 11 Taskbar Styler',
    '; ============================================================',
    '[-HKEY_LOCAL_MACHINE\\SOFTWARE\\Windhawk\\Engine\\Mods\\windows-11-taskbar-styler\\Settings]',
    '',
    '[HKEY_LOCAL_MACHINE\\SOFTWARE\\Windhawk\\Engine\\Mods\\windows-11-taskbar-styler\\Settings]',
    `"controlStyles[0].target"="Taskbar.ExperienceToggleButton#LaunchListButton[AutomationPropertiesAutomationId=StartButton] > Taskbar.TaskListButtonPanel > Grid > Border#BackgroundElement"`,
    `"controlStyles[0].styles[0]"="CornerRadius=${radius}"`,
    `"controlStyles[1].target"="Taskbar.TaskbarBackground#BackgroundControl > Windows.UI.Xaml.Controls.Grid > Windows.UI.Xaml.Shapes.Rectangle#BackgroundFill"`,
    `"controlStyles[1].styles[0]"="Fill:=${escapeRegStr(tbFill)}"`,
    `"controlStyles[2].target"="Taskbar.TaskbarBackground#BackgroundControl > Windows.UI.Xaml.Controls.Grid > Windows.UI.Xaml.Shapes.Rectangle#BackgroundStroke"`,
    `"controlStyles[2].styles[0]"="Fill=${cNormal}"`,
    `"controlStyles[2].styles[1]"="Height=2"`,
    `"controlStyles[3].target"="Taskbar.TaskListLabeledButtonPanel@RunningIndicatorStates > Rectangle#RunningIndicator"`,
    `"controlStyles[3].styles[0]"="Fill=${cNormal}"`,
    `"controlStyles[3].styles[1]"="Height=3"`,
    `"controlStyles[3].styles[2]"="CornerRadius=${radius}"`,
    `"controlStyles[3].styles[3]"="Fill@ActiveRunningIndicator=${cNormal}"`,
    `"controlStyles[4].target"="Taskbar.TaskListButtonPanel > Border#BackgroundElement"`,
    `"controlStyles[4].styles[0]"="CornerRadius=${radius}"`,
    `"controlStyles[4].styles[1]"="Background@ActiveNormal:=<SolidColorBrush Color=\\"${cNormal}\\" Opacity=\\"0.18\\"/>"`,
    '',
    '; ============================================================',
    '; 2. Windows 11 Start Menu Styler',
    '; ============================================================',
    '[-HKEY_LOCAL_MACHINE\\SOFTWARE\\Windhawk\\Engine\\Mods\\windows-11-start-menu-styler\\Settings]',
    '',
    '[HKEY_LOCAL_MACHINE\\SOFTWARE\\Windhawk\\Engine\\Mods\\windows-11-start-menu-styler\\Settings]',
    `"controlStyles[0].target"="Border#AcrylicBorder"`,
    `"controlStyles[0].styles[0]"="Background:=${escapeRegStr(smGrad)}"`,
    `"controlStyles[0].styles[1]"="BorderBrush=${cNormal}"`,
    `"controlStyles[0].styles[2]"="BorderThickness=2"`,
    `"controlStyles[0].styles[3]"="CornerRadius=${radius}"`,
    `"controlStyles[1].target"="Border#AppBorder"`,
    `"controlStyles[1].styles[0]"="CornerRadius=${radius}"`,
    `"controlStyles[2].target"="StartDocked.SearchBoxToggleButton"`,
    `"controlStyles[2].styles[0]"="Background=${cNormal}EE"`,
    `"controlStyles[2].styles[1]"="BorderBrush=${cNormal}EE"`,
    `"controlStyles[2].styles[2]"="BorderThickness=2"`,
    `"controlStyles[2].styles[3]"="CornerRadius=${radius}"`,
    `"themeResourceVariables[0]"="SystemAccentColor=${cNormal}"`,
    `"themeResourceVariables[1]"="SystemAccentColorLight1=${cLight1}"`,
    `"themeResourceVariables[2]"="SystemAccentColorLight2=${cLight2}"`,
    `"themeResourceVariables[3]"="SystemAccentColorLight3=${cLight3}"`,
    `"themeResourceVariables[4]"="SystemAccentColorDark1=${cDark1}"`,
    `"themeResourceVariables[5]"="SystemAccentColorDark2=${cDark2}"`,
    `"themeResourceVariables[6]"="SystemAccentColorDark3=${cDark3}"`,
    '',
    '; ============================================================',
    '; 3. Windows 11 Notification Center & Quick Settings Styler',
    '; ============================================================',
    '[-HKEY_LOCAL_MACHINE\\SOFTWARE\\Windhawk\\Engine\\Mods\\windows-11-notification-center-styler\\Settings]',
    '',
    '[HKEY_LOCAL_MACHINE\\SOFTWARE\\Windhawk\\Engine\\Mods\\windows-11-notification-center-styler\\Settings]',
    `"controlStyles[0].target"="Grid#NotificationCenterGrid"`,
    `"controlStyles[0].styles[0]"="Background:=${escapeRegStr(ncGrad)}"`,
    `"controlStyles[0].styles[1]"="BorderThickness=2"`,
    `"controlStyles[0].styles[2]"="CornerRadius=${radius}"`,
    `"controlStyles[1].target"="Grid#CalendarCenterGrid"`,
    `"controlStyles[1].styles[0]"="Background:=${escapeRegStr(ncGrad)}"`,
    `"controlStyles[1].styles[1]"="BorderBrush=${cNormal}"`,
    `"controlStyles[1].styles[2]"="BorderThickness=2"`,
    `"controlStyles[1].styles[3]"="CornerRadius=${radius}"`,
    `"controlStyles[2].target"="Grid#ControlCenterRegion"`,
    `"controlStyles[2].styles[0]"="Background:=${escapeRegStr(ncGrad)}"`,
    `"controlStyles[2].styles[1]"="BorderThickness=2"`,
    `"controlStyles[2].styles[2]"="CornerRadius=${radius}"`,
    `"controlStyles[3].target"="QuickActions.AccessibleToggleButton#ToggleButton"`,
    `"controlStyles[3].styles[0]"="CornerRadius=${buttonRadius}"`,
    `"controlStyles[4].target"="QuickActions.AccessibleToggleButton#SplitL2Button"`,
    `"controlStyles[4].styles[0]"="CornerRadius=${buttonRadius}"`,
    `"themeResourceVariables[0]"="SystemAccentColor=${cNormal}"`,
    `"themeResourceVariables[1]"="SystemAccentColorLight1=${cLight1}"`,
    `"themeResourceVariables[2]"="SystemAccentColorLight2=${cLight2}"`,
    `"themeResourceVariables[3]"="SystemAccentColorLight3=${cLight3}"`,
    `"themeResourceVariables[4]"="SystemAccentColorDark1=${cDark1}"`,
    `"themeResourceVariables[5]"="SystemAccentColorDark2=${cDark2}"`,
    `"themeResourceVariables[6]"="SystemAccentColorDark3=${cDark3}"`,
    `"themeResourceVariables[7]"="ToggleSwitchFillOn=${cNormal}"`,
    `"themeResourceVariables[8]"="SliderTrackValueFill=${cNormal}"`,
    `"themeResourceVariables[9]"="SliderThumbBackground=${cNormal}"`,
    '',
    '; ============================================================',
    '; 4. Windows 11 Personalization Accent Color & Explorer Accent',
    '; ============================================================',
    '[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\DWM]',
    `"AccentColor"=dword:${palette.accentDwordHex}`,
    `"ColorizationColor"=dword:${palette.colorizationHex}`,
    `"ColorizationAfterglow"=dword:${palette.colorizationHex}`,
    `"AccentColorInactive"=dword:ff22272e`,
    `"ColorPrevalence"=dword:00000001`,
    '',
    '[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Accent]',
    `"AccentColorMenu"=dword:${palette.accentDwordHex}`,
    `"StartColorMenu"=dword:${palette.accentDwordHex}`,
    `"AccentPalette"=hex:${palette.hexString}`,
    '',
    '[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\History\\Colors]',
    `"ColorHistory0"=dword:${palette.accentDwordHex}`,
    '',
    '[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize]',
    `"AppsUseLightTheme"=dword:${darkVal.toString(16).padStart(8, '0')}`,
    `"SystemUsesLightTheme"=dword:${darkVal.toString(16).padStart(8, '0')}`,
    `"EnableTransparency"=dword:00000001`,
    '',
    '[HKEY_CURRENT_USER\\Control Panel\\Desktop]',
    `"AutoColorization"=dword:00000000`,
    '',
    '[HKEY_CURRENT_USER\\Control Panel\\Colors]',
    `"Hilight"="${rgbStr}"`,
    `"HotTrackingColor"="${rgbStr}"`,
    '',
  ];

  return regLines.join('\r\n');
}

export function generatePs1Script(state: ThemeState): string {
  const palette = computeAccentPalette(state.accentColor, state.secondaryAccent);
  const paletteBytesStr = palette.bytes.map((b) => `0x${b.toString(16).padStart(2, '0')}`).join(', ');
  const darkVal = state.isLightMode ? 1 : 0;
  const accentRgb = hexToRgb(state.accentColor);
  const rgbStr = `${accentRgb[0]} ${accentRgb[1]} ${accentRgb[2]}`;
  const themeSlug = (state.themeName || 'Custom_Theme').replace(/\s+/g, '_');

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

# 3. Windhawk Registry & Mod Refresh (Elevated)
Write-Host "[3/4] Importing Windhawk Styler Mod Settings (Elevated)..." -ForegroundColor Yellow
$regPath = (Resolve-Path "$PSScriptRoot\\theme.reg").Path
Start-Process reg -ArgumentList "import \`"$regPath\`"" -Verb RunAs -Wait
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
Write-Host " Done! ${state.themeName} is active!" -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Cyan
`;
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
  const batContent = `@echo off\r\npowershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Apply_Theme.ps1"\r\npause\r\n`;
  zip.file('Apply_Theme.bat', batContent);

  // 4. Wallpaper if present
  if (state.wallpaperData) {
    zip.file('wallpaper.jpg', state.wallpaperData);
  }

  // 5. Custom Start Icon if present
  if (state.customStartIconData) {
    zip.file('start_icon.png', state.customStartIconData);
  }

  return await zip.generateAsync({ type: 'blob' });
}
