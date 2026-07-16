import type { ScholarResult } from "../../../../shared/scholar/types";
import { classifyStudy } from "../classify";
import { fetchJson, truncateWords } from "../httpUtil";
import type { SourceSearchParams } from "./types";

interface EuropePmcResult {
  id?: string;
  pmid?: string;
  doi?: string;
  title?: string;
  authorString?: string;
  journalInfo?: { journal?: { title?: string } };
  pubYear?: string;
  abstractText?: string;
  citedByCount?: number;
  isOpenAccess?: string;
  pubTypeList?: { pubType?: string[] };
  keywordList?: { keyword?: string[] };
  fullTextUrlList?: { fullTextUrl?: { url?: string; documentStyle?: string; availability?: string }[] };
  language?: string;
}

interface EuropePmcResponse {
  nextCursorMark?: string;
  resultList?: { result?: EuropePmcResult[] };
}

const MAX_CURSOR_HOPS = 5;

async function fetchPage(query: string, cursorMark: string, pageSize: number, yearFrom: number | null) {
  const url = new URL("https://www.ebi.ac.uk/europepmc/webservices/rest/search");
  let queryStr = query;
  if (yearFrom) {
    const currentYear = new Date().getFullYear();
    queryStr += ` AND PUB_YEAR:[${yearFrom} TO ${currentYear}]`;
  }
  url.searchParams.set("query", queryStr);
  url.searchParams.set("format", "json");
  url.searchParams.set("resultType", "core");
  url.searchParams.set("pageSize", String(pageSize));
  url.searchParams.set("cursorMark", cursorMark);

  return fetchJson<EuropePmcResponse>(url.toString());
}

export async function searchEuropePmc(params: SourceSearchParams): Promise<ScholarResult[]> {
  let cursorMark = "*";
  let data: EuropePmcResponse | null = null;
  const hops = Math.min(params.page, MAX_CURSOR_HOPS);

  for (let i = 0; i < hops; i++) {
    data = await fetchPage(params.query, cursorMark, params.pageSize, params.yearFrom);
    if (!data?.nextCursorMark || data.nextCursorMark === cursorMark) break;
    cursorMark = data.nextCursorMark;
  }

  const results = data?.resultList?.result || [];

  return results
    .filter(r => r.title)
    .map((r): ScholarResult => {
      const title = r.title!;
      const abstract = r.abstractText ? truncateWords(r.abstractText, 220) : null;
      const venue = r.journalInfo?.journal?.title ?? null;
      const { type, evidenceLevel } = classifyStudy({
        title,
        abstract,
        venue,
        sourceTypeHint: r.pubTypeList?.pubType?.join(" "),
      });
      const oaLink = r.fullTextUrlList?.fullTextUrl?.find(
        u => u.documentStyle === "pdf" || u.availability === "Open access"
      );

      return {
        id: `europepmc:${r.id ?? r.pmid ?? title}`,
        source: "europepmc",
        type,
        title,
        authors: r.authorString ? r.authorString.split(", ") : [],
        year: r.pubYear ? Number(r.pubYear) : null,
        venue,
        publisher: null,
        doi: r.doi ?? null,
        isbn: null,
        pmid: r.pmid ?? null,
        arxivId: null,
        abstract,
        keywords: r.keywordList?.keyword?.slice(0, 8) ?? [],
        citationCount: r.citedByCount ?? null,
        openAccessUrl: r.isOpenAccess === "Y" ? oaLink?.url ?? null : null,
        url: r.pmid ? `https://europepmc.org/article/MED/${r.pmid}` : null,
        language: r.language ?? null,
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
