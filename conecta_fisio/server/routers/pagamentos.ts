import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import {
  createCheckoutLink,
  getSubscriptionStatus,
  isSubscriptionActive,
  cancelSubscription,
  getBillingInfo,
  listSubscriptions,
} from '../services/hotmartService';
import { getDb } from '../db';
import { eq } from 'drizzle-orm';
import { fisioterapeutas } from '../../drizzle/schema';

/**
 * Pagamentos Router
 * Gerencia assinaturas Hotmart e acesso à plataforma
 */
export const pagamentosRouter = router({
  /**
   * Criar link de checkout para assinatura
   * Apenas fisioterapeutas podem acessar
   */
  criarCheckout: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().min(3),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verificar se é fisioterapeuta
      if (ctx.user.role !== 'fisioterapeuta') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Apenas fisioterapeutas podem acessar este recurso',
        });
      }

      try {
        const checkoutUrl = await createCheckoutLink(
          ctx.user.id,
          input.email,
          input.name
        );

        return {
          success: true,
          checkoutUrl,
          message: 'Link de checkout criado com sucesso',
        };
      } catch (error) {
        console.error('[Pagamentos] Erro ao criar checkout:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erro ao criar link de checkout',
        });
      }
    }),

  /**
   * Obter status da assinatura do fisioterapeuta
   */
  obterStatusAssinatura: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== 'fisioterapeuta') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Apenas fisioterapeutas podem acessar este recurso',
      });
    }

    try {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Banco de dados não disponível',
        });
      }

      // Obter fisioterapeuta
      const fisioProfissional = await db
        .select()
        .from(fisioterapeutas)
        .where(eq(fisioterapeutas.userId, ctx.user.id))
        .limit(1);

      if (fisioProfissional.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Perfil de fisioterapeuta não encontrado',
        });
      }

      const hotmartCustomerId = fisioProfissional[0].hotmartCustomerId;

      if (!hotmartCustomerId) {
        return {
          status: 'nao_iniciado',
          message: 'Assinatura não iniciada',
          ativo: false,
        };
      }

      const subscription = await getSubscriptionStatus(hotmartCustomerId);

      if (!subscription) {
        return {
          status: 'nao_encontrada',
          message: 'Assinatura não encontrada',
          ativo: false,
        };
      }

      return {
        status: subscription.status,
        ativo: subscription.status === 'active',
        dataInicio: subscription.startDate,
        proximoBilhete: subscription.nextBillingDate,
        canceladoEm: subscription.cancelledAt,
      };
    } catch (error) {
      console.error('[Pagamentos] Erro ao obter status:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Erro ao obter status da assinatura',
      });
    }
  }),

  /**
   * Verificar se fisioterapeuta tem assinatura ativa
   * Usado para bloquear agendamentos sem assinatura
   */
  verificarAssinaturaAtiva: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== 'fisioterapeuta') {
      return { ativo: false };
    }

    try {
      const db = await getDb();
      if (!db) return { ativo: false };

      const fisioProfissional = await db
        .select()
        .from(fisioterapeutas)
        .where(eq(fisioterapeutas.userId, ctx.user.id))
        .limit(1);

      if (fisioProfissional.length === 0 || !fisioProfissional[0].hotmartCustomerId) {
        return { ativo: false };
      }

      const ativo = await isSubscriptionActive(fisioProfissional[0].hotmartCustomerId);
      return { ativo };
    } catch (error) {
      console.error('[Pagamentos] Erro ao verificar assinatura:', error);
      return { ativo: false };
    }
  }),

  /**
   * Obter informações de faturamento
   */
  obterInfoFaturamento: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== 'fisioterapeuta') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Apenas fisioterapeutas podem acessar este recurso',
      });
    }

    try {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Banco de dados não disponível',
        });
      }

      const fisioProfissional = await db
        .select()
        .from(fisioterapeutas)
        .where(eq(fisioterapeutas.userId, ctx.user.id))
        .limit(1);

      if (fisioProfissional.length === 0 || !fisioProfissional[0].hotmartCustomerId) {
        return null;
      }

      const billingInfo = await getBillingInfo(fisioProfissional[0].hotmartCustomerId);
      return billingInfo;
    } catch (error) {
      console.error('[Pagamentos] Erro ao obter faturamento:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Erro ao obter informações de faturamento',
      });
    }
  }),

  /**
   * Listar todas as assinaturas do fisioterapeuta
   */
  listarAssinaturas: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== 'fisioterapeuta') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Apenas fisioterapeutas podem acessar este recurso',
      });
    }

    try {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Banco de dados não disponível',
        });
      }

      const fisioProfissional = await db
        .select()
        .from(fisioterapeutas)
        .where(eq(fisioterapeutas.userId, ctx.user.id))
        .limit(1);

      if (fisioProfissional.length === 0 || !fisioProfissional[0].hotmartCustomerId) {
        return [];
      }

      const subscriptions = await listSubscriptions(fisioProfissional[0].hotmartCustomerId);
      return subscriptions;
    } catch (error) {
      console.error('[Pagamentos] Erro ao listar assinaturas:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Erro ao listar assinaturas',
      });
    }
  }),

  /**
   * Cancelar assinatura
   */
  cancelarAssinatura: protectedProcedure
    .input(z.object({ subscriptionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'fisioterapeuta') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Apenas fisioterapeutas podem acessar este recurso',
        });
      }

      try {
        const success = await cancelSubscription(input.subscriptionId);

        if (!success) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Erro ao cancelar assinatura',
          });
        }

        return {
          success: true,
          message: 'Assinatura cancelada com sucesso',
        };
      } catch (error) {
        console.error('[Pagamentos] Erro ao cancelar:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erro ao cancelar assinatura',
        });
      }
    }),

  /**
   * Obter preço da assinatura (informativo)
   */
  obterPreco: protectedProcedure.query(async () => {
    return {
      valor: 99.99,
      moeda: 'BRL',
      periodo: 'mensal',
      descricao: 'Acesso ilimitado à plataforma ConectaFisio',
      beneficios: [
        'Agenda inteligente com cálculo de deslocamento',
        'Prontuário eletrônico criptografado',
        'Sugestões clínicas com IA',
        'Avaliações de pacientes',
        'Lembretes automáticos',
        'Suporte técnico 24/7',
      ],
    };
  }),
});
