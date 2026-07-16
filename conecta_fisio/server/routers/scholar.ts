/**
 * Scholar Finder AI — literature search router.
 *
 * Aggregates free/public academic APIs (Semantic Scholar, CrossRef, OpenAlex,
 * PubMed, Europe PMC, arXiv, Open Library, Google Books) behind a single
 * cached, rate-limit-aware surface. Public procedures: this is a reference
 * tool, not patient data, so it doesn't require login.
 */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { invokeLLM } from "../_core/llm";
import { publicProcedure, router } from "../_core/trpc";
import { aggregateSearch } from "../services/scholar/aggregator";
import { scholarLookupCache, scholarSearchCache } from "../services/scholar/cache";
import { lookupByDoi, lookupByIsbn, lookupByPmid } from "../services/scholar/lookup";
import {
  searchOpenAlexByAuthor,
  searchOpenAlexByInstitution,
  searchOpenAlexByJournal,
} from "../services/scholar/sources/openAlex";
import { fetchSimilarPapers } from "../services/scholar/sources/semanticScholar";

const searchInputSchema = z.object({
  query: z.string().trim().min(2, "Digite ao menos 2 caracteres"),
  type: z.enum(["all", "articles", "books", "reviews", "clinical_trials", "theses"]).default("all"),
  yearRange: z.enum(["5", "10", "all"]).default("all"),
  language: z.enum(["pt", "en", "es", "all"]).default("all"),
  area: z
    .enum(["saude", "engenharia", "ciencias_sociais", "tecnologia", "educacao", "all"])
    .default("all"),
  page: z.number().int().min(1).max(20).default(1),
});

export const scholarRouter = router({
  search: publicProcedure.input(searchInputSchema).query(async ({ input }) => {
    const cacheKey = JSON.stringify(input);
    return scholarSearchCache.wrap(cacheKey, () => aggregateSearch(input));
  }),

  lookupDoi: publicProcedure
    .input(z.object({ doi: z.string().trim().min(3) }))
    .query(async ({ input }) => {
      const result = await scholarLookupCache.wrap(`doi:${input.doi}`, () => lookupByDoi(input.doi));
      if (!result) {
        throw new TRPCError({ code: "NOT_FOUND", message: "DOI não encontrado" });
      }
      return result;
    }),

  lookupPmid: publicProcedure
    .input(z.object({ pmid: z.string().trim().min(1) }))
    .query(async ({ input }) => {
      const result = await scholarLookupCache.wrap(`pmid:${input.pmid}`, () => lookupByPmid(input.pmid));
      if (!result) {
        throw new TRPCError({ code: "NOT_FOUND", message: "PMID não encontrado" });
      }
      return result;
    }),

  lookupIsbn: publicProcedure
    .input(z.object({ isbn: z.string().trim().min(5) }))
    .query(async ({ input }) => {
      const result = await scholarLookupCache.wrap(`isbn:${input.isbn}`, () => lookupByIsbn(input.isbn));
      if (!result) {
        throw new TRPCError({ code: "NOT_FOUND", message: "ISBN não encontrado" });
      }
      return result;
    }),

  searchByAuthor: publicProcedure
    .input(z.object({ author: z.string().trim().min(2), page: z.number().int().min(1).default(1) }))
    .query(async ({ input }) => {
      const cacheKey = `author:${input.author}:${input.page}`;
      const results = await scholarSearchCache.wrap(cacheKey, () =>
        searchOpenAlexByAuthor(input.author, {
          query: "",
          page: input.page,
          pageSize: 20,
          yearFrom: null,
          language: null,
        })
      );
      return { results };
    }),

  searchByJournal: publicProcedure
    .input(z.object({ journal: z.string().trim().min(2), page: z.number().int().min(1).default(1) }))
    .query(async ({ input }) => {
      const cacheKey = `journal:${input.journal}:${input.page}`;
      const results = await scholarSearchCache.wrap(cacheKey, () =>
        searchOpenAlexByJournal(input.journal, {
          query: "",
          page: input.page,
          pageSize: 20,
          yearFrom: null,
          language: null,
        })
      );
      return { results };
    }),

  searchByUniversity: publicProcedure
    .input(z.object({ university: z.string().trim().min(2), page: z.number().int().min(1).default(1) }))
    .query(async ({ input }) => {
      const cacheKey = `university:${input.university}:${input.page}`;
      const results = await scholarSearchCache.wrap(cacheKey, () =>
        searchOpenAlexByInstitution(input.university, {
          query: "",
          page: input.page,
          pageSize: 20,
          yearFrom: null,
          language: null,
        })
      );
      return { results };
    }),

  similarPapers: publicProcedure
    .input(z.object({ paperId: z.string().trim().min(1) }))
    .query(async ({ input }) => {
      const cacheKey = `similar:${input.paperId}`;
      const results = await scholarLookupCache.wrap(cacheKey, () => fetchSimilarPapers(input.paperId));
      return { results };
    }),

  /**
   * AI-generated plain-language summary of a single result. Degrades to a
   * heuristic extractive summary when the LLM gateway isn't configured
   * (BUILT_IN_FORGE_API_KEY unset) or the call fails, so the feature never
   * breaks the page — it just loses the richer breakdown.
   */
  summarize: publicProcedure
    .input(
      z.object({
        title: z.string(),
        abstract: z.string().nullable(),
        studyTypeLabel: z.string().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      if (!input.abstract) {
        return {
          resumoSimples: "Resumo indisponível: esta fonte não forneceu um abstract.",
          achadosPrincipais: [],
          aplicacaoClinica: "Não é possível estimar sem o resumo do estudo.",
          limitacoes: "Não é possível estimar sem o resumo do estudo.",
          qualidadeMetodologica: 0,
          geradoPorIA: false,
        };
      }

      try {
        const result = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "Você é um assistente de pesquisa científica em saúde/fisioterapia. Responda SEMPRE em português do Brasil, em JSON estrito, sem markdown.",
            },
            {
              role: "user",
              content: `Título: ${input.title}\nTipo de estudo: ${input.studyTypeLabel ?? "não identificado"}\nResumo original: ${input.abstract}\n\nGere um JSON com as chaves: resumoSimples (string, linguagem simples, máximo 200 palavras), achadosPrincipais (array de strings, bullet points curtos), aplicacaoClinica (string, como usar na prática clínica), limitacoes (string, limitações metodológicas do estudo), qualidadeMetodologica (número inteiro de 1 a 5, nota de qualidade metodológica baseada no desenho do estudo).`,
            },
          ],
          responseFormat: {
            type: "json_schema",
            json_schema: {
              name: "scholar_summary",
              schema: {
                type: "object",
                properties: {
                  resumoSimples: { type: "string" },
                  achadosPrincipais: { type: "array", items: { type: "string" } },
                  aplicacaoClinica: { type: "string" },
                  limitacoes: { type: "string" },
                  qualidadeMetodologica: { type: "integer", minimum: 1, maximum: 5 },
                },
                required: [
                  "resumoSimples",
                  "achadosPrincipais",
                  "aplicacaoClinica",
                  "limitacoes",
                  "qualidadeMetodologica",
                ],
              },
              strict: true,
            },
          },
          maxTokens: 1200,
        });

        const content = result.choices?.[0]?.message?.content;
        const text = typeof content === "string" ? content : "";
        const parsed = JSON.parse(text);

        return {
          resumoSimples: String(parsed.resumoSimples ?? ""),
          achadosPrincipais: Array.isArray(parsed.achadosPrincipais) ? parsed.achadosPrincipais.map(String) : [],
          aplicacaoClinica: String(parsed.aplicacaoClinica ?? ""),
          limitacoes: String(parsed.limitacoes ?? ""),
          qualidadeMetodologica: Number(parsed.qualidadeMetodologica) || 0,
          geradoPorIA: true,
        };
      } catch (error) {
        console.warn("[scholar] LLM summarize failed, falling back to extractive summary:", (error as Error).message);
        const words = input.abstract.split(/\s+/).slice(0, 200).join(" ");
        return {
          resumoSimples: words,
          achadosPrincipais: [],
          aplicacaoClinica: "Resumo automático indisponível no momento — consulte o abstract original.",
          limitacoes: "Resumo automático indisponível no momento — consulte o abstract original.",
          qualidadeMetodologica: 0,
          geradoPorIA: false,
        };
      }
    }),
});
