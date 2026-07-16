import { computeScholarStats } from "../../../shared/scholar/stats";
import type {
  ScholarAreaFilter,
  ScholarItemType,
  ScholarResult,
  ScholarSearchInput,
  ScholarSearchOutput,
  ScholarSourceId,
} from "../../../shared/scholar/types";
import { searchArxiv } from "./sources/arxiv";
import { searchCrossref } from "./sources/crossref";
import { searchEuropePmc } from "./sources/europepmc";
import { searchGoogleBooks } from "./sources/googleBooks";
import { searchOpenAlex } from "./sources/openAlex";
import { searchOpenLibrary } from "./sources/openLibrary";
import { searchPubmed } from "./sources/pubmed";
import { searchSemanticScholar } from "./sources/semanticScholar";
import type { SourceSearchParams } from "./sources/types";

const SCIENCE_SOURCES: { id: ScholarSourceId; run: (p: SourceSearchParams) => Promise<ScholarResult[]> }[] = [
  { id: "crossref", run: searchCrossref },
  { id: "openAlex", run: searchOpenAlex },
  { id: "semanticScholar", run: searchSemanticScholar },
  { id: "pubmed", run: searchPubmed },
  { id: "europepmc", run: searchEuropePmc },
  { id: "arxiv", run: searchArxiv },
];

const BOOK_SOURCES: { id: ScholarSourceId; run: (p: SourceSearchParams) => Promise<ScholarResult[]> }[] = [
  { id: "openLibrary", run: searchOpenLibrary },
  { id: "googleBooks", run: searchGoogleBooks },
];

const BOOK_TYPES = new Set<ScholarItemType>(["book", "book_chapter"]);

const TYPE_FILTER_MATCHERS: Record<string, (t: ScholarItemType) => boolean> = {
  all: () => true,
  articles: t => t === "article" || t === "preprint" || t === "observational_study" || t === "case_report",
  books: t => BOOK_TYPES.has(t),
  reviews: t => t === "review" || t === "systematic_review" || t === "meta_analysis",
  clinical_trials: t => t === "clinical_trial",
  theses: t => t === "thesis",
};

const AREA_KEYWORDS: Record<Exclude<ScholarAreaFilter, "all">, RegExp> = {
  saude:
    /health|saúde|salud|medic|clinical|clínic|patient|paciente|therap|terapia|rehabilit|reabilita|disease|doença|enfermedad|physio|fisioterap/i,
  engenharia: /engineering|engenharia|ingeniería|mechanical|civil|structural|materials science/i,
  ciencias_sociais: /social science|ciências sociais|ciencias sociales|psychology|psicologia|sociology|sociologia|education science/i,
  tecnologia: /technology|tecnologia|tecnología|computer science|computação|informática|artificial intelligence|inteligência artificial|software/i,
  educacao: /education|educação|educación|teaching|ensino|pedagog|learning|aprendizagem/i,
};

const LANGUAGE_ALIASES: Record<string, string[]> = {
  pt: ["pt", "por", "portuguese"],
  en: ["en", "eng", "english"],
  es: ["es", "spa", "spanish", "español"],
};

function yearFromRange(yearRange: ScholarSearchInput["yearRange"]): number | null {
  if (yearRange === "all") return null;
  const currentYear = new Date().getFullYear();
  return currentYear - Number(yearRange);
}

function languageCode(input: string, filters: ScholarSearchInput): string | null {
  return filters.language === "all" ? null : filters.language;
}

function matchesLanguage(result: ScholarResult, filter: ScholarSearchInput["language"]): boolean {
  if (filter === "all") return true;
  if (!result.language) return true; // unknown language: don't over-filter
  const normalized = result.language.toLowerCase();
  return LANGUAGE_ALIASES[filter].some(alias => normalized.startsWith(alias));
}

function matchesArea(result: ScholarResult, area: ScholarAreaFilter): boolean {
  if (area === "all") return true;
  const haystack = [result.venue, result.abstract, ...(result.keywords || [])].filter(Boolean).join(" ");
  return AREA_KEYWORDS[area].test(haystack);
}

function normalizeTitleKey(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function dedupKey(result: ScholarResult): string {
  if (result.doi) return `doi:${result.doi.toLowerCase()}`;
  if (result.isbn) return `isbn:${result.isbn.replace(/[^0-9x]/gi, "")}`;
  return `title:${normalizeTitleKey(result.title)}:${result.year ?? ""}`;
}

function mergeDuplicate(existing: ScholarResult, incoming: ScholarResult): ScholarResult {
  return {
    ...existing,
    abstract: existing.abstract ?? incoming.abstract,
    citationCount: existing.citationCount ?? incoming.citationCount,
    openAccessUrl: existing.openAccessUrl ?? incoming.openAccessUrl,
    keywords: existing.keywords.length ? existing.keywords : incoming.keywords,
    coverUrl: existing.coverUrl ?? incoming.coverUrl,
    doi: existing.doi ?? incoming.doi,
    pmid: existing.pmid ?? incoming.pmid,
    evidenceLevel: existing.evidenceLevel ?? incoming.evidenceLevel,
  };
}

function relevanceScore(result: ScholarResult, queryTerms: string[]): number {
  const citationScore = Math.log1p(result.citationCount ?? 0) / Math.log1p(1000);
  const currentYear = new Date().getFullYear();
  const recencyScore = result.year ? Math.max(0, 1 - Math.min(currentYear - result.year, 30) / 30) : 0.3;
  const titleLower = result.title.toLowerCase();
  const matched = queryTerms.filter(t => titleLower.includes(t)).length;
  const titleScore = queryTerms.length ? matched / queryTerms.length : 0;

  return Math.min(1, citationScore * 0.4 + recencyScore * 0.3 + titleScore * 0.3);
}

export async function aggregateSearch(input: ScholarSearchInput): Promise<ScholarSearchOutput> {
  const yearFrom = yearFromRange(input.yearRange);
  const lang = languageCode(input.query, input);
  const sourceGroup = input.type === "books" ? BOOK_SOURCES : input.type === "all" ? [...SCIENCE_SOURCES, ...BOOK_SOURCES] : SCIENCE_SOURCES;
  const perSourcePageSize = sourceGroup.length > 4 ? 12 : 20;

  const sourceParams: SourceSearchParams = {
    query: input.query,
    page: input.page,
    pageSize: perSourcePageSize,
    yearFrom,
    language: lang,
  };

  const settled = await Promise.allSettled(sourceGroup.map(s => s.run(sourceParams)));

  const sourcesQueried: ScholarSourceId[] = [];
  const sourcesFailed: ScholarSourceId[] = [];
  const rawResults: ScholarResult[] = [];

  settled.forEach((outcome, index) => {
    const sourceId = sourceGroup[index].id;
    sourcesQueried.push(sourceId);
    if (outcome.status === "fulfilled") {
      rawResults.push(...outcome.value);
    } else {
      sourcesFailed.push(sourceId);
      console.warn(`[scholar] source ${sourceId} failed:`, outcome.reason);
    }
  });

  const typeMatcher = TYPE_FILTER_MATCHERS[input.type] ?? TYPE_FILTER_MATCHERS.all;
  const filtered = rawResults.filter(
    r => typeMatcher(r.type) && matchesLanguage(r, input.language) && matchesArea(r, input.area)
  );

  const dedupMap = new Map<string, ScholarResult>();
  for (const result of filtered) {
    const key = dedupKey(result);
    const existing = dedupMap.get(key);
    dedupMap.set(key, existing ? mergeDuplicate(existing, result) : result);
  }

  const queryTerms = input.query
    .toLowerCase()
    .split(/\s+/)
    .filter(t => t.length > 2);

  const scored = Array.from(dedupMap.values()).map(r => ({ ...r, relevanceScore: relevanceScore(r, queryTerms) }));
  scored.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return {
    results: scored,
    stats: computeScholarStats(scored),
    page: input.page,
    hasMore: rawResults.length >= sourceGroup.length * perSourcePageSize * 0.5,
    sourcesQueried,
    sourcesFailed,
  };
}
