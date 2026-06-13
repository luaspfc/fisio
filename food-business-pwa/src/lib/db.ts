import Dexie, { type Table } from 'dexie'

export interface Purchase {
  id?: number
  date: string
  items: PurchaseItem[]
  total: number
  note?: string
  createdAt: string
}

export interface PurchaseItem {
  name: string
  quantity: number
  unit: string
  price: number
}

export interface Sale {
  id?: number
  date: string
  product: string
  quantity: number
  unitPrice: number
  total: number
  paymentMethod?: string
  note?: string
  createdAt: string
}

export interface Recipe {
  id?: number
  name: string
  ingredients: RecipeIngredient[]
  preparation?: string
  yield: number
  yieldUnit: string
  note?: string
  createdAt: string
}

export interface RecipeIngredient {
  name: string
  quantity: number
  unit: string
}

export interface Settings {
  id?: number
  key: string
  value: string
}

export interface ChatMessage {
  id?: number
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

class AssistenteDB extends Dexie {
  purchases!: Table<Purchase>
  sales!: Table<Sale>
  recipes!: Table<Recipe>
  settings!: Table<Settings>
  chatHistory!: Table<ChatMessage>

  constructor() {
    super('AssistenteDB')
    this.version(1).stores({
      purchases: '++id, date, createdAt',
      sales: '++id, date, product, createdAt',
      recipes: '++id, name, createdAt',
      settings: '++id, key',
      chatHistory: '++id, timestamp'
    })
  }
}

export const db = new AssistenteDB()

// Helper functions
export async function getSetting(key: string): Promise<string | null> {
  const setting = await db.settings.where('key').equals(key).first()
  return setting?.value ?? null
}

export async function setSetting(key: string, value: string): Promise<void> {
  const existing = await db.settings.where('key').equals(key).first()
  if (existing?.id) {
    await db.settings.update(existing.id, { value })
  } else {
    await db.settings.add({ key, value })
  }
}

export async function buildBusinessContext(): Promise<string> {
  const userName = await getSetting('userName') || 'Dona'
  const businessName = await getSetting('businessName') || 'seu negócio'

  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  const [recentPurchases, recentSales, allRecipes] = await Promise.all([
    db.purchases.where('createdAt').above(startOfMonth.toISOString()).toArray(),
    db.sales.where('createdAt').above(startOfMonth.toISOString()).toArray(),
    db.recipes.toArray()
  ])

  const weekSales = recentSales.filter(s => new Date(s.createdAt) >= startOfWeek)
  const totalWeekSales = weekSales.reduce((sum, s) => sum + s.total, 0)
  const totalMonthSales = recentSales.reduce((sum, s) => sum + s.total, 0)
  const totalMonthPurchases = recentPurchases.reduce((sum, p) => sum + p.total, 0)
  const profit = totalMonthSales - totalMonthPurchases

  const topProducts = Object.entries(
    recentSales.reduce((acc, s) => {
      acc[s.product] = (acc[s.product] || 0) + s.total
      return acc
    }, {} as Record<string, number>)
  )
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([name, total]) => `${name}: R$ ${total.toFixed(2)}`)
    .join(', ')

  const recentIngredients = recentPurchases
    .flatMap(p => p.items)
    .reduce((acc, item) => {
      const key = item.name.toLowerCase()
      if (!acc[key]) acc[key] = { name: item.name, total: 0, unit: item.unit }
      acc[key].total += item.price
      return acc
    }, {} as Record<string, { name: string; total: number; unit: string }>)

  const ingredientPrices = Object.values(recentIngredients)
    .map(i => `${i.name}: R$ ${i.total.toFixed(2)}`)
    .join(', ')

  return `
Usuária: ${userName}
Negócio: ${businessName}
Data atual: ${today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}

RESUMO FINANCEIRO:
- Vendas dessa semana: R$ ${totalWeekSales.toFixed(2)}
- Vendas esse mês: R$ ${totalMonthSales.toFixed(2)}
- Gastos esse mês: R$ ${totalMonthPurchases.toFixed(2)}
- Lucro esse mês: R$ ${profit.toFixed(2)} ${profit >= 0 ? '✅' : '⚠️'}

PRODUTOS MAIS VENDIDOS: ${topProducts || 'Nenhuma venda registrada ainda'}

INGREDIENTES COMPRADOS ESSE MÊS: ${ingredientPrices || 'Nenhuma compra registrada ainda'}

RECEITAS CADASTRADAS: ${allRecipes.length > 0 ? allRecipes.map(r => r.name).join(', ') : 'Nenhuma receita cadastrada ainda'}
  `.trim()
}

export async function addChatMessage(role: 'user' | 'assistant', content: string): Promise<void> {
  await db.chatHistory.add({ role, content, timestamp: new Date().toISOString() })
  const count = await db.chatHistory.count()
  if (count > 50) {
    const oldest = await db.chatHistory.orderBy('timestamp').first()
    if (oldest?.id) await db.chatHistory.delete(oldest.id)
  }
}

export async function getRecentChatHistory(): Promise<ChatMessage[]> {
  return db.chatHistory.orderBy('timestamp').last(16).then(async () => {
    return db.chatHistory.orderBy('timestamp').reverse().limit(16).toArray().then(msgs => msgs.reverse())
  })
}
