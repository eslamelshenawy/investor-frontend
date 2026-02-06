/**
 * Chat Page - المستشار الذكي
 * AI Investment Advisor with conversation history
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Plus,
  Trash2,
  Loader2,
  Bot,
  User,
  ChevronRight,
  Sparkles,
  X,
} from 'lucide-react';
import { api } from '../src/services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  messages: Array<{ content: string; role: string }>;
  _count: { messages: number };
}

const SUGGESTIONS = [
  'ما هي أفضل القطاعات للاستثمار في السعودية حالياً؟',
  'اشرح لي مؤشر تداول وكيف أتابعه',
  'ما تأثير رؤية 2030 على قطاع السياحة؟',
  'كيف أبدأ الاستثمار في الأسهم السعودية؟',
];

const ChatPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadConversations();
  }, [isAuthenticated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    const res = await api.getConversations();
    if (res.success && res.data) {
      setConversations(res.data);
    }
    setLoadingConversations(false);
  };

  const loadMessages = async (convId: string) => {
    setActiveConversation(convId);
    setShowSidebar(false);
    const res = await api.getChatMessages(convId);
    if (res.success && res.data) {
      setMessages(res.data.messages);
    }
  };

  const createNewConversation = async () => {
    const res = await api.createConversation();
    if (res.success && res.data) {
      setActiveConversation(res.data.id);
      setMessages([]);
      setShowSidebar(false);
      loadConversations();
    }
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    let convId = activeConversation;

    // Create conversation if none active
    if (!convId) {
      const res = await api.createConversation();
      if (res.success && res.data) {
        convId = res.data.id;
        setActiveConversation(convId);
      } else return;
    }

    const userMsg = input.trim();
    setInput('');
    setSending(true);

    // Optimistic: add user message
    const tempUserMsg: Message = {
      id: 'temp-user-' + Date.now(),
      role: 'user',
      content: userMsg,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMsg]);

    // Send to API
    const res = await api.sendChatMessage(convId, userMsg);
    setSending(false);

    if (res.success && res.data) {
      setMessages(prev => [...prev, res.data!.message]);
      loadConversations(); // Refresh sidebar titles
    }

    inputRef.current?.focus();
  };

  const handleSuggestion = (text: string) => {
    setInput(text);
    setTimeout(() => handleSend(), 100);
  };

  const handleDelete = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await api.deleteConversation(convId);
    if (activeConversation === convId) {
      setActiveConversation(null);
      setMessages([]);
    }
    loadConversations();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center max-w-md p-8">
          <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Bot size={40} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-3">المستشار الذكي</h2>
          <p className="text-gray-500 mb-6">سجّل دخولك للتحدث مع المستشار الذكي والحصول على تحليلات استثمارية</p>
          <button onClick={() => navigate('/login')} className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700">
            تسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50" dir="rtl">
      {/* Sidebar - Conversations */}
      <div className={`${showSidebar ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'} fixed lg:relative inset-y-0 right-0 z-30 w-72 bg-white border-l border-gray-200 flex flex-col transition-transform`}>
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900 text-sm">المحادثات</h2>
            <button onClick={() => setShowSidebar(false)} className="lg:hidden text-gray-400">
              <X size={18} />
            </button>
          </div>
          <button
            onClick={createNewConversation}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} /> محادثة جديدة
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConversations ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-gray-300" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageSquare size={32} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-400">لا توجد محادثات بعد</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => loadMessages(conv.id)}
                  className={`w-full text-right p-3 rounded-xl text-sm transition-colors group flex items-center gap-2 ${
                    activeConversation === conv.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <MessageSquare size={14} className="shrink-0 opacity-50" />
                  <span className="flex-1 truncate">{conv.title}</span>
                  <button
                    onClick={(e) => handleDelete(conv.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar overlay on mobile */}
      {showSidebar && <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={() => setShowSidebar(false)} />}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setShowSidebar(true)} className="lg:hidden text-gray-500">
            <ChevronRight size={20} />
          </button>
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-black text-gray-900 text-sm">المستشار الذكي</h1>
            <p className="text-[11px] text-gray-400">مدعوم بالذكاء الاصطناعي</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-10 mt-8">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={32} className="text-blue-500" />
                </div>
                <h2 className="text-xl font-black text-gray-900 mb-2">مرحباً! أنا رادار</h2>
                <p className="text-gray-500 text-sm">مستشارك الذكي للاستثمار في السوق السعودي. كيف يمكنني مساعدتك؟</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(s); }}
                    className="text-right p-4 bg-white rounded-xl border border-gray-200 text-sm text-gray-700 hover:border-blue-300 hover:bg-blue-50/50 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-start' : 'justify-start'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1 ${
                    msg.role === 'user' ? 'bg-gray-100' : 'bg-blue-100'
                  }`}>
                    {msg.role === 'user' ? <User size={14} className="text-gray-500" /> : <Bot size={14} className="text-blue-600" />}
                  </div>
                  <div className={`flex-1 rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-white border border-gray-200 text-gray-700'
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 mt-1">
                    <Bot size={14} className="text-blue-600" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Loader2 size={14} className="animate-spin" />
                      جارٍ التفكير...
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="اكتب سؤالك هنا..."
                  rows={1}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  style={{ maxHeight: '120px' }}
                  disabled={sending}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="w-11 h-11 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shrink-0"
              >
                {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 text-center">
              المستشار الذكي يقدم معلومات عامة ولا يُعد نصيحة مالية. تحقق دائماً من مصادر البيانات.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
