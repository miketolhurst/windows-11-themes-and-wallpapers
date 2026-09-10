import { describe, it, expect } from "vitest";
import { FEATURED_THEMES, getThemeById, getThemeStudioUrl } from "./featuredThemes";

describe("featuredThemes data registry", () => {
  it("contains 6 curated themes", () => {
    expect(FEATURED_THEMES).toHaveLength(6);
  });

  it("features Google Assistant Wave as the primary #1 hero theme", () => {
    const first = FEATURED_THEMES[0];
    expect(first.id).toBe("google-assistant-wave");
    expect(first.name).toBe("Google Assistant Wave");
    expect(first.isFeaturedHero).toBe(true);
  });

  it("ensures all themes have valid hex colors and wallpaper filenames", () => {
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    for (const theme of FEATURED_THEMES) {
      expect(theme.config.accentColor).toMatch(hexRegex);
      expect(theme.config.secondaryAccent).toMatch(hexRegex);
      expect(theme.wallpaperFileName).toBeTruthy();
    }
  });

  it("finds themes by ID", () => {
    const theme = getThemeById("cobalt-porcelain");
    expect(theme).toBeDefined();
    expect(theme?.name).toBe("Cobalt & Porcelain");
  });

  it("builds a studio URL with encoded theme data", () => {
    const theme = FEATURED_THEMES[0];
    const url = getThemeStudioUrl(theme, "/theme-creator");
    expect(url).toContain("/theme-creator/studio?theme=");
  });
});
