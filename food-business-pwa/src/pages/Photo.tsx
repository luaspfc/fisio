import React, { useState, useRef } from 'react'
import { Header } from '../components/Header'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { analyzeImage, formatCurrency } from '../lib/ai'
import { db } from '../lib/db'

type Step = 'capture' | 'analyzing' | 'review' | 'done'

interface ExtractedItem {
  name: string
  quantity: number
  unit: string
  price: number
}

export function Photo() {
  const [step, setStep] = useState<Step>('capture')
  const [preview, setPreview] = useState<string | null>(null)
  const [extractedItems, setExtractedItems] = useState<ExtractedItem[]>([])
  const [extractedTotal, setExtractedTotal] = useState(0)
  const [aiMessage, setAiMessage] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const processImage = async (file: File) => {
    setStep('analyzing')
    setError(null)

    const reader = new FileReader()
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string
      setPreview(dataUrl)

      const base64 = dataUrl.split(',')[1]
      const mediaType = file.type || 'image/jpeg'

      try {
        const result = await analyzeImage(base64, mediaType)
        setAiMessage(result.response)

        if (result.success && result.items.length > 0) {
          setExtractedItems(result.items)
          setExtractedTotal(result.total)
          setStep('review')
        } else {
          setError(result.response)
          setStep('capture')
        }
      } catch {
        setError('Não consegui analisar a foto. Tente outra com melhor iluminação.')
        setStep('capture')
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    try {
      await db.purchases.add({
        date: new Date().toISOString().split('T')[0],
        items: extractedItems,
        total: extractedTotal,
        note: 'Registrado via foto',
        createdAt: new Date().toISOString()
      })
      setStep('done')
      setShowConfirm(false)
    } catch {
      setError('Erro ao salvar. Tente novamente.')
    }
  }

  const reset = () => {
    setStep('capture')
    setPreview(null)
    setExtractedItems([])
    setExtractedTotal(0)
    setAiMessage('')
    setError(null)
  }

  const updateItemPrice = (index: number, price: number) => {
    const updated = [...extractedItems]
    updated[index] = { ...updated[index], price }
    setExtractedItems(updated)
    setExtractedTotal(updated.reduce((s, i) => s + i.price, 0))
  }

  const removeItem = (index: number) => {
    const updated = extractedItems.filter((_, i) => i !== index)
    setExtractedItems(updated)
    setExtractedTotal(updated.reduce((s, i) => s + i.price, 0))
  }

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      <Header title="Foto da Notinha" />

      <div className="flex-1 px-4 py-6">
        {/* Step: capture */}
        {step === 'capture' && (
          <div className="flex flex-col items-center gap-5">
            <div className="bg-white rounded-3xl p-6 shadow border border-gray-100 w-full text-center">
              <div className="text-6xl mb-4">📷</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Fotografar Notinha</h2>
              <p className="text-lg text-gray-600">
                Tire uma foto da nota fiscal ou cupom de compra. A assistente vai ler os itens pra você!
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-4 w-full">
                <p className="text-red-700 text-lg">{error}</p>
              </div>
            )}

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={e => e.target.files?.[0] && processImage(e.target.files[0])}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => e.target.files?.[0] && processImage(e.target.files[0])}
            />

            <button
              onClick={() => cameraInputRef.current?.click()}
              className="w-full bg-blue-500 text-white text-xl font-bold py-6 rounded-2xl shadow-md border-b-4 border-blue-700 active:border-b-2 active:translate-y-0.5 touch-manipulation"
            >
              📸 Tirar Foto Agora
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-gray-100 text-gray-700 text-xl font-semibold py-5 rounded-2xl border-b-4 border-gray-200 active:border-b-2 touch-manipulation"
            >
              🖼️ Escolher da Galeria
            </button>
          </div>
        )}

        {/* Step: analyzing */}
        {step === 'analyzing' && (
          <div className="flex flex-col items-center gap-6 pt-8">
            {preview && (
              <img src={preview} alt="Nota" className="w-full max-h-64 object-contain rounded-2xl shadow" />
            )}
            <div className="text-center">
              <div className="text-5xl mb-4 animate-spin">⏳</div>
              <p className="text-2xl font-bold text-gray-800">Lendo a notinha...</p>
              <p className="text-lg text-gray-500 mt-2">Aguarde um momento</p>
            </div>
          </div>
        )}

        {/* Step: review */}
        {step === 'review' && (
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-3xl p-4 shadow border border-gray-100">
              <p className="text-lg font-semibold text-gray-700 mb-4">{aiMessage}</p>

              <div className="space-y-3">
                {extractedItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-amber-50 rounded-2xl p-3">
                    <div className="flex-1">
                      <p className="text-lg font-bold text-gray-800">{item.name}</p>
                      <p className="text-base text-gray-500">{item.quantity} {item.unit}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base text-gray-500">R$</span>
                      <input
                        type="number"
                        value={item.price}
                        onChange={e => updateItemPrice(i, parseFloat(e.target.value) || 0)}
                        className="w-20 text-lg font-bold text-gray-800 text-right border border-gray-200 rounded-xl px-2 py-1 bg-white"
                      />
                      <button
                        onClick={() => removeItem(i)}
                        className="text-red-400 text-xl px-2 touch-manipulation"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-700">Total:</span>
                <span className="text-2xl font-bold text-orange-600">{formatCurrency(extractedTotal)}</span>
              </div>
            </div>

            <button
              onClick={() => setShowConfirm(true)}
              className="w-full bg-green-600 text-white text-xl font-bold py-5 rounded-2xl shadow border-b-4 border-green-700 active:border-b-2 touch-manipulation"
            >
              ✅ Salvar Compra
            </button>
            <button
              onClick={reset}
              className="w-full bg-gray-100 text-gray-700 text-lg font-semibold py-4 rounded-2xl border-b-4 border-gray-200 touch-manipulation"
            >
              🔄 Tirar Outra Foto
            </button>
          </div>
        )}

        {/* Step: done */}
        {step === 'done' && (
          <div className="flex flex-col items-center gap-6 pt-8">
            <div className="text-8xl">🎉</div>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800">Salvo!</h2>
              <p className="text-xl text-gray-600 mt-2">
                {formatCurrency(extractedTotal)} registrado nos gastos!
              </p>
            </div>
            <button
              onClick={reset}
              className="w-full bg-orange-500 text-white text-xl font-bold py-5 rounded-2xl shadow border-b-4 border-orange-700 touch-manipulation"
            >
              📷 Fotografar Outra Nota
            </button>
          </div>
        )}
      </div>

      {showConfirm && (
        <ConfirmDialog
          message={`Salvar compra de ${formatCurrency(extractedTotal)} com ${extractedItems.length} item(s)?`}
          onConfirm={handleSave}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  )
}
