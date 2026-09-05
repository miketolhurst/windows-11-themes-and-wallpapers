# Apply_Theme.ps1 - Nordic Frost & Aurora

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host " Applying Nordic Frost & Aurora Theme" -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Desktop Wallpaper
Write-Host "[1/4] Setting Desktop Wallpaper..." -ForegroundColor Yellow
$wpFile = "$PSScriptRoot\Nordic_Aurora_Wallpaper.jpg"
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
$accentDword = [int]0xfff8bd38
$colorizationDword = [int]-1002914312
$palette = [byte[]]@(0xcd, 0xee, 0xfd, 0x00, 0x9b, 0xde, 0xfb, 0x00, 0x69, 0xcd, 0xf9, 0x00, 0x38, 0xbd, 0xf8, 0x00, 0x2c, 0x97, 0xc6, 0x00, 0x21, 0x71, 0x94, 0x00, 0x16, 0x4b, 0x63, 0x00, 0x10, 0xb9, 0x81, 0x00)

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
Set-ItemProperty -Path "HKCU:\Control Panel\Colors" -Name "Hilight" -Value "56 189 248"
Set-ItemProperty -Path "HKCU:\Control Panel\Colors" -Name "HotTrackingColor" -Value "56 189 248"

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
$regPath = (Resolve-Path "$PSScriptRoot\Apply_Nordic_Frost_&_Aurora_Theme.reg").Path
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
Write-Host " Done! Nordic Frost & Aurora theme is active!" -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Cyan
