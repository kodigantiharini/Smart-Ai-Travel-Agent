import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Send,
  Loader2,
  Bot,
  User,
  Wrench,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Calendar,
  DollarSign,
  MapPin,
  ChevronRight,
  Maximize2,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ToolExecutionRecord } from '../../types';
import { MarkdownMessage } from '../MarkdownMessage';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolsUsed?: ToolExecutionRecord[];
  itineraryDraft?: any;
  timestamp: string;
}

interface DashboardAssistantProps {
  currentTripContext?: any;
  onItineraryGenerated?: (itinerary: any) => void;
  onFocusCoordinates?: (lat: number, lng: number) => void;
}

export const DashboardAssistant: React.FC<DashboardAssistantProps> = ({
  currentTripContext,
  onItineraryGenerated,
  onFocusCoordinates,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem('tripwise_dashboard_chat');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return [
      {
        id: 'initial',
        role: 'assistant',
        content:
          "Hello! I'm your TripWise AI Travel Agent. Tell me where you'd like to travel, your budget, and preferences. I connect directly to live weather, Geoapify place discovery, and OSRM routing to build realistic itineraries for you.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const chatAreaRef = useRef<HTMLDivElement>(null);

  // Suggested prompts
  const suggestedQuestions = [
    'Plan a 5-day Kerala trip for 4 under ₹50,000',
    'What is the current weather in Kyoto?',
    'Find peaceful waterfalls and nature viewpoints',
    'Add a sunrise spot to my trip',
  ];

  useEffect(() => {
    try {
      localStorage.setItem('tripwise_dashboard_chat', JSON.stringify(messages));
    } catch {
      // Ignore
    }
    // Only scroll the inner chat container, without jerking the browser window!
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTo({
        top: chatAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages.length]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      // Build history for backend tool agent
      const historyPayload = newHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.chatAi(
        text,
        historyPayload,
        user?.preferences,
        currentTripContext
      );

      const agentData = res.data;
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: agentData.reply || 'Here are the live travel details you requested.',
        toolsUsed: agentData.executedTools,
        itineraryDraft: agentData.itineraryData,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);

      if (agentData.itineraryData && onItineraryGenerated) {
        onItineraryGenerated(agentData.itineraryData);
      }
    } catch (err: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          'I encountered a temporary connection issue while retrieving live travel data. Please try again or rephrase your request.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    const initialMsg: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content:
        "Chat history refreshed. How can I assist with your next adventure?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([initialMsg]);
    localStorage.removeItem('tripwise_dashboard_chat');
  };

  return (
    <div className="flex flex-col h-[440px] sm:h-[480px] lg:h-[520px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-5 py-3 sm:py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-850">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <Bot size={18} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white truncate">
              <span>TripWise AI Assistant</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            </div>
            <p className="text-[10px] text-slate-400 truncate">
              Live Tool Calling • Real-Time Geoapify & OSRM
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={clearChat}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-target flex items-center justify-center"
            title="Reset Conversation"
            aria-label="Reset Conversation"
          >
            <RefreshCw size={15} />
          </button>
          <button
            onClick={() => navigate('/assistant')}
            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-target flex items-center justify-center"
            title="Open Fullscreen Assistant"
            aria-label="Open Fullscreen Assistant"
          >
            <Maximize2 size={15} />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div ref={chatAreaRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-6 h-6 rounded-lg bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                  AI
                </div>
              )}

              <div className={`max-w-[85%] space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
                {/* Tools executed badge in real-time */}
                {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-1">
                    {msg.toolsUsed.map((tool, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-mono text-[9px] border border-teal-200/50 dark:border-teal-800"
                      >
                        <Wrench size={9} className="text-teal-500" />
                        <span>tool: {tool.tool}</span>
                        <CheckCircle size={9} className="text-emerald-500" />
                      </span>
                    ))}
                  </div>
                )}

                {/* Speech Bubble with High-Contrast User-Friendly Markdown formatting */}
                <div
                  className={`p-3.5 rounded-2xl leading-relaxed ${
                    isUser
                      ? 'bg-teal-600 text-white rounded-br-xs shadow-sm font-semibold'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs border border-slate-200/80 dark:border-slate-700/80 shadow-xs'
                  }`}
                >
                  <MarkdownMessage content={msg.content} isUser={isUser} />
                </div>

                {/* Itinerary Draft Card if returned */}
                {msg.itineraryDraft && (
                  <div className="p-3 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl space-y-2 mt-2">
                    <div className="flex items-center justify-between text-blue-900 dark:text-blue-200 font-bold text-xs">
                      <div className="flex items-center gap-1.5">
                        <Sparkles size={13} className="text-blue-600" />
                        <span>{msg.itineraryDraft.destination || 'Generated Itinerary'}</span>
                      </div>
                      <span className="text-[10px] bg-blue-200/60 dark:bg-blue-900 px-2 py-0.5 rounded-full">
                        {msg.itineraryDraft.totalDays || 5} Days
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      Grounded plan with verified Geoapify stops, estimated expenses, and transit times.
                    </p>

                    <button
                      onClick={() => navigate('/planner')}
                      className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>Open in AI Trip Planner</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                )}

                <div
                  className={`text-[9px] text-slate-400 px-1 ${
                    isUser ? 'text-right' : 'text-left'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {isUser && (
                <div className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px] shadow-xs">
                  <User size={12} />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs italic pl-8">
            <Loader2 size={13} className="animate-spin text-teal-600" />
            <span>Consulting real travel tools (places, weather, routes)...</span>
          </div>
        )}
      </div>

      {/* Suggested Questions Pills */}
      <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(q)}
            disabled={loading}
            className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-[10px] font-medium text-slate-600 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 shrink-0 transition-all disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Message Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-2.5 sm:p-3 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI: e.g. Plan Kerala in ₹50,000 or reorder stops..."
          disabled={loading}
          className="flex-1 px-3 py-2.5 sm:py-2 text-base sm:text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
        />

        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white shadow-md shadow-blue-500/20 transition-all shrink-0 touch-target flex items-center justify-center"
          title="Send message"
          aria-label="Send message to AI assistant"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </form>
    </div>
  );
};
