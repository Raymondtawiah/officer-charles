import { Head } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowUp,
    BadgeCheck,
    GraduationCap,
    HelpCircle,
    Keyboard,
    Loader2,
    MessageSquareText,
    Mic,
    Moon,
    PhoneOff,
    Radio,
    RefreshCw,
    RotateCcw,
    Sun,
    User,
} from 'lucide-react';
import type { FormEvent, KeyboardEvent} from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type MessageRole = 'user' | 'assistant';
type InterviewMode = 'training' | 'interview';
type VisaType = 'f1' | 'b1_b2';
type ExperienceMode = 'chat' | 'live';
type ThemeMode = 'dark' | 'light';
type LiveSessionKey = `${InterviewMode}:${VisaType}`;

interface ServerMessage {
    id: number;
    role: MessageRole;
    content: string;
    created_at: string;
    mode?: InterviewMode | null;
    visa_type?: VisaType | null;
}

interface ChatMessage extends ServerMessage {
    localId?: string;
    status?: 'pending' | 'failed';
}

interface StoreMessageResponse {
    user: ServerMessage;
    assistant: ServerMessage;
    session_completed?: boolean;
    session_reset?: boolean;
    session_state?: InterviewSessionState | null;
}

interface MessagesResponse {
    messages: ServerMessage[];
    session_state?: InterviewSessionState | null;
}

interface InterviewSessionState {
    experience: ExperienceMode;
    phase: 'mode_selection' | 'visa_selection' | 'training' | 'interview' | 'evaluation' | 'completed';
    selected_mode: InterviewMode | null;
    selected_visa_type: VisaType | null;
    interview_status: string;
    current_question: string | null;
    current_question_index: number;
    total_questions: number;
    answered_questions: string[];
    last_answer_quality: string | null;
    evaluation_ready: boolean;
    completed: boolean;
}

const emptyLiveMessages: ChatMessage[] = [];
const DEFAULT_MODE: InterviewMode = 'training';
const DEFAULT_VISA_TYPE: VisaType = 'f1';
const defaultChatSessionState: InterviewSessionState = {
    experience: 'chat',
    phase: 'mode_selection',
    selected_mode: null,
    selected_visa_type: null,
    interview_status: 'setup',
    current_question: null,
    current_question_index: 0,
    total_questions: 0,
    answered_questions: [],
    last_answer_quality: null,
    evaluation_ready: false,
    completed: false,
};
const defaultLiveSessionState: InterviewSessionState = {
    ...defaultChatSessionState,
    experience: 'live',
};

export interface Props {
    messages: ServerMessage[];
}

const experienceContent = {
    chat: {
        label: 'Chat Interview',
        shortLabel: 'Chat',
        status: 'Text interview',
    },
    live: {
        label: 'Live Interview',
        shortLabel: 'Live',
        status: 'Voice interview',
    },
} satisfies Record<ExperienceMode, Record<string, string>>;

const starterPrompts = [
    'Start my visa interview practice.',
    'Begin a guided interview.',
    'Help me practice with Officer Charles.',
];

function formatTime(value: string) {
    return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function isFinalReport(content: string) {
    return content.includes('FINAL REPORT') || content.includes('Performance Report');
}

function textPreview(content?: string) {
    if (!content) {
        return 'No officer response yet.';
    }

    return content.replace(/\s+/g, ' ').trim().slice(0, 140);
}

function formatPhase(value?: InterviewSessionState['phase']) {
    const labels: Record<InterviewSessionState['phase'], string> = {
        mode_selection: 'Choosing practice mode',
        visa_selection: 'Choosing visa type',
        training: 'Training session',
        interview: 'Interview questions',
        evaluation: 'Evaluation',
        completed: 'Completed',
    };

    return value ? labels[value] : 'Waiting to begin';
}

function formatSelectedMode(value?: InterviewMode | null) {
    if (value === 'training') {
        return 'Training Session';
    }

    if (value === 'interview') {
        return 'Real Interview Simulation';
    }

    return 'Not selected yet';
}

function formatVisaType(value?: VisaType | null) {
    if (value === 'f1') {
        return 'F-1 Student Visa';
    }

    if (value === 'b1_b2') {
        return 'B1/B2 Visitor Visa';
    }

    return 'Not selected yet';
}

function getInitialTheme(): ThemeMode {
    if (typeof window === 'undefined') {
        return 'dark';
    }

    return window.localStorage.getItem('officer-charles-theme') === 'light' ? 'light' : 'dark';
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';

    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }

    return window.btoa(binary);
}

function base64ToInt16Array(value: string) {
    const binary = window.atob(value);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
    }

    return new Int16Array(bytes.buffer);
}

function isBase64Audio(value: string) {
    return /^[A-Za-z0-9+/]+={0,2}$/.test(value) && value.length % 4 === 0;
}

function downsampleBuffer(buffer: Float32Array, inputSampleRate: number, outputSampleRate: number) {
    if (outputSampleRate === inputSampleRate) {
        return buffer;
    }

    const ratio = inputSampleRate / outputSampleRate;
    const newLength = Math.round(buffer.length / ratio);
    const result = new Float32Array(newLength);

    for (let offset = 0; offset < result.length; offset += 1) {
        const start = Math.floor(offset * ratio);
        const end = Math.min(Math.floor((offset + 1) * ratio), buffer.length);
        let sum = 0;

        for (let index = start; index < end; index += 1) {
            sum += buffer[index];
        }

        result[offset] = sum / Math.max(end - start, 1);
    }

    return result;
}

function floatToPcm16Base64(input: Float32Array, inputSampleRate: number, outputSampleRate = 24000) {
    const samples = downsampleBuffer(input, inputSampleRate, outputSampleRate);
    const pcm = new Int16Array(samples.length);

    for (let index = 0; index < samples.length; index += 1) {
        const sample = Math.max(-1, Math.min(1, samples[index]));
        pcm[index] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    }

    return arrayBufferToBase64(pcm.buffer);
}

export function ChatExperience({ messages }: Props) {
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>(messages);
    const [experienceMode, setExperienceMode] = useState<ExperienceMode>('chat');
    const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
    const [draft, setDraft] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(messages.length === 0);
    const [syncingMessages, setSyncingMessages] = useState(false);
    const [restartingSession, setRestartingSession] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [completedSessionMode, setCompletedSessionMode] = useState<InterviewMode | null>(null);
    const [liveMessagesBySession, setLiveMessagesBySession] = useState<Partial<Record<LiveSessionKey, ChatMessage[]>>>({});
    const [liveConnecting, setLiveConnecting] = useState(false);
    const [liveConnected, setLiveConnected] = useState(false);
    const [liveRecording, setLiveRecording] = useState(false);
    const [liveSpeaking, setLiveSpeaking] = useState(false);
    const [liveError, setLiveError] = useState<string | null>(null);
    const [chatSessionState, setChatSessionState] = useState<InterviewSessionState | null>(null);
    const [liveSessionState, setLiveSessionState] = useState<InterviewSessionState | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const liveMessagesEndRef = useRef<HTMLDivElement>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioStreamRef = useRef<MediaStream | null>(null);
    const audioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const audioProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const liveRecordingRef = useRef(false);
    const liveAssistantIdRef = useRef<number | null>(null);
    const nextAudioStartRef = useRef(0);
    const liveAudioPlayingRef = useRef(0);

    const mode = DEFAULT_MODE;
    const visaType = DEFAULT_VISA_TYPE;
    const activeSessionMessages = useMemo(
        () => chatMessages.filter((message) => message.mode === mode && (message.visa_type ?? 'f1') === visaType),
        [chatMessages, mode, visaType],
    );
    const activeExperience = experienceContent[experienceMode];
    const liveSessionKey = `${mode}:${visaType}` as LiveSessionKey;
    const activeLiveMessages = liveMessagesBySession[liveSessionKey] ?? emptyLiveMessages;
    const activeSessionState = experienceMode === 'live' ? liveSessionState : chatSessionState;
    const activeSidebarMessages = experienceMode === 'live' ? activeLiveMessages : activeSessionMessages;
    const activeSidebarUserCount = activeSidebarMessages.filter((message) => message.role === 'user').length;
    const activeSidebarAssistant = activeSidebarMessages.filter((message) => message.role === 'assistant' && message.status !== 'pending').at(-1);

    const loadMessages = useCallback(async (silent = false) => {
        if (silent) {
            setSyncingMessages(true);
        } else {
            setLoadingMessages(true);
        }

        try {
            const response = await fetch('/api/ai/messages', {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Could not load chat messages from the backend API.');
            }

            const payload = (await response.json()) as ServerMessage[] | MessagesResponse;
            const nextMessages = Array.isArray(payload) ? payload : payload.messages;

            setChatMessages(nextMessages);
            setChatSessionState(Array.isArray(payload) ? null : (payload.session_state ?? null));
            setCompletedSessionMode(null);
            setError(null);
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Could not connect to the backend API.');
        } finally {
            setLoadingMessages(false);
            setSyncingMessages(false);
        }
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void loadMessages(messages.length > 0);
        }, 0);

        return () => window.clearTimeout(timer);
    }, [loadMessages, messages.length]);

    useEffect(() => {
        window.localStorage.setItem('officer-charles-theme', theme);
        document.documentElement.dataset.ocTheme = theme;
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [chatMessages, submitting]);

    useEffect(() => {
        liveMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [activeLiveMessages]);

    useEffect(() => {
        liveRecordingRef.current = liveRecording;
    }, [liveRecording]);

    useEffect(() => {
        if (!textareaRef.current) {
return;
}

        textareaRef.current.style.height = '0px';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 156)}px`;
    }, [draft]);

    const submitMessage = async (messageContent: string) => {
        const content = messageContent.trim();

        if (!content || submitting) {
return;
}

        const optimisticId = `optimistic-${Date.now()}`;
        const createdAt = new Date().toISOString();

        const optimisticMessage: ChatMessage = {
            id: Date.now() * -1,
            localId: optimisticId,
            role: 'user',
            content,
            created_at: createdAt,
            mode,
            visa_type: visaType,
            status: 'pending',
        };

        setError(null);
        setDraft('');
        setSubmitting(true);
        setCompletedSessionMode(null);
        setChatMessages((currentMessages) => [
            ...(completedSessionMode === mode
                ? currentMessages.filter((message) => message.mode !== mode || (message.visa_type ?? 'f1') !== visaType)
                : currentMessages),
            optimisticMessage,
        ]);

        try {
            const response = await fetch('/api/ai/messages', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content, mode, visa_type: visaType }),
            });

            const payload = await response.json().catch(() => null);

            if (!response.ok) {
                const contentError = payload?.errors?.content?.[0];

                throw new Error(contentError || 'Officer Charles could not process that message. Please try again.');
            }

            const data = payload as StoreMessageResponse;
            const shouldClearActiveSession = data.session_completed || data.session_reset || completedSessionMode === mode;

            setChatMessages((currentMessages) => [
                ...(shouldClearActiveSession
                    ? currentMessages.filter((message) => message.mode !== mode || (message.visa_type ?? 'f1') !== visaType)
                    : currentMessages.filter((message) => message.localId !== optimisticId)),
                data.user,
                data.assistant,
            ]);
            setChatSessionState(data.session_state ?? null);
            setCompletedSessionMode(data.session_completed ? mode : null);
        } catch (requestError) {
            setDraft(content);
            setError(requestError instanceof Error ? requestError.message : 'Something went wrong. Please try again.');
            setChatMessages((currentMessages) =>
                currentMessages.map((message) =>
                    message.localId === optimisticId ? { ...message, status: 'failed' } : message,
                ),
            );
        } finally {
            setSubmitting(false);
            textareaRef.current?.focus();
        }
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        void submitMessage(draft);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            void submitMessage(draft);
        }
    };

    const restartInterview = async () => {
        if (submitting || restartingSession) {
            return;
        }

        setRestartingSession(true);
        setError(null);

        try {
            const response = await fetch('/api/ai/restart', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ mode, visa_type: visaType }),
            });

            if (!response.ok) {
                throw new Error('Could not restart this interview session. Please try again.');
            }

            setChatMessages((currentMessages) => currentMessages.filter((message) => message.mode !== mode || (message.visa_type ?? 'f1') !== visaType));
            setChatSessionState(defaultChatSessionState);
            setCompletedSessionMode(null);
            setDraft('');
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Could not restart this interview session.');
        } finally {
            setRestartingSession(false);
            textareaRef.current?.focus();
        }
    };

    const restartLiveInterview = () => {
        if (liveConnecting) {
            return;
        }

        stopLiveInterview();
        setLiveError(null);
        setLiveSessionState(defaultLiveSessionState);
        setLiveMessagesBySession((currentSessions) => ({
            ...currentSessions,
            [liveSessionKey]: [],
        }));
    };

    const restartActiveInterview = async () => {
        if (experienceMode === 'live') {
            restartLiveInterview();

            return;
        }

        await restartInterview();
    };

    const appendLiveAssistantDelta = useCallback((delta: string) => {
        if (!delta) {
return;
}

        setLiveMessagesBySession((currentSessions) => {
            const currentMessages = currentSessions[liveSessionKey] ?? [];
            const activeAssistantId = liveAssistantIdRef.current;

            if (activeAssistantId) {
                return {
                    ...currentSessions,
                    [liveSessionKey]: currentMessages.map((message) =>
                        message.id === activeAssistantId ? { ...message, content: `${message.content}${delta}` } : message,
                    ),
                };
            }

            const id = Date.now() * -1;
            liveAssistantIdRef.current = id;

            return {
                ...currentSessions,
                [liveSessionKey]: [
                    ...currentMessages,
                    {
                        id,
                        role: 'assistant',
                        content: delta,
                        created_at: new Date().toISOString(),
                        mode,
                        visa_type: visaType,
                    },
                ],
            };
        });
    }, [liveSessionKey, mode, visaType]);

    const finalizeLiveAssistant = useCallback(() => {
        liveAssistantIdRef.current = null;
    }, []);

    const addLiveUserMessage = useCallback((content: string) => {
        if (!content.trim()) {
return;
}

        setLiveMessagesBySession((currentSessions) => ({
            ...currentSessions,
            [liveSessionKey]: [
                ...(currentSessions[liveSessionKey] ?? []),
                {
                    id: Date.now() * -1,
                    role: 'user',
                    content,
                    created_at: new Date().toISOString(),
                    mode,
                    visa_type: visaType,
                },
            ],
        }));
    }, [liveSessionKey, mode, visaType]);

    const playLiveAudio = useCallback((audioBase64: string) => {
        const audioContext = audioContextRef.current;

        if (!audioContext) {
return;
}

        const pcm = base64ToInt16Array(audioBase64);
        const buffer = audioContext.createBuffer(1, pcm.length, 24000);
        const channel = buffer.getChannelData(0);

        for (let index = 0; index < pcm.length; index += 1) {
            channel[index] = pcm[index] / 32768;
        }

        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);

        const startAt = Math.max(audioContext.currentTime, nextAudioStartRef.current);
        liveAudioPlayingRef.current += 1;
        setLiveSpeaking(true);
        source.onended = () => {
            liveAudioPlayingRef.current = Math.max(0, liveAudioPlayingRef.current - 1);

            if (liveAudioPlayingRef.current === 0) {
                setLiveSpeaking(false);
            }
        };
        source.start(startAt);
        nextAudioStartRef.current = startAt + buffer.duration;
    }, []);

    const stopLiveInterview = useCallback(() => {
        wsRef.current?.close();
        wsRef.current = null;

        audioProcessorRef.current?.disconnect();
        audioSourceRef.current?.disconnect();
        audioStreamRef.current?.getTracks().forEach((track) => track.stop());

        audioProcessorRef.current = null;
        audioSourceRef.current = null;
        audioStreamRef.current = null;
        setLiveConnected(false);
        setLiveConnecting(false);
        setLiveRecording(false);
        setLiveSpeaking(false);
        liveRecordingRef.current = false;
        liveAudioPlayingRef.current = 0;
        liveAssistantIdRef.current = null;
    }, []);

    const handleLiveMessage = useCallback((event: MessageEvent<string>) => {
        const data = event.data;

        try {
            const payload = JSON.parse(data);

            if (payload.type === 'ready') {
                setLiveConnected(true);
                setLiveConnecting(false);
                setLiveError(null);

                return;
            }

            if (payload.type === 'session.state') {
                setLiveSessionState(payload.state ?? null);

                return;
            }

            if (payload.type === 'transcription') {
                addLiveUserMessage(payload.message ?? '');

                return;
            }

            if (payload.type === 'text.delta') {
                appendLiveAssistantDelta(payload.delta ?? payload.message ?? '');

                return;
            }

            if (payload.type === 'text.completed') {
                finalizeLiveAssistant();

                return;
            }

            if (payload.type === 'error') {
                setLiveError(payload.message ?? 'Live interview error.');

                return;
            }
        } catch {
            if (isBase64Audio(data)) {
                playLiveAudio(data);
            }
        }
    }, [addLiveUserMessage, appendLiveAssistantDelta, finalizeLiveAssistant, playLiveAudio]);

    const startAudioCapture = useCallback(async (socket: WebSocket) => {
        const audioContext = new AudioContext({ sampleRate: 24000 });
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                channelCount: 1,
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
            },
        });
        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);

        processor.onaudioprocess = (event) => {
            const output = event.outputBuffer.getChannelData(0);
            output.fill(0);

            if (!liveRecordingRef.current || socket.readyState !== WebSocket.OPEN) {
                return;
            }

            const input = event.inputBuffer.getChannelData(0);
            socket.send(JSON.stringify({ _bin: floatToPcm16Base64(input, audioContext.sampleRate, 24000) }));
        };

        source.connect(processor);
        processor.connect(audioContext.destination);

        audioContextRef.current = audioContext;
        audioStreamRef.current = stream;
        audioSourceRef.current = source;
        audioProcessorRef.current = processor;
        nextAudioStartRef.current = audioContext.currentTime;
    }, []);

    const startLiveInterview = async () => {
        if (liveConnecting || liveConnected) {
return;
}

        setExperienceMode('live');
        setLiveConnecting(true);
        setLiveError(null);
        setLiveMessagesBySession((currentSessions) => ({
            ...currentSessions,
            [liveSessionKey]: [],
        }));
        liveAssistantIdRef.current = null;

        try {
            const response = await fetch('/api/ai/live-session', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ mode, visa_type: visaType }),
            });

            const payload = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(payload?.message ?? 'Could not start live interview.');
            }

            const socket = new WebSocket(payload.ws_url);
            setLiveSessionState(payload.session_state ?? defaultLiveSessionState);
            wsRef.current = socket;
            socket.onmessage = handleLiveMessage;
            socket.onerror = () => setLiveError('Live interview websocket error.');
            socket.onclose = () => {
                setLiveConnected(false);
                setLiveRecording(false);
                liveRecordingRef.current = false;
            };

            await startAudioCapture(socket);
        } catch (requestError) {
            setLiveError(requestError instanceof Error ? requestError.message : 'Could not start live interview.');
            stopLiveInterview();
        } finally {
            setLiveConnecting(false);
        }
    };

    const toggleLiveRecording = () => {
        if (!liveConnected || !wsRef.current) {
return;
}

        if (liveRecording) {
            setLiveRecording(false);
            liveRecordingRef.current = false;
            wsRef.current.send(JSON.stringify({ type: 'command', command: 'commit' }));

            return;
        }

        setLiveRecording(true);
        liveRecordingRef.current = true;
    };

    const selectExperienceMode = (nextExperienceMode: ExperienceMode) => {
        if (nextExperienceMode === experienceMode) {
            return;
        }

        if (experienceMode === 'live') {
            stopLiveInterview();
            setLiveError(null);
        }

        setExperienceMode(nextExperienceMode);
    };

    useEffect(() => () => stopLiveInterview(), [stopLiveInterview]);

    return (
        <main data-oc-theme={theme} className="oc-page h-dvh overflow-hidden font-sans">
            <div className="oc-shell flex h-full min-h-0 flex-col">
                <header className="oc-header sticky top-0 z-30 px-4 py-4 sm:px-6">
                    <div className="oc-header-inner mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="oc-brand-row flex min-w-0 items-center gap-3">
                            <div className="oc-brand-mark">
                                <GraduationCap className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="oc-heading truncate text-base font-semibold sm:text-lg">Officer Charles</h1>
                                    <Badge className="oc-premium-badge" variant="outline">
                                        AI simulator
                                    </Badge>
                                </div>
                                <p className="oc-subtle truncate text-xs sm:text-sm">Visa interview practice workspace</p>
                            </div>
                        </div>

                        <div className="oc-header-actions flex flex-wrap items-center gap-2">
                            <div className="oc-status-pill">
                                <span className={cn('h-2 w-2 rounded-full', syncingMessages ? 'animate-pulse bg-amber-400' : 'bg-emerald-400')} />
                                {syncingMessages ? 'Syncing API' : activeExperience.status}
                            </div>

                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => void loadMessages(false)}
                                disabled={loadingMessages || syncingMessages || submitting || restartingSession}
                                className="oc-icon-button"
                                aria-label="Refresh chat messages"
                            >
                                <RefreshCw className={cn('h-4 w-4', (loadingMessages || syncingMessages) && 'animate-spin')} />
                            </Button>

                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => void restartActiveInterview()}
                                disabled={loadingMessages || syncingMessages || submitting || restartingSession || liveConnecting}
                                className="oc-icon-button"
                                aria-label={`Restart ${activeExperience.shortLabel.toLowerCase()} interview`}
                            >
                                <RotateCcw className={cn('h-4 w-4', (restartingSession || liveConnecting) && 'animate-spin')} />
                            </Button>

                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))}
                                className="oc-icon-button"
                                aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                            >
                                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            </Button>

                            <div className="oc-mode-control">
                                {(['chat', 'live'] as ExperienceMode[]).map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => selectExperienceMode(option)}
                                        className={cn('oc-mode-button', experienceMode === option && 'is-active is-training')}
                                    >
                                        {option === 'chat' ? <Keyboard className="h-4 w-4" /> : <Radio className="h-4 w-4" />}
                                        <span className="hidden sm:inline">{experienceContent[option].label}</span>
                                        <span className="sm:hidden">{experienceContent[option].shortLabel}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="oc-dashboard-grid mx-auto grid min-h-0 w-full max-w-7xl flex-1 grid-cols-1 gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:py-7">
                    <section className="oc-chat-panel flex min-w-0 flex-col overflow-hidden">
                        <div className="oc-chat-scroll flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
                            <div className="mx-auto flex max-w-3xl flex-col gap-5">
                                <div className="oc-mobile-sidebar lg:hidden">
                                    <MobileSummary
                                        experience={activeExperience}
                                        sessionState={activeSessionState}
                                        userCount={activeSidebarUserCount}
                                    />
                                </div>

                                {experienceMode === 'chat' ? (
                                    <>
                                        {loadingMessages ? (
                                            <LoadingState />
                                        ) : activeSessionMessages.length === 0 ? (
                                            <EmptyState onSelectPrompt={setDraft} />
                                        ) : (
                                            activeSessionMessages.map((message) => <MessageBubble key={message.localId ?? message.id} message={message} />)
                                        )}

                                        {submitting && <ThinkingBubble />}
                                        <div ref={messagesEndRef} />
                                    </>
                                ) : (
                                    <>
                                        <LiveInterviewStage
                                            connected={liveConnected}
                                            connecting={liveConnecting}
                                            error={liveError}
                                            recording={liveRecording}
                                            speaking={liveSpeaking}
                                        />
                                        {activeLiveMessages.map((message) => <MessageBubble key={message.localId ?? message.id} message={message} />)}
                                        <div ref={liveMessagesEndRef} />
                                    </>
                                )}
                            </div>
                        </div>

                        {experienceMode === 'chat' && (
                            <footer className="oc-composer-wrap px-4 py-4 sm:px-6">
                                <div className="mx-auto max-w-3xl">
                                    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="oc-helper-pill">
                                            <HelpCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                            <span>Officer Charles will handle setup inside the conversation.</span>
                                        </div>
                                        <Badge className="oc-mode-badge" variant="outline">
                                            Assistant-led setup
                                        </Badge>
                                    </div>

                                    {error && (
                                        <div className="oc-error-banner">
                                            <RefreshCw className="h-4 w-4 shrink-0" />
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="oc-composer">
                                        <textarea
                                            ref={textareaRef}
                                            value={draft}
                                            onChange={(event) => setDraft(event.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Reply to Officer Charles..."
                                            rows={1}
                                            disabled={submitting}
                                            className="oc-textarea"
                                        />
                                        <Button
                                            type="submit"
                                            size="icon"
                                            disabled={submitting || !draft.trim()}
                                            className="oc-send-button"
                                        >
                                            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
                                        </Button>
                                    </form>
                                </div>
                            </footer>
                        )}

                        {experienceMode === 'live' && (
                            <LiveMicControls
                                connected={liveConnected}
                                connecting={liveConnecting}
                                onEnd={stopLiveInterview}
                                onStart={startLiveInterview}
                                onToggleRecording={toggleLiveRecording}
                                recording={liveRecording}
                            />
                        )}
                    </section>

                    <aside className="oc-sidebar-shell hidden min-w-0 lg:block">
                        <div className="oc-sidebar-stack">
                            <SidebarCards
                                latestAssistant={activeSidebarAssistant}
                                onRestart={() => void restartActiveInterview()}
                                restartingSession={restartingSession || liveConnecting}
                                experience={activeExperience}
                                sessionState={activeSessionState}
                                userCount={activeSidebarUserCount}
                            />
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}

export default function VisaAi({ messages }: Props) {
    return (
        <>
            <Head title="Officer Charles - Visa Interview Prep" />
            <ChatExperience messages={messages} />
        </>
    );
}

function SidebarCards({
    latestAssistant,
    onRestart,
    restartingSession,
    experience,
    sessionState,
    userCount,
}: {
    experience: (typeof experienceContent)[ExperienceMode];
    latestAssistant?: ChatMessage;
    onRestart: () => void;
    restartingSession: boolean;
    sessionState: InterviewSessionState | null;
    userCount: number;
}) {
    const answeredCount = sessionState?.answered_questions.length ?? 0;
    const totalQuestions = sessionState?.total_questions ?? 0;
    const progress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : null;
    const checklistItems = [
        ...(sessionState?.answered_questions ?? []).map((question) => ({
            key: `answered-${question}`,
            label: question,
            status: 'Answered',
            active: false,
        })),
        ...(sessionState?.current_question
            ? [{
                key: `current-${sessionState.current_question}`,
                label: sessionState.current_question,
                status: 'Current question',
                active: true,
            }]
            : []),
    ].slice(-5);

    return (
        <>
            <section className="oc-sidebar-card oc-session-card oc-scroll-card">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="oc-kicker">Actual Session</p>
                        <h2 className="oc-card-title">{experience.label}</h2>
                    </div>
                    <div className="oc-card-icon">
                        {experience.shortLabel === 'Chat' ? <Keyboard className="h-5 w-5" /> : <Radio className="h-5 w-5" />}
                    </div>
                </div>
                <p className="oc-card-copy">This card shows only confirmed state from the assistant session.</p>
                <div className="oc-session-stats mt-4 grid grid-cols-2 gap-2">
                    <div>
                        <span>{formatSelectedMode(sessionState?.selected_mode)}</span>
                        <p>Practice mode</p>
                    </div>
                    <div>
                        <span>{formatVisaType(sessionState?.selected_visa_type)}</span>
                        <p>Visa type</p>
                    </div>
                </div>
                <div className="oc-latest-response mt-3">
                    <p className="oc-kicker">Status</p>
                    <p>{formatPhase(sessionState?.phase)}</p>
                </div>
                <div className="oc-latest-response mt-3">
                    <p className="oc-kicker">Latest Officer Response</p>
                    <p>{textPreview(latestAssistant?.content)}</p>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                    <Badge className="oc-mode-badge" variant="outline">
                        {experience.shortLabel}
                    </Badge>
                    <span className="oc-subtle text-xs">{userCount} user answers</span>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onRestart}
                    disabled={restartingSession}
                    className="oc-restart-button mt-4 w-full"
                >
                    <RotateCcw className={cn('h-4 w-4', restartingSession && 'animate-spin')} />
                    Restart interview
                </Button>
            </section>

            <section className="oc-sidebar-card oc-scroll-card">
                <div className="mb-4 flex items-center gap-3">
                    <div className="oc-card-icon">
                        <MessageSquareText className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="oc-kicker">Real Progress</p>
                        <h3 className="oc-card-title">{progress === null ? 'Not started yet' : `${progress}% complete`}</h3>
                    </div>
                </div>
                {progress === null ? (
                    <p className="oc-card-copy mt-3">Progress begins after Officer Charles starts the interview questions.</p>
                ) : (
                    <>
                        <div className="mb-3 mt-4 flex items-center justify-between gap-3">
                            <span className="oc-subtle text-xs">{answeredCount} of {totalQuestions} answered</span>
                            <span className="oc-progress-value">{progress}%</span>
                        </div>
                        <div className="oc-progress-track">
                            <div className="oc-progress-bar" style={{ width: `${progress}%` }} />
                        </div>
                    </>
                )}
            </section>

            <section className="oc-sidebar-card oc-readiness-card oc-scroll-card">
                <div className="mb-4 flex items-center gap-3">
                    <div className="oc-card-icon">
                        <BadgeCheck className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="oc-kicker">Answers Checklist</p>
                        <h3 className="oc-card-title">Real answered questions</h3>
                    </div>
                </div>
                {checklistItems.length > 0 ? (
                    <div className="oc-readiness-list flex flex-col gap-2">
                        {checklistItems.map((item) => (
                            <div key={item.key} className={cn('oc-check-item', item.active && 'is-active')}>
                                <BadgeCheck className={cn('mt-0.5 h-4 w-4 shrink-0', item.active ? 'text-[var(--oc-accent)]' : 'text-emerald-400')} />
                                <div>
                                    <p className="font-semibold text-[var(--oc-text)]">{item.status}</p>
                                    <p>{item.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="oc-card-copy">No interview answers yet. This checklist appears only after the assistant has real question state.</p>
                )}
            </section>
        </>
    );
}

function MobileSummary({
    experience,
    sessionState,
    userCount,
}: {
    experience: (typeof experienceContent)[ExperienceMode];
    sessionState: InterviewSessionState | null;
    userCount: number;
}) {
    const answeredCount = sessionState?.answered_questions.length ?? 0;
    const totalQuestions = sessionState?.total_questions ?? 0;
    const progress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : null;

    return (
        <section className="oc-mobile-summary">
            <div className="oc-card-icon">
                {experience.shortLabel === 'Chat' ? <Keyboard className="h-4 w-4" /> : <Radio className="h-4 w-4" />}
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <p className="oc-kicker">Current experience</p>
                        <h2 className="oc-card-title truncate">{experience.label}</h2>
                    </div>
                </div>
                <p className="oc-card-copy mt-2">
                    {progress === null
                        ? `${formatPhase(sessionState?.phase)}. ${userCount} user answers.`
                        : `${progress}% complete. ${answeredCount} of ${totalQuestions} answered.`}
                </p>
            </div>
        </section>
    );
}

function LoadingState() {
    return (
        <div className="flex min-h-[54vh] flex-col items-center justify-center text-center">
            <div className="oc-loading-mark">
                <Loader2 className="h-6 w-6 animate-spin" />
            </div>
            <h2 className="oc-empty-title">Loading conversation</h2>
            <p className="oc-empty-copy">Connecting the React chat frontend to the Laravel backend API.</p>
        </div>
    );
}

function EmptyState({ onSelectPrompt }: { onSelectPrompt: (prompt: string) => void }) {
    return (
        <div className="flex min-h-[54vh] flex-col items-center justify-center text-center">
            <div className="oc-empty-mark">
                <BadgeCheck className="h-7 w-7" />
            </div>
            <Badge className="oc-mode-badge mb-4" variant="outline">
                Assistant-led setup
            </Badge>
            <h2 className="oc-empty-title">Interview ready</h2>
            <p className="oc-empty-copy">
                Start in chat, then Officer Charles will guide the setup inside the conversation.
            </p>
            <div className="mt-8 grid w-full max-w-3xl gap-3 sm:grid-cols-3">
                {starterPrompts.map((prompt, index) => (
                    <button key={prompt} type="button" onClick={() => onSelectPrompt(prompt)} className="oc-starter-card">
                        <span className="oc-starter-index">{index + 1}</span>
                        <span>{prompt}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

function LiveInterviewStage({
    connected,
    connecting,
    error,
    recording,
    speaking,
}: {
    connected: boolean;
    connecting: boolean;
    error: string | null;
    recording: boolean;
    speaking: boolean;
}) {
    const avatarSrc = speaking || recording ? '/assets/images/assistant.gif' : '/assets/images/assistant.png';

    return (
        <section className="oc-live-stage">
            <div className="oc-live-main">
                <div className={cn('oc-live-avatar-wrap', connected && 'is-connected', recording && 'is-recording', speaking && 'is-speaking')}>
                    <img src={avatarSrc} alt="Officer Charles avatar" className="oc-live-avatar" draggable="false" />
                    {connecting && (
                        <div className="oc-live-avatar-loader">
                            <Loader2 className="h-9 w-9 animate-spin" />
                        </div>
                    )}
                </div>

                <div className="oc-live-copy">
                    <Badge className="oc-mode-badge mb-3" variant="outline">
                        Assistant-led setup
                    </Badge>
                    <h2 className="oc-empty-title">{connected ? 'Live interview active' : 'Live interview ready'}</h2>
                    <p className="oc-empty-copy">
                        {connected
                            ? 'Use the mic control to answer Officer Charles. The avatar responds live while audio is playing.'
                            : 'Start a realtime voice session with Officer Charles. Microphone access is requested only when you start.'}
                    </p>
                </div>
            </div>

            {error && (
                <div className="oc-error-banner mt-4">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}
        </section>
    );
}

function LiveMicControls({
    connected,
    connecting,
    onEnd,
    onStart,
    onToggleRecording,
    recording,
}: {
    connected: boolean;
    connecting: boolean;
    onEnd: () => void;
    onStart: () => void;
    onToggleRecording: () => void;
    recording: boolean;
}) {
    const buttonLabel = !connected ? 'Start live interview' : recording ? 'Send answer' : 'Start speaking';

    return (
        <footer className="oc-live-control-wrap">
            <div className="oc-live-control-panel">
                <Button
                    type="button"
                    onClick={connected ? onToggleRecording : onStart}
                    disabled={connecting}
                    className={cn('oc-live-mic-button', recording && 'is-recording')}
                    aria-label={buttonLabel}
                >
                    {connecting ? <Loader2 className="h-5 w-5 animate-spin" /> : connected ? <Mic className="h-6 w-6" /> : <Radio className="h-5 w-5" />}
                </Button>
                <span className="oc-live-mic-label">{buttonLabel}</span>
                {connected && (
                    <Button type="button" variant="ghost" onClick={onEnd} className="oc-live-end-inline">
                        <PhoneOff className="h-4 w-4" />
                        End
                    </Button>
                )}
            </div>
        </footer>
    );
}

function MessageBubble({ message }: { message: ChatMessage }) {
    const isUser = message.role === 'user';
    const failed = message.status === 'failed';
    const pending = message.status === 'pending';

    return (
        <article className={cn('flex gap-3 sm:gap-4', isUser ? 'justify-end' : 'justify-start')}>
            {!isUser && (
                <Avatar className="oc-avatar oc-avatar-assistant mt-1">
                    <AvatarFallback>OC</AvatarFallback>
                </Avatar>
            )}

            <div className={cn('flex max-w-[88%] flex-col gap-1.5 sm:max-w-[76%]', isUser ? 'items-end' : 'items-start')}>
                {isFinalReport(message.content) && !isUser ? (
                    <div className="oc-report-card">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--oc-border)] pb-3">
                            <h3 className="oc-card-title">Visa Interview Performance Report</h3>
                            <Badge className="oc-mode-badge" variant="outline">
                                Consular evaluation
                            </Badge>
                        </div>
                        <p className="whitespace-pre-wrap text-sm leading-7">{message.content}</p>
                    </div>
                ) : (
                    <div className={cn(isUser ? 'oc-user-bubble' : 'oc-assistant-bubble', failed && 'is-failed', pending && 'is-pending')}>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                )}

                <div className="oc-message-meta">
                    <span>{formatTime(message.created_at)}</span>
                    {pending && <span>Sending</span>}
                    {failed && <span className="text-rose-500">Not sent</span>}
                </div>
            </div>

            {isUser && (
                <Avatar className="oc-avatar oc-avatar-user mt-1">
                    <AvatarFallback>
                        <User className="h-4 w-4" />
                    </AvatarFallback>
                </Avatar>
            )}
        </article>
    );
}

function ThinkingBubble() {
    return (
        <article className="flex justify-start gap-3 sm:gap-4">
            <Avatar className="oc-avatar oc-avatar-assistant mt-1">
                <AvatarFallback>OC</AvatarFallback>
            </Avatar>
            <div className="oc-assistant-bubble">
                <div className="flex items-center gap-3">
                    <Loader2 className="h-4 w-4 animate-spin text-[var(--oc-accent)]" />
                    <span>Officer Charles is reviewing your response...</span>
                </div>
            </div>
        </article>
    );
}
