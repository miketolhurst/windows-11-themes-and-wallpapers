import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ThemeShowcase } from "./ThemeShowcase";
import { FEATURED_THEMES } from "../data/featuredThemes";

describe("ThemeShowcase component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders section title and all 6 themes", () => {
    const handleSelect = vi.fn();
    render(<ThemeShowcase onSelectTheme={handleSelect} />);

    expect(screen.getByText(/Featured Themes Gallery/i)).toBeDefined();
    for (const theme of FEATURED_THEMES) {
      expect(screen.getAllByText(theme.name).length).toBeGreaterThan(0);
    }
  });

  it("renders Google Assistant Wave with featured hero badge", () => {
    const handleSelect = vi.fn();
    render(<ThemeShowcase onSelectTheme={handleSelect} />);

    expect(screen.getByText("🌟 Featured Showcase")).toBeDefined();
  });

  it("calls onSelectTheme when clicking Preview Details", () => {
    const handleSelect = vi.fn();
    render(<ThemeShowcase onSelectTheme={handleSelect} />);

    const previewButtons = screen.getAllByRole("button", { name: /Preview Details/i });
    expect(previewButtons.length).toBeGreaterThan(0);

    fireEvent.click(previewButtons[0]);
    expect(handleSelect).toHaveBeenCalledWith(FEATURED_THEMES[0]);
  });

  it("filters themes when clicking category filter pills", () => {
    const handleSelect = vi.fn();
    render(<ThemeShowcase onSelectTheme={handleSelect} />);

    // Click "Australiana" filter
    const australianaBtn = screen.getByRole("button", { name: /^Australiana$/i });
    fireEvent.click(australianaBtn);

    // Australiana themes should be present
    expect(screen.getByText("Uluru Red Centre Ochre")).toBeDefined();
    expect(screen.getByText("Sydney Harbour & Southern Cross")).toBeDefined();
    expect(screen.getByText("Great Barrier Reef & Whitsundays")).toBeDefined();

    // Cyberpunk theme should not be shown
    expect(screen.queryByText("Cyberpunk 2077 Night City")).toBeNull();
  });
});
