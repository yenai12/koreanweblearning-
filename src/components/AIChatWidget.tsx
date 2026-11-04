'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Loader2, Sparkles, MessageCircle } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: '안녕하세요! Tôi là 선생님 Kim. Bạn đang học hoặc làm bài thi có từ vựng hay ngữ pháp nào chưa hiểu rõ không? Cứ hỏi tôi nhé! ✨',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const handleSend = async (customText?: string) => {
    const text = (customText ?? input).trim();
    if (!text || loading) return;

    const userMsg: Message = { role: 'user', text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.slice(1), // bỏ tin chào ban đầu khỏi history
          message: text,
        }),
      });
      const data = await res.json();
      setMessages([...updated, { role: 'model', text: data.reply || data.error }]);
    } catch {
      setMessages([
        ...updated,
        { role: 'model', text: '❌ Lỗi kết nối trợ lý AI. Vui lòng thử lại sau.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 print:hidden">
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="group flex items-center gap-2.5 bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-700 hover:to-orange-600 text-white font-bold px-4 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400"></span>
          </span>
          <Bot className="w-5 h-5" />
          <span className="text-sm font-semibold pr-1">Hỏi Thầy Kim AI</span>
        </button>
      )}

      {/* Chat Popup Window */}
      {open && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-[92vw] sm:w-[380px] h-[520px] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-600 to-orange-500 px-4 py-3.5 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-base">
                🤖
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight">선생님 Kim</h4>
                <p className="text-[11px] text-white/80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-300 inline-block" />
                  Gemini Flash AI Trợ Lý
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 text-xs leading-relaxed">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'model' && (
                  <span className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    🤖
                  </span>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 whitespace-pre-wrap korean-text ${
                    m.role === 'user'
                      ? 'bg-rose-600 text-white rounded-br-sm'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm shadow-sm'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 justify-start items-center">
                <span className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-xs">
                  🤖
                </span>
                <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-400 flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 text-rose-500 animate-spin" />
                  <span>Đang soạn câu trả lời...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick chips */}
          <div className="px-3 py-1.5 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto text-[11px] text-slate-600 no-scrollbar">
            <button
              onClick={() => handleSend('Ngữ pháp -아/어서 là gì?')}
              className="bg-slate-100 hover:bg-rose-50 hover:text-rose-600 px-2.5 py-1 rounded-full whitespace-nowrap"
            >
              -아/어서?
            </button>
            <button
              onClick={() => handleSend('Trợ từ 에 và 에서 khác nhau thế nào?')}
              className="bg-slate-100 hover:bg-rose-50 hover:text-rose-600 px-2.5 py-1 rounded-full whitespace-nowrap"
            >
              에 vs 에서?
            </button>
            <button
              onClick={() => handleSend('Mẹo thi TOPIK I đạt điểm cao')}
              className="bg-slate-100 hover:bg-rose-50 hover:text-rose-600 px-2.5 py-1 rounded-full whitespace-nowrap"
            >
              Mẹo TOPIK
            </button>
          </div>

          {/* Input field */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              placeholder="Nhập từ vựng, ngữ pháp tiếng Hàn..."
              className="flex-1 bg-slate-50 border border-slate-200 focus:border-rose-400 outline-none text-xs rounded-xl px-3 py-2 text-slate-800 korean-text font-medium"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 text-white flex items-center justify-center transition-colors flex-shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
