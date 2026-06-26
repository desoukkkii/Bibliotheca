import type { ReactNode, ButtonHTMLAttributes } from "react";

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

const base = "inline-flex items-center gap-[7px] px-4 sm:px-[18px] py-[10px] sm:py-[9px] rounded-lg sm:rounded-sm font-semibold text-sm sm:text-[0.83rem] cursor-pointer border-none transition-all duration-[0.22s] whitespace-nowrap leading-[1.4] active:scale-[0.97] min-touch";

export function BtnPrimary({ children, className = "", ...props }: BtnProps) {
  return (
    <button {...props} className={`${base} bg-p text-white shadow-p hover:bg-p-dark hover:shadow-[0_6px_20px_rgba(79,70,229,0.35)] hover:-translate-y-px ${className}`}>
      {children}
    </button>
  );
}

export function BtnGhost({ children, className = "", ...props }: BtnProps) {
  return (
    <button {...props} className={`${base} bg-surface text-t2 border border-border shadow-xs hover:bg-s3 hover:border-bh hover:text-text ${className}`}>
      {children}
    </button>
  );
}

export function BtnSuccess({ children, className = "", ...props }: BtnProps) {
  return (
    <button {...props} className={`inline-flex items-center gap-[7px] px-3.5 sm:px-3 py-[8px] sm:py-[6px] rounded-lg sm:rounded-sm font-semibold text-xs sm:text-[0.76rem] cursor-pointer border-none transition-all duration-[0.22s] whitespace-nowrap leading-[1.4] bg-g text-white shadow-[0_4px_12px_rgba(5,150,105,0.22)] hover:bg-[#047857] hover:shadow-[0_6px_18px_rgba(5,150,105,0.32)] hover:-translate-y-px active:scale-[0.97] min-touch ${className}`}>
      {children}
    </button>
  );
}

export function BtnDanger({ children, className = "", ...props }: BtnProps) {
  return (
    <button {...props} className={`${base} bg-r text-white shadow-[0_4px_12px_rgba(220,38,38,0.22)] hover:bg-[#b91c1c] hover:shadow-[0_6px_18px_rgba(220,38,38,0.32)] hover:-translate-y-px ${className}`}>
      {children}
    </button>
  );
}

export function BtnIcon({ children, className = "", ...props }: BtnProps) {
  return (
    <button {...props} className={`bg-transparent border border-transparent cursor-pointer text-t3 px-2.5 py-[9px] sm:py-[6px] rounded-lg sm:rounded-sm text-sm sm:text-[0.82rem] leading-none transition-all duration-[0.15s] hover:bg-s3 hover:text-t2 hover:border-border min-touch ${className}`}>
      {children}
    </button>
  );
}

export function BtnIconDanger({ children, className = "", ...props }: BtnProps) {
  return (
    <button {...props} className={`bg-transparent border border-transparent cursor-pointer text-t3 px-2.5 py-[9px] sm:py-[6px] rounded-lg sm:rounded-sm text-sm sm:text-[0.82rem] leading-none transition-all duration-[0.15s] hover:bg-rg hover:text-r hover:border-r-border min-touch ${className}`}>
      {children}
    </button>
  );
}
