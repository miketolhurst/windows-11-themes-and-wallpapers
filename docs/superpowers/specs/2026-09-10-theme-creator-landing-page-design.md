# Windows 11 / Windhawk Theme Studio Landing Page Design Specification

**Date:** 2026-09-10  
**Status:** Approved for Implementation Planning  
**Target:** `https://projects.tolhurst.me/theme-creator/`

---

## 1. Overview & Objectives

The Windows 11 / Windhawk Theme Creator currently operates as a standalone graphical studio tool. While powerful, new visitors often face friction understanding the prerequisites: specifically, that real-time shell customization (translucent acrylic taskbars, floating start menus, and flyout borders) requires the free, open-source Windhawk engine and three specific styler mods.

This project introduces a dedicated, high-converting, and educational **Landing Page** at the root path (`/theme-creator/`), while relocating the full editor to `/theme-creator/studio/`.

### Core Goals
1. **Demystify Prerequisites:** Provide a clear, friendly 3-step guide explaining Windhawk, the 3 required mods, and 1-click batch installation.
2. **Inspire with Curated Themes:** Showcase pre-developed, high-impact themes with the **Google Assistant Wave** theme as the primary hero example, complete with high-resolution wallpaper downloads.
3. **Interactive Lightbox Previews:** Allow users to inspect themes in an expanded lightbox modal with one-click `.zip` bundle downloads and direct "Open in Studio" deep-links.
4. **Seamless Navigation:** Maintain consistent Fluent Design aesthetics across the landing page and the Theme Studio.

---

## 2. Information Architecture & Routing

```
/theme-creator/                  --> Landing Page (Hero, Prerequisites, Showcase Gallery, FAQ, Footer)
/theme-creator/studio/           --> Full Theme Creator Application (Interactive Canvas, Sidebar, Presets, ZIP Export)
/theme-creator/studio?theme=...  --> Deep-linked Theme Studio (Loads shared/preset theme state)
```

### Static Build & BasePath Compatibility
- `next.config.ts` retains `basePath: "/theme-creator"` and `output: "export"`.
- Root route `src/app/page.tsx` renders the Landing Page.
- Studio route `src/app/studio/page.tsx` renders the Theme Creator application (moved from current `src/app/page.tsx`).
- Relative asset paths use the configured `basePath` helper to ensure proper resolution both in local development (`localhost:3000`) and production (`projects.tolhurst.me/theme-creator/`).

---

## 3. Page Sections & Component Specifications

### 3.1 Global Header & Navigation (`Navbar.tsx`)
- **Visuals:** Fixed top navigation bar with Windows 11 acrylic backdrop blur (`backdrop-blur-md`), dark border (`border-white/10`), and z-index priority.
- **Brand:** Windhawk Studio icon + "Windhawk Theme Studio".
- **Navigation Links:**
  - `Themes Showcase` (smooth scrolls to `#showcase`)
  - `Prerequisites & Setup` (smooth scrolls to `#prerequisites`)
  - `FAQ` (smooth scrolls to `#faq`)
- **Primary CTA:** High-contrast accent button `"Launch Theme Studio →"` pointing directly to `/studio`.

### 3.2 Hero Banner (`Hero.tsx`)
- **Headline:** *"Transform Windows 11. Your Way."*
- **Subheadline:** *"Design custom Taskbars, Start Menus, and accent palettes in your browser, or install hand-crafted community themes with one click — no coding required."*
- **Badge:** `✨ 100% Free & Open-Source • Non-Destructive User-Space Theming`
- **Call-to-Action Buttons:**
  - **Primary:** `🚀 Launch Theme Studio` (routes to `/studio`)
  - **Secondary:** `📖 How It Works & Setup` (scrolls to `#prerequisites`)
- **Background Accent:** Subtle radial gradient glow matching Windows 11 dynamic lighting.

### 3.3 Prerequisites & Installation Walkthrough (`PrerequisitesGuide.tsx`)
A 3-step visual interactive card grid designed to remove setup friction:
1. **Step 1: Install Windhawk Engine**
   - Explanation: Windhawk is a lightweight open-source system customization platform that injects UI tweaks safely in memory without patching Windows system files.
   - Actions: Direct button to [windhawk.net](https://windhawk.net/) + copyable command:
     ```powershell
     winget install RamenSoftware.Windhawk
     ```
     with a one-click `📋 Copy` button.
2. **Step 2: Enable the 3 Styler Mods**
   - Explanation: Install and activate the three official styling extensions inside Windhawk:
     - 🪟 **Windows 11 Taskbar Styler** (`windows-11-taskbar-styler`)
     - 🚀 **Windows 11 Start Menu Styler** (`windows-11-start-menu-styler`)
     - 🔔 **Windows 11 Notification Center Styler** (`windows-11-notification-center-styler`)
   - Links to official mod catalog pages and visual badge showing what UI area each mod controls.
3. **Step 3: Download & Run Any Theme**
   - Explanation: Extract the downloaded theme `.zip` and run `Apply_Theme.bat` as Administrator.
   - Highlights: Instantly applies wallpaper, registry color schemes, Windhawk XAML brushes, and reloads Explorer in seconds.

### 3.4 Featured Themes Showcase (`ThemeShowcase.tsx`)
A responsive grid of curated theme cards. Clicking a card opens the **Lightbox Modal**.

#### Curated Themes List:
1. **Google Assistant Wave (Featured Hero #1):**
   - Primary Accent: Google Blue `#4285F4`, Secondary: `#EA4335`
   - Wallpaper: `Google_Assistant_Kinetic_Wave_Wallpaper.jpg`
   - Tag: `🌟 Featured Showcase`
   - Description: Vibrant multi-color wave aesthetic with authentic dark acrylic shell styling.
2. **Cobalt & Porcelain:**
   - Primary Accent: Royal Cobalt `#0047AB`, Secondary: `#E1EBF5`
   - Wallpaper: `Cobalt_Porcelain_Wallpaper.jpg`
   - Tag: `Official Preset`
   - Description: Deep royal blues paired with clean porcelain highlights and smooth frosted glass.
3. **Forest Sage & Warm Brass:**
   - Primary Accent: Woodland Sage `#2D5A43`, Secondary: `#C9A84E`
   - Wallpaper: `Forest_Sage_Warm_Brass_Wallpaper.jpg`
   - Tag: `Official Preset`
   - Description: Organic earthy greens with radiant warm brass gold accents.
4. **Cyberpunk Neon Noir:**
   - Primary Accent: `#FF007F`, Secondary: `#00F0FF`
   - Wallpaper: `default-dark.jpg`
   - Tag: `Vibrant Glow`
   - Description: High-energy electric magenta and cyan neon glow for dark desktop setups.
5. **Nordic Frost & Aurora:**
   - Primary Accent: `#4AA8D8`, Secondary: `#A8E6CF`
   - Wallpaper: `default-light.jpg`
   - Tag: `Clean Minimal`
   - Description: Chilled arctic ice blues and subtle aurora mint glass transparency.
6. **Aero Glass Classic:**
   - Primary Accent: `#0078D4`, Secondary: `#60CDFF`
   - Wallpaper: `default-dark.jpg`
   - Tag: `Nostalgia`
   - Description: Classic Windows 7 / Aero inspired crystalline blues with subtle WinUI 3 borders.

#### Card Anatomy:
- High-res wallpaper thumbnail with dark gradient overlay and zoom-on-hover.
- Theme title, mood tag, and short description.
- Primary and secondary color chips with hex values.
- Buttons:
  - `🔍 Preview Details` (opens Lightbox).
  - `🎨 Open in Studio` (deep-links to `/studio` with theme pre-loaded).

### 3.5 Expanded Theme Lightbox Modal (`ThemeLightbox.tsx`)
- **Full View Mockup:** Large visual presentation showing the wallpaper alongside the themed Taskbar and Start Menu.
- **Color Table:** Displaying exact hex codes for Primary, Secondary, Background, and Accent gradients.
- **One-Click Package Download:** Direct `⬇️ Download Theme (.zip)` button that bundles:
  - `wallpaper.jpg`
  - `Theme_Setup.reg`
  - `Windhawk_Palette.json`
  - `Apply_Theme.bat`
  - `README.txt` instructions
- **"🎨 Open & Customize in Studio"** button.
- **"🔗 Share Theme Link"** button to copy direct deep-link.

### 3.6 FAQ & Troubleshooting Accordion (`FaqSection.tsx`)
- **Is this safe?** Windhawk injects properties into user-mode explorer processes without patching files or modifying system binaries.
- **How do I uninstall or revert?** Disabling mods in Windhawk or running standard Windows personalization restores defaults immediately.
- **Can I use themes without Windhawk?** Yes, the wallpaper and registry colors apply, but taskbar acrylic transparency and custom start menu geometries require Windhawk.
- **Does it work on Windows 10?** Designed and tested for Windows 11 (22H2, 23H2, 24H2).

### 3.7 Footer (`Footer.tsx`)
- Links to GitHub repository, Windhawk official website, and Tolhurst Projects directory.
- Attribution and open-source license notice.

---

## 4. Testing & Quality Assurance

1. **Unit & Component Tests (`vitest`):**
   - Test `Navbar.tsx`, `PrerequisitesGuide.tsx`, `ThemeShowcase.tsx`, and `ThemeLightbox.tsx`.
   - Verify `featuredThemes.ts` integrity (all themes contain valid hex codes, wallpaper paths, and descriptions).
   - Test deep-link generation for "Open in Studio" links.
2. **Build Validation:**
   - `npm run build` must produce a zero-error static export in `theme-creator-web/out/`.
   - Verify both `/theme-creator/` and `/theme-creator/studio/` render correctly without missing assets.
3. **End-to-End & Visual Inspection:**
   - Use Playwright to navigate the landing page, test lightbox opening/closing, copy buttons, and studio routing.
   - Verify mobile responsiveness and high-DPI desktop viewports.
