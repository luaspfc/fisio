import { studyTypeLabel } from "../../../shared/scholar/labels";
import type { ScholarItemType } from "../../../shared/scholar/types";

export { studyTypeLabel };

/**
 * Heuristic study-type / evidence-level classifier.
 *
 * None of the free public APIs consistently expose a normalized "evidence level".
 * Instead we pattern-match the title/abstract/venue against well known study-design
 * vocabulary (PT/EN/ES) and fall back to the source's own type hint. This is an
 * approximation intended to help triage results, not a substitute for a full
 * critical appraisal (GRADE, Oxford CEBM, etc.).
 */

const PATTERNS: { type: ScholarItemType; stars: number; regex: RegExp }[] = [
  {
    type: "meta_analysis",
    stars: 5,
    regex: /meta[- ]?analy|metanálise|metaanalisis|meta[- ]?análisis/i,
  },
  {
    type: "systematic_review",
    stars: 5,
    regex: /systematic review|revis[ãa]o sistem[áa]tica|revisi[óo]n sistem[áa]tica/i,
  },
  {
    type: "clinical_trial",
    stars: 4,
    regex: /randomi[sz]ed controlled trial|\brct\b|ensaio cl[íi]nico randomizado|ensayo cl[íi]nico|clinical trial/i,
  },
  {
    type: "review",
    stars: 3,
    regex: /\breview\b|narrative review|revis[ãa]o (de literatura|integrativa|narrativa)|revisi[óo]n (de la literatura|narrativa)/i,
  },
  {
    type: "observational_study",
    stars: 3,
    regex: /cohort|coorte|case-control|caso[- ]controle|caso[- ]control|observational stud|estudo observacional|estudio observacional|cross-sectional|transversal/i,
  },
  {
    type: "case_report",
    stars: 2,
    regex: /case report|relato de caso|s[ée]rie de casos|case series|reporte de caso/i,
  },
  {
    type: "thesis",
    stars: 2,
    regex: /\bthesis\b|\bdissertation\b|\btese\b|\bdissertac?[aã]o\b|\btesis\b/i,
  },
];

/**
 * Classifies a work from its textual signals. `sourceTypeHint` carries the
 * type the origin API already assigned (e.g. crossref "book-chapter", openAlex
 * "dissertation") for cases the text alone doesn't reveal.
 */
export function classifyStudy(input: {
  title?: string | null;
  abstract?: string | null;
  venue?: string | null;
  sourceTypeHint?: string | null;
}): { type: ScholarItemType; evidenceLevel: number } {
  const haystack = [input.title, input.abstract, input.venue].filter(Boolean).join(" \n ");

  for (const pattern of PATTERNS) {
    if (pattern.regex.test(haystack)) {
      return { type: pattern.type, evidenceLevel: pattern.stars };
    }
  }

  const hint = (input.sourceTypeHint || "").toLowerCase();
  if (hint.includes("book-chapter") || hint.includes("chapter")) {
    return { type: "book_chapter", evidenceLevel: 2 };
  }
  if (hint.includes("book") || hint.includes("monograph")) {
    return { type: "book", evidenceLevel: 2 };
  }
  if (hint.includes("dissertation") || hint.includes("thesis")) {
    return { type: "thesis", evidenceLevel: 2 };
  }
  if (hint.includes("posted-content") || hint.includes("preprint")) {
    return { type: "preprint", evidenceLevel: 2 };
  }
  if (hint.includes("review")) {
    return { type: "review", evidenceLevel: 3 };
  }

  return { type: "article", evidenceLevel: 3 };
}

const STOPWORDS = new Set(
  `a o os as um uma uns umas de do da dos das em no na nos nas para por com sem sobre entre
   e ou mas que se ao à às aos como não sim é foi são the a an of in on for to with without about
   between and or but is was are be been being this that these those we our their its his her
   study studies analysis results conclusion conclusions background methods method objective
   objectives introduction discussion la el los las de en un una y o pero que es fue son para
   con sin sobre entre como no si al a las este esta estos estas`
    .split(/\s+/)
    .filter(Boolean)
);

/**
 * Very small extractive keyword generator used when a source doesn't supply
 * subject terms/concepts of its own (e.g. PubMed, arXiv).
 */
export function extractKeywords(text: string | null | undefined, limit = 6): string[] {
  if (!text) return [];
  const words = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 4 && !STOPWORDS.has(w));

  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1);

  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([term]) => term);
}
