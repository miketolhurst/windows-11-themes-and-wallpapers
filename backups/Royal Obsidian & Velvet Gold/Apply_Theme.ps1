# Apply_Theme.ps1 - Royal Obsidian & Velvet Gold

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host " Applying Royal Obsidian & Velvet Gold Theme" -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Desktop Wallpaper
Write-Host "[1/4] Setting Desktop Wallpaper..." -ForegroundColor Yellow
$wpFile = "$PSScriptRoot\Obsidian_Gold_Wallpaper.jpg"
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
    Set-ItemProperty -Path "HKCU:\Control Panel\Desktop" -Name "WallPaper" -Value $wallpaperPath
    Write-Host "Wallpaper updated successfully." -ForegroundColor Green
} else {
    Write-Host "Wallpaper file '$wpFile' not found. Skipping wallpaper." -ForegroundColor Yellow
}
Write-Host ""

# 2. Windows 11 Personalization Accent Color & Dark Mode (Direct to HKCU)
Write-Host "[2/4] Applying Windows 11 Accent Color & Dark Mode..." -ForegroundColor Yellow
$accentDword = [int]0xff37afd4
$colorizationDword = [int]-992694473
$palette = [byte[]]@(0xf4, 0xeb, 0xcd, 0x00, 0xe9, 0xd7, 0x9b, 0x00, 0xde, 0xc3, 0x69, 0x00, 0xd4, 0xaf, 0x37, 0x00, 0xa9, 0x8c, 0x2c, 0x00, 0x7f, 0x69, 0x21, 0x00, 0x54, 0x46, 0x16, 0x00, 0xf5, 0x9e, 0x0b, 0x00)

# DWM
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\DWM" -Name "AccentColor" -Value $accentDword -Type DWord
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\DWM" -Name "ColorizationColor" -Value $colorizationDword -Type DWord
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\DWM" -Name "ColorizationAfterglow" -Value $colorizationDword -Type DWord
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\DWM" -Name "AccentColorInactive" -Value 0xff22272e -Type DWord
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\DWM" -Name "ColorPrevalence" -Value 1 -Type DWord

# Explorer Accent
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Accent" -Name "AccentColorMenu" -Value $accentDword -Type DWord
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Accent" -Name "StartColorMenu" -Value $accentDword -Type DWord
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Accent" -Name "AccentPalette" -Value $palette -Type Binary

# Themes Personalize
New-Item -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize" -Force | Out-Null
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize" -Name "AppsUseLightTheme" -Value 0 -Type DWord
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize" -Name "SystemUsesLightTheme" -Value 0 -Type DWord
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize" -Name "EnableTransparency" -Value 1 -Type DWord

# Settings app history & desktop colors
New-Item -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Themes\History\Colors" -Force | Out-Null
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Themes\History\Colors" -Name "ColorHistory0" -Value $accentDword -Type DWord
Set-ItemProperty -Path "HKCU:\Control Panel\Desktop" -Name "AutoColorization" -Value 0 -Type DWord
Set-ItemProperty -Path "HKCU:\Control Panel\Colors" -Name "Hilight" -Value "212 175 55"
Set-ItemProperty -Path "HKCU:\Control Panel\Colors" -Name "HotTrackingColor" -Value "212 175 55"

# Broadcast color & theme change messages
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
$regPath = (Resolve-Path "$PSScriptRoot\Apply_Royal_Obsidian_&_Velvet_Gold_Theme.reg").Path
Start-Process reg -ArgumentList "import `"$regPath`"" -Verb RunAs -Wait
$t = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
Start-Process powershell -ArgumentList "-Command", "Set-ItemProperty -Path HKLM:\SOFTWARE\Windhawk\Engine\Mods\* -Name SettingsChangeTime -Value $t" -Verb RunAs -Wait
Write-Host "Windhawk engine styles refreshed." -ForegroundColor Green
Write-Host ""

# 4. Restart Windows Explorer
Write-Host "[4/4] Restarting Windows Explorer..." -ForegroundColor Yellow
Stop-Process -Name explorer -Force
Start-Process explorer
Write-Host ""
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host " Done! Royal Obsidian & Velvet Gold theme is active!" -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Cyan
