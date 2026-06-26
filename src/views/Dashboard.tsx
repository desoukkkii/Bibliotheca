import { useState, useEffect, useMemo } from "react";
import { useStore } from "../lib/store";
import { overdueCount, activeBorrows } from "../lib/utils";
import { useCounter } from "../hooks/useCounter";

const COLORS = {
  indigo: { bg: "bg-pg", text: "text-p", light: "from-p/10 to-transparent", gradient: "from-p to-p-light" },
  emerald: { bg: "bg-gg", text: "text-g", light: "from-g/10 to-transparent", gradient: "from-g to-g-light" },
  cyan: { bg: "bg-cg", text: "text-c", light: "from-c/10 to-transparent", gradient: "from-c to-c-light" },
  amber: { bg: "bg-ag", text: "text-a", light: "from-a/10 to-transparent", gradient: "from-a to-a-light" },
  rose: { bg: "bg-rg", text: "text-r", light: "from-r/10 to-transparent", gradient: "from-r to-r-light" },
};

export default function Dashboard() {
  const { state } = useStore();
  const [chartAnimate, setChartAnimate] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setChartAnimate(true), 200);
    return () => clearTimeout(t);
  }, []);

  const borrowed = activeBorrows(state.transactions);
  const overdue = overdueCount(state.transactions);
  const bookCount = useCounter(state.books.length);
  const memberCount = useCounter(state.members.length);
  const borrowCount = useCounter(borrowed);
  const overdueCountVal = useCounter(overdue);

  const revenue = useMemo(() => {
    return state.transactions.filter(t => t.returnDate).reduce((sum, t) => {
      const due = new Date(t.dueDate);
      const ret = new Date(t.returnDate!);
      return sum + Math.max(0, Math.floor((ret.getTime() - due.getTime()) / 86400000)) * 50;
    }, 0);
  }, [state.transactions]);

  const returnRate = useMemo(() => {
    if (!state.transactions.length) return 0;
    const returned = state.transactions.filter(t => t.returnDate).length;
    return Math.round((returned / state.transactions.length) * 100);
  }, [state.transactions]);

  const activeMembers = useMemo(() => {
    const active = new Set(state.transactions.filter(t => !t.returnDate).map(t => t.memberName));
    return active.size;
  }, [state.transactions]);

  const genreMap = useMemo(() => {
    const m: Record<string, number> = {};
    state.books.forEach(b => { m[b.genre] = (m[b.genre] || 0) + 1; });
    return m;
  }, [state.books]);
  const genres = Object.keys(genreMap).sort((a, b) => genreMap[b] - genreMap[a]);
  const maxG = Math.max(...Object.values(genreMap), 1);

  const genreGradients = [
    "from-p to-p-light", "from-v to-purple-400", "from-cyan-400 to-teal-400",
    "from-amber-400 to-orange-400", "from-emerald-400 to-teal-400",
    "from-pink-400 to-rose-400", "from-blue-400 to-indigo-400", "from-fuchsia-400 to-pink-400",
  ];

  const dueSoon = useMemo(() => {
    const now = new Date();
    const threeDays = new Date(now);
    threeDays.setDate(threeDays.getDate() + 3);
    return state.transactions.filter(t => !t.returnDate && new Date(t.dueDate) >= now && new Date(t.dueDate) <= threeDays);
  }, [state.transactions]);

  const recentReturns = useMemo(() => {
    return state.transactions.filter(t => t.returnDate).slice(-5).reverse();
  }, [state.transactions]);

  const popularBooks = useMemo(() => {
    const count: Record<string, number> = {};
    state.transactions.forEach(t => { count[t.bookTitle] = (count[t.bookTitle] || 0) + 1; });
    return Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [state.transactions]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-start sm:items-end justify-between flex-col sm:flex-row gap-2 sm:gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2.5 mb-0.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-pg flex items-center justify-center text-p shrink-0">
              <i aria-hidden="true" className="fa-solid fa-chart-pie text-xs sm:text-sm" />
            </div>
            <h1 className="text-xl sm:text-[1.45rem] font-extrabold font-heading tracking-tight text-text leading-tight">Dashboard</h1>
          </div>
          <p className="text-xs sm:text-[0.83rem] text-t3 ml-10 sm:ml-[45px]">Library overview &amp; analytics</p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[0.7rem] text-t3 bg-white border border-border rounded-lg px-3 py-1.5 sm:py-2 shadow-xs shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-g animate-pulse" />
          {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
        </span>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {[
          { label: "Total Books", value: bookCount, sub: `${state.books.length} titles`, icon: "fa-book", color: "indigo" },
          { label: "Members", value: memberCount, sub: `${state.members.length} registered`, icon: "fa-users", color: "emerald" },
          { label: "Active Loans", value: borrowCount, sub: `${borrowed} currently out`, icon: "fa-hand-holding-heart", color: "cyan" },
          { label: "Overdue", value: overdueCountVal, sub: `${overdue} need attention`, icon: "fa-clock", color: "amber" },
          { label: "Revenue", value: `KSH ${revenue.toLocaleString()}`, sub: `${returnRate}% return rate`, icon: "fa-coins", color: "rose", plain: true },
        ].map((s) => (
          <div key={s.label} className="relative bg-white border border-border rounded-xl p-3.5 sm:p-5 transition-all duration-[0.25s] hover:shadow-lg hover:-translate-y-0.5 sm:hover:-translate-y-[3px] hover:border-bh overflow-hidden group">
            <div className={`absolute inset-0 bg-gradient-to-br ${COLORS[s.color as keyof typeof COLORS].light} opacity-0 group-hover:opacity-100 transition-opacity duration-[0.3s]`} />
            <div className="relative z-[1]">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-xs sm:text-sm mb-2 sm:mb-3.5 shadow-xs ${COLORS[s.color as keyof typeof COLORS].bg}`}>
                <i aria-hidden="true" className={`fa-solid ${s.icon} ${COLORS[s.color as keyof typeof COLORS].text}`} />
              </div>
              <div className="text-xl sm:text-[1.65rem] font-extrabold leading-none font-heading tracking-tight text-text tabular-nums">{s.value}</div>
              <div className="text-[0.7rem] sm:text-[0.73rem] font-semibold text-t2 mt-1 sm:mt-1.5">{s.label}</div>
              <div className="text-[0.6rem] sm:text-[0.66rem] text-t4 mt-0.5">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Genre Distribution */}
        <div className="lg:col-span-2 bg-white border border-border rounded-xl p-4 sm:p-6 shadow-xs transition-all duration-[0.25s] hover:shadow-md hover:border-bh">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-pg flex items-center justify-center text-p text-xs sm:text-sm">
                <i aria-hidden="true" className="fa-solid fa-chart-simple" />
              </div>
              <div>
                <h3 className="text-sm sm:text-[0.85rem] font-bold text-text font-heading">Genre Distribution</h3>
                <p className="text-[0.65rem] sm:text-[0.68rem] text-t3">{state.books.length} books · {genres.length} genres</p>
              </div>
            </div>
            {chartAnimate && (
              <span className="text-[0.65rem] text-t3 bg-s3 px-2 py-1 rounded-md border border-border hidden sm:inline-flex items-center gap-1">
                <i aria-hidden="true" className="fa-solid fa-rotate text-[0.55rem]" />
                Updated
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 sm:gap-y-3.5">
            {genres.length ? genres.map((g, i) => {
              const pct = Math.round((genreMap[g] / maxG) * 100);
              return (
                <div key={g}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-sm bg-gradient-to-br ${genreGradients[i % genreGradients.length]}`} />
                      <span className="text-[0.7rem] sm:text-[0.75rem] font-semibold text-t2">{g}</span>
                    </div>
                    <span className="text-[0.7rem] sm:text-[0.75rem] font-bold text-text tabular-nums">{genreMap[g]}</span>
                  </div>
                  <div className="h-2 sm:h-2.5 bg-s3 rounded-full overflow-hidden relative">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-p to-p-light transition-all duration-[0.8s] cubic-bezier(0.22,0.61,0.36,1)"
                      style={{ width: chartAnimate ? `${pct}%` : "0%" }}
                    />
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-2 text-center py-8 text-t3">
                <i aria-hidden="true" className="fa-solid fa-chart-simple text-[1.5rem] opacity-20 block mb-2" />
                <p className="text-sm">No books yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4 sm:space-y-5">
          {/* Library Summary */}
          <div className="bg-white border border-border rounded-xl p-4 sm:p-6 shadow-xs transition-all duration-[0.25s] hover:shadow-md hover:border-bh">
            <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gg flex items-center justify-center text-g text-xs sm:text-sm">
                <i aria-hidden="true" className="fa-solid fa-circle-info" />
              </div>
              <div>
                <h3 className="text-sm sm:text-[0.85rem] font-bold text-text font-heading">Library Summary</h3>
              </div>
            </div>
            <div className="space-y-3 sm:space-y-3.5">
              {[
                { label: "Active Members", value: activeMembers, total: state.members.length, color: "text-g" },
                { label: "Return Rate", value: `${returnRate}%`, total: `${state.transactions.length} total`, color: "text-p" },
                { label: "Avg per Member", value: state.members.length ? (state.transactions.length / state.members.length).toFixed(1) : "0", total: "transactions", color: "text-c" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-1.5 sm:py-2 border-b border-border last:border-none">
                  <span className="text-xs sm:text-[0.78rem] text-t2">{item.label}</span>
                  <div className="text-right">
                    <span className={`text-sm sm:text-[0.9rem] font-extrabold tabular-nums ${item.color}`}>{item.value}</span>
                    <span className="text-[0.55rem] sm:text-[0.6rem] text-t4 ml-1">/ {item.total}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Due Soon */}
          <div className="bg-white border border-border rounded-xl p-4 sm:p-6 shadow-xs transition-all duration-[0.25s] hover:shadow-md hover:border-bh">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-ag flex items-center justify-center text-a text-xs sm:text-sm">
                  <i aria-hidden="true" className="fa-solid fa-bell" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-[0.85rem] font-bold text-text font-heading">Due Soon</h3>
                  <p className="text-[0.65rem] sm:text-[0.68rem] text-t3">Next 3 days</p>
                </div>
              </div>
              {dueSoon.length > 0 && (
                <span className="bg-ag text-a text-[0.6rem] sm:text-[0.65rem] font-bold px-2 py-0.5 rounded-full border border-a-border">
                  {dueSoon.length}
                </span>
              )}
            </div>
            {dueSoon.length ? (
              <div className="space-y-1.5 sm:space-y-2">
                {dueSoon.slice(0, 4).map((t) => (
                  <div key={t.id} className="flex items-center gap-2.5 py-2 px-2.5 rounded-lg hover:bg-s2 transition-all duration-[0.15s] -mx-2.5">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-ag flex items-center justify-center text-a text-[0.55rem] sm:text-[0.6rem] shrink-0">
                      <i aria-hidden="true" className="fa-solid fa-book" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-[0.75rem] font-semibold text-text truncate">{t.bookTitle}</div>
                      <div className="text-[0.6rem] sm:text-[0.65rem] text-t3">{t.memberName}</div>
                    </div>
                    <span className="text-[0.6rem] sm:text-[0.65rem] font-semibold text-a tabular-nums shrink-0">{t.dueDate.slice(5)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 sm:py-6 text-t3">
                <i aria-hidden="true" className="fa-solid fa-check-circle text-g text-lg sm:text-xl block mb-1.5" />
                <p className="text-xs sm:text-[0.78rem]">No items due soon</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Popular Books */}
        <div className="bg-white border border-border rounded-xl p-4 sm:p-6 shadow-xs transition-all duration-[0.25s] hover:shadow-md hover:border-bh">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-cg flex items-center justify-center text-c text-xs sm:text-sm">
              <i aria-hidden="true" className="fa-solid fa-trophy" />
            </div>
            <div>
              <h3 className="text-sm sm:text-[0.85rem] font-bold text-text font-heading">Most Borrowed Books</h3>
              <p className="text-[0.65rem] sm:text-[0.68rem] text-t3">Top 5 most circulated titles</p>
            </div>
          </div>
          {popularBooks.length ? (
            <div className="space-y-2.5 sm:space-y-3">
              {popularBooks.map(([title, count], i) => (
                <div key={title} className="flex items-center gap-3 py-1.5 sm:py-2 border-b border-border last:border-none">
                  <span className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-[0.6rem] sm:text-[0.65rem] font-bold shrink-0 ${
                    i === 0 ? "bg-amber-100 text-amber-700" :
                    i === 1 ? "bg-slate-100 text-slate-600" :
                    i === 2 ? "bg-orange-100 text-orange-700" :
                    "bg-s3 text-t2"
                  }`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-[0.78rem] font-semibold text-text truncate">{title}</div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[0.6rem] sm:text-[0.68rem] font-bold text-p tabular-nums">
                    <i aria-hidden="true" className="fa-solid fa-arrow-up text-[0.5rem] sm:text-[0.55rem]" />
                    {count}x
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8 text-t3">
              <i aria-hidden="true" className="fa-solid fa-book text-[1.4rem] sm:text-[1.8rem] opacity-20 block mb-2" />
              <p className="text-sm sm:text-[0.85rem]">No borrowing data yet</p>
            </div>
          )}
        </div>

        {/* Recent Returns */}
        <div className="bg-white border border-border rounded-xl p-4 sm:p-6 shadow-xs transition-all duration-[0.25s] hover:shadow-md hover:border-bh">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gg flex items-center justify-center text-g text-xs sm:text-sm">
              <i aria-hidden="true" className="fa-solid fa-arrows-spin" />
            </div>
            <div>
              <h3 className="text-sm sm:text-[0.85rem] font-bold text-text font-heading">Recent Returns</h3>
              <p className="text-[0.65rem] sm:text-[0.68rem] text-t3">Latest returned books</p>
            </div>
          </div>
          {recentReturns.length ? (
            <div className="space-y-1.5 sm:space-y-2">
              {recentReturns.map((t) => (
                <div key={t.id} className="flex items-center gap-3 py-2 sm:py-2.5 px-2 rounded-lg hover:bg-s2 transition-all duration-[0.15s] -mx-2">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gg flex items-center justify-center text-g text-xs sm:text-xs shrink-0">
                    <i aria-hidden="true" className="fa-solid fa-rotate-left" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-[0.78rem] font-semibold text-text truncate">{t.bookTitle}</div>
                    <div className="text-[0.6rem] sm:text-[0.66rem] text-t3">{t.memberName}</div>
                  </div>
                  <span className="text-[0.6rem] sm:text-[0.65rem] text-t4 tabular-nums shrink-0">
                    {t.returnDate?.slice(5)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8 text-t3">
              <i aria-hidden="true" className="fa-solid fa-clock text-[1.4rem] sm:text-[1.8rem] opacity-20 block mb-2" />
              <p className="text-sm sm:text-[0.85rem]">No returns yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
