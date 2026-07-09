# Bibliotheca — Library Management System

A modern, feature-rich library management system built with **React 19 + TypeScript + Tailwind CSS + Vite**.

## Features

- **Dashboard** — Overview with live stat counters, genre distribution chart, and recent activity log
- **Books** — Browse, search, filter by genre, sort, and manage (add/edit/delete) book inventory
- **Members** — Searchable member registry with sortable table columns and CRUD operations
- **Borrowing** — Issue and track book loans, filter active/returned, renew loans (up to 4 renewals)
- **Overdue** — Identify overdue items, calculate late fees (KSH 50/day), and process returns
- **Export** — Download book inventory as CSV
- **Persistence** — All data saved to browser's localStorage
- **Keyboard shortcut** — Press `/` to quickly focus the search bar
- **Responsive** — Adapts from desktop to mobile with sidebar navigation

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 3 |
| Build | Vite 6 |
| Icons | Font Awesome 6 |
| Fonts | Inter, Plus Jakarta Sans |
| State | React Context + useReducer |
| Persistence | localStorage |

## Getting Started

```bash
npm install
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
├── components/     # Reusable UI components
│   ├── BookCard.tsx
│   ├── Modal.tsx
│   ├── Pagination.tsx
│   ├── SearchBox.tsx
│   ├── Sidebar.tsx
│   ├── SortableTh.tsx
│   └── UI.tsx       # Button components (Primary, Ghost, Danger, Icon, Success)
├── hooks/          # Custom React hooks
│   ├── useCounter.tsx
│   └── useToast.tsx
├── lib/            # Core logic
│   ├── store.tsx    # Global state (Context + Reducer)
│   ├── utils.ts     # Helpers (sort, paginate, format)
│   ├── seed.ts      # Seed/mock data
│   └── nav.ts       # Shared navigation constants
├── views/          # Page-level views
│   ├── Dashboard.tsx
│   ├── Books.tsx
│   ├── Members.tsx
│   ├── Borrowing.tsx
│   └── Overdue.tsx
├── App.tsx         # Root app component
├── main.tsx        # Entry point
├── types.ts        # TypeScript interfaces
└── index.css       # Tailwind directives + overrides
```

## License

MIT
