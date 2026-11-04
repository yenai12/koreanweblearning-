'use client';

import { useState, useRef, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Send, Bot, User, Loader2, Trash2, BookOpen } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const SUGGESTIONS = [
  '트이다 와 열리다 차이가 뭐예요?',
  'TOPIK에서 자주 나오는 접속사 알려주세요',
  '피동사와 사동사를 설명해 주세요',
  '에 vs 에서 완벽하게 정리해 주세요',
  '문법 -아/어서 와 -(으)니까 의 차이점',
  '한국어 존댓말과 반말 기초 설명해 주세요',
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    const userMsg: Message = { role: 'user', text: msg };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages, // history BEFORE user msg
          message: msg,
        }),
      });
      const data = await res.json();
      setMessages([...history, { role: 'model', text: data.reply ?? data.error }]);
    } catch {
      setMessages([...history, { role: 'model', text: '❌ Lỗi kết nối AI. Vui lòng thử lại.' }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Chat Container */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 flex flex-col">
        {/* Header */}
        <div className="py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-xl">
              🤖
            </div>
            <div>
              <h1 className="font-bold text-slate-900">선생님 Kim — AI Trợ Lý Tiếng Hàn</h1>
              <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                Gemini 2.0 Flash · Miễn phí
              </p>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" /> Xóa hội thoại
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pb-4 min-h-0">
          {messages.length === 0 && (
            <div className="text-center pt-10 pb-6">
              <div className="text-5xl mb-4">🇰🇷</div>
              <h2 className="text-xl font-bold text-slate-800 mb-1">Xin chào! 안녕하세요! 👋</h2>
              <p className="text-slate-500 text-sm mb-8">
                Tôi là 선생님 Kim — trợ lý AI chuyên tiếng Hàn của bạn.
                Hỏi bất cứ điều gì về từ vựng, ngữ pháp, TOPIK!
              </p>
              <p className="text-xs text-slate-400 mb-3 font-medium uppercase tracking-wide">
                Gợi ý câu hỏi nhanh
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-sm bg-white border border-slate-200 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 text-slate-600 px-4 py-2 rounded-full transition-all korean-text"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-rose-100 flex-shrink-0 flex items-center justify-center text-sm mt-1">
                  🤖
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap korean-text ${
                  m.role === 'user'
                    ? 'bg-rose-600 text-white rounded-br-sm'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm shadow-sm'
                }`}
              >
                {m.text}
              </div>
              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-sm mt-1">
                  <User className="w-4 h-4 text-slate-500" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-rose-100 flex-shrink-0 flex items-center justify-center text-sm">
                🤖
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-rose-400 animate-spin" />
                <span className="text-sm text-slate-400">선생님 Kim đang soạn câu trả lời...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="sticky bottom-0 bg-slate-50 pb-4 pt-2">
          <div className="bg-white border-2 border-slate-200 focus-within:border-rose-400 rounded-2xl transition-colors shadow-sm flex items-end gap-2 p-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              placeholder="Hỏi về tiếng Hàn... (Enter để gửi, Shift+Enter xuống dòng)"
              className="flex-1 resize-none bg-transparent outline-none text-sm text-slate-900 placeholder-slate-400 px-2 py-1 max-h-32 korean-text"
              style={{ minHeight: '36px' }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl p-2.5 transition-colors flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-center text-slate-400 mt-2">
            Powered by Google Gemini 2.0 Flash · Miễn phí · Dữ liệu không được lưu trữ
          </p>
        </div>
      </div>
    </div>
  );
}
