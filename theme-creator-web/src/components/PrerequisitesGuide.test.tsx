import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { PrerequisitesGuide } from "./PrerequisitesGuide";

describe("PrerequisitesGuide component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders 3 setup steps", () => {
    render(<PrerequisitesGuide />);
    expect(screen.getByText(/Install Windhawk Engine/i)).toBeDefined();
    expect(screen.getByText(/Enable the 3 Required Mods/i)).toBeDefined();
    expect(screen.getByText(/Download & Apply Any Theme/i)).toBeDefined();
  });

  it("renders the 3 required styler mod cards", () => {
    render(<PrerequisitesGuide />);
    expect(screen.getByText("Windows 11 Taskbar Styler")).toBeDefined();
    expect(screen.getByText("Windows 11 Start Menu Styler")).toBeDefined();
    expect(screen.getByText("Windows 11 Notification Center Styler")).toBeDefined();
  });

  it("handles copy winget command to clipboard", async () => {
    let copiedText = "";
    Object.assign(navigator, {
      clipboard: {
        writeText: (text: string) => {
          copiedText = text;
          return Promise.resolve();
        },
      },
    });

    render(<PrerequisitesGuide />);
    const copyBtn = screen.getByRole("button", { name: /copy/i });
    fireEvent.click(copyBtn);

    expect(copiedText).toBe("winget install RamenSoftware.Windhawk");
    expect(await screen.findByText(/copied!/i)).toBeDefined();
  });
});
