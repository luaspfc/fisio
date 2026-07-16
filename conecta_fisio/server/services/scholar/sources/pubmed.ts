import { XMLParser } from "fast-xml-parser";
import type { ScholarResult } from "../../../../shared/scholar/types";
import { classifyStudy } from "../classify";
import { fetchJson, fetchText, truncateWords } from "../httpUtil";
import type { SourceSearchParams } from "./types";

const EUTILS_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

const REPEATABLE_TAGS = new Set([
  "PubmedArticle",
  "Author",
  "AbstractText",
  "PublicationType",
  "ELocationID",
  "Keyword",
]);

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  isArray: (tagName: string) => REPEATABLE_TAGS.has(tagName),
});

interface EsearchResponse {
  esearchresult?: { idlist?: string[] };
}

async function esearchIds(query: string, page: number, pageSize: number): Promise<string[]> {
  const url = new URL(`${EUTILS_BASE}/esearch.fcgi`);
  url.searchParams.set("db", "pubmed");
  url.searchParams.set("term", query);
  url.searchParams.set("retmode", "json");
  url.searchParams.set("retmax", String(pageSize));
  url.searchParams.set("retstart", String((page - 1) * pageSize));
  if (process.env.SCHOLAR_CONTACT_EMAIL) {
    url.searchParams.set("email", process.env.SCHOLAR_CONTACT_EMAIL);
    url.searchParams.set("tool", "ScholarFinderAI");
  }
  const data = await fetchJson<EsearchResponse>(url.toString());
  return data?.esearchresult?.idlist || [];
}

function textOf(node: unknown): string | null {
  if (node == null) return null;
  if (typeof node === "string") return node;
  if (typeof node === "object" && node !== null && "#text" in (node as Record<string, unknown>)) {
    return String((node as Record<string, unknown>)["#text"]);
  }
  return null;
}

function abstractTextOf(article: any): string | null {
  const abstractNode = article?.Abstract?.AbstractText;
  if (!abstractNode) return null;
  const pieces: string[] = Array.isArray(abstractNode) ? abstractNode : [abstractNode];
  const text = pieces
    .map(p => {
      const label = typeof p === "object" ? p?.["@_Label"] : null;
      const value = textOf(p) ?? (typeof p === "string" ? p : "");
      return label ? `${label}: ${value}` : value;
    })
    .filter(Boolean)
    .join(" ");
  return text ? truncateWords(text, 220) : null;
}

function authorsOf(article: any): string[] {
  const authorList = article?.AuthorList?.Author;
  if (!authorList) return [];
  const authors = Array.isArray(authorList) ? authorList : [authorList];
  return authors
    .map((a: any): string | null => {
      if (a?.CollectiveName) return textOf(a.CollectiveName);
      const family = textOf(a?.LastName);
      const initials = textOf(a?.Initials);
      return [family, initials].filter(Boolean).join(" ");
    })
    .filter((name): name is string => Boolean(name));
}

function doiOf(article: any): string | null {
  const elocations = article?.ELocationID;
  if (!elocations) return null;
  const list = Array.isArray(elocations) ? elocations : [elocations];
  const doiNode = list.find((e: any) => e?.["@_EIdType"] === "doi");
  return doiNode ? textOf(doiNode) : null;
}

function keywordsOf(citation: any): string[] {
  const keywordList = citation?.KeywordList?.Keyword;
  if (!keywordList) return [];
  const list = Array.isArray(keywordList) ? keywordList : [keywordList];
  return list.map((k: any) => textOf(k)).filter((k): k is string => Boolean(k)).slice(0, 8);
}

function publicationTypesOf(article: any): string {
  const types = article?.PublicationTypeList?.PublicationType;
  if (!types) return "";
  const list = Array.isArray(types) ? types : [types];
  return list.map((t: any) => textOf(t)).filter(Boolean).join(" ");
}

function yearOf(article: any): number | null {
  const pubDate = article?.Journal?.JournalIssue?.PubDate;
  const year = pubDate?.Year ? Number(textOf(pubDate.Year)) : null;
  if (year) return year;
  const medlineDate = textOf(pubDate?.MedlineDate);
  const match = medlineDate?.match(/\d{4}/);
  return match ? Number(match[0]) : null;
}

async function efetchDetails(pmids: string[]): Promise<ScholarResult[]> {
  if (pmids.length === 0) return [];
  const url = new URL(`${EUTILS_BASE}/efetch.fcgi`);
  url.searchParams.set("db", "pubmed");
  url.searchParams.set("id", pmids.join(","));
  url.searchParams.set("rettype", "abstract");
  url.searchParams.set("retmode", "xml");

  const xml = await fetchText(url.toString(), undefined, 10000);
  if (!xml) return [];

  let parsed: any;
  try {
    parsed = parser.parse(xml);
  } catch (error) {
    console.warn("[scholar] failed to parse PubMed XML:", (error as Error).message);
    return [];
  }

  const articles = parsed?.PubmedArticleSet?.PubmedArticle || [];
  const list = Array.isArray(articles) ? articles : [articles];

  return list
    .map((entry: any): ScholarResult | null => {
      const citation = entry?.MedlineCitation;
      const article = citation?.Article;
      const title = textOf(article?.ArticleTitle);
      if (!title) return null;

      const abstract = abstractTextOf(article);
      const venue = textOf(article?.Journal?.Title) ?? textOf(article?.Journal?.ISOAbbreviation);
      const { type, evidenceLevel } = classifyStudy({
        title,
        abstract,
        venue,
        sourceTypeHint: publicationTypesOf(article),
      });
      const pmid = textOf(citation?.PMID);

      return {
        id: `pubmed:${pmid ?? title}`,
        source: "pubmed",
        type,
        title,
        authors: authorsOf(article),
        year: yearOf(article),
        venue: venue ?? null,
        publisher: null,
        doi: doiOf(article),
        isbn: null,
        pmid,
        arxivId: null,
        abstract,
        keywords: keywordsOf(citation),
        citationCount: null,
        openAccessUrl: pmid ? `https://www.ncbi.nlm.nih.gov/pmc/?term=${pmid}` : null,
        url: pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` : null,
        language: textOf(article?.Language),
        evidenceLevel,
        studyTypeLabel: null,
        coverUrl: null,
        pageCount: null,
        editionCount: null,
        openLibraryUrl: null,
        googleBooksUrl: null,
        relevanceScore: 0,
      };
    })
    .filter((r: ScholarResult | null): r is ScholarResult => r !== null);
}

export async function searchPubmed(params: SourceSearchParams): Promise<ScholarResult[]> {
  let term = params.query;
  if (params.yearFrom) {
    const currentYear = new Date().getFullYear();
    term += ` AND ("${params.yearFrom}"[Date - Publication] : "${currentYear}"[Date - Publication])`;
  }
  const ids = await esearchIds(term, params.page, params.pageSize);
  return efetchDetails(ids);
}

export async function lookupPubmedByPmid(pmid: string): Promise<ScholarResult | null> {
  const results = await efetchDetails([pmid]);
  return results[0] ?? null;
}
