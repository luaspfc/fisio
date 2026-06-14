import React, { useState, useEffect } from 'react'
import { Header } from '../components/Header'
import { db, Recipe, Purchase } from '../lib/db'
import { formatCurrency } from '../lib/ai'

type View = 'list' | 'detail' | 'add'

export function Recipes() {
  const [view, setView] = useState<View>('list')
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [selected, setSelected] = useState<Recipe | null>(null)
  const [recipeCost, setRecipeCost] = useState<number | null>(null)

  // Add form state
  const [name, setName] = useState('')
  const [yieldQty, setYieldQty] = useState(1)
  const [yieldUnit, setYieldUnit] = useState('unidades')
  const [preparation, setPreparation] = useState('')
  const [ingredients, setIngredients] = useState([{ name: '', quantity: 1, unit: 'unidade' }])
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadRecipes() }, [])

  const loadRecipes = async () => {
    const all = await db.recipes.orderBy('createdAt').reverse().toArray()
    setRecipes(all)
  }

  const calculateCost = async (recipe: Recipe) => {
    const purchases = await db.purchases.toArray()
    const ingredientPrices: Record<string, number> = {}

    purchases.forEach(p => {
      p.items.forEach(item => {
        const key = item.name.toLowerCase()
        if (!ingredientPrices[key] || item.price > ingredientPrices[key]) {
          ingredientPrices[key] = item.price
        }
      })
    })

    let totalCost = 0
    recipe.ingredients.forEach(ing => {
      const key = ing.name.toLowerCase()
      const price = ingredientPrices[key] || 0
      totalCost += price
    })

    setRecipeCost(totalCost)
  }

  const openRecipe = async (recipe: Recipe) => {
    setSelected(recipe)
    await calculateCost(recipe)
    setView('detail')
  }

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      await db.recipes.add({
        name: name.trim(),
        ingredients: ingredients.filter(i => i.name.trim()),
        preparation: preparation.trim() || undefined,
        yield: yieldQty,
        yieldUnit,
        createdAt: new Date().toISOString()
      })
      await loadRecipes()
      setView('list')
      setName('')
      setIngredients([{ name: '', quantity: 1, unit: 'unidade' }])
      setPreparation('')
      setYieldQty(1)
    } finally {
      setSaving(false)
    }
  }

  const addIngredient = () => setIngredients(prev => [...prev, { name: '', quantity: 1, unit: 'unidade' }])
  const updateIngredient = (i: number, field: string, value: string | number) => {
    setIngredients(prev => prev.map((ing, idx) => idx === i ? { ...ing, [field]: value } : ing))
  }
  const removeIngredient = (i: number) => setIngredients(prev => prev.filter((_, idx) => idx !== i))

  const deleteRecipe = async (id: number) => {
    await db.recipes.delete(id)
    await loadRecipes()
    setView('list')
  }

  // LIST VIEW
  if (view === 'list') {
    return (
      <div className="min-h-screen bg-amber-50 flex flex-col">
        <Header title="Minhas Receitas" />
        <div className="flex-1 px-4 py-4 space-y-3 overflow-y-auto pb-8">
          <button
            onClick={() => setView('add')}
            className="w-full bg-pink-500 text-white text-xl font-bold py-5 rounded-2xl shadow border-b-4 border-pink-700 touch-manipulation"
          >
            ➕ Adicionar Nova Receita
          </button>

          {recipes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📖</div>
              <p className="text-xl text-gray-500">Nenhuma receita ainda.</p>
              <p className="text-lg text-gray-400 mt-2">Adicione suas receitas favoritas!</p>
            </div>
          ) : (
            recipes.map(recipe => (
              <button
                key={recipe.id}
                onClick={() => openRecipe(recipe)}
                className="w-full bg-white rounded-2xl p-4 shadow border border-gray-100 text-left active:bg-gray-50 touch-manipulation"
              >
                <div className="flex items-center gap-3">
                  <span className="text-4xl">🍽️</span>
                  <div className="flex-1">
                    <p className="text-xl font-bold text-gray-800">{recipe.name}</p>
                    <p className="text-base text-gray-500">
                      {recipe.ingredients.length} ingrediente(s) • Rende {recipe.yield} {recipe.yieldUnit}
                    </p>
                  </div>
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    )
  }

  // DETAIL VIEW
  if (view === 'detail' && selected) {
    const unitCost = recipeCost !== null ? recipeCost / selected.yield : null
    const suggestedPrice = unitCost !== null ? unitCost * 2.7 : null

    return (
      <div className="min-h-screen bg-amber-50 flex flex-col">
        <div className="bg-orange-500 text-white px-4 py-3 flex items-center gap-3 shadow-md">
          <button onClick={() => setView('list')} className="p-2 -ml-2 rounded-xl active:bg-orange-600 touch-manipulation">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold flex-1">{selected.name}</h1>
        </div>

        <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto pb-8">
          {/* Cost card */}
          {recipeCost !== null && (
            <div className="bg-white rounded-3xl p-5 shadow border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-3">💰 Custos (baseado no que comprou)</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-lg text-gray-600">Custo total da receita:</span>
                  <span className="text-xl font-bold text-gray-800">{formatCurrency(recipeCost)}</span>
                </div>
                {unitCost !== null && (
                  <div className="flex justify-between">
                    <span className="text-lg text-gray-600">Custo por {selected.yieldUnit.replace(/s$/, '')}:</span>
                    <span className="text-xl font-bold text-orange-600">{formatCurrency(unitCost)}</span>
                  </div>
                )}
                {suggestedPrice !== null && (
                  <div className="flex justify-between border-t border-gray-100 pt-2 mt-2">
                    <span className="text-lg font-semibold text-green-700">Preço sugerido de venda:</span>
                    <span className="text-xl font-bold text-green-600">{formatCurrency(suggestedPrice)}</span>
                  </div>
                )}
              </div>
              {recipeCost === 0 && (
                <p className="text-sm text-gray-400 mt-2">
                  * Registre as compras dos ingredientes para calcular o custo automaticamente
                </p>
              )}
            </div>
          )}

          {/* Yield */}
          <div className="bg-white rounded-3xl p-5 shadow border border-gray-100">
            <p className="text-lg text-gray-600">Rende:</p>
            <p className="text-2xl font-bold text-gray-800">{selected.yield} {selected.yieldUnit}</p>
          </div>

          {/* Ingredients */}
          <div className="bg-white rounded-3xl p-5 shadow border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-3">🥚 Ingredientes</h3>
            <div className="space-y-2">
              {selected.ingredients.map((ing, i) => (
                <div key={i} className="flex items-center gap-2 py-2 border-b border-gray-50 last:border-0">
                  <span className="text-xl">•</span>
                  <span className="text-lg text-gray-800">
                    <strong>{ing.quantity} {ing.unit}</strong> de {ing.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Preparation */}
          {selected.preparation && (
            <div className="bg-white rounded-3xl p-5 shadow border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-3">👩‍🍳 Modo de Preparo</h3>
              <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.preparation}</p>
            </div>
          )}

          {/* Note */}
          {selected.note && (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4">
              <p className="text-lg text-amber-800">💡 {selected.note}</p>
            </div>
          )}

          <button
            onClick={() => selected.id && deleteRecipe(selected.id)}
            className="w-full bg-red-50 text-red-600 text-lg font-semibold py-4 rounded-2xl border border-red-200 touch-manipulation"
          >
            🗑️ Apagar esta receita
          </button>
        </div>
      </div>
    )
  }

  // ADD VIEW
  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      <div className="bg-orange-500 text-white px-4 py-3 flex items-center gap-3 shadow-md">
        <button onClick={() => setView('list')} className="p-2 -ml-2 rounded-xl active:bg-orange-600 touch-manipulation">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold">Nova Receita</h1>
      </div>

      <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto pb-8">
        <div className="bg-white rounded-3xl p-5 shadow border border-gray-100 space-y-4">
          <div>
            <label className="block text-xl font-bold text-gray-700 mb-2">🍰 Nome da receita</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Bolo de chocolate"
              className="w-full text-xl border-2 border-gray-200 rounded-2xl px-4 py-4 focus:border-orange-400 outline-none bg-gray-50"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-lg font-bold text-gray-700 mb-2">Rende quantos?</label>
              <input
                type="number"
                value={yieldQty}
                onChange={e => setYieldQty(parseInt(e.target.value) || 1)}
                className="w-full text-xl border-2 border-gray-200 rounded-2xl px-4 py-4 focus:border-orange-400 outline-none bg-gray-50"
              />
            </div>
            <div className="flex-1">
              <label className="block text-lg font-bold text-gray-700 mb-2">Unidade</label>
              <select
                value={yieldUnit}
                onChange={e => setYieldUnit(e.target.value)}
                className="w-full text-xl border-2 border-gray-200 rounded-2xl px-4 py-4 focus:border-orange-400 outline-none bg-gray-50"
              >
                {['unidades', 'potes', 'fatias', 'porções', 'bolos', 'kg'].map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="bg-white rounded-3xl p-5 shadow border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4">🥚 Ingredientes</h3>
          <div className="space-y-3">
            {ingredients.map((ing, i) => (
              <div key={i} className="flex gap-2 items-center">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={ing.name}
                    onChange={e => updateIngredient(i, 'name', e.target.value)}
                    placeholder="Ingrediente"
                    className="w-full text-lg border-2 border-gray-200 rounded-xl px-3 py-3 focus:border-orange-400 outline-none bg-gray-50"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={ing.quantity}
                      onChange={e => updateIngredient(i, 'quantity', parseFloat(e.target.value) || 1)}
                      className="w-20 text-lg border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-orange-400 outline-none bg-gray-50"
                    />
                    <input
                      type="text"
                      value={ing.unit}
                      onChange={e => updateIngredient(i, 'unit', e.target.value)}
                      placeholder="unidade"
                      className="flex-1 text-lg border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-orange-400 outline-none bg-gray-50"
                    />
                  </div>
                </div>
                {ingredients.length > 1 && (
                  <button onClick={() => removeIngredient(i)} className="text-red-400 text-2xl px-2 touch-manipulation flex-shrink-0">✕</button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={addIngredient}
            className="mt-4 w-full bg-gray-100 text-gray-700 text-lg font-semibold py-3 rounded-2xl border border-gray-200 touch-manipulation"
          >
            ➕ Mais um ingrediente
          </button>
        </div>

        {/* Preparation */}
        <div className="bg-white rounded-3xl p-5 shadow border border-gray-100">
          <label className="block text-xl font-bold text-gray-700 mb-3">👩‍🍳 Modo de preparo (opcional)</label>
          <textarea
            value={preparation}
            onChange={e => setPreparation(e.target.value)}
            placeholder="Como fazer..."
            rows={4}
            className="w-full text-lg border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-orange-400 outline-none bg-gray-50 resize-none"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={!name.trim() || saving}
          className="w-full bg-pink-500 text-white text-2xl font-bold py-6 rounded-2xl shadow border-b-4 border-pink-700 disabled:opacity-50 touch-manipulation"
        >
          {saving ? '⏳ Salvando...' : '✅ Salvar Receita'}
        </button>
        <div className="pb-4" />
      </div>
    </div>
  )
}
