import React from "react";

interface ChessButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "glass" | "danger";
  full?: boolean;
}

const VARIANTS = {
  primary: "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/25",
  glass: "bg-white/10 hover:bg-white/20 border border-white/10 text-white",
  danger: "bg-white/10 hover:bg-red-500/30 border border-white/10 hover:border-red-400/40 text-white",
} as const;

export const ChessButton: React.FC<ChessButtonProps> = ({ variant = "glass", full = false, className = "", children, ...rest }) => (
  <button
    type="button"
    className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold cursor-pointer
      outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70
      transition-all duration-200 hover:scale-[1.03] active:scale-95
      disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100
      ${VARIANTS[variant]} ${full ? "w-full" : ""} ${className}`}
    {...rest}
  >
    {children}
  </button>
);

export default ChessButton;
