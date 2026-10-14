import React from "react";
import { AnimatedHeader } from "./AnimatedHeader";
import Aurora from "./Aurora";
import { FloatingStatusButton } from "./StatusChecker/FloatingStatusButton";

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Aurora background layer - fixed, full screen. h-lvh = the tallest mobile viewport, so the
          background doesn't resize (and jump) when the phone's address bar slides in and out */}
      <div className="fixed inset-x-0 top-0 h-lvh z-0">
        <Aurora
          colorStops={['#1e3a8a', '#0d9488', '#34d399']}
          amplitude={1.2}
          blend={0.6}
          speed={0.1}
        />
      </div>

      {/* Dark overlay to maintain readability */}
      <div className="fixed inset-x-0 top-0 h-lvh z-0 bg-slate-900/60"></div>

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