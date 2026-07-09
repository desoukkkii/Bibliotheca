import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from "react";
import type { Book, Member, Transaction, StoreState } from "../types";
import { SEED_DATA } from "./seed";

const STORAGE_KEY = "bibliotheca_state";

function loadData(): StoreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && "books" in parsed) return parsed;
    }
  } catch {
    /* empty */
  }
  return SEED_DATA;
}

type Action =
  | { type: "ADD_BOOK"; payload: Book }
  | { type: "UPDATE_BOOK"; payload: Book }
  | { type: "DELETE_BOOK"; payload: number }
  | { type: "ADD_MEMBER"; payload: Member }
  | { type: "UPDATE_MEMBER"; payload: Member }
  | { type: "DELETE_MEMBER"; payload: number }
  | { type: "ADD_TRANSACTION"; payload: Transaction }
  | { type: "RETURN_BOOK"; payload: { id: number; returnDate: string } }
  | { type: "RENEW_BOOK"; payload: { id: number; dueDate: string; renewCount: number } };

function reducer(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    case "ADD_BOOK":
      return { ...state, books: [...state.books, action.payload] };
    case "UPDATE_BOOK":
      return { ...state, books: state.books.map((b) => (b.id === action.payload.id ? action.payload : b)) };
    case "DELETE_BOOK":
      return { ...state, books: state.books.filter((b) => b.id !== action.payload) };
    case "ADD_MEMBER":
      return { ...state, members: [...state.members, action.payload] };
    case "UPDATE_MEMBER":
      return { ...state, members: state.members.map((m) => (m.id === action.payload.id ? action.payload : m)) };
    case "DELETE_MEMBER":
      return { ...state, members: state.members.filter((m) => m.id !== action.payload) };
    case "ADD_TRANSACTION":
      return { ...state, transactions: [...state.transactions, action.payload] };
    case "RETURN_BOOK":
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.payload.id ? { ...t, returnDate: action.payload.returnDate } : t,
        ),
      };
    case "RENEW_BOOK":
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.payload.id
            ? { ...t, dueDate: action.payload.dueDate, renewCount: action.payload.renewCount }
            : t,
        ),
      };
    default:
      return state;
  }
}

interface StoreContextValue {
  state: StoreState;
  dispatch: React.Dispatch<Action>;
  nextId: () => number;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadData);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const nextId = useCallback(() => {
    const ids = [...state.books, ...state.members, ...state.transactions].map((x) => x.id);
    return ids.length ? Math.max(...ids) + 1 : 1;
  }, [state.books, state.members, state.transactions]);

  return (
    <StoreContext.Provider value={{ state, dispatch, nextId }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
