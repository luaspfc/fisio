import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFavorites } from "@/hooks/useFavorites";
import { trpc } from "@/lib/trpc";
import type { ScholarResult } from "@shared/scholar/types";
import {
  BookMarked,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  Loader2,
  Quote,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { useState } from "react";
import { ExportMenu } from "./ExportMenu";

const SOURCE_LABELS: Record<ScholarResult["source"], string> = {
  semanticScholar: "Semantic Scholar",
  crossref: "Crossref",
  openAlex: "OpenAlex",
  pubmed: "PubMed",
  europepmc: "Europe PMC",
  arxiv: "arXiv",
  openLibrary: "Open Library",
  googleBooks: "Google Books",
};

function EvidenceStars({ level }: { level: number | null }) {
  if (!level) return null;
  return (
    <div className="flex items-center gap-0.5" title={`Qualidade metodológica estimada: ${level}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`size-3.5 ${i < level ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
      ))}
    </div>
  );
}

export function ResultCard({ result }: { result: ScholarResult }) {
  const [expanded, setExpanded] = useState(false);
  const { isFavorited, toggleFavorite, collectionNames, addToCollection } = useFavorites();
  const favorited = isFavorited(result.id);

  const summarizeMutation = trpc.scholar.summarize.useMutation();
  const isBook = result.type === "book" || result.type === "book_chapter";

  const handleSummarize = () => {
    if (summarizeMutation.data || summarizeMutation.isPending) return;
    summarizeMutation.mutate({
      title: result.title,
      abstract: result.abstract,
      studyTypeLabel: result.studyTypeLabel,
    });
  };

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary">{SOURCE_LABELS[result.source]}</Badge>
          {result.studyTypeLabel && <Badge variant="outline">{result.studyTypeLabel}</Badge>}
          {result.openAccessUrl && (
            <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
              Open Access
            </Badge>
          )}
          <EvidenceStars level={result.evidenceLevel} />
        </div>
        <h3 className="text-base font-semibold leading-snug">{result.title}</h3>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          {result.authors.length > 0 && (
            <span className="flex items-center gap-1">
              <Users className="size-3.5" />
              {result.authors.slice(0, 4).join(", ")}
              {result.authors.length > 4 ? " et al." : ""}
            </span>
          )}
          {result.year && <span>{result.year}</span>}
          {(result.venue || result.publisher) && <span>{result.venue || result.publisher}</span>}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex gap-4">
          {isBook && result.coverUrl && (
            <img
              src={result.coverUrl}
              alt={`Capa de ${result.title}`}
              className="h-28 w-20 shrink-0 rounded object-cover shadow-sm"
              loading="lazy"
            />
          )}
          <div className="min-w-0 flex-1 space-y-2">
            {result.abstract && <p className="line-clamp-3 text-sm text-muted-foreground">{result.abstract}</p>}

            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              {result.doi && <span>DOI: {result.doi}</span>}
              {result.isbn && <span>ISBN: {result.isbn}</span>}
              {result.citationCount != null && (
                <span className="flex items-center gap-1">
                  <Quote className="size-3.5" /> {result.citationCount} citações
                </span>
              )}
              {isBook && result.pageCount && <span>{result.pageCount} páginas</span>}
              {isBook && result.editionCount && <span>{result.editionCount} edições</span>}
            </div>

            {result.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {result.keywords.slice(0, 6).map(kw => (
                  <Badge key={kw} variant="outline" className="text-[11px] font-normal">
                    {kw}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t pt-3">
          {(result.url || result.openAccessUrl) && (
            <Button size="sm" asChild>
              <a href={result.url || result.openAccessUrl || "#"} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-1.5 size-3.5" />
                Abrir
              </a>
            </Button>
          )}
          {result.openAccessUrl && result.url && result.openAccessUrl !== result.url && (
            <Button size="sm" variant="outline" asChild>
              <a href={result.openAccessUrl} target="_blank" rel="noreferrer">
                <FileText className="mr-1.5 size-3.5" />
                PDF
              </a>
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant={favorited ? "default" : "outline"}>
                <BookMarked className="mr-1.5 size-3.5" />
                {favorited ? "Salvo" : "Salvar"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {collectionNames.map(name => (
                <DropdownMenuItem key={name} onClick={() => addToCollection(result, name)}>
                  {name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem onClick={() => toggleFavorite(result)} className="text-destructive focus:text-destructive">
                Remover de todas as coleções
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ExportMenu results={[result]} filenameBase={result.id.replace(/[^a-z0-9]/gi, "-")} />

          {!isBook && result.abstract && (
            <Button size="sm" variant="ghost" onClick={handleSummarize} disabled={summarizeMutation.isPending}>
              {summarizeMutation.isPending ? (
                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
              ) : (
                <Sparkles className="mr-1.5 size-3.5" />
              )}
              Resumo com IA
            </Button>
          )}

          <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setExpanded(v => !v)}>
            {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </Button>
        </div>

        {expanded && summarizeMutation.data && (
          <div className="rounded-lg border bg-muted/40 p-3 text-sm space-y-2">
            {!summarizeMutation.data.geradoPorIA && (
              <p className="text-xs text-muted-foreground italic">
                IA indisponível no momento — exibindo resumo extrativo do abstract original.
              </p>
            )}
            <p>
              <span className="font-medium">Resumo em linguagem simples: </span>
              {summarizeMutation.data.resumoSimples}
            </p>
            {summarizeMutation.data.achadosPrincipais.length > 0 && (
              <div>
                <span className="font-medium">Principais achados:</span>
                <ul className="ml-4 list-disc">
                  {summarizeMutation.data.achadosPrincipais.map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {summarizeMutation.data.aplicacaoClinica && (
              <p>
                <span className="font-medium">Aplicação clínica: </span>
                {summarizeMutation.data.aplicacaoClinica}
              </p>
            )}
            {summarizeMutation.data.limitacoes && (
              <p>
                <span className="font-medium">Limitações: </span>
                {summarizeMutation.data.limitacoes}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
