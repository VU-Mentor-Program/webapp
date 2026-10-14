import React from "react";
import { AnimatedHeader } from "./AnimatedHeader";
import Aurora from "./Aurora";
import { FloatingStatusButton } from "./StatusChecker/FloatingStatusButton";

// Aurora colours along the page: the original theme at the top, turning emerald toward the bottom.
// The aurora glides between these as the visitor scrolls.
const AURORA_SCROLL_COLORS = [
  ['#1e3a8a', '#0d9488', '#34d399'],
  ['#0f766e', '#10b981', '#6ee7b7'],
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Aurora background layer - fixed, full screen. h-lvh = the tallest mobile viewport, so the
          background doesn't resize (and jump) when the phone's address bar slides in and out */}
      <div className="fixed inset-x-0 top-0 h-lvh z-0">
        <Aurora
          scrollColorStops={AURORA_SCROLL_COLORS}
          amplitude={1.2}
          blend={0.6}
          speed={0.1}
        />
      </div>

      {/* Dark overlay to maintain readability */}
      <div className="fixed inset-x-0 top-0 h-lvh z-0 bg-slate-900/60"></div>

      {/* Film grain texture over the background */}
      <div aria-hidden="true" className="fixed inset-x-0 top-0 h-lvh z-0 pointer-events-none bg-grain"></div>

      {/* Content layer - positioned above background */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <AnimatedHeader />
        <main className="flex-1 pt-20">
          {children}
        </main>
      </div>

      {/* Floating Status Button - positioned above all content */}
      <FloatingStatusButton />
    </div>
  );
};