import { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { cn, gsap, useGSAP } from '@/lib'
import { useClassroomStore } from '../stores'
import { messageService } from '../services'
import { useTeacherSpeech, useAnimatedBox, useVoiceRecognition } from '../hooks'
import { useMutation } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { GENERAL_MODE } from '../constants'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'

export interface MessageBoxHandle {
  show: () => void
  hide: () => void
  toggle: () => void
}

interface MessageBoxProps {
  visible?: boolean
  onVisibilityChange?: (visible: boolean) => void
}

const MessageBox = forwardRef<MessageBoxHandle, MessageBoxProps>(({ 
  visible = true,
  onVisibilityChange
}, ref) => {
  const { courseId, lessonId } = useParams()

  const { 
    speak: speakAzure, 
    isReady: isAzureReady,
    isSpeaking: isAzureSpeaking,
    isThinking: isAzureThinking,
    error: azureError,
    cleanup: cleanupAzure
  } = useTeacherSpeech()
  const startThinking = useClassroomStore((state) => state.startThinking)
  const stopAll = useClassroomStore((state) => state.stopAll)
  const setIsThinking = useClassroomStore((state) => state.setIsThinking)
  const setIsSpeaking = useClassroomStore((state) => state.setIsSpeaking)
  const setCameraMode = useClassroomStore((state) => state.setCameraMode)
  const setTeacherMode = useClassroomStore((state) => state.setTeacherMode)
  const currentMessage = useClassroomStore((state) => state.currentMessage)
  const selectedConversationId = useClassroomStore((state) => state.selectedConversationId)
  const isLessonStarted = useClassroomStore((state) => state.isLessonStarted)
  const isExplanationVisible = useClassroomStore((state) => state.isExplanationVisible)

  const [message, setMessage] = useState<string>('')
  const [_, setSdkError] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const messageBoxRef = useRef<HTMLDivElement>(null)
  const collapseButtonRef = useRef<HTMLButtonElement>(null)
  const collapseButtonContainerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const controlsRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLParagraphElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const expandIconRef = useRef<HTMLDivElement>(null)
  const contentContainerRef = useRef<HTMLDivElement>(null)
  
  const { 
    isVisible,
    isAnimating,
    showBox: showMessageBox,
    hideBox: hideMessageBox,
    toggleBox: toggleMessageBox,
    setupVisibleState,
    setupHiddenState
  } = useAnimatedBox(
    {
      containerRef,
      boxRef: messageBoxRef,
      expandIconRef,
      collapseButtonContainerRef,
      contentRef,
      titleRef,
      subtitleRef,
      controlsRef
    },
    {
      expandedWidth: '53rem',
      expandedHeight: '13.5rem',
      collapsedSize: '3.5rem',
      expandedBorderRadius: '1.25rem',
      collapsedBorderRadius: '50%',
      onShowComplete: () => {
        if (inputRef.current) inputRef.current.focus()
      }
    },
    visible,
    onVisibilityChange
  )
  
  useGSAP(() => {
    if (isVisible) {
      setupVisibleState()
    } else {
      setupHiddenState()
    }
    
    if (visible !== isVisible && !isAnimating) {
      if (visible) showMessageBox()
      else hideMessageBox()
    }
  }, { scope: containerRef, dependencies: [isVisible, visible, isAnimating] })

  useGSAP(() => {
    gsap.killTweensOf([
      contentContainerRef.current,
      titleRef.current,
      subtitleRef.current,
      controlsRef.current
    ])
    
    if (selectedConversationId) {
      const elementsToAnimate = [
        contentContainerRef.current,
        subtitleRef.current,
        controlsRef.current
      ].filter(Boolean)
      
      gsap.set(elementsToAnimate, { opacity: 0, y: 10 })
      
      gsap.to(elementsToAnimate, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
        stagger: 0.1,
        overwrite: true
      })
    } else {
      const defaultElements = [
        titleRef.current,
        subtitleRef.current,
        controlsRef.current
      ].filter(Boolean)
      
      gsap.set(defaultElements, { opacity: 0, y: 10 })
      
      gsap.to(defaultElements, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
        stagger: 0.1,
        overwrite: true
      })
    }
  }, { scope: containerRef, dependencies: [selectedConversationId] })

  useEffect(() => {
    setIsThinking(isAzureThinking)
    setIsSpeaking(isAzureSpeaking)
    
    if (isAzureThinking) {
      setCameraMode(GENERAL_MODE.THINKING)
      setTeacherMode(GENERAL_MODE.THINKING)
    } else if (isAzureSpeaking) {
      setCameraMode(GENERAL_MODE.SPEAKING) 
      setTeacherMode(GENERAL_MODE.SPEAKING)
    } else {
      setCameraMode(GENERAL_MODE.IDLE)
      setTeacherMode(GENERAL_MODE.IDLE)
    }
  }, [isAzureThinking, isAzureSpeaking, setIsThinking, setIsSpeaking, setCameraMode, setTeacherMode])

  useEffect(() => {
    if (!currentMessage && !isAzureThinking && !isAzureSpeaking) {
      stopAll()
    }
  }, [currentMessage, isAzureThinking, isAzureSpeaking, stopAll])
  
  useEffect(() => {
    return () => {
      cleanupAzure()
      stopAll()
    }
  }, [cleanupAzure, stopAll])

  useEffect(() => {
    if (azureError) {
      console.warn('Azure Speech Error:', azureError)
      setSdkError(azureError)
    } else {
      setSdkError(null)
    }
  }, [azureError])

  useEffect(() => {
    if (isLessonStarted && !isExplanationVisible) {
      if (isVisible) {
        hideMessageBox()
      }
    }
  }, [isLessonStarted, isExplanationVisible, isVisible, hideMessageBox])

  useImperativeHandle(ref, () => ({
    show: showMessageBox,
    hide: hideMessageBox,
    toggle: toggleMessageBox
  }))

  const messageMutation = useMutation(
    {
    mutationFn: (content: string | null) => messageService.createMessage(
      content,
      selectedConversationId,
      courseId || null,
      lessonId || null
    ),
    onSuccess: async (result) => {
      if (result) {
        setMessage('')
        
        if (result.content) {
          try {
            startThinking()
            
            if (!isAzureReady) return
            
            const speakResult = await speakAzure(result.content)

            if (!speakResult?.success && speakResult?.error) {
              stopAll()
              
              if (speakResult.error.includes('disposed')) {
                await new Promise(resolve => setTimeout(resolve, 500))
                const retryResult = await speakAzure(result.content)
                
                if (!retryResult?.success) {
                  toast.error(`Lỗi khi phát âm: ${retryResult.error}`)
                  stopAll()
                }
              } else {
                toast.error(`Lỗi khi phát âm: ${speakResult.error}`)
                stopAll()
              }
            }
          } catch (error: any) {
            stopAll()
            toast.error(error?.message || 'Không thể kích hoạt giọng nói cho AI Teacher')
          }
        }
      }
    },
    onError: (error: any) => {
      console.error('Message mutation error:', error)
      toast.error(error?.message || 'Không thể gửi tin nhắn')
    }
  })

  const handleSubmit = () => {
    if (!selectedConversationId) return
    
    if (!message.trim()) {
      if (inputRef.current) inputRef.current.focus()
      return
    }
    
    try {
      messageMutation.mutate(message)
    } catch (error: any) {
      console.error('Error submitting message:', error)
      toast.error(error?.message || 'Có lỗi khi gửi tin nhắn')
    }
  }

  const { isListening, startListening, stopListening } = useVoiceRecognition({
    continuous: true,
    silenceTimeout: 5000,
    onResult: (text) => {
      setMessage(text)
    },
    onError: (error) => {
      toast.error(`Lỗi nhận dạng giọng nói: ${error}`)
    }
  })

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  useEffect(() => {
    if (inputRef.current && message) {
      setTimeout(() => {
        inputRef.current?.setSelectionRange(message.length, message.length)
        
        if (inputRef.current && inputRef.current.scrollWidth > inputRef.current.clientWidth) {
          inputRef.current.scrollLeft = inputRef.current.scrollWidth
        }
        
        if (isListening) {
          inputRef.current?.focus()
        }
      }, 0)
    }
  }, [message, isListening])
  
  return (
    <div ref={containerRef} className="absolute bottom-[1.65rem] left-1/2 -translate-x-1/2 flex items-center justify-center z-50">
      <div 
        ref={messageBoxRef}
        className={cn(
          'bg-white/20 backdrop-blur-[16px] border border-white/20',
          'flex items-center justify-center overflow-visible relative',
          !selectedConversationId && 'opacity-90'
        )}
      >
        <div 
          ref={collapseButtonContainerRef} 
          className="absolute -top-[1.2rem] left-1/2 -translate-x-1/2 z-20"
        >
          {!messageMutation.isPending ? (
            <Tooltip
              content="Minimize box"
              contentClassName="text-[1.25rem] z-[60]"
            >
              <Button
                ref={collapseButtonRef}
                onClick={toggleMessageBox}
                variant="outline"
                className="rounded-full !p-0 bg-white/20 backdrop-blur-md border-white/30 hover:bg-white/30 text-white hover:text-white size-9 drop-shadow-lg"
              >
                <Icon icon="tabler:minimize" className="!size-[1.4rem] drop-shadow-lg" />
              </Button>
            </Tooltip>
          ) : (
            <Button
              variant="outline"
              className="rounded-full !p-0 bg-white/20 backdrop-blur-md border-white/30 hover:bg-white/30 text-white hover:text-white size-9 drop-shadow-lg cursor-not-allowed opacity-70"
              disabled
            >
              <Icon icon="tabler:minimize" className="!size-[1.4rem] drop-shadow-lg" />
            </Button>
          )}
        </div>
        <div 
          ref={expandIconRef}
          className={cn(
            'flex items-center justify-center size-full relative',
            isExplanationVisible ? 'cursor-pointer' : 'pointer-events-none'
          )}
          onClick={isExplanationVisible ? showMessageBox : undefined}
        >
          <Icon icon="fluent:chat-28-regular" className="!size-[1.75rem] text-white drop-shadow-lg" />
          
          <Tooltip 
            content="Ask your teacher"
            className="absolute inset-0 z-[51]"
            contentClassName="text-[1.25rem] z-[60]"
          />
        </div>
        <div 
          ref={contentRef} 
          className="size-full flex flex-col justify-between px-[1.6rem] py-[1.4rem]"
        >
          <div className="flex flex-col">
            <p 
              ref={titleRef}
              className="text-[1.8rem] font-semibold text-white drop-shadow-lg -mb-[.05rem] flex items-center flex-wrap"
            >
              {selectedConversationId ? (
                <span ref={contentContainerRef} className="flex items-center">
                  Ask a question about today's lesson
                </span>
              ) : (
                <>
                  Select a conversation
                </>
              )}
            </p>
            <p 
              ref={subtitleRef}
              className="text-[1.2rem] text-white/80 font-normal drop-shadow-lg"
            >
              {selectedConversationId ? (
                <>Type your question here! Be specific and clear.</>
              ) : (
                <>Use the conversation box to select or create a conversation</>
              )}
            </p>
          </div>
          
          <div ref={controlsRef} className="flex items-center gap-5">
            {selectedConversationId ? (
              <>
                <div className="flex-1 relative">
                  <Input 
                    ref={inputRef}
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className={cn(
                      'w-full h-12 bg-transparent border-t-0 border-l-0 border-r-0 rounded-none border-b-[.1rem] border-b-white text-white placeholder:text-white/80 !text-[1.4rem] focus:outline-none drop-shadow-lg',
                      messageMutation.isPending && 'pointer-events-none'
                    )}
                    placeholder="Ask something..."
                    onKeyDown={(e) => e.key === 'Enter' && !messageMutation.isPending && handleSubmit()}
                  />
                </div>
                
                <div className="flex gap-3.5">
                  <Tooltip
                    content="Voice Chat"
                    contentClassName="text-[1.25rem] z-[60]"
                  >
                    <Button 
                      onClick={handleVoiceInput}
                      variant="outline" 
                      className={cn(
                        'rounded-full bg-white/10 border-white/30 hover:bg-white/20 text-white hover:text-white size-14 drop-shadow-lg !p-0',
                        isListening && 'bg-white border-white/30 hover:bg-white/30'
                      )}
                    >
                      <Icon icon={isListening ? 'si:mic-fill' : 'si:mic-line'} className={cn(
                        '!size-[1.4rem] drop-shadow-lg',
                        isListening && 'text-black'
                      )} />
                    </Button>
                  </Tooltip>

                  <Button 
                    onClick={handleSubmit}
                    variant="default" 
                    className={cn(
                      'rounded-full bg-primary/80 hover:bg-primary size-14 !p-0 drop-shadow-lg',
                      messageMutation.isPending && 'pointer-events-none'
                    )}
                  >
                    {messageMutation.isPending ? (
                      <svg viewBox="25 25 50 50" className="!size-[1.75rem] loading__svg">
                        <circle r="20" cy="50" cx="50" className="loading__circle !stroke-white" />
                      </svg>
                    ) : (
                      <Icon icon="akar-icons:send" className="!size-[1.4rem] drop-shadow-lg" />
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="size-full flex items-center justify-center relative pointer-events-none -mt-[4.7rem]">
                <div className="ld-ripple drop-shadow-lg">
                  <div />
                  <div />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

MessageBox.displayName = 'MessageBox'

export default MessageBox