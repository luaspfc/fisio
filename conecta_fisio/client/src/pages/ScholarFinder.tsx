import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdvancedSearchDialog } from "@/components/scholar/AdvancedSearchDialog";
import { ExportMenu } from "@/components/scholar/ExportMenu";
import { FiltersSidebar, type ScholarFiltersState } from "@/components/scholar/FiltersSidebar";
import { ResultCard } from "@/components/scholar/ResultCard";
import { StatsDashboard } from "@/components/scholar/StatsDashboard";
import { useFavorites } from "@/hooks/useFavorites";
import { trpc } from "@/lib/trpc";
import { useTheme } from "@/contexts/ThemeContext";
import { computeScholarStats } from "@shared/scholar/stats";
import type { ScholarResult } from "@shared/scholar/types";
import { keepPreviousData } from "@tanstack/react-query";
import { BookMarked, FolderPlus, Loader2, Moon, Search, Sun, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const SUGGESTED_COLLECTIONS = ["Parkinson", "AVC", "Reabilitação Vestibular", "Mestrado", "Revisões"];

type QuickFilter =
  | "all"
  | "most_cited"
  | "most_recent"
  | "systematic_review"
  | "meta_analysis"
  | "clinical_trial"
  | "observational_study"
  | "book";

const QUICK_FILTERS: { id: QuickFilter; label: string }[] = [
  { id: "all", label: "Relevância" },
  { id: "most_cited", label: "Mais citados" },
  { id: "most_recent", label: "Mais recentes" },
  { id: "systematic_review", label: "Revisões Sistemáticas" },
  { id: "meta_analysis", label: "Meta-análises" },
  { id: "clinical_trial", label: "Ensaios Clínicos" },
  { id: "observational_study", label: "Estudos Observacionais" },
  { id: "book", label: "Livros" },
];

function applyQuickFilter(results: ScholarResult[], quickFilter: QuickFilter): ScholarResult[] {
  switch (quickFilter) {
    case "most_cited":
      return [...results].sort((a, b) => (b.citationCount ?? -1) - (a.citationCount ?? -1));
    case "most_recent":
      return [...results].sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
    case "systematic_review":
      return results.filter(r => r.type === "systematic_review");
    case "meta_analysis":
      return results.filter(r => r.type === "meta_analysis");
    case "clinical_trial":
      return results.filter(r => r.type === "clinical_trial");
    case "observational_study":
      return results.filter(r => r.type === "observational_study");
    case "book":
      return results.filter(r => r.type === "book" || r.type === "book_chapter");
    default:
      return results;
  }
}

function useInfiniteScrollSentinel(onIntersect: () => void, enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!enabled || !ref.current) return;
    const observer = new IntersectionObserver(
      entries => entries[0]?.isIntersecting && onIntersect(),
      { rootMargin: "400px" }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, onIntersect]);
  return ref;
}

export default function ScholarFinder() {
  const { switchable, theme, toggleTheme } = useTheme();
  const [queryInput, setQueryInput] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [filters, setFilters] = useState<ScholarFiltersState>({
    type: "all",
    yearRange: "all",
    language: "all",
    area: "all",
  });
  const [page, setPage] = useState(1);
  const [accumulated, setAccumulated] = useState<ScholarResult[]>([]);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [activeTab, setActiveTab] = useState("resultados");
  const [newCollectionName, setNewCollectionName] = useState("");
  const [activeCollection, setActiveCollection] = useState<string | null>(null);

  const favorites = useFavorites();

  const searchQuery = trpc.scholar.search.useQuery(
    { query: submittedQuery, ...filters, page },
    { enabled: submittedQuery.length >= 2, placeholderData: keepPreviousData }
  );

  // Reset accumulation whenever the search term or filters change.
  useEffect(() => {
    setPage(1);
    setAccumulated([]);
  }, [submittedQuery, filters.type, filters.yearRange, filters.language, filters.area]);

  useEffect(() => {
    if (!searchQuery.data) return;
    setAccumulated(prev => {
      const base = page === 1 ? [] : prev;
      const seen = new Set(base.map(r => r.id));
      const additions = searchQuery.data.results.filter(r => !seen.has(r.id));
      return [...base, ...additions];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery.data, page]);

  const handleSearch = () => {
    setSubmittedQuery(queryInput.trim());
  };

  const displayResults = useMemo(() => applyQuickFilter(accumulated, quickFilter), [accumulated, quickFilter]);
  const stats = useMemo(() => computeScholarStats(accumulated), [accumulated]);

  const canLoadMore = Boolean(searchQuery.data?.hasMore) && !searchQuery.isFetching;
  const sentinelRef = useInfiniteScrollSentinel(() => setPage(p => p + 1), canLoadMore);

  const collectionResults = activeCollection ? favorites.resultsIn(activeCollection) : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Scholar Finder AI</h1>
              <p className="mt-1 text-muted-foreground">
                Busque artigos, livros, revisões, ensaios clínicos e teses em múltiplas bases científicas gratuitas —
                organizados e resumidos automaticamente.
              </p>
            </div>
            {switchable && (
              <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Alternar modo escuro">
                {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </Button>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={queryInput}
                onChange={e => setQueryInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="Digite um tema de pesquisa..."
                className="h-12 pl-9 text-base"
              />
            </div>
            <Button size="lg" className="h-12" onClick={handleSearch} disabled={queryInput.trim().length < 2}>
              <Search className="mr-2 size-4" />
              Pesquisar
            </Button>
            <AdvancedSearchDialog />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="resultados">Resultados</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="favoritos">Favoritos</TabsTrigger>
          </TabsList>

          <TabsContent value="resultados" className="mt-6">
            {!submittedQuery ? (
              <Card>
                <CardContent className="py-16 text-center text-muted-foreground">
                  Digite um tema acima para pesquisar em Semantic Scholar, Crossref, OpenAlex, PubMed, Europe PMC,
                  arXiv, Open Library e Google Books simultaneamente.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
                <aside className="hidden lg:block">
                  <FiltersSidebar filters={filters} onChange={setFilters} />
                </aside>

                <div className="space-y-4">
                  <div className="lg:hidden">
                    <FiltersSidebar filters={filters} onChange={setFilters} />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {QUICK_FILTERS.map(f => (
                      <Badge
                        key={f.id}
                        variant={quickFilter === f.id ? "default" : "outline"}
                        className="cursor-pointer select-none"
                        onClick={() => setQuickFilter(f.id)}
                      >
                        {f.label}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-muted-foreground">
                      {displayResults.length} resultado{displayResults.length === 1 ? "" : "s"} carregado
                      {displayResults.length === 1 ? "" : "s"}
                      {searchQuery.data?.sourcesFailed.length ? (
                        <span className="ml-2 text-xs">
                          (indisponíveis agora: {searchQuery.data.sourcesFailed.join(", ")})
                        </span>
                      ) : null}
                    </p>
                    <ExportMenu results={displayResults} filenameBase={`scholar-finder-${submittedQuery}`} />
                  </div>

                  {searchQuery.isLoading && accumulated.length === 0 ? (
                    <div className="flex justify-center py-16">
                      <Loader2 className="size-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : displayResults.length === 0 ? (
                    <Card>
                      <CardContent className="py-16 text-center text-muted-foreground">
                        Nenhum resultado encontrado para "{submittedQuery}".
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {displayResults.map(result => (
                        <ResultCard key={result.id} result={result} />
                      ))}
                    </div>
                  )}

                  <div ref={sentinelRef} className="flex justify-center py-6">
                    {searchQuery.isFetching && accumulated.length > 0 && (
                      <Loader2 className="size-5 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="dashboard" className="mt-6">
            {accumulated.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center text-muted-foreground">
                  Pesquise um tema para ver o painel com estatísticas dos resultados carregados.
                </CardContent>
              </Card>
            ) : (
              <StatsDashboard stats={stats} />
            )}
          </TabsContent>

          <TabsContent value="favoritos" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
              <aside className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Coleções</p>
                  {favorites.collectionNames.map(name => (
                    <button
                      key={name}
                      onClick={() => setActiveCollection(name)}
                      className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent ${
                        activeCollection === name ? "bg-accent font-medium" : ""
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <BookMarked className="size-3.5" />
                        {name}
                      </span>
                      <span className="text-xs text-muted-foreground">{favorites.resultsIn(name).length}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5 border-t pt-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Nova coleção</p>
                  <div className="flex gap-1.5">
                    <Input
                      value={newCollectionName}
                      onChange={e => setNewCollectionName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter" && newCollectionName.trim()) {
                          favorites.createCollection(newCollectionName.trim());
                          setNewCollectionName("");
                        }
                      }}
                      placeholder="Nome da coleção"
                      className="h-8 text-sm"
                    />
                    <Button
                      size="icon-sm"
                      variant="outline"
                      onClick={() => {
                        if (!newCollectionName.trim()) return;
                        favorites.createCollection(newCollectionName.trim());
                        setNewCollectionName("");
                      }}
                    >
                      <FolderPlus className="size-3.5" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {SUGGESTED_COLLECTIONS.filter(c => !favorites.collectionNames.includes(c)).map(name => (
                      <Badge
                        key={name}
                        variant="outline"
                        className="cursor-pointer text-[11px]"
                        onClick={() => favorites.createCollection(name)}
                      >
                        + {name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </aside>

              <div className="space-y-4">
                {!activeCollection ? (
                  <Card>
                    <CardContent className="py-16 text-center text-muted-foreground">
                      Selecione uma coleção para ver os itens salvos.
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold">{activeCollection}</h2>
                      <div className="flex gap-2">
                        <ExportMenu results={collectionResults} filenameBase={activeCollection} />
                        {activeCollection !== "Favoritos" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              favorites.deleteCollection(activeCollection);
                              setActiveCollection(null);
                            }}
                          >
                            <Trash2 className="mr-1.5 size-3.5" />
                            Excluir coleção
                          </Button>
                        )}
                      </div>
                    </div>
                    {collectionResults.length === 0 ? (
                      <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                          Nenhum item salvo nesta coleção ainda.
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-4">
                        {collectionResults.map(result => (
                          <ResultCard key={result.id} result={result} />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
