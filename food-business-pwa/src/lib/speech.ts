export type SpeechState = 'idle' | 'listening' | 'processing' | 'speaking'

export function isSpeechRecognitionSupported(): boolean {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
}

export function isSpeechSynthesisSupported(): boolean {
  return 'speechSynthesis' in window
}

let recognitionInstance: SpeechRecognition | null = null
let synthInstance: SpeechSynthesisUtterance | null = null

export function startListening(
  onResult: (transcript: string) => void,
  onEnd: () => void,
  onError: (error: string) => void
): void {
  if (recognitionInstance) {
    recognitionInstance.abort()
  }

  const SpeechRecognition = (window as Window & typeof globalThis & { SpeechRecognition?: typeof window.SpeechRecognition; webkitSpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition || (window as Window & typeof globalThis & { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition

  if (!SpeechRecognition) {
    onError('Reconhecimento de voz não suportado neste navegador.')
    return
  }

  const recognition = new SpeechRecognition()
  recognitionInstance = recognition

  recognition.lang = 'pt-BR'
  recognition.continuous = false
  recognition.interimResults = false
  recognition.maxAlternatives = 1

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript
    onResult(transcript)
  }

  recognition.onend = () => {
    recognitionInstance = null
    onEnd()
  }

  recognition.onerror = (event) => {
    recognitionInstance = null
    const messages: Record<string, string> = {
      'no-speech': 'Não ouvi nada. Tente falar mais perto do microfone.',
      'audio-capture': 'Não consegui acessar o microfone.',
      'not-allowed': 'Por favor, permita o uso do microfone.',
      'network': 'Preciso de internet para reconhecer a voz.',
      'aborted': ''
    }
    const msg = messages[event.error] || 'Não consegui entender. Pode repetir?'
    if (msg) onError(msg)
    onEnd()
  }

  recognition.start()
}

export function stopListening(): void {
  if (recognitionInstance) {
    recognitionInstance.abort()
    recognitionInstance = null
  }
}

export function speak(
  text: string,
  onEnd?: () => void,
  rate = 0.9,
  pitch = 1.0
): void {
  if (!isSpeechSynthesisSupported()) return

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  synthInstance = utterance
  utterance.lang = 'pt-BR'
  utterance.rate = rate
  utterance.pitch = pitch
  utterance.volume = 1.0

  const setVoice = () => {
    const voices = window.speechSynthesis.getVoices()
    const ptVoice = voices.find(v => v.lang.startsWith('pt-BR') || v.lang.startsWith('pt'))
    if (ptVoice) utterance.voice = ptVoice
  }

  if (window.speechSynthesis.getVoices().length > 0) {
    setVoice()
  } else {
    window.speechSynthesis.onvoiceschanged = setVoice
  }

  utterance.onend = () => {
    synthInstance = null
    onEnd?.()
  }

  utterance.onerror = () => {
    synthInstance = null
    onEnd?.()
  }

  window.speechSynthesis.speak(utterance)
}

export function stopSpeaking(): void {
  window.speechSynthesis.cancel()
  synthInstance = null
}

export function isSpeaking(): boolean {
  return window.speechSynthesis?.speaking ?? false
}

export function cleanTextForSpeech(text: string): string {
  return text
    .replace(/R\$\s*(\d+[,.]?\d*)/g, 'R$ $1')
    .replace(/\*\*/g, '')
    .replace(/[#*_`]/g, '')
    .replace(/\n+/g, '. ')
    .replace(/\s+/g, ' ')
    .trim()
}
