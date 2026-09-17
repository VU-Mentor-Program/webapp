import React, { useId } from "react";
import { motion } from "framer-motion";

interface Option<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface ModeSwitcherProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "md" | "sm";
  ariaLabel?: string;
  /** Stretch the segments to fill the container — always, or only below the `sm` breakpoint. */
  full?: boolean | "mobile";
}

export function ModeSwitcher<T extends string>({ options, value, onChange, size = "md", ariaLabel, full = false }: ModeSwitcherProps<T>) {
  const layoutGroup = useId();
  const pad = size === "md" ? "px-5 py-2.5 text-sm md:text-base" : "px-3.5 py-1.5 text-xs md:text-sm";
  const container = full === true ? "flex w-full" : full === "mobile" ? "flex w-full sm:inline-flex sm:w-auto" : "inline-flex";
  const segment = full === true ? "flex-1" : full === "mobile" ? "flex-1 sm:flex-none" : "";

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`${container} items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1 backdrop-blur-sm`}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={`relative flex items-center justify-center gap-2 rounded-full font-semibold cursor-pointer transition-colors duration-300
              outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70 ${pad} ${segment} ${
                active ? "text-white" : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
          >
            {active && (
              <motion.span
                layoutId={`${layoutGroup}-active`}
                className="absolute inset-0 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30"
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2 whitespace-nowrap">
              {opt.icon}
              <span>{opt.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default ModeSwitcher;
