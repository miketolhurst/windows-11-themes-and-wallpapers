import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Footer } from "./Footer";

describe("Footer component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders copyright, Windhawk attribution, and project links", () => {
    render(<Footer />);
    expect(screen.getByText("Windhawk Theme Studio")).toBeDefined();
    expect(screen.getByRole("link", { name: "Windhawk Official" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Tolhurst Projects" })).toBeDefined();
  });
});
