export const PER_PAGE = 10;

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function overdueCount(transactions: { returnDate: string | null; dueDate: string }[]) {
  const now = new Date();
  return transactions.filter((t) => !t.returnDate && new Date(t.dueDate) < now).length;
}

export function activeBorrows(transactions: { returnDate: string | null }[]) {
  return transactions.filter((t) => !t.returnDate).length;
}

function sorter<T>(arr: T[], col: keyof T, dir: "asc" | "dsc"): T[] {
  return [...arr].sort((a, b) => {
    const va = a[col] ?? "";
    const vb = b[col] ?? "";
    if (typeof va === "number" && typeof vb === "number") {
      return dir === "asc" ? (va as number) - (vb as number) : (vb as number) - (va as number);
    }
    return dir === "asc"
      ? String(va).toLowerCase().localeCompare(String(vb).toLowerCase())
      : String(vb).toLowerCase().localeCompare(String(va).toLowerCase());
  });
}

export function applySort<T>(items: T[], sort: { col: string; dir: "" | "asc" | "dsc" }) {
  if (!sort.col || !sort.dir) return items;
  return sorter(items, sort.col as keyof T, sort.dir);
}

export function paginate<T>(items: T[], page: number, perPage: number = PER_PAGE) {
  const total = items.length;
  const maxPage = Math.max(1, Math.ceil(total / perPage));
  const p = Math.min(Math.max(1, page), maxPage);
  const start = (p - 1) * perPage;
  return { page: p, maxPage, total, items: items.slice(start, start + perPage) };
}

export const GENRES = [
  "English", "Literature", "Science", "Mathematics",
  "History", "Technology", "Art", "Philosophy",
] as const;

export const COVER_GRADIENTS: Record<string, string> = {
  c0: "from-indigo-100 to-indigo-300",
  c1: "from-pink-100 to-pink-300",
  c2: "from-cyan-100 to-teal-300",
  c3: "from-amber-100 to-yellow-300",
  c4: "from-emerald-100 to-emerald-300",
  c5: "from-fuchsia-100 to-purple-300",
  c6: "from-blue-100 to-blue-300",
  c7: "from-orange-100 to-orange-300",
};
