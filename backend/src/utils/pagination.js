export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const MIN_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function parsePagination(query = {}) {
  const page = parsePositiveInteger(query.page, DEFAULT_PAGE);
  const requestedPageSize = parsePositiveInteger(query.pageSize, DEFAULT_PAGE_SIZE);
  const pageSize = Math.min(Math.max(requestedPageSize, MIN_PAGE_SIZE), MAX_PAGE_SIZE);
  const offset = (page - 1) * pageSize;

  return { page, pageSize, offset };
}

export function buildPagination({ page, pageSize, total }) {
  const safeTotal = Number(total || 0);

  return {
    page,
    pageSize,
    total: safeTotal,
    totalPages: safeTotal ? Math.ceil(safeTotal / pageSize) : 0
  };
}

export function paginateItems(items, { page, pageSize, offset }) {
  return items.slice(offset, offset + pageSize);
}
