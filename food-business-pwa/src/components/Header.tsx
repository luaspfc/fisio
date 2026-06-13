import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

interface HeaderProps {
  title: string
  showBack?: boolean
}

export function Header({ title, showBack = true }: HeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <header className="bg-orange-500 text-white px-4 py-3 flex items-center gap-3 shadow-md sticky top-0 z-10">
      {showBack && !isHome && (
        <button
          onClick={() => navigate('/')}
          className="text-white p-2 -ml-2 rounded-xl active:bg-orange-600 touch-manipulation"
          aria-label="Voltar para início"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      <div className="flex items-center gap-2 flex-1">
        <span className="text-2xl">🍳</span>
        <h1 className="text-xl font-bold leading-tight">{title}</h1>
      </div>
      <button
        onClick={() => navigate('/configuracoes')}
        className="text-white p-2 -mr-2 rounded-xl active:bg-orange-600 touch-manipulation"
        aria-label="Configurações"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </header>
  )
}
