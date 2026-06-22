import { useState, useEffect, useRef } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { ArrowUp, Loader2, Sparkles, User, ShieldCheck, GraduationCap, Flame, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Message {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
    // Optional extensions for parsing diagnostic telemetry fields natively 
    score?: number;
    metrics?: {
        strengths?: string[];
        concerns?: string[];
        recommendations?: string[];
    };
}

interface Props {
    messages: Message[];
}

type InterviewMode = 'TRAINING' | 'SIMULATION';

export default function VisaAi({ messages }: Props) {
    const [submitting, setSubmitting] = useState(false);
    const [currentMode, setCurrentMode] = useState<InterviewMode>('TRAINING');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const form = useForm({
        content: '',
        agent_id: 'TRAINING', // Binds dynamically with user selections
    });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, submitting]);

    // Handle switching states manually or from headers
    const handleModeChange = (mode: InterviewMode) => {
        setCurrentMode(mode);
        form.setData('agent_id', mode);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.data.content.trim() || submitting) return;

        setSubmitting(true);
        form.post('/api/ai/messages', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset('content');
                setSubmitting(false);
            },
            onError: () => {
                setSubmitting(false);
            },
        });
    };

    return (
        <>
            <Head title={`Visa Interview Prep - Officer Charles`} />
            <div className="flex h-screen flex-col bg-background text-foreground">
                
                {/* Global Application Header */}
                <header className="flex h-16 items-center justify-between border-b bg-card px-4 sm:px-6 lg:px-8 shrink-0 shadow-sm z-10">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                            <GraduationCap className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold tracking-tight">Officer Charles</h1>
                            <p className="text-[11px] text-muted-foreground">U.S. Visa Simulator</p>
                        </div>
                    </div>
                    
                    {/* Interactive Session Mode Controller */}
                    <div className="flex items-center gap-1.5 rounded-xl border bg-background p-1 shadow-inner">
                        <button
                            type="button"
                            onClick={() => handleModeChange('TRAINING')}
                            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                                currentMode === 'TRAINING'
                                    ? 'bg-primary text-primary-foreground shadow'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Sparkles className="h-3.5 w-3.5" />
                            Training Session
                        </button>
                        <button
                            type="button"
                            onClick={() => handleModeChange('SIMULATION')}
                            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                                currentMode === 'SIMULATION'
                                    ? 'bg-destructive text-destructive-foreground shadow'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Flame className="h-3.5 w-3.5" />
                            Real Simulation
                        </button>
                    </div>
                </header>

                {/* Chat History Container */}
                <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 bg-slate-50/40 dark:bg-zinc-950/20">
                    <div className="mx-auto max-w-2xl space-y-6">
                        
                        {/* Empty States customized based on Session Mode selection */}
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-300">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-4 shadow-sm">
                                    <ShieldCheck className="h-7 w-7" />
                                </div>
                                <h2 className="text-xl font-bold tracking-tight">Interview Initialized</h2>
                                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                                    {currentMode === 'TRAINING' 
                                        ? "Officer Charles will review your structure and supply live feedback loops, scoring metrics, and missed optimization points."
                                        : "Strict consular setup. 10-15 direct questions with zero real-time hints. Complete final performance analysis provided upon completion."
                                    }
                                </p>
                            </div>
                        )}

                        {/* Chat Threads UI */}
                        {messages.map((message) => {
                            const isUser = message.role === 'user';
                            
                            // Check if the current bubble contains report keywords to format structured dashboard layouts
                            const isFinalReport = message.content.includes("FINAL REPORT") || message.content.includes("Performance Report");

                            return (
                                <div
                                    key={message.id}
                                    className={`flex items-start gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    <Avatar className="h-9 w-9 shrink-0 select-none border shadow-sm">
                                        {isUser ? (
                                            <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold">
                                                <User className="h-4 w-4" />
                                            </AvatarFallback>
                                        ) : (
                                            <AvatarFallback className="bg-zinc-900 text-white font-medium text-xs dark:bg-zinc-100 dark:text-zinc-900">
                                                OC
                                            </AvatarFallback>
                                        )}
                                    </Avatar>

                                    <div className={`flex flex-col max-w-[85%] space-y-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                                        
                                        {/* Render specialized UI block if message acts as the final report summary */}
                                        {isFinalReport ? (
                                            <div className="w-full rounded-2xl border bg-card p-5 shadow-md space-y-4 animate-in zoom-in-95 duration-200">
                                                <div className="flex items-center justify-between border-b pb-3">
                                                    <h3 className="font-bold text-base text-primary">📊 Visa Interview Performance Report</h3>
                                                    <span className="text-xs bg-muted px-2.5 py-1 rounded-full font-mono font-semibold">Consular Evaluation</span>
                                                </div>
                                                <div className="whitespace-pre-wrap text-sm text-foreground/90 leading-relaxed font-sans">
                                                    {message.content}
                                                </div>
                                            </div>
                                        ) : (
                                            /* Regular Message Bubble */
                                            <div
                                                className={`rounded-2xl px-4 py-3 text-sm shadow-sm leading-relaxed whitespace-pre-wrap ${
                                                    isUser
                                                        ? 'bg-primary text-primary-foreground rounded-tr-none font-medium'
                                                        : 'bg-card border text-foreground rounded-tl-none shadow-sm'
                                                }`}
                                            >
                                                {message.content}
                                            </div>
                                        )}

                                        <span className="text-[10px] text-muted-foreground px-1">
                                            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Processing / Bot Thinking Bubble */}
                        {submitting && (
                            <div className="flex items-start gap-4 flex-row animate-pulse">
                                <Avatar className="h-9 w-9 shrink-0 border bg-card">
                                    <AvatarFallback className="bg-zinc-900 text-white text-xs dark:bg-zinc-100 dark:text-zinc-900">OC</AvatarFallback>
                                </Avatar>
                                <div className="rounded-2xl rounded-tl-none bg-card border px-4 py-3 text-sm shadow-sm flex items-center gap-2 text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                    <span className="font-medium text-xs">Charles is processing your response...</span>
                                </div>
                            </div>
                        )}
                        
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Bottom Input Workspace Context Elements */}
                <div className="border-t bg-card p-4 sm:p-5 shadow-2xl z-10">
                    <div className="mx-auto max-w-2xl">
                        
                        {/* Dynamic Mode Helper Context Bar above input widget */}
                        <div className="mb-3 flex items-center justify-between px-1">
                            {currentMode === 'TRAINING' ? (
                                <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium bg-amber-500/5 px-2.5 py-1 rounded-lg">
                                    <HelpCircle className="h-3.5 w-3.5" />
                                    <span>Tip: Highlight your specific program, university, and clear home ties.</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 text-xs text-destructive font-semibold bg-destructive/5 px-2.5 py-1 rounded-lg">
                                    <AlertTriangle className="h-3.5 w-3.5 animate-pulse" />
                                    <span>Simulated Mode: Continuous questioning path active. Avoid short fragments.</span>
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="relative flex items-center rounded-2xl border bg-background shadow-inner focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all duration-200">
                            <textarea
                                value={form.data.content}
                                onChange={(e) => form.setData('content', e.target.value)}
                                placeholder={currentMode === 'TRAINING' ? "Provide your structured response..." : "Respond directly to the officer..."}
                                rows={1}
                                className="w-full resize-none bg-transparent py-4 pl-4 pr-14 text-sm outline-none placeholder:text-muted-foreground min-h-[54px] max-h-32"
                                disabled={submitting}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit(e);
                                    }
                                }}
                            />
                            <div className="absolute right-3 bottom-2.5">
                                <Button 
                                    type="submit" 
                                    size="icon" 
                                    className={`h-8 w-8 rounded-xl transition-all active:scale-95 ${currentMode === 'SIMULATION' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}`} 
                                    disabled={submitting || !form.data.content.trim()}
                                >
                                    {submitting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <ArrowUp className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </form>
                        
                        {form.errors.content && (
                            <p className="mt-2 text-xs text-destructive font-medium animate-in fade-in-50">{form.errors.content}</p>
                        )}
                        
                        <p className="mt-3 text-center text-[10px] text-muted-foreground tracking-wide uppercase">
                            Formal F-1/M-1 visa simulation environment module.
                        </p>
                    </div>
                </div>

            </div>
        </>
    );
}