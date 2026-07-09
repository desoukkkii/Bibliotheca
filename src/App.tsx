import { useState, useCallback, useEffect, type FC } from "react";
import { useStore } from "./lib/store";
import { ToastProvider, useToast } from "./hooks/useToast";
import { today, overdueCount, activeBorrows } from "./lib/utils";
import { NAV_ITEMS } from "./lib/nav";
import type { View } from "./types";
import Sidebar from "./components/Sidebar";
import Dashboard from "./views/Dashboard";
import Books from "./views/Books";
import Members from "./views/Members";
import Borrowing from "./views/Borrowing";
import Overdue from "./views/Overdue";

const VIEWS: Record<View, FC> = {
  dashboard: Dashboard,
  books: Books,
  members: Members,
  borrowing: Borrowing,
  overdue: Overdue,
};

const FOCUSABLE = new Set(["INPUT", "SELECT", "TEXTAREA"]);

function AppContent() {
  const { state } = useStore();
  const { addToast } = useToast();
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNavigate = useCallback((view: View) => {
    setActiveView(view);
    setSidebarOpen(false);
  }, []);

  const handleExport = useCallback(() => {
    const rows = [["ID", "Title", "Author", "ISBN", "Genre", "Year", "Quantity"]];
    state.books.forEach((b) =>
      rows.push([String(b.id), b.title, b.author, b.isbn, b.genre, String(b.year), String(b.qty)]),
    );
    const csv = rows
      .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `bibliotheca_books_${today()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
    addToast("Books exported as CSV", "s");
  }, [state.books, addToast]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "/" || FOCUSABLE.has((e.target as HTMLElement).tagName)) return;
      e.preventDefault();
      const input = document.querySelector<HTMLInputElement>(
        `#view-${activeView} input[type="search"]`,
      );
      input?.focus();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [activeView]);

  const ActiveViewComponent = VIEWS[activeView];
  const overdue = overdueCount(state.transactions);
  const activeLoans = activeBorrows(state.transactions);

  return (
    <div className="min-h-screen bg-bg text-text font-sans">
      <a
        href="#content"
        className="fixed top-3 left-3 z-[9999] px-4 py-2 bg-p text-white text-[0.82rem] font-semibold rounded-sm no-underline -translate-y-[100px] focus:translate-y-0 transition-transform duration-[0.22s]"
      >
        Skip to main content
      </a>

      {/* Top header bar (mobile) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white/95 backdrop-blur-md border-b border-border flex items-center justify-between px-4 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-t2 hover:bg-s3 hover:text-text transition-all duration-[0.15s] active:scale-95"
            aria-label="Open menu"
          >
            <i aria-hidden="true" className="fa-solid fa-bars text-lg" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-p to-p-light flex items-center justify-center text-white text-[0.6rem] shadow-xs">
              <i aria-hidden="true" className="fa-solid fa-book-open-reader" />
            </div>
            <span className="font-heading font-extrabold text-text text-base leading-none">Bibliotheca</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleExport}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-t2 hover:bg-s3 hover:text-text transition-all duration-[0.15s] active:scale-95"
            aria-label="Export CSV"
          >
            <i aria-hidden="true" className="fa-solid fa-download text-sm" />
          </button>
        </div>
      </div>

      {/* Mobile drawer overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-bg-fade" />
        </div>
      )}

      {/* Mobile drawer */}
      <div className={`fixed top-0 left-0 bottom-0 w-[280px] z-50 bg-white shadow-xl transform transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="h-14 flex items-center justify-between px-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-p to-p-light flex items-center justify-center text-white text-sm shadow-sm">
              <i aria-hidden="true" className="fa-solid fa-book-open-reader" />
            </div>
            <span className="font-heading text-lg font-extrabold text-text">Bibliotheca</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-t3 hover:bg-s3 hover:text-text transition-all"
            aria-label="Close menu"
          >
            <i aria-hidden="true" className="fa-solid fa-xmark text-lg" />
          </button>
        </div>
        <div className="p-3 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => handleNavigate(item.view)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-[0.15s] ${
                  isActive ? "bg-pg text-p font-semibold" : "text-t2 hover:bg-s3 hover:text-text"
                }`}
              >
                <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm shrink-0 ${
                  isActive ? "bg-white shadow-xs text-p" : "text-t3"
                }`}>
                  <i aria-hidden="true" className={`fa-solid ${item.icon}`} />
                </span>
                <span className="flex-1 text-left">{item.label}</span>
                {item.view === "overdue" && overdue > 0 && (
                  <span className="bg-r text-white text-[0.6rem] font-bold min-w-[22px] h-[22px] flex items-center justify-center rounded-full px-1.5">
                    {overdue}
                  </span>
                )}
                {item.view === "borrowing" && activeLoans > 0 && (
                  <span className="bg-ag text-a text-[0.6rem] font-bold min-w-[22px] h-[22px] flex items-center justify-center rounded-full px-1.5">
                    {activeLoans}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="absolute bottom-4 left-3 right-3 p-3 rounded-xl bg-s2 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-p to-p-light flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-xs">
              A
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-text truncate">Admin</div>
              <div className="text-xs text-t3 truncate">admin@bibliotheca.app</div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block fixed top-0 left-0 bottom-0 z-30">
        <Sidebar activeView={activeView} onNavigate={handleNavigate} onExport={handleExport} />
      </div>

      {/* Main content */}
      <main
        id="content"
        tabIndex={-1}
        className="min-h-screen lg:ml-[240px] pt-14 lg:pt-6 px-4 sm:px-6 lg:px-8 xl:px-10 pb-24 lg:pb-8"
      >
        <div className="max-w-[1400px] mx-auto">
          <div id={`view-${activeView}`} key={activeView} className="animate-fade-slide">
            <ActiveViewComponent />
          </div>
        </div>
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-[68px] pb-[calc(env(safe-area-inset-bottom,0px)+4px)] bg-white/95 backdrop-blur-lg border-t border-border z-30 flex items-start justify-around px-1 pt-1 shadow-[0_-2px_20px_rgba(0,0,0,0.06)]">
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setActiveView(item.view)}
              className={`relative flex flex-col items-center gap-0.5 pt-1.5 pb-1 px-3 rounded-xl min-w-0 flex-1 transition-all duration-[0.15s] active:scale-95 ${
                isActive ? "text-p" : "text-t3"
              }`}
            >
              <span className={`relative text-lg ${isActive ? "scale-110" : ""} transition-transform duration-[0.15s]`}>
                <i aria-hidden="true" className={`fa-solid ${item.icon}`} />
                {item.view === "overdue" && overdue > 0 && (
                  <span className="absolute -top-1 -right-2.5 bg-r text-white text-[0.5rem] font-bold min-w-[16px] h-[16px] flex items-center justify-center rounded-full px-1 animate-badge-pop ring-2 ring-white">
                    {overdue > 9 ? "9+" : overdue}
                  </span>
                )}
              </span>
              <span className="text-[0.6rem] font-semibold leading-tight">{item.label}</span>
              {isActive && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-p" />}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
