import { XMLParser } from "fast-xml-parser";
import type { ScholarResult } from "../../../../shared/scholar/types";
import { classifyStudy } from "../classify";
import { fetchText, truncateWords } from "../httpUtil";
import type { SourceSearchParams } from "./types";

const REPEATABLE_TAGS = new Set(["entry", "author", "category", "link"]);

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  isArray: (tagName: string) => REPEATABLE_TAGS.has(tagName),
});

function textOf(node: unknown): string | null {
  if (node == null) return null;
  if (typeof node === "string") return node.trim();
  if (typeof node === "object" && "#text" in (node as Record<string, unknown>)) {
    return String((node as Record<string, unknown>)["#text"]).trim();
  }
  return null;
}

/** Only worth querying arXiv for topics likely to have preprints (STEM-leaning). */
export async function searchArxiv(params: SourceSearchParams): Promise<ScholarResult[]> {
  const url = new URL("http://export.arxiv.org/api/query");
  url.searchParams.set("search_query", `all:${params.query}`);
  url.searchParams.set("start", String((params.page - 1) * params.pageSize));
  url.searchParams.set("max_results", String(params.pageSize));
  url.searchParams.set("sortBy", "relevance");

  const xml = await fetchText(url.toString(), undefined, 9000);
  if (!xml) return [];

  let parsed: any;
  try {
    parsed = parser.parse(xml);
  } catch (error) {
    console.warn("[scholar] failed to parse arXiv XML:", (error as Error).message);
    return [];
  }

  const entries = parsed?.feed?.entry || [];
  const list = Array.isArray(entries) ? entries : [entries];

  return list
    .map((entry: any): ScholarResult | null => {
      const title = textOf(entry?.title)?.replace(/\s+/g, " ");
      if (!title) return null;

      const abstract = textOf(entry?.summary);
      const truncatedAbstract = abstract ? truncateWords(abstract.replace(/\s+/g, " "), 220) : null;
      const idUrl: string | null = textOf(entry?.id);
      const arxivId = idUrl?.match(/abs\/([^v]+)/)?.[1] ?? null;
      const published = textOf(entry?.published);
      const year = published ? Number(published.slice(0, 4)) : null;
      const journalRef = textOf(entry?.["arxiv:journal_ref"]);

      const authorsNode = entry?.author;
      const authorList = Array.isArray(authorsNode) ? authorsNode : authorsNode ? [authorsNode] : [];
      const authors = authorList.map((a: any) => textOf(a?.name)).filter(Boolean) as string[];

      const categoriesNode = entry?.category;
      const categoryList = Array.isArray(categoriesNode) ? categoriesNode : categoriesNode ? [categoriesNode] : [];
      const keywords = categoryList.map((c: any) => c?.["@_term"]).filter(Boolean).slice(0, 8);

      const linksNode = entry?.link;
      const linkList = Array.isArray(linksNode) ? linksNode : linksNode ? [linksNode] : [];
      const pdfLink = linkList.find((l: any) => l?.["@_title"] === "pdf")?.["@_href"];

      const { evidenceLevel } = classifyStudy({ title, abstract: truncatedAbstract, venue: journalRef });

      return {
        id: `arxiv:${arxivId ?? title}`,
        source: "arxiv",
        type: "preprint",
        title,
        authors,
        year,
        venue: journalRef ?? "arXiv preprint",
        publisher: null,
        doi: textOf(entry?.["arxiv:doi"]),
        isbn: null,
        pmid: null,
        arxivId,
        abstract: truncatedAbstract,
        keywords,
        citationCount: null,
        openAccessUrl: pdfLink ?? (arxivId ? `https://arxiv.org/pdf/${arxivId}` : null),
        url: idUrl,
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
    })
    .filter((r: ScholarResult | null): r is ScholarResult => r !== null);
}
