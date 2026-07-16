import type { ScholarResult } from "../../../../shared/scholar/types";
import { fetchJson, truncateWords } from "../httpUtil";
import type { SourceSearchParams } from "./types";

interface OpenLibraryDoc {
  key?: string;
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  publisher?: string[];
  isbn?: string[];
  language?: string[];
  number_of_pages_median?: number;
  edition_count?: number;
  subject?: string[];
  cover_i?: number;
  first_sentence?: string[] | string;
}

interface OpenLibraryResponse {
  docs?: OpenLibraryDoc[];
}

export async function searchOpenLibrary(params: SourceSearchParams): Promise<ScholarResult[]> {
  const url = new URL("https://openlibrary.org/search.json");
  url.searchParams.set("q", params.query);
  url.searchParams.set("limit", String(params.pageSize));
  url.searchParams.set("page", String(params.page));
  url.searchParams.set(
    "fields",
    "key,title,author_name,first_publish_year,publisher,isbn,language,number_of_pages_median,edition_count,subject,cover_i,first_sentence"
  );

  const data = await fetchJson<OpenLibraryResponse>(url.toString());
  const docs = data?.docs || [];

  return docs
    .filter(d => d.title)
    .map((d): ScholarResult => {
      const description = Array.isArray(d.first_sentence)
        ? d.first_sentence[0]
        : d.first_sentence;

      return {
        id: `openLibrary:${d.key ?? d.title}`,
        source: "openLibrary",
        type: "book",
        title: d.title!,
        authors: d.author_name || [],
        year: d.first_publish_year ?? null,
        venue: null,
        publisher: d.publisher?.[0] ?? null,
        doi: null,
        isbn: d.isbn?.[0] ?? null,
        pmid: null,
        arxivId: null,
        abstract: description ? truncateWords(description, 220) : null,
        keywords: d.subject?.slice(0, 8) ?? [],
        citationCount: null,
        openAccessUrl: null,
        url: d.key ? `https://openlibrary.org${d.key}` : null,
        language: d.language?.[0] ?? null,
        evidenceLevel: null,
        studyTypeLabel: null,
        coverUrl: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : null,
        pageCount: d.number_of_pages_median ?? null,
        editionCount: d.edition_count ?? null,
        openLibraryUrl: d.key ? `https://openlibrary.org${d.key}` : null,
        googleBooksUrl: null,
        relevanceScore: 0,
      };
    });
}

export async function lookupOpenLibraryByIsbn(isbn: string): Promise<ScholarResult | null> {
  const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${encodeURIComponent(isbn)}&jscmd=data&format=json`;
  const data = await fetchJson<Record<string, any>>(url);
  const key = `ISBN:${isbn}`;
  const book = data?.[key];
  if (!book) return null;

  return {
    id: `openLibrary:isbn:${isbn}`,
    source: "openLibrary",
    type: "book",
    title: book.title || isbn,
    authors: (book.authors || []).map((a: any) => a.name).filter(Boolean),
    year: book.publish_date ? Number(String(book.publish_date).match(/\d{4}/)?.[0]) || null : null,
    venue: null,
    publisher: book.publishers?.[0]?.name ?? null,
    doi: null,
    isbn,
    pmid: null,
    arxivId: null,
    abstract: book.notes ? truncateWords(String(book.notes), 220) : null,
    keywords: (book.subjects || []).map((s: any) => s.name).filter(Boolean).slice(0, 8),
    citationCount: null,
    openAccessUrl: null,
    url: book.url ?? null,
    language: null,
    evidenceLevel: null,
    studyTypeLabel: null,
    coverUrl: book.cover?.medium ?? null,
    pageCount: book.number_of_pages ?? null,
    editionCount: null,
    openLibraryUrl: book.url ?? null,
    googleBooksUrl: null,
    relevanceScore: 0,
  };
}
