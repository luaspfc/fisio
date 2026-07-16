import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  ScholarAreaFilter,
  ScholarLanguageFilter,
  ScholarResultTypeFilter,
  ScholarYearFilter,
} from "@shared/scholar/types";

export interface ScholarFiltersState {
  type: ScholarResultTypeFilter;
  yearRange: ScholarYearFilter;
  language: ScholarLanguageFilter;
  area: ScholarAreaFilter;
}

const TYPE_OPTIONS: { value: ScholarResultTypeFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "articles", label: "Artigos" },
  { value: "books", label: "Livros" },
  { value: "reviews", label: "Revisões" },
  { value: "clinical_trials", label: "Ensaios Clínicos" },
  { value: "theses", label: "Teses" },
];

const YEAR_OPTIONS: { value: ScholarYearFilter; label: string }[] = [
  { value: "5", label: "Últimos 5 anos" },
  { value: "10", label: "Últimos 10 anos" },
  { value: "all", label: "Todos" },
];

const LANGUAGE_OPTIONS: { value: ScholarLanguageFilter; label: string }[] = [
  { value: "all", label: "Todos os idiomas" },
  { value: "pt", label: "Português" },
  { value: "en", label: "Inglês" },
  { value: "es", label: "Espanhol" },
];

const AREA_OPTIONS: { value: ScholarAreaFilter; label: string }[] = [
  { value: "all", label: "Todas as áreas" },
  { value: "saude", label: "Saúde" },
  { value: "engenharia", label: "Engenharia" },
  { value: "ciencias_sociais", label: "Ciências Sociais" },
  { value: "tecnologia", label: "Tecnologia" },
  { value: "educacao", label: "Educação" },
];

function FilterField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={v => onChange(v as T)}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function FiltersSidebar({
  filters,
  onChange,
}: {
  filters: ScholarFiltersState;
  onChange: (filters: ScholarFiltersState) => void;
}) {
  return (
    <div className="space-y-5">
      <FilterField
        label="Tipo"
        value={filters.type}
        options={TYPE_OPTIONS}
        onChange={type => onChange({ ...filters, type })}
      />
      <FilterField
        label="Ano"
        value={filters.yearRange}
        options={YEAR_OPTIONS}
        onChange={yearRange => onChange({ ...filters, yearRange })}
      />
      <FilterField
        label="Idioma"
        value={filters.language}
        options={LANGUAGE_OPTIONS}
        onChange={language => onChange({ ...filters, language })}
      />
      <FilterField
        label="Área"
        value={filters.area}
        options={AREA_OPTIONS}
        onChange={area => onChange({ ...filters, area })}
      />
    </div>
  );
}
