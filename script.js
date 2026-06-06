/**
 * BIBLIOTHECA — Library Management System
 * ES6+ Classes: Book, Member, Transaction, LibraryManager
 */

"use strict";

// ============================================================
// UTILITY HELPERS
// ============================================================

/** Format a date string to a readable local format */
function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Get today's date as YYYY-MM-DD */
function todayStr() {
  return new Date().toISOString().split("T")[0];
}

/** Add N days to a date string, return YYYY-MM-DD */
function addDays(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

/** Days between two date strings (positive = date2 is later) */
function daysBetween(date1, date2) {
  const d1 = new Date(date1 + "T00:00:00");
  const d2 = new Date(date2 + "T00:00:00");
  return Math.floor((d2 - d1) / 86400000);
}

/** Generate a short unique ID */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/** Show a toast notification */
function showToast(msg, type = "info", duration = 3200) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const icons = {
    success: "fa-circle-check",
    error: "fa-circle-xmark",
    warning: "fa-triangle-exclamation",
    info: "fa-circle-info",
  };
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}" aria-hidden="true"></i><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = "toastOut 0.3s ease forwards";
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/** Open a modal */
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("open");
}

/** Close a modal */
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("open");
}

/** Get initials from a name */
function initials(name) {
  if (!name || typeof name !== "string") return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/** Escape HTML to prevent XSS */
function esc(str) {
  const d = document.createElement("div");
  d.appendChild(document.createTextNode(str || ""));
  return d.innerHTML;
}

// ============================================================
// DATA CLASSES
// ============================================================

class Book {
  constructor({
    id,
    title,
    author,
    isbn,
    year,
    genre,
    totalCopies,
    availableCopies,
  }) {
    this.id = id || uid();
    this.title = title;
    this.author = author;
    this.isbn = isbn;
    this.year = year;
    this.genre = genre;
    this.totalCopies = parseInt(totalCopies) || 1;
    this.availableCopies =
      availableCopies !== undefined
        ? parseInt(availableCopies)
        : this.totalCopies;
  }
}

class Member {
  constructor({ id, name, memberId, email, phone, membershipDate }) {
    this.id = id || uid();
    this.name = name;
    this.memberId = memberId;
    this.email = email;
    this.phone = phone || "";
    this.membershipDate = membershipDate || todayStr();
  }
}

class Transaction {
  constructor({
    id,
    memberId,
    bookId,
    borrowDate,
    dueDate,
    returnDate,
    status,
    lateFee,
    renewCount,
  }) {
    this.id = id || uid();
    this.memberId = memberId;
    this.bookId = bookId;
    this.borrowDate = borrowDate || todayStr();
    this.dueDate = dueDate || addDays(this.borrowDate, 14);
    this.returnDate = returnDate || null;
    this.status = status || "borrowed"; // 'borrowed' | 'returned' | 'overdue' | 'renewed'
    this.lateFee = lateFee || 0;
    this.renewCount = renewCount || 0;
  }
}

// ============================================================
// LIBRARY MANAGER
// ============================================================

class LibraryManager {
  constructor() {
    this.books = [];
    this.members = [];
    this.transactions = [];
    this._pendingDeleteFn = null;
    this._load();
    if (!this.books.length && !this.members.length) {
      this._loadSampleData();
    }
    this._syncOverdueStatus();
  }

  // -------------------- PERSISTENCE --------------------

  _save() {
    localStorage.setItem("lib_books", JSON.stringify(this.books));
    localStorage.setItem("lib_members", JSON.stringify(this.members));
    localStorage.setItem("lib_transactions", JSON.stringify(this.transactions));
  }

  _load() {
    const b = localStorage.getItem("lib_books");
    const m = localStorage.getItem("lib_members");
    const t = localStorage.getItem("lib_transactions");
    this.books = b ? JSON.parse(b).map((d) => new Book(d)) : [];
    this.members = m ? JSON.parse(m).map((d) => new Member(d)) : [];
    this.transactions = t ? JSON.parse(t).map((d) => new Transaction(d)) : [];
  }

  _loadSampleData() {
    // Sample books
    const sampleBooks = [
      {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        isbn: "978-0-7432-7356-5",
        year: 1925,
        genre: "Fiction",
        totalCopies: 2,
      },
      {
        title: "A Brief History of Time",
        author: "Stephen Hawking",
        isbn: "978-0-553-38016-3",
        year: 1988,
        genre: "Science",
        totalCopies: 1,
      },
      {
        title: "1984",
        author: "George Orwell",
        isbn: "978-0-451-52493-5",
        year: 1949,
        genre: "Fiction",
        totalCopies: 3,
      },
      {
        title: "Sapiens",
        author: "Yuval Noah Harari",
        isbn: "978-0-06-231609-7",
        year: 2011,
        genre: "History",
        totalCopies: 2,
      },
      {
        title: "Clean Code",
        author: "Robert C. Martin",
        isbn: "978-0-13-235088-4",
        year: 2008,
        genre: "Technology",
        totalCopies: 1,
      },
    ];
    // Sample members
    const sampleMembers = [
      {
        name: "John Smith",
        memberId: "M001",
        email: "john@email.com",
        phone: "(555) 123-4567",
        membershipDate: "2024-01-10",
      },
      {
        name: "Sarah Johnson",
        memberId: "M002",
        email: "sarah@email.com",
        phone: "(555) 234-5678",
        membershipDate: "2024-02-14",
      },
      {
        name: "Mike Davis",
        memberId: "M003",
        email: "mike@email.com",
        phone: "(555) 345-6789",
        membershipDate: "2024-03-05",
      },
    ];

    sampleBooks.forEach((d) => this.books.push(new Book(d)));
    sampleMembers.forEach((d) => this.members.push(new Member(d)));
    this._save();
  }

  // -------------------- SYNC OVERDUE --------------------

  _syncOverdueStatus() {
    const today = todayStr();
    let changed = false;
    this.transactions.forEach((t) => {
      if (t.status === "borrowed" || t.status === "renewed") {
        if (t.dueDate < today) {
          t.status = "overdue";
          changed = true;
        }
      }
    });
    if (changed) this._save();
  }

  // -------------------- STATS --------------------

  getStats() {
    const totalCopies = this.books.reduce((s, b) => s + b.totalCopies, 0);
    const availCopies = this.books.reduce((s, b) => s + b.availableCopies, 0);
    const active = this.transactions.filter((t) => t.status !== "returned");
    const overdue = this.transactions.filter((t) => t.status === "overdue");
    return {
      totalBooks: this.books.length,
      totalCopies,
      available: availCopies,
      members: this.members.length,
      borrowed: active.length,
      overdue: overdue.length,
    };
  }

  // -------------------- BOOKS --------------------

  addBook(data) {
    if (
      !data.title ||
      !data.author ||
      !data.isbn ||
      !data.genre ||
      !data.totalCopies
    ) {
      throw new Error("Please fill in all required fields.");
    }
    if (this.books.some((b) => b.isbn === data.isbn)) {
      throw new Error("A book with this ISBN already exists.");
    }
    const book = new Book(data);
    this.books.push(book);
    this._save();
    return book;
  }

  updateBook(id, data) {
    const book = this.books.find((b) => b.id === id);
    if (!book) throw new Error("Book not found.");
    if (this.books.some((b) => b.isbn === data.isbn && b.id !== id)) {
      throw new Error("Another book with this ISBN already exists.");
    }
    const diff = parseInt(data.totalCopies) - book.totalCopies;
    book.title = data.title;
    book.author = data.author;
    book.isbn = data.isbn;
    book.year = data.year;
    book.genre = data.genre;
    book.totalCopies = parseInt(data.totalCopies);
    book.availableCopies = Math.max(0, book.availableCopies + diff);
    this._save();
    return book;
  }

  deleteBook(id) {
    const active = this.transactions.some(
      (t) => t.bookId === id && t.status !== "returned",
    );
    if (active)
      throw new Error("Cannot delete a book that is currently borrowed.");
    this.books = this.books.filter((b) => b.id !== id);
    this._save();
  }

  getBook(id) {
    return this.books.find((b) => b.id === id);
  }

  // -------------------- MEMBERS --------------------

  addMember(data) {
    if (!data.name || !data.memberId || !data.email) {
      throw new Error("Please fill in all required fields.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      throw new Error("Please enter a valid email address.");
    }
    if (this.members.some((m) => m.memberId === data.memberId)) {
      throw new Error("A member with this ID already exists.");
    }
    const member = new Member(data);
    this.members.push(member);
    this._save();
    return member;
  }

  updateMember(id, data) {
    const member = this.members.find((m) => m.id === id);
    if (!member) throw new Error("Member not found.");
    if (this.members.some((m) => m.memberId === data.memberId && m.id !== id)) {
      throw new Error("Another member with this ID already exists.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      throw new Error("Please enter a valid email address.");
    }
    member.name = data.name;
    member.memberId = data.memberId;
    member.email = data.email;
    member.phone = data.phone;
    member.membershipDate = data.membershipDate;
    this._save();
    return member;
  }

  deleteMember(id) {
    const active = this.transactions.some(
      (t) => t.memberId === id && t.status !== "returned",
    );
    if (active)
      throw new Error("Cannot delete a member with active borrowings.");
    this.members = this.members.filter((m) => m.id !== id);
    this._save();
  }

  getMember(id) {
    return this.members.find((m) => m.id === id);
  }

  getMemberByInternalId(id) {
    return this.members.find((m) => m.id === id);
  }

  getMemberBorrowCount(id) {
    return this.transactions.filter(
      (t) => t.memberId === id && t.status !== "returned",
    ).length;
  }

  getMemberHistory(id) {
    return this.transactions
      .filter((t) => t.memberId === id)
      .sort((a, b) => (b.borrowDate > a.borrowDate ? 1 : -1));
  }

  // -------------------- BORROWING --------------------

  borrowBook(memberId, bookId, borrowDate) {
    const book = this.getBook(bookId);
    if (!book) throw new Error("Book not found.");
    if (book.availableCopies < 1)
      throw new Error("No copies available for this book.");
    const member = this.getMemberByInternalId(memberId);
    if (!member) throw new Error("Member not found.");

    const effectiveBorrowDate = borrowDate || todayStr();
    const txn = new Transaction({
      memberId,
      bookId,
      borrowDate: effectiveBorrowDate,
      dueDate: addDays(effectiveBorrowDate, 14),
    });
    book.availableCopies -= 1;
    this.transactions.push(txn);
    this._save();
    return txn;
  }

  returnBook(txnId) {
    const txn = this.transactions.find((t) => t.id === txnId);
    if (!txn) throw new Error("Transaction not found.");
    if (txn.status === "returned")
      throw new Error("This book has already been returned.");

    const today = todayStr();
    txn.returnDate = today;
    txn.status = "returned";

    // Calculate late fee
    const daysLate = daysBetween(txn.dueDate, today);
    txn.lateFee = daysLate > 0 ? parseFloat((daysLate * 0.5).toFixed(2)) : 0;

    const book = this.getBook(txn.bookId);
    if (book)
      book.availableCopies = Math.min(
        book.availableCopies + 1,
        book.totalCopies,
      );
    this._save();
    return txn;
  }

  renewBook(txnId) {
    const txn = this.transactions.find((t) => t.id === txnId);
    if (!txn) throw new Error("Transaction not found.");
    if (txn.status === "returned")
      throw new Error("Cannot renew a returned book.");
    if (txn.renewCount >= 1)
      throw new Error(
        "This book has already been renewed once. Please return it.",
      );

    txn.dueDate = addDays(todayStr(), 14);
    txn.renewCount += 1;
    txn.status = "renewed";
    this._save();
    return txn;
  }

  calcLateFee(txnId) {
    const txn = this.transactions.find((t) => t.id === txnId);
    if (!txn) return 0;
    const today = todayStr();
    const daysLate = daysBetween(txn.dueDate, today);
    return daysLate > 0 ? parseFloat((daysLate * 0.5).toFixed(2)) : 0;
  }

  getActiveTransactions() {
    return this.transactions.filter((t) => t.status !== "returned");
  }

  getOverdueTransactions() {
    return this.transactions.filter((t) => t.status === "overdue");
  }

  // -------------------- GENRE STATS --------------------

  getGenreStats() {
    const map = {};
    this.transactions.forEach((t) => {
      const book = this.getBook(t.bookId);
      if (book) map[book.genre] = (map[book.genre] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }

  // -------------------- EXPORT --------------------

  exportCSV(type) {
    let csv = "";
    if (type === "books") {
      csv = "Title,Author,ISBN,Year,Genre,Total Copies,Available Copies\n";
      this.books.forEach((b) => {
        csv += `"${b.title}","${b.author}","${b.isbn}","${b.year}","${b.genre}","${b.totalCopies}","${b.availableCopies}"\n`;
      });
    } else if (type === "members") {
      csv = "Member ID,Name,Email,Phone,Membership Date\n";
      this.members.forEach((m) => {
        csv += `"${m.memberId}","${m.name}","${m.email}","${m.phone}","${m.membershipDate}"\n`;
      });
    } else if (type === "transactions") {
      csv =
        "Transaction ID,Member,Book,Borrow Date,Due Date,Return Date,Status,Late Fee\n";
      this.transactions.forEach((t) => {
        const mem = this.getMemberByInternalId(t.memberId);
        const bk = this.getBook(t.bookId);
        csv += `"${t.id}","${mem ? mem.name : "Unknown"}","${bk ? bk.title : "Unknown"}","${t.borrowDate}","${t.dueDate}","${t.returnDate || ""}","${t.status}","${t.lateFee}"\n`;
      });
    }
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `library_${type}_${todayStr()}.csv`;
    a.click();
    showToast(
      `${type.charAt(0).toUpperCase() + type.slice(1)} exported successfully!`,
      "success",
    );
  }
}

// ============================================================
// UI CONTROLLER
// ============================================================

class UIController {
  constructor(lib) {
    this.lib = lib;
    this._currentTab = "dashboard";
    this._init();
  }

  _init() {
    this._bindNav();
    this._bindModals();
    this._bindBooks();
    this._bindMembers();
    this._bindBorrowing();
    this._bindSearch();
    this._bindMisc();
    this.renderAll();
  }

  renderAll() {
    this._syncOverdue();
    this.renderDashboard();
    this.renderBooks();
    this.renderMembers();
    this.renderBorrowing();
    this.renderOverdue();
    this._updateOverdueBadge();
  }

  _syncOverdue() {
    this.lib._syncOverdueStatus();
  }

  // -------------------- NAV --------------------

  _bindNav() {
    document.querySelectorAll(".nav-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tab = btn.dataset.tab;
        this._switchTab(tab);
        // Close sidebar on mobile
        document.getElementById("sidebar")?.classList.remove("open");
        document.getElementById("sidebar-overlay")?.classList.remove("open");
      });
    });
    const menuToggle = document.getElementById("menu-toggle");
    if (menuToggle) {
      menuToggle.addEventListener("click", () => {
        document.getElementById("sidebar")?.classList.toggle("open");
        document.getElementById("sidebar-overlay")?.classList.toggle("open");
      });
    }
    const sidebarOverlay = document.getElementById("sidebar-overlay");
    if (sidebarOverlay) {
      sidebarOverlay.addEventListener("click", () => {
        document.getElementById("sidebar")?.classList.remove("open");
        document.getElementById("sidebar-overlay")?.classList.remove("open");
      });
    }
  }

  _switchTab(tab) {
    this._currentTab = tab;
    document.querySelectorAll(".nav-item").forEach((b) => {
      const active = b.dataset.tab === tab;
      b.classList.toggle("active", active);
      b.setAttribute("aria-pressed", active ? "true" : "false");
    });
    document
      .querySelectorAll(".tab-section")
      .forEach((s) => s.classList.toggle("active", s.id === `tab-${tab}`));
    if (tab === "dashboard") this.renderDashboard();
    if (tab === "books") this.renderBooks();
    if (tab === "members") this.renderMembers();
    if (tab === "borrowing") this.renderBorrowing();
    if (tab === "overdue") this.renderOverdue();
  }

  _updateOverdueBadge() {
    const n = this.lib.getOverdueTransactions().length;
    const badge = document.getElementById("overdue-badge");
    if (badge) {
      badge.textContent = n;
      if (n > 0) {
        badge.style.display = "";
        badge.setAttribute("aria-hidden", "false");
        badge.setAttribute("aria-label", `${n} overdue`);
      } else {
        badge.style.display = "none";
        badge.setAttribute("aria-hidden", "true");
        badge.removeAttribute("aria-label");
      }
    }
  }

  // -------------------- MODALS --------------------

  _bindModals() {
    // Close buttons
    document.querySelectorAll("[data-close]").forEach((btn) => {
      btn.addEventListener("click", () => closeModal(btn.dataset.close));
    });
    // Close on overlay click
    document.querySelectorAll(".modal-overlay").forEach((overlay) => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.classList.remove("open");
      });
    });
  }

  // -------------------- BOOKS --------------------

  _bindBooks() {
    const openAddBookBtn = document.getElementById("open-add-book");
    if (openAddBookBtn) {
      openAddBookBtn.addEventListener("click", () => {
        this._resetBookForm();
        document.getElementById("book-modal-title").textContent =
          "Add New Book";
        document.getElementById("book-edit-id").value = "";
        openModal("book-modal");
      });
    }

    const saveBookBtn = document.getElementById("save-book-btn");
    if (saveBookBtn) {
      saveBookBtn.addEventListener("click", () => {
        const id = document.getElementById("book-edit-id").value;
        const data = {
          title: document.getElementById("book-title").value.trim(),
          author: document.getElementById("book-author").value.trim(),
          isbn: document.getElementById("book-isbn").value.trim(),
          year: document.getElementById("book-year").value.trim(),
          genre: document.getElementById("book-genre").value,
          totalCopies: document.getElementById("book-copies").value,
        };
        try {
          if (id) {
            this.lib.updateBook(id, data);
            showToast("Book updated successfully!", "success");
          } else {
            this.lib.addBook(data);
            showToast("Book added successfully!", "success");
          }
          closeModal("book-modal");
          this.renderAll();
        } catch (e) {
          showToast(e.message, "error");
        }
      });
    }
  }

  _resetBookForm() {
    [
      "book-title",
      "book-author",
      "book-isbn",
      "book-year",
      "book-copies",
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
    const genreEl = document.getElementById("book-genre");
    if (genreEl) genreEl.value = "";
  }

  _editBook(id) {
    const book = this.lib.getBook(id);
    if (!book) return;
    document.getElementById("book-modal-title").textContent = "Edit Book";
    document.getElementById("book-edit-id").value = id;
    document.getElementById("book-title").value = book.title;
    document.getElementById("book-author").value = book.author;
    document.getElementById("book-isbn").value = book.isbn;
    document.getElementById("book-year").value = book.year;
    document.getElementById("book-genre").value = book.genre;
    document.getElementById("book-copies").value = book.totalCopies;
    openModal("book-modal");
  }

  _deleteBook(id) {
    document.getElementById("confirm-message").textContent =
      "Are you sure you want to delete this book? This action cannot be undone.";
    this.lib._pendingDeleteFn = () => {
      try {
        this.lib.deleteBook(id);
        showToast("Book deleted.", "success");
        this.renderAll();
      } catch (e) {
        showToast(e.message, "error");
      }
    };
    openModal("confirm-modal");
  }

  renderBooks(filter = "") {
    const grid = document.getElementById("books-grid");
    if (!grid) return;

    const search = (
      document.getElementById("book-search")?.value || ""
    ).toLowerCase();
    const genre = document.getElementById("genre-filter")?.value || "";

    let books = this.lib.books.filter((b) => {
      const matchSearch =
        !search ||
        b.title.toLowerCase().includes(search) ||
        b.author.toLowerCase().includes(search) ||
        b.isbn.toLowerCase().includes(search);
      const matchGenre = !genre || b.genre === genre;
      return matchSearch && matchGenre;
    });

    if (!books.length) {
      grid.innerHTML = `<div class="empty-state"><i class="fa-solid fa-book-open"></i><p>No books found${search || genre ? " matching your filters" : ""}.</p></div>`;
      return;
    }

    const colors = ["c0", "c1", "c2", "c3", "c4", "c5", "c6", "c7"];
    grid.innerHTML = books
      .map((b, i) => {
        const avail = b.availableCopies;
        const badgeClass =
          avail === 0 ? "none" : avail <= 1 ? "low" : "available";
        const badgeText = avail === 0 ? "Out of Stock" : `${avail} Available`;
        const colorClass = colors[i % colors.length];
        return `
        <div class="book-card">
          <div class="book-cover ${colorClass}"><i class="fa-solid fa-book"></i></div>
          <div class="book-body">
            <div class="book-title">${esc(b.title)}</div>
            <div class="book-author">${esc(b.author)}</div>
            <div class="book-meta">
              <span class="genre-tag">${esc(b.genre)}</span>
              <span><i class="fa-regular fa-calendar"></i>${b.year || "—"}</span>
              <span><i class="fa-solid fa-barcode"></i>${esc(b.isbn)}</span>
            </div>
          </div>
          <div class="book-footer">
            <span class="copies-badge ${badgeClass}">${badgeText}</span>
            <div class="book-actions">
              <button class="btn-icon" title="Edit" onclick="ui._editBook('${b.id}')"><i class="fa-solid fa-pen"></i></button>
              <button class="btn-icon danger" title="Delete" onclick="ui._deleteBook('${b.id}')"><i class="fa-solid fa-trash"></i></button>
            </div>
          </div>
        </div>`;
      })
      .join("");
  }

  // -------------------- MEMBERS --------------------

  _bindMembers() {
    const openAddMemberBtn = document.getElementById("open-add-member");
    if (openAddMemberBtn) {
      openAddMemberBtn.addEventListener("click", () => {
        this._resetMemberForm();
        document.getElementById("member-modal-title").textContent =
          "Add New Member";
        document.getElementById("member-edit-id").value = "";
        const dateEl = document.getElementById("member-date");
        if (dateEl) dateEl.value = todayStr();
        openModal("member-modal");
      });
    }

    const saveMemberBtn = document.getElementById("save-member-btn");
    if (saveMemberBtn) {
      saveMemberBtn.addEventListener("click", () => {
        const id = document.getElementById("member-edit-id").value;
        const data = {
          name: document.getElementById("member-name").value.trim(),
          memberId: document.getElementById("member-id-input").value.trim(),
          email: document.getElementById("member-email").value.trim(),
          phone: document.getElementById("member-phone").value.trim(),
          membershipDate: document.getElementById("member-date").value,
        };
        try {
          if (id) {
            this.lib.updateMember(id, data);
            showToast("Member updated!", "success");
          } else {
            this.lib.addMember(data);
            showToast("Member added!", "success");
          }
          closeModal("member-modal");
          this.renderAll();
        } catch (e) {
          showToast(e.message, "error");
        }
      });
    }
  }

  _resetMemberForm() {
    [
      "member-name",
      "member-id-input",
      "member-email",
      "member-phone",
      "member-date",
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
  }

  _editMember(id) {
    const m = this.lib.getMemberByInternalId(id);
    if (!m) return;
    document.getElementById("member-modal-title").textContent = "Edit Member";
    document.getElementById("member-edit-id").value = id;
    document.getElementById("member-name").value = m.name;
    document.getElementById("member-id-input").value = m.memberId;
    document.getElementById("member-email").value = m.email;
    document.getElementById("member-phone").value = m.phone;
    document.getElementById("member-date").value = m.membershipDate;
    openModal("member-modal");
  }

  _deleteMember(id) {
    document.getElementById("confirm-message").textContent =
      "Are you sure you want to delete this member? This action cannot be undone.";
    this.lib._pendingDeleteFn = () => {
      try {
        this.lib.deleteMember(id);
        showToast("Member deleted.", "success");
        this.renderAll();
      } catch (e) {
        showToast(e.message, "error");
      }
    };
    openModal("confirm-modal");
  }

  _showMemberHistory(id) {
    const m = this.lib.getMemberByInternalId(id);
    if (!m) return;
    const history = this.lib.getMemberHistory(id);
    document.getElementById("history-modal-title").textContent =
      `Borrow History — ${esc(m.name)}`;
    const content = document.getElementById("member-history-content");
    if (!history.length) {
      content.innerHTML =
        '<p style="color:var(--ink-muted);text-align:center;padding:24px 0">No borrow history for this member.</p>';
    } else {
      content.innerHTML = history
        .map((t) => {
          const book = this.lib.getBook(t.bookId);
          const statusClass = t.status;
          return `<div class="history-item">
          <div class="txn-icon"><i class="fa-solid fa-book"></i></div>
          <div class="txn-info">
            <div class="txn-title">${book ? esc(book.title) : "Unknown"}</div>
            <div class="txn-sub">Borrowed: ${formatDate(t.borrowDate)} · Due: ${formatDate(t.dueDate)}</div>
          </div>
          <span class="status-badge ${statusClass}">${t.status.charAt(0).toUpperCase() + t.status.slice(1)}</span>
          ${t.lateFee > 0 ? `<span style="font-size:0.8rem;color:var(--crimson);font-weight:700;">$${t.lateFee}</span>` : ""}
        </div>`;
        })
        .join("");
    }
    openModal("history-modal");
  }

  renderMembers() {
    const tbody = document.getElementById("members-tbody");
    if (!tbody) return;

    const search = (
      document.getElementById("member-search")?.value || ""
    ).toLowerCase();
    let members = this.lib.members.filter(
      (m) =>
        !search ||
        m.name.toLowerCase().includes(search) ||
        m.memberId.toLowerCase().includes(search) ||
        m.email.toLowerCase().includes(search),
    );

    if (!members.length) {
      tbody.innerHTML = `<tr><td colspan="7" class="empty-state"><i class="fa-solid fa-users"></i><p>No members found.</p></td></tr>`;
      return;
    }

    tbody.innerHTML = members
      .map((m) => {
        const borrowCount = this.lib.getMemberBorrowCount(m.id);
        return `<tr>
        <td><strong>${esc(m.memberId)}</strong></td>
        <td>
          <div class="member-cell">
            <div class="member-avatar">${initials(m.name)}</div>
            <span class="member-name-cell">${esc(m.name)}</span>
          </div>
         </td>
        <td>${esc(m.email)}</td>
        <td>${esc(m.phone || "—")}</td>
        <td>${formatDate(m.membershipDate)}</td>
        <td>${borrowCount > 0 ? `<span class="status-badge borrowed">${borrowCount} active</span>` : `<span style="color:var(--ink-muted)">None</span>`}</td>
        <td>
          <div class="actions-row">
            <button class="btn-icon" title="View History" onclick="ui._showMemberHistory('${m.id}')"><i class="fa-solid fa-clock-rotate-left"></i></button>
            <button class="btn-icon" title="Edit" onclick="ui._editMember('${m.id}')"><i class="fa-solid fa-pen"></i></button>
            <button class="btn-icon danger" title="Delete" onclick="ui._deleteMember('${m.id}')"><i class="fa-solid fa-trash"></i></button>
          </div>
         </td>
       </tr>`;
      })
      .join("");
  }

  // -------------------- BORROWING --------------------

  _bindBorrowing() {
    const openBorrowBtn = document.getElementById("open-borrow-modal");
    if (openBorrowBtn) {
      openBorrowBtn.addEventListener("click", () => {
        this._populateBorrowSelects();
        const today = todayStr();
        const borrowDateEl = document.getElementById("borrow-date");
        const borrowDueEl = document.getElementById("borrow-due");
        if (borrowDateEl) borrowDateEl.value = today;
        if (borrowDueEl) borrowDueEl.value = addDays(today, 14);
        openModal("borrow-modal");
      });
    }

    const borrowDateEl = document.getElementById("borrow-date");
    if (borrowDateEl) {
      borrowDateEl.addEventListener("change", (e) => {
        const borrowDueEl = document.getElementById("borrow-due");
        if (borrowDueEl) borrowDueEl.value = addDays(e.target.value, 14);
      });
    }

    const confirmBorrowBtn = document.getElementById("confirm-borrow-btn");
    if (confirmBorrowBtn) {
      confirmBorrowBtn.addEventListener("click", () => {
        const memberId = document.getElementById("borrow-member")?.value;
        const bookId = document.getElementById("borrow-book")?.value;
        const borrowDate = document.getElementById("borrow-date")?.value;
        if (!memberId || !bookId) {
          showToast("Please select both member and book.", "error");
          return;
        }
        try {
          const txn = this.lib.borrowBook(memberId, bookId, borrowDate);
          showToast("Book borrowed successfully!", "success");
          closeModal("borrow-modal");
          this.renderAll();
          this._showReceipt(txn.id);
        } catch (e) {
          showToast(e.message, "error");
        }
      });
    }

    // Confirm delete handler
    const confirmDeleteBtn = document.getElementById("confirm-delete-btn");
    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener("click", () => {
        if (this.lib._pendingDeleteFn) {
          this.lib._pendingDeleteFn();
          this.lib._pendingDeleteFn = null;
        }
        closeModal("confirm-modal");
      });
    }

    // Confirm return
    const confirmReturnBtn = document.getElementById("confirm-return-btn");
    if (confirmReturnBtn) {
      confirmReturnBtn.addEventListener("click", () => {
        const id = document.getElementById("return-txn-id")?.value;
        if (id) {
          try {
            const txn = this.lib.returnBook(id);
            const fee = txn.lateFee > 0 ? ` Late fee: $${txn.lateFee}` : "";
            showToast(`Book returned successfully!${fee}`, "success");
            closeModal("return-modal");
            this.renderAll();
          } catch (e) {
            showToast(e.message, "error");
          }
        }
      });
    }

    // Confirm renew
    const confirmRenewBtn = document.getElementById("confirm-renew-btn");
    if (confirmRenewBtn) {
      confirmRenewBtn.addEventListener("click", () => {
        const id = document.getElementById("renew-txn-id")?.value;
        if (id) {
          try {
            this.lib.renewBook(id);
            showToast("Book renewed for 14 more days!", "success");
            closeModal("renew-modal");
            this.renderAll();
          } catch (e) {
            showToast(e.message, "error");
          }
        }
      });
    }

    // Export modal
    const openExportBtn = document.getElementById("open-export-modal");
    if (openExportBtn) {
      openExportBtn.addEventListener("click", () => openModal("export-modal"));
    }
  }

  _populateBorrowSelects() {
    const memberSel = document.getElementById("borrow-member");
    const bookSel = document.getElementById("borrow-book");

    if (memberSel) {
      memberSel.innerHTML =
        '<option value="">— Select Member —</option>' +
        this.lib.members
          .map(
            (m) =>
              `<option value="${m.id}">${esc(m.memberId)} — ${esc(m.name)}</option>`,
          )
          .join("");
    }

    if (bookSel) {
      bookSel.innerHTML =
        '<option value="">— Select Book —</option>' +
        this.lib.books
          .filter((b) => b.availableCopies > 0)
          .map(
            (b) =>
              `<option value="${b.id}">${esc(b.title)} by ${esc(b.author)} (${b.availableCopies} avail)</option>`,
          )
          .join("");
    }
  }

  _openReturnModal(txnId) {
    const txn = this.lib.transactions.find((t) => t.id === txnId);
    if (!txn) return;
    const member = this.lib.getMemberByInternalId(txn.memberId);
    const book = this.lib.getBook(txn.bookId);
    const fee = this.lib.calcLateFee(txnId);
    const today = todayStr();

    const returnDetailsEl = document.getElementById("return-details");
    const returnTxnIdEl = document.getElementById("return-txn-id");

    if (returnTxnIdEl) returnTxnIdEl.value = txnId;
    if (returnDetailsEl) {
      returnDetailsEl.innerHTML = `
        <div class="return-detail-box">
          <h3><i class="fa-solid fa-book"></i> ${book ? esc(book.title) : "Unknown"}</h3>
          <div class="detail-row"><span class="detail-key">Member</span><span class="detail-val">${member ? esc(member.name) : "Unknown"}</span></div>
          <div class="detail-row"><span class="detail-key">Borrowed On</span><span class="detail-val">${formatDate(txn.borrowDate)}</span></div>
          <div class="detail-row"><span class="detail-key">Due Date</span><span class="detail-val">${formatDate(txn.dueDate)}</span></div>
          <div class="detail-row"><span class="detail-key">Return Date</span><span class="detail-val">${formatDate(today)}</span></div>
        </div>
        ${
          fee > 0
            ? `<div class="late-fee-alert"><i class="fa-solid fa-triangle-exclamation"></i> Late fee: <strong>$${fee.toFixed(2)}</strong> (${daysBetween(txn.dueDate, today)} days overdue @ $0.50/day)</div>`
            : `<div style="background:var(--sage-light);border-radius:var(--radius-sm);padding:12px 16px;color:var(--sage);font-size:0.88rem;"><i class="fa-solid fa-circle-check"></i> No late fees — returned on time!</div>`
        }`;
    }
    openModal("return-modal");
  }

  _openRenewModal(txnId) {
    const txn = this.lib.transactions.find((t) => t.id === txnId);
    if (!txn) return;
    const member = this.lib.getMemberByInternalId(txn.memberId);
    const book = this.lib.getBook(txn.bookId);
    const newDue = addDays(todayStr(), 14);

    const renewDetailsEl = document.getElementById("renew-details");
    const renewTxnIdEl = document.getElementById("renew-txn-id");

    if (renewTxnIdEl) renewTxnIdEl.value = txnId;
    if (renewDetailsEl) {
      renewDetailsEl.innerHTML = `
        <div class="return-detail-box">
          <h3><i class="fa-solid fa-rotate"></i> Renew Book</h3>
          <div class="detail-row"><span class="detail-key">Book</span><span class="detail-val">${book ? esc(book.title) : "Unknown"}</span></div>
          <div class="detail-row"><span class="detail-key">Member</span><span class="detail-val">${member ? esc(member.name) : "Unknown"}</span></div>
          <div class="detail-row"><span class="detail-key">Current Due Date</span><span class="detail-val">${formatDate(txn.dueDate)}</span></div>
          <div class="detail-row"><span class="detail-key">New Due Date</span><span class="detail-val" style="color:var(--sage)">${formatDate(newDue)}</span></div>
          <div class="detail-row"><span class="detail-key">Renewals Used</span><span class="detail-val">${txn.renewCount}/1</span></div>
        </div>`;
    }
    openModal("renew-modal");
  }

  _showReceipt(txnId) {
    const txn = this.lib.transactions.find((t) => t.id === txnId);
    if (!txn) return;
    const member = this.lib.getMemberByInternalId(txn.memberId);
    const book = this.lib.getBook(txn.bookId);
    const receiptContent = document.getElementById("receipt-content");
    if (receiptContent) {
      receiptContent.innerHTML = `
        <div class="receipt-title">📚 Bibliotheca</div>
        <div class="receipt-sub">Library Borrowing Receipt</div>
        <hr class="receipt-divider"/>
        <div class="receipt-row"><span>Receipt #</span><span>${esc(txn.id)}</span></div>
        <div class="receipt-row"><span>Date</span><span>${formatDate(txn.borrowDate)}</span></div>
        <hr class="receipt-divider"/>
        <div class="receipt-row"><span>Member</span><span>${member ? esc(member.name) : "—"}</span></div>
        <div class="receipt-row"><span>Member ID</span><span>${member ? esc(member.memberId) : "—"}</span></div>
        <hr class="receipt-divider"/>
        <div class="receipt-row"><span>Book</span><span>${book ? esc(book.title) : "—"}</span></div>
        <div class="receipt-row"><span>Author</span><span>${book ? esc(book.author) : "—"}</span></div>
        <div class="receipt-row"><span>ISBN</span><span>${book ? esc(book.isbn) : "—"}</span></div>
        <hr class="receipt-divider"/>
        <div class="receipt-row"><span>Borrowed On</span><span>${formatDate(txn.borrowDate)}</span></div>
        <div class="receipt-row total"><span>Due Date</span><span>${formatDate(txn.dueDate)}</span></div>
        <hr class="receipt-divider"/>
        <div class="receipt-row" style="font-size:0.75rem;color:var(--ink-muted)"><span colspan="2">Late fee: $0.50/day after due date. Max 1 renewal allowed.</span></div>`;
    }
    openModal("receipt-modal");
  }

  renderBorrowing() {
    const tbody = document.getElementById("borrowing-tbody");
    if (!tbody) return;

    const search = (
      document.getElementById("borrow-search")?.value || ""
    ).toLowerCase();
    let txns = [...this.lib.transactions].sort((a, b) =>
      b.borrowDate > a.borrowDate ? 1 : -1,
    );

    if (search) {
      txns = txns.filter((t) => {
        const m = this.lib.getMemberByInternalId(t.memberId);
        const b = this.lib.getBook(t.bookId);
        return (
          (m && m.name.toLowerCase().includes(search)) ||
          (b && b.title.toLowerCase().includes(search))
        );
      });
    }

    if (!txns.length) {
      tbody.innerHTML = `<tr><td colspan="7" class="empty-state"><i class="fa-solid fa-hand-holding-heart"></i><p>No transactions found.</p></td></tr>`;
      return;
    }

    tbody.innerHTML = txns
      .map((t) => {
        const member = this.lib.getMemberByInternalId(t.memberId);
        const book = this.lib.getBook(t.bookId);
        const isOverdue = t.status === "overdue";
        const isActive = t.status !== "returned";
        const statusLabel =
          t.status.charAt(0).toUpperCase() + t.status.slice(1);
        return `<tr class="${isOverdue ? "overdue-row" : ""}">
        <td style="font-size:0.75rem;color:var(--ink-muted)">${t.id.slice(-6)}</td>
        <td>
          <div class="member-cell">
            <div class="member-avatar">${member ? initials(member.name) : "?"}</div>
            <span>${member ? esc(member.name) : "Unknown"}</span>
          </div>
        </td>
        <td><strong>${book ? esc(book.title) : "Unknown"}</strong></td>
        <td>${formatDate(t.borrowDate)}</td>
        <td style="${isOverdue ? "color:var(--crimson);font-weight:700" : ""}">${formatDate(t.dueDate)}</td>
        <td><span class="status-badge ${t.status}">${isOverdue ? '<i class="fa-solid fa-triangle-exclamation"></i> ' : ""}${statusLabel}</span></td>
        <td>
          <div class="actions-row">
            ${isActive ? `<button class="btn btn-sm btn-success" onclick="ui._openReturnModal('${t.id}')"><i class="fa-solid fa-rotate-left"></i> Return</button>` : ""}
            ${isActive && t.renewCount < 1 ? `<button class="btn btn-sm btn-outline" onclick="ui._openRenewModal('${t.id}')"><i class="fa-solid fa-rotate"></i> Renew</button>` : ""}
            ${!isActive ? `<button class="btn-icon" title="Print Receipt" onclick="ui._showReceipt('${t.id}')"><i class="fa-solid fa-receipt"></i></button>` : ""}
          </div>
        </td>
      </tr>`;
      })
      .join("");
  }

  renderOverdue() {
    const tbody = document.getElementById("overdue-tbody");
    if (!tbody) return;

    const today = todayStr();
    const overdue = this.lib.getOverdueTransactions();

    if (!overdue.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="empty-state"><i class="fa-solid fa-circle-check" style="color:var(--sage)"></i><p>No overdue books — great job!</p></td></tr>`;
      return;
    }

    tbody.innerHTML = overdue
      .map((t) => {
        const member = this.lib.getMemberByInternalId(t.memberId);
        const book = this.lib.getBook(t.bookId);
        const daysLate = daysBetween(t.dueDate, today);
        const fee = (daysLate * 0.5).toFixed(2);
        return `<tr class="overdue-row">
        <td><div class="member-cell"><div class="member-avatar">${member ? initials(member.name) : "?"}</div><span>${member ? esc(member.name) : "Unknown"}</span></div></td>
        <td><strong>${book ? esc(book.title) : "Unknown"}</strong></td>
        <td style="color:var(--crimson);font-weight:700">${formatDate(t.dueDate)}</td>
        <td><span style="color:var(--crimson);font-weight:700">${daysLate} days</span></td>
        <td><strong style="color:var(--crimson)">$${fee}</strong></td>
        <td><button class="btn btn-sm btn-success" onclick="ui._openReturnModal('${t.id}')"><i class="fa-solid fa-rotate-left"></i> Return</button></td>
      </tr>`;
      })
      .join("");
  }

  // -------------------- DASHBOARD --------------------

  renderDashboard() {
    const stats = this.lib.getStats();
    const dashTotalBooks = document.getElementById("dash-total-books");
    const dashAvailable = document.getElementById("dash-available");
    const dashMembers = document.getElementById("dash-members");
    const dashBorrowed = document.getElementById("dash-borrowed");
    const dashOverdue = document.getElementById("dash-overdue");

    if (dashTotalBooks) dashTotalBooks.textContent = stats.totalBooks;
    if (dashAvailable) dashAvailable.textContent = stats.available;
    if (dashMembers) dashMembers.textContent = stats.members;
    if (dashBorrowed) dashBorrowed.textContent = stats.borrowed;
    if (dashOverdue) dashOverdue.textContent = stats.overdue;

    this._renderGenreChart();
    this._renderRecentTransactions();
  }

  _renderGenreChart() {
    const container = document.getElementById("genre-chart");
    if (!container) return;

    const stats = this.lib.getGenreStats();
    if (!stats.length) {
      container.innerHTML =
        '<div class="chart-empty">No borrow data yet.</div>';
      return;
    }
    const max = stats[0][1];
    container.innerHTML = stats
      .map(
        ([genre, count]) => `
      <div class="chart-bar-row">
        <div class="chart-label">${esc(genre)}</div>
        <div class="chart-bar-track">
          <div class="chart-bar-fill" style="width:${((count / max) * 100).toFixed(0)}%"></div>
        </div>
        <div class="chart-count">${count}</div>
      </div>`,
      )
      .join("");
  }

  _renderRecentTransactions() {
    const container = document.getElementById("recent-transactions");
    if (!container) return;

    const recent = [...this.lib.transactions]
      .sort((a, b) => (b.borrowDate > a.borrowDate ? 1 : -1))
      .slice(0, 6);
    if (!recent.length) {
      container.innerHTML = '<div class="txn-empty">No transactions yet.</div>';
      return;
    }
    container.innerHTML = recent
      .map((t) => {
        const m = this.lib.getMemberByInternalId(t.memberId);
        const b = this.lib.getBook(t.bookId);
        const icon =
          t.status === "returned"
            ? "fa-rotate-left"
            : t.status === "overdue"
              ? "fa-triangle-exclamation"
              : "fa-book";
        return `<div class="txn-item">
        <div class="txn-icon"><i class="fa-solid ${icon}"></i></div>
        <div class="txn-info">
          <div class="txn-title">${b ? esc(b.title) : "Unknown"}</div>
          <div class="txn-sub">${m ? esc(m.name) : "Unknown"}</div>
        </div>
        <div class="txn-date">${formatDate(t.borrowDate)}</div>
      </div>`;
      })
      .join("");
  }

  // -------------------- SEARCH --------------------

  _bindSearch() {
    const bookSearch = document.getElementById("book-search");
    const genreFilter = document.getElementById("genre-filter");
    const memberSearch = document.getElementById("member-search");
    const borrowSearch = document.getElementById("borrow-search");

    if (bookSearch)
      bookSearch.addEventListener("input", () => this.renderBooks());
    if (genreFilter)
      genreFilter.addEventListener("change", () => this.renderBooks());
    if (memberSearch)
      memberSearch.addEventListener("input", () => this.renderMembers());
    if (borrowSearch)
      borrowSearch.addEventListener("input", () => this.renderBorrowing());
  }

  // -------------------- MISC --------------------

  _bindMisc() {
    // ESC key closes modals
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document
          .querySelectorAll(".modal-overlay.open")
          .forEach((m) => m.classList.remove("open"));
      }
    });
  }
}

// ============================================================
// BOOTSTRAP
// ============================================================

const library = new LibraryManager();
const ui = new UIController(library);

// Expose for inline onclick
window.library = library;
window.ui = ui;
window.closeModal = closeModal;
