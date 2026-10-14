import React from "react";
import FadeIn from "./Fadein-Wrapper";

interface SectionWrapperProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  glass?: boolean;
  divider?: boolean;
  label?: string;
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({
  children,
  id,
  className = "",
  glass = false,
  divider = true,
  label,
}) => {
  return (
    // scroll-mt keeps the section clear of the fixed header when scrolled to
    <section id={id} className={`scroll-mt-24 py-16 md:py-20 px-4 ${className}`}>
      <FadeIn>
        {divider && (
          <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent max-w-2xl mx-auto mb-12" />
        )}
        {label && (
          <p className="text-center uppercase tracking-[0.25em] text-xs text-emerald-400/80 font-medium mb-4">
            {label}
          </p>
        )}
        <div
          className={`max-w-6xl mx-auto ${
            glass
              ? "bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-10"
              : ""
          }`}
        >
          {children}
        </div>
      </FadeIn>
    </section>
  );
};

export default SectionWrapper;
