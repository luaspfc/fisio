import React from 'react'
import { VoiceState } from '../hooks/useVoice'

interface MicButtonProps {
  state: VoiceState
  onPress: () => void
  onRelease?: () => void
  size?: 'large' | 'medium'
}

const stateConfig = {
  idle: {
    bg: 'bg-orange-500 border-orange-600 hover:bg-orange-600 active:bg-orange-700',
    icon: '🎙️',
    label: 'Toque para falar',
    pulse: false
  },
  listening: {
    bg: 'bg-red-500 border-red-700',
    icon: '🔴',
    label: 'Ouvindo... Toque para parar',
    pulse: true
  },
  processing: {
    bg: 'bg-amber-500 border-amber-700',
    icon: '⏳',
    label: 'Processando...',
    pulse: false
  },
  speaking: {
    bg: 'bg-blue-500 border-blue-700',
    icon: '🔊',
    label: 'Respondendo...',
    pulse: true
  },
  error: {
    bg: 'bg-gray-400 border-gray-500',
    icon: '⚠️',
    label: 'Tente novamente',
    pulse: false
  }
}

export function MicButton({ state, onPress, size = 'large' }: MicButtonProps) {
  const config = stateConfig[state]
  const isLarge = size === 'large'

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={onPress}
        disabled={state === 'processing'}
        className={`
          ${config.bg}
          ${isLarge ? 'w-40 h-40' : 'w-24 h-24'}
          ${config.pulse ? 'animate-pulse' : ''}
          rounded-full border-b-8 shadow-xl
          flex items-center justify-center
          transition-all duration-150
          disabled:opacity-70 disabled:cursor-not-allowed
          touch-manipulation select-none
          active:translate-y-1 active:border-b-4
        `}
        aria-label={config.label}
      >
        <span className={isLarge ? 'text-7xl' : 'text-5xl'} role="img" aria-hidden="true">
          {config.icon}
        </span>
      </button>
      <p className={`${isLarge ? 'text-xl' : 'text-base'} font-semibold text-gray-700 text-center`}>
        {config.label}
      </p>
    </div>
  )
}
