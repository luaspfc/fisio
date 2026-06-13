import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BigButton } from '../components/BigButton'
import { getSetting } from '../lib/db'

export function Home() {
  const navigate = useNavigate()
  const [userName, setUserName] = useState('')

  useEffect(() => {
    getSetting('userName').then(name => setUserName(name || ''))
  }, [])

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      {/* Header */}
      <header className="bg-orange-500 text-white px-5 pt-12 pb-6 shadow-md">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-4xl">🍳</span>
          <div>
            <p className="text-base opacity-90">{greeting()}{userName ? `, ${userName}` : ''}!</p>
            <h1 className="text-2xl font-bold leading-tight">Minha Assistente</h1>
          </div>
        </div>
      </header>

      {/* Main button - big voice */}
      <div className="px-5 pt-6 pb-4">
        <button
          onClick={() => navigate('/conversar')}
          className="w-full bg-orange-500 text-white rounded-3xl p-6 shadow-xl border-b-4 border-orange-700 active:border-b-2 active:translate-y-0.5 transition-all touch-manipulation flex items-center gap-5"
        >
          <span className="text-6xl flex-shrink-0">🎙️</span>
          <div className="text-left">
            <p className="text-2xl font-bold">Falar com a Assistente</p>
            <p className="text-base opacity-90 mt-0.5">Pode falar, eu entendo!</p>
          </div>
        </button>
      </div>

      {/* Grid of buttons */}
      <div className="px-5 grid grid-cols-2 gap-4 flex-1 pb-8">
        <BigButton
          emoji="📷"
          label="Foto da Notinha"
          sublabel="Registrar compra"
          color="blue"
          onClick={() => navigate('/foto')}
        />
        <BigButton
          emoji="💰"
          label="Registrar Venda"
          sublabel="O que vendi?"
          color="green"
          onClick={() => navigate('/vendas')}
        />
        <BigButton
          emoji="📊"
          label="Ver o Dinheiro"
          sublabel="Quanto tenho?"
          color="purple"
          onClick={() => navigate('/resumo')}
        />
        <BigButton
          emoji="📖"
          label="Minhas Receitas"
          sublabel="Caderno virtual"
          color="pink"
          onClick={() => navigate('/receitas')}
        />
        <BigButton
          emoji="🛵"
          label="Ajuda iFood"
          sublabel="Criar anúncio"
          color="red"
          onClick={() => navigate('/ifood')}
        />
        <BigButton
          emoji="🛒"
          label="Registrar Compra"
          sublabel="Gastei com o quê?"
          color="amber"
          onClick={() => navigate('/conversar?modo=compra')}
        />
      </div>
    </div>
  )
}
