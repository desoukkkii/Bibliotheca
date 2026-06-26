import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  children?: ReactNode;
  footer: ReactNode;
  size?: "wide" | "slim";
}

export default function Modal({ isOpen, onClose, title, children, footer, size }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxW = size === "slim" ? "max-w-[360px]" : size === "wide" ? "max-w-[680px]" : "max-w-[500px]";

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-bg-fade" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative bg-white rounded-t-xl sm:rounded-xl shadow-xl max-h-[85vh] sm:max-h-[calc(100vh-40px)] flex flex-col border border-border w-full sm:w-full ${maxW} animate-modal-pop sm:mx-4`}
      >
        <div className="flex items-center justify-between px-4 sm:px-[22px] py-3 sm:py-[18px] border-b border-border shrink-0">
          <h2 className="text-sm sm:text-[0.95rem] font-bold font-heading tracking-tight text-text flex items-center gap-2.5">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-border text-t3 hover:text-text hover:bg-s3 hover:border-bh transition-all duration-[0.15s] text-sm"
            aria-label="Close dialog"
          >
            <i aria-hidden="true" className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="px-4 sm:px-[22px] py-4 sm:py-[22px] overflow-y-auto">{children}</div>
        <div className="flex justify-end gap-2.5 px-4 sm:px-[22px] py-3 sm:py-4 border-t border-border bg-s2/80 shrink-0 rounded-b-xl">
          {footer}
        </div>
      </div>
    </div>,
    document.body,
  );
}
