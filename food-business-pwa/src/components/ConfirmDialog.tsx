import React from 'react'

interface ConfirmDialogProps {
  message: string
  detail?: string
  onConfirm: () => void
  onCorrect?: () => void
  onCancel: () => void
}

export function ConfirmDialog({ message, detail, onConfirm, onCorrect, onCancel }: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4 pb-8">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-slide-up">
        <div className="bg-orange-50 p-6 border-b border-orange-100">
          <div className="text-3xl mb-3">🤔</div>
          <p className="text-xl font-semibold text-gray-800 leading-snug">{message}</p>
          {detail && <p className="text-base text-gray-500 mt-2">{detail}</p>}
        </div>
        <div className="p-4 flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className="w-full bg-green-600 text-white text-lg font-bold py-4 rounded-2xl active:bg-green-700 border-b-4 border-green-700 touch-manipulation"
          >
            ✅ Sim, salvar!
          </button>
          {onCorrect && (
            <button
              onClick={onCorrect}
              className="w-full bg-amber-500 text-white text-lg font-bold py-4 rounded-2xl active:bg-amber-600 border-b-4 border-amber-600 touch-manipulation"
            >
              ✏️ Corrigir
            </button>
          )}
          <button
            onClick={onCancel}
            className="w-full bg-gray-100 text-gray-700 text-lg font-semibold py-4 rounded-2xl active:bg-gray-200 border-b-4 border-gray-200 touch-manipulation"
          >
            ❌ Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
