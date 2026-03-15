import { useState, useRef, useEffect } from 'react';
import {
  Zap, Play, Loader2, CheckCircle2, Wrench, Lightbulb,
  ChevronRight, RotateCcw, ChevronDown, ChevronUp, Send, MessageSquare,
} from 'lucide-react';
import type { AgentMessage, AgentStep, AgentTask } from '../../hooks/useAgenticAI';

interface AgenticAISectionProps {
  messages: AgentMessage[];
  isRunning: boolean;
  activeTaskId: string | null;
  tasks: AgentTask[];
  onRunTask: (task: AgentTask) => void;
  onSendMessage: (content: string) => void;
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

function ThoughtStep({ step }: { step: AgentStep }) {
  return (
    <div className="flex items-start gap-2">
      <Lightbulb size={12} className="text-amber-500 shrink-0 mt-0.5" />
      <p className="text-xs text-deloitte-med-gray italic leading-relaxed">{step.content}</p>
    </div>
  );
}

function ToolCallStep({ step }: { step: AgentStep }) {
  const [expanded, setExpanded] = useState(false);
  const isResult = step.type === 'tool_result';
  const isDone = step.tool?.status === 'done';

  return (
    <div className="flex items-start gap-2">
      <div className={`mt-0.5 shrink-0 ${isDone ? 'text-deloitte-green' : 'text-deloitte-med-gray'}`}>
        {isDone ? <CheckCircle2 size={12} /> : <Wrench size={12} className="animate-pulse" />}
      </div>
      <div className="flex-1 min-w-0">
        <button
          onClick={() => isResult && setExpanded(e => !e)}
          className={`text-left text-xs ${isResult ? 'cursor-pointer hover:opacity-75' : 'cursor-default'}`}
        >
          <span className="text-deloitte-dark-gray">
            {isResult ? 'Result from ' : 'Calling '}
            <span className="font-mono bg-deloitte-light-gray/50 px-1 py-0.5 rounded text-[10px]">{step.tool?.name}</span>
          </span>
          {isResult && (
            <ChevronRight size={10} className={`inline ml-1 text-deloitte-med-gray transition-transform ${expanded ? 'rotate-90' : ''}`} />
          )}
        </button>
        {expanded && step.tool?.result && (
          <div className="mt-1.5 text-[10px] font-mono bg-deloitte-light-gray/20 border border-deloitte-light-gray/50 rounded-lg p-2 text-deloitte-dark-gray max-h-24 overflow-y-auto whitespace-pre-wrap break-all">
            {step.tool.result}
          </div>
        )}
      </div>
    </div>
  );
}

function AgentOutput({ message }: { message: AgentMessage }) {
  const [showSteps, setShowSteps] = useState(false);
  const thoughtSteps = message.steps?.filter(s => s.type === 'thought') ?? [];
  const toolSteps = message.steps?.filter(s => s.type === 'tool_call' || s.type === 'tool_result') ?? [];
  const answerStep = message.steps?.find(s => s.type === 'answer');
  const hasSteps = thoughtSteps.length > 0 || toolSteps.length > 0;

  return (
    <div className="space-y-2.5">
      {hasSteps && (
        <div>
          <button
            onClick={() => setShowSteps(s => !s)}
            className="flex items-center gap-1.5 text-xs text-deloitte-med-gray hover:text-deloitte-dark-gray transition-colors"
          >
            {showSteps ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {showSteps ? 'Hide' : 'Show'} reasoning ({thoughtSteps.length + toolSteps.length} steps)
          </button>
          {showSteps && (
            <div className="mt-2 space-y-2 border-l-2 border-deloitte-light-gray/60 pl-3">
              {thoughtSteps.map(s => <ThoughtStep key={s.id} step={s} />)}
              {toolSteps.map(s => <ToolCallStep key={s.id} step={s} />)}
            </div>
          )}
        </div>
      )}

      {message.isStreaming && !answerStep && (
        <div className="flex items-center gap-2 text-xs text-deloitte-med-gray">
          <Loader2 size={12} className="animate-spin" />
          <span>Agent is processing...</span>
        </div>
      )}

      {answerStep && (
        <div className="text-sm text-deloitte-black leading-relaxed whitespace-pre-line">
          {formatContent(answerStep.content)}
        </div>
      )}

      {!hasSteps && !message.isStreaming && message.content && (
        <div className="text-sm text-deloitte-black leading-relaxed whitespace-pre-line">
          {formatContent(message.content)}
        </div>
      )}
    </div>
  );
}

export default function AgenticAISection({ messages, isRunning, activeTaskId, tasks, onRunTask, onSendMessage, onClear }: AgenticAISectionProps) {
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const conversationMessages = messages.filter(m => m.role === 'user' || m.role === 'agent');
  const hasConversation = conversationMessages.length > 0;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages]);

  const handleSend = () => {
    const trimmed = chatInput.trim();
    if (!trimmed || isRunning) return;
    onSendMessage(trimmed);
    setChatInput('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-deloitte-light-gray overflow-hidden">
      <div className="px-5 py-4 border-b border-deloitte-light-gray/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-deloitte-black rounded-lg flex items-center justify-center">
            <Zap size={15} className="text-deloitte-green" />
          </div>
          <div>
            <h3 className="font-semibold text-deloitte-black text-sm">CX Pulse</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-amber-400 animate-pulse' : 'bg-deloitte-green'}`} />
              <p className="text-[10px] text-deloitte-med-gray">
                {isRunning ? 'Running task...' : 'Ready — run a task or ask a question'}
              </p>
            </div>
          </div>
        </div>
        {hasConversation && !isRunning && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-xs text-deloitte-med-gray hover:text-deloitte-dark-gray transition-colors px-2 py-1 rounded-lg hover:bg-deloitte-light-gray/30"
          >
            <RotateCcw size={11} />
            Clear
          </button>
        )}
      </div>

      <div className="p-5 space-y-5">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
          {tasks.map(task => {
            const isActive = activeTaskId === task.id;
            return (
              <button
                key={task.id}
                onClick={() => onRunTask(task)}
                disabled={isRunning}
                className={`group text-left px-3.5 py-3 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-deloitte-green/10 border-deloitte-green/50 shadow-sm'
                    : 'bg-deloitte-light-gray/20 border-deloitte-light-gray/60 hover:bg-white hover:border-deloitte-black/20 hover:shadow-sm'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <div className="flex items-start justify-between gap-1 mb-1.5">
                  <span className={`text-xs font-semibold leading-tight ${isActive ? 'text-deloitte-black' : 'text-deloitte-dark-gray group-hover:text-deloitte-black'}`}>
                    {task.label}
                  </span>
                  {isActive ? (
                    <Loader2 size={11} className="animate-spin text-deloitte-green shrink-0 mt-0.5" />
                  ) : (
                    <Play size={10} className="text-deloitte-med-gray group-hover:text-deloitte-black shrink-0 mt-0.5 transition-colors" />
                  )}
                </div>
                <p className="text-[10px] text-deloitte-med-gray leading-snug line-clamp-2">{task.goal}</p>
              </button>
            );
          })}
        </div>

        {hasConversation && (
          <div className="border border-deloitte-light-gray/60 rounded-xl bg-deloitte-light-gray/10 overflow-hidden">
            <div className="max-h-80 overflow-y-auto p-4 space-y-4">
              {conversationMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {msg.role === 'agent' && (
                    <div className="w-6 h-6 bg-deloitte-black rounded-md flex items-center justify-center shrink-0 mt-0.5">
                      <Zap size={11} className="text-deloitte-green" />
                    </div>
                  )}
                  <div
                    className={`flex-1 max-w-[85%] rounded-xl px-3.5 py-2.5 ${
                      msg.role === 'user'
                        ? 'bg-deloitte-black text-white text-sm ml-auto rounded-tr-sm'
                        : 'bg-white border border-deloitte-light-gray/60 rounded-tl-sm'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    ) : (
                      <AgentOutput message={msg} />
                    )}
                  </div>
                </div>
              ))}
              {isRunning && !conversationMessages.find(m => m.role === 'agent' && m.isStreaming) && (
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-deloitte-black rounded-md flex items-center justify-center shrink-0">
                    <Zap size={11} className="text-deloitte-green" />
                  </div>
                  <div className="bg-white border border-deloitte-light-gray/60 rounded-xl rounded-tl-sm px-3.5 py-2.5">
                    <div className="flex items-center gap-2 text-xs text-deloitte-med-gray">
                      <Loader2 size={12} className="animate-spin" />
                      <span>Agent is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>
        )}

        {!hasConversation && (
          <div className="flex items-center gap-2 text-xs text-deloitte-med-gray border border-dashed border-deloitte-light-gray/60 rounded-xl p-3">
            <MessageSquare size={13} className="shrink-0 text-deloitte-light-gray" />
            <span>Run a task above or type a question below to get started.</span>
          </div>
        )}

        <div className={`flex items-center gap-2 border rounded-xl px-3.5 py-2.5 transition-all ${
          isRunning
            ? 'bg-deloitte-light-gray/20 border-deloitte-light-gray/40'
            : 'bg-white border-deloitte-light-gray/60 focus-within:border-deloitte-black/30 focus-within:shadow-sm'
        }`}>
          <input
            ref={inputRef}
            type="text"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isRunning}
            placeholder={isRunning ? 'Agent is running...' : 'Ask a question about your data...'}
            className="flex-1 text-sm bg-transparent outline-none text-deloitte-black placeholder:text-deloitte-med-gray/60 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={isRunning || !chatInput.trim()}
            className="w-7 h-7 rounded-lg bg-deloitte-black flex items-center justify-center shrink-0 hover:bg-deloitte-dark-gray transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send size={13} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
