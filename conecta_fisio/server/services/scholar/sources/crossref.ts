import type { ScholarResult } from "../../../../shared/scholar/types";
import { classifyStudy, extractKeywords } from "../classify";
import { fetchJson, stripTags, truncateWords, SCHOLAR_USER_AGENT } from "../httpUtil";
import type { SourceSearchParams } from "./types";

interface CrossrefAuthor {
  given?: string;
  family?: string;
  name?: string;
}

interface CrossrefItem {
  DOI?: string;
  title?: string[];
  author?: CrossrefAuthor[];
  "container-title"?: string[];
  publisher?: string;
  type?: string;
  abstract?: string;
  "is-referenced-by-count"?: number;
  ISBN?: string[];
  URL?: string;
  language?: string;
  subject?: string[];
  issued?: { "date-parts"?: number[][] };
  published?: { "date-parts"?: number[][] };
  link?: { URL: string; "content-type"?: string }[];
}

interface CrossrefResponse {
  message?: {
    items?: CrossrefItem[];
  };
}

function pickYear(item: CrossrefItem): number | null {
  const parts = item.issued?.["date-parts"]?.[0] || item.published?.["date-parts"]?.[0];
  return parts?.[0] ?? null;
}

function pickAuthors(item: CrossrefItem): string[] {
  return (item.author || [])
    .map(a => a.name || [a.given, a.family].filter(Boolean).join(" "))
    .filter(Boolean);
}

function pickOpenAccessUrl(item: CrossrefItem): string | null {
  const pdfLink = item.link?.find(l => (l["content-type"] || "").includes("pdf"));
  return pdfLink?.URL ?? null;
}

export function mapCrossrefItem(item: CrossrefItem): ScholarResult | null {
  const title = item.title?.[0];
  if (!title) return null;

  const abstract = truncateWordsOrNull(stripTags(item.abstract));
  const venue = item["container-title"]?.[0] ?? null;
  const { type, evidenceLevel } = classifyStudy({
    title,
    abstract,
    venue,
    sourceTypeHint: item.type,
  });

  return {
    id: `crossref:${item.DOI ?? title}`,
    source: "crossref",
    type,
    title,
    authors: pickAuthors(item),
    year: pickYear(item),
    venue: item.ISBN?.length ? null : venue,
    publisher: item.publisher ?? null,
    doi: item.DOI ?? null,
    isbn: item.ISBN?.[0] ?? null,
    pmid: null,
    arxivId: null,
    abstract,
    keywords: item.subject?.slice(0, 8) ?? extractKeywords(abstract),
    citationCount: item["is-referenced-by-count"] ?? null,
    openAccessUrl: pickOpenAccessUrl(item),
    url: item.URL ?? (item.DOI ? `https://doi.org/${item.DOI}` : null),
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

export async function searchCrossref(params: SourceSearchParams): Promise<ScholarResult[]> {
  const offset = (params.page - 1) * params.pageSize;
  const url = new URL("https://api.crossref.org/works");
  url.searchParams.set("query.bibliographic", params.query);
  url.searchParams.set("rows", String(params.pageSize));
  url.searchParams.set("offset", String(offset));
  url.searchParams.set(
    "select",
    "DOI,title,author,container-title,publisher,type,abstract,is-referenced-by-count,ISBN,URL,language,subject,issued,published,link"
  );
  if (params.yearFrom) {
    url.searchParams.set("filter", `from-pub-date:${params.yearFrom}-01-01`);
  }

  const data = await fetchJson<CrossrefResponse>(url.toString(), {
    headers: { "User-Agent": SCHOLAR_USER_AGENT },
  });
  const items = data?.message?.items || [];

  return items.map(mapCrossrefItem).filter((r): r is ScholarResult => r !== null);
}

export async function lookupCrossrefByDoi(doi: string): Promise<ScholarResult | null> {
  const url = `https://api.crossref.org/works/${encodeURIComponent(doi)}`;
  const data = await fetchJson<{ message?: CrossrefItem }>(url, {
    headers: { "User-Agent": SCHOLAR_USER_AGENT },
  });
  return data?.message ? mapCrossrefItem(data.message) : null;
}

function truncateWordsOrNull(text: string | null): string | null {
  return text ? truncateWords(text, 220) : null;
}
