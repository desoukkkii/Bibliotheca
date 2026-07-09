import type { StoreState } from "../types";

const NOW = new Date();

function daysAgo(n: number): string {
  const d = new Date(NOW);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function futureDays(n: number): string {
  const d = new Date(NOW);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export const SEED_DATA: StoreState = {
  books: [
    { id: 1, title: "To Kill a Mockingbird", author: "Harper Lee", isbn: "978-0-06-112008-4", genre: "Literature", qty: 5, year: 1960 },
    { id: 2, title: "1984", author: "George Orwell", isbn: "978-0-452-28423-4", genre: "Literature", qty: 4, year: 1949 },
    { id: 3, title: "The Great Gatsby", author: "F. Scott Fitzgerald", isbn: "978-0-7432-7356-5", genre: "Literature", qty: 3, year: 1925 },
    { id: 4, title: "Pride and Prejudice", author: "Jane Austen", isbn: "978-0-14-143951-8", genre: "Literature", qty: 4, year: 1813 },
    { id: 5, title: "The Catcher in the Rye", author: "J.D. Salinger", isbn: "978-0-316-76948-0", genre: "English", qty: 3, year: 1951 },
    { id: 6, title: "A Brief History of Time", author: "Stephen Hawking", isbn: "978-0-553-38016-3", genre: "Science", qty: 3, year: 1988 },
    { id: 7, title: "The Selfish Gene", author: "Richard Dawkins", isbn: "978-0-19-929115-1", genre: "Science", qty: 2, year: 1976 },
    { id: 8, title: "Cosmos", author: "Carl Sagan", isbn: "978-0-345-53943-4", genre: "Science", qty: 3, year: 1980 },
    { id: 9, title: "Gödel, Escher, Bach", author: "Douglas Hofstadter", isbn: "978-0-465-02656-2", genre: "Mathematics", qty: 2, year: 1979 },
    { id: 10, title: "The Code Book", author: "Simon Singh", isbn: "978-0-385-49532-5", genre: "Mathematics", qty: 2, year: 1999 },
    { id: 11, title: "Sapiens", author: "Yuval Noah Harari", isbn: "978-0-06-231611-0", genre: "History", qty: 5, year: 2011 },
    { id: 12, title: "Guns, Germs, and Steel", author: "Jared Diamond", isbn: "978-0-393-31755-8", genre: "History", qty: 3, year: 1997 },
    { id: 13, title: "The Innovators", author: "Walter Isaacson", isbn: "978-1-4767-0869-0", genre: "Technology", qty: 3, year: 2014 },
    { id: 14, title: "Clean Code", author: "Robert C. Martin", isbn: "978-0-13-235088-4", genre: "Technology", qty: 4, year: 2008 },
    { id: 15, title: "The Pragmatic Programmer", author: "Andrew Hunt", isbn: "978-0-201-61622-4", genre: "Technology", qty: 3, year: 1999 },
    { id: 16, title: "The Story of Art", author: "E.H. Gombrich", isbn: "978-0-7148-3247-0", genre: "Art", qty: 2, year: 1950 },
    { id: 17, title: "Ways of Seeing", author: "John Berger", isbn: "978-0-14-013515-2", genre: "Art", qty: 2, year: 1972 },
    { id: 18, title: "Meditations", author: "Marcus Aurelius", isbn: "978-0-14-044933-4", genre: "Philosophy", qty: 4, year: 180 },
    { id: 19, title: "Thus Spoke Zarathustra", author: "Friedrich Nietzsche", isbn: "978-0-14-044118-5", genre: "Philosophy", qty: 2, year: 1883 },
    { id: 20, title: "The Republic", author: "Plato", isbn: "978-0-14-045511-3", genre: "Philosophy", qty: 3, year: -380 },
    { id: 21, title: "The Elements of Style", author: "Strunk & White", isbn: "978-0-205-31342-6", genre: "English", qty: 3, year: 1959 },
    { id: 22, title: "On Writing Well", author: "William Zinsser", isbn: "978-0-06-089154-1", genre: "English", qty: 2, year: 1976 },
    { id: 23, title: "The Origin of Species", author: "Charles Darwin", isbn: "978-0-451-52906-0", genre: "Science", qty: 2, year: 1859 },
    { id: 24, title: "The Art of War", author: "Sun Tzu", isbn: "978-1-59030-225-5", genre: "Philosophy", qty: 5, year: -500 },
  ],
  members: [
    { id: 1, name: "Alice Kamau", email: "alice.kamau@email.com", phone: "0712345678", joined: daysAgo(120) },
    { id: 2, name: "Bob Otieno", email: "bob.otieno@email.com", phone: "0723456789", joined: daysAgo(98) },
    { id: 3, name: "Carol Wanjiku", email: "carol.wanjiku@email.com", phone: "0734567890", joined: daysAgo(85) },
    { id: 4, name: "David Mwangi", email: "david.mwangi@email.com", phone: "0745678901", joined: daysAgo(72) },
    { id: 5, name: "Eve Nyambura", email: "eve.nyambura@email.com", phone: "0756789012", joined: daysAgo(60) },
    { id: 6, name: "Frank Kiprop", email: "frank.kiprop@email.com", phone: "0767890123", joined: daysAgo(55) },
    { id: 7, name: "Grace Akinyi", email: "grace.akinyi@email.com", phone: "0778901234", joined: daysAgo(50) },
    { id: 8, name: "Henry Njoroge", email: "henry.njoroge@email.com", phone: "0789012345", joined: daysAgo(42) },
    { id: 9, name: "Irene Chebet", email: "irene.chebet@email.com", phone: "0790123456", joined: daysAgo(35) },
    { id: 10, name: "James Omondi", email: "james.omondi@email.com", phone: "0701234567", joined: daysAgo(28) },
    { id: 11, name: "Faith Wambui", email: "faith.wambui@email.com", phone: "0711223344", joined: daysAgo(21) },
    { id: 12, name: "Samuel Kariuki", email: "samuel.kariuki@email.com", phone: "0722334455", joined: daysAgo(14) },
  ],
  transactions: [
    { id: 1, bookTitle: "To Kill a Mockingbird", memberName: "Alice Kamau", borrowDate: daysAgo(18), dueDate: futureDays(-4), returnDate: null, renewCount: 0 },
    { id: 2, bookTitle: "1984", memberName: "Bob Otieno", borrowDate: daysAgo(21), dueDate: futureDays(-7), returnDate: null, renewCount: 1 },
    { id: 3, bookTitle: "Sapiens", memberName: "Carol Wanjiku", borrowDate: daysAgo(14), dueDate: futureDays(0), returnDate: null, renewCount: 0 },
    { id: 4, bookTitle: "Clean Code", memberName: "David Mwangi", borrowDate: daysAgo(10), dueDate: futureDays(4), returnDate: null, renewCount: 0 },
    { id: 5, bookTitle: "The Great Gatsby", memberName: "Eve Nyambura", borrowDate: daysAgo(25), dueDate: futureDays(-11), returnDate: null, renewCount: 2 },
    { id: 6, bookTitle: "A Brief History of Time", memberName: "Frank Kiprop", borrowDate: daysAgo(7), dueDate: futureDays(7), returnDate: null, renewCount: 0 },
    { id: 7, bookTitle: "Meditations", memberName: "Grace Akinyi", borrowDate: daysAgo(30), dueDate: futureDays(-16), returnDate: null, renewCount: 3 },
    { id: 8, bookTitle: "The Pragmatic Programmer", memberName: "Henry Njoroge", borrowDate: daysAgo(5), dueDate: futureDays(9), returnDate: null, renewCount: 0 },
    { id: 9, bookTitle: "Guns, Germs, and Steel", memberName: "Irene Chebet", borrowDate: daysAgo(19), dueDate: futureDays(-5), returnDate: null, renewCount: 1 },
    { id: 10, bookTitle: "The Catcher in the Rye", memberName: "James Omondi", borrowDate: daysAgo(3), dueDate: futureDays(11), returnDate: null, renewCount: 0 },
    { id: 11, bookTitle: "The Republic", memberName: "Alice Kamau", borrowDate: daysAgo(12), dueDate: futureDays(2), returnDate: null, renewCount: 0 },
    { id: 12, bookTitle: "The Innovators", memberName: "Frank Kiprop", borrowDate: daysAgo(8), dueDate: futureDays(6), returnDate: null, renewCount: 0 },
    { id: 13, bookTitle: "1984", memberName: "Eve Nyambura", borrowDate: daysAgo(35), dueDate: futureDays(-21), returnDate: daysAgo(2), renewCount: 3 },
    { id: 14, bookTitle: "To Kill a Mockingbird", memberName: "Bob Otieno", borrowDate: daysAgo(40), dueDate: futureDays(-26), returnDate: daysAgo(5), renewCount: 2 },
    { id: 15, bookTitle: "Sapiens", memberName: "Grace Akinyi", borrowDate: daysAgo(45), dueDate: futureDays(-31), returnDate: daysAgo(8), renewCount: 1 },
    { id: 16, bookTitle: "The Art of War", memberName: "David Mwangi", borrowDate: daysAgo(28), dueDate: futureDays(-14), returnDate: daysAgo(1), renewCount: 2 },
    { id: 17, bookTitle: "Clean Code", memberName: "Carol Wanjiku", borrowDate: daysAgo(32), dueDate: futureDays(-18), returnDate: daysAgo(3), renewCount: 1 },
    { id: 18, bookTitle: "Pride and Prejudice", memberName: "James Omondi", borrowDate: daysAgo(50), dueDate: futureDays(-36), returnDate: daysAgo(15), renewCount: 2 },
    { id: 19, bookTitle: "The Selfish Gene", memberName: "Henry Njoroge", borrowDate: daysAgo(20), dueDate: futureDays(-6), returnDate: daysAgo(10), renewCount: 0 },
    { id: 20, bookTitle: "The Story of Art", memberName: "Alice Kamau", borrowDate: daysAgo(16), dueDate: futureDays(-2), returnDate: null, renewCount: 0 },
    { id: 21, bookTitle: "The Elements of Style", memberName: "Irene Chebet", borrowDate: daysAgo(6), dueDate: futureDays(8), returnDate: null, renewCount: 0 },
    { id: 22, bookTitle: "Cosmos", memberName: "Faith Wambui", borrowDate: daysAgo(22), dueDate: futureDays(-8), returnDate: null, renewCount: 1 },
    { id: 23, bookTitle: "Meditations", memberName: "Samuel Kariuki", borrowDate: daysAgo(11), dueDate: futureDays(3), returnDate: null, renewCount: 0 },
    { id: 24, bookTitle: "The Great Gatsby", memberName: "Grace Akinyi", borrowDate: daysAgo(4), dueDate: futureDays(10), returnDate: null, renewCount: 0 },
    { id: 25, bookTitle: "On Writing Well", memberName: "James Omondi", borrowDate: daysAgo(15), dueDate: futureDays(-1), returnDate: null, renewCount: 0 },
    { id: 26, bookTitle: "The Code Book", memberName: "Frank Kiprop", borrowDate: daysAgo(9), dueDate: futureDays(5), returnDate: null, renewCount: 0 },
    { id: 27, bookTitle: "The Art of War", memberName: "Eve Nyambura", borrowDate: daysAgo(38), dueDate: futureDays(-24), returnDate: daysAgo(12), renewCount: 1 },
    { id: 28, bookTitle: "To Kill a Mockingbird", memberName: "Samuel Kariuki", borrowDate: daysAgo(44), dueDate: futureDays(-30), returnDate: daysAgo(20), renewCount: 1 },
    { id: 29, bookTitle: "The Origin of Species", memberName: "Faith Wambui", borrowDate: daysAgo(13), dueDate: futureDays(1), returnDate: null, renewCount: 0 },
    { id: 30, bookTitle: "Thus Spoke Zarathustra", memberName: "Henry Njoroge", borrowDate: daysAgo(17), dueDate: futureDays(-3), returnDate: null, renewCount: 0 },
  ],
};
