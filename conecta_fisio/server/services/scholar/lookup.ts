import type { ScholarResult } from "../../../shared/scholar/types";
import { lookupCrossrefByDoi } from "./sources/crossref";
import { lookupOpenLibraryByIsbn } from "./sources/openLibrary";
import { lookupPubmedByPmid } from "./sources/pubmed";

export async function lookupByDoi(doi: string): Promise<ScholarResult | null> {
  const cleaned = doi.trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, "");
  return lookupCrossrefByDoi(cleaned);
}

export async function lookupByPmid(pmid: string): Promise<ScholarResult | null> {
  const cleaned = pmid.trim().replace(/\D/g, "");
  if (!cleaned) return null;
  return lookupPubmedByPmid(cleaned);
}

export async function lookupByIsbn(isbn: string): Promise<ScholarResult | null> {
  const cleaned = isbn.trim().replace(/[^0-9Xx]/g, "");
  if (!cleaned) return null;
  return lookupOpenLibraryByIsbn(cleaned);
}
