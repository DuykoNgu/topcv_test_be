export interface PaginationParams {
  page?: number | string;
  limit?: number | string;
}

export interface PaginationData {
  page: number;
  limit: number;
  skip: number;
  total: number;
  totalPages: number;
}

export function parsePagination(params: PaginationParams, defaultLimit: number = 10): PaginationData {
  let page = 1;
  let limit = defaultLimit;

  if (params.page) {
    const parsedPage = parseInt(String(params.page), 10);
    if (!isNaN(parsedPage) && parsedPage > 0) {
      page = parsedPage;
    }
  }

  if (params.limit) {
    const parsedLimit = parseInt(String(params.limit), 10);
    if (!isNaN(parsedLimit) && parsedLimit > 0 && parsedLimit <= 100) {
      limit = parsedLimit;
    }
  }

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    total: 0,
    totalPages: 0,
  };
}

export function calculateTotalPages(total: number, limit: number): number {
  return Math.ceil(total / limit);
}
