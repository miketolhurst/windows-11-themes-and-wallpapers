import JSZip from 'jszip';
import { ThemeState } from '../store/useThemeStore';

export function generateRegFileString(state: ThemeState): string {
  // UTF-16LE BOM prefix is applied when saving, here we return raw string
  return `Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\\SOFTWARE\\Windhawk\\Engine\\Mods\\windows-11-taskbar-styler\\Settings]
"controlStyles[0].target"="Border#BackgroundStroke"
"controlStyles[0].styles[0]"="Fill:=<WindhawkBlur BlurAmount=\\"${state.taskbarBlur}\\" />"

[HKEY_LOCAL_MACHINE\\SOFTWARE\\Windhawk\\Engine\\Mods\\windows-11-start-menu-styler\\Settings]
"controlStyles[0].target"="Grid#StartMenuBackground"
"controlStyles[0].styles[0]"="Fill:=<WindhawkBlur BlurAmount=\\"${state.startMenuBlur}\\" />"

[HKEY_LOCAL_MACHINE\\SOFTWARE\\Windhawk\\Engine\\Mods\\windows-11-notification-center-styler\\Settings]
"controlStyles[0].target"="Grid#NotificationCenterGrid"
"controlStyles[0].styles[0]"="Fill:=<WindhawkBlur BlurAmount=\\"${state.notificationBlur}\\" />"
`;
}

export async function generateZipPayload(state: ThemeState): Promise<Blob> {
  const zip = new JSZip();
  
  const regContent = generateRegFileString(state);
  // Convert string to UTF-16LE with BOM
  const buffer = new ArrayBuffer(regContent.length * 2 + 2);
  const view = new DataView(buffer);
  view.setUint16(0, 0xFEFF, true); // BOM
  for (let i = 0; i < regContent.length; i++) {
    view.setUint16(i * 2 + 2, regContent.charCodeAt(i), true);
  }
  
  zip.file('theme.reg', buffer);
  zip.file('Apply_Theme.bat', '@echo off\r\npowershell -ExecutionPolicy Bypass -File "%~dp0Apply_Theme.ps1"\r\n');
  zip.file('Apply_Theme.ps1', 'Write-Host "Applying Theme..."\r\nreg import "$PSScriptRoot\\theme.reg"\r\n');
  
  return await zip.generateAsync({ type: 'blob' });
}
