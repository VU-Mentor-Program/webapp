import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// Opens every page at the top, or at a section when navigated with `state: { scrollTo: "<section id>" }`.
// Back/forward navigation is left alone so the browser keeps its own position.
export const ScrollManager: React.FC = () => {
  const { pathname, key, state } = useLocation();
  const navigationType = useNavigationType();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    const samePage = prevPathname.current === pathname;
    prevPathname.current = pathname;

    const target = (state as { scrollTo?: string } | null)?.scrollTo;
    if (target) {
      // wait a frame so the new page has rendered
      requestAnimationFrame(() => document.getElementById(target)?.scrollIntoView({ behavior: "smooth" }));
      return;
    }
    if (navigationType === "POP") return;
    // re-clicking the page you're on glides up; a new page just starts at the top
    window.scrollTo({ top: 0, behavior: samePage ? "smooth" : "auto" });
  }, [key, pathname, state, navigationType]);

  return null;
};

export default ScrollManager;
