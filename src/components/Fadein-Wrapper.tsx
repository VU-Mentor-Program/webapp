import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

// The site's one scroll reveal: content fades up 16px, once, as it enters the viewport.
// SectionWrapper applies it to every section; use `delay` to stagger items inside a section.
interface FadeInProps {
    children: React.ReactNode;
    delay?: number; // milliseconds
    className?: string;
}

export default function FadeIn({
    children,
    delay = 0,
    className,
}: FadeInProps) {
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = elementRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                observer.disconnect();
                setIsVisible(true);
            },
            // start once the element is 60px into the viewport, so it is seen animating
            { rootMargin: "0px 0px -60px 0px" }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={elementRef}
            style={isVisible && delay ? { transitionDelay: `${delay}ms` } : undefined}
            className={clsx(
                "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-opacity",
                isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4 motion-reduce:translate-y-0",
                className
            )}
        >
            {children}
        </div>
    );
}
