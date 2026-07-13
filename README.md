# Bibliotheca

A modern, feature-rich library management system built with React 19, TypeScript, Tailwind CSS, and Vite.

**[Live Demo](https://bibliotheca-one.vercel.app/)**

## Features

- **Dashboard** — Animated stat cards (Total Books, Members, Active Loans, Overdue, Revenue), genre distribution chart, due-soon alerts, most borrowed books, and recent returns
- **Books** — Responsive card grid with gradient covers, genre icons, search (debounced), genre filter chips, pagination, and full CRUD via modal dialogs
- **Members** — Sortable table with avatar, status badges, search, and complete CRUD operations
- **Borrowing** — Issue, return, and renew book loans (14-day loan period, up to 4 renewals), filter by active/returned status
- **Overdue** — Live overdue detection, late fee calculation (KSH 50/day), severity levels (Low / Moderate / High / Critical) with summary bar
- **CSV Export** — Download the full book inventory as a timestamped CSV file
- **Persistence** — All data automatically saved to `localStorage`
- **Accessibility** — Skip-to-content link, `aria-sort` on table headers, `prefers-reduced-motion` support, focus-visible outlines
- **Keyboard Shortcuts** — Press `/` to focus the search bar from anywhere
- **Responsive Design** — Desktop sidebar, mobile drawer, and bottom tab bar; tables convert to stacked cards on small screens

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Language | TypeScript ~5.7 |
| Styling | Tailwind CSS 3 |
| Build | Vite 6 |
| Icons | Font Awesome 6.5 |
| Fonts | Inter, Plus Jakarta Sans |
| State | React Context + useReducer |
| Persistence | localStorage |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open the URL shown in the terminal (default `http://localhost:5173`).

## Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── BookCard.tsx       — Book card with gradient cover & genre icon
│   ├── Modal.tsx          — Portal-based modal (2 sizes, Escape to close)
│   ├── Pagination.tsx     — Page navigation
│   ├── SearchBox.tsx      — Debounced search input
│   ├── Sidebar.tsx        — Desktop sidebar with nav & user profile
│   ├── SortableTh.tsx     — Clickable sortable table header
│   └── UI.tsx             — Button primitives (Primary, Ghost, Danger, Icon, Success)
├── hooks/             # Custom React hooks
│   ├── useCounter.tsx     — Animated number counter (rAF + easing)
│   └── useToast.tsx       — Toast notification system (4 types, auto-dismiss)
├── lib/               # Core logic
│   ├── store.tsx          — Global state (Context + Reducer, 9 action types)
│   ├── utils.ts           — Helpers (sort, paginate, overdue detection, genres)
│   ├── seed.ts            — Seed data (24 books, 12 members, 30 transactions)
│   └── nav.ts             — Navigation items & avatar colors
├── views/             # Page-level views
│   ├── Dashboard.tsx      — Stats, charts, activity panels
│   ├── Books.tsx          — Book grid with search, filters, CRUD
│   ├── Members.tsx        — Member table with search, sort, CRUD
│   ├── Borrowing.tsx      — Loan management with filters
│   └── Overdue.tsx        — Overdue tracking & fee calculation
├── App.tsx            # Root component (routing, mobile nav, export)
├── main.tsx           # Entry point (StoreProvider > App)
├── types.ts           # TypeScript interfaces
└── index.css          # Tailwind directives + global styles
```

## License

[MIT](LICENSE)
