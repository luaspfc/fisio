import React from 'react'

interface BigButtonProps {
  emoji: string
  label: string
  sublabel?: string
  color: 'orange' | 'blue' | 'green' | 'purple' | 'pink' | 'red' | 'amber'
  onClick: () => void
  disabled?: boolean
  fullWidth?: boolean
}

const colorMap = {
  orange: 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white border-orange-600',
  blue: 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white border-blue-600',
  green: 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white border-green-700',
  purple: 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white border-purple-700',
  pink: 'bg-pink-500 hover:bg-pink-600 active:bg-pink-700 text-white border-pink-600',
  red: 'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white border-red-600',
  amber: 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white border-amber-600'
}

export function BigButton({ emoji, label, sublabel, color, onClick, disabled, fullWidth }: BigButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${colorMap[color]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer shadow-md active:shadow-sm active:translate-y-0.5'}
        flex flex-col items-center justify-center gap-1
        rounded-2xl border-b-4
        p-5 min-h-[100px]
        transition-all duration-100
        select-none touch-manipulation
      `}
    >
      <span className="text-4xl leading-none" role="img" aria-hidden="true">{emoji}</span>
      <span className="text-lg font-bold leading-tight text-center">{label}</span>
      {sublabel && <span className="text-sm opacity-90 text-center">{sublabel}</span>}
    </button>
  )
}
