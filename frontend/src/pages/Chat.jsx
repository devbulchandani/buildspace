import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Code2, Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
import useAppStore from '../store/useAppStore';
import { chatApi } from '../api/chatApi';
import { getErrorMessage } from '../api/errorHandler';

const ChatMessage = ({ role, content }) => {
    const isUser = role === 'user';
    return (
        <div className={`flex gap-3 mb-6 ${isUser ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-sky-100 text-sky-600' : 'bg-lavender-100 text-accent'}`}>
                {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>

            <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${isUser
                    ? 'bg-sky-50 text-slate-800 border border-sky-100 rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                }`}>
                <div className="text-xs font-semibold mb-1 opacity-50 uppercase tracking-widest">
                    {isUser ? 'You' : 'Mentor AI'}
                </div>
                <div className="prose prose-sm prose-slate max-w-none">
                    <ReactMarkdown>{content}</ReactMarkdown>
                </div>
            </div>
        </div>
    );
};

const Chat = () => {
    const { currentPlan, repoUrl } = useAppStore();
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hi! I'm your AI mentor. Ask me anything about your learning journey!" }
    ]);
    const [input, setInput] = useState('');
    const [includeContext, setIncludeContext] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await chatApi.sendMessage(
                currentPlan?.id || 1,
                input,
            );

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: response
            }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `I'm sorry, I encountered an error: ${getErrorMessage(error)}`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-6">
            {/* Left Panel - Context */}
            <div className="w-80 hidden lg:flex flex-col gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex-shrink-0">
                    <h3 className="font-bold text-slate-700 mb-2">Current Context</h3>

                    <div className="mb-4">
                        <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Milestone</div>
                        <div className="text-sm font-medium text-slate-800">Create Repository Layer</div>
                    </div>

                    <div className="mb-4">
                        <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Repo</div>
                        <a href="#" className="text-sm text-sky-600 hover:underline break-all">
                            {currentPlan?.subtitle || 'github.com/username/todo-app'}
                        </a>
                    </div>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex-1 overflow-y-auto">
                    <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                        <Code2 className="w-4 h-4" />
                        Code Context
                    </h3>
                    <p className="text-xs text-indigo-700 mb-2">
                        AI observes your code changes.
                    </p>
                    <div className="bg-white rounded border border-indigo-100 p-2 text-xs font-mono text-slate-600 overflow-x-auto">
                        {`// TaskRepository.java
public interface TaskRepository 
  extends JpaRepository<Task, Long> {
  
  List<Task> findByCompleted(boolean c);
}`}
                    </div>
                </div>
            </div>

            {/* Right Panel - Chat */}
            <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden relative">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                    {messages.map((m, i) => (
                        <ChatMessage key={i} role={m.role} content={m.content} />
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-slate-100">
                    <form onSubmit={handleSend} className="relative">
                        <div className="flex items-center gap-2 mb-2 px-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className={`w-9 h-5 rounded-full relative transition-colors ${includeContext ? 'bg-sky-500' : 'bg-slate-200'}`}
                                    onClick={() => setIncludeContext(!includeContext)}>
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${includeContext ? 'left-5' : 'left-1'}`} />
                                </div>
                                <span className="text-xs font-medium text-slate-500 group-hover:text-sky-600 transition-colors">
                                    Include codebase context
                                </span>
                            </label>
                        </div>

                        <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-sky-100 focus-within:border-sky-300 transition-all">
                            <button type="button" className="p-2 text-slate-400 hover:text-sky-500 transition-colors">
                                <Paperclip className="w-5 h-5" />
                            </button>
                            <textarea
                                className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 py-2 text-slate-700 placeholder:text-slate-400"
                                placeholder="Ask anything about your code..."
                                rows={1}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend(e);
                                    }
                                }}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="p-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                {isLoading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Chat;
