import React, { useState, useEffect } from 'react'
import { Header } from '../components/Header'
import { getSetting, setSetting, db } from '../lib/db'

export function Settings() {
  const [userName, setUserName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [saved, setSaved] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [stats, setStats] = useState({ sales: 0, purchases: 0, recipes: 0 })

  useEffect(() => {
    getSetting('userName').then(v => setUserName(v || ''))
    getSetting('businessName').then(v => setBusinessName(v || ''))
    Promise.all([
      db.sales.count(),
      db.purchases.count(),
      db.recipes.count()
    ]).then(([s, p, r]) => setStats({ sales: s, purchases: p, recipes: r }))
  }, [])

  const handleSave = async () => {
    await setSetting('userName', userName.trim())
    await setSetting('businessName', businessName.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleClearHistory = async () => {
    await db.chatHistory.clear()
    setShowClearConfirm(false)
  }

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      <Header title="Configurações" />

      <div className="flex-1 px-4 py-5 space-y-4 overflow-y-auto pb-8">
        {/* Personal info */}
        <div className="bg-white rounded-3xl p-5 shadow border border-gray-100 space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">👤 Suas Informações</h2>

          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">Seu nome</label>
            <input
              type="text"
              value={userName}
              onChange={e => setUserName(e.target.value)}
              placeholder="Ex: Maria, Dona Maria..."
              className="w-full text-xl border-2 border-gray-200 rounded-2xl px-4 py-4 focus:border-orange-400 outline-none bg-gray-50 text-gray-800"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">Nome do seu negócio</label>
            <input
              type="text"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              placeholder="Ex: Doces da Maria, Cozinha Caseira..."
              className="w-full text-xl border-2 border-gray-200 rounded-2xl px-4 py-4 focus:border-orange-400 outline-none bg-gray-50 text-gray-800"
            />
          </div>

          <button
            onClick={handleSave}
            className={`w-full text-xl font-bold py-5 rounded-2xl border-b-4 touch-manipulation transition-colors ${
              saved
                ? 'bg-green-500 text-white border-green-700'
                : 'bg-orange-500 text-white border-orange-700'
            }`}
          >
            {saved ? '✅ Salvo!' : '💾 Salvar'}
          </button>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-3xl p-5 shadow border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Seus Dados</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Vendas', count: stats.sales, emoji: '💰' },
              { label: 'Compras', count: stats.purchases, emoji: '🛒' },
              { label: 'Receitas', count: stats.recipes, emoji: '📖' }
            ].map(s => (
              <div key={s.label} className="text-center bg-amber-50 rounded-2xl p-4">
                <div className="text-3xl">{s.emoji}</div>
                <div className="text-2xl font-bold text-gray-800 mt-1">{s.count}</div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* How to install */}
        <div className="bg-blue-50 border border-blue-200 rounded-3xl p-5">
          <h2 className="text-xl font-bold text-blue-800 mb-3">📱 Instalar no Celular</h2>
          <p className="text-lg text-blue-700 leading-relaxed">
            Para instalar este app na tela inicial do celular:
          </p>
          <div className="mt-3 space-y-2">
            <p className="text-base text-blue-700">📱 <strong>Android:</strong> Toque nos 3 pontos do Chrome → "Adicionar à tela inicial"</p>
            <p className="text-base text-blue-700">🍎 <strong>iPhone:</strong> Toque no botão compartilhar → "Adicionar à Tela de Início"</p>
          </div>
        </div>

        {/* Clear chat */}
        <div className="bg-white rounded-3xl p-5 shadow border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-2">🗑️ Limpar Histórico</h2>
          <p className="text-base text-gray-500 mb-4">Apaga o histórico de conversas (não apaga dados de vendas e compras)</p>
          {!showClearConfirm ? (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full bg-red-50 text-red-600 text-lg font-semibold py-4 rounded-2xl border border-red-200 touch-manipulation"
            >
              Limpar histórico de conversa
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-lg font-semibold text-gray-700">Tem certeza?</p>
              <button onClick={handleClearHistory} className="w-full bg-red-500 text-white text-lg font-bold py-4 rounded-2xl touch-manipulation">
                Sim, limpar
              </button>
              <button onClick={() => setShowClearConfirm(false)} className="w-full bg-gray-100 text-gray-700 text-lg py-4 rounded-2xl touch-manipulation">
                Cancelar
              </button>
            </div>
          )}
        </div>

        {/* Version */}
        <div className="text-center text-gray-400 text-sm pb-4">
          <p>Assistente Culinária v1.0</p>
          <p className="mt-1">Feito com ❤️ para o seu negócio</p>
        </div>
      </div>
    </div>
  )
}
