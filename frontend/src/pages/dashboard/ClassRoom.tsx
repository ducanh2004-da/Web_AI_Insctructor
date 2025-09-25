// // import { useState, useEffect, Suspense, useCallback, lazy, useRef } from 'react'
// import React, { Suspense, useEffect, useRef, useState, ChangeEvent, FormEvent, lazy } from 'react';
// import { Canvas } from '@react-three/fiber'
// import { useProgress, PerformanceMonitor, AdaptiveDpr, useGLTF } from '@react-three/drei'
// // import { PerformanceMonitor, AdaptiveDpr, } from '@react-three/drei'
// import { youtubeLink } from '@/mocks/youtubeLink';
// import { Icon } from '@iconify/react'
// // import { PerformanceMonitor, AdaptiveDpr} from '@react-three/drei'
// // import { AdaptiveDpr} from '@react-three/drei'
// // import { Icon } from '@iconify/react'
// // import { cn } from '@/lib'
// // import { useParams } from 'react-router-dom'

// import { 
//   MessageBox,
//   ConversationBox,
//   ClassroomLoading,
//   useClassroomStore, 
//   useTeacherSpeech, 
//   checkAzureSpeechSDK
// } from '@/features/classroom'
// import { MessageBoxHandle, ConversationBoxHandle } from '@/features/classroom'
// import { Tooltip } from '@/components/ui/tooltip'
// import { Button } from '@/components/ui/button'

// const Scene = lazy(() => import('@/features/classroom/components/Scene'))

// useGLTF.preload('/models/classroom_default.glb')
// useGLTF.preload('/models/teacher.glb')
// useGLTF.preload('/models/teacher_animation.glb')

// export default function ClassRoomPage() {
// const { courseId } = useParams<{ courseId: string }>()
//   const { active, progress } = useProgress()
//   const initialLoad = useClassroomStore((state) => state.initialLoad)
//   const setInitialLoad = useClassroomStore((state) => state.setInitialLoad)
//   const isThinking = useClassroomStore((state) => state.isThinking)
//   const stopAll = useClassroomStore((state) => state.stopAll)
//   const isLessonStarted = useClassroomStore((state) => state.isLessonStarted)
//   const isExplanationVisible = useClassroomStore((state) => state.isExplanationVisible)

//   const {
//     stop: stopAzure,
//     error: azureError
//   } = useTeacherSpeech()

//   const [sdkError, setSdkError] = useState<string | null>(null)
//   const [sdkLoading, setSdkLoading] = useState<boolean>(true)

//   const [initialLoadComplete, setInitialLoadComplete] = useState<boolean>(false)
//   const [loaderVisible, setLoaderVisible] = useState<boolean>(true)

//   const [boxesVisibility, setBoxesVisibility] = useState<{
//     message: boolean;
//     conversation: boolean;
//   }>({
//     message: isLessonStarted,
//     conversation: isLessonStarted
//   })

//   const messageBoxRef = useRef<MessageBoxHandle>(null)
//   const conversationBoxRef = useRef<ConversationBoxHandle>(null)

//   const handleFadeComplete = useCallback(() => {
//     setLoaderVisible(false)
//   }, [])

//   useEffect(() => {
//     if (progress === 100 && !active && !initialLoadComplete) {
//       setInitialLoadComplete(true)

//       setTimeout(() => {
//         setInitialLoad(true)
//       }, 500)
//     }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [progress, active, initialLoadComplete])

//   useEffect(() => {
//     const { isAvailable, error } = checkAzureSpeechSDK()
//     setSdkLoading(false)

//     if (!isAvailable && error) {
//       console.warn('Azure Speech SDK check failed:', error)
//       setSdkError(error)
//     }
//   }, [])

//   useEffect(() => {
//     if (azureError) {
//       console.warn('Azure Speech Error:', azureError)
//       setSdkError(azureError)
//     } else {
//       setSdkError(null)
//     }
//   }, [azureError])

// useEffect(() => {
//   if (isLessonStarted && !isExplanationVisible) {
//     setBoxesVisibility({
//       message: false,
//       conversation: false
//     })
//   } 
//   else if (isLessonStarted && isExplanationVisible) {
//     messageBoxRef.current?.show()
//     conversationBoxRef.current?.show()
//     setBoxesVisibility({
//       message: true,
//       conversation: true
//     })
//   }
// }, [isLessonStarted, isExplanationVisible])

//   const handleGoBack = () => {
//     stopAzure()
//     stopAll()
//     window.location.href = '/courses'
//   }

//   const handleMessageBoxVisibilityChange = (visible: boolean) => {
//     setBoxesVisibility(prev => ({
//       ...prev,
//       message: visible
//     }))
//   }

//   const handleConversationBoxVisibilityChange = (visible: boolean) => {
//     setBoxesVisibility(prev => ({
//       ...prev,
//       conversation: visible
//     }))
//   }

//   return (
//     <>
//       {loaderVisible && (
//         <ClassroomLoading 
//           progress={progress} 
//           sdkError={sdkError}
//           sdkLoading={sdkLoading}
//           isLoaded={initialLoad}
//           onFadeComplete={handleFadeComplete}
//         />
//       )}


//   <MessageBox 
//     ref={messageBoxRef}
//     visible={boxesVisibility.message} 
//     onVisibilityChange={handleMessageBoxVisibilityChange}
//   />

//   <ConversationBox
//     ref={conversationBoxRef}
//     visible={boxesVisibility.conversation}
//     onVisibilityChange={handleConversationBoxVisibilityChange}
//   />
// </div>

import React, {
  Suspense,
  useEffect,
  useRef,
  useState,
  useCallback,
  lazy,
  FormEvent,
  useMemo
} from 'react';
import { Canvas } from '@react-three/fiber';
import { useProgress, PerformanceMonitor, AdaptiveDpr } from '@react-three/drei';
import { youtubeLink } from '@/mocks/youtubeLink';
import { Icon } from '@iconify/react';
import { conversationService } from './../../features/classroom/services/conversation.service';
import { useAuthStore } from '@/stores';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/configs';
import { toast } from 'sonner';

import {
  MessageBox,
  ConversationBox,
  ClassroomLoading,
  useClassroomStore,
  useTeacherSpeech,
  checkAzureSpeechSDK
} from '@/features/classroom';
import { MessageBoxHandle, ConversationBoxHandle } from '@/features/classroom';
import { Tooltip } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

import { cn } from '@/lib' // giữ nếu bạn có helper này

// --- small stubs (replace with your real components if present) ---
const Input = React.forwardRef<HTMLInputElement, any>((props, ref) => <input ref={ref} {...props} />);
// Replace these with your real components
const ConversationSkeleton = () => <div className="h-12 bg-slate-100 rounded" />;
const ConversationItem = ({ conversation, onClick }: any) => (
  <div className="p-2 cursor-pointer" onClick={() => onClick?.(conversation)}>
    {conversation?.name ?? conversation?.id}
  </div>
);
// Stubs for update/delete states & handlers (replace with your real logic)
const updateConversationMutation: any = { isLoading: false };
const deleteConversationMutation: any = { isLoading: false };
let selectedConversationId: any = null;
let updatingConversationId: any = null;
let deletingConversationId: any = null;
const handleSelectConversation = (c?: any) => { };
const handleUpdateConversation = async (c?: any) => { };
const handleDeleteConversation = async (c?: any) => { };
// --- end stubs ---

const Scene = lazy(() => import('@/features/classroom/components/Scene'));

const GRAPHQL_ENDPOINT = import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:10000/graphql';

type Role = 'user' | 'assistant' | string;

interface Message {
  id: number | string;
  role: Role;
  text: string;
  ts?: number;
}

// Add Conversation type according to your backend shape
interface Conversation {
  id: string;
  name?: string;
  // other fields...
}

type ChunkEvent =
  | { type: 'chunk'; response: string }
  | { type: 'status'; agent?: string }
  | { type: 'done' }
  | { type: 'end' }
  | { type: 'raw'; raw: string }
  | any;

export default function ClassRoomPage() {
  // Zustand selector usage
  const authUser = useAuthStore(state => state.user);

  const { active, progress } = useProgress();
  const initialLoad = useClassroomStore((state) => state.initialLoad);
  const setInitialLoad = useClassroomStore((state) => state.setInitialLoad);
  const isThinking = useClassroomStore((state) => state.isThinking);
  const stopAll = useClassroomStore((state) => state.stopAll);
  const isLessonStarted = useClassroomStore((state) => state.isLessonStarted);
  const isExplanationVisible = useClassroomStore((state) => state.isExplanationVisible);

  // UI state
  const [newConversationName, setNewConversationName] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const newConversationInputRef = useRef<HTMLInputElement | null>(null);

  const { stop: stopAzure, error: azureError } = useTeacherSpeech();
  const [sdkError, setSdkError] = useState<string | null>(null);
  const [sdkLoading, setSdkLoading] = useState<boolean>(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState<boolean>(false);
  const [loaderVisible, setLoaderVisible] = useState<boolean>(true);

  const [boxesVisibility, setBoxesVisibility] = useState<{ message: boolean; conversation: boolean }>(() => ({
    message: isLessonStarted,
    conversation: isLessonStarted
  }));

  // --- useQuery: call service properly and type the result ---
  const {
    data: conversations = [],
    isLoading: isLoadingData,
    isError,
    isFetching: isRefetching
  } = useQuery<Conversation[], Error>({
    queryKey: ['myConversations', authUser?.id],
    queryFn: async () => {
      if (!authUser?.id) return [];
      // <--- GỌI hàm đúng cách. Nếu service cần userId thì truyền, nếu không thì remove arg.
      // Ví dụ: conversationService.getMyConversations(userId)
      // Adjust according to your actual service signature:
      return await conversationService.getMyConversations();
    },
    enabled: !!authUser?.id,
    staleTime: 1000 * 60 * 2
  });

  // --- create conversation mutation: destructure isLoading + mutateAsync ---
  const createConversationMutation = useMutation<Conversation, Error, string>({
    mutationFn: async (name: string) => {
      if (!authUser?.id) throw new Error('User not authenticated');
      // call your service, adjust signature if needed
      return await conversationService.createConversation(name, authUser.id);
    },
    onSuccess: (newConversation) => {
      queryClient.invalidateQueries({ queryKey: ['myConversations', authUser?.id] });
      setNewConversationName('');
      setShowCreateForm(false);
      toast.success(`Conversation "${newConversation?.name ?? 'New'}" created successfully`, { duration: 2000 });
    },
    onError: (error: any) => {
      toast.error(`Failed to create conversation: ${error instanceof Error ? error.message : 'Unknown error'}`, {
        duration: 3000
      });
    }
  });

  // extract mutateAsync from object for convenience
  const { mutateAsync: createConversationAsync } = createConversationMutation;
  // derive a safe isCreatingConversation boolean
  const isCreatingConversation = (createConversationMutation as any).isLoading ?? 'loading';

  const messageBoxRef = useRef<MessageBoxHandle>(null);
  const conversationBoxRef = useRef<ConversationBoxHandle>(null);

  const handleFadeComplete = useCallback(() => {
    setLoaderVisible(false);
  }, []);

  // create handler uses mutateAsync
  const handleCreateConversation = useCallback(async () => {
    const name = newConversationName?.trim();
    if (!name) return;
    try {
      await createConversationAsync(name);
      // onSuccess handles UI updates
    } catch (err) {
      console.error('create conversation failed', err);
    }
  }, [newConversationName, createConversationAsync]);

  const toggleCreateForm = useCallback(() => {
    setShowCreateForm((s) => {
      const next = !s;
      if (!s) setTimeout(() => newConversationInputRef.current?.focus(), 50);
      return next;
    });
  }, []);

  // initial progress effect
  useEffect(() => {
    if (progress === 100 && !active && !initialLoadComplete) {
      setInitialLoadComplete(true);
      const t = setTimeout(() => setInitialLoad(true), 500);
      return () => clearTimeout(t);
    }
  }, [progress, active, initialLoadComplete, setInitialLoad]);

  useEffect(() => {
    const { isAvailable, error } = checkAzureSpeechSDK();
    setSdkLoading(false);
    if (!isAvailable && error) {
      console.warn('Azure Speech SDK check failed:', error);
      setSdkError(error);
    }
  }, []);

  useEffect(() => {
    if (azureError) {
      console.warn('Azure Speech Error:', azureError);
      setSdkError(azureError);
    } else {
      setSdkError(null);
    }
  }, [azureError]);

  useEffect(() => {
    if (isLessonStarted && !isExplanationVisible) {
      setBoxesVisibility({ message: false, conversation: false });
    } else if (isLessonStarted && isExplanationVisible) {
      messageBoxRef.current?.show();
      conversationBoxRef.current?.show();
      setBoxesVisibility({ message: true, conversation: true });
    }
  }, [isLessonStarted, isExplanationVisible]);

  const handleGoBack = useCallback(() => {
    try {
      stopAzure();
    } catch { }
    stopAll();
    window.location.href = '/courses';
  }, [stopAzure, stopAll]);

  const handleMessageBoxVisibilityChange = useCallback((visible: boolean) => {
    setBoxesVisibility((prev) => ({ ...prev, message: visible }));
  }, []);

  const handleConversationBoxVisibilityChange = useCallback((visible: boolean) => {
    setBoxesVisibility((prev) => ({ ...prev, conversation: visible }));
  }, []);

  // ---------------- Chat state (kept as original) ----------------
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('');
  const controllerRef = useRef<{ cancelled: boolean }>({ cancelled: false });
  const fetchAbortRef = useRef<AbortController | null>(null);
  const playRef = useRef<boolean>(false);
  const chatWindowRef = useRef<HTMLDivElement | null>(null);

  const streamingMessageIdRef = useRef<number | string | null>(null);
  const bufferRef = useRef<string>('');
  const flushTimerRef = useRef<number | null>(null);

  function fileToBase64(fileParam: File | null): Promise<string | null> {
    return new Promise((resolve, reject) => {
      if (!fileParam) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string | ArrayBuffer | null;
        if (!dataUrl || typeof dataUrl !== 'string') return resolve(null);
        const base64 = dataUrl.split(',')[1];
        resolve(base64 ?? null);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(fileParam);
    });
  }

  function parseSSEAggregated(aggStr: string): ChunkEvent[] {
    if (!aggStr) return [];
    const rawEvents = aggStr
      .split(/\n\n+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const events: ChunkEvent[] = [];
    for (const ev of rawEvents) {
      const lines = ev
        .split(/\n/)
        .map((l) => l.replace(/^data:\s?/, '').trim())
        .filter(Boolean);
      const joined = lines.join('\n');
      try {
        const obj = JSON.parse(joined);
        events.push(obj);
      } catch {
        events.push({ type: 'raw', raw: joined });
      }
    }
    return events;
  }

  const flushBuffer = useCallback(() => {
    if (!streamingMessageIdRef.current) return;
    setMessages((prev) => prev.map((m) => (m.id === streamingMessageIdRef.current ? { ...m, text: bufferRef.current } : m)));
  }, []);

  const clearFlushTimer = useCallback(() => {
    if (flushTimerRef.current) {
      window.clearInterval(flushTimerRef.current);
      flushTimerRef.current = null;
    }
  }, []);

  async function playChunksSequentially(
    chunkEvents: ChunkEvent[],
    { charDelay = 16, betweenChunksDelay = 80, flushInterval = 120 }: { charDelay?: number; betweenChunksDelay?: number; flushInterval?: number } = {}
  ): Promise<void> {
    controllerRef.current.cancelled = false;
    setIsStreaming(true);
    playRef.current = true;

    const messageId = Date.now() + Math.random();
    streamingMessageIdRef.current = messageId;
    bufferRef.current = '';
    setMessages((prev) => [...prev, { id: messageId, role: 'assistant', text: '', ts: Date.now() }]);

    clearFlushTimer();
    flushTimerRef.current = window.setInterval(() => {
      flushBuffer();
    }, flushInterval);

    try {
      outer: for (const evt of chunkEvents) {
        if (controllerRef.current.cancelled) break;
        if (evt && evt.type === 'chunk' && typeof evt.response === 'string') {
          const text = evt.response;
          for (let i = 0; i < text.length; i++) {
            if (controllerRef.current.cancelled) break outer;
            bufferRef.current += text[i];
            // eslint-disable-next-line no-await-in-loop
            await new Promise((res) => setTimeout(res, charDelay));
          }
          // eslint-disable-next-line no-await-in-loop
          await new Promise((res) => setTimeout(res, betweenChunksDelay));
        } else if (evt && evt.type === 'status') {
          setStatusText(`Agent: ${evt.agent || 'unknown'}`);
        } else if (evt && (evt.type === 'done' || evt.type === 'end')) {
          break;
        } else if (evt && evt.type === 'raw') {
          bufferRef.current += `\n${evt.raw}`;
        }
      }
    } finally {
      flushBuffer();
      clearFlushTimer();
      setIsStreaming(false);
      playRef.current = false;
      streamingMessageIdRef.current = null;
      bufferRef.current = '';
      setStatusText('');
    }
  }

  const handleSend = useCallback(
    async (e?: FormEvent<HTMLFormElement>): Promise<void> => {
      e?.preventDefault();
      if ((!input || !input.trim()) && !file) return;
      controllerRef.current.cancelled = false;
      setStatusText('Sending...');
      setIsStreaming(false);

      if (fetchAbortRef.current) {
        try {
          fetchAbortRef.current.abort();
        } catch { }
      }
      const abortController = new AbortController();
      fetchAbortRef.current = abortController;

      const fileBase64 = await fileToBase64(file);
      const filename = file ? file.name : null;

      const userMessageId = Date.now() + Math.random();
      setMessages((prev) => [...prev, { id: userMessageId, role: 'user', text: input || '', ts: Date.now() }]);
      setInput('');

      const query = `mutation CreateMessage($data: CreateMessage2Input!) {
        createMessage(data: $data) {
          agent
          content
          conversationId
          id
          message
          response
          senderType
          timestamp
          type
        }
      }`;

      const variables = {
        data: {
          conversationId: 'd5e2ef1e-7c3e-4ebf-8949-e6c52c4deef1',
          message: input || null,
          sessionId: sessionId || null,
          fileBase64: fileBase64 || null,
          filename: filename || null
        }
      };

      try {
        const res = await fetch(GRAPHQL_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, variables }),
          signal: abortController.signal
        });

        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(`Network response not ok: ${res.status} ${text}`);
        }
        const json = (await res.json()) as any;
        if (json.errors) {
          console.error('GraphQL errors', json.errors);
          setStatusText('Server error — xem console');
          toast.error('Lỗi server khi gửi tin nhắn.');
          return;
        }

        const payload = json.data?.createMessage;
        if (!payload) {
          setStatusText('No payload returned');
          toast.error('Server trả về dữ liệu không hợp lệ.');
          return;
        }

        if (payload.sessionId) setSessionId(payload.sessionId);

        const agg: string = payload.response || '';
        const events = parseSSEAggregated(agg);
        const chunkEvents = events.filter(
          (ev) => ev && (ev.type === 'chunk' || ev.type === 'status' || ev.type === 'done' || ev.type === 'end' || ev.type === 'raw')
        );

        await playChunksSequentially(chunkEvents as ChunkEvent[], { charDelay: 12, betweenChunksDelay: 60, flushInterval: 80 });
        setStatusText('Hoàn tất');
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          setStatusText('Đã huỷ');
        } else {
          console.error(err);
          setStatusText('Network / unexpected error');
          toast.error(err?.message || 'Lỗi mạng hoặc server');
        }
      } finally {
        fetchAbortRef.current = null;
      }
    },
    [input, file, sessionId]
  );

  const handleStop = useCallback(() => {
    controllerRef.current.cancelled = true;
    setIsStreaming(false);
    setStatusText('Đã dừng');
    if (fetchAbortRef.current) {
      try {
        fetchAbortRef.current.abort();
      } catch { }
    }
    clearFlushTimer();
  }, [clearFlushTimer]);

  const handleClear = useCallback(() => {
    setMessages([]);
    setStatusText('');
    setFile(null);
  }, []);

  useEffect(() => {
    const el = chatWindowRef.current;
    if (!el) return;
    try {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    } catch {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages.length, isStreaming]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  function formatTime(ts?: number) {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const quickPrompts = useMemo(
    () => ['Giải thích khái niệm này ngắn gọn', 'Cho ví dụ thực tế', 'Bài tập nhỏ liên quan', 'Tóm tắt nội dung', 'Giảng cho tôi bài học này ngắn gọn, dễ hiểu nhất'],
    []
  );

  return (
    <div className="bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-8 text-base">
      <div className="max-w-full mx-auto grid grid-cols-12 gap-8">
        {/* LEFT: Chat Card */}
        <div className="col-span-12 lg:col-span-9">
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-2 border-b">
              {/* <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-pink-500 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg">
                  AI
                </div>
                <div>
                  <div className="text-2xl font-semibold">AI Tutor — Lớp Học 1</div>
                  <div className="text-sm text-slate-500 mt-1">Hỏi nhanh, nhận giải thích dễ hiểu</div>
                </div>
              </div> */}

              {/* <div
                style={{ opacity: initialLoad ? 1 : 0, transition: 'opacity 0.5s' }}
              > */}
              <div className="flex items-center gap-5">
                <Tooltip
                  content="Back to Courses"
                  contentClassName="text-[1.25rem] text-black z-[60]"
                  position='right'
                >
                  <Button
                    onClick={handleGoBack}
                    variant="outline"
                    className={cn(
                      'rounded-full bg-black/20 backdrop-blur-[16px] border-white/30 hover:bg-black/30 text-white !p-0 hover:text-white size-12 drop-shadow-lg',
                      isThinking && 'pointer-events-none opacity-70'
                    )}
                  >
                    <Icon icon="lucide:arrow-left" className="!size-[1.5rem] drop-shadow-lg" />
                  </Button>
                </Tooltip>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-sm text-slate-600" aria-live="polite">
                  {isStreaming ? 'Đang trả lời...' : statusText || 'Sẵn sàng'}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-white border flex items-center justify-center text-sm text-slate-600 shadow">GV</div>
                </div>
              </div>
            </div>

            {/* Chat window */}
            <div
              ref={chatWindowRef}
              id="chat-window"
              className="p-8 h-[65vh] lg:h-[70vh] overflow-y-auto space-y-6 bg-gradient-to-b from-white to-slate-50"
              role="log"
              aria-live="polite"
            >
              {messages.length === 0 && (
                <div className="text-center text-slate-400 mt-8">
                  <div className="text-2xl font-medium">Chào mừng! Hãy đặt câu hỏi để bắt đầu bài học.</div>
                  <div className="mt-3 text-base">Bạn có thể tải lên file, hỏi bài tập, hoặc dùng các gợi ý nhanh dưới đây.</div>
                </div>
              )}

              {messages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <div key={String(m.id)} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    {!isUser && (
                      <div className="mr-4 flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-400 to-cyan-400 flex items-center justify-center text-white text-lg font-semibold shadow">T</div>
                      </div>
                    )}

                    <div className="max-w-[85%]">
                      <div
                        className={`px-5 py-3 rounded-3xl break-words whitespace-pre-wrap text-base leading-7 ${isUser ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-br-none' : 'bg-white border shadow-sm rounded-bl-none'}`}
                        style={{ boxShadow: isUser ? '0 10px 30px rgba(59,130,246,0.15)' : undefined }}
                        aria-live={isUser ? undefined : 'polite'}
                      >
                        {m.text}
                      </div>
                      <div className={`mt-2 text-sm ${isUser ? 'text-right text-slate-400' : 'text-slate-500'}`}>{formatTime(m.ts)}</div>
                    </div>

                    {isUser && (
                      <div className="ml-4 flex-shrink-0">
                        <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium shadow-sm text-sm">Bạn</div>
                      </div>
                    )}
                  </div>
                );
              })}

              {isStreaming && (
                <div className="flex items-start gap-4">
                  <div className="mr-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-400 to-cyan-400 flex items-center justify-center text-white font-semibold shadow">T</div>
                  </div>
                  <div className="bg-white border px-5 py-3 rounded-3xl rounded-bl-none shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-base text-slate-600">Đang nghĩ</span>
                      <span className="inline-flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full animate-pulse bg-slate-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full animate-pulse bg-slate-500/60 delay-75" />
                        <span className="w-2.5 h-2.5 rounded-full animate-pulse bg-slate-500/40 delay-150" />
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input area */}
            <form onSubmit={handleSend} className="p-6 border-t bg-white flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <textarea
                  aria-label="Nhập câu hỏi"
                  placeholder="Viết câu hỏi... (Shift+Enter xuống dòng, Enter gửi)"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={3}
                  className="w-[90%] h-[50px] resize-none border rounded-2xl p-2 focus:outline-none focus:ring-4 focus:ring-indigo-200 text-lg"
                />

                <button
                  type="submit"
                  className="bg-indigo-600 text-white mt-5 px-5 py-3 rounded-xl shadow-lg hover:scale-[1.02] transition-transform text-sm disabled:opacity-50"
                  disabled={isStreaming}
                  aria-disabled={isStreaming}
                >
                  Gửi
                </button>

                <button type="button" onClick={handleStop} className="bg-red-500 mt-5 text-white px-5 py-3 rounded-xl text-sm" aria-label="Dừng trả lời">
                  Dừng
                </button>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500">Gợi ý nhanh:</span>
                  <div className="flex gap-2">
                    {quickPrompts.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setInput(q)}
                        className="text-sm bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full border hover:bg-indigo-100"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT: Sidebar */}
        <aside className="col-span-12 lg:col-span-3">
          <div className="sticky top-8 space-y-6">
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-5 shadow border">

              <div className="flex items-center justify-between gap-4">
                <p className="text-base text-slate-700">Tiến độ học:</p>

                {/* progress bar chiếm phần còn lại */}
                <div className="flex-1 ml-4">
                  <div className="bg-slate-100 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-4 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all"
                      style={{ width: "45%" }}
                    > </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold">My Conversations</div>
                </div>
              </div>

              <ul className="mt-3 space-y-3 text-sm">
                {Array.isArray(conversations) && conversations.length > 0 ? (
                  conversations.map((item: Conversation, idx: number) => (
                    <li key={item.id ?? idx} className="flex items-center gap-3">
                      <div className="w-3.5 h-3.5 rounded-full bg-indigo-500" />
                      <div>{item.name ?? item.id}</div>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400">Không có cuộc hội thoại nào</li>
                )}
              </ul>

              {/* CREATE FORM AREA */}
              {showCreateForm ? (
                <div className="flex-1 flex flex-col">
                  <div className="mt-auto mb-4.5">
                    <Input
                      ref={newConversationInputRef}
                      value={newConversationName}
                      onChange={(e: any) => setNewConversationName(e.target.value)}
                      placeholder="Enter conversation name"
                      className={cn(
                        'drop-shadow-lg h-15 !text-[1.25rem] text-white bg-white/10 border-white/20 focus:border-white/40 placeholder:text-white/50 rounded-full px-6',
                        isCreatingConversation && 'pointer-events-none opacity-70'
                      )}
                      onKeyDown={(e: any) => {
                        if (e.key === 'Enter' && !isCreatingConversation) {
                          e.preventDefault();
                          void handleCreateConversation();
                        } else if (e.key === 'Escape' && !isCreatingConversation) {
                          toggleCreateForm();
                        }
                      }}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 h-16 bg-white/10 hover:bg-white/20 rounded-full text-white hover:text-white border-white/20 text-[1.3rem] drop-shadow-lg"
                      onClick={toggleCreateForm}
                      disabled={isCreatingConversation}
                    >
                      Cancel
                    </Button>

                    <Button
                      variant="default"
                      className={cn(
                        'flex-1 h-16 bg-primary/80 hover:bg-primary rounded-full text-white text-[1.3rem] drop-shadow-lg transition-all',
                        (!newConversationName.trim() || isCreatingConversation) && 'opacity-70 cursor-not-allowed'
                      )}
                      onClick={() => void handleCreateConversation()}
                      disabled={!newConversationName.trim() || isCreatingConversation}
                    >
                      {isCreatingConversation ? (
                        <div className="flex items-center justify-center gap-3">
                          <svg viewBox="25 25 50 50" className="size-5">
                            <circle r="20" cy="50" cx="50" className="loading__circle !stroke-white" />
                          </svg>
                          <span>Creating...</span>
                        </div>
                      ) : (
                        'Create'
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto pr-3 conversation__list relative">
                  {isError ? (
                    <div className="flex flex-col items-center justify-center h-full text-white/80">
                      <Icon icon="lucide:alert-circle" className="text-[2rem] mb-2 drop-shadow-lg" />
                      <p className="text-center drop-shadow-lg">Cannot load conversation list</p>
                      <Button
                        onClick={() => window.location.reload()}
                        variant="outline"
                        className="mt-4 bg-white/10 hover:bg-white/20 text-white hover:text-white rounded-full drop-shadow-lg"
                      >
                        Try again
                      </Button>
                    </div>
                  ) : conversations?.length === 0 && !isLoadingData ? (
                    <div className="flex flex-col items-center justify-center h-full text-white/80">
                      <Icon icon="lucide:message-square" className="text-[2rem] mb-2 drop-shadow-lg" />
                      <p className="text-center text-white/80 drop-shadow-lg">No conversations yet.</p>
                      <p className="text-center text-sm mb-3 text-white/80 drop-shadow-lg">Create a new conversation to start chatting!</p>
                      <Button
                        variant="outline"
                        className="bg-black/30 hover:bg-black/20 text-white hover:text-white rounded-full drop-shadow-lg"
                        onClick={toggleCreateForm}
                      >
                        Create new
                      </Button>
                    </div>
                  ) : updateConversationMutation.isLoading || deleteConversationMutation.isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="size-14 drop-shadow-lg">
                          <svg viewBox="25 25 50 50" className="loading__svg">
                            <circle r="20" cy="50" cx="50" className="loading__circle !stroke-white" />
                          </svg>
                        </div>
                        <p className="text-white text-[1.25rem] font-medium drop-shadow-lg">
                          {updateConversationMutation.isLoading ? 'Updating...' : 'Deleting...'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {isLoadingData ? (
                        Array(isRefetching ? conversations?.length || 3 : 3).fill(0).map((_, index) => (
                          <ConversationSkeleton key={`skeleton-${index}`} />
                        ))
                      ) : (
                        (conversations ?? []).map((conversation: Conversation) => (
                          <ConversationItem
                            key={conversation.id}
                            conversation={conversation}
                            isSelected={selectedConversationId === conversation.id}
                            isUpdateLoading={updatingConversationId === conversation.id}
                            isDeleteLoading={deletingConversationId === conversation.id}
                            onClick={handleSelectConversation}
                            onUpdate={handleUpdateConversation}
                            onDelete={handleDeleteConversation}
                          />
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {!showCreateForm && conversations && conversations.length > 0 && (
                <div className="mt-4">
                  <Button
                    variant="default"
                    className={cn('w-full bg-primary/80 hover:bg-primary text-white rounded-full h-16 text-[1.3rem] !p-0 drop-shadow-lg')}
                    onClick={toggleCreateForm}
                  >
                    Create new
                    <Icon icon="lucide:plus" className="!size-[1.4rem]" />
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-5 shadow border">
              <h3 className="text-3xl font-bold text-primary mb-2">References</h3>
              <ul className="flex flex-col gap-4 w-full">
                {youtubeLink.map((link, index) => (
                  <li key={index}>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-2xl font-semibold text-blue-700 dark:text-blue-300 hover:underline hover:text-blue-500 transition-colors">
                      <Icon icon="logos:youtube-icon" className="text-2xl" />
                      {link.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="size-full" style={{ backfaceVisibility: 'hidden', width: '100%', height: '300px' }}>
              <Canvas
                camera={{ position: [0, 1.2, 3], fov: 50 }}
                dpr={[1, 1.5]}
                onCreated={(state) => {
                  state.gl.setClearColor('#000000', 0);
                  state.invalidate();
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

            {/* <MessageBox ref={messageBoxRef} visible={boxesVisibility.message} onVisibilityChange={handleMessageBoxVisibilityChange} />
            <ConversationBox ref={conversationBoxRef} visible={boxesVisibility.conversation} onVisibilityChange={handleConversationBoxVisibilityChange} /> */}
          </div>
        </aside>
      </div>
    </div>
  );
}

