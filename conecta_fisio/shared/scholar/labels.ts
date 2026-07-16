import type { ScholarItemType } from "./types";

const TYPE_LABELS_PT: Record<ScholarItemType, string> = {
  systematic_review: "Revisão Sistemática",
  meta_analysis: "Meta-análise",
  clinical_trial: "Ensaio Clínico",
  review: "Revisão",
  observational_study: "Estudo Observacional",
  case_report: "Relato de Caso",
  thesis: "Tese/Dissertação",
  book: "Livro",
  book_chapter: "Capítulo de Livro",
  preprint: "Preprint",
  article: "Artigo",
};

export function studyTypeLabel(type: ScholarItemType): string {
  return TYPE_LABELS_PT[type];
}
