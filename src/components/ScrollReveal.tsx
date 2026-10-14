import React, { ReactNode } from 'react';

// Section heading. It used to animate word by word with a scroll-scrubbed blur;
// headings now simply fade in with their section (see FadeIn / SectionWrapper).
interface ScrollRevealProps {
  children: ReactNode;
  containerClassName?: string;
  textClassName?: string;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  containerClassName = '',
  textClassName = '',
}) => {
  return (
    <h2 className={`my-5 ${containerClassName}`}>
      <p className={`text-[clamp(1.6rem,4vw,3rem)] leading-[1.5] font-semibold ${textClassName}`}>{children}</p>
    </h2>
  );
};

export default ScrollReveal;
