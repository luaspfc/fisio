import type { ScholarResult } from "../../../../shared/scholar/types";
import { fetchJson, truncateWords } from "../httpUtil";
import type { SourceSearchParams } from "./types";

interface GoogleBookVolumeInfo {
  title?: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  industryIdentifiers?: { type?: string; identifier?: string }[];
  pageCount?: number;
  categories?: string[];
  language?: string;
  imageLinks?: { thumbnail?: string };
  previewLink?: string;
}

interface GoogleBookItem {
  id?: string;
  volumeInfo?: GoogleBookVolumeInfo;
}

interface GoogleBooksResponse {
  items?: GoogleBookItem[];
}

function pickIsbn(identifiers?: { type?: string; identifier?: string }[]): string | null {
  if (!identifiers) return null;
  const isbn13 = identifiers.find(i => i.type === "ISBN_13");
  const isbn10 = identifiers.find(i => i.type === "ISBN_10");
  return isbn13?.identifier ?? isbn10?.identifier ?? null;
}

export async function searchGoogleBooks(params: SourceSearchParams): Promise<ScholarResult[]> {
  const url = new URL("https://www.googleapis.com/books/v1/volumes");
  url.searchParams.set("q", params.query);
  url.searchParams.set("maxResults", String(Math.min(params.pageSize, 40)));
  url.searchParams.set("startIndex", String((params.page - 1) * params.pageSize));
  if (process.env.GOOGLE_BOOKS_API_KEY) {
    url.searchParams.set("key", process.env.GOOGLE_BOOKS_API_KEY);
  }

  const data = await fetchJson<GoogleBooksResponse>(url.toString());
  const items = data?.items || [];

  return items
    .filter(i => i.volumeInfo?.title)
    .map((i): ScholarResult => {
      const info = i.volumeInfo!;
      const year = info.publishedDate ? Number(info.publishedDate.slice(0, 4)) : null;

      return {
        id: `googleBooks:${i.id ?? info.title}`,
        source: "googleBooks",
        type: "book",
        title: info.title!,
        authors: info.authors || [],
        year: Number.isFinite(year) ? year : null,
        venue: null,
        publisher: info.publisher ?? null,
        doi: null,
        isbn: pickIsbn(info.industryIdentifiers),
        pmid: null,
        arxivId: null,
        abstract: info.description ? truncateWords(info.description, 220) : null,
        keywords: info.categories?.slice(0, 8) ?? [],
        citationCount: null,
        openAccessUrl: null,
        url: info.previewLink ?? null,
        language: info.language ?? null,
        evidenceLevel: null,
        studyTypeLabel: null,
        coverUrl: info.imageLinks?.thumbnail?.replace(/^http:/, "https:") ?? null,
        pageCount: info.pageCount ?? null,
        editionCount: null,
        openLibraryUrl: null,
        googleBooksUrl: i.id ? `https://books.google.com/books?id=${i.id}` : info.previewLink ?? null,
        relevanceScore: 0,
      };
    });
}
