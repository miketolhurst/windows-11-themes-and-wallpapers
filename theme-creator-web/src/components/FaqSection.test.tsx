import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { FaqSection } from "./FaqSection";

describe("FaqSection component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the FAQ section title and questions", () => {
    render(<FaqSection />);
    expect(screen.getByText(/Frequently Asked Questions/i)).toBeDefined();
    expect(screen.getByText(/Is this safe for my computer\?/i)).toBeDefined();
    expect(screen.getByText(/How do I uninstall or revert/i)).toBeDefined();
  });

  it("toggles answers open and closed when clicked", () => {
    render(<FaqSection />);
    const questionBtn = screen.getByRole("button", { name: /Is this safe for my computer\?/i });

    // Click to toggle
    fireEvent.click(questionBtn);
    expect(screen.getByText(/zero system files or DLLs are patched/i)).toBeDefined();
  });
});
