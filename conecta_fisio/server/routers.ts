import { systemRouter } from "./_core/systemRouter";
import { router, publicProcedure } from "./_core/trpc";
import { authRouter } from "./routers/auth";
import { agendamentoRouter } from "./routers/agendamento";
import { prontuarioRouter } from "./routers/prontuario";
import { avaliacoesRouter } from "./routers/avaliacoes";
import { iaRouter } from "./routers/ia";
import { pagamentosRouter } from "./routers/pagamentos";
import { scholarRouter } from "./routers/scholar";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  agendamento: agendamentoRouter,
  prontuario: prontuarioRouter,
  avaliacoes: avaliacoesRouter,
  ia: iaRouter,
  pagamentos: pagamentosRouter,
  scholar: scholarRouter,

  // Placeholder for fisioterapeuta router - to be completed
  fisioterapeuta: router({
    buscarPublico: publicProcedure
      .input(z.object({ 
        especialidade: z.string().optional(),
        cidade: z.string().optional(),
        pagina: z.number().default(1),
      }))
      .query(async () => {
        return {
          total: 0,
          resultados: [],
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
