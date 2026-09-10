import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ThemeLightbox } from "./ThemeLightbox";
import { FEATURED_THEMES } from "../data/featuredThemes";

describe("ThemeLightbox component", () => {
  afterEach(() => {
    cleanup();
  });

  it("returns null when no theme is selected", () => {
    const { container } = render(<ThemeLightbox theme={null} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders theme details and color swatches when theme is selected", () => {
    const theme = FEATURED_THEMES[0];
    render(<ThemeLightbox theme={theme} onClose={() => {}} />);

    expect(screen.getByText(theme.name)).toBeDefined();
    expect(screen.getByText(theme.config.accentColor)).toBeDefined();
    expect(screen.getByText(theme.config.secondaryAccent)).toBeDefined();
    expect(screen.getByRole("button", { name: /Download Theme \(\.zip\)/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /Customize in Studio/i })).toBeDefined();
  });

  it("calls onClose when clicking the close button", () => {
    const handleClose = vi.fn();
    const theme = FEATURED_THEMES[0];
    render(<ThemeLightbox theme={theme} onClose={handleClose} />);

    const closeBtn = screen.getByRole("button", { name: /close modal/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
