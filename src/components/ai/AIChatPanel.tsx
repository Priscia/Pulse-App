import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Bot, X, Send, Trash2, ChevronDown, Sparkles, Loader2 } from 'lucide-react';
import type { ChatMessage } from '../../hooks/useAIChat';

interface AIChatPanelProps {
  messages: ChatMessage[];
  isTyping: boolean;
  suggestions: string[];
  onSend: (message: string) => void;
  onClear: () => void;
}

function formatContent(content: string) {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-deloitte-black">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && (
        <div className="w-7 h-7 bg-deloitte-green rounded-full flex items-center justify-center shrink-0 mt-0.5">
          <Bot size={14} className="text-deloitte-black" />
        </div>
      )}
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-deloitte-black text-white rounded-tr-sm'
            : 'bg-deloitte-light-gray/40 text-deloitte-black rounded-tl-sm border border-deloitte-light-gray/60'
        }`}
      >
        <div className="whitespace-pre-line">
          {formatContent(message.content)}
        </div>
        <div className={`text-[10px] mt-1.5 ${isUser ? 'text-white/50 text-right' : 'text-deloitte-med-gray'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2.5">
      <div className="w-7 h-7 bg-deloitte-green rounded-full flex items-center justify-center shrink-0">
        <Bot size={14} className="text-deloitte-black" />
      </div>
      <div className="bg-deloitte-light-gray/40 border border-deloitte-light-gray/60 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-deloitte-med-gray rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-deloitte-med-gray rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 bg-deloitte-med-gray rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

export default function AIChatPanel({ messages, isTyping, suggestions, onSend, onClear }: AIChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;
    setInput('');
    setShowSuggestions(false);
    onSend(trimmed);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (s: string) => {
    setShowSuggestions(false);
    onSend(s);
  };

  const handleClear = () => {
    onClear();
    setShowSuggestions(true);
  };

  const hasNewMessages = messages.length > 1;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-deloitte-black text-white rounded-2xl shadow-2xl hover:bg-deloitte-dark-gray transition-all duration-200 hover:scale-105 active:scale-95 ${isOpen ? 'hidden' : 'flex'}`}
        aria-label="Open AI Assistant"
      >
        <div className="relative">
          <Sparkles size={18} className="text-deloitte-green" />
          {hasNewMessages && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-deloitte-green rounded-full" />
          )}
        </div>
        <span className="text-sm font-medium">AI Assistant</span>
      </button>

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-40 w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-deloitte-light-gray/80 flex flex-col overflow-hidden"
          style={{ height: '560px', maxHeight: 'calc(100vh - 5rem)' }}>
          <div className="flex items-center justify-between px-4 py-3.5 bg-deloitte-black border-b border-deloitte-light-gray/20 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-deloitte-green rounded-xl flex items-center justify-center">
                <Sparkles size={15} className="text-deloitte-black" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">CX AI Assistant</p>
                <p className="text-xs text-deloitte-light-gray/70">Powered by Pulse AI</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleClear}
                className="p-1.5 text-deloitte-light-gray/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Clear conversation"
              >
                <Trash2 size={14} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-deloitte-light-gray/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Minimize"
              >
                <ChevronDown size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-deloitte-light-gray/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth">
            {messages.map(msg => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isTyping && <TypingIndicator />}

            {showSuggestions && messages.length <= 1 && !isTyping && (
              <div className="mt-2">
                <p className="text-xs text-deloitte-med-gray mb-2 flex items-center gap-1">
                  <Loader2 size={10} className="text-deloitte-green" />
                  Suggested questions
                </p>
                <div className="space-y-1.5">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestion(s)}
                      className="w-full text-left text-xs px-3 py-2 bg-deloitte-light-gray/30 hover:bg-deloitte-green/10 hover:border-deloitte-green/30 border border-deloitte-light-gray/60 rounded-xl transition-all text-deloitte-dark-gray"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-4 py-3 border-t border-deloitte-light-gray/60 bg-white shrink-0">
            <div className="flex items-end gap-2 bg-deloitte-light-gray/20 rounded-xl border border-deloitte-light-gray/60 px-3 py-2 focus-within:border-deloitte-black/30 transition-colors">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your dashboard..."
                rows={1}
                className="flex-1 bg-transparent text-sm text-deloitte-black placeholder-deloitte-med-gray resize-none outline-none max-h-24 leading-relaxed"
                style={{ minHeight: '22px' }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="p-1.5 bg-deloitte-black text-white rounded-lg hover:bg-deloitte-dark-gray disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0"
              >
                <Send size={13} />
              </button>
            </div>
            <p className="text-[10px] text-deloitte-med-gray mt-1.5 text-center">
              AI responses are based on live dashboard data
            </p>
          </div>
        </div>
      )}
    </>
  );
}
