@echo off
echo =========================================================
echo  Applying Cobalt Porcelain and Frosted Glass Theme
echo =========================================================
echo.

echo [1/4] Setting Desktop Wallpaper...
powershell -NoProfile -Command "Add-Type -MemberDefinition '[DllImport(\"\"user32.dll\"\")] public static extern int SystemParametersInfo(int a, int b, string c, int d);' -Name 'WallSetter' -Namespace 'Win32'; [Win32.WallSetter]::SystemParametersInfo(20, 0, (Resolve-Path '%~dp0Cobalt_Porcelain_Wallpaper.jpg').Path, 3)" >nul 2>&1
echo Wallpaper updated.
echo.

echo [2/4] Importing Registry Theme Settings (Administrator)...
powershell -Command "Start-Process reg -ArgumentList 'import \"%~dp0Apply_Cobalt_Porcelain_Theme.reg\"' -Verb RunAs -Wait"
echo Registry settings imported.
echo.

echo [3/4] Refreshing Windhawk Engine Mod Styles...
powershell -Command "$t = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds(); Start-Process powershell -ArgumentList '-Command', 'Set-ItemProperty -Path HKLM:\SOFTWARE\Windhawk\Engine\Mods\* -Name SettingsChangeTime -Value $t' -Verb RunAs -Wait"
echo.

echo [4/4] Restarting Windows Explorer...
taskkill /f /im explorer.exe >nul 2>&1
start explorer.exe
echo.
echo =========================================================
echo  Done! Cobalt Porcelain and Frosted Glass theme is active!
echo =========================================================
pause
