import axios from 'axios';

/**
 * Hotmart Integration Service
 * Gerencia assinaturas de fisioterapeutas na plataforma Hotmart
 * Modelo: R$ 99,99/mês por fisioterapeuta
 */

const HOTMART_API_URL = process.env.HOTMART_API_URL || 'https://api.hotmart.com/v1';
const HOTMART_API_KEY = process.env.HOTMART_API_KEY;
const HOTMART_PRODUCT_ID = process.env.HOTMART_PRODUCT_ID;
const HOTMART_WEBHOOK_SECRET = process.env.HOTMART_WEBHOOK_SECRET;

interface HotmartSubscription {
  id: string;
  customerId: string;
  productId: string;
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  startDate: Date;
  nextBillingDate: Date;
  cancelledAt?: Date;
}

interface HotmartCustomer {
  id: string;
  email: string;
  name: string;
  document: string;
}

interface HotmartWebhookPayload {
  event: 'subscription.created' | 'subscription.updated' | 'subscription.cancelled' | 'subscription.expired';
  data: {
    subscription: {
      id: string;
      status: string;
      customer: HotmartCustomer;
      startDate: string;
      nextBillingDate: string;
      cancelledAt?: string;
    };
  };
  timestamp: string;
  signature: string;
}

/**
 * Criar link de checkout para assinatura
 */
export async function createCheckoutLink(fisioterapeutaId: number, email: string, name: string): Promise<string> {
  try {
    if (!HOTMART_API_KEY || !HOTMART_PRODUCT_ID) {
      throw new Error('Hotmart API key or Product ID not configured');
    }

    const response = await axios.post(
      `${HOTMART_API_URL}/subscription/checkout`,
      {
        product_id: HOTMART_PRODUCT_ID,
        customer: {
          email,
          name,
        },
        custom_field: {
          fisioterapeuta_id: fisioterapeutaId,
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${HOTMART_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.checkout_url;
  } catch (error) {
    console.error('[Hotmart] Erro ao criar link de checkout:', error);
    throw error;
  }
}

/**
 * Obter status da assinatura de um fisioterapeuta
 */
export async function getSubscriptionStatus(customerId: string): Promise<HotmartSubscription | null> {
  try {
    if (!HOTMART_API_KEY) {
      throw new Error('Hotmart API key not configured');
    }

    const response = await axios.get(
      `${HOTMART_API_URL}/subscription/customer/${customerId}`,
      {
        headers: {
          'Authorization': `Bearer ${HOTMART_API_KEY}`,
        },
      }
    );

    if (!response.data.subscriptions || response.data.subscriptions.length === 0) {
      return null;
    }

    const subscription = response.data.subscriptions[0];

    return {
      id: subscription.id,
      customerId: subscription.customer.id,
      productId: subscription.product.id,
      status: subscription.status,
      startDate: new Date(subscription.start_date),
      nextBillingDate: new Date(subscription.next_billing_date),
      cancelledAt: subscription.cancelled_at ? new Date(subscription.cancelled_at) : undefined,
    };
  } catch (error) {
    console.error('[Hotmart] Erro ao obter status da assinatura:', error);
    return null;
  }
}

/**
 * Verificar se assinatura está ativa
 */
export async function isSubscriptionActive(customerId: string): Promise<boolean> {
  try {
    const subscription = await getSubscriptionStatus(customerId);
    return subscription?.status === 'active';
  } catch (error) {
    console.error('[Hotmart] Erro ao verificar assinatura ativa:', error);
    return false;
  }
}

/**
 * Cancelar assinatura
 */
export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  try {
    if (!HOTMART_API_KEY) {
      throw new Error('Hotmart API key not configured');
    }

    await axios.post(
      `${HOTMART_API_URL}/subscription/${subscriptionId}/cancel`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${HOTMART_API_KEY}`,
        },
      }
    );

    return true;
  } catch (error) {
    console.error('[Hotmart] Erro ao cancelar assinatura:', error);
    return false;
  }
}

/**
 * Validar webhook da Hotmart
 * Verifica assinatura HMAC para garantir autenticidade
 */
export function validateWebhookSignature(payload: string, signature: string): boolean {
  if (!HOTMART_WEBHOOK_SECRET) {
    console.warn('[Hotmart] Webhook secret not configured');
    return false;
  }

  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', HOTMART_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  return expectedSignature === signature;
}

/**
 * Processar webhook da Hotmart
 */
export async function processWebhook(payload: HotmartWebhookPayload): Promise<void> {
  const { event, data } = payload;
  const subscription = data.subscription;

  console.log(`[Hotmart] Processando webhook: ${event}`, {
    subscriptionId: subscription.id,
    customerId: subscription.customer.id,
    status: subscription.status,
  });

  // Aqui você pode adicionar lógica para:
  // - Atualizar status de assinatura no banco de dados
  // - Enviar notificações ao fisioterapeuta
  // - Bloquear/desbloquear agendamentos
  // - Registrar auditoria

  switch (event) {
    case 'subscription.created':
      console.log(`[Hotmart] Assinatura criada: ${subscription.id}`);
      // TODO: Atualizar banco de dados
      break;

    case 'subscription.updated':
      console.log(`[Hotmart] Assinatura atualizada: ${subscription.id}`);
      // TODO: Atualizar banco de dados
      break;

    case 'subscription.cancelled':
      console.log(`[Hotmart] Assinatura cancelada: ${subscription.id}`);
      // TODO: Bloquear agendamentos futuros
      break;

    case 'subscription.expired':
      console.log(`[Hotmart] Assinatura expirada: ${subscription.id}`);
      // TODO: Bloquear agendamentos futuros
      break;

    default:
      console.warn(`[Hotmart] Evento desconhecido: ${event}`);
  }
}

/**
 * Obter informações de faturamento
 */
export async function getBillingInfo(customerId: string): Promise<any> {
  try {
    if (!HOTMART_API_KEY) {
      throw new Error('Hotmart API key not configured');
    }

    const response = await axios.get(
      `${HOTMART_API_URL}/subscription/customer/${customerId}/billing`,
      {
        headers: {
          'Authorization': `Bearer ${HOTMART_API_KEY}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('[Hotmart] Erro ao obter informações de faturamento:', error);
    return null;
  }
}

/**
 * Listar todas as assinaturas de um cliente
 */
export async function listSubscriptions(customerId: string): Promise<HotmartSubscription[]> {
  try {
    if (!HOTMART_API_KEY) {
      throw new Error('Hotmart API key not configured');
    }

    const response = await axios.get(
      `${HOTMART_API_URL}/subscription/customer/${customerId}`,
      {
        headers: {
          'Authorization': `Bearer ${HOTMART_API_KEY}`,
        },
      }
    );

    if (!response.data.subscriptions) {
      return [];
    }

    return response.data.subscriptions.map((sub: any) => ({
      id: sub.id,
      customerId: sub.customer.id,
      productId: sub.product.id,
      status: sub.status,
      startDate: new Date(sub.start_date),
      nextBillingDate: new Date(sub.next_billing_date),
      cancelledAt: sub.cancelled_at ? new Date(sub.cancelled_at) : undefined,
    }));
  } catch (error) {
    console.error('[Hotmart] Erro ao listar assinaturas:', error);
    return [];
  }
}
