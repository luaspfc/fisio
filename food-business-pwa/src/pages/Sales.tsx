import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../components/Header'
import { db } from '../lib/db'
import { formatCurrency } from '../lib/ai'

const PAYMENT_OPTIONS = [
  { key: 'pix', label: 'Pix', emoji: '📲' },
  { key: 'dinheiro', label: 'Dinheiro', emoji: '💵' },
  { key: 'cartão', label: 'Cartão', emoji: '💳' },
  { key: 'ifood', label: 'iFood', emoji: '🛵' }
]

type Step = 'form' | 'success'

export function Sales() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('form')
  const [product, setProduct] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [unitPrice, setUnitPrice] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [savedTotal, setSavedTotal] = useState(0)

  const total = quantity * (parseFloat(unitPrice) || 0)

  const handleSave = async () => {
    if (!product.trim()) { setError('Por favor, escreva o nome do produto.'); return }
    if (!unitPrice || parseFloat(unitPrice) <= 0) { setError('Por favor, coloque o preço.'); return }

    try {
      await db.sales.add({
        date: new Date().toISOString().split('T')[0],
        product: product.trim(),
        quantity,
        unitPrice: parseFloat(unitPrice),
        total,
        paymentMethod: paymentMethod || undefined,
        createdAt: new Date().toISOString()
      })
      setSavedTotal(total)
      setStep('success')
    } catch {
      setError('Erro ao salvar. Tente novamente.')
    }
  }

  const reset = () => {
    setStep('form')
    setProduct('')
    setQuantity(1)
    setUnitPrice('')
    setPaymentMethod(null)
    setError(null)
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-amber-50 flex flex-col">
        <Header title="Registrar Venda" />
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
          <div className="text-8xl">🎉</div>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800">Venda registrada!</h2>
            <p className="text-2xl text-green-600 font-bold mt-2">{formatCurrency(savedTotal)}</p>
          </div>
          <div className="w-full flex flex-col gap-3">
            <button onClick={reset} className="w-full bg-green-600 text-white text-xl font-bold py-5 rounded-2xl border-b-4 border-green-700 touch-manipulation">
              💰 Registrar Outra Venda
            </button>
            <button onClick={() => navigate('/')} className="w-full bg-gray-100 text-gray-700 text-xl font-semibold py-4 rounded-2xl border-b-4 border-gray-200 touch-manipulation">
              🏠 Ir para o Início
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      <Header title="Registrar Venda" />

      <div className="flex-1 px-4 py-5 overflow-y-auto">
        <div className="space-y-5">
          {/* Product */}
          <div className="bg-white rounded-3xl p-5 shadow border border-gray-100">
            <label className="block text-xl font-bold text-gray-700 mb-3">
              🍰 O que você vendeu?
            </label>
            <input
              type="text"
              value={product}
              onChange={e => { setProduct(e.target.value); setError(null) }}
              placeholder="Ex: Bolo de chocolate, Brigadeiro..."
              className="w-full text-xl border-2 border-gray-200 rounded-2xl px-4 py-4 focus:border-orange-400 outline-none text-gray-800 bg-gray-50"
            />
          </div>

          {/* Quantity */}
          <div className="bg-white rounded-3xl p-5 shadow border border-gray-100">
            <label className="block text-xl font-bold text-gray-700 mb-3">
              🔢 Quantos você vendeu?
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-16 h-16 bg-gray-100 text-gray-800 text-3xl font-bold rounded-2xl active:bg-gray-200 touch-manipulation border-b-4 border-gray-200 flex items-center justify-center"
              >
                −
              </button>
              <span className="flex-1 text-center text-4xl font-bold text-gray-800">{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="w-16 h-16 bg-orange-500 text-white text-3xl font-bold rounded-2xl active:bg-orange-600 touch-manipulation border-b-4 border-orange-700 flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>

          {/* Price */}
          <div className="bg-white rounded-3xl p-5 shadow border border-gray-100">
            <label className="block text-xl font-bold text-gray-700 mb-3">
              💲 Preço de cada um?
            </label>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-500">R$</span>
              <input
                type="number"
                inputMode="decimal"
                value={unitPrice}
                onChange={e => { setUnitPrice(e.target.value); setError(null) }}
                placeholder="0,00"
                className="flex-1 text-3xl font-bold border-2 border-gray-200 rounded-2xl px-4 py-4 focus:border-orange-400 outline-none text-gray-800 bg-gray-50"
              />
            </div>
            {total > 0 && (
              <div className="mt-4 bg-green-50 rounded-2xl px-4 py-3 flex justify-between items-center">
                <span className="text-lg text-green-700">Total:</span>
                <span className="text-2xl font-bold text-green-600">{formatCurrency(total)}</span>
              </div>
            )}
          </div>

          {/* Payment method */}
          <div className="bg-white rounded-3xl p-5 shadow border border-gray-100">
            <label className="block text-xl font-bold text-gray-700 mb-3">
              💳 Como recebeu? (opcional)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {PAYMENT_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setPaymentMethod(paymentMethod === opt.key ? null : opt.key)}
                  className={`py-4 rounded-2xl text-lg font-semibold border-2 touch-manipulation flex items-center justify-center gap-2 ${
                    paymentMethod === opt.key
                      ? 'bg-orange-500 text-white border-orange-600'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  <span>{opt.emoji}</span> {opt.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-4">
              <p className="text-red-700 text-lg">{error}</p>
            </div>
          )}

          <button
            onClick={handleSave}
            className="w-full bg-green-600 text-white text-2xl font-bold py-6 rounded-2xl shadow border-b-4 border-green-700 active:border-b-2 active:translate-y-0.5 touch-manipulation"
          >
            ✅ Salvar Venda
          </button>
          <div className="pb-4" />
        </div>
      </div>
    </div>
  )
}
