import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import type { ScholarResult } from "@shared/scholar/types";
import { Loader2, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { ResultCard } from "./ResultCard";

type LookupMode = "doi" | "pmid" | "isbn" | "author" | "journal" | "university";

const MODES: { id: LookupMode; label: string; placeholder: string }[] = [
  { id: "doi", label: "DOI", placeholder: "ex: 10.1001/jama.2020.1585" },
  { id: "pmid", label: "PMID", placeholder: "ex: 32167524" },
  { id: "isbn", label: "ISBN", placeholder: "ex: 9788520142794" },
  { id: "author", label: "Autor", placeholder: "ex: Geoffrey Hinton" },
  { id: "journal", label: "Revista", placeholder: "ex: Physical Therapy" },
  { id: "university", label: "Universidade", placeholder: "ex: Universidade de São Paulo" },
];

function useLookup(mode: LookupMode): (value: string) => Promise<ScholarResult[]> {
  const utils = trpc.useUtils();
  const fns: Record<LookupMode, (value: string) => Promise<ScholarResult[]>> = {
    doi: async v => [await utils.client.scholar.lookupDoi.query({ doi: v })],
    pmid: async v => [await utils.client.scholar.lookupPmid.query({ pmid: v })],
    isbn: async v => [await utils.client.scholar.lookupIsbn.query({ isbn: v })],
    author: async v => (await utils.client.scholar.searchByAuthor.query({ author: v })).results,
    journal: async v => (await utils.client.scholar.searchByJournal.query({ journal: v })).results,
    university: async v => (await utils.client.scholar.searchByUniversity.query({ university: v })).results,
  };
  return fns[mode];
}

function LookupPanel({ mode, placeholder }: { mode: LookupMode; placeholder: string }) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ScholarResult[]>([]);
  const runLookup = useLookup(mode);

  const handleSearch = async () => {
    if (!value.trim()) return;
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const items = await runLookup(value.trim());
      if (items.length === 0) setError("Nenhum resultado encontrado.");
      setResults(items);
    } catch {
      setError("Nenhum resultado encontrado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor={`lookup-${mode}`}>{placeholder}</Label>
          <Input
            id={`lookup-${mode}`}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder={placeholder}
          />
        </div>
        <Button className="self-end" onClick={handleSearch} disabled={loading || !value.trim()}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : "Buscar"}
        </Button>
      </div>

      {error && <p className="text-sm text-muted-foreground">{error}</p>}

      <div className="max-h-[50vh] space-y-3 overflow-y-auto">
        {results.map(r => (
          <ResultCard key={r.id} result={r} />
        ))}
      </div>
    </div>
  );
}

export function AdvancedSearchDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <SlidersHorizontal className="mr-1.5 size-3.5" />
          Busca avançada
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Busca avançada</DialogTitle>
          <DialogDescription>
            Pesquise diretamente por identificador (DOI, PMID, ISBN) ou por autor, revista/periódico e universidade.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="doi">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            {MODES.map(m => (
              <TabsTrigger key={m.id} value={m.id}>
                {m.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {MODES.map(m => (
            <TabsContent key={m.id} value={m.id} className="pt-4">
              <LookupPanel mode={m.id} placeholder={m.placeholder} />
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
