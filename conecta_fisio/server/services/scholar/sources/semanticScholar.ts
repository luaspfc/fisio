import type { ScholarResult } from "../../../../shared/scholar/types";
import { classifyStudy, extractKeywords } from "../classify";
import { fetchJson, truncateWords } from "../httpUtil";
import type { SourceSearchParams } from "./types";

interface S2Paper {
  paperId?: string;
  title?: string;
  abstract?: string;
  year?: number;
  venue?: string;
  authors?: { name?: string }[];
  externalIds?: { DOI?: string; PubMed?: string; ArXiv?: string; ISBN?: string };
  citationCount?: number;
  openAccessPdf?: { url?: string };
  fieldsOfStudy?: string[];
  publicationTypes?: string[];
}

interface S2SearchResponse {
  data?: S2Paper[];
}

const FIELDS =
  "title,abstract,year,venue,authors,externalIds,citationCount,openAccessPdf,fieldsOfStudy,publicationTypes";

export async function searchSemanticScholar(params: SourceSearchParams): Promise<ScholarResult[]> {
  const url = new URL("https://api.semanticscholar.org/graph/v1/paper/search");
  url.searchParams.set("query", params.query);
  url.searchParams.set("limit", String(Math.min(params.pageSize, 100)));
  url.searchParams.set("offset", String((params.page - 1) * params.pageSize));
  url.searchParams.set("fields", FIELDS);
  if (params.yearFrom) url.searchParams.set("year", `${params.yearFrom}-`);

  const headers: Record<string, string> = {};
  if (process.env.SEMANTIC_SCHOLAR_API_KEY) {
    headers["x-api-key"] = process.env.SEMANTIC_SCHOLAR_API_KEY;
  }

  const data = await fetchJson<S2SearchResponse>(url.toString(), { headers }, 9000);
  const papers = data?.data || [];

  return papers
    .filter(p => p.title)
    .map((p): ScholarResult => {
      const title = p.title!;
      const abstract = p.abstract ? truncateWords(p.abstract, 220) : null;
      const { type, evidenceLevel } = classifyStudy({
        title,
        abstract,
        venue: p.venue,
        sourceTypeHint: p.publicationTypes?.join(" "),
      });

      return {
        id: `semanticScholar:${p.paperId ?? title}`,
        source: "semanticScholar",
        type,
        title,
        authors: (p.authors || []).map(a => a.name).filter(Boolean) as string[],
        year: p.year ?? null,
        venue: p.venue ?? null,
        publisher: null,
        doi: p.externalIds?.DOI ?? null,
        isbn: p.externalIds?.ISBN ?? null,
        pmid: p.externalIds?.PubMed ?? null,
        arxivId: p.externalIds?.ArXiv ?? null,
        abstract,
        keywords: p.fieldsOfStudy?.slice(0, 8) ?? extractKeywords(abstract),
        citationCount: p.citationCount ?? null,
        openAccessUrl: p.openAccessPdf?.url ?? null,
        url: p.paperId ? `https://www.semanticscholar.org/paper/${p.paperId}` : null,
        language: null,
        evidenceLevel,
        studyTypeLabel: null,
        coverUrl: null,
        pageCount: null,
        editionCount: null,
        openLibraryUrl: null,
        googleBooksUrl: null,
        relevanceScore: 0,
      };
    });
}

interface S2RecommendationResponse {
  recommendedPapers?: S2Paper[];
}

/** "Artigos semelhantes" — Semantic Scholar's recommendation endpoint for a given paper. */
export async function fetchSimilarPapers(paperId: string, limit = 6): Promise<ScholarResult[]> {
  const url = new URL(
    `https://api.semanticscholar.org/recommendations/v1/papers/forpaper/${paperId}`
  );
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("fields", FIELDS);

  const data = await fetchJson<S2RecommendationResponse>(url.toString());
  const papers = data?.recommendedPapers || [];

  return papers
    .filter(p => p.title)
    .map((p): ScholarResult => {
      const title = p.title!;
      const abstract = p.abstract ? truncateWords(p.abstract, 220) : null;
      const { type, evidenceLevel } = classifyStudy({ title, abstract, venue: p.venue });
      return {
        id: `semanticScholar:${p.paperId ?? title}`,
        source: "semanticScholar",
        type,
        title,
        authors: (p.authors || []).map(a => a.name).filter(Boolean) as string[],
        year: p.year ?? null,
        venue: p.venue ?? null,
        publisher: null,
        doi: p.externalIds?.DOI ?? null,
        isbn: null,
        pmid: p.externalIds?.PubMed ?? null,
        arxivId: p.externalIds?.ArXiv ?? null,
        abstract,
        keywords: p.fieldsOfStudy?.slice(0, 8) ?? [],
        citationCount: p.citationCount ?? null,
        openAccessUrl: p.openAccessPdf?.url ?? null,
        url: p.paperId ? `https://www.semanticscholar.org/paper/${p.paperId}` : null,
        language: null,
        evidenceLevel,
        studyTypeLabel: null,
        coverUrl: null,
        pageCount: null,
        editionCount: null,
        openLibraryUrl: null,
        googleBooksUrl: null,
        relevanceScore: 0,
      };
    });
}
