import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { partnerGroups, type Partner } from "../data/partners";
import { useTranslations } from "../contexts/TranslationContext";

const ROTATE_MS = 5000;
const STAGGER_S = 0.08;
const MAX_LOGOS = 4;

const shuffle = <T,>(items: T[]): T[] => {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const pick = (groupIndex: number) => shuffle(partnerGroups[groupIndex].partners).slice(0, MAX_LOGOS);

// Logos get equal visual weight rather than equal height: wide wordmarks are drawn shorter, square symbols taller.
const LOGO_BASE_PX = 72;
const LOGO_ASPECT_EXPONENT = 0.38;
const logoHeight = (aspect: number) => LOGO_BASE_PX * Math.pow(aspect, -LOGO_ASPECT_EXPONENT);

const PartnerLogo: React.FC<{ partner: Partner }> = ({ partner }) => {
  const [aspect, setAspect] = useState<number | null>(null);
  return (
    <span className="flex items-center justify-center">
      <img
        src={partner.logo}
        alt={partner.name}
        title={partner.name}
        draggable={false}
        ref={(el) => {
          // cached images can finish loading before onLoad is attached
          if (el && !aspect && el.complete && el.naturalWidth && el.naturalHeight) setAspect(el.naturalWidth / el.naturalHeight);
        }}
        onLoad={(e) => {
          const { naturalWidth, naturalHeight } = e.currentTarget;
          if (naturalWidth && naturalHeight) setAspect(naturalWidth / naturalHeight);
        }}
        style={{
          height: aspect ? `calc(var(--logo-scale) * ${logoHeight(aspect)}px)` : "2.5rem",
          opacity: aspect ? 1 : 0,
        }}
        className="w-auto object-contain select-none transition-opacity duration-200"
      />
    </span>
  );
};

export const PartnerLogos: React.FC = () => {
  const t = useTranslations("partners");
  const [state, setState] = useState(() => {
    const groupIndex = Math.floor(Math.random() * partnerGroups.length);
    return { groupIndex, picks: pick(groupIndex), tick: 0 };
  });
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const id = window.setInterval(() => {
      setState((prev) => {
        const groupIndex = (prev.groupIndex + 1) % partnerGroups.length;
        return { groupIndex, picks: pick(groupIndex), tick: prev.tick + 1 };
      });
    }, reduce ? ROTATE_MS * 2 : ROTATE_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  const group = partnerGroups[state.groupIndex];

  return (
    <div
      className="max-w-[76rem] mx-auto text-center [--logo-scale:0.68] md:[--logo-scale:1]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-10 md:h-12 mb-10 md:mb-14 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={`${group.id}-${state.tick}`}
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="text-xl md:text-3xl font-semibold text-gray-200"
          >
            {t(group.headingKey)}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap justify-center gap-y-10">
        {state.picks.map((partner, slot) => (
          <div key={slot} className="relative w-1/2 md:w-1/4 px-3 h-16 md:h-28 flex items-center justify-center">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${state.tick}-${partner.name}`}
                initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                animate={{ opacity: 0.85, y: 0, filter: "blur(0px)", transition: { duration: 0.45, delay: slot * STAGGER_S, ease: "easeOut" } }}
                exit={{ opacity: 0, y: -24, filter: "blur(8px)", transition: { duration: 0.3, delay: slot * STAGGER_S, ease: "easeIn" } }}
                whileHover={{ opacity: 1 }}
              >
                <PartnerLogo partner={partner} />
              </motion.div>
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PartnerLogos;
