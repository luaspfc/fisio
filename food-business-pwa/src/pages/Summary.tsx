import React, { useState, useEffect } from 'react'
import { Header } from '../components/Header'
import { db, Purchase, Sale } from '../lib/db'
import { formatCurrency, formatDate } from '../lib/ai'

type Period = 'week' | 'month' | 'all'

interface FinancialData {
  totalSales: number
  totalPurchases: number
  profit: number
  topProducts: Array<{ name: string; total: number; count: number }>
  recentSales: Sale[]
  recentPurchases: Purchase[]
}

export function Summary() {
  const [period, setPeriod] = useState<Period>('month')
  const [data, setData] = useState<FinancialData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [period])

  const loadData = async () => {
    setLoading(true)
    try {
      const now = new Date()
      let startDate: Date

      if (period === 'week') {
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 7)
      } else if (period === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      } else {
        startDate = new Date(0)
      }

      const startIso = startDate.toISOString()

      const [sales, purchases] = await Promise.all([
        db.sales.where('createdAt').above(startIso).toArray(),
        db.purchases.where('createdAt').above(startIso).toArray()
      ])

      const totalSales = sales.reduce((s, sale) => s + sale.total, 0)
      const totalPurchases = purchases.reduce((s, p) => s + p.total, 0)
      const profit = totalSales - totalPurchases

      const productMap = sales.reduce((acc, s) => {
        if (!acc[s.product]) acc[s.product] = { name: s.product, total: 0, count: 0 }
        acc[s.product].total += s.total
        acc[s.product].count += s.quantity
        return acc
      }, {} as Record<string, { name: string; total: number; count: number }>)

      const topProducts = Object.values(productMap).sort((a, b) => b.total - a.total).slice(0, 5)

      setData({
        totalSales,
        totalPurchases,
        profit,
        topProducts,
        recentSales: sales.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
        recentPurchases: purchases.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5)
      })
    } finally {
      setLoading(false)
    }
  }

  const periodLabel = { week: 'essa semana', month: 'esse mês', all: 'no total' }

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      <Header title="Ver o Dinheiro" />

      {/* Period selector */}
      <div className="px-4 pt-4">
        <div className="bg-white rounded-2xl shadow p-1 flex gap-1 border border-gray-100">
          {(['week', 'month', 'all'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-3 rounded-xl text-base font-semibold touch-manipulation transition-colors ${
                period === p ? 'bg-orange-500 text-white' : 'text-gray-600'
              }`}
            >
              {{ week: 'Semana', month: 'Mês', all: 'Total' }[p]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-5xl animate-spin">⏳</div>
        </div>
      ) : data ? (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-8">
          {/* Main cards */}
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-green-600 text-white rounded-3xl p-5 shadow-md">
              <p className="text-lg opacity-90">Vendas {periodLabel[period]}</p>
              <p className="text-4xl font-bold mt-1">{formatCurrency(data.totalSales)}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-4">
                <p className="text-base text-red-600 font-semibold">Gastos</p>
                <p className="text-2xl font-bold text-red-700 mt-1">{formatCurrency(data.totalPurchases)}</p>
              </div>
              <div className={`rounded-3xl p-4 border-2 ${data.profit >= 0 ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                <p className={`text-base font-semibold ${data.profit >= 0 ? 'text-green-600' : 'text-orange-600'}`}>Lucro</p>
                <p className={`text-2xl font-bold mt-1 ${data.profit >= 0 ? 'text-green-700' : 'text-orange-700'}`}>
                  {formatCurrency(data.profit)}
                </p>
              </div>
            </div>
          </div>

          {/* Reserve suggestion */}
          {data.totalSales > 0 && (
            <div className="bg-purple-50 border-2 border-purple-200 rounded-3xl p-5">
              <p className="text-lg font-bold text-purple-800 mb-3">💡 Sugestão para dividir o dinheiro:</p>
              <div className="space-y-2">
                {[
                  { label: '🛒 Repor ingredientes', pct: 0.40, color: 'text-blue-700' },
                  { label: '💰 Seu lucro', pct: 0.35, color: 'text-green-700' },
                  { label: '🏦 Guardar de reserva', pct: 0.15, color: 'text-purple-700' },
                  { label: '📦 Embalagens e taxas', pct: 0.10, color: 'text-orange-700' }
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center">
                    <span className="text-base text-gray-700">{item.label}</span>
                    <span className={`text-base font-bold ${item.color}`}>
                      {formatCurrency(data.totalSales * item.pct)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top products */}
          {data.topProducts.length > 0 && (
            <div className="bg-white rounded-3xl p-5 shadow border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4">🏆 Produtos que mais vendem</h3>
              <div className="space-y-3">
                {data.topProducts.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <span className="text-2xl">{['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i]}</span>
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-gray-800">{p.name}</p>
                      <p className="text-base text-gray-500">{p.count} vendidos</p>
                    </div>
                    <span className="text-lg font-bold text-green-600">{formatCurrency(p.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent sales */}
          {data.recentSales.length > 0 && (
            <div className="bg-white rounded-3xl p-5 shadow border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4">💰 Últimas Vendas</h3>
              <div className="space-y-3">
                {data.recentSales.map(sale => (
                  <div key={sale.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-lg font-semibold text-gray-800">{sale.product}</p>
                      <p className="text-base text-gray-500">{sale.quantity}x • {formatDate(sale.createdAt)}</p>
                    </div>
                    <span className="text-xl font-bold text-green-600">{formatCurrency(sale.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent purchases */}
          {data.recentPurchases.length > 0 && (
            <div className="bg-white rounded-3xl p-5 shadow border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4">🛒 Últimas Compras</h3>
              <div className="space-y-3">
                {data.recentPurchases.map(purchase => (
                  <div key={purchase.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-base text-gray-700">
                        {purchase.items.map(i => i.name).join(', ')}
                      </p>
                      <p className="text-base text-gray-500">{formatDate(purchase.createdAt)}</p>
                    </div>
                    <span className="text-xl font-bold text-red-500">{formatCurrency(purchase.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.totalSales === 0 && data.totalPurchases === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-xl text-gray-500">Nenhum dado registrado ainda.</p>
              <p className="text-lg text-gray-400 mt-2">Registre vendas e compras para ver seu resumo!</p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
