const DAY = 24 * 60 * 60 * 1000;

export function createLibrary({ books, clock, notify }) {
  return {
    async borrow(bookId, memberId) {
    },

    async giveBack(bookId, memberId) {
    },

    async isAvailable(bookId) {
      return false;
    },
  };
}
