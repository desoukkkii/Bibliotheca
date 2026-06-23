/* ============================================================
   QUANTIO — Library Management System
   Production-ready, clean, modular JavaScript
   ============================================================ */

(function () {
  "use strict";

  // ──────────────────────────────────────────────
  // DATA LAYER
  // ──────────────────────────────────────────────

  const STORAGE_KEY = "q";
  const GENRES = [
    "English",
    "Literature",
    "Science",
    "Mathematics",
    "History",
    "Technology",
    "Art",
    "Philosophy",
  ];
  const PER_PAGE = 10;

  function initData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.books) return parsed;
      } catch (_) {
        /* fall through to generate */
      }
    }

    const books = Array.from({ length: 40 }, (_, i) => ({
      id: i + 1,
      title: `Book Title ${i + 1}`,
      author: `Author ${i + 1}`,
      isbn: `978-${String(i + 1).padStart(7, "0")}`,
      genre: GENRES[i % 8],
      qty: Math.floor(Math.random() * 5) + 1,
      year: 2015 + Math.floor(Math.random() * 10),
    }));

    const members = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      name: `Member ${i + 1}`,
      email: `member${i + 1}@mail.com`,
      phone: `0${String(555 + Math.floor(Math.random() * 444)).padStart(10, "0")}`,
      joined: new Date(
        2020 + Math.floor(Math.random() * 5),
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1,
      )
        .toISOString()
        .slice(0, 10),
    }));

    const transactions = Array.from({ length: 30 }, (_, i) => {
      const bk = books[Math.floor(Math.random() * books.length)];
      const mb = members[Math.floor(Math.random() * members.length)];
      const borrow = new Date(
        2024,
        Math.floor(Math.random() * 8),
        Math.floor(Math.random() * 28) + 1,
      );
      const due = new Date(borrow);
      due.setDate(due.getDate() + 14 + Math.floor(Math.random() * 14));
      const returned =
        Math.random() > 0.3
          ? (() => {
              const r = new Date(due);
              r.setDate(r.getDate() + Math.floor(Math.random() * 5) - 2);
              return r.toISOString().slice(0, 10);
            })()
          : null;
      return {
        id: i + 1,
        bookTitle: bk.title,
        memberName: mb.name,
        borrowDate: borrow.toISOString().slice(0, 10),
        dueDate: due.toISOString().slice(0, 10),
        returnDate: returned,
        renewCount: Math.floor(Math.random() * 2),
      };
    });

    const db = { books, members, transactions };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    return db;
  }

  let db = initData();

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }

  function nextId() {
    const ids = [...db.books, ...db.members, ...db.transactions].map(
      (x) => x.id,
    );
    return ids.length ? Math.max(...ids) + 1 : 1;
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  // ──────────────────────────────────────────────
  // STATE
  // ──────────────────────────────────────────────

  let currentView = "dashboard";
  const pages = { books: 1, members: 1, borrowing: 1, overdue: 1 };
  const sorts = {
    books: { col: "", dir: "" },
    members: { col: "", dir: "" },
    borrowing: { col: "", dir: "" },
    overdue: { col: "", dir: "" },
  };
  let counterStarted = false;

  // ──────────────────────────────────────────────
  // DOM HELPERS
  // ──────────────────────────────────────────────

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);
  const viewEl = (v) => document.getElementById("view-" + v);

  function esc(e) {
    e && e.preventDefault();
    const root = $("#modal-root");
    root.hidden = true;
    root.removeAttribute("class");
    document.body.classList.remove("mo");
    $("#modal-bg").onclick = null;
  }

  function openModal(size) {
    const root = $("#modal-root");
    root.hidden = false;
    $("#modal-bx").className = "modal-bx" + (size ? " " + size : "");
    document.body.classList.add("mo");
    $("#modal-bg").onclick = esc;
  }

  function genreTag(name) {
    return name ? `<span class="genre">${escHtml(name)}</span>` : "";
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ──────────────────────────────────────────────
  // TOAST
  // ──────────────────────────────────────────────

  function toast(msg, type) {
    const pool = $("#toast-pool");
    const el = document.createElement("div");
    const icon =
      {
        info: "circle-info",
        s: "circle-check",
        e: "circle-exclamation",
        w: "triangle-exclamation",
      }[type] || "circle-info";
    el.className = `toast ${type}`;
    el.innerHTML = `<i class="fa-solid fa-${icon}" aria-hidden="true"></i>${escHtml(msg)}`;
    pool.appendChild(el);
    setTimeout(() => {
      el.style.animation = "toastOut 0.25s ease forwards";
      setTimeout(() => el.remove(), 260);
    }, 3000);
  }

  // ──────────────────────────────────────────────
  // SORTER
  // ──────────────────────────────────────────────

  function sorter(arr, col, dir) {
    return [...arr].sort((a, b) => {
      const va = a[col] ?? "";
      const vb = b[col] ?? "";
      if (typeof va === "number" && typeof vb === "number") {
        return dir === "asc" ? va - vb : vb - va;
      }
      return dir === "asc"
        ? String(va).toLowerCase().localeCompare(String(vb).toLowerCase())
        : String(vb).toLowerCase().localeCompare(String(va).toLowerCase());
    });
  }

  function applySort(items, view) {
    const s = sorts[view];
    return s.col ? sorter(items, s.col, s.dir) : items;
  }

  // ──────────────────────────────────────────────
  // PAGINATION
  // ──────────────────────────────────────────────

  function paginate(items, page) {
    const total = items.length;
    const maxPage = Math.max(1, Math.ceil(total / PER_PAGE));
    const p = Math.min(Math.max(1, page), maxPage);
    const start = (p - 1) * PER_PAGE;
    return {
      page: p,
      maxPage,
      total,
      items: items.slice(start, start + PER_PAGE),
    };
  }

  function renderPagination(total, page, maxPage, view) {
    if (total <= PER_PAGE) return "";
    const start = Math.max(1, Math.min(page - 2, maxPage - 4));
    const end = Math.min(maxPage, start + 4);
    let btns = "";
    for (let i = start; i <= end; i++) {
      btns += `<button data-p="${i}"${i === page ? ' class="on" aria-current="page"' : ""}>${i}</button>`;
    }
    return `<nav class="pgr" aria-label="Pagination">
      <button data-p="${page - 1}"${page <= 1 ? " disabled" : ""} aria-label="Previous page"><i class="fa-solid fa-chevron-left" aria-hidden="true"></i></button>
      ${btns}
      <button data-p="${page + 1}"${page >= maxPage ? " disabled" : ""} aria-label="Next page"><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button>
      <span class="info">Page ${page} of ${maxPage}</span>
    </nav>`;
  }

  // ──────────────────────────────────────────────
  // OVERDUE HELPERS
  // ──────────────────────────────────────────────

  function overdueCount() {
    const now = new Date();
    return db.transactions.filter(
      (t) => !t.returnDate && new Date(t.dueDate) < now,
    ).length;
  }

  function activeBorrows() {
    return db.transactions.filter((t) => !t.returnDate).length;
  }

  function calcLateFee(dueDate) {
    const days = Math.floor((new Date() - new Date(dueDate)) / 86400000);
    return days > 0 ? days * 50 : 0;
  }

  // ──────────────────────────────────────────────
  // COUNTER ANIMATION
  // ──────────────────────────────────────────────

  function runCounters(view) {
    if (counterStarted) return;
    counterStarted = true;
    const els = view.querySelectorAll(".counter");
    if (!els.length) return;
    let frame = 0;
    function tick() {
      frame++;
      let done = true;
      els.forEach((el) => {
        const target = parseInt(el.dataset.n, 10);
        const cur = parseInt(el.textContent, 10) || 0;
        if (cur === target) return;
        done = false;
        const val = Math.round(cur + (target - cur) * 0.15);
        el.textContent = Math.abs(target - val) < 1 ? target : val;
      });
      if (!done && frame < 80) requestAnimationFrame(tick);
      else
        els.forEach((el) => {
          el.textContent = el.dataset.n;
        });
    }
    requestAnimationFrame(tick);
  }

  // ──────────────────────────────────────────────
  // NAVIGATION
  // ──────────────────────────────────────────────

  function navView(v) {
    Object.values(sorts).forEach((s) => {
      s.col = "";
      s.dir = "";
    });
    counterStarted = false;
    currentView = v;
    $$(".tb-btn").forEach((btn) => {
      const active = btn.dataset.view === v;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", active);
    });
    $$(".view").forEach((el) =>
      el.classList.toggle("active", el.id === "view-" + v),
    );
    render(v);
  }

  // ──────────────────────────────────────────────
  // COLUMN SORTING
  // ──────────────────────────────────────────────

  function handleColClick(e) {
    const th = e.target.closest("th.st");
    if (!th) return;
    const col = th.dataset.col;
    const vn = e.currentTarget.id.replace("view-", "");
    if (!sorts[vn]) return;
    const s = sorts[vn];
    s.dir = s.col === col && s.dir === "asc" ? "dsc" : "asc";
    s.col = col;
    render(vn);
  }

  function handlePageClick(e) {
    const btn = e.target.closest(".pgr button");
    if (!btn) return;
    const p = parseInt(btn.dataset.p, 10);
    if (!isNaN(p) && p >= 1) {
      pages[currentView] = p;
      render(currentView);
    }
  }

  // ──────────────────────────────────────────────
  // RENDER DISPATCHER
  // ──────────────────────────────────────────────

  function render(vn) {
    const view = viewEl(vn);
    if (!view) return;
    view.innerHTML = "";
    counterStarted = false;
    const renders = {
      dashboard: renderDashboard,
      books: renderBooks,
      members: renderMembers,
      borrowing: renderBorrowing,
      overdue: renderOverdue,
    };
    if (renders[vn]) renders[vn](view);
  }

  // ──────────────────────────────────────────────
  // DASHBOARD
  // ──────────────────────────────────────────────

  function renderDashboard(view) {
    const stats = [
      { icon: "fa-book", cls: "coral", n: db.books.length, label: "Books" },
      {
        icon: "fa-users",
        cls: "green",
        n: db.members.length,
        label: "Members",
      },
      {
        icon: "fa-hand-holding-heart",
        cls: "cyan",
        n: activeBorrows(),
        label: "Borrowed",
      },
      { icon: "fa-clock", cls: "amber", n: overdueCount(), label: "Overdue" },
      { icon: "fa-money-bill-wave", cls: "red", n: "KSH", label: "Revenue" },
    ];

    const statHTML = stats
      .map(
        (s) => `
      <div class="stat">
        <div class="stat-icon ${s.cls}"><i class="fa-solid ${s.icon}" aria-hidden="true"></i></div>
        <div class="stat-body">
          <span class="stat-num">${
            typeof s.n === "number"
              ? `<span class="counter" data-n="${s.n}">0</span>`
              : escHtml(s.n)
          }</span>
          <span class="stat-lbl">${escHtml(s.label)}</span>
        </div>
      </div>`,
      )
      .join("");

    // Genre chart
    const genreMap = {};
    db.books.forEach((b) => {
      genreMap[b.genre] = (genreMap[b.genre] || 0) + 1;
    });
    const genres = Object.keys(genreMap).sort(
      (a, b) => genreMap[b] - genreMap[a],
    );
    const maxG = Math.max(...Object.values(genreMap), 1);

    const chartHTML = genres.length
      ? genres
          .map(
            (g) => `
        <div class="chart-row">
          <span class="chart-lbl">${genreTag(g)}</span>
          <div class="chart-track"><div class="chart-fill" style="width:0%" data-w="${((genreMap[g] / maxG) * 100).toFixed(1)}"></div></div>
          <span class="chart-num">${genreMap[g]}</span>
        </div>`,
          )
          .join("")
      : '<div class="chart-empty">No genres yet</div>';

    // Recent activity
    const recent = db.transactions.slice(-10).reverse();
    const activityHTML = recent.length
      ? recent
          .map(
            (t) => `
        <div class="txn-item">
          <div class="txn-icon"><i class="fa-solid fa-${t.returnDate ? "rotate-left" : "book"}" aria-hidden="true"></i></div>
          <div class="txn-info">
            <div class="txn-title">${escHtml(t.bookTitle)}</div>
            <div class="txn-sub">${escHtml(t.memberName)} · ${t.returnDate ? "returned" : "borrowed"}</div>
          </div>
          <span class="txn-date">${t.borrowDate.slice(5)}</span>
        </div>`,
          )
          .join("")
      : '<div class="txn-empty">No activity yet</div>';

    view.innerHTML = `
      <div class="page-hd">
        <div>
          <h1><i class="fa-solid fa-chart-pie" aria-hidden="true"></i>Dashboard</h1>
          <div class="page-sub">Library overview</div>
        </div>
      </div>
      <div class="stats" id="d-stats">${statHTML}</div>
      <div class="dash-grid">
        <div class="panel">
          <div class="panel-title"><i class="fa-solid fa-chart-simple" aria-hidden="true"></i>Books by Genre</div>
          <div class="chart">${chartHTML}</div>
        </div>
        <div class="panel">
          <div class="panel-title"><i class="fa-solid fa-arrows-spin" aria-hidden="true"></i>Recent Activity</div>
          ${activityHTML}
        </div>
      </div>`;

    requestAnimationFrame(() => {
      runCounters(view);
      view.querySelectorAll(".chart-fill").forEach((el) => {
        el.style.width = el.dataset.w + "%";
      });
    });
  }

  // ──────────────────────────────────────────────
  // BOOKS
  // ──────────────────────────────────────────────

  function renderBooks(view) {
    const searchEl = view.querySelector("#search-books");
    const filterEl = view.querySelector("#filter-books");
    const search = searchEl ? searchEl.value.toLowerCase() : "";
    const genreFilter = filterEl ? filterEl.value : "";

    let items = db.books.filter((b) => {
      if (
        search &&
        !b.title.toLowerCase().includes(search) &&
        !b.author.toLowerCase().includes(search) &&
        !b.isbn.includes(search)
      )
        return false;
      if (genreFilter && b.genre !== genreFilter) return false;
      return true;
    });

    items = applySort(items, "books");
    const {
      page,
      maxPage,
      total,
      items: page_items,
    } = paginate(items, pages.books || 1);
    pages.books = page;

    const genres = [...new Set(db.books.map((b) => b.genre))].sort();

    const cardHTML = page_items.length
      ? page_items
          .map((b) => {
            const ci = b.id % 8;
            const out = db.transactions.filter(
              (t) => t.bookTitle === b.title && !t.returnDate,
            ).length;
            const avail = b.qty - out;
            const statusCls = avail > 0 ? "ok" : "no";
            const statusLbl =
              avail > 0 ? `Available (${avail})` : "Out of stock";
            return `<div class="bcard">
            <div class="bcvr c${ci}" aria-hidden="true"><i class="fa-solid fa-book-bookmark"></i></div>
            <div class="bbd">
              <div class="btl">${escHtml(b.title)}</div>
              <div class="baut">${escHtml(b.author)}</div>
              <div class="bmt">
                <span><i class="fa-solid fa-fingerprint" aria-hidden="true"></i>${escHtml(b.isbn.slice(-6))}</span>
                <span><i class="fa-solid fa-calendar" aria-hidden="true"></i>${b.year}</span>
                ${genreTag(b.genre)}
              </div>
            </div>
            <div class="bft">
              <span class="badge-c ${statusCls}">${statusLbl}</span>
              <div class="arow">
                <button class="btn-icon" data-act="edit-book" data-id="${b.id}" aria-label="Edit ${escHtml(b.title)}"><i class="fa-solid fa-pen" aria-hidden="true"></i></button>
                <button class="btn-icon d" data-act="del-book" data-id="${b.id}" aria-label="Delete ${escHtml(b.title)}"><i class="fa-solid fa-trash" aria-hidden="true"></i></button>
              </div>
            </div>
          </div>`;
          })
          .join("")
      : `<div class="empty" style="grid-column:1/-1"><i class="fa-solid fa-book-open"></i><p>No books found</p></div>`;

    view.innerHTML = `
      <div class="page-hd">
        <div>
          <h1><i class="fa-solid fa-book" aria-hidden="true"></i>Books</h1>
          <div class="page-sub">${db.books.length} total titles</div>
        </div>
        <button class="btn btn-p" data-act="add-book"><i class="fa-solid fa-plus" aria-hidden="true"></i>Add Book</button>
      </div>
      <div class="toolbar">
        <div class="sbox">
          <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
          <input type="search" id="search-books" placeholder="Search by title, author, or ISBN…" value="${escHtml(search)}" aria-label="Search books">
        </div>
        <select class="sel" id="filter-books" aria-label="Filter by genre">
          <option value="">All Genres</option>
          ${genres.map((g) => `<option value="${escHtml(g)}"${genreFilter === g ? " selected" : ""}>${escHtml(g)}</option>`).join("")}
        </select>
      </div>
      <div class="bgrid">${cardHTML}</div>
      ${renderPagination(total, page, maxPage, "books")}`;

    const si = view.querySelector("#search-books");
    if (si) {
      si.focus();
      si.addEventListener(
        "input",
        debounce(() => {
          pages.books = 1;
          render("books");
        }, 300),
      );
    }
    view.querySelector("#filter-books")?.addEventListener("change", () => {
      pages.books = 1;
      render("books");
    });
  }

  // ──────────────────────────────────────────────
  // MEMBERS
  // ──────────────────────────────────────────────

  function renderMembers(view) {
    const searchEl = view.querySelector("#search-members");
    const search = searchEl ? searchEl.value.toLowerCase() : "";

    let items = db.members.filter(
      (m) =>
        !search ||
        m.name.toLowerCase().includes(search) ||
        m.email.toLowerCase().includes(search) ||
        m.phone.includes(search),
    );

    items = applySort(items, "members");
    const {
      page,
      maxPage,
      total,
      items: page_items,
    } = paginate(items, pages.members || 1);
    pages.members = page;

    const rowHTML = page_items.length
      ? page_items
          .map((m) => {
            const borrows = db.transactions.filter(
              (t) => t.memberName === m.name && !t.returnDate,
            ).length;
            return `<tr>
            <td><div class="mcell">
              <span class="mav" aria-hidden="true">${escHtml(m.name[0])}</span>
              <div><strong>${escHtml(m.name)}</strong>${borrows > 0 ? `<div style="font-size:0.72rem;color:var(--a);margin-top:1px">${borrows} active borrow${borrows > 1 ? "s" : ""}</div>` : ""}</div>
            </div></td>
            <td>${escHtml(m.email)}</td>
            <td>${escHtml(m.phone.slice(0, 8))}…</td>
            <td>${escHtml(m.joined)}</td>
            <td><div class="arow">
              <button class="btn-icon" data-act="edit-member" data-id="${m.id}" aria-label="Edit ${escHtml(m.name)}"><i class="fa-solid fa-pen" aria-hidden="true"></i></button>
              <button class="btn-icon d" data-act="del-member" data-id="${m.id}" aria-label="Delete ${escHtml(m.name)}"><i class="fa-solid fa-trash" aria-hidden="true"></i></button>
            </div></td>
          </tr>`;
          })
          .join("")
      : `<tr><td colspan="5"><div class="empty"><i class="fa-solid fa-users-slash"></i><p>No members found</p></div></td></tr>`;

    view.innerHTML = `
      <div class="page-hd">
        <div>
          <h1><i class="fa-solid fa-users" aria-hidden="true"></i>Members</h1>
          <div class="page-sub">${db.members.length} registered</div>
        </div>
        <button class="btn btn-p" data-act="add-member"><i class="fa-solid fa-plus" aria-hidden="true"></i>Add Member</button>
      </div>
      <div class="toolbar">
        <div class="sbox">
          <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
          <input type="search" id="search-members" placeholder="Search by name, email, or phone…" value="${escHtml(search)}" aria-label="Search members">
        </div>
      </div>
      <div class="twrap">
        <table class="dtbl" aria-label="Members table">
          <thead><tr>
            ${sortTh("name", "Member", "members")}
            ${sortTh("email", "Email", "members")}
            ${sortTh("phone", "Phone", "members")}
            ${sortTh("joined", "Joined", "members")}
            <th>Actions</th>
          </tr></thead>
          <tbody>${rowHTML}</tbody>
        </table>
      </div>
      ${renderPagination(total, page, maxPage, "members")}`;

    const si = view.querySelector("#search-members");
    if (si) {
      si.focus();
      si.addEventListener(
        "input",
        debounce(() => {
          pages.members = 1;
          render("members");
        }, 300),
      );
    }
  }

  // ──────────────────────────────────────────────
  // BORROWING
  // ──────────────────────────────────────────────

  function renderBorrowing(view) {
    const searchEl = view.querySelector("#search-borrowing");
    const filterEl = view.querySelector("#filter-borrowing");
    const search = searchEl ? searchEl.value.toLowerCase() : "";
    const filter = filterEl ? filterEl.value : "";
    const now = new Date();

    let items = db.transactions.filter((t) => {
      if (
        search &&
        !t.bookTitle.toLowerCase().includes(search) &&
        !t.memberName.toLowerCase().includes(search)
      )
        return false;
      if (filter === "active" && t.returnDate) return false;
      if (filter === "returned" && !t.returnDate) return false;
      return true;
    });

    items = applySort(items, "borrowing");
    const {
      page,
      maxPage,
      total,
      items: page_items,
    } = paginate(items, pages.borrowing || 1);
    pages.borrowing = page;

    const rowHTML = page_items.length
      ? page_items
          .map((t) => {
            const isOD = !t.returnDate && new Date(t.dueDate) < now;
            const st = t.returnDate
              ? "returned"
              : isOD
                ? "overdue"
                : "borrowed";
            const stIcon =
              st === "returned" ? "check" : isOD ? "exclamation" : "book";
            const stLabel =
              st === "returned"
                ? `Returned ${t.returnDate}`
                : isOD
                  ? "Overdue"
                  : `Borrowed ×${t.renewCount}`;
            const actions = t.returnDate
              ? `<span class="sbadge returned"><i class="fa-solid fa-check" aria-hidden="true"></i>Done</span>`
              : `<div class="arow">
                <button class="btn-icon" data-act="return-book" data-id="${t.id}" title="Return" aria-label="Return book"><i class="fa-solid fa-rotate-left" aria-hidden="true"></i></button>
                <button class="btn-icon" data-act="renew-book" data-id="${t.id}" title="Renew" aria-label="Renew loan"><i class="fa-solid fa-arrow-rotate-right" aria-hidden="true"></i></button>
              </div>`;
            return `<tr class="${isOD ? "orow" : ""}">
            <td><strong>${escHtml(t.bookTitle)}</strong></td>
            <td>${escHtml(t.memberName)}</td>
            <td>${escHtml(t.borrowDate)}</td>
            <td>${escHtml(t.dueDate)}</td>
            <td><span class="sbadge ${st}"><i class="fa-solid fa-${stIcon}" aria-hidden="true"></i>${escHtml(stLabel)}</span></td>
            <td>${actions}</td>
          </tr>`;
          })
          .join("")
      : `<tr><td colspan="6"><div class="empty"><i class="fa-solid fa-book"></i><p>No borrowing records</p></div></td></tr>`;

    view.innerHTML = `
      <div class="page-hd">
        <div>
          <h1><i class="fa-solid fa-hand-holding-heart" aria-hidden="true"></i>Borrowing</h1>
          <div class="page-sub">Manage book loans</div>
        </div>
        <button class="btn btn-p" data-act="borrow-book"><i class="fa-solid fa-plus" aria-hidden="true"></i>New Loan</button>
      </div>
      <div class="toolbar">
        <div class="sbox">
          <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
          <input type="search" id="search-borrowing" placeholder="Search by book or member…" value="${escHtml(search)}" aria-label="Search borrowing records">
        </div>
        <select class="sel" id="filter-borrowing" aria-label="Filter by status">
          <option value="">All</option>
          <option value="active"${filter === "active" ? " selected" : ""}>Active</option>
          <option value="returned"${filter === "returned" ? " selected" : ""}>Returned</option>
        </select>
      </div>
      <div class="twrap">
        <table class="dtbl" aria-label="Borrowing records table">
          <thead><tr>
            ${sortTh("bookTitle", "Book", "borrowing")}
            ${sortTh("memberName", "Member", "borrowing")}
            ${sortTh("borrowDate", "Borrowed", "borrowing")}
            ${sortTh("dueDate", "Due", "borrowing")}
            <th>Status</th>
            <th>Actions</th>
          </tr></thead>
          <tbody>${rowHTML}</tbody>
        </table>
      </div>
      ${renderPagination(total, page, maxPage, "borrowing")}`;

    const si = view.querySelector("#search-borrowing");
    if (si) {
      si.focus();
      si.addEventListener(
        "input",
        debounce(() => {
          pages.borrowing = 1;
          render("borrowing");
        }, 300),
      );
    }
    view.querySelector("#filter-borrowing")?.addEventListener("change", () => {
      pages.borrowing = 1;
      render("borrowing");
    });
  }

  // ──────────────────────────────────────────────
  // OVERDUE
  // ──────────────────────────────────────────────

  function renderOverdue(view) {
    const now = new Date();
    let items = db.transactions.filter(
      (t) => !t.returnDate && new Date(t.dueDate) < now,
    );
    items = applySort(items, "overdue");
    const {
      page,
      maxPage,
      total,
      items: page_items,
    } = paginate(items, pages.overdue || 1);
    pages.overdue = page;

    const rowHTML = items.length
      ? page_items
          .map((t) => {
            const days = Math.floor((now - new Date(t.dueDate)) / 86400000);
            const fee = days * 50;
            return `<tr>
            <td><strong>${escHtml(t.bookTitle)}</strong></td>
            <td>${escHtml(t.memberName)}</td>
            <td>${escHtml(t.dueDate)}</td>
            <td><span style="color:var(--r);font-weight:600">${days} day${days !== 1 ? "s" : ""}</span></td>
            <td><span class="sbadge overdue"><i class="fa-solid fa-coins" aria-hidden="true"></i>KSH ${fee.toLocaleString()}</span></td>
            <td><div class="arow">
              <button class="btn btn-s btn-sm" data-act="return-book" data-id="${t.id}"><i class="fa-solid fa-rotate-left" aria-hidden="true"></i>Return</button>
              <button class="btn-icon" data-act="view-member" data-name="${escHtml(t.memberName)}" title="View member" aria-label="View member ${escHtml(t.memberName)}"><i class="fa-solid fa-eye" aria-hidden="true"></i></button>
            </div></td>
          </tr>`;
          })
          .join("")
      : "";

    const tableHTML = items.length
      ? `<div class="twrap"><table class="dtbl" aria-label="Overdue books table">
          <thead><tr>
            ${sortTh("bookTitle", "Book", "overdue")}
            ${sortTh("memberName", "Member", "overdue")}
            <th>Due Date</th>
            <th>Days Late</th>
            <th>Late Fee</th>
            <th>Actions</th>
          </tr></thead>
          <tbody>${rowHTML}</tbody>
        </table></div>`
      : `<div class="empty">
          <i class="fa-solid fa-circle-check" style="color:var(--g);opacity:0.5;font-size:2.8rem"></i>
          <p>No overdue items — all books are on time!</p>
        </div>`;

    view.innerHTML = `
      <div class="page-hd">
        <div>
          <h1><i class="fa-solid fa-clock" aria-hidden="true"></i>Overdue</h1>
          <div class="page-sub">${items.length} item${items.length !== 1 ? "s" : ""} overdue</div>
        </div>
      </div>
      ${tableHTML}
      ${renderPagination(total, page, maxPage, "overdue")}`;
  }

  // ──────────────────────────────────────────────
  // SORT HEADER HELPER
  // ──────────────────────────────────────────────

  function sortTh(col, label, view) {
    const s = sorts[view];
    const cls = s.col === col ? (s.dir === "asc" ? "asc" : "dsc") : "";
    return `<th class="st ${cls}" data-col="${col}" aria-sort="${cls === "asc" ? "ascending" : cls === "dsc" ? "descending" : "none"}">
      ${escHtml(label)}<span class="si"><i class="fa-solid fa-sort" aria-hidden="true"></i></span>
    </th>`;
  }

  // ──────────────────────────────────────────────
  // MODALS — BOOK FORM
  // ──────────────────────────────────────────────

  function showBookForm(id) {
    const book = id ? db.books.find((b) => b.id === id) : null;
    const genres = [...new Set(db.books.map((b) => b.genre))].sort();
    const genreOpts = genres
      .map(
        (g) =>
          `<option value="${escHtml(g)}"${book && book.genre === g ? " selected" : ""}>${escHtml(g)}</option>`,
      )
      .join("");

    $("#modal-title").textContent = book ? "Edit Book" : "Add Book";
    $("#modal-bd").innerHTML = `
      <input type="hidden" id="f-book-id" value="${book ? book.id : ""}">
      <div class="fgroup"><label for="f-book-title">Title</label><input type="text" id="f-book-title" value="${book ? escHtml(book.title) : ""}" placeholder="Book title" required autocomplete="off"></div>
      <div class="frow">
        <div class="fgroup"><label for="f-book-author">Author</label><input type="text" id="f-book-author" value="${book ? escHtml(book.author) : ""}" placeholder="Author name" required autocomplete="off"></div>
        <div class="fgroup"><label for="f-book-year">Year</label><input type="number" id="f-book-year" value="${book ? book.year : "2025"}" min="1800" max="2099" required></div>
      </div>
      <div class="frow">
        <div class="fgroup"><label for="f-book-isbn">ISBN</label><input type="text" id="f-book-isbn" value="${book ? escHtml(book.isbn) : ""}" placeholder="ISBN" required autocomplete="off"></div>
        <div class="fgroup"><label for="f-book-genre">Genre</label><select id="f-book-genre">${genreOpts}</select></div>
      </div>
      <div class="fgroup"><label for="f-book-qty">Quantity</label><input type="number" id="f-book-qty" value="${book ? book.qty : "1"}" min="1" max="999" required></div>
      <div class="ferr" id="book-form-error" role="alert"></div>`;
    $("#modal-ft").innerHTML = `
      <button class="btn btn-g" data-act="cancel">Cancel</button>
      <button class="btn btn-p" data-act="save-book">${book ? "Save Changes" : "Add Book"}</button>`;
    openModal();
    $("#f-book-title").focus();
  }

  function saveBook() {
    const id = $("#f-book-id").value;
    const title = $("#f-book-title").value.trim();
    const author = $("#f-book-author").value.trim();
    const year = parseInt($("#f-book-year").value, 10);
    const isbn = $("#f-book-isbn").value.trim();
    const genre = $("#f-book-genre").value;
    const qty = parseInt($("#f-book-qty").value, 10);
    const errEl = $("#book-form-error");

    function showErr(msg, focusId) {
      errEl.textContent = msg;
      errEl.className = "ferr s";
      $(focusId)?.focus();
    }

    errEl.className = "ferr";
    if (!title) return showErr("Title is required", "#f-book-title");
    if (!author) return showErr("Author is required", "#f-book-author");
    if (!isbn) return showErr("ISBN is required", "#f-book-isbn");
    if (isNaN(year) || year < 1800 || year > 2099)
      return showErr("Invalid year (1800–2099)", "#f-book-year");
    if (isNaN(qty) || qty < 1)
      return showErr("Quantity must be at least 1", "#f-book-qty");

    if (id) {
      const b = db.books.find((x) => x.id === parseInt(id, 10));
      if (b) Object.assign(b, { title, author, year, isbn, genre, qty });
      toast("Book updated", "s");
    } else {
      db.books.push({ id: nextId(), title, author, year, isbn, genre, qty });
      toast("Book added", "s");
    }
    save();
    esc();
    render(currentView);
  }

  function delBook(id) {
    const idx = db.books.findIndex((b) => b.id === id);
    if (idx > -1) {
      db.books.splice(idx, 1);
      save();
      render(currentView);
      toast("Book deleted", "s");
    }
  }

  // ──────────────────────────────────────────────
  // MODALS — MEMBER FORM
  // ──────────────────────────────────────────────

  function showMemberForm(id) {
    const m = id ? db.members.find((x) => x.id === id) : null;
    $("#modal-title").textContent = m ? "Edit Member" : "Add Member";
    $("#modal-bd").innerHTML = `
      <input type="hidden" id="f-member-id" value="${m ? m.id : ""}">
      <div class="fgroup"><label for="f-member-name">Name</label><input type="text" id="f-member-name" value="${m ? escHtml(m.name) : ""}" placeholder="Full name" required autocomplete="off"></div>
      <div class="frow">
        <div class="fgroup"><label for="f-member-email">Email</label><input type="email" id="f-member-email" value="${m ? escHtml(m.email) : ""}" placeholder="Email" required autocomplete="off"></div>
        <div class="fgroup"><label for="f-member-phone">Phone</label><input type="tel" id="f-member-phone" value="${m ? escHtml(m.phone) : ""}" placeholder="Phone" required autocomplete="off"></div>
      </div>
      <div class="ferr" id="member-form-error" role="alert"></div>`;
    $("#modal-ft").innerHTML = `
      <button class="btn btn-g" data-act="cancel">Cancel</button>
      <button class="btn btn-p" data-act="save-member">${m ? "Save Changes" : "Add Member"}</button>`;
    openModal();
    $("#f-member-name").focus();
  }

  function saveMember() {
    const id = $("#f-member-id").value;
    const name = $("#f-member-name").value.trim();
    const email = $("#f-member-email").value.trim();
    const phone = $("#f-member-phone").value.trim();
    const errEl = $("#member-form-error");

    function showErr(msg, focusId) {
      errEl.textContent = msg;
      errEl.className = "ferr s";
      $(focusId)?.focus();
    }

    errEl.className = "ferr";
    if (!name) return showErr("Name is required", "#f-member-name");
    if (!email) return showErr("Email is required", "#f-member-email");
    if (!phone) return showErr("Phone is required", "#f-member-phone");

    if (id) {
      const m = db.members.find((x) => x.id === parseInt(id, 10));
      if (m) Object.assign(m, { name, email, phone });
      toast("Member updated", "s");
    } else {
      db.members.push({ id: nextId(), name, email, phone, joined: today() });
      toast("Member added", "s");
    }
    save();
    esc();
    render(currentView);
  }

  function delMember(id) {
    const idx = db.members.findIndex((m) => m.id === id);
    if (idx > -1) {
      db.members.splice(idx, 1);
      save();
      render(currentView);
      toast("Member deleted", "s");
    }
  }

  // ──────────────────────────────────────────────
  // MODALS — BORROW FORM
  // ──────────────────────────────────────────────

  function showBorrowForm() {
    const available = db.books.filter((b) => {
      const out = db.transactions.filter(
        (t) => t.bookTitle === b.title && !t.returnDate,
      ).length;
      return b.qty - out > 0;
    });

    const bookOpts = available
      .map((b) => {
        const out = db.transactions.filter(
          (t) => t.bookTitle === b.title && !t.returnDate,
        ).length;
        return `<option value="${escHtml(b.title)}">${escHtml(b.title)} — ${out}/${b.qty} out</option>`;
      })
      .join("");

    const memberOpts = db.members
      .map(
        (m) => `<option value="${escHtml(m.name)}">${escHtml(m.name)}</option>`,
      )
      .join("");

    $("#modal-title").textContent = "New Loan";
    $("#modal-bd").innerHTML = `
      <div class="fgroup"><label for="f-borrow-book">Book</label><select id="f-borrow-book">${bookOpts || '<option value="">No books available</option>'}</select></div>
      <div class="fgroup"><label for="f-borrow-member">Member</label><select id="f-borrow-member">${memberOpts || '<option value="">No members registered</option>'}</select></div>
      <div class="ferr" id="borrow-form-error" role="alert"></div>`;
    $("#modal-ft").innerHTML = `
      <button class="btn btn-g" data-act="cancel">Cancel</button>
      <button class="btn btn-p" data-act="add-borrow">Confirm Loan</button>`;
    openModal();
  }

  function addBorrow() {
    const book = $("#f-borrow-book").value;
    const member = $("#f-borrow-member").value;
    const errEl = $("#borrow-form-error");
    errEl.className = "ferr";

    if (!book) {
      errEl.textContent = "Select a book";
      errEl.className = "ferr s";
      return;
    }
    if (!member) {
      errEl.textContent = "Select a member";
      errEl.className = "ferr s";
      return;
    }

    const bk = db.books.find((b) => b.title === book);
    if (!bk) {
      errEl.textContent = "Book not found";
      errEl.className = "ferr s";
      return;
    }
    const borrowed = db.transactions.filter(
      (t) => t.bookTitle === book && !t.returnDate,
    ).length;
    if (borrowed >= bk.qty) {
      errEl.textContent = "No copies available";
      errEl.className = "ferr s";
      return;
    }

    const due = new Date();
    due.setDate(due.getDate() + 14);
    db.transactions.push({
      id: nextId(),
      bookTitle: book,
      memberName: member,
      borrowDate: today(),
      dueDate: due.toISOString().slice(0, 10),
      returnDate: null,
      renewCount: 0,
    });
    save();
    esc();
    render(currentView);
    toast(`Loan created: ${book}`, "s");
  }

  // ──────────────────────────────────────────────
  // RETURN / RENEW
  // ──────────────────────────────────────────────

  function returnBook(id) {
    const txn = db.transactions.find((t) => t.id === id);
    if (!txn) {
      toast("Transaction not found", "e");
      return;
    }
    txn.returnDate = today();
    save();
    render(currentView);
    toast(`Returned: ${txn.bookTitle}`, "s");
  }

  function renewBook(id) {
    const txn = db.transactions.find((t) => t.id === id);
    if (!txn) {
      toast("Transaction not found", "e");
      return;
    }
    if (txn.renewCount >= 4) {
      toast("Maximum renewals reached", "w");
      return;
    }
    txn.renewCount = (txn.renewCount || 0) + 1;
    const due = new Date(txn.dueDate);
    due.setDate(due.getDate() + 14);
    txn.dueDate = due.toISOString().slice(0, 10);
    save();
    render(currentView);
    toast(`Renewed: ${txn.bookTitle}`, "s");
  }

  // ──────────────────────────────────────────────
  // CONFIRM DELETE
  // ──────────────────────────────────────────────

  function confirmDel(msg, cb) {
    $("#modal-title").textContent = "Confirm Delete";
    $("#modal-bd").innerHTML =
      `<p style="font-size:0.88rem;color:var(--t2);line-height:1.6">${escHtml(msg)}</p>`;
    $("#modal-ft").innerHTML = `
      <button class="btn btn-g" data-act="cancel">Cancel</button>
      <button class="btn btn-d" data-act="confirm" data-cb="${escHtml(cb)}">Delete</button>`;
    openModal("slim");
  }

  // ──────────────────────────────────────────────
  // EXPORT CSV
  // ──────────────────────────────────────────────

  function exportCSV() {
    const rows = [
      ["ID", "Title", "Author", "ISBN", "Genre", "Year", "Quantity"],
    ];
    db.books.forEach((b) =>
      rows.push([b.id, b.title, b.author, b.isbn, b.genre, b.year, b.qty]),
    );
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `quantio_books_${today()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
    toast("Books exported as CSV", "s");
  }

  // ──────────────────────────────────────────────
  // DEBOUNCE
  // ──────────────────────────────────────────────

  function debounce(fn, ms) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  }

  // ──────────────────────────────────────────────
  // EVENT DELEGATION
  // ──────────────────────────────────────────────

  function handleAction(act, btn) {
    const id = parseInt(btn.dataset.id, 10);
    switch (act) {
      case "add-book":
        showBookForm();
        break;
      case "edit-book":
        showBookForm(id);
        break;
      case "del-book":
        confirmDel(
          `Delete "${db.books.find((b) => b.id === id)?.title || "this book"}"? This cannot be undone.`,
          `delBook(${id})`,
        );
        break;
      case "add-member":
        showMemberForm();
        break;
      case "edit-member":
        showMemberForm(id);
        break;
      case "del-member":
        confirmDel(
          `Delete "${db.members.find((m) => m.id === id)?.name || "this member"}"? This cannot be undone.`,
          `delMember(${id})`,
        );
        break;
      case "borrow-book":
        showBorrowForm();
        break;
      case "return-book":
        returnBook(id);
        break;
      case "renew-book":
        renewBook(id);
        break;
      case "view-member":
        toast(`Contact: ${btn.dataset.name}`, "info");
        break;
      case "add-borrow":
        addBorrow();
        break;
      case "save-book":
        saveBook();
        break;
      case "save-member":
        saveMember();
        break;
      case "cancel":
        esc();
        break;
      case "confirm": {
        const cb = btn.dataset.cb;
        esc();
        setTimeout(() => {
          // Safe eval: only allow delBook/delMember calls
          const m = cb.match(/^(delBook|delMember)\((\d+)\)$/);
          if (m) {
            if (m[1] === "delBook") delBook(parseInt(m[2], 10));
            if (m[1] === "delMember") delMember(parseInt(m[2], 10));
          }
        }, 200);
        break;
      }
    }
  }

  function contentDelegate(e) {
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    handleAction(btn.dataset.act, btn);
  }

  // ──────────────────────────────────────────────
  // INIT
  // ──────────────────────────────────────────────

  document.addEventListener("DOMContentLoaded", () => {
    navView("dashboard");

    // Nav clicks
    $("#tb-nav").addEventListener("click", (e) => {
      const btn = e.target.closest(".tb-btn");
      if (btn?.dataset.view) navView(btn.dataset.view);
    });

    // Export
    $("#btn-export").addEventListener("click", exportCSV);

    // Modal close
    $("#modal-x").addEventListener("click", esc);
    $("#modal-bg").addEventListener("click", esc);

    // Modal footer delegation
    $("#modal-ft").addEventListener("click", contentDelegate);

    // Content delegation per view
    ["dashboard", "books", "members", "borrowing", "overdue"].forEach((v) => {
      const el = viewEl(v);
      if (!el) return;
      el.addEventListener("click", contentDelegate);
      el.addEventListener("click", handleColClick);
      el.addEventListener("click", handlePageClick);
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        esc();
        return;
      }
      if (
        e.key === "/" &&
        !["INPUT", "SELECT", "TEXTAREA"].includes(e.target.tagName)
      ) {
        e.preventDefault();
        viewEl(currentView)?.querySelector(".sbox input")?.focus();
      }
    });

    // Overdue badge update
    function updateBadge() {
      const badge = $("#badge-overdue");
      const n = overdueCount();
      badge.hidden = n === 0;
      badge.textContent = n > 0 ? n : "";
      badge.setAttribute("aria-label", `${n} overdue items`);
    }
    updateBadge();
    setInterval(updateBadge, 5000);
  });
})();
