import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  downloadCitations,
  downloadCsv,
  downloadExcel,
  printAsPdf,
  type ExportFormat,
} from "@/lib/scholar/citationExport";
import type { ScholarResult } from "@shared/scholar/types";
import { Download } from "lucide-react";

const CITATION_FORMATS: { id: ExportFormat; label: string }[] = [
  { id: "bibtex", label: "BibTeX" },
  { id: "ris", label: "RIS" },
  { id: "apa", label: "APA" },
  { id: "vancouver", label: "Vancouver" },
  { id: "abnt", label: "ABNT" },
];

export function ExportMenu({
  results,
  filenameBase = "scholar-finder-export",
  label = "Exportar",
  size = "sm",
  variant = "outline",
}: {
  results: ScholarResult[];
  filenameBase?: string;
  label?: string;
  size?: "sm" | "default";
  variant?: "outline" | "ghost" | "default";
}) {
  const disabled = results.length === 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size={size} variant={variant} disabled={disabled}>
          <Download className="mr-1.5 size-3.5" />
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Referências</DropdownMenuLabel>
        {CITATION_FORMATS.map(format => (
          <DropdownMenuItem key={format.id} onClick={() => downloadCitations(results, format.id, filenameBase)}>
            {format.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Planilhas / Documentos</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => downloadCsv(results, filenameBase)}>CSV</DropdownMenuItem>
        <DropdownMenuItem onClick={() => downloadExcel(results, filenameBase)}>Excel (.xls)</DropdownMenuItem>
        <DropdownMenuItem onClick={() => printAsPdf(results)}>PDF (imprimir)</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
