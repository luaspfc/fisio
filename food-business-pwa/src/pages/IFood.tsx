import React, { useState } from 'react'
import { Header } from '../components/Header'
import { db } from '../lib/db'
import { sendMessage } from '../lib/ai'
import { useVoice } from '../hooks/useVoice'
import { MicButton } from '../components/MicButton'

interface GeneratedListing {
  name: string
  description: string
  price: string
  category: string
  tips: string[]
  photoTips: string[]
}

export function IFood() {
  const [productName, setProductName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GeneratedListing | null>(null)
  const [copied, setCopied] = useState(false)
  const voice = useVoice()

  const generate = async () => {
    if (!productName.trim()) return
    setLoading(true)
    setResult(null)

    try {
      const recipes = await db.recipes.toArray()
      const recipe = recipes.find(r => r.name.toLowerCase().includes(productName.toLowerCase()))

      const message = `Preciso de ajuda para criar um anúncio no iFood para: "${productName}". ${
        recipe ? `É uma receita que rende ${recipe.yield} ${recipe.yieldUnit}.` : ''
      } Me dê: nome atrativo, descrição curta (máximo 3 linhas), categoria sugerida, preço aproximado, dicas de foto e dicas para vender mais. Responda em formato JSON com campos: name, description, price, category, tips (array), photoTips (array). Sem textos fora do JSON.`

      const response = await sendMessage(message, [])

      try {
        const jsonMatch = response.response.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          setResult(parsed)
        } else {
          setResult({
            name: productName,
            description: response.response,
            price: 'Consulte o preço',
            category: 'Alimentos',
            tips: [],
            photoTips: []
          })
        }
      } catch {
        setResult({
          name: productName,
          description: response.response,
          price: 'Consulte o preço',
          category: 'Alimentos',
          tips: [],
          photoTips: []
        })
      }
    } catch {
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleMicPress = () => {
    if (voice.isListening) {
      voice.stopRecording()
    } else {
      voice.startRecording()
    }
  }

  if (voice.transcript && voice.state === 'processing' && !productName) {
    setProductName(voice.transcript)
  }

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      <Header title="Ajuda iFood" />

      <div className="flex-1 px-4 py-5 overflow-y-auto pb-8">
        <div className="space-y-4">
          {/* Input */}
          <div className="bg-white rounded-3xl p-5 shadow border border-gray-100">
            <label className="block text-xl font-bold text-gray-700 mb-3">
              🛵 Qual produto quer anunciar?
            </label>
            <input
              type="text"
              value={productName}
              onChange={e => setProductName(e.target.value)}
              placeholder="Ex: Bolo de chocolate, Brigadeiro..."
              className="w-full text-xl border-2 border-gray-200 rounded-2xl px-4 py-4 focus:border-orange-400 outline-none bg-gray-50 text-gray-800"
            />
            <div className="mt-4 flex justify-center">
              <div className="flex flex-col items-center gap-2">
                <MicButton state={voice.state} onPress={handleMicPress} size="medium" />
              </div>
            </div>
          </div>

          <button
            onClick={generate}
            disabled={!productName.trim() || loading}
            className="w-full bg-red-500 text-white text-xl font-bold py-5 rounded-2xl shadow border-b-4 border-red-700 disabled:opacity-50 touch-manipulation"
          >
            {loading ? '⏳ Gerando anúncio...' : '✨ Criar Anúncio para iFood'}
          </button>

          {/* Result */}
          {result && (
            <div className="space-y-3">
              <div className="bg-white rounded-3xl p-5 shadow border border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-800">📝 Seu Anúncio</h3>
                  <button
                    onClick={() => copyText(`${result.name}\n\n${result.description}\n\nPreço: ${result.price}\nCategoria: ${result.category}`)}
                    className="bg-orange-100 text-orange-700 text-base font-semibold px-3 py-2 rounded-xl touch-manipulation"
                  >
                    {copied ? '✅ Copiado!' : '📋 Copiar'}
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Nome do produto</p>
                    <p className="text-xl font-bold text-gray-800 mt-1">{result.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Descrição</p>
                    <p className="text-lg text-gray-700 mt-1 leading-relaxed">{result.description}</p>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Preço sugerido</p>
                      <p className="text-xl font-bold text-green-600 mt-1">{result.price}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Categoria</p>
                      <p className="text-lg font-semibold text-gray-700 mt-1">{result.category}</p>
                    </div>
                  </div>
                </div>
              </div>

              {result.tips && result.tips.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-3xl p-5">
                  <h3 className="text-xl font-bold text-green-800 mb-3">💡 Dicas para vender mais</h3>
                  <div className="space-y-2">
                    {result.tips.map((tip, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="text-green-600 flex-shrink-0 mt-0.5">✓</span>
                        <p className="text-lg text-green-700">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.photoTips && result.photoTips.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-3xl p-5">
                  <h3 className="text-xl font-bold text-blue-800 mb-3">📸 Dicas para a foto</h3>
                  <div className="space-y-2">
                    {result.photoTips.map((tip, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="text-blue-600 flex-shrink-0 mt-0.5">📸</span>
                        <p className="text-lg text-blue-700">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => { setResult(null); setProductName('') }}
                className="w-full bg-gray-100 text-gray-700 text-lg font-semibold py-4 rounded-2xl border-b-4 border-gray-200 touch-manipulation"
              >
                🔄 Criar outro anúncio
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
