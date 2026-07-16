import type { ScholarResult } from "../../../../shared/scholar/types";

export interface SourceSearchParams {
  query: string;
  /** 1-based page number. */
  page: number;
  pageSize: number;
  /** Only return items published in/after this year, when the source supports it. */
  yearFrom: number | null;
  /** ISO 639-1 code ("pt" | "en" | "es"), when the caller wants to hint the source. */
  language: string | null;
}

export type SourceSearchFn = (params: SourceSearchParams) => Promise<ScholarResult[]>;
