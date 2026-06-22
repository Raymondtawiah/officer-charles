import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { dashboard } from '@/routes';

export default function Dashboard() {
    const { auth } = usePage().props;
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Hello 👋 I am your Visa AI assistant. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');

    function sendMessage() {
        if (!input.trim()) return;

        setMessages((prev) => [
            ...prev,
            { role: 'user', text: input },
            { role: 'ai', text: "I can help you prepare visa answers, documents, and interview questions." }
        ]);

        setInput('');
    }

    return (
        <>
            <Head title="Visa AI Dashboard" />

            <div className="flex h-screen bg-[#0b0f19] text-white">

                {/* Sidebar */}
                <div className="w-64 bg-[#111827] border-r border-white/10 p-4">
                    <h1 className="text-xl font-bold mb-6">🛂 Visa AI</h1>

                    <div className="space-y-3 text-sm">
                        <div className="p-2 rounded bg-white/10">Dashboard</div>
                        <div className="p-2 rounded hover:bg-white/10 cursor-pointer">Interview Prep</div>
                        <div className="p-2 rounded hover:bg-white/10 cursor-pointer">Documents</div>
                        <div className="p-2 rounded hover:bg-white/10 cursor-pointer">Settings</div>
                    </div>

                    <div className="mt-6 text-xs text-white/50">
                        Logged in as:<br />
                        <span className="text-white">{auth?.user?.name ?? 'Guest'}</span>
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex flex-col flex-1">

                    {/* Header */}
                    <div className="p-4 border-b border-white/10">
                        <h2 className="text-lg font-semibold">AI Visa Interview Assistant</h2>
                        <p className="text-sm text-white/60">
                            Practice answers, improve confidence, and prepare for embassy interviews
                        </p>
                    </div>

                    {/* Chat */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`max-w-xl p-3 rounded-lg ${
                                    msg.role === 'user'
                                        ? 'ml-auto bg-blue-600'
                                        : 'bg-white/10'
                                }`}
                            >
                                {msg.text}
                            </div>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-white/10 flex gap-2">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask your visa question..."
                            className="flex-1 p-3 rounded bg-white/10 outline-none"
                        />
                        <button
                            onClick={sendMessage}
                            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                        >
                            Send
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};