import type { ReactNode, ButtonHTMLAttributes } from "react";

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

const BASE = "inline-flex items-center gap-[7px] font-semibold cursor-pointer border-none transition-all duration-[0.22s] whitespace-nowrap leading-[1.4] active:scale-[0.97] min-touch";

const SIZES = {
  md: "px-4 sm:px-[18px] py-[10px] sm:py-[9px] rounded-lg sm:rounded-sm text-sm sm:text-[0.83rem]",
  sm: "px-3.5 sm:px-3 py-[8px] sm:py-[6px] rounded-lg sm:rounded-sm text-xs sm:text-[0.76rem]",
  icon: "px-2.5 py-[9px] sm:py-[6px] rounded-lg sm:rounded-sm text-sm sm:text-[0.82rem] leading-none",
} as const;

const VARIANTS = {
  primary: "bg-p text-white shadow-p hover:bg-p-dark hover:shadow-[0_6px_20px_rgba(79,70,229,0.35)] hover:-translate-y-px",
  ghost: "bg-surface text-t2 border border-border shadow-xs hover:bg-s3 hover:border-bh hover:text-text",
  success: "bg-g text-white shadow-[0_4px_12px_rgba(5,150,105,0.22)] hover:bg-[#047857] hover:shadow-[0_6px_18px_rgba(5,150,105,0.32)] hover:-translate-y-px",
  danger: "bg-r text-white shadow-[0_4px_12px_rgba(220,38,38,0.22)] hover:bg-[#b91c1c] hover:shadow-[0_6px_18px_rgba(220,38,38,0.32)] hover:-translate-y-px",
  icon: "bg-transparent border border-transparent cursor-pointer text-t3 hover:bg-s3 hover:text-t2 hover:border-border",
  iconDanger: "bg-transparent border border-transparent cursor-pointer text-t3 hover:bg-rg hover:text-r hover:border-r-border",
} as const;

export function BtnPrimary({ children, className = "", ...props }: BtnProps) {
  return <button {...props} className={`${BASE} ${SIZES.md} ${VARIANTS.primary} ${className}`}>{children}</button>;
}

export function BtnGhost({ children, className = "", ...props }: BtnProps) {
  return <button {...props} className={`${BASE} ${SIZES.md} ${VARIANTS.ghost} ${className}`}>{children}</button>;
}

export function BtnSuccess({ children, className = "", ...props }: BtnProps) {
  return <button {...props} className={`${BASE} ${SIZES.sm} ${VARIANTS.success} ${className}`}>{children}</button>;
}

export function BtnDanger({ children, className = "", ...props }: BtnProps) {
  return <button {...props} className={`${BASE} ${SIZES.md} ${VARIANTS.danger} ${className}`}>{children}</button>;
}

export function BtnIcon({ children, className = "", ...props }: BtnProps) {
  return <button {...props} className={`${BASE} ${SIZES.icon} ${VARIANTS.icon} ${className}`}>{children}</button>;
}

export function BtnIconDanger({ children, className = "", ...props }: BtnProps) {
  return <button {...props} className={`${BASE} ${SIZES.icon} ${VARIANTS.iconDanger} ${className}`}>{children}</button>;
}
