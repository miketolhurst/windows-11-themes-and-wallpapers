import { describe, it, expect } from "vitest";
import { FEATURED_THEMES, getThemeById, getThemeStudioUrl } from "./featuredThemes";

describe("featuredThemes data registry", () => {
  it("contains 20 handcrafted themes across 5 categories", () => {
    expect(FEATURED_THEMES.length).toBeGreaterThanOrEqual(17);
    expect(FEATURED_THEMES).toHaveLength(20);
  });

  it("features Google Assistant Wave as the primary #1 hero theme", () => {
    const first = FEATURED_THEMES[0];
    expect(first.id).toBe("google-assistant-wave");
    expect(first.name).toBe("Google Assistant Wave");
    expect(first.isFeaturedHero).toBe(true);
  });

  it("ensures all themes have valid hex colors, wallpaper filenames, and categories", () => {
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    const validCategories = ["Australiana", "Cyberpunk", "Nature & Ethereal", "Minimalist", "Retro & Aero"];
    for (const theme of FEATURED_THEMES) {
      expect(theme.config.accentColor).toMatch(hexRegex);
      expect(theme.config.secondaryAccent).toMatch(hexRegex);
      expect(theme.wallpaperFileName).toBeTruthy();
      expect(validCategories).toContain(theme.category);
    }
  });

  it("finds themes by ID across diverse categories", () => {
    const uluru = getThemeById("uluru-red-centre");
    expect(uluru).toBeDefined();
    expect(uluru?.name).toBe("Uluru Red Centre Ochre");
    expect(uluru?.category).toBe("Australiana");

    const cobalt = getThemeById("cobalt-porcelain");
    expect(cobalt).toBeDefined();
    expect(cobalt?.name).toBe("Cobalt & Porcelain");
    expect(cobalt?.category).toBe("Minimalist");
  });

  it("builds a studio URL with encoded theme data", () => {
    const theme = FEATURED_THEMES[0];
    const url = getThemeStudioUrl(theme, "/theme-creator");
    expect(url).toContain("/theme-creator/studio?theme=");
  });
});
