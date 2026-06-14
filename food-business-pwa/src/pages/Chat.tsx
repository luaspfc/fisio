import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Header } from '../components/Header'
import { MicButton } from '../components/MicButton'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { useVoice } from '../hooks/useVoice'
import { sendMessage, AIResponse } from '../lib/ai'
import { db, addChatMessage, getRecentChatHistory, getSetting, ChatMessage, Purchase, Sale, Recipe } from '../lib/db'

interface DisplayMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  timestamp: Date
}

export function Chat() {
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('modo')

  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingAction, setPendingAction] = useState<AIResponse | null>(null)
  const [showInput, setShowInput] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const voice = useVoice()

  const addMessage = useCallback((role: 'user' | 'assistant', text: string) => {
    const msg: DisplayMessage = { id: Date.now().toString(), role, text, timestamp: new Date() }
    setMessages(prev => [...prev, msg])
    return msg
  }, [])

  useEffect(() => {
    const init = async () => {
      const history = await getRecentChatHistory()
      if (history.length > 0) {
        setMessages(history.map(h => ({
          id: h.id?.toString() || Math.random().toString(),
          role: h.role,
          text: h.content,
          timestamp: new Date(h.timestamp)
        })))
      } else {
        const userName = await getSetting('userName') || 'amiga'
        let greeting = `Olá, ${userName}! 😊 Estou aqui pra te ajudar com o negócio. Pode falar comigo!`
        if (mode === 'compra') greeting = `Oi! Pode me falar o que você comprou hoje. Pode falar o nome, quantidade e o preço de cada coisa.`
        addMessage('assistant', greeting)
        voice.sayText(greeting)
      }
    }
    init()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim() || loading) return

    setLoading(true)
    setShowInput(false)
    addMessage('user', text)
    await addChatMessage('user', text)
    setInputText('')

    try {
      const history = await getRecentChatHistory()
      const chatHistory = history.slice(-8).map(h => ({ role: h.role as 'user' | 'assistant', content: h.content }))

      const response = await sendMessage(text, chatHistory)

      addMessage('assistant', response.response)
      await addChatMessage('assistant', response.response)

      if (response.action && response.needsConfirmation) {
        setPendingAction(response)
      } else if (response.action && !response.needsConfirmation) {
        await saveAction(response)
      }

      voice.sayText(response.response)
    } catch {
      const errMsg = 'Opa! Tive um probleminha. Pode tentar de novo?'
      addMessage('assistant', errMsg)
      voice.sayText(errMsg)
    } finally {
      setLoading(false)
    }
  }, [loading, addMessage, voice])

  useEffect(() => {
    if (voice.transcript && voice.state === 'processing') {
      handleSend(voice.transcript)
    }
  }, [voice.transcript, voice.state])

  const saveAction = async (action: AIResponse) => {
    if (!action.data) return

    try {
      const today = new Date().toISOString().split('T')[0]

      if (action.action === 'save_purchase') {
        const data = action.data as { items: Purchase['items']; total: number; note?: string }
        await db.purchases.add({
          date: today,
          items: data.items || [],
          total: data.total || 0,
          note: data.note,
          createdAt: new Date().toISOString()
        })
      } else if (action.action === 'save_sale') {
        const data = action.data as { product: string; quantity: number; unitPrice: number; total: number; paymentMethod?: string }
        await db.sales.add({
          date: today,
          product: data.product || '',
          quantity: data.quantity || 1,
          unitPrice: data.unitPrice || 0,
          total: data.total || 0,
          paymentMethod: data.paymentMethod,
          createdAt: new Date().toISOString()
        })
      } else if (action.action === 'save_recipe') {
        const data = action.data as { name: string; ingredients: Recipe['ingredients']; preparation?: string; yield: number; yieldUnit: string; note?: string }
        await db.recipes.add({
          name: data.name || 'Receita',
          ingredients: data.ingredients || [],
          preparation: data.preparation,
          yield: data.yield || 1,
          yieldUnit: data.yieldUnit || 'unidades',
          note: data.note,
          createdAt: new Date().toISOString()
        })
      }
    } catch (err) {
      console.error('Save error:', err)
    }
  }

  const handleConfirm = async () => {
    if (!pendingAction) return
    await saveAction(pendingAction)
    setPendingAction(null)
    const confirmMsg = 'Pronto! Salvei tudo certinho. 😊'
    addMessage('assistant', confirmMsg)
    await addChatMessage('assistant', confirmMsg)
    voice.sayText(confirmMsg)
  }

  const handleCorrect = () => {
    setPendingAction(null)
    const correctMsg = 'Tudo bem! Pode me falar de novo como foi.'
    addMessage('assistant', correctMsg)
    voice.sayText(correctMsg)
  }

  const handleMicPress = () => {
    if (voice.isListening) {
      voice.stopRecording()
    } else if (voice.isSpeaking) {
      voice.stopAll()
    } else {
      voice.startRecording()
    }
  }

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      <Header title="Falar com a Assistente" />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <span className="text-2xl mr-2 mt-1 flex-shrink-0">🍳</span>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-orange-500 text-white rounded-br-sm'
                  : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
              }`}
            >
              <p className="text-lg leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <span className="text-2xl mr-2">🍳</span>
            <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100">
              <div className="flex gap-1 items-center">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-3 h-3 bg-orange-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice error */}
      {voice.error && (
        <div className="mx-4 mb-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
          <p className="text-red-700 text-base">{voice.error}</p>
        </div>
      )}

      {/* Text input */}
      {showInput && (
        <div className="px-4 pb-2">
          <div className="flex gap-2 bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend(inputText)}
              placeholder="Escreva aqui..."
              className="flex-1 px-4 py-4 text-lg outline-none text-gray-800 bg-transparent"
              autoFocus
            />
            <button
              onClick={() => handleSend(inputText)}
              disabled={!inputText.trim()}
              className="bg-orange-500 text-white px-5 font-bold text-lg disabled:opacity-50"
            >
              ✉️
            </button>
          </div>
        </div>
      )}

      {/* Bottom controls */}
      <div className="bg-amber-50 px-4 pt-4 pb-8 flex flex-col items-center gap-3 border-t border-amber-200">
        <MicButton state={voice.state} onPress={handleMicPress} />
        <button
          onClick={() => setShowInput(s => !s)}
          className="text-orange-600 text-base font-medium underline touch-manipulation"
        >
          {showInput ? 'Esconder teclado' : 'Prefiro digitar'}
        </button>
      </div>

      {/* Confirm dialog */}
      {pendingAction && (
        <ConfirmDialog
          message={pendingAction.response}
          onConfirm={handleConfirm}
          onCorrect={handleCorrect}
          onCancel={() => setPendingAction(null)}
        />
      )}
    </div>
  )
}
