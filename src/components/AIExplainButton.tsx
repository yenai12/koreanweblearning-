'use client';

import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface AIExplainButtonProps {
  answerDetailId: string;
  initialFeedback?: string | null;
}

export function AIExplainButton({ answerDetailId, initialFeedback }: AIExplainButtonProps) {
  const [feedback, setFeedback] = useState<string | null>(initialFeedback ?? null);
  const [loading, setLoading] = useState(false);
  const [shown, setShown] = useState(!!initialFeedback);

  const handleClick = async () => {
    if (shown && feedback) {
      setShown(false);
      return;
    }
    if (feedback) {
      setShown(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answerDetailId }),
      });
      const data = await res.json();
      setFeedback(data.feedback ?? data.error);
      setShown(true);
    } catch {
      setFeedback('❌ Lỗi kết nối AI. Vui lòng thử lại.');
      setShown(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3">
      <button
        onClick={handleClick}
        disabled={loading}
        className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 transition-all disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        {loading
          ? 'AI đang phân tích...'
          : shown
          ? 'Ẩn Giải Thích AI'
          : '🤖 AI Giải Thích Chi Tiết'}
      </button>

      {shown && feedback && (
        <div className="mt-3 bg-violet-50 border border-violet-200 rounded-xl p-4 text-sm text-violet-900 leading-relaxed whitespace-pre-wrap korean-text">
          <p className="font-bold text-violet-700 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Phân Tích Từ AI (선생님 Kim)
          </p>
          {feedback}
        </div>
      )}
    </div>
  );
}
