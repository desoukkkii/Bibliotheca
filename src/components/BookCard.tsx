import type { Book } from "../types";
import { COVER_GRADIENTS } from "../lib/utils";
import { useStore } from "../lib/store";
import { BtnIcon, BtnIconDanger } from "./UI";

interface BookCardProps {
  book: Book;
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
}

const GENRE_ICONS: Record<string, string> = {
  English: "fa-language", Literature: "fa-feather", Science: "fa-flask",
  Mathematics: "fa-calculator", History: "fa-landmark", Technology: "fa-microchip",
  Art: "fa-palette", Philosophy: "fa-brain",
};

const GENRE_COLORS: Record<string, string> = {
  English: "from-pink-400 to-rose-400", Literature: "from-purple-400 to-fuchsia-400",
  Science: "from-cyan-400 to-teal-400", Mathematics: "from-blue-400 to-indigo-400",
  History: "from-amber-400 to-orange-400", Technology: "from-emerald-400 to-teal-400",
  Art: "from-fuchsia-400 to-pink-400", Philosophy: "from-violet-400 to-purple-400",
};

export default function BookCard({ book, onEdit, onDelete }: BookCardProps) {
  const { state } = useStore();
  const gradient = COVER_GRADIENTS[`c${book.id % 8}`] || "from-indigo-100 to-indigo-300";
  const genreIcon = GENRE_ICONS[book.genre] || "fa-book";
  const iconColor = `bg-gradient-to-br ${GENRE_COLORS[book.genre] || "from-indigo-400 to-purple-400"}`;

  const out = state.transactions.filter(
    (t) => t.bookTitle === book.title && !t.returnDate,
  ).length;
  const avail = book.qty - out;
  const statusCls = avail > 0 ? "ok" : "no";
  const statusLbl = avail > 0 ? `${avail} available` : "Out of stock";

  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden transition-all duration-[0.25s] flex flex-col shadow-xs hover:shadow-md active:scale-[0.99] sm:hover:-translate-y-[3px] sm:hover:border-bh group">
      {/* Cover */}
      <div className={`h-[110px] sm:h-[120px] flex items-center justify-center relative overflow-hidden bg-gradient-to-br ${gradient}`}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${iconColor} flex items-center justify-center text-white text-lg sm:text-xl shadow-lg relative z-[1] transition-transform duration-[0.3s] group-hover:scale-110 group-hover:-rotate-3`}>
          <i aria-hidden="true" className={`fa-solid ${genreIcon}`} />
        </div>
        <span className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm text-[0.5rem] sm:text-[0.55rem] font-bold px-1.5 sm:px-2 py-0.5 rounded-full text-t2 border border-white/50 shadow-xs z-[1]">
          {book.isbn.slice(-4)}
        </span>
      </div>

      {/* Content */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col gap-1.5">
        <h3 className="text-sm sm:text-[0.9rem] font-bold leading-tight font-heading tracking-tight text-text group-hover:text-p transition-colors duration-[0.2s]">
          {book.title}
        </h3>
        <p className="text-xs sm:text-[0.78rem] text-t3 flex items-center gap-1.5">
          <i aria-hidden="true" className="fa-solid fa-feather-pointed text-[0.55rem] sm:text-[0.6rem] text-t4" />
          {book.author}
        </p>
        <div className="flex items-center gap-2 flex-wrap mt-1.5">
          <span className="inline-flex items-center gap-1 text-[0.6rem] sm:text-[0.62rem] font-semibold px-2 py-0.5 rounded-full bg-s3 text-t2 border border-border">
            <i aria-hidden="true" className="fa-solid fa-calendar text-[0.5rem] sm:text-[0.55rem]" />
            {book.year}
          </span>
          <span className="inline-flex items-center gap-1 text-[0.6rem] sm:text-[0.62rem] font-semibold px-2 py-0.5 rounded-full bg-s3 text-t2 border border-border">
            <i aria-hidden="true" className="fa-solid fa-tag text-[0.5rem] sm:text-[0.55rem]" />
            {book.genre}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 border-t border-border flex items-center justify-between bg-s2/80">
        <span
          className={`inline-flex items-center gap-1.5 text-[0.6rem] sm:text-[0.65rem] font-bold px-2 sm:px-2.5 py-1 rounded-full border ${
            statusCls === "ok"
              ? "bg-gg text-g border-g-border"
              : "bg-rg text-r border-r-border"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${statusCls === "ok" ? "bg-g" : "bg-r"}`} />
          {statusLbl}
        </span>
        <div className="flex gap-0.5 items-center">
          <BtnIcon onClick={() => onEdit(book)} aria-label={`Edit ${book.title}`}>
            <i aria-hidden="true" className="fa-solid fa-pen" />
          </BtnIcon>
          <BtnIconDanger onClick={() => onDelete(book)} aria-label={`Delete ${book.title}`}>
            <i aria-hidden="true" className="fa-solid fa-trash" />
          </BtnIconDanger>
        </div>
      </div>
    </div>
  );
}
