import type { ScholarResult } from "../../../../shared/scholar/types";
import { classifyStudy, extractKeywords } from "../classify";
import { fetchJson, truncateWords } from "../httpUtil";
import type { SourceSearchParams } from "./types";

interface OpenAlexWork {
  id?: string;
  doi?: string;
  title?: string;
  display_name?: string;
  publication_year?: number;
  type?: string;
  language?: string;
  cited_by_count?: number;
  abstract_inverted_index?: Record<string, number[]>;
  authorships?: { author?: { display_name?: string } }[];
  primary_location?: {
    source?: { display_name?: string };
    landing_page_url?: string;
    pdf_url?: string;
    is_oa?: boolean;
  };
  open_access?: { is_oa?: boolean; oa_url?: string };
  best_oa_location?: { pdf_url?: string; landing_page_url?: string };
  concepts?: { display_name?: string }[];
}

interface OpenAlexResponse {
  results?: OpenAlexWork[];
}

function reconstructAbstract(index: Record<string, number[]> | undefined): string | null {
  if (!index) return null;
  const positions: [number, string][] = [];
  for (const [word, indices] of Object.entries(index)) {
    for (const i of indices) positions.push([i, word]);
  }
  if (positions.length === 0) return null;
  positions.sort((a, b) => a[0] - b[0]);
  return truncateWords(positions.map(([, w]) => w).join(" "), 220);
}

function extractDoi(doiUrl?: string): string | null {
  if (!doiUrl) return null;
  return doiUrl.replace(/^https?:\/\/doi\.org\//i, "");
}

async function runQuery(
  filterExtra: string | null,
  params: SourceSearchParams
): Promise<OpenAlexWork[]> {
  const url = new URL("https://api.openalex.org/works");
  url.searchParams.set("search", params.query);
  url.searchParams.set("per-page", String(params.pageSize));
  url.searchParams.set("page", String(params.page));
  const filters = [filterExtra, params.yearFrom ? `from_publication_date:${params.yearFrom}-01-01` : null].filter(
    Boolean
  );
  if (filters.length) url.searchParams.set("filter", filters.join(","));
  if (process.env.SCHOLAR_CONTACT_EMAIL) {
    url.searchParams.set("mailto", process.env.SCHOLAR_CONTACT_EMAIL);
  }

  const data = await fetchJson<OpenAlexResponse>(url.toString());
  return data?.results || [];
}

function toScholarResult(item: OpenAlexWork): ScholarResult | null {
  const title = item.title || item.display_name;
  if (!title) return null;
  const abstract = reconstructAbstract(item.abstract_inverted_index);
  const venue = item.primary_location?.source?.display_name ?? null;
  const { type, evidenceLevel } = classifyStudy({
    title,
    abstract,
    venue,
    sourceTypeHint: item.type,
  });

  const openAccessUrl =
    item.best_oa_location?.pdf_url ||
    item.primary_location?.pdf_url ||
    (item.open_access?.is_oa ? item.open_access.oa_url ?? null : null) ||
    null;

  return {
    id: `openAlex:${item.id ?? title}`,
    source: "openAlex",
    type,
    title,
    authors: (item.authorships || []).map(a => a.author?.display_name).filter(Boolean) as string[],
    year: item.publication_year ?? null,
    venue,
    publisher: null,
    doi: extractDoi(item.doi),
    isbn: null,
    pmid: null,
    arxivId: null,
    abstract,
    keywords: (item.concepts || []).map(c => c.display_name).filter(Boolean).slice(0, 8) as string[],
    citationCount: item.cited_by_count ?? null,
    openAccessUrl,
    url: item.primary_location?.landing_page_url ?? item.best_oa_location?.landing_page_url ?? null,
    language: item.language ?? null,
    evidenceLevel,
    studyTypeLabel: null,
    coverUrl: null,
    pageCount: null,
    editionCount: null,
    openLibraryUrl: null,
    googleBooksUrl: null,
    relevanceScore: 0,
  };
}

export async function searchOpenAlex(params: SourceSearchParams): Promise<ScholarResult[]> {
  const items = await runQuery(null, params);
  return items.map(toScholarResult).filter((r): r is ScholarResult => r !== null);
}

export async function searchOpenAlexByAuthor(
  author: string,
  params: SourceSearchParams
): Promise<ScholarResult[]> {
  const items = await runQuery(`authorships.author.display_name.search:${encodeURIComponent(author)}`, params);
  return items.map(toScholarResult).filter((r): r is ScholarResult => r !== null);
}

export async function searchOpenAlexByInstitution(
  institution: string,
  params: SourceSearchParams
): Promise<ScholarResult[]> {
  const items = await runQuery(
    `authorships.institutions.display_name.search:${encodeURIComponent(institution)}`,
    params
  );
  return items.map(toScholarResult).filter((r): r is ScholarResult => r !== null);
}

export async function searchOpenAlexByJournal(
  journal: string,
  params: SourceSearchParams
): Promise<ScholarResult[]> {
  const items = await runQuery(
    `primary_location.source.display_name.search:${encodeURIComponent(journal)}`,
    params
  );
  return items.map(toScholarResult).filter((r): r is ScholarResult => r !== null);
}
