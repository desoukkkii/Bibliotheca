import { useState, useMemo, useCallback, useEffect } from "react";
import { useStore } from "../lib/store";
import { useToast } from "../hooks/useToast";
import { applySort, paginate, today } from "../lib/utils";
import type { ViewState } from "../types";
import Pagination from "../components/Pagination";
import SortableTh from "../components/SortableTh";
import SearchBox from "../components/SearchBox";
import { BtnPrimary, BtnGhost, BtnIcon } from "../components/UI";
import Modal from "../components/Modal";

export default function Borrowing() {
  const { state, dispatch, nextId } = useStore();
  const { addToast } = useToast();

  const [vs, setVS] = useState<ViewState>({ search: "", filter: "", page: 1, sort: { col: "", dir: "" } });
  const [borrowModal, setBorrowModal] = useState(false);
  const [borrowForm, setBorrowForm] = useState({ book: "", member: "" });
  const [borrowErr, setBorrowErr] = useState("");

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    let items = state.transactions.filter((t) => {
      const s = vs.search.toLowerCase();
      if (s && !t.bookTitle.toLowerCase().includes(s) && !t.memberName.toLowerCase().includes(s))
        return false;
      if (vs.filter === "active" && t.returnDate) return false;
      if (vs.filter === "returned" && !t.returnDate) return false;
      return true;
    });
    items = applySort(items, vs.sort);
    return paginate(items, vs.page);
  }, [state.transactions, vs]);

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

  const openBorrow = useCallback(() => {
    setBorrowForm({ book: "", member: "" });
    setBorrowErr("");
    setBorrowModal(true);
  }, []);

  const handleBorrow = useCallback(() => {
    const { book, member } = borrowForm;
    if (!book) { setBorrowErr("Select a book"); return; }
    if (!member) { setBorrowErr("Select a member"); return; }

    const bk = state.books.find((b) => b.title === book);
    if (!bk) { setBorrowErr("Book not found"); return; }

    const borrowed = state.transactions.filter(
      (t) => t.bookTitle === book && !t.returnDate,
    ).length;
    if (borrowed >= bk.qty) { setBorrowErr("No copies available"); return; }

    const due = new Date();
    due.setDate(due.getDate() + 14);
    dispatch({
      type: "ADD_TRANSACTION",
      payload: {
        id: nextId(),
        bookTitle: book,
        memberName: member,
        borrowDate: today(),
        dueDate: due.toISOString().slice(0, 10),
        returnDate: null,
        renewCount: 0,
      },
    });
    setBorrowModal(false);
    addToast(`Loan created: ${book}`, "s");
  }, [borrowForm, state.books, state.transactions, dispatch, nextId, addToast]);

  const handleReturn = useCallback(
    (id: number) => {
      dispatch({ type: "RETURN_BOOK", payload: { id, returnDate: today() } });
      const txn = state.transactions.find((t) => t.id === id);
      addToast(`Returned: ${txn?.bookTitle || "Book"}`, "s");
    },
    [dispatch, state.transactions, addToast],
  );

  const handleRenew = useCallback(
    (id: number) => {
      const txn = state.transactions.find((t) => t.id === id);
      if (!txn) { addToast("Transaction not found", "e"); return; }
      if (txn.renewCount >= 4) { addToast("Maximum renewals reached", "w"); return; }
      const renewCount = (txn.renewCount || 0) + 1;
      const due = new Date(txn.dueDate);
      due.setDate(due.getDate() + 14);
      dispatch({
        type: "RENEW_BOOK",
        payload: { id, dueDate: due.toISOString().slice(0, 10), renewCount },
      });
      addToast(`Renewed: ${txn.bookTitle}`, "s");
    },
    [state.transactions, dispatch, addToast],
  );

  const available = useMemo(
    () =>
      state.books.filter((b) => {
        const out = state.transactions.filter(
          (t) => t.bookTitle === b.title && !t.returnDate,
        ).length;
        return b.qty - out > 0;
      }),
    [state.books, state.transactions],
  );

  const activeCount = state.transactions.filter((t) => !t.returnDate).length;
  const returnedCount = state.transactions.filter((t) => t.returnDate).length;

  return (
    <div className="pt-1">
      {/* Header */}
      <div className="flex items-start sm:items-end justify-between flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-7">
        <div>
          <div className="flex items-center gap-2.5 mb-0.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-cg flex items-center justify-center text-c shrink-0">
              <i aria-hidden="true" className="fa-solid fa-hand-holding-heart text-xs sm:text-sm" />
            </div>
            <h1 className="text-xl sm:text-[1.45rem] font-extrabold font-heading tracking-tight text-text leading-tight">Borrowing</h1>
          </div>
          <p className="text-xs sm:text-[0.83rem] text-t3 ml-10 sm:ml-[45px]">{activeCount} active · {returnedCount} returned</p>
        </div>
        <BtnPrimary onClick={openBorrow}><i aria-hidden="true" className="fa-solid fa-plus" /> New Loan</BtnPrimary>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-3 mb-4 sm:mb-6">
        <SearchBox
          value={vs.search}
          onChange={(v) => setVS((prev) => ({ ...prev, search: v, page: 1 }))}
          placeholder="Search by book or member…"
          label="Search borrowing records"
        />
        <div className="flex gap-1.5">
          {["", "active", "returned"].map((f) => (
            <button
              key={f}
              onClick={() => setVS((prev) => ({ ...prev, filter: f, page: 1 }))}
              className={`px-3 py-[7px] rounded-md text-[0.72rem] sm:text-[0.75rem] font-semibold transition-all duration-[0.15s] border ${
                vs.filter === f ? "bg-cg text-c border-c-border" : "bg-surface text-t2 border-border hover:bg-s3 hover:text-text"
              }`}
            >
              {f === "" ? "All" : f === "active" ? "Active" : "Returned"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded-xl overflow-x-auto shadow-xs">
        <table className="w-full border-collapse text-[0.85rem] min-w-[600px] card-table" aria-label="Borrowing records table">
          <thead>
            <tr>
              <SortableTh col="bookTitle" label="Book" currentCol={vs.sort.col} currentDir={vs.sort.dir} onSort={handleSort} />
              <SortableTh col="memberName" label="Member" currentCol={vs.sort.col} currentDir={vs.sort.dir} onSort={handleSort} />
              <SortableTh col="borrowDate" label="Borrowed" currentCol={vs.sort.col} currentDir={vs.sort.dir} onSort={handleSort} />
              <SortableTh col="dueDate" label="Due" currentCol={vs.sort.col} currentDir={vs.sort.dir} onSort={handleSort} />
              <th className="bg-s2 text-t2 font-bold uppercase tracking-wider text-[0.64rem] px-4 py-[13px] text-left whitespace-nowrap border-b border-border">Status</th>
              <th className="bg-s2 text-t2 font-bold uppercase tracking-wider text-[0.64rem] px-4 py-[13px] text-left whitespace-nowrap border-b border-border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.items.length ? (
              filtered.items.map((t, i) => {
                const isOD = !t.returnDate && new Date(t.dueDate) < now;
                const st = t.returnDate ? "returned" : isOD ? "overdue" : "borrowed";
                const stLabel = st === "returned" ? "Returned" : isOD ? "Overdue" : "On Loan";
                const stColors: Record<string, string> = {
                  returned: "bg-gg text-g border-g-border",
                  borrowed: "bg-cg text-c border-c-border",
                  overdue: "bg-rg text-r border-r-border",
                };
                const stDot: Record<string, string> = {
                  returned: "bg-g", borrowed: "bg-c", overdue: "bg-r",
                };
                return (
                  <tr key={t.id} className={`border-b border-border last:border-none transition-all duration-[0.15s] ${isOD ? "bg-[#fef2f2]" : i % 2 === 1 ? "bg-s2/40" : ""} hover:bg-s2`}>
                    <td className="px-4 py-3 align-middle" data-label="Book">
                      <strong className="text-text font-semibold text-sm sm:text-[0.85rem]">{t.bookTitle}</strong>
                    </td>
                    <td className="px-4 py-3 text-t2 align-middle" data-label="Member">
                      <span className="text-xs sm:text-[0.85rem]">{t.memberName}</span>
                    </td>
                    <td className="px-4 py-3 align-middle" data-label="Borrowed">
                      <span className="text-xs sm:text-[0.78rem] text-t2">{t.borrowDate}</span>
                    </td>
                    <td className={`px-4 py-3 align-middle font-medium ${isOD ? "text-r" : "text-t2"}`} data-label="Due">
                      <span className="text-xs sm:text-[0.78rem]">{t.dueDate}</span>
                    </td>
                    <td className="px-4 py-3 align-middle" data-label="Status">
                      <span className={`inline-flex items-center gap-1.5 text-[0.6rem] sm:text-[0.65rem] font-bold px-2 sm:px-2.5 py-1 rounded-full border ${stColors[st] || ""}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${stDot[st] || ""}`} />
                        {stLabel}
                        {st === "borrowed" && t.renewCount > 0 && (
                          <span className="ml-0.5 opacity-70">×{t.renewCount}</span>
                        )}
                      </span>
                      {st === "returned" && (
                        <span className="block text-[0.55rem] sm:text-[0.6rem] text-t4 mt-0.5">{t.returnDate}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-middle" data-label="">
                      {t.returnDate ? (
                        <span className="inline-flex items-center gap-1.5 text-[0.6rem] sm:text-[0.65rem] text-t3">
                          <i aria-hidden="true" className="fa-solid fa-check-circle text-g text-xs" />
                          Completed
                        </span>
                      ) : (
                        <div className="flex gap-1 items-center justify-end sm:justify-start">
                          <BtnIcon onClick={() => handleReturn(t.id)} aria-label="Return book">
                            <i aria-hidden="true" className="fa-solid fa-rotate-left" />
                          </BtnIcon>
                          <BtnIcon onClick={() => handleRenew(t.id)} aria-label="Renew loan">
                            <i aria-hidden="true" className="fa-solid fa-arrow-rotate-right" />
                          </BtnIcon>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6}>
                  <div className="text-center py-12 sm:py-[60px] text-t3">
                    <i aria-hidden="true" className="fa-solid fa-book text-[1.6rem] sm:text-[2.4rem] opacity-[0.12] block mb-3" />
                    <p className="text-sm sm:text-[0.88rem] font-medium">No borrowing records</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination total={filtered.total} page={filtered.page} maxPage={filtered.maxPage} onPageChange={handlePageChange} label="records" />

      {/* New Loan Modal */}
      <Modal
        isOpen={borrowModal}
        onClose={() => setBorrowModal(false)}
        title={
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-cg flex items-center justify-center text-c text-xs">
              <i aria-hidden="true" className="fa-solid fa-plus" />
            </div>
            New Loan
          </div>
        }
        footer={
          <>
            <BtnGhost onClick={() => setBorrowModal(false)}>Cancel</BtnGhost>
            <BtnPrimary onClick={handleBorrow}>Confirm Loan</BtnPrimary>
          </>
        }
      >
        <div className="flex flex-col gap-[5px] mb-4">
          <label className="text-[0.7rem] font-bold uppercase tracking-widest text-t3">Book</label>
          <select
            value={borrowForm.book}
            onChange={(e) => setBorrowForm((p) => ({ ...p, book: e.target.value }))}
            className="input"
          >
            <option value="">Select a book…</option>
            {available.length ? (
              available.map((b) => {
                const out = state.transactions.filter(
                  (t) => t.bookTitle === b.title && !t.returnDate,
                ).length;
                return (
                  <option key={b.id} value={b.title}>
                    {b.title} — {out}/{b.qty} out
                  </option>
                );
              })
            ) : (
              <option value="" disabled>No books available</option>
            )}
          </select>
        </div>
        <div className="flex flex-col gap-[5px] mb-4">
          <label className="text-[0.7rem] font-bold uppercase tracking-widest text-t3">Member</label>
          <select
            value={borrowForm.member}
            onChange={(e) => setBorrowForm((p) => ({ ...p, member: e.target.value }))}
            className="input"
          >
            <option value="">Select a member…</option>
            {state.members.length ? (
              state.members.map((m) => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))
            ) : (
              <option value="" disabled>No members registered</option>
            )}
          </select>
        </div>
        {borrowErr && (
          <div className="text-[0.72rem] text-r font-semibold flex items-center gap-[5px] mt-0.5 bg-rg px-3 py-2 rounded-md">
            <i aria-hidden="true" className="fa-solid fa-circle-exclamation" />
            {borrowErr}
          </div>
        )}
      </Modal>
    </div>
  );
}
