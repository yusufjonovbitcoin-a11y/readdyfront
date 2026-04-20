/**
 * Paginatsiya tugmalari oraliqlarini hisoblash uchun util.
 * Masalan: [1, 2, '...', 10] kabi massiv qaytaradi.
 */
export const getWindowedPageItems = (
  currentPage: number,
  totalPages: number,
  windowSize: number = 2
): (number | string)[] => {
  if (totalPages <= 1) return [1];

  const items: (number | string)[] = [];
  const start = Math.max(2, currentPage - windowSize);
  const end = Math.min(totalPages - 1, currentPage + windowSize);

  items.push(1);

  if (start > 2) {
    items.push("...");
  }

  for (let i = start; i <= end; i++) {
    items.push(i);
  }

  if (end < totalPages - 1) {
    items.push("...");
  }

  items.push(totalPages);

  return items;
};

/**
 * Ma'lumotlarni sahifalarga bo'lish (Client-side pagination uchun)
 */
export const paginateCollection = <T>(
  items: T[],
  page: number,
  pageSize: number
): T[] => {
  const startIndex = (page - 1) * pageSize;
  return items.slice(startIndex, startIndex + pageSize);
};

/**
 * Sahifa raqamini ruxsat berilgan oraliqda ushlab turadi.
 * Ma'lumotlar o'zgarganda (filtrlanganda) joriy sahifa chegaradan chiqib ketmasligi uchun.
 */
export const clampPage = (page: number, totalPages: number): number => {
  if (totalPages <= 0) return 1;
  return Math.min(Math.max(1, page), totalPages);
};
