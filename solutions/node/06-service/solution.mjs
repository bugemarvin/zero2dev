const DAY = 24 * 60 * 60 * 1000;

export function createLibrary({ books, clock, notify }) {
  async function mustFind(bookId) {
    const book = await books.findById(bookId);
    if (!book) {
      throw new Error("book not found");
    }
    return book;
  }

  return {
    async borrow(bookId, memberId) {
      const book = await mustFind(bookId);
      if (book.borrowedBy !== null) {
        throw new Error("book is already borrowed");
      }
      const updated = { ...book, borrowedBy: memberId, dueAt: clock() + 14 * DAY };
      await books.save(updated);
      return updated;
    },

    async giveBack(bookId, memberId) {
      const book = await mustFind(bookId);
      if (book.borrowedBy !== memberId) {
        throw new Error("not borrowed by this member");
      }
      const delay = clock() - book.dueAt;
      await books.save({ ...book, borrowedBy: null, dueAt: null });
      if (delay <= 0) {
        return { late: false, fee: 0 };
      }
      const fee = Math.ceil(delay / DAY) * 50;
      await notify(memberId, `late fee: ${fee}`);
      return { late: true, fee };
    },

    async isAvailable(bookId) {
      const book = await books.findById(bookId);
      return book !== null && book !== undefined && book.borrowedBy === null;
    },
  };
}
