"use client";

import React, { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Is this safe for my computer?",
    answer:
      "Yes, 100%. Windhawk operates purely in user-mode memory injection. Zero system files or DLLs are patched, replaced, or permanently modified. If you turn off Windhawk, your desktop immediately returns to standard Windows behavior with no residual changes.",
  },
  {
    question: "How do I uninstall or revert to default Windows 11?",
    answer:
      "Reverting is effortless. In Windhawk, open the 'Installed Mods' tab and toggle off or uninstall the 3 styler mods. To reset your accent colors, open Windows Settings → Personalization → Colors and pick any standard Windows accent palette or wallpaper.",
  },
  {
    question: "Do I need Windhawk to use these themes?",
    answer:
      "For basic wallpaper and system accent colors, no—the registry keys (.reg) and wallpaper apply natively. However, to get translucent taskbar acrylic/blur, custom corner radii, and floating Start Menu styling, the 3 Windhawk styler mods are required.",
  },
  {
    question: "Does this work on Windows 10?",
    answer:
      "This theme studio is purpose-built for Windows 11 (22H2, 23H2, and 24H2) because it targets modern WinUI 3 XAML visual trees in explorer.exe. Windows 10 uses a legacy shell architecture and is not currently supported.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-900/30 border-t border-white/5 relative">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-blue-400 text-xs sm:text-sm font-semibold tracking-wider uppercase">
            Got Questions?
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mt-2 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base">
            Everything you need to know about customizing Windows 11 safely with Windhawk.
          </p>
        </div>

        <div className="space-y-4">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-neutral-950/70 border border-white/10 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <span className="font-semibold text-white text-base sm:text-lg">
                    {item.question}
                  </span>
                  <span className="text-neutral-400 text-lg shrink-0 font-mono transition-transform duration-200">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm text-neutral-300 leading-relaxed border-t border-white/5">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
