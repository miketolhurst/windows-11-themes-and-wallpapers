# Windows 11 / Windhawk Theme Studio Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a modern, Fluent Design landing page for the Windows 11 / Windhawk Theme Studio at `/theme-creator/` with a 3-step prerequisites guide, interactive featured themes showcase (headlined by the Google Assistant Wave theme), lightbox modal with instant `.zip` downloads, and relocate the studio editor to `/theme-creator/studio/`.

**Architecture:** Next.js 16 app router with static export (`output: "export"`, `basePath: "/theme-creator"`). Root route `/` renders the modular Landing Page while `/studio` hosts the full desktop theme generator. Client-side state drives interactive copying, modals, and dynamic `.zip` theme package generation with JSZip.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, Lucide React (or Tailwind SVG icons), JSZip, Vitest, Testing Library.

## Global Constraints

- Must compile with `basePath: "/theme-creator"` and static export with 0 errors.
- Relative asset paths must always utilize the basePath helper so images and wallpapers resolve cleanly in both local development and production (`https://projects.tolhurst.me/theme-creator/`).
- Google Assistant Wave theme must be featured as the primary (#1) showcase item.
- No Windows system files or destructive modifications: instructions and themes operate strictly in user-space via Windhawk and registry personalization.
- Full responsive design: desktop widescreen down to mobile layouts.

---

### Task 1: Wallpaper Assets Migration & Featured Themes Data Registry

**Files:**
- Create: `theme-creator-web/src/data/featuredThemes.ts`
- Test: `theme-creator-web/src/data/featuredThemes.test.ts`
- Assets:
  - Copy `Google_Assistant_Kinetic_Wave_Wallpaper.jpg` -> `theme-creator-web/public/wallpapers/google-assistant-wave.jpg`
  - Copy `Cobalt_Porcelain_Wallpaper.jpg` -> `theme-creator-web/public/wallpapers/cobalt-porcelain.jpg`
  - Copy `Forest_Sage_Warm_Brass_Wallpaper.jpg` -> `theme-creator-web/public/wallpapers/forest-sage.jpg`

**Interfaces:**
- Produces:
  ```typescript
  export interface FeaturedTheme {
    id: string;
    name: string;
    tag: string;
    description: string;
    wallpaperFileName: string;
    wallpaperPath: string;
    isFeaturedHero?: boolean;
    config: {
      accentColor: string;
      secondaryAccent: string;
      mode: 'dark' | 'light';
      taskbarBlur: number;
      taskbarOpacity: number;
      taskbarRadius: number;
      startMenuBlur: number;
      startMenuRadius: number;
      ncBlur: number;
      ncRadius: number;
      activeEffect: 'none' | 'acrylic' | 'glass';
      iconSpacing: number;
      iconSize: number;
    };
  }

  export const FEATURED_THEMES: FeaturedTheme[];
  export function getThemeById(id: string): FeaturedTheme | undefined;
  export function getThemeStudioUrl(theme: FeaturedTheme, basePath?: string): string;
  ```

- [ ] **Step 1: Copy wallpaper assets into public/wallpapers**
  Copy `Google_Assistant_Kinetic_Wave_Wallpaper.jpg`, `Cobalt_Porcelain_Wallpaper.jpg`, and `Forest_Sage_Warm_Brass_Wallpaper.jpg` from repo root into `theme-creator-web/public/wallpapers/`.

- [ ] **Step 2: Write failing unit test for featured themes registry**
  Create `theme-creator-web/src/data/featuredThemes.test.ts` verifying that `FEATURED_THEMES` contains 6 themes, the first theme is Google Assistant Wave with `isFeaturedHero: true`, all hex codes match `^#[0-9A-Fa-f]{6}$`, and `getThemeStudioUrl` builds a valid query URL.

- [ ] **Step 3: Run test to verify it fails**
  Run: `npx vitest run src/data/featuredThemes.test.ts`
  Expected: FAIL (module not found).

- [ ] **Step 4: Implement `featuredThemes.ts`**
  Implement `FeaturedTheme` interface and `FEATURED_THEMES` array:
  1. Google Assistant Wave (`#4285F4`, `#EA4335`, dark mode, `google-assistant-wave.jpg`)
  2. Cobalt & Porcelain (`#0047AB`, `#E1EBF5`, dark mode, `cobalt-porcelain.jpg`)
  3. Forest Sage & Warm Brass (`#2D5A43`, `#C9A84E`, dark mode, `forest-sage.jpg`)
  4. Cyberpunk Neon Noir (`#FF007F`, `#00F0FF`, dark mode, `default-dark.jpg`)
  5. Nordic Frost & Aurora (`#4AA8D8`, `#A8E6CF`, light mode, `default-light.jpg`)
  6. Aero Glass Classic (`#0078D4`, `#60CDFF`, dark mode, `default-dark.jpg`)

- [ ] **Step 5: Run tests and verify PASS**
  Run: `npx vitest run src/data/featuredThemes.test.ts`
  Expected: PASS.

- [ ] **Step 6: Commit**
  ```bash
  git add src/data/featuredThemes.ts src/data/featuredThemes.test.ts public/wallpapers/
  git commit -m "feat(data): add featured themes registry and wallpaper assets"
  ```

---

### Task 2: Global Navbar & Footer Components

**Files:**
- Create: `theme-creator-web/src/components/Navbar.tsx`
- Create: `theme-creator-web/src/components/Footer.tsx`
- Test: `theme-creator-web/src/components/Navbar.test.tsx`
- Test: `theme-creator-web/src/components/Footer.test.tsx`

**Interfaces:**
- Consumes: None
- Produces:
  ```typescript
  export function Navbar({ isStudio }: { isStudio?: boolean }): React.ReactElement;
  export function Footer(): React.ReactElement;
  ```

- [ ] **Step 1: Write failing tests for Navbar and Footer**
  Test brand link, anchor links (`#showcase`, `#prerequisites`, `#faq`), and conditional Studio CTA vs "← Back to Showcase" link when `isStudio` is true.

- [ ] **Step 2: Run test to verify it fails**
  Run: `npx vitest run src/components/Navbar.test.tsx src/components/Footer.test.tsx`
  Expected: FAIL.

- [ ] **Step 3: Implement `Navbar.tsx` and `Footer.tsx`**
  - Acrylic backdrop blur (`backdrop-blur-md bg-neutral-900/80 border-b border-white/10`).
  - Windhawk Studio logo with Fluent Design rounded pill.
  - Smooth scroll anchor links for landing page.
  - Glowing accent button: `"Launch Theme Studio →"` pointing to `/theme-creator/studio`.

- [ ] **Step 4: Run test to verify it passes**
  Run: `npx vitest run src/components/Navbar.test.tsx src/components/Footer.test.tsx`
  Expected: PASS.

- [ ] **Step 5: Commit**
  ```bash
  git add src/components/Navbar.tsx src/components/Footer.tsx src/components/Navbar.test.tsx src/components/Footer.test.tsx
  git commit -m "feat(components): add global Navbar and Footer"
  ```

---

### Task 3: Hero & Prerequisites Guide Components

**Files:**
- Create: `theme-creator-web/src/components/Hero.tsx`
- Create: `theme-creator-web/src/components/PrerequisitesGuide.tsx`
- Test: `theme-creator-web/src/components/PrerequisitesGuide.test.tsx`

**Interfaces:**
- Consumes: None
- Produces:
  ```typescript
  export function Hero(): React.ReactElement;
  export function PrerequisitesGuide(): React.ReactElement;
  ```

- [ ] **Step 1: Write failing test for PrerequisitesGuide**
  Test winget copy-to-clipboard functionality, mod catalog links, and step headings rendering.

- [ ] **Step 2: Run test to verify it fails**
  Run: `npx vitest run src/components/PrerequisitesGuide.test.tsx`
  Expected: FAIL.

- [ ] **Step 3: Implement `Hero.tsx`**
  - Value proposition headline: *"Transform Windows 11. Your Way."*
  - Badge: `✨ 100% Free & Open-Source • Non-Destructive User-Space Theming`
  - Two buttons: `"🚀 Launch Theme Studio"` and `"📖 How It Works & Setup"`.
  - Windows 11 Fluent ambient lighting gradient backdrop.

- [ ] **Step 4: Implement `PrerequisitesGuide.tsx`**
  - Step 1: Install Windhawk with link and copyable `winget install RamenSoftware.Windhawk` button with "Copied!" feedback.
  - Step 2: Enable the 3 required mods:
    - 🪟 Windows 11 Taskbar Styler
    - 🚀 Windows 11 Start Menu Styler
    - 🔔 Windows 11 Notification Center Styler
  - Step 3: Run Theme (.bat) explanation with safe non-destructive user-mode callouts.

- [ ] **Step 5: Run tests and verify PASS**
  Run: `npx vitest run src/components/PrerequisitesGuide.test.tsx`
  Expected: PASS.

- [ ] **Step 6: Commit**
  ```bash
  git add src/components/Hero.tsx src/components/PrerequisitesGuide.tsx src/components/PrerequisitesGuide.test.tsx
  git commit -m "feat(components): add Hero and PrerequisitesGuide"
  ```

---

### Task 4: Featured Themes Showcase & Lightbox Modal with ZIP Download

**Files:**
- Create: `theme-creator-web/src/components/ThemeShowcase.tsx`
- Create: `theme-creator-web/src/components/ThemeLightbox.tsx`
- Test: `theme-creator-web/src/components/ThemeShowcase.test.tsx`
- Test: `theme-creator-web/src/components/ThemeLightbox.test.tsx`

**Interfaces:**
- Consumes: `FeaturedTheme`, `FEATURED_THEMES` from `src/data/featuredThemes.ts`, `generateThemeZip` from `src/lib/exportEngine.ts`.
- Produces:
  ```typescript
  export function ThemeShowcase({ onSelectTheme }: { onSelectTheme: (theme: FeaturedTheme) => void }): React.ReactElement;
  export function ThemeLightbox({ theme, onClose }: { theme: FeaturedTheme | null; onClose: () => void }): React.ReactElement | null;
  ```

- [ ] **Step 1: Write failing tests for ThemeShowcase and ThemeLightbox**
  Verify showcase renders cards with Google Assistant Wave as primary featured hero card, clicking card calls `onSelectTheme`, and Lightbox renders color swatches, download button, and close trigger.

- [ ] **Step 2: Run test to verify it fails**
  Run: `npx vitest run src/components/ThemeShowcase.test.tsx src/components/ThemeLightbox.test.tsx`
  Expected: FAIL.

- [ ] **Step 3: Implement `ThemeShowcase.tsx`**
  - Responsive grid (1-col mobile, 2-col tablet, 3-col desktop).
  - Primary Hero Card for Google Assistant Wave with special highlight border, badge `🌟 Featured Showcase`, and high-impact wallpaper thumbnail.
  - Theme cards with color chips, tags, description, "🔍 Preview Details" button, and "🎨 Open in Studio" link.

- [ ] **Step 4: Implement `ThemeLightbox.tsx`**
  - Modal overlay with blur backdrop.
  - Large desktop visual mockup with wallpaper and shell elements.
  - Color palette breakdown (primary, secondary, gradients, blur levels).
  - One-click `⬇️ Download Theme Package (.zip)` trigger using `exportEngine.ts` to bundle `wallpaper.jpg`, `.reg`, `Windhawk_Palette.json`, and `Apply_Theme.bat`.
  - "🎨 Open & Customize in Studio" button.
  - ESC key and outside click listeners.

- [ ] **Step 5: Run tests and verify PASS**
  Run: `npx vitest run src/components/ThemeShowcase.test.tsx src/components/ThemeLightbox.test.tsx`
  Expected: PASS.

- [ ] **Step 6: Commit**
  ```bash
  git add src/components/ThemeShowcase.tsx src/components/ThemeLightbox.tsx src/components/ThemeShowcase.test.tsx src/components/ThemeLightbox.test.tsx
  git commit -m "feat(components): add ThemeShowcase and ThemeLightbox modal with ZIP export"
  ```

---

### Task 5: FAQ & Help Section

**Files:**
- Create: `theme-creator-web/src/components/FaqSection.tsx`
- Test: `theme-creator-web/src/components/FaqSection.test.tsx`

**Interfaces:**
- Consumes: None
- Produces:
  ```typescript
  export function FaqSection(): React.ReactElement;
  ```

- [ ] **Step 1: Write failing test for FaqSection**
  Verify FAQ items toggle open and closed on click.

- [ ] **Step 2: Run test to verify it fails**
  Run: `npx vitest run src/components/FaqSection.test.tsx`
  Expected: FAIL.

- [ ] **Step 3: Implement `FaqSection.tsx`**
  Collapsible accordion cards:
  1. *Is this safe for my computer?* (Zero file patching, user-mode memory injection).
  2. *How do I uninstall or revert to default Windows 11?* (Disable mods in Windhawk, select Windows default theme).
  3. *Do I need Windhawk to use these themes?* (Wallpaper and basic accent work without Windhawk, but translucency/acrylic and floating start menu require Windhawk).
  4. *Does this work on Windows 10?* (Built specifically for Windows 11 22H2+).

- [ ] **Step 4: Run test and verify PASS**
  Run: `npx vitest run src/components/FaqSection.test.tsx`
  Expected: PASS.

- [ ] **Step 5: Commit**
  ```bash
  git add src/components/FaqSection.tsx src/components/FaqSection.test.tsx
  git commit -m "feat(components): add FaqSection component"
  ```

---

### Task 6: Routing Migration — Relocate Studio to `/studio` & Assemble Landing Page at `/`

**Files:**
- Create: `theme-creator-web/src/app/studio/page.tsx`
- Modify: `theme-creator-web/src/app/page.tsx`
- Modify: `theme-creator-web/src/app/layout.tsx`

**Interfaces:**
- Consumes: All components created in Tasks 1-5.
- Produces: Complete Next.js routes for `/` (Landing Page) and `/studio` (Theme Creator Studio).

- [ ] **Step 1: Relocate Theme Studio to `src/app/studio/page.tsx`**
  Move the full editor implementation from current `src/app/page.tsx` to `src/app/studio/page.tsx`.
  Add a top-left navigation banner: `"← Windhawk Showcase & Guide"` linking back to `/theme-creator/`.

- [ ] **Step 2: Assemble Landing Page in `src/app/page.tsx`**
  Wire together:
  - `<Navbar />`
  - `<Hero />`
  - `<PrerequisitesGuide />`
  - `<ThemeShowcase onSelectTheme={setSelectedTheme} />`
  - `<ThemeLightbox theme={selectedTheme} onClose={() => setSelectedTheme(null)} />`
  - `<FaqSection />`
  - `<Footer />`

- [ ] **Step 3: Update page metadata in `src/app/layout.tsx`**
  Ensure SEO title, description, and OpenGraph tags describe both the showcase and the generator.

- [ ] **Step 4: Verify full test suite**
  Run: `npx vitest run`
  Expected: All test suites pass (existing 32 tests + new tests).

- [ ] **Step 5: Commit**
  ```bash
  git add src/app/studio/page.tsx src/app/page.tsx src/app/layout.tsx
  git commit -m "refactor(routes): relocate studio to /studio and assemble landing page at /"
  ```

---

### Task 7: Production Build, Static Export & End-to-End Verification

**Files:**
- All files in `theme-creator-web/`

- [ ] **Step 1: Run production build**
  Run: `npm run build` inside `theme-creator-web/`
  Expected: Clean static export in `out/` with zero errors, producing `out/index.html` (Landing) and `out/studio/index.html` (Studio).

- [ ] **Step 2: Verify static files in out/**
  Verify `out/index.html`, `out/studio/index.html`, `out/wallpapers/google-assistant-wave.jpg`, `out/wallpapers/cobalt-porcelain.jpg`, `out/wallpapers/forest-sage.jpg` exist.

- [ ] **Step 3: Commit and push branch to GitHub**
  ```bash
  git push origin theme-creator-web
  ```

---

### Task 8: Production Server Deployment & Live Verification

**Files:**
- Target Server: `mt-webserver-01` (`tolhurst.me`)
- Remote Path: `/var/www/projects/theme-creator/`

- [ ] **Step 1: Create production tarball**
  Run: `tar -czf dist.tar.gz -C out .`

- [ ] **Step 2: Transfer to production server**
  Run: `scp dist.tar.gz tolhurst.me:/tmp/dist.tar.gz`

- [ ] **Step 3: Extract and replace files on server**
  Run: `ssh tolhurst.me "tar -xzf /tmp/dist.tar.gz -C /var/www/projects/theme-creator/ && rm /tmp/dist.tar.gz"`

- [ ] **Step 4: Live visual inspection via Playwright**
  - Navigate to `https://projects.tolhurst.me/theme-creator/`.
  - Take screenshot of landing page.
  - Click Google Assistant Wave "Preview Details" card to verify Lightbox Modal opens.
  - Click "Launch Theme Studio →" to verify navigation to `/theme-creator/studio/`.
  - Confirm all assets, styles, and buttons function flawlessly.
