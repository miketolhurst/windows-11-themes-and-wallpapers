import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Navbar } from "./Navbar";

describe("Navbar component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders brand logo and title", () => {
    render(<Navbar />);
    expect(screen.getByText("Windhawk Theme Studio")).toBeDefined();
  });

  it("renders landing navigation links and CTA when not in studio mode", () => {
    render(<Navbar />);
    expect(screen.getByRole("link", { name: /^Showcase$/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /Prerequisites/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /^FAQ$/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /Launch Theme Studio/i })).toBeDefined();
  });

  it("renders back link when in studio mode", () => {
    render(<Navbar isStudio={true} />);
    expect(screen.getByRole("link", { name: /Showcase & Guide/i })).toBeDefined();
  });
});
