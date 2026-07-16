import { studyTypeLabel } from "./labels";
import type { ScholarItemType, ScholarResult, ScholarStats } from "./types";

const BOOK_TYPES = new Set<ScholarItemType>(["book", "book_chapter"]);

function topN<K>(map: Map<K, number>, n: number): [K, number][] {
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}

/**
 * Pure aggregate-stat computation, shared so the server can return a
 * per-page snapshot and the client can recompute the same shape over the
 * full accumulated result set as more pages load (infinite scroll).
 */
export function computeScholarStats(results: ScholarResult[]): ScholarStats {
  const totalBooks = results.filter(r => BOOK_TYPES.has(r.type)).length;
  const years = results.map(r => r.year).filter((y): y is number => Boolean(y));
  const averageYear = years.length ? Math.round(years.reduce((a, b) => a + b, 0) / years.length) : null;

  const authorCounts = new Map<string, number>();
  const venueCounts = new Map<string, number>();
  const yearCounts = new Map<number, number>();
  const typeCounts = new Map<ScholarItemType, number>();
  const keywordCounts = new Map<string, number>();

  for (const r of results) {
    for (const author of r.authors) authorCounts.set(author, (authorCounts.get(author) ?? 0) + 1);
    if (r.venue) venueCounts.set(r.venue, (venueCounts.get(r.venue) ?? 0) + 1);
    if (r.year) yearCounts.set(r.year, (yearCounts.get(r.year) ?? 0) + 1);
    typeCounts.set(r.type, (typeCounts.get(r.type) ?? 0) + 1);
    for (const kw of r.keywords) keywordCounts.set(kw, (keywordCounts.get(kw) ?? 0) + 1);
  }

  return {
    totalResults: results.length,
    totalArticles: results.length - totalBooks,
    totalBooks,
    openAccessCount: results.filter(r => r.openAccessUrl).length,
    averageYear,
    topAuthors: topN(authorCounts, 10).map(([name, count]) => ({ name, count })),
    topVenues: topN(venueCounts, 10).map(([name, count]) => ({ name, count })),
    yearDistribution: Array.from(yearCounts.entries())
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year - b.year),
    studyTypeDistribution: topN(typeCounts, 12).map(([type, count]) => ({
      type,
      label: studyTypeLabel(type),
      count,
    })),
    keywordCloud: topN(keywordCounts, 30).map(([term, count]) => ({ term, count })),
  };
}
