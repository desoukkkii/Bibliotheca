interface SortableThProps {
  col: string;
  label: string;
  currentCol: string;
  currentDir: "" | "asc" | "dsc";
  onSort: (col: string) => void;
}

export default function SortableTh({ col, label, currentCol, currentDir, onSort }: SortableThProps) {
  const isActive = currentCol === col;
  const cls = isActive ? currentDir : "";
  const ariaSort = isActive && currentDir ? (currentDir === "asc" ? "ascending" : "descending") : "none";

  return (
    <th
      className={`st cursor-pointer select-none transition-colors duration-[0.15s] hover:text-text ${cls}`}
      data-col={col}
      aria-sort={ariaSort}
      onClick={() => onSort(col)}
    >
      <span className="inline-flex items-center gap-1 py-1">
        {label}
        <span className="inline-block w-3 text-[0.58rem] opacity-25 si">
          <i aria-hidden="true" className="fa-solid fa-sort" />
        </span>
      </span>
    </th>
  );
}
