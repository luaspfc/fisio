/**
 * Shared types for Scholar Finder AI — the scientific literature search module.
 * Used by both server (aggregation of public APIs) and client (rendering/exports).
 */

export type ScholarSourceId =
  | "semanticScholar"
  | "crossref"
  | "openAlex"
  | "pubmed"
  | "europepmc"
  | "arxiv"
  | "openLibrary"
  | "googleBooks";

export type ScholarItemType =
  | "systematic_review"
  | "meta_analysis"
  | "clinical_trial"
  | "review"
  | "observational_study"
  | "case_report"
  | "thesis"
  | "book"
  | "book_chapter"
  | "preprint"
  | "article";

export type ScholarResultTypeFilter =
  | "all"
  | "articles"
  | "books"
  | "reviews"
  | "clinical_trials"
  | "theses";

export type ScholarYearFilter = "5" | "10" | "all";

export type ScholarLanguageFilter = "pt" | "en" | "es" | "all";

export type ScholarAreaFilter =
  | "saude"
  | "engenharia"
  | "ciencias_sociais"
  | "tecnologia"
  | "educacao"
  | "all";

export interface ScholarSearchFilters {
  type: ScholarResultTypeFilter;
  yearRange: ScholarYearFilter;
  language: ScholarLanguageFilter;
  area: ScholarAreaFilter;
}

export interface ScholarResult {
  /** Stable id, prefixed by source, used as React key and for dedup/favorites. */
  id: string;
  source: ScholarSourceId;
  type: ScholarItemType;
  title: string;
  authors: string[];
  year: number | null;
  /** Journal name for articles, publisher for books. */
  venue: string | null;
  publisher: string | null;
  doi: string | null;
  isbn: string | null;
  pmid: string | null;
  arxivId: string | null;
  abstract: string | null;
  keywords: string[];
  citationCount: number | null;
  /** Direct link to an open-access full text / PDF, when available. */
  openAccessUrl: string | null;
  /** Canonical landing page for the item (publisher page, DOI resolver, etc). */
  url: string | null;
  language: string | null;
  /** 1-5 heuristic evidence-quality rating (stars), derived from study type. */
  evidenceLevel: number | null;
  /** Human readable study type label, e.g. "Revisão Sistemática". */
  studyTypeLabel: string | null;
  coverUrl: string | null;
  pageCount: number | null;
  editionCount: number | null;
  openLibraryUrl: string | null;
  googleBooksUrl: string | null;
  /** 0-1 relative relevance score computed by the aggregator. */
  relevanceScore: number;
}

export interface ScholarStats {
  totalResults: number;
  totalArticles: number;
  totalBooks: number;
  openAccessCount: number;
  averageYear: number | null;
  topAuthors: { name: string; count: number }[];
  topVenues: { name: string; count: number }[];
  yearDistribution: { year: number; count: number }[];
  studyTypeDistribution: { type: ScholarItemType; label: string; count: number }[];
  keywordCloud: { term: string; count: number }[];
}

export interface ScholarSearchInput {
  query: string;
  type: ScholarResultTypeFilter;
  yearRange: ScholarYearFilter;
  language: ScholarLanguageFilter;
  area: ScholarAreaFilter;
  page: number;
}

export interface ScholarSearchOutput {
  results: ScholarResult[];
  stats: ScholarStats;
  page: number;
  hasMore: boolean;
  sourcesQueried: ScholarSourceId[];
  sourcesFailed: ScholarSourceId[];
}

export interface ScholarSummary {
  resumoSimples: string;
  achadosPrincipais: string[];
  aplicacaoClinica: string;
  limitacoes: string;
  qualidadeMetodologica: number;
  geradoPorIA: boolean;
}
