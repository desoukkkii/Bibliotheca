import type { View } from "../types";
import { useStore } from "../lib/store";
import { overdueCount, activeBorrows } from "../lib/utils";

interface SidebarProps {
  activeView: View;
  onNavigate: (view: View) => void;
  onExport: () => void;
}

const NAV_ITEMS: { view: View; icon: string; label: string }[] = [
  { view: "dashboard", icon: "fa-chart-pie", label: "Dashboard" },
  { view: "books", icon: "fa-book", label: "Books" },
  { view: "members", icon: "fa-users", label: "Members" },
  { view: "borrowing", icon: "fa-hand-holding-heart", label: "Borrowing" },
  { view: "overdue", icon: "fa-clock", label: "Overdue" },
];

export default function Sidebar({ activeView, onNavigate, onExport }: SidebarProps) {
  const { state } = useStore();
  const overdue = overdueCount(state.transactions);

  return (
    <aside className="w-[240px] h-full bg-white/95 backdrop-blur-xl border-r border-p/10 flex flex-col shadow-sm">
      {/* Brand */}
      <div className="h-[64px] flex items-center gap-3 px-5 border-b border-p/10 shrink-0 bg-gradient-to-r from-p/[0.03] to-transparent">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-p to-p-light flex items-center justify-center text-white text-sm shadow-sm ring-1 ring-p/20">
          <i aria-hidden="true" className="fa-solid fa-book-open-reader" />
        </div>
        <div>
          <span className="font-heading text-[1.05rem] font-extrabold text-text tracking-tight block leading-tight">Quantio</span>
          <span className="text-[0.6rem] text-t3 uppercase tracking-widest font-semibold">Library Manager</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-3 overflow-y-auto">
        <div className="text-[0.6rem] font-bold uppercase tracking-widest text-t3 px-3 pb-2 pt-1">Main Menu</div>
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className={`w-full flex items-center gap-3 px-3 py-[10px] rounded-md text-[0.85rem] font-medium transition-all duration-[0.18s] mb-0.5 ${
                isActive
                  ? "bg-pg text-p font-semibold shadow-sm"
                  : "text-t2 hover:bg-s3 hover:text-text"
              }`}
            >
              <span className={`w-8 h-8 rounded-md flex items-center justify-center text-sm shrink-0 ${
                isActive ? "bg-white shadow-xs text-p" : "text-t3"
              }`}>
                <i aria-hidden="true" className={`fa-solid ${item.icon} ${isActive ? "text-p" : ""}`} />
              </span>
              <span className="flex-1 text-left">{item.label}</span>
              {item.view === "overdue" && overdue > 0 && (
                <span className="bg-r text-white text-[0.6rem] font-bold px-[6px] py-px rounded-full min-w-[20px] text-center leading-[1.6] animate-badge-pop">
                  {overdue}
                </span>
              )}
              {item.view === "borrowing" && (() => {
                const a = activeBorrows(state.transactions);
                return a > 0 ? (
                  <span className="bg-a/10 text-a text-[0.6rem] font-bold px-[6px] py-px rounded-full min-w-[20px] text-center leading-[1.6]">
                    {a}
                  </span>
                ) : null;
              })()}
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-p/10 p-3">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-md bg-s2 mb-1.5 ring-1 ring-border/50">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-p to-p-light flex items-center justify-center text-white text-[0.7rem] font-bold shrink-0 shadow-xs ring-1 ring-p/20">
            A
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[0.78rem] font-semibold text-text truncate">Admin</div>
            <div className="text-[0.62rem] text-t3 truncate">admin@quantio.io</div>
          </div>
        </div>
        <button
          onClick={onExport}
          className="w-full flex items-center gap-2.5 px-3 py-[9px] rounded-md text-[0.8rem] font-medium text-t2 hover:bg-s3 hover:text-text transition-all duration-[0.15s]"
        >
          <span className="w-8 h-8 rounded-md flex items-center justify-center text-sm text-t3 shrink-0">
            <i aria-hidden="true" className="fa-solid fa-download" />
          </span>
          Export CSV
        </button>
      </div>
    </aside>
  );
}
