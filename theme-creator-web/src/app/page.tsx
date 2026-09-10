"use client";

import React, { useState } from "react";
import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { PrerequisitesGuide } from "../components/PrerequisitesGuide";
import { ThemeShowcase } from "../components/ThemeShowcase";
import { ThemeLightbox } from "../components/ThemeLightbox";
import { FaqSection } from "../components/FaqSection";
import { Footer } from "../components/Footer";
import { FeaturedTheme } from "../data/featuredThemes";

export default function LandingPage() {
  const [selectedTheme, setSelectedTheme] = useState<FeaturedTheme | null>(null);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-blue-600 selection:text-white flex flex-col">
      <Navbar />

      <main className="flex-1">
        <Hero />
        <PrerequisitesGuide />
        <ThemeShowcase onSelectTheme={setSelectedTheme} />
        <FaqSection />
      </main>

      <Footer />

      {/* Lightbox Modal */}
      <ThemeLightbox
        theme={selectedTheme}
        onClose={() => setSelectedTheme(null)}
      />
    </div>
  );
}
