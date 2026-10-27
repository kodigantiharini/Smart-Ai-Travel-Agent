import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Send,
  Sparkles,
  User as UserIcon,
  RefreshCw,
  Compass,
  ArrowRight,
  ShieldCheck,
  Zap,
  Plane,
  Building,
  CloudSun,
  DollarSign,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api';
import { PlaceCard } from '../components/PlaceCard';
import { WeatherWidget } from '../components/WeatherWidget';
import { useAuth } from '../context/AuthContext';
import { AgentChatResponse, ToolExecutionRecord, HotelOffer, FlightOffer } from '../types';
import { MarkdownMessage } from '../components/MarkdownMessage';

interface ExtendedChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  toolExecutions?: ToolExecutionRecord[];
  suggestedPlaces?: any[];
  weatherSnapshot?: any;
  hotelOffers?: HotelOffer[];
  flightOffers?: FlightOffer[];
  estimatedBudget?: any;
  actionPayload?: any;
  timestamp: string;
}

const QUICK_PROMPTS = [
  'Plan a 5-day trip to Kerala for four people within ₹50,000',
  'Is it raining in Munnar right now? Suggest indoor activities',
  'Find hotels and resorts near Munnar with mountain views',
  'Check flights from Delhi to Cochin for next week',
  'Convert $600 to INR at live exchange rates',
];

export const AiAssistantPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<ExtendedChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I am TripWise AI, your intelligent real-time travel agent. I utilize autonomous tool calling to inspect live Open-Meteo weather feeds, Geoapify places, real flight networks, and driving route physics. How can I plan or optimize your journey today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior,
      });
    }
  };

  useEffect(() => {
    // Only scroll within the chat box when a new message is added, without jumping the page!
    scrollToBottom('smooth');
  }, [messages.length]);

  const handleSend = async (textToSend?: string) => {
    const prompt = textToSend || input;
    if (!prompt.trim() || sending) return;

    const userMsg: ExtendedChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const history = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const res = await api.chatAi(prompt, history, user?.preferences);
      const data: AgentChatResponse = res.data;

      const aiMsg: ExtendedChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'Here are my recommendations based on verified places.',
        toolExecutions: data.toolExecutions || [],
        suggestedPlaces: data.suggestedPlaces || [],
        weatherSnapshot: data.weatherSnapshot,
        hotelOffers: data.hotelOffers || [],
        flightOffers: data.flightOffers || [],
        actionPayload: data.actionPayload,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          text: `I encountered an issue processing your request (${err.message}). You can try one of the quick suggestions below or refine your destination query.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleCreateTripFromPlan = (destination = 'Munnar') => {
    navigate('/trip-planner');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-600 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span>Autonomous Tool-Calling Travel Concierge</span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-navy-900 dark:text-white mt-1">
            Real-Time AI Travel Agent
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Grounded in live Geoapify geography, Open-Meteo forecasts, OSRM driving routes, and airline feeds.
          </p>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: 'welcome',
                sender: 'assistant',
                text: "Conversation refreshed. Where would you like to travel next?",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ])
          }
          className="p-2.5 rounded-2xl glass-panel text-slate-500 hover:text-navy-900 dark:hover:text-white flex items-center gap-1.5 text-xs font-semibold self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Quick Prompts Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {QUICK_PROMPTS.map((qp, i) => (
          <button
            key={i}
            onClick={() => handleSend(qp)}
            className="whitespace-nowrap px-4 py-2 rounded-2xl text-xs font-semibold glass-panel text-slate-600 dark:text-slate-300 hover:border-teal-500/50 hover:text-teal-600 transition-colors shadow-xs"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div
        ref={chatContainerRef}
        className="glass-panel p-3.5 sm:p-6 rounded-3xl sm:rounded-4xl border border-slate-200 dark:border-slate-800 min-h-[340px] sm:min-h-[480px] max-h-[55vh] sm:max-h-[640px] overflow-y-auto space-y-4 sm:space-y-6"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 sm:gap-4 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-brand flex items-center justify-center text-white shrink-0 shadow-md">
                <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            )}

            <div
              className={`max-w-[94%] sm:max-w-[80%] rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 space-y-3 sm:space-y-4 ${
                msg.sender === 'user'
                  ? 'bg-teal-600 text-white rounded-br-none shadow-md font-medium'
                  : 'glass-card border border-slate-200 dark:border-slate-800 rounded-bl-none shadow-glass'
              }`}
            >
              <div className={`text-xs font-semibold flex items-center justify-between mb-1 ${
                msg.sender === 'user' ? 'text-teal-100' : 'text-slate-400'
              }`}>
                <span className="flex items-center gap-1">
                  {msg.sender === 'user' ? user?.name || 'You' : 'TripWise AI Concierge'}
                  {msg.sender === 'assistant' && (
                    <span className="text-[10px] bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 px-1.5 py-0.2 rounded font-bold">
                      Grounded
                    </span>
                  )}
                </span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Tool Execution Chips Banner */}
              {msg.toolExecutions && msg.toolExecutions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1 pb-1">
                  {msg.toolExecutions.map((tool, tIdx) => (
                    <div
                      key={tIdx}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-500/30 text-[11px] text-teal-800 dark:text-teal-300 font-medium"
                    >
                      <Zap size={11} className="text-teal-500" />
                      <span className="font-semibold capitalize">{tool.toolName.replace('_', ' ')}:</span>
                      <span className="text-slate-600 dark:text-slate-400 truncate max-w-[140px] sm:max-w-[200px]">{tool.summary}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* User-friendly formatted message */}
              <div className={`text-sm leading-relaxed font-sans ${
                msg.sender === 'user' ? 'text-white font-medium' : 'text-slate-800 dark:text-slate-100'
              }`}>
                <MarkdownMessage content={msg.text} isUser={msg.sender === 'user'} />
              </div>

              {/* Live Weather Card */}
              {msg.weatherSnapshot && (
                <div className="pt-2">
                  <WeatherWidget weather={msg.weatherSnapshot} />
                </div>
              )}

              {/* Flight Offers */}
              {msg.flightOffers && msg.flightOffers.length > 0 && (
                <div className="pt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Plane size={14} className="text-teal-500" /> Indicative Flight Offers
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">Live Airline Schedule</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {msg.flightOffers.map((f) => (
                      <div
                        key={f.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs shadow-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{f.airlineName}</span>
                            <span className="text-[10px] text-slate-400 font-normal">({f.durationFormatted})</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {f.originIata} &rarr; {f.destinationIata} • Non-stop
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <div>
                            <span className="font-extrabold text-sm text-teal-600 dark:text-teal-400">
                              {f.currency} {f.price.toLocaleString()}
                            </span>
                            <div className="text-[9px] text-slate-400">per person</div>
                          </div>
                          <a
                            href={f.bookingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                          >
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hotel Offers */}
              {msg.hotelOffers && msg.hotelOffers.length > 0 && (
                <div className="pt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Building size={14} className="text-teal-500" /> Accommodations Available
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">Verified Properties</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {msg.hotelOffers.map((h) => (
                      <div
                        key={h.id}
                        className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs shadow-xs space-y-1.5"
                      >
                        <div className="font-bold text-slate-900 dark:text-white truncate">{h.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">★ {h.rating} ({h.ratingCount} reviews) • {h.address}</div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700/60">
                          <span className="font-bold text-teal-600 dark:text-teal-400">
                            {h.currency} {h.pricePerNight.toLocaleString()}/night
                          </span>
                          <a
                            href={h.bookingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 min-h-[36px] flex items-center"
                          >
                            <span>Book</span> <ExternalLink size={10} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Verified Place Cards inside Chat */}
              {msg.suggestedPlaces && msg.suggestedPlaces.length > 0 && (
                <div className="pt-3 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1">
                    <Compass size={13} /> Geoapify Verified Destinations:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {msg.suggestedPlaces.slice(0, 4).map((p: any) => (
                      <PlaceCard key={p.id || p.placeId} place={p} />
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button: Create Trip */}
              {msg.sender === 'assistant' && (
                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <ShieldCheck size={12} className="text-teal-500 shrink-0" />
                    <span>Real-time grounded response</span>
                  </div>
                  <button
                    onClick={() => handleCreateTripFromPlan()}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 shadow-sm transition-all min-h-[40px]"
                  >
                    <PlusCircle size={14} />
                    <span>Customize into Full Trip</span>
                  </button>
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            )}
          </div>
        ))}

        {sending && (
          <div className="flex items-center gap-3 text-slate-400 text-xs py-2">
            <div className="w-8 h-8 rounded-2xl bg-teal-600 flex items-center justify-center text-white animate-bounce shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <p className="font-semibold text-slate-700 dark:text-slate-200">Executing Agentic Tools...</p>
              <p className="text-[11px] text-slate-400 truncate">Querying Open-Meteo forecasts, Geoapify places & OSRM driving routes...</p>
            </div>
          </div>
        )}
      </div>

      {/* Input Message Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="relative flex items-center bg-white dark:bg-slate-900 rounded-3xl p-1.5 sm:p-2.5 shadow-xl border border-slate-200 dark:border-slate-800 focus-within:ring-2 focus-within:ring-teal-500/50 transition-all gap-1.5"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for customized trip advice, verified places, budget breakdowns, weather alerts..."
          className="w-full bg-transparent px-3 sm:px-4 py-2.5 text-base sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none min-h-[44px]"
        />

        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs font-bold text-white bg-gradient-brand hover:opacity-95 disabled:opacity-50 flex items-center gap-1.5 transition-all shadow-md shadow-glow-teal min-h-[44px] shrink-0"
        >
          <span className="hidden sm:inline">Ask Agent</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
