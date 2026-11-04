'use client';

import { useState } from 'react';
import { Volume2 } from 'lucide-react';

interface PronounceButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function PronounceButton({ text, className = '', size = 'sm' }: PronounceButtonProps) {
  const [speaking, setSpeaking] = useState(false);

  const speak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!('speechSynthesis' in window)) {
      alert('Trình duyệt của bạn chưa hỗ trợ phát âm tự động.');
      return;
    }

    window.speechSynthesis.cancel(); // Dừng câu trước nếu có

    // Lọc lấy các ký tự tiếng Hàn hoặc văn bản cần đọc, bỏ phần dịch tiếng Việt trong ngoặc
    const cleanText = text
      .replace(/\(.*?\)/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/^[가-힣]:/gm, '') // Bỏ các nhãn như "남:", "여:", "가:", "나:"
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.82; // Tốc độ đàm thoại vừa phải cho người học TOPIK

    // Ưu tiên voice tiếng Hàn nếu hệ thống có sẵn
    const voices = window.speechSynthesis.getVoices();
    const koreanVoice = voices.find(
      (v) =>
        v.lang === 'ko-KR' ||
        v.lang.startsWith('ko') ||
        v.name.toLowerCase().includes('korean') ||
        v.name.includes('한국어')
    );
    if (koreanVoice) {
      utterance.voice = koreanVoice;
    }

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      type="button"
      onClick={speak}
      title="Bấm để nghe phát âm tiếng Hàn chuẩn"
      className={`inline-flex items-center justify-center rounded-xl transition-all shadow-2xs ${
        speaking
          ? 'bg-rose-500 text-white scale-110 shadow-rose-200'
          : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 hover:scale-105'
      } ${size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'} ${className}`}
    >
      <Volume2 className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
    </button>
  );
}
