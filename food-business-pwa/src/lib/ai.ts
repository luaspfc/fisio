import { buildBusinessContext } from './db'

export interface AIResponse {
  action: string | null
  data: Record<string, unknown> | null
  response: string
  needsConfirmation: boolean
}

export interface ChatHistoryItem {
  role: 'user' | 'assistant'
  content: string
}

export async function sendMessage(
  message: string,
  history: ChatHistoryItem[] = []
): Promise<AIResponse> {
  const context = await buildBusinessContext()

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, context, history })
  })

  if (!res.ok) throw new Error('Falha na comunicação com a assistente')

  return res.json() as Promise<AIResponse>
}

export async function analyzeImage(imageBase64: string, mediaType: string): Promise<{
  success: boolean
  items: Array<{ name: string; quantity: number; unit: string; price: number }>
  total: number
  date: string | null
  store: string | null
  response: string
}> {
  const res = await fetch('/api/vision', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mediaType })
  })

  if (!res.ok) throw new Error('Falha ao analisar a imagem')

  return res.json()
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Hoje'
  if (date.toDateString() === yesterday.toDateString()) return 'Ontem'

  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
}
