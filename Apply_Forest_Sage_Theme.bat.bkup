@echo off
echo ===================================================
echo  Applying Forest Sage and Warm Brass Windhawk Theme
echo ===================================================
echo.
powershell -Command "Start-Process reg -ArgumentList 'import \"%~dp0Apply_Forest_Sage_Theme.reg\"' -Verb RunAs -Wait"
echo Theme imported to registry.
echo.
echo Restarting Explorer & Windhawk Engine to refresh styles...
powershell -Command "$t = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds(); Start-Process powershell -ArgumentList '-Command', 'Set-ItemProperty -Path HKLM:\SOFTWARE\Windhawk\Engine\Mods\* -Name SettingsChangeTime -Value $t' -Verb RunAs -Wait"
taskkill /f /im explorer.exe >nul 2>&1
start explorer.exe
echo.
echo Done! Your Forest Sage and Warm Brass theme is active.
pause
