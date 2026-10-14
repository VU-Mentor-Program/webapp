import React from "react";
import FadeIn from "./Fadein-Wrapper";

interface SectionWrapperProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  glass?: boolean;
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({
  children,
  id,
  className = "",
  glass = false,
}) => {
  return (
    // scroll-mt keeps the section clear of the fixed header when scrolled to
    <section id={id} className={`scroll-mt-24 py-16 md:py-20 px-4 ${className}`}>
      <FadeIn>
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
