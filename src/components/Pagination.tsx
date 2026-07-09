import { useMemo } from "react";

interface PaginationProps {
  total: number;
  page: number;
  maxPage: number;
  onPageChange: (page: number) => void;
  label?: string;
  perPage?: number;
}

const VISIBLE_PAGES = 5;

export default function Pagination({ total, page, maxPage, onPageChange, label, perPage = 10 }: PaginationProps) {
  const pages = useMemo(() => {
    const half = Math.floor(VISIBLE_PAGES / 2);
    let start = Math.max(1, page - half);
    const end = Math.min(maxPage, start + VISIBLE_PAGES - 1);
    if (end - start + 1 < VISIBLE_PAGES) {
      start = Math.max(1, end - VISIBLE_PAGES + 1);
    }
    const result: number[] = [];
    for (let i = start; i <= end; i++) result.push(i);
    return result;
  }, [page, maxPage]);

  if (total <= perPage) return null;

  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-4 sm:mt-5 gap-3">
      <span className="text-xs sm:text-[0.75rem] text-t3 order-2 sm:order-1">
        Showing <strong className="text-t2">{from}–{to}</strong> of <strong className="text-t2">{total}</strong> {label || "items"}
      </span>
      <nav className="flex items-center gap-1 order-1 sm:order-2" aria-label="Pagination">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="w-9 h-9 sm:w-8 sm:h-8 inline-flex items-center justify-center border border-border rounded-lg sm:rounded-md bg-white text-t2 text-sm transition-all duration-[0.15s] hover:bg-s3 hover:border-bh hover:text-text disabled:opacity-[0.35] disabled:cursor-default disabled:shadow-none shadow-xs"
          aria-label="Previous page"
        >
          <i aria-hidden="true" className="fa-solid fa-chevron-left text-xs" />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-9 h-9 sm:w-8 sm:h-8 inline-flex items-center justify-center border rounded-lg sm:rounded-md text-sm transition-all duration-[0.15s] shadow-xs ${
              p === page
                ? "bg-pg border-p-border text-p font-bold"
                : "border-border bg-white text-t2 hover:bg-s3 hover:border-bh hover:text-text"
            }`}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= maxPage}
          className="w-9 h-9 sm:w-8 sm:h-8 inline-flex items-center justify-center border border-border rounded-lg sm:rounded-md bg-white text-t2 text-sm transition-all duration-[0.15s] hover:bg-s3 hover:border-bh hover:text-text disabled:opacity-[0.35] disabled:cursor-default disabled:shadow-none shadow-xs"
          aria-label="Next page"
        >
          <i aria-hidden="true" className="fa-solid fa-chevron-right text-xs" />
        </button>
      </nav>
    </div>
  );
}
