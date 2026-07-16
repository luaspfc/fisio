import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScholarStats } from "@shared/scholar/types";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import { BookOpen, FileText, Globe, Library } from "lucide-react";

const SERIES_VARS = [
  "var(--scholar-series-1)",
  "var(--scholar-series-2)",
  "var(--scholar-series-3)",
  "var(--scholar-series-4)",
  "var(--scholar-series-5)",
  "var(--scholar-series-6)",
  "var(--scholar-series-7)",
  "var(--scholar-series-8)",
];
const OUTROS_COLOR = "var(--muted-foreground)";
const MAX_TYPE_SLOTS = 8;

function StatTile({ icon: Icon, label, value }: { icon: typeof BookOpen; label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-4">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
        <div>
          <div className="text-2xl font-semibold leading-none tabular-nums">{value}</div>
          <div className="text-xs text-muted-foreground mt-1">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function RankedList({ items, unit }: { items: { name: string; count: number }[]; unit: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Sem dados suficientes ainda.</p>;
  }
  const max = items[0]?.count || 1;
  return (
    <ul className="space-y-2.5">
      {items.slice(0, 8).map(item => (
        <li key={item.name} className="space-y-1">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="truncate">{item.name}</span>
            <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
              {item.count} {unit}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[var(--scholar-series-1)]"
              style={{ width: `${Math.max(4, (item.count / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function StatsDashboard({ stats }: { stats: ScholarStats }) {
  const yearConfig: ChartConfig = {
    count: { label: "Publicações", color: "var(--scholar-series-1)" },
  };

  const visibleTypes = stats.studyTypeDistribution.slice(0, MAX_TYPE_SLOTS - 1);
  const foldedCount = stats.studyTypeDistribution.slice(MAX_TYPE_SLOTS - 1).reduce((sum, t) => sum + t.count, 0);
  const typeChartData = [
    ...visibleTypes.map((t, i) => ({ label: t.label, count: t.count, fill: SERIES_VARS[i] })),
    ...(foldedCount > 0 ? [{ label: "Outros", count: foldedCount, fill: OUTROS_COLOR }] : []),
  ];
  const typeConfig: ChartConfig = { count: { label: "Total" } };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile icon={FileText} label="Artigos encontrados" value={stats.totalArticles} />
        <StatTile icon={BookOpen} label="Livros encontrados" value={stats.totalBooks} />
        <StatTile icon={Globe} label="Open Access" value={stats.openAccessCount} />
        <StatTile icon={Library} label="Ano médio" value={stats.averageYear ?? "—"} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Publicações por ano</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.yearDistribution.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem dados suficientes ainda.</p>
            ) : (
              <ChartContainer config={yearConfig} className="h-64 w-full">
                <BarChart data={stats.yearDistribution} margin={{ left: 0, right: 8 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="year" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} width={28} fontSize={11} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Distribuição por tipo de estudo</CardTitle>
          </CardHeader>
          <CardContent>
            {typeChartData.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem dados suficientes ainda.</p>
            ) : (
              <ChartContainer config={typeConfig} className="h-64 w-full">
                <BarChart data={typeChartData} layout="vertical" margin={{ left: 0, right: 8 }}>
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                  <XAxis type="number" tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    width={110}
                    fontSize={11}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={18}>
                    {typeChartData.map(d => (
                      <Cell key={d.label} fill={d.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Autores mais frequentes</CardTitle>
          </CardHeader>
          <CardContent>
            <RankedList items={stats.topAuthors} unit="trabalhos" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Revistas / editoras mais frequentes</CardTitle>
          </CardHeader>
          <CardContent>
            <RankedList items={stats.topVenues} unit="itens" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Nuvem de palavras-chave</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.keywordCloud.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem palavras-chave suficientes ainda.</p>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              {stats.keywordCloud.map(kw => {
                const max = stats.keywordCloud[0]?.count || 1;
                const scale = 0.75 + (kw.count / max) * 0.9;
                return (
                  <span
                    key={kw.term}
                    title={`${kw.count} ocorrências`}
                    className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground"
                    style={{ fontSize: `${scale}rem` }}
                  >
                    {kw.term}
                  </span>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
