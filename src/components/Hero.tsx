import React from "react";
import { Logo } from "./logo";
import { SocialLinks } from "./social-link";
import JoinCommunityButton from "./JoinCommunityButton";
import FadeIn from "./Fadein-Wrapper";
import FloatingImages from "./FloatingImages";

export const Hero: React.FC = () => {
  return (
    <section className="min-h-[85vh] flex flex-col items-center justify-center text-white py-20 px-4 relative">
      <FloatingImages />
      <FadeIn duration={100} className="w-full relative z-10">
        <div className="flex flex-col items-center text-center space-y-6 w-full mx-auto" style={{ maxWidth: '48rem' }}>
          <Logo />

          <div className="w-full">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Mentor Program
            </h1>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-2 bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent leading-tight">
              2025-2026
            </h2>
          </div>

          <p className="font-mono text-[11px] md:text-xs text-white/40 tracking-wide">
            <span className="text-white/50">std</span>::<span className="text-white/50">cout</span> &lt;&lt; <span className="text-white/60">"debugging first years since day one"</span>;
          </p>

          <div className="pt-2">
            <JoinCommunityButton />
          </div>

          <SocialLinks />
        </div>
      </FadeIn>

      {/* Scroll down indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg
          className="w-6 h-6 text-white/50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
