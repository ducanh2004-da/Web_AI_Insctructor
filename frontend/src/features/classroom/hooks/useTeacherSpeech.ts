import { useState, useRef, useCallback, useEffect } from 'react'
import { createAzureSpeechConfig, checkAzureSpeechSDK } from '../utils'
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk'
import { GeneralMode } from '../types'
import { GENERAL_MODE } from '../constants'
import { useClassroomStore } from '../stores'

export type Viseme = [number, number]

export interface SpeechMessage {
  id: string;
  text: string;
  audioPlayer: HTMLAudioElement | null;
  visemes: Viseme[] | null;
  visemeStartTime?: number;
}

interface UseTeacherSpeechOptions {
  subscriptionKey?: string
  serviceRegion?: string
  voice?: string
  language?: string
  pitch?: number
  rate?: number
}

export const useTeacherSpeech = ({
  subscriptionKey = '',
  serviceRegion = '',
  voice = 'vi-VN-HoaiMyNeural',
  language = 'vi-VN',
  pitch = 0,
  rate = 1
}: UseTeacherSpeechOptions = {}) => {
  const [state, setState] = useState<GeneralMode>(GENERAL_MODE.IDLE)
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState<boolean>(false)
  
  const setCurrentMessage = useClassroomStore((state) => state.setCurrentMessage)
  
  const synthesisRef = useRef<any>(null)
  const isSynthesizerClosedRef = useRef<boolean>(false)
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null)
  const audioUrlRef = useRef<string | null>(null)
  
  const isPlayingRef = useRef<boolean>(false)
  const synthesisInProgressRef = useRef<boolean>(false)
  
  const createSynthesizer = useCallback(() => {
    try {
      const { isAvailable, sdk } = checkAzureSpeechSDK()
      
      if (!isAvailable || !sdk) {
        throw new Error('Azure Speech SDK is not available')
      }
      
      const speechConfig = createAzureSpeechConfig(
        subscriptionKey || undefined, 
        serviceRegion || undefined
      )
      
      if (!speechConfig) {
        throw new Error('Failed to create speech configuration')
      }
      
      speechConfig.speechSynthesisLanguage = language
      speechConfig.speechSynthesisVoiceName = voice
      
      if (pitch !== 0) {
        try {
          (speechConfig as any).speechSynthesisPitchHz = pitch
        } catch (e) {
          console.warn('Failed to set pitch, this property might not be supported in this SDK version', e)
        }
      }
      
      if (rate !== 1) {
        try {
          (speechConfig as any).speechSynthesisRate = rate
        } catch (e) {
          console.warn('Failed to set rate, this property might not be supported in this SDK version', e)
        }
      }
      
      const audioConfig = SpeechSDK.AudioConfig.fromStreamOutput(SpeechSDK.AudioOutputStream.createPullStream())
      const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig)
      
      isSynthesizerClosedRef.current = false
      
      return synthesizer
    } catch (err) {
      console.error('Error creating synthesizer:', err)
      return null
    }
  }, [subscriptionKey, serviceRegion, voice, language, pitch, rate])

  const cleanup = useCallback(() => {
    // console.log('Complete cleanup of Azure resources')
    
    synthesisInProgressRef.current = false
    isPlayingRef.current = false
    
    if (audioPlayerRef.current) {
      // console.log('Force stopping audio player')
      const player = audioPlayerRef.current
      player.onended = null
      player.pause()
      player.currentTime = 0
      player.src = ''
      player.load()
      audioPlayerRef.current = null
    }
    
    if (audioUrlRef.current) {
      try {
        // console.log('Revoking blob URL')
        URL.revokeObjectURL(audioUrlRef.current)
        audioUrlRef.current = null
      } catch (e) {
        console.error('Error revoking URL:', e)
      }
    }
    
    if (synthesisRef.current && !isSynthesizerClosedRef.current) {
      try {
        // console.log('Completely closing synthesizer')
        synthesisRef.current.close()
        isSynthesizerClosedRef.current = true
        synthesisRef.current = null
      } catch (e) {
        console.error('Error closing synthesizer:', e)
      }
    }
    
    setCurrentMessage(null)
    setState(GENERAL_MODE.IDLE)
  }, [setCurrentMessage])
  
  useEffect(() => {
    let mounted = true
    
    const initializeSdk = async () => {
      try {
        const { isAvailable, error: sdkError } = checkAzureSpeechSDK()
        
        if (!isAvailable) {
          if (mounted) {
            setError(sdkError || 'Azure Speech SDK is not available')
            setIsReady(false)
          }
          return
        }
        
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const synthesizer = createSynthesizer()
        
        if (!synthesizer) {
          throw new Error('Failed to create speech synthesizer')
        }
        
        if (mounted) {
          synthesisRef.current = synthesizer
          setIsReady(true)
          setError(null)
          // console.log('Azure Speech SDK synthesizer initialized successfully')
        }
      } catch (err) {
        if (mounted) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Azure Speech SDK'
          console.error('Failed to initialize Azure Speech SDK:', err)
          setError(errorMessage)
          setIsReady(false)
        }
      }
    }
    
    initializeSdk()
    
    return () => {
      mounted = false
      cleanup()
    }
  }, [createSynthesizer, cleanup])
  
  const ensureSynthesizerReady = useCallback(() => {
    // console.log('Checking synthesizer ready state:', { 
    //   isClosed: isSynthesizerClosedRef.current, 
    //   exists: !!synthesisRef.current 
    // })

    if (isSynthesizerClosedRef.current || !synthesisRef.current) {
      // console.log('Creating new synthesizer as previous one is disposed or null')
      try {
        const newSynthesizer = createSynthesizer()
        if (newSynthesizer) {
          if (synthesisRef.current) {
            try {
              synthesisRef.current.close()
            } catch (e) {
              console.warn('Error closing old synthesizer:', e)
            }
          }
          
          synthesisRef.current = newSynthesizer
          isSynthesizerClosedRef.current = false
          // console.log('Successfully created new synthesizer')
          return true
        } else {
          console.error('Failed to create new synthesizer')
          return false
        }
      } catch (err) {
        console.error('Error in ensureSynthesizerReady:', err)
        return false
      }
    }
    
    // console.log('Using existing synthesizer')
    return true
  }, [createSynthesizer])
  
  const stopAudioAndSynthesizer = useCallback(() => {
    // console.log('Stopping audio and synthesizer')
    
    synthesisInProgressRef.current = false
    isPlayingRef.current = false
    
    if (audioPlayerRef.current) {
      const player = audioPlayerRef.current
      // console.log('Force stopping audio playback')
      
      player.onended = null
      player.oncanplaythrough = null
      player.onerror = null
      
      try {
        player.pause()
        player.currentTime = 0
        player.src = ''
        player.load()
      } catch (e) {
        console.warn('Error stopping audio player:', e)
      }
      audioPlayerRef.current = null
    }
    
    if (synthesisRef.current) {
      try {
        // console.log('Completely closing synthesizer')
        synthesisRef.current.close()
      } catch (e) {
        console.error('Error stopping speech:', e)
      } finally {
        isSynthesizerClosedRef.current = true
        synthesisRef.current = null
      }
    }
    
    setCurrentMessage(null)
  }, [setCurrentMessage])
  
  const speakWithVisemes = useCallback(async (text: string) => {
    if (!isReady) {
      // console.log('SDK not ready, waiting a bit...')
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      if (!isReady) {
        const errorMessage = 'Azure Speech SDK is not ready after waiting'
        console.error(errorMessage)
        return {
          success: false,
          error: errorMessage
        }
      }
    }
    
    if (synthesisInProgressRef.current || isPlayingRef.current) {
      // console.log('Speech synthesis already in progress, stopping first')
      stopAudioAndSynthesizer()
      
      await new Promise(resolve => setTimeout(resolve, 800))
    }
    
    synthesisInProgressRef.current = true
    
    // console.log('Always creating new synthesizer before each speech')
    if (!ensureSynthesizerReady()) {
      const errorMessage = 'Could not create speech synthesizer'
      setError(errorMessage)
      synthesisInProgressRef.current = false
      return {
        success: false,
        error: errorMessage
      }
    }
    
    setState(GENERAL_MODE.THINKING)
    setError(null)
    
    const synthesizer = synthesisRef.current
    if (!synthesizer) {
      synthesisInProgressRef.current = false
      const errorMessage = 'Synthesizer is null after ensure ready'
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    }
    
    const visemes: Viseme[] = []
    
    try {
      synthesizer.visemeReceived = function(_s: any, e: any) {
        // console.log(`(Viseme), Audio offset: ${e.audioOffset / 10000}ms. Viseme ID: ${e.visemeId}`)
        visemes.push([e.audioOffset / 10000, e.visemeId])
      }
      
      const ssml = `
        <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="${language}">
          <voice name="${voice}">
            ${text}
          </voice>
        </speak>
      `
      
      // console.log('Starting speech synthesis with visemes...')
      
      return new Promise((resolve) => {
        try {
          synthesizer.speakSsmlAsync(
            ssml,
            (result: any) => {
              // console.log('Speech synthesis completed successfully', result)
              
              const audioData = result.audioData
              const blob = new Blob([audioData], { type: 'audio/wav' })
              
              if (audioUrlRef.current) {
                URL.revokeObjectURL(audioUrlRef.current)
              }
              
              const audioUrl = URL.createObjectURL(blob)
              audioUrlRef.current = audioUrl
              
              const audioPlayer = new Audio()
              
              audioPlayer.oncanplaythrough = () => {
                // console.log('Audio can play through')
                
                setState(GENERAL_MODE.SPEAKING)
                isPlayingRef.current = true
                
                const visemeStartTime = Date.now()
                
                const newMessage: SpeechMessage = {
                  id: Date.now().toString(),
                  text,
                  audioPlayer,
                  visemes,
                  visemeStartTime
                }
                
                setCurrentMessage(newMessage)
                
                audioPlayer.play().catch(error => {
                  console.error('Error playing audio:', error)
                  setState(GENERAL_MODE.ERROR)
                  setError('Failed to play audio')
                  synthesisInProgressRef.current = false
                  isPlayingRef.current = false
                })
              }
              
              audioPlayer.onended = () => {
                // console.log('Audio playback ended naturally')
                setState(GENERAL_MODE.IDLE)
                setCurrentMessage(null)
                synthesisInProgressRef.current = false
                isPlayingRef.current = false
              }
              
              audioPlayer.onerror = (e) => {
                console.error('Audio playback error:', e)
                setState(GENERAL_MODE.ERROR)
                setError('Audio playback error')
                synthesisInProgressRef.current = false
                isPlayingRef.current = false
              }
              
              audioPlayer.src = audioUrl
              audioPlayer.load()
              
              audioPlayerRef.current = audioPlayer
              
              resolve({
                success: true
              })
            },
            (error: any) => {
              console.error('Speech synthesis failed:', error)
              setState(GENERAL_MODE.ERROR)
              setError(`Speech synthesis failed: ${error}`)
              synthesisInProgressRef.current = false
              isPlayingRef.current = false
              
              if (error && error.toString().includes('disposed')) {
                isSynthesizerClosedRef.current = true
              }
              
              resolve({
                success: false,
                error: `Speech synthesis failed: ${error}`
              })
            }
          )
        } catch (err) {
          console.error('Exception during speech synthesis:', err)
          setState(GENERAL_MODE.ERROR)
          const errorMessage = err instanceof Error ? 
            `Azure speech error: ${err.message}` : 
            'Failed to generate speech. Please try again.'
          setError(errorMessage)
          
          if (err instanceof Error && err.message.includes('disposed')) {
            isSynthesizerClosedRef.current = true
          }
          
          synthesisInProgressRef.current = false
          isPlayingRef.current = false
          
          resolve({
            success: false,
            error: errorMessage
          })
        }
      }) as Promise<any>
    } catch (err) {
      console.error('Error in speak function:', err)
      setState(GENERAL_MODE.ERROR)
      const errorMessage = err instanceof Error ? 
        `Azure speech error: ${err.message}` : 
        'Failed to generate speech. Please try again.'
      setError(errorMessage)
      
      if (err instanceof Error && err.message.includes('disposed')) {
        isSynthesizerClosedRef.current = true
      }
      
      synthesisInProgressRef.current = false
      isPlayingRef.current = false
      
      return {
        success: false,
        error: errorMessage
      }
    }
  }, [isReady, synthesisRef, language, voice, ensureSynthesizerReady, stopAudioAndSynthesizer, setCurrentMessage])
  
  const stop = useCallback(() => {
    // console.log('Force stopping all Azure speech')
    
    stopAudioAndSynthesizer()
    
    setCurrentMessage(null)
    setState(GENERAL_MODE.IDLE)
  }, [stopAudioAndSynthesizer, setCurrentMessage])
  
  return {
    speak: speakWithVisemes,
    stop,
    cleanup,
    state,
    error,
    isReady,
    isSpeaking: state === 'speaking',
    isThinking: state === 'thinking',
    isError: state === 'error'
  }
} 