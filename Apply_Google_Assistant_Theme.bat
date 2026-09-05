@echo off
echo =========================================================
echo  Applying Google Assistant Kinetic Wave Theme
echo =========================================================
echo.

:: Check for Administrator privileges
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] Running as Administrator.
) else (
    echo [WARNING] Not running as Administrator! 
    echo Please right-click this file and select Run as administrator.
    echo Some registry settings may fail to apply.
    echo.
    pause
)

echo [1/4] Setting Desktop Wallpaper...
powershell -NoProfile -Command Add-Type -MemberDefinition '[DllImport(""user32.dll"")] public static extern int SystemParametersInfo(int a, int b, string c, int d);' -Name 'WallSetter' -Namespace 'Win32'; [Win32.WallSetter]::SystemParametersInfo(20, 0, (Resolve-Path '%~dp0Google_Assistant_Kinetic_Wave_Wallpaper.jpg').Path, 3)
echo Wallpaper update attempted.
echo.

echo [2/4] Importing Registry Theme Settings...
reg import %~dp0Apply_Google_Assistant_Theme.reg
echo Registry settings imported.
echo.

echo [3/4] Refreshing Windhawk Engine Mod Styles...
powershell -Command  = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds(); Set-ItemProperty -Path HKLM:\SOFTWARE\Windhawk\Engine\Mods\* -Name SettingsChangeTime -Value 
echo.

echo [4/4] Restarting Windows Explorer...
taskkill /f /im explorer.exe >nul 2>&1
start explorer.exe
echo.
echo =========================================================
echo  Done! Google Assistant Kinetic Wave theme is active!
echo =========================================================
pause
