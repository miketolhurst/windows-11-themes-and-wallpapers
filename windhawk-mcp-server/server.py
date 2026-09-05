import winreg
import json
import re
import subprocess
import os
import sys
import time
import tempfile
import yaml
from mcp.server.mcpserver import MCPServer

# Initialize MCPServer
mcp = MCPServer("Windhawk Styler MCP Server")

BASE_DIR = r"C:\Users\Mike\Theme and Wallpapers"
BACKUPS_DIR = os.path.join(BASE_DIR, "backups")

# -----------------------------------------------------------------------------
# Color & Palette Helpers
# -----------------------------------------------------------------------------
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
        c7 = ((base_rgb[1] + 128) % 256, (base_rgb[2] + 128) % 256, (base_rgb[0] + 128) % 256)
        
    palette_colors = [c0, c1, c2, c3, c4, c5, c6, c7]
    palette_bytes = []
    for rgb in palette_colors:
        palette_bytes.extend([rgb[0], rgb[1], rgb[2], 0])
        
    palette_hex_str = ",".join(f"{b:02x}" for b in palette_bytes)
    return palette_colors, palette_bytes, palette_hex_str

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

# -----------------------------------------------------------------------------
# Unflatten / Flatten Setting Helpers
# -----------------------------------------------------------------------------
def unflatten_settings(flat_dict: dict) -> dict:
    nested = {}
    for key, value in flat_dict.items():
        if key in ["theme", "clickThroughTaskbar", "xamlDiagnosticsHandling", "webContentCustomJs", "disableNewStartMenuLayout"]:
            nested[key] = value
            continue
        
        match_array = re.match(r"^([a-zA-Z]+)\[(\d+)\]$", key)
        if match_array:
            name, idx = match_array.groups()
            idx = int(idx)
            if name not in nested:
                nested[name] = []
            while len(nested[name]) <= idx:
                nested[name].append("")
            nested[name][idx] = value
            continue
            
        match_prop = re.match(r"^([a-zA-Z]+)\[(\d+)\]\.([a-zA-Z]+)$", key)
        if match_prop:
            name, idx, prop = match_prop.groups()
            idx = int(idx)
            if name not in nested:
                nested[name] = []
            while len(nested[name]) <= idx:
                nested[name].append({})
            nested[name][idx][prop] = value
            continue
            
        match_sub_array = re.match(r"^([a-zA-Z]+)\[(\d+)\]\.([a-zA-Z]+)\[(\d+)\]$", key)
        if match_sub_array:
            name, idx, prop, sub_idx = match_sub_array.groups()
            idx, sub_idx = int(idx), int(sub_idx)
            if name not in nested:
                nested[name] = []
            while len(nested[name]) <= idx:
                nested[name].append({})
            if prop not in nested[name][idx]:
                nested[name][idx][prop] = []
            while len(nested[name][idx][prop]) <= sub_idx:
                nested[name][idx][prop].append("")
            nested[name][idx][prop][sub_idx] = value
            continue
            
        nested[key] = value
    
    return nested

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

# -----------------------------------------------------------------------------
# MCP Tools
# -----------------------------------------------------------------------------
@mcp.tool()
def get_styler_settings(mod_name: str) -> dict:
    """
    Reads the configuration for a Windhawk styler mod and returns it as a JSON-like dictionary.
    mod_name should be one of:
    - windows-11-taskbar-styler
    - windows-11-start-menu-styler
    - windows-11-notification-center-styler
    """
    key_path = fr"SOFTWARE\Windhawk\Engine\Mods\{mod_name}\Settings"
    try:
        with winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, key_path, 0, winreg.KEY_READ) as key:
            settings = {}
            info = winreg.QueryInfoKey(key)
            for i in range(info[1]):
                name, value, type = winreg.EnumValue(key, i)
                settings[name] = value
            return unflatten_settings(settings)
    except FileNotFoundError:
        return {"error": f"Mod {mod_name} not found or has no settings."}
    except Exception as e:
        return {"error": str(e)}

@mcp.tool()
def set_styler_settings(mod_name: str, settings: dict, auto_elevate: bool = True) -> str:
    """
    Writes the provided configuration to the registry for the specified Windhawk styler mod
    and updates SettingsChangeTime so the mod reloads.
    If run without admin privileges and auto_elevate is True, it triggers a UAC prompt to apply.
    """
    flat_settings = flatten_settings(settings)
    key_path = fr"SOFTWARE\Windhawk\Engine\Mods\{mod_name}\Settings"
    
    try:
        # Attempt direct write
        with winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, key_path, 0, winreg.KEY_ALL_ACCESS) as key:
            info = winreg.QueryInfoKey(key)
            existing_values = [winreg.EnumValue(key, i)[0] for i in range(info[1])]
            for name in existing_values:
                winreg.DeleteValue(key, name)
            for k, v in flat_settings.items():
                val_type = winreg.REG_SZ
                if isinstance(v, int) and not isinstance(v, bool):
                    val_type = winreg.REG_DWORD
                winreg.SetValueEx(key, k, 0, val_type, v)
                
        # Touch SettingsChangeTime
        try:
            mod_key_path = fr"SOFTWARE\Windhawk\Engine\Mods\{mod_name}"
            with winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, mod_key_path, 0, winreg.KEY_ALL_ACCESS) as mod_key:
                winreg.SetValueEx(mod_key, "SettingsChangeTime", 0, winreg.REG_DWORD, int(time.time()))
        except Exception:
            pass

        return f"Settings saved for {mod_name} successfully."
    except PermissionError:
        if not auto_elevate:
            return "PermissionError: Administrator privileges required to write to HKLM."
        
        # Auto-elevation fallback: Generate a clean temporary .reg file and run via UAC
        try:
            reg_lines = [
                "Windows Registry Editor Version 5.00",
                "",
                f"[-HKEY_LOCAL_MACHINE\\{key_path}]",
                "",
                f"[HKEY_LOCAL_MACHINE\\{key_path}]"
            ]
            for k, v in flat_settings.items():
                if isinstance(v, int) and not isinstance(v, bool):
                    reg_lines.append(f'"{k}"=dword:{hex(v)[2:].zfill(8)}')
                else:
                    reg_lines.append(f'"{k}"="{escape_reg_str(v)}"')
            reg_lines.append("")
            
            temp_reg = os.path.join(tempfile.gettempdir(), f"windhawk_{mod_name}.reg")
            with open(temp_reg, "w", encoding="utf-16") as f:
                f.write("\r\n".join(reg_lines))
                
            cmd = f'Start-Process reg -ArgumentList "import \\"{temp_reg}\\"" -Verb RunAs -Wait; $t = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds(); Start-Process powershell -ArgumentList "-Command", "Set-ItemProperty -Path HKLM:\\SOFTWARE\\Windhawk\\Engine\\Mods\\{mod_name} -Name SettingsChangeTime -Value $t" -Verb RunAs -Wait'
            subprocess.run(["powershell", "-Command", cmd], capture_output=True)
            if os.path.exists(temp_reg):
                os.remove(temp_reg)
            return f"UAC prompt requested and settings imported for {mod_name}."
        except Exception as ex:
            return f"Failed to elevate: {str(ex)}"
    except Exception as e:
        return f"Error: {str(e)}"

@mcp.tool()
def refresh_windhawk_mods(auto_elevate: bool = True) -> str:
    """
    Signals the Windhawk engine to reload mod settings immediately by updating SettingsChangeTime on all active mods.
    """
    try:
        t = int(time.time())
        base_key_path = r"SOFTWARE\Windhawk\Engine\Mods"
        with winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, base_key_path, 0, winreg.KEY_READ) as base_key:
            num_subkeys = winreg.QueryInfoKey(base_key)[0]
            subkeys = [winreg.EnumKey(base_key, i) for i in range(num_subkeys)]

        for subkey in subkeys:
            sub_path = fr"{base_key_path}\{subkey}"
            try:
                with winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, sub_path, 0, winreg.KEY_ALL_ACCESS) as k:
                    winreg.SetValueEx(k, "SettingsChangeTime", 0, winreg.REG_DWORD, t)
            except PermissionError:
                if auto_elevate:
                    cmd = '$t = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds(); Start-Process powershell -ArgumentList "-Command", "Set-ItemProperty -Path HKLM:\\SOFTWARE\\Windhawk\\Engine\\Mods\\* -Name SettingsChangeTime -Value $t" -Verb RunAs -Wait'
                    subprocess.run(["powershell", "-Command", cmd], capture_output=True)
                    return "UAC prompt requested to refresh Windhawk mods."
                return "PermissionError: Requires Administrator privileges to update SettingsChangeTime in HKLM."
        return "Successfully refreshed Windhawk engine mods."
    except Exception as e:
        return f"Error refreshing mods: {str(e)}"

@mcp.tool()
def restart_explorer() -> str:
    """
    Restarts Windows Explorer (explorer.exe) to redraw taskbar, start menu, and notification center with newly applied styles.
    """
    try:
        subprocess.run(["taskkill", "/f", "/im", "explorer.exe"], capture_output=True)
        subprocess.Popen(["explorer.exe"])
        return "Windows Explorer restarted successfully."
    except Exception as e:
        return f"Error restarting Explorer: {str(e)}"

@mcp.tool()
def apply_theme_preset(theme_name_or_path: str) -> str:
    """
    Applies a complete theme preset by name or directory path.
    Executes its Apply_Theme.ps1 to configure wallpaper, Windows 11 accent color, Windhawk styles, and restart Explorer.
    """
    if os.path.isabs(theme_name_or_path) and os.path.isdir(theme_name_or_path):
        target_dir = theme_name_or_path
    else:
        target_dir = os.path.join(BACKUPS_DIR, theme_name_or_path)
        
    ps1_path = os.path.join(target_dir, "Apply_Theme.ps1")
    if not os.path.exists(ps1_path):
        return f"Error: Apply_Theme.ps1 not found in '{target_dir}'."
        
    try:
        subprocess.run(
            ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", ps1_path],
            capture_output=True,
            text=True
        )
        return f"Theme preset '{os.path.basename(target_dir)}' applied successfully."
    except Exception as e:
        return f"Error applying preset: {str(e)}"

@mcp.tool()
def compute_accent_palette_tool(accent_hex: str, secondary_hex: str = None) -> dict:
    """
    Calculates Windows 11 AccentPalette binary bytes, registry hex values, and 8-color gradient shades from a primary hex color.
    """
    try:
        accent_rgb = hex_to_rgb(accent_hex)
        accent_dword_hex = f"ff{accent_rgb[2]:02x}{accent_rgb[1]:02x}{accent_rgb[0]:02x}"
        colorization_hex = f"c4{accent_rgb[0]:02x}{accent_rgb[1]:02x}{accent_rgb[2]:02x}"
        colors, bytes_list, hex_str = compute_accent_palette(accent_hex, secondary_hex)
        
        return {
            "accent_hex": accent_hex,
            "accent_dword_hex": accent_dword_hex,
            "colorization_hex": colorization_hex,
            "accent_palette_hex_str": hex_str,
            "accent_palette_bytes": bytes_list,
            "shades": [rgb_to_hex(c) for c in colors]
        }
    except Exception as e:
        return {"error": str(e)}

@mcp.tool()
def create_new_theme(name: str, accent: str, secondary: str = None, bg: str = "#101216", radius: int = 10, wallpaper: str = None, light_mode: bool = False) -> str:
    """
    Generates a brand new theme package with YAML configs, registry files, and automation scripts in backups/<name>/.
    """
    try:
        sys.path.append(BASE_DIR)
        import create_theme as ct
        out_dir = ct.create_theme(
            name=name,
            accent=accent,
            secondary=secondary,
            bg=bg,
            radius=radius,
            wallpaper=wallpaper,
            light_mode=light_mode
        )
        return f"Theme '{name}' generated successfully at: {out_dir}"
    except Exception as e:
        return f"Error generating theme: {str(e)}"

if __name__ == "__main__":
    mcp.run()
