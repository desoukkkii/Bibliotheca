import { useState, useMemo, useCallback } from "react";
import { useStore } from "../lib/store";
import { useToast } from "../hooks/useToast";
import { applySort, paginate } from "../lib/utils";
import type { Book, ViewState } from "../types";
import BookCard from "../components/BookCard";
import Pagination from "../components/Pagination";
import SearchBox from "../components/SearchBox";
import { BtnPrimary, BtnGhost, BtnDanger } from "../components/UI";
import Modal from "../components/Modal";

export default function Books() {
  const { state, dispatch, nextId } = useStore();
  const { addToast } = useToast();

  const [vs, setVS] = useState<ViewState>({ search: "", filter: "", page: 1, sort: { col: "", dir: "" } });

  const [modal, setModal] = useState<{ open: boolean; book?: Book }>({ open: false });
  const [confirmDel, setConfirmDel] = useState<{ open: boolean; book?: Book }>({ open: false });

  const [form, setForm] = useState({ title: "", author: "", year: "2025", isbn: "", genre: "", qty: "1" });
  const [formErr, setFormErr] = useState("");

  const genres = useMemo(() => [...new Set(state.books.map((b) => b.genre))].sort(), [state.books]);

  const filtered = useMemo(() => {
    let items = state.books.filter((b) => {
      const s = vs.search.toLowerCase();
      if (s && !b.title.toLowerCase().includes(s) && !b.author.toLowerCase().includes(s) && !b.isbn.includes(s))
        return false;
      if (vs.filter && b.genre !== vs.filter) return false;
      return true;
    });
    items = applySort(items, vs.sort);
    return paginate(items, vs.page);
  }, [state.books, vs]);

  const openAdd = useCallback(() => {
    setForm({ title: "", author: "", year: "2025", isbn: "", genre: genres[0] || "", qty: "1" });
    setFormErr("");
    setModal({ open: true });
  }, [genres]);

  const openEdit = useCallback((book: Book) => {
    setForm({ title: book.title, author: book.author, year: String(book.year), isbn: book.isbn, genre: book.genre, qty: String(book.qty) });
    setFormErr("");
    setModal({ open: true, book });
  }, []);

  const handleSave = useCallback(() => {
    const title = form.title.trim();
    const author = form.author.trim();
    const year = parseInt(form.year, 10);
    const isbn = form.isbn.trim();
    const genre = form.genre;
    const qty = parseInt(form.qty, 10);

    if (!title) { setFormErr("Title is required"); return; }
    if (!author) { setFormErr("Author is required"); return; }
    if (!isbn) { setFormErr("ISBN is required"); return; }
    if (isNaN(year) || year < 1800 || year > 2099) { setFormErr("Invalid year (1800–2099)"); return; }
    if (isNaN(qty) || qty < 1) { setFormErr("Quantity must be at least 1"); return; }

    if (modal.book) {
      dispatch({ type: "UPDATE_BOOK", payload: { ...modal.book, title, author, year, isbn, genre, qty } });
      addToast("Book updated", "s");
    } else {
      dispatch({ type: "ADD_BOOK", payload: { id: nextId(), title, author, year, isbn, genre, qty } });
      addToast("Book added", "s");
    }
    setModal({ open: false });
  }, [form, modal.book, dispatch, nextId, addToast]);

  const openDel = useCallback((book: Book) => setConfirmDel({ open: true, book }), []);

  const handleDelete = useCallback(() => {
    if (confirmDel.book) {
      dispatch({ type: "DELETE_BOOK", payload: confirmDel.book.id });
      addToast("Book deleted", "s");
    }
    setConfirmDel({ open: false });
  }, [confirmDel.book, dispatch, addToast]);

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

  return (
    <div className="pt-1">
      {/* Header */}
      <div className="flex items-start sm:items-end justify-between flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-7">
        <div>
          <div className="flex items-center gap-2.5 mb-0.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-pg flex items-center justify-center text-p shrink-0">
              <i aria-hidden="true" className="fa-solid fa-book text-xs sm:text-sm" />
            </div>
            <h1 className="text-xl sm:text-[1.45rem] font-extrabold font-heading tracking-tight text-text leading-tight">Books</h1>
          </div>
          <p className="text-xs sm:text-[0.83rem] text-t3 ml-10 sm:ml-[45px]">{state.books.length} total titles</p>
        </div>
        <BtnPrimary onClick={openAdd}><i aria-hidden="true" className="fa-solid fa-plus" /> Add Book</BtnPrimary>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-3 mb-4 sm:mb-6">
        <SearchBox
          value={vs.search}
          onChange={(v) => setVS((prev) => ({ ...prev, search: v, page: 1 }))}
          placeholder="Search by title, author, or ISBN…"
          label="Search books"
        />
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none -mx-1 px-1">
          <button
            onClick={() => setVS((prev) => ({ ...prev, filter: "", page: 1 }))}
            className={`shrink-0 px-3 py-[7px] rounded-md text-[0.72rem] sm:text-[0.75rem] font-semibold transition-all duration-[0.15s] border ${
              !vs.filter ? "bg-pg text-p border-p-border" : "bg-surface text-t2 border-border hover:bg-s3 hover:text-text"
            }`}
          >
            All
          </button>
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setVS((prev) => ({ ...prev, filter: prev.filter === g ? "" : g, page: 1 }))}
              className={`shrink-0 px-3 py-[7px] rounded-md text-[0.72rem] sm:text-[0.75rem] font-semibold transition-all duration-[0.15s] border ${
                vs.filter === g ? "bg-pg text-p border-p-border" : "bg-surface text-t2 border-border hover:bg-s3 hover:text-text"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Books Grid */}
      {filtered.items.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filtered.items.map((b) => (
            <BookCard key={b.id} book={b} onEdit={openEdit} onDelete={openDel} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl py-12 sm:py-16 text-center shadow-xs">
          <i aria-hidden="true" className="fa-solid fa-book-open text-[2rem] sm:text-[2.8rem] opacity-[0.12] block mb-3" />
          <p className="text-sm sm:text-[0.9rem] text-t2 font-medium">No books found</p>
          <p className="text-xs sm:text-[0.78rem] text-t3 mt-1">
            {vs.search ? "Try a different search term" : "Click 'Add Book' to get started"}
          </p>
        </div>
      )}

      <Pagination total={filtered.total} page={filtered.page} maxPage={filtered.maxPage} onPageChange={handlePageChange} label="books" />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false })}
        title={
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-pg flex items-center justify-center text-p text-xs">
              <i aria-hidden="true" className={`fa-solid ${modal.book ? "fa-pen" : "fa-plus"}`} />
            </div>
            {modal.book ? "Edit Book" : "Add Book"}
          </div>
        }
        footer={
          <>
            <BtnGhost onClick={() => setModal({ open: false })}>Cancel</BtnGhost>
            <BtnPrimary onClick={handleSave}>{modal.book ? "Save Changes" : "Add Book"}</BtnPrimary>
          </>
        }
      >
        <div className="flex flex-col gap-3.5 mb-3.5">
          <label className="text-[0.7rem] font-bold uppercase tracking-widest text-t3">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="Book title"
            className="input"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mb-0.5">
          <div className="flex-1 flex flex-col gap-[5px] mb-3.5">
            <label className="text-[0.7rem] font-bold uppercase tracking-widest text-t3">Author</label>
            <input
              type="text"
              value={form.author}
              onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))}
              placeholder="Author name"
              className="input"
            />
          </div>
          <div className="flex-1 flex flex-col gap-[5px] mb-3.5">
            <label className="text-[0.7rem] font-bold uppercase tracking-widest text-t3">Year</label>
            <input
              type="number"
              value={form.year}
              onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))}
              min={1800}
              max={2099}
              className="input"
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mb-0.5">
          <div className="flex-1 flex flex-col gap-[5px] mb-3.5">
            <label className="text-[0.7rem] font-bold uppercase tracking-widest text-t3">ISBN</label>
            <input
              type="text"
              value={form.isbn}
              onChange={(e) => setForm((p) => ({ ...p, isbn: e.target.value }))}
              placeholder="ISBN"
              className="input"
            />
          </div>
          <div className="flex-1 flex flex-col gap-[5px] mb-3.5">
            <label className="text-[0.7rem] font-bold uppercase tracking-widest text-t3">Genre</label>
            <select
              value={form.genre}
              onChange={(e) => setForm((p) => ({ ...p, genre: e.target.value }))}
              className="input"
            >
              {genres.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-[5px] mb-3.5">
          <label className="text-[0.7rem] font-bold uppercase tracking-widest text-t3">Quantity</label>
          <input
            type="number"
            value={form.qty}
            onChange={(e) => setForm((p) => ({ ...p, qty: e.target.value }))}
            min={1}
            max={999}
            className="input"
          />
        </div>
        {formErr && (
          <div className="text-[0.72rem] text-r font-semibold flex items-center gap-[5px] mt-0.5 bg-rg px-3 py-2 rounded-md">
            <i aria-hidden="true" className="fa-solid fa-circle-exclamation" />
            {formErr}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={confirmDel.open}
        onClose={() => setConfirmDel({ open: false })}
        title={
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-rg flex items-center justify-center text-r text-xs">
              <i aria-hidden="true" className="fa-solid fa-trash" />
            </div>
            Confirm Delete
          </div>
        }
        size="slim"
        footer={
          <>
            <BtnGhost onClick={() => setConfirmDel({ open: false })}>Cancel</BtnGhost>
            <BtnDanger onClick={handleDelete}>Delete</BtnDanger>
          </>
        }
      >
        <p className="text-sm sm:text-[0.85rem] text-t2 leading-relaxed">
          Delete <strong className="text-text">"{confirmDel.book?.title || "this book"}"</strong>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
