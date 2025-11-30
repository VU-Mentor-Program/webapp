import React from "react";
import { AnimatedHeader } from "./AnimatedHeader";
import Aurora from "./Aurora";

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Aurora background layer - fixed position, full screen */}
      <div className="fixed inset-0 z-0">
        <Aurora
          colorStops={['#1e3a8a', '#831843', '#ec4899']}
          amplitude={1.2}
          blend={0.6}
          speed={0.1}
        />
      </div>

      {/* Dark overlay to maintain readability */}
      <div className="fixed inset-0 z-0 bg-slate-900/60"></div>

      {/* Content layer - positioned above background */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <AnimatedHeader />
        <main className="flex-1 pt-20">
          {children}
        </main>
      </div>
    </div>
  );
};