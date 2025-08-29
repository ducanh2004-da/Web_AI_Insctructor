import { useState, useEffect, Suspense, useCallback, lazy, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { useProgress, PerformanceMonitor, AdaptiveDpr, useGLTF } from '@react-three/drei'
import { Icon } from '@iconify/react'
import { cn } from '@/lib'
// import { useParams } from 'react-router-dom'

import { 
  MessageBox,
  ConversationBox,
  ClassroomLoading,
  useClassroomStore, 
  useTeacherSpeech, 
  checkAzureSpeechSDK
} from '@/features/classroom'
import { MessageBoxHandle, ConversationBoxHandle } from '@/features/classroom'
import { Tooltip } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'

const Scene = lazy(() => import('@/features/classroom/components/Scene'))

useGLTF.preload('/models/classroom_default.glb')
useGLTF.preload('/models/teacher.glb')
useGLTF.preload('/models/teacher_animation.glb')

export default function ClassRoomPage() {
  // const { courseId } = useParams<{ courseId: string }>()
  const { active, progress } = useProgress()
  const initialLoad = useClassroomStore((state) => state.initialLoad)
  const setInitialLoad = useClassroomStore((state) => state.setInitialLoad)
  const isThinking = useClassroomStore((state) => state.isThinking)
  const stopAll = useClassroomStore((state) => state.stopAll)
  const isLessonStarted = useClassroomStore((state) => state.isLessonStarted)
  const isExplanationVisible = useClassroomStore((state) => state.isExplanationVisible)
  
  const {
    stop: stopAzure,
    error: azureError
  } = useTeacherSpeech()

  const [sdkError, setSdkError] = useState<string | null>(null)
  const [sdkLoading, setSdkLoading] = useState<boolean>(true)
  
  const [initialLoadComplete, setInitialLoadComplete] = useState<boolean>(false)
  const [loaderVisible, setLoaderVisible] = useState<boolean>(true)
  
  const [boxesVisibility, setBoxesVisibility] = useState<{
    message: boolean;
    conversation: boolean;
  }>({
    message: isLessonStarted,
    conversation: isLessonStarted
  })

  const messageBoxRef = useRef<MessageBoxHandle>(null)
  const conversationBoxRef = useRef<ConversationBoxHandle>(null)
  
  const handleFadeComplete = useCallback(() => {
    setLoaderVisible(false)
  }, [])
  
  useEffect(() => {
    if (progress === 100 && !active && !initialLoadComplete) {
      setInitialLoadComplete(true)
      
      setTimeout(() => {
        setInitialLoad(true)
      }, 500)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, active, initialLoadComplete])
  
  useEffect(() => {
    const { isAvailable, error } = checkAzureSpeechSDK()
    setSdkLoading(false)
    
    if (!isAvailable && error) {
      console.warn('Azure Speech SDK check failed:', error)
      setSdkError(error)
    }
  }, [])

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
      setBoxesVisibility({
        message: false,
        conversation: false
      })
    } 
    else if (isLessonStarted && isExplanationVisible) {
      messageBoxRef.current?.show()
      conversationBoxRef.current?.show()
      setBoxesVisibility({
        message: true,
        conversation: true
      })
    }
  }, [isLessonStarted, isExplanationVisible])

  const handleGoBack = () => {
    stopAzure()
    stopAll()
    window.location.href = '/courses'
  }

  const handleMessageBoxVisibilityChange = (visible: boolean) => {
    setBoxesVisibility(prev => ({
      ...prev,
      message: visible
    }))
  }
  
  const handleConversationBoxVisibilityChange = (visible: boolean) => {
    setBoxesVisibility(prev => ({
      ...prev,
      conversation: visible
    }))
  }

  return (
    <>
      {loaderVisible && (
        <ClassroomLoading 
          progress={progress} 
          sdkError={sdkError}
          sdkLoading={sdkLoading}
          isLoaded={initialLoad}
          onFadeComplete={handleFadeComplete}
        />
      )}
      
      <div 
        style={{ opacity: initialLoad ? 1 : 0, transition: 'opacity 0.5s' }}
      >
        <div className="absolute top-9 left-9 z-50">
          <Tooltip
            content="Back to Courses"
            contentClassName="text-[1.25rem] z-[60]"
            position='right'
          >
            <Button
              onClick={handleGoBack}
              variant="outline"
              className={cn(
                'rounded-full bg-white/20 backdrop-blur-[16px] border-white/30 hover:bg-white/30 text-white !p-0 hover:text-white size-12 drop-shadow-lg',
                isThinking && 'pointer-events-none opacity-70'
              )}
            >
              <Icon icon="lucide:arrow-left" className="!size-[1.5rem] drop-shadow-lg" />
            </Button>
          </Tooltip>
        </div>

        <MessageBox 
          ref={messageBoxRef}
          visible={boxesVisibility.message} 
          onVisibilityChange={handleMessageBoxVisibilityChange}
        />
        
        <ConversationBox
          ref={conversationBoxRef}
          visible={boxesVisibility.conversation}
          onVisibilityChange={handleConversationBoxVisibilityChange}
        />
      </div>
      
      <div className="size-full" style={{ backfaceVisibility: 'hidden' }}>
        <Canvas
          camera={{ position: [0, 0, 0.0001] }}
          dpr={[1, 1.5]}
          onCreated={(state) => {
            state.gl.setClearColor('#000000')
            state.invalidate()
          }}
        >
          <PerformanceMonitor>
            <AdaptiveDpr pixelated />
            
            <Suspense fallback={null}>
              <Scene />
            </Suspense>
          </PerformanceMonitor>
        </Canvas>
      </div>
    </>
  )
}