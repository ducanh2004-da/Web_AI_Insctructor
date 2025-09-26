// ClassRoom.tsx
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
import ConversationItem from './../../features/classroom/components/ConversationItem';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

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

import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

// --- small stubs (replace with your real components if present) ---
const Input = React.forwardRef<HTMLInputElement, any>((props, ref) => <input ref={ref} {...props} />);
const ConversationSkeleton = () => <div className="h-12 bg-slate-100 rounded" />;
// Stubs for update/delete states & handlers (replace with your real logic)
const updateConversationMutation: any = { isPending: false };
const deleteConversationMutation: any = { isPending: false };
// --- end stubs ---

const Scene = lazy(() => import('@/features/classroom/components/Scene'));

const GRAPHQL_ENDPOINT = import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:10000/graphql';

type Role = 'user' | 'assistant' | string;

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

interface Message {
  id: number | string;
  role: Role;
  text: string;
  ts?: number;
}

interface Conversation {
  id: string;
  name?: string;
  // other fields...
}

export default function ClassRoomPage() {
  // Zustand selector usage
  const authUser = useAuthStore(state => state.user);

  const { active, progress } = useProgress();
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

  const [boxesVisibility, setBoxesVisibility] = useState<{ message: boolean; conversation: boolean }>(() => ({
    message: isLessonStarted,
    conversation: isLessonStarted
  }));

  const [open, setOpen] = React.useState(false);

  const handleClickOpenQuiz = () => {
    setOpen(true);
  };
  const handleCloseQuiz = () => {
    setOpen(false);
  };

  // --- queries / mutations ---
  const {
    data: conversations = [],
    isLoading: isLoadingData,
    isError,
    isFetching: isRefetching
  } = useQuery<Conversation[], Error>({
    queryKey: ['myConversations', authUser?.id],
    queryFn: conversationService.getMyConversations,
    enabled: !!authUser?.id,
    staleTime: 1000 * 60 * 2
  });

  const createConversationMutation = useMutation<Conversation, Error, string>({
    mutationFn: async (name: string) => {
      if (!authUser?.id) throw new Error('User not authenticated');
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

  const { mutateAsync: createConversationAsync } = createConversationMutation;
  const isCreatingConversation = !!createConversationMutation.isPending;

  // Selected conversation state (local for now)
  let [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [updatingConversationId, setUpdatingConversationId] = useState<string | null>(null);
  const [deletingConversationId, setDeletingConversationId] = useState<string | null>(null);
  selectedConversationId = "d5e2ef1e-7c3e-4ebf-8949-e6c52c4deef1";

  const handleSelectConversation = useCallback((c?: any) => {
    if (!c) return;
    setSelectedConversationId(c.id);
    // show conversation box if needed:
    // conversationBoxRef.current?.show();
  }, []);

  const handleUpdateConversation = async (c?: any) => {
    if (!c) return;
    setUpdatingConversationId(c.id);
    try {
      // add update logic if available
      queryClient.invalidateQueries({ queryKey: ['myConversations', authUser?.id] });
      toast.success('Updated');
    } catch (err) {
      console.error(err);
      toast.error('Update failed');
    } finally {
      setUpdatingConversationId(null);
    }
  };

  const handleDeleteConversation = async (c?: any) => {
    if (!c) return;
    setDeletingConversationId(c.id);
    try {
      // add delete logic if available
      queryClient.invalidateQueries({ queryKey: ['myConversations', authUser?.id] });
      setSelectedConversationId(prev => (prev === c.id ? null : prev));
      toast.success('Deleted');
    } catch (err) {
      console.error(err);
      toast.error('Delete failed');
    } finally {
      setDeletingConversationId(null);
    }
  };

  const messageBoxRef = useRef<MessageBoxHandle>(null);
  const conversationBoxRef = useRef<ConversationBoxHandle>(null);


  const handleCreateConversation = useCallback(async () => {
    const name = newConversationName?.trim();
    if (!name) return;
    try {
      await createConversationAsync(name);
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

  // ---------------- Chat state ----------------
  const [messages, setMessages] = useState<Message[]>([]);

  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('');
  const controllerRef = useRef<{ cancelled: boolean }>({ cancelled: false });
  const fetchAbortRef = useRef<AbortController | null>(null);
  const chatWindowRef = useRef<HTMLDivElement | null>(null);

  // ---------- NEW STREAMING QUEUE / TOKEN PROCESSOR ----------
  const streamingMessageIdRef = useRef<number | string | null>(null);
  const streamingQueueRef = useRef<string[]>([]);
  const isProcessingQueueRef = useRef(false);

  // split text into tokens preserving trailing spaces: "word " tokens
  const tokenize = (text: string) => {
    if (!text) return [];
    return text.match(/\S+\s*/g) || [text];
  };

  const appendTokenToStreamingMessage = useCallback((token: string) => {
    if (!token) return;
    if (!streamingMessageIdRef.current) {
      const streamId = Date.now() + Math.random();
      streamingMessageIdRef.current = streamId;
      setMessages(prev => [...prev, { id: streamId, role: 'assistant', text: token, ts: Date.now() }]);
      return;
    }
    const id = streamingMessageIdRef.current;
    setMessages(prev =>
      prev.map(m => (m.id === id ? { ...m, text: `${m.text ?? ''}${token}` } : m))
    );
  }, []);

  const processStreamingQueue = useCallback(async (opts?: { baseDelay?: number }) => {
    if (isProcessingQueueRef.current) return;
    isProcessingQueueRef.current = true;
    setIsStreaming(true);
    controllerRef.current.cancelled = false;
    try {
      while (streamingQueueRef.current.length > 0 && !controllerRef.current.cancelled) {
        const token = streamingQueueRef.current.shift();
        if (!token) continue;

        appendTokenToStreamingMessage(token);

        const base = opts?.baseDelay ?? 60; // base ms per token
        const computed = Math.min(220, base + Math.max(0, token.trim().length) * 8);

        // wait but react to cancellation
        await new Promise<void>((resolve) => {
          const t = window.setTimeout(() => {
            resolve();
          }, computed);
          const iv = window.setInterval(() => {
            if (controllerRef.current.cancelled) {
              window.clearTimeout(t);
              window.clearInterval(iv);
              resolve();
            }
          }, 30);
        });
      }
    } finally {
      isProcessingQueueRef.current = false;
      setIsStreaming(false);
      streamingMessageIdRef.current = null;
      // clear status text after small delay
      setTimeout(() => setStatusText(''), 200);
    }
  }, [appendTokenToStreamingMessage]);

  const enqueueText = useCallback((text: string) => {
    if (!text) return;
    const toks = tokenize(text);
    if (toks.length === 0) return;
    streamingQueueRef.current.push(...toks);
    void processStreamingQueue({ baseDelay: 60 });
  }, [processStreamingQueue]);


  // ---------- END NEW STREAMING LOGIC ----------

  // previously we used window events; now we still listen and put text into queue
  useEffect(() => {
    const onUser = (e: any) => {
      const { id, text, ts } = e.detail ?? {};
      setMessages(prev => [...prev, { id: id ?? Date.now() + Math.random(), role: 'user', text: text ?? '', ts: ts ?? Date.now() }]);
    };

    const onChunk = (e: any) => {
      const { text } = e.detail ?? {};
      if (text == null) return;
      enqueueText(text);
    };

    const onFinal = (e: any) => {
      const { text } = e.detail ?? {};
      if (text) {
        enqueueText(text);
      }
    };

    const onStatus = (e: any) => {
      const detail = (e as CustomEvent<{ agent?: string }>).detail || {};
      setStatusText(`Agent: ${detail.agent ?? 'unknown'}`);
    };

    window.addEventListener('ai-chat:user_message', onUser as EventListener);
    window.addEventListener('ai-chat:assistant_chunk', onChunk as EventListener);
    window.addEventListener('ai-chat:assistant_message', onFinal as EventListener);
    window.addEventListener('ai-chat:assistant_done', onFinal as EventListener);
    window.addEventListener('ai-chat:assistant_status', onStatus as EventListener);

    return () => {
      window.removeEventListener('ai-chat:user_message', onUser as EventListener);
      window.removeEventListener('ai-chat:assistant_chunk', onChunk as EventListener);
      window.removeEventListener('ai-chat:assistant_message', onFinal as EventListener);
      window.removeEventListener('ai-chat:assistant_done', onFinal as EventListener);
      window.removeEventListener('ai-chat:assistant_status', onStatus as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  const handleStop = useCallback(() => {
    controllerRef.current.cancelled = true;
    setIsStreaming(false);
    setStatusText('Đã dừng');
    // clear pending queue
    streamingQueueRef.current = [];
    if (fetchAbortRef.current) {
      try {
        fetchAbortRef.current.abort();
      } catch { }
    }
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


  function formatTime(ts?: number) {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-8 text-base">
      <div className="max-w-full mx-auto grid grid-cols-12 gap-8">
        {/* LEFT: Chat Card */}
        <div className="col-span-12 lg:col-span-9">
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-2 border-b">
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

              <div className="flex items-center gap-4 w-[20%]">
                <Button onClick={handleClickOpenQuiz} className="w-[60%] text-sm bg-black/50 hover:bg-black/20">Take the quiz</Button>

                <BootstrapDialog
                  onClose={handleCloseQuiz}
                  aria-labelledby="customized-dialog-title"
                  open={open}
                >
                  <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                    Quiz
                  </DialogTitle>
                  <IconButton
                    aria-label="close"
                    onClick={handleCloseQuiz}
                    sx={(theme) => ({
                      position: 'absolute',
                      right: 8,
                      top: 8,
                      color: theme.palette.grey[500],
                    })}
                  >
                    Close
                  </IconButton>
                  <DialogContent dividers>
                    <Typography gutterBottom>
                      <div className="w-150 h-50 px-2 flex flex-col justify-center items-center">
                        <h3 className="title-question text-3xl">Javascript là gì</h3>
                        <ul className='mt-3'>
                          <li className='text-xl'>A. I don't know hichic</li>
                          <li className='text-xl'>B. Why I have to answer</li>
                          <li className='text-xl'>C. Nahhh give me candy</li>
                          <li className='text-xl'>D. Other option</li>
                        </ul>
                      </div>
                    </Typography>
                  </DialogContent>
                  <DialogActions>
                    <Button autoFocus onClick={handleCloseQuiz}>
                      Save changes
                    </Button>
                  </DialogActions>
                </BootstrapDialog>


                <div className="text-sm text-slate-600" aria-live="polite">
                  {isStreaming ? 'Answering...' : statusText || 'Ready'}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-white border flex items-center justify-center text-sm text-slate-600 shadow">Tutor</div>
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
                  <div className="text-2xl font-medium">Welcome! Do you have any question about the course</div>
                  <div className="mt-3 text-base">You can upload file, learn everything in the lesson, ask any question about the leson</div>
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
                        {isUser ? (
                          m.text
                        ) : (
                          <ReactMarkdown
                            children={m.text ?? ''}
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeSanitize]}
                            components={{
                              p: ({ node, ...props }) => <p {...props} className="m-0 whitespace-pre-wrap" />,
                              li: ({ node, ...props }) => <li {...props} />,
                              strong: ({ node, ...props }) => <strong {...props} />,
                              em: ({ node, ...props }) => <em {...props} />
                            }}
                          />
                        )}
                      </div>
                      <div className={`mt-2 text-sm ${isUser ? 'text-right text-slate-400' : 'text-slate-500'}`}>{formatTime(m.ts)}</div>
                    </div>

                    {isUser && (
                      <div className="ml-4 flex-shrink-0">
                        <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium shadow-sm text-sm">You</div>
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
                      <span className="text-base text-slate-600">Thinking...</span>
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
            <div className="mt-50">
              <MessageBox
                ref={messageBoxRef}
                visible={boxesVisibility.message}
                onVisibilityChange={handleMessageBoxVisibilityChange}
                // pass selected conversation id to MessageBox (if MessageBox supports it)
                selectedConversationId={selectedConversationId}
              />
              <Button onClick={handleStop}>Stop</Button>
            </div>
          </div>
        </div>

        {/* RIGHT: Sidebar */}
        <aside className="col-span-12 lg:col-span-3">
          <div className="sticky top-8 space-y-6">
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-5 shadow border">

              <div className="flex items-center justify-between gap-4">
                <p className="text-base text-slate-700">Learning Progress:</p>

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

              {/* CONVERSATION */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold">My Conversations</div>
                </div>
              </div>

              <ul className="mt-3 space-y-3 text-sm overflow-y-auto max-h-25">
                {Array.isArray(conversations) && conversations.length > 0 ? (
                  conversations.map((item: any, idx: number) => (
                    <ConversationItem
                      key={item.id}
                      conversation={item}
                      isSelected={selectedConversationId === item.id}
                      isUpdateLoading={updatingConversationId === item.id}
                      isDeleteLoading={deletingConversationId === item.id}
                      onClick={handleSelectConversation}
                      onUpdate={handleUpdateConversation}
                      onDelete={handleDeleteConversation}
                    />
                  ))
                ) : (
                  <li className="text-slate-400">No conversation</li>
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
                      className="flex-1 h-16 bg-yellow hover:bg-yellow/20 rounded-full text-white hover:text-white text-[1.3rem] drop-shadow-lg"
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
                        className="mt-4 bg-black/10 hover:bg-black/20 text-white hover:text-white rounded-full drop-shadow-lg"
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
                        className="bg-black/50 hover:bg-black/20 text-white hover:text-white rounded-full drop-shadow-lg"
                        onClick={toggleCreateForm}
                      >
                        Create new
                      </Button>
                    </div>
                  ) : updateConversationMutation.isPending || deleteConversationMutation.isPending ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="size-14 drop-shadow-lg">
                          <svg viewBox="25 25 50 50" className="loading__svg">
                            <circle r="20" cy="50" cx="50" className="loading__circle !stroke-white" />
                          </svg>
                        </div>
                        <p className="text-white text-[1.25rem] font-medium drop-shadow-lg">
                          {updateConversationMutation.isPending ? 'Updating...' : 'Deleting...'}
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
                        <></>
                      )}
                    </div>
                  )}
                </div>
              )}

              {!showCreateForm && conversations && conversations.length > 0 && (
                <div className="mt-4">
                  <Button
                    variant="default"
                    className={cn('w-full bg-black/50 hover:bg-black/20 text-white rounded-full h-16 text-[1.3rem] !p-0 drop-shadow-lg')}
                    onClick={toggleCreateForm}
                  >
                    Create new
                    <Icon icon="lucide:plus" className="!size-[1.4rem]" />
                  </Button>
                </div>
              )}
            </div>

            {/* REFERENCES */}
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

            {/* SCENE 3D */}
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
            <ConversationBox ref={conversationBoxRef} visible={boxesVisibility.conversation} onVisibilityChange={handleConversationBoxVisibilityChange} />
          </div>
        </aside>
      </div>
    </div>
  );
}
