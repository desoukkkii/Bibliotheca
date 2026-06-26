import { useState, useMemo, useCallback, useEffect } from "react";
import { useStore } from "../lib/store";
import { useToast } from "../hooks/useToast";
import { applySort, paginate, today } from "../lib/utils";
import type { ViewState } from "../types";
import Pagination from "../components/Pagination";
import SortableTh from "../components/SortableTh";
import { BtnSuccess, BtnIcon } from "../components/UI";

export default function Overdue() {
  const { state, dispatch } = useStore();
  const { addToast } = useToast();

  const [vs, setVS] = useState<ViewState>({ search: "", filter: "", page: 1, sort: { col: "", dir: "" } });

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const overdueItems = useMemo(() => {
    return state.transactions.filter(
      (t) => !t.returnDate && new Date(t.dueDate) < now,
    );
  }, [state.transactions, now]);

  const totalFees = useMemo(() => {
    return overdueItems.reduce((sum, t) => {
      const days = Math.floor((now.getTime() - new Date(t.dueDate).getTime()) / 86400000);
      return sum + days * 50;
    }, 0);
  }, [overdueItems, now]);

  const filtered = useMemo(() => {
    let items = applySort(overdueItems, vs.sort);
    return paginate(items, vs.page);
  }, [overdueItems, vs]);

  const handleSort = useCallback((col: string) => {
    setVS((prev) => ({
      ...prev,
      page: 1,
      sort: { col, dir: prev.sort.col === col && prev.sort.dir === "asc" ? "dsc" : "asc" },
    }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setVS((prev) => ({ ...prev, page }));
  }, []);

  const handleReturn = useCallback(
    (id: number) => {
      dispatch({ type: "RETURN_BOOK", payload: { id, returnDate: today() } });
      const txn = state.transactions.find((t) => t.id === id);
      addToast(`Returned: ${txn?.bookTitle || "Book"}`, "s");
    },
    [dispatch, state.transactions, addToast],
  );

  return (
    <div className="pt-1">
      {/* Header */}
      <div className="flex items-start sm:items-end justify-between flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-7">
        <div>
          <div className="flex items-center gap-2.5 mb-0.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-rg flex items-center justify-center text-r shrink-0">
              <i aria-hidden="true" className="fa-solid fa-clock text-xs sm:text-sm" />
            </div>
            <h1 className="text-xl sm:text-[1.45rem] font-extrabold font-heading tracking-tight text-text leading-tight">Overdue</h1>
          </div>
          <p className="text-xs sm:text-[0.83rem] text-t3 ml-10 sm:ml-[45px]">{overdueItems.length} item{overdueItems.length !== 1 ? "s" : ""} overdue</p>
        </div>
        <div className="flex items-center gap-2 bg-rg border border-r-border rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 shrink-0">
          <i aria-hidden="true" className="fa-solid fa-coins text-r text-xs sm:text-sm" />
          <div>
            <div className="text-[0.55rem] sm:text-[0.6rem] font-bold uppercase tracking-wider text-r">Total Late Fees</div>
            <div className="text-sm sm:text-base font-extrabold text-r tabular-nums">KSH {totalFees.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {overdueItems.length ? (
        <>
          {/* Severity Summary */}
          <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6 flex-wrap">
            {[
              { label: "Critical", days: 30, color: "bg-rg text-r border-r-border", dot: "bg-r" },
              { label: "High", days: 14, color: "bg-ag text-a border-a-border", dot: "bg-a" },
              { label: "Moderate", days: 7, color: "bg-cg text-c border-c-border", dot: "bg-c" },
              { label: "Low", days: 0, color: "bg-gg text-g border-g-border", dot: "bg-g" },
            ].map((sev) => {
              const count = overdueItems.filter(
                (t) => Math.floor((now.getTime() - new Date(t.dueDate).getTime()) / 86400000) >= sev.days,
              ).length;
              if (!count) return null;
              return (
                <div key={sev.label} className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md border text-[0.65rem] sm:text-[0.72rem] font-semibold ${sev.color}`}>
                  <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${sev.dot}`} />
                  {sev.label}: {count}
                </div>
              );
            })}
          </div>

          {/* Table */}
          <div className="bg-white border border-border rounded-xl overflow-x-auto shadow-xs">
            <table className="w-full border-collapse text-[0.85rem] min-w-[600px] card-table" aria-label="Overdue books table">
              <thead>
                <tr>
                  <SortableTh col="bookTitle" label="Book" currentCol={vs.sort.col} currentDir={vs.sort.dir} onSort={handleSort} />
                  <SortableTh col="memberName" label="Member" currentCol={vs.sort.col} currentDir={vs.sort.dir} onSort={handleSort} />
                  <th className="bg-s2 text-t2 font-bold uppercase tracking-wider text-[0.64rem] px-4 py-[13px] text-left whitespace-nowrap border-b border-border">Due Date</th>
                  <th className="bg-s2 text-t2 font-bold uppercase tracking-wider text-[0.64rem] px-4 py-[13px] text-left whitespace-nowrap border-b border-border">Days Late</th>
                  <th className="bg-s2 text-t2 font-bold uppercase tracking-wider text-[0.64rem] px-4 py-[13px] text-left whitespace-nowrap border-b border-border">Late Fee</th>
                  <th className="bg-s2 text-t2 font-bold uppercase tracking-wider text-[0.64rem] px-4 py-[13px] text-left whitespace-nowrap border-b border-border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.items.map((t, i) => {
                  const days = Math.floor((now.getTime() - new Date(t.dueDate).getTime()) / 86400000);
                  const fee = days * 50;
                  const severity = days >= 30 ? "critical" : days >= 14 ? "high" : days >= 7 ? "moderate" : "low";
                  const sevColors: Record<string, string> = {
                    critical: "bg-rg text-r border-r-border",
                    high: "bg-ag text-a border-a-border",
                    moderate: "bg-cg text-c border-c-border",
                    low: "bg-gg text-g border-g-border",
                  };
                  const sevDots: Record<string, string> = {
                    critical: "bg-r", high: "bg-a", moderate: "bg-c", low: "bg-g",
                  };
                  return (
                    <tr key={t.id} className={`border-b border-border last:border-none transition-all duration-[0.15s] ${i % 2 === 1 ? "bg-s2/40" : ""} hover:bg-[#fef2f2]`}>
                      <td className="px-4 py-3 align-middle" data-label="Book">
                        <strong className="text-text font-semibold text-sm sm:text-[0.85rem]">{t.bookTitle}</strong>
                      </td>
                      <td className="px-4 py-3 text-t2 align-middle" data-label="Member">
                        <span className="text-xs sm:text-[0.85rem]">{t.memberName}</span>
                      </td>
                      <td className="px-4 py-3 align-middle" data-label="Due Date">
                        <span className="text-xs sm:text-[0.78rem] text-r font-medium">{t.dueDate}</span>
                      </td>
                      <td className="px-4 py-3 align-middle" data-label="Days Late">
                        <span className={`inline-flex items-center gap-1.5 text-[0.6rem] sm:text-[0.65rem] font-bold px-2 sm:px-2.5 py-1 rounded-full border ${sevColors[severity]}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sevDots[severity]}`} />
                          {days} day{days !== 1 ? "s" : ""}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-middle" data-label="Late Fee">
                        <span className="inline-flex items-center gap-1.5 text-[0.6rem] sm:text-[0.65rem] font-bold px-2 sm:px-2.5 py-1 rounded-full border bg-rg text-r border-r-border">
                          <i aria-hidden="true" className="fa-solid fa-coins text-[0.55rem] sm:text-[0.6rem]" />
                          KSH {fee.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-middle" data-label="">
                        <div className="flex gap-1.5 items-center justify-end sm:justify-start">
                          <BtnSuccess onClick={() => handleReturn(t.id)}>
                            <i aria-hidden="true" className="fa-solid fa-rotate-left" />
                            Return
                          </BtnSuccess>
                          <BtnIcon onClick={() => addToast(`Contact: ${t.memberName}`, "info")} aria-label="View member">
                            <i aria-hidden="true" className="fa-solid fa-eye" />
                          </BtnIcon>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination total={filtered.total} page={filtered.page} maxPage={filtered.maxPage} onPageChange={handlePageChange} label="overdue items" />
        </>
      ) : (
        <div className="bg-white border border-border rounded-xl py-12 sm:py-[60px] text-center shadow-xs">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gg flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <i aria-hidden="true" className="fa-solid fa-circle-check text-[1.2rem] sm:text-[1.6rem] text-g" />
          </div>
          <p className="text-sm sm:text-[0.95rem] text-text font-semibold">All Clear!</p>
          <p className="text-xs sm:text-[0.82rem] text-t3 mt-1">No overdue items — every book is on time.</p>
        </div>
      )}
    </div>
  );
}
