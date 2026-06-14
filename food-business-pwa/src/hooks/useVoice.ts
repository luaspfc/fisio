import { useState, useCallback, useRef } from 'react'
import {
  startListening,
  stopListening,
  speak,
  stopSpeaking,
  isSpeechRecognitionSupported,
  cleanTextForSpeech
} from '../lib/speech'

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error'

export function useVoice() {
  const [state, setState] = useState<VoiceState>('idle')
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const supported = isSpeechRecognitionSupported()
  const stateRef = useRef<VoiceState>('idle')

  const updateState = (s: VoiceState) => {
    stateRef.current = s
    setState(s)
  }

  const startRecording = useCallback(() => {
    if (!supported) {
      setError('Seu navegador não suporta reconhecimento de voz. Use o Chrome no Android.')
      updateState('error')
      return
    }

    stopSpeaking()
    setError(null)
    setTranscript('')
    updateState('listening')

    startListening(
      (text) => {
        setTranscript(text)
        updateState('processing')
      },
      () => {
        if (stateRef.current === 'listening') updateState('idle')
      },
      (err) => {
        setError(err)
        updateState('error')
        setTimeout(() => {
          if (stateRef.current === 'error') updateState('idle')
        }, 3000)
      }
    )
  }, [supported])

  const stopRecording = useCallback(() => {
    stopListening()
    if (stateRef.current === 'listening') updateState('idle')
  }, [])

  const sayText = useCallback((text: string, onEnd?: () => void) => {
    stopSpeaking()
    updateState('speaking')
    const clean = cleanTextForSpeech(text)
    speak(
      clean,
      () => {
        updateState('idle')
        onEnd?.()
      }
    )
  }, [])

  const stopAll = useCallback(() => {
    stopListening()
    stopSpeaking()
    updateState('idle')
  }, [])

  return {
    state,
    transcript,
    error,
    supported,
    startRecording,
    stopRecording,
    sayText,
    stopAll,
    isListening: state === 'listening',
    isProcessing: state === 'processing',
    isSpeaking: state === 'speaking',
    isIdle: state === 'idle'
  }
}
