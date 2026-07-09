export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  genre: string;
  qty: number;
  year: number;
}

export interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  joined: string;
}

export interface Transaction {
  id: number;
  bookTitle: string;
  memberName: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  renewCount: number;
}

export interface StoreState {
  books: Book[];
  members: Member[];
  transactions: Transaction[];
}

export type View = "dashboard" | "books" | "members" | "borrowing" | "overdue";

export type SortDir = "" | "asc" | "dsc";

export interface SortState {
  col: string;
  dir: SortDir;
}

export interface ViewState {
  search: string;
  filter: string;
  page: number;
  sort: SortState;
}

export type ToastType = "info" | "s" | "e" | "w";

export interface ToastItem {
  id: number;
  msg: string;
  type: ToastType;
}
