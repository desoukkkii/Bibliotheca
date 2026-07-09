import type { View } from "../types";

export interface NavItem {
  view: View;
  icon: string;
  label: string;
}

export const NAV_ITEMS: NavItem[] = [
  { view: "dashboard", icon: "fa-chart-pie", label: "Dashboard" },
  { view: "books", icon: "fa-book", label: "Books" },
  { view: "members", icon: "fa-users", label: "Members" },
  { view: "borrowing", icon: "fa-hand-holding-heart", label: "Borrowing" },
  { view: "overdue", icon: "fa-clock", label: "Overdue" },
];

export const AVATAR_COLORS = [
  "from-p to-p-light", "from-g to-g-light", "from-c to-c-light",
  "from-a to-a-light", "from-v to-purple-400", "from-rose-400 to-pink-400",
] as const;
