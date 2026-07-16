import type { ScholarResult } from "@shared/scholar/types";

function firstAuthorSurname(result: ScholarResult): string {
  const first = result.authors[0];
  if (!first) return "Anônimo";
  const parts = first.trim().split(/\s+/);
  return parts[parts.length - 1];
}

function bibtexKey(result: ScholarResult): string {
  return `${firstAuthorSurname(result).replace(/[^a-zA-Z0-9]/g, "")}${result.year ?? ""}`;
}

function escapeBibtex(value: string): string {
  return value.replace(/[{}]/g, "");
}

export function toBibtex(result: ScholarResult): string {
  const entryType = result.type === "book" || result.type === "book_chapter" ? "book" : "article";
  const fields: [string, string | null][] = [
    ["title", result.title],
    ["author", result.authors.join(" and ") || null],
    ["year", result.year ? String(result.year) : null],
    [entryType === "book" ? "publisher" : "journal", result.venue || result.publisher],
    ["doi", result.doi],
    ["isbn", result.isbn],
    ["url", result.url || result.openAccessUrl],
    ["abstract", result.abstract],
  ];

  const body = fields
    .filter(([, value]) => value)
    .map(([key, value]) => `  ${key} = {${escapeBibtex(value as string)}}`)
    .join(",\n");

  return `@${entryType}{${bibtexKey(result)},\n${body}\n}`;
}

export function toRis(result: ScholarResult): string {
  const isBook = result.type === "book" || result.type === "book_chapter";
  const lines: string[] = [`TY  - ${isBook ? "BOOK" : "JOUR"}`];
  for (const author of result.authors) lines.push(`AU  - ${author}`);
  lines.push(`TI  - ${result.title}`);
  if (result.year) lines.push(`PY  - ${result.year}`);
  if (result.venue) lines.push(`${isBook ? "PB" : "JO"}  - ${result.venue}`);
  if (result.publisher && isBook) lines.push(`PB  - ${result.publisher}`);
  if (result.doi) lines.push(`DO  - ${result.doi}`);
  if (result.isbn) lines.push(`SN  - ${result.isbn}`);
  if (result.abstract) lines.push(`AB  - ${result.abstract}`);
  if (result.url) lines.push(`UR  - ${result.url}`);
  lines.push("ER  - ");
  return lines.join("\n");
}

function formatAuthorsApa(authors: string[]): string {
  if (authors.length === 0) return "";
  const formatted = authors.map(name => {
    const parts = name.trim().split(/\s+/);
    if (parts.length < 2) return name;
    const surname = parts[parts.length - 1];
    const initials = parts
      .slice(0, -1)
      .map(p => `${p[0]?.toUpperCase()}.`)
      .join(" ");
    return `${surname}, ${initials}`;
  });
  if (formatted.length === 1) return formatted[0];
  if (formatted.length <= 20) {
    return `${formatted.slice(0, -1).join(", ")}, & ${formatted[formatted.length - 1]}`;
  }
  return `${formatted.slice(0, 19).join(", ")}, ... ${formatted[formatted.length - 1]}`;
}

export function toApa(result: ScholarResult): string {
  const authors = formatAuthorsApa(result.authors);
  const year = result.year ? `(${result.year})` : "(s.d.)";
  const venue = result.venue || result.publisher;
  const parts = [authors, year, `${result.title}.`, venue ? `${venue}.` : null, result.doi ? `https://doi.org/${result.doi}` : result.url].filter(
    Boolean
  );
  return parts.join(" ");
}

function formatAuthorsVancouver(authors: string[]): string {
  return authors
    .slice(0, 6)
    .map(name => {
      const parts = name.trim().split(/\s+/);
      if (parts.length < 2) return name;
      const surname = parts[parts.length - 1];
      const initials = parts
        .slice(0, -1)
        .map(p => p[0]?.toUpperCase())
        .join("");
      return `${surname} ${initials}`;
    })
    .join(", ")
    .concat(authors.length > 6 ? ", et al" : "");
}

export function toVancouver(result: ScholarResult): string {
  const authors = formatAuthorsVancouver(result.authors);
  const venue = result.venue || result.publisher;
  const parts = [
    authors ? `${authors}.` : null,
    `${result.title}.`,
    venue ? `${venue}.` : null,
    result.year ? `${result.year}.` : null,
    result.doi ? `doi:${result.doi}` : null,
  ].filter(Boolean);
  return parts.join(" ");
}

export function toAbnt(result: ScholarResult): string {
  const authorsAbnt = result.authors
    .map(name => {
      const parts = name.trim().split(/\s+/);
      if (parts.length < 2) return name.toUpperCase();
      const surname = parts[parts.length - 1].toUpperCase();
      const initials = parts
        .slice(0, -1)
        .map(p => `${p[0]?.toUpperCase()}.`)
        .join(" ");
      return `${surname}, ${initials}`;
    })
    .join("; ");
  const venue = result.venue || result.publisher;
  const isBook = result.type === "book" || result.type === "book_chapter";
  const parts = [
    authorsAbnt ? `${authorsAbnt}.` : null,
    `${result.title}.`,
    venue ? `${venue}` : null,
    result.year ? `, ${result.year}` : null,
    isBook && result.publisher ? `. ${result.publisher}` : null,
    result.doi ? `. DOI: ${result.doi}` : null,
    ".",
  ].filter(Boolean);
  return parts.join("").replace(/\s+\./g, ".");
}

export type ExportFormat = "bibtex" | "ris" | "apa" | "vancouver" | "abnt";

const FORMATTERS: Record<ExportFormat, (r: ScholarResult) => string> = {
  bibtex: toBibtex,
  ris: toRis,
  apa: toApa,
  vancouver: toVancouver,
  abnt: toAbnt,
};

const FILE_EXTENSIONS: Record<ExportFormat, string> = {
  bibtex: "bib",
  ris: "ris",
  apa: "txt",
  vancouver: "txt",
  abnt: "txt",
};

export function formatCitations(results: ScholarResult[], format: ExportFormat): string {
  const formatter = FORMATTERS[format];
  const separator = format === "bibtex" || format === "ris" ? "\n\n" : "\n\n";
  return results.map(formatter).join(separator);
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadCitations(results: ScholarResult[], format: ExportFormat, filenameBase = "scholar-finder-export") {
  const content = formatCitations(results, format);
  downloadBlob(content, `${filenameBase}.${FILE_EXTENSIONS[format]}`, "text/plain;charset=utf-8");
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

const CSV_COLUMNS: { header: string; get: (r: ScholarResult) => string }[] = [
  { header: "Título", get: r => r.title },
  { header: "Autores", get: r => r.authors.join("; ") },
  { header: "Ano", get: r => (r.year ? String(r.year) : "") },
  { header: "Periódico/Editora", get: r => r.venue || r.publisher || "" },
  { header: "DOI", get: r => r.doi || "" },
  { header: "ISBN", get: r => r.isbn || "" },
  { header: "Tipo", get: r => r.studyTypeLabel || r.type },
  { header: "Citações", get: r => (r.citationCount != null ? String(r.citationCount) : "") },
  { header: "Open Access", get: r => (r.openAccessUrl ? "Sim" : "Não") },
  { header: "Link", get: r => r.url || r.openAccessUrl || "" },
];

export function toCsv(results: ScholarResult[]): string {
  const header = CSV_COLUMNS.map(c => csvEscape(c.header)).join(",");
  const rows = results.map(r => CSV_COLUMNS.map(c => csvEscape(c.get(r))).join(","));
  return [header, ...rows].join("\n");
}

export function downloadCsv(results: ScholarResult[], filenameBase = "scholar-finder-export") {
  downloadBlob("﻿" + toCsv(results), `${filenameBase}.csv`, "text/csv;charset=utf-8");
}

/** Excel opens an HTML table saved with an .xls extension — no extra dependency needed. */
export function downloadExcel(results: ScholarResult[], filenameBase = "scholar-finder-export") {
  const headerCells = CSV_COLUMNS.map(c => `<th>${c.header}</th>`).join("");
  const rows = results
    .map(
      r =>
        `<tr>${CSV_COLUMNS.map(c => `<td>${c.get(r).replace(/&/g, "&amp;").replace(/</g, "&lt;")}</td>`).join("")}</tr>`
    )
    .join("");
  const html = `<html><head><meta charset="UTF-8"></head><body><table border="1"><thead><tr>${headerCells}</tr></thead><tbody>${rows}</tbody></table></body></html>`;
  downloadBlob(html, `${filenameBase}.xls`, "application/vnd.ms-excel;charset=utf-8");
}

/** Opens a print-friendly view of the selected results — the user saves as PDF via the browser dialog. */
export function printAsPdf(results: ScholarResult[]) {
  const win = window.open("", "_blank");
  if (!win) return;
  const body = results
    .map(
      r => `
      <article style="margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid #ddd;">
        <h2 style="font-size:16px;margin:0 0 4px;">${r.title}</h2>
        <p style="font-size:12px;color:#555;margin:0 0 4px;">${r.authors.join(", ")} ${r.year ? `(${r.year})` : ""}</p>
        <p style="font-size:12px;color:#555;margin:0 0 8px;">${r.venue || r.publisher || ""} ${r.doi ? `· DOI: ${r.doi}` : ""}</p>
        ${r.abstract ? `<p style="font-size:12px;line-height:1.5;">${r.abstract}</p>` : ""}
      </article>`
    )
    .join("");

  win.document.write(`<!doctype html><html><head><title>Scholar Finder AI — Exportação</title></head>
    <body style="font-family: system-ui, sans-serif; padding: 24px;">
      <h1 style="font-size:20px;">Scholar Finder AI — Resultados exportados</h1>
      ${body}
      <script>window.onload = () => window.print();</script>
    </body></html>`);
  win.document.close();
}
