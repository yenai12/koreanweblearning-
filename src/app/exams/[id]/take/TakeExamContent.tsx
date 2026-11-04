'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle2,
  AlertCircle,
  Volume2,
  HelpCircle,
} from 'lucide-react';
import { PronounceButton } from '@/components/PronounceButton';

// --- Types ---
interface Option {
  id: string;
  order: number;
  text: string;
}

interface Question {
  id: string;
  order: number;
  section: string;
  title: string | null;
  passage: string | null;
  audioUrl?: string | null;
  content: string;
  points: number;
  options: Option[];
}

interface Exam {
  id: string;
  title: string;
  level: string;
  durationMinutes: number;
  totalPoints: number;
  teacher: { name: string };
  questions: Question[];
}

export default function TakeExamContent({ examId }: { examId: string }) {
  const router = useRouter();

  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId -> optionId
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Khôi phục bài làm từ localStorage nếu có
  useEffect(() => {
    if (!examId) return;
    try {
      const saved = localStorage.getItem(`hangulmaster_draft_${examId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.answers) setAnswers(parsed.answers);
        if (parsed.flagged) setFlagged(new Set(parsed.flagged));
      }
    } catch (e) {
      console.warn('Không thể đọc draft từ localStorage', e);
    }
  }, [examId]);

  // Tự động lưu tiến trình vào localStorage khi có thay đổi
  useEffect(() => {
    if (!examId || submitted) return;
    try {
      localStorage.setItem(
        `hangulmaster_draft_${examId}`,
        JSON.stringify({
          answers,
          flagged: Array.from(flagged),
        })
      );
    } catch (e) {
      console.warn('Không thể lưu draft', e);
    }
  }, [answers, flagged, examId, submitted]);

  // Fetch exam
  useEffect(() => {
    if (!examId) return;
    fetch(`/api/exams/${examId}`)
      .then((r) => {
        if (!r.ok) throw new Error('Không thể tải đề thi');
        return r.json();
      })
      .then((data) => {
        setExam(data);
        setTimeLeft(data.durationMinutes * 60);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [examId]);

  // Nộp bài
  const doSubmit = useCallback(
    async (auto = false) => {
      if (submitted || submitting || !exam) return;
      setSubmitting(true);
      setShowConfirmModal(false);
      if (timerRef.current) clearInterval(timerRef.current);

      try {
        // Lấy studentId hợp lệ
        const userRes = await fetch('/api/users/demo').then((r) => r.json());
        const studentId = userRes?.id;
        if (!studentId) {
          alert('Không tìm thấy tài khoản học sinh để nộp bài.');
          setSubmitting(false);
          return;
        }

        const payload = {
          studentId,
          answers: exam.questions.map((q) => ({
            questionId: q.id,
            selectedOptionId: answers[q.id] || null,
          })),
        };

        const res = await fetch(`/api/exams/${exam.id}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error('Lỗi khi nộp bài');
        }

        const sub = await res.json();
        setSubmitted(true);
        // Xóa bản nháp sau khi nộp thành công
        localStorage.removeItem(`hangulmaster_draft_${exam.id}`);

        if (auto) alert('⏰ Hết giờ! Bài thi của bạn đã được nộp tự động.');
        router.push(`/submissions/${sub.id}`);
      } catch (err: any) {
        alert('Có lỗi khi nộp bài: ' + (err.message || 'Lỗi mạng'));
        setSubmitting(false);
      }
    },
    [submitted, submitting, exam, answers, router]
  );

  // Đếm ngược thời gian
  useEffect(() => {
    if (!exam || submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          doSubmit(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [exam, submitted, doSubmit]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🇰🇷</div>
          <p className="text-slate-600 font-bold">Đang tải đề thi tiếng Hàn...</p>
        </div>
      </div>
    );
  }

  if (!exam || exam.questions?.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center max-w-sm bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-rose-500" />
          <h2 className="text-lg font-bold text-slate-900 mb-1">Không tìm thấy đề thi</h2>
          <p className="text-slate-500 text-sm mb-6">Đề thi này không tồn tại hoặc đã bị ẩn.</p>
          <button
            onClick={() => router.push('/exams')}
            className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl text-sm"
          >
            Quay lại danh sách đề thi
          </button>
        </div>
      </div>
    );
  }

  const question = exam.questions[currentIdx];
  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');
  const isLow = timeLeft < 120;
  const answeredCount = Object.keys(answers).filter((k) => answers[k]).length;
  const unansweredCount = exam.questions.length - answeredCount;

  const toggleFlag = () => {
    setFlagged((prev) => {
      const next = new Set(prev);
      next.has(question.id) ? next.delete(question.id) : next.add(question.id);
      return next;
    });
  };

  const sectionLabel: Record<string, string> = {
    LISTENING: '🔊 Nghe Hiểu (듣기)',
    READING: '📖 Đọc Hiểu (읽기)',
    WRITING: '✏️ Viết (쓰기)',
    VOCAB_GRAMMAR: '📚 Từ Vựng & Ngữ Pháp',
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xl">🇰🇷</span>
            <h1 className="font-bold text-slate-900 truncate text-sm md:text-base">
              {exam.title}
            </h1>
          </div>

          {/* Timer */}
          <div
            className={`flex items-center gap-2 font-mono font-bold text-lg md:text-xl px-3.5 py-1.5 rounded-xl border-2 transition-colors ${
              isLow
                ? 'border-red-400 bg-red-50 text-red-600 animate-pulse'
                : 'border-slate-200 bg-slate-50 text-slate-700'
            }`}
          >
            <Clock className="w-4 h-4 md:w-5 md:h-5 text-rose-500" />
            {mins}:{secs}
          </div>

          {/* Submit button */}
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={submitting}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 md:px-5 py-2 rounded-xl text-xs md:text-sm transition-colors disabled:opacity-60 whitespace-nowrap shadow-sm"
          >
            {submitting ? 'Đang nộp...' : 'Nộp Bài'}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 flex flex-col lg:flex-row gap-6">
        {/* Question Panel */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 mb-4 shadow-sm">
            {/* Question header info */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                  {sectionLabel[question.section] || question.section}
                </span>
                <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-full">
                  {question.points} điểm
                </span>
              </div>
              <button
                onClick={toggleFlag}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors ${
                  flagged.has(question.id)
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-500 hover:bg-amber-50 hover:text-amber-700'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                {flagged.has(question.id) ? 'Đã đánh dấu' : 'Đánh dấu xem lại'}
              </button>
            </div>

            {/* Question Title */}
            {question.title && (
              <p className="text-xs md:text-sm text-slate-500 font-semibold mb-3">
                {question.title}
              </p>
            )}

            {/* Audio Player (nếu có audioUrl) */}
            {question.audioUrl && (
              <div className="mb-4 p-3 bg-rose-50 rounded-2xl border border-rose-200 flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-rose-600 flex-shrink-0" />
                <audio controls className="w-full h-8">
                  <source src={question.audioUrl} type="audio/mpeg" />
                  Trình duyệt không hỗ trợ phát audio.
                </audio>
              </div>
            )}

            {/* Passage (Đoạn văn Hangul) */}
            {question.passage && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 md:p-5 mb-5 relative">
                <div className="flex items-start justify-between gap-3">
                  <div className="korean-text text-slate-800 leading-relaxed whitespace-pre-line text-sm md:text-base font-medium">
                    {question.passage}
                  </div>
                  <PronounceButton text={question.passage} size="md" />
                </div>
              </div>
            )}

            {/* Question Content */}
            <div className="flex items-start justify-between gap-3 mb-6">
              <h2 className="text-base md:text-lg font-bold text-slate-900 korean-text leading-snug">
                {question.content}
              </h2>
              <PronounceButton text={question.content} size="md" />
            </div>

            {/* 4 Options */}
            <div className="grid gap-3">
              {question.options.map((opt) => {
                const selected = answers[question.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      setAnswers((prev) => ({ ...prev, [question.id]: opt.id }))
                    }
                    className={`w-full text-left flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 transition-all font-medium text-sm md:text-base ${
                      selected
                        ? 'border-rose-500 bg-rose-50/80 text-rose-900 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-extrabold transition-colors ${
                        selected
                          ? 'border-rose-500 bg-rose-500 text-white'
                          : 'border-slate-300 text-slate-400 bg-slate-50'
                      }`}
                    >
                      {opt.order}
                    </span>
                    <span className="korean-text leading-relaxed flex-1">{opt.text}</span>
                    <PronounceButton text={opt.text} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nav Buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
              disabled={currentIdx === 0}
              className="flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 disabled:opacity-30 transition-colors text-sm shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Câu Trước
            </button>
            <span className="text-slate-500 text-xs md:text-sm font-semibold">
              Câu {currentIdx + 1} / {exam.questions.length}
            </span>
            <button
              onClick={() => setCurrentIdx((i) => Math.min(exam.questions.length - 1, i + 1))}
              disabled={currentIdx === exam.questions.length - 1}
              className="flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 disabled:opacity-30 transition-colors text-sm shadow-sm"
            >
              Câu Tiếp <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </main>

        {/* Sidebar: Question Navigator */}
        <aside className="w-full lg:w-60 flex-shrink-0">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sticky top-20 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Bảng Điều Hướng</h3>
            <div className="text-xs text-slate-500 mb-3 flex items-center justify-between">
              <span>Đã hoàn thành:</span>
              <span className="text-rose-600 font-extrabold text-sm">
                {answeredCount}/{exam.questions.length}
              </span>
            </div>

            {/* Grid numbers */}
            <div className="grid grid-cols-5 gap-2 mb-4">
              {exam.questions.map((q, idx) => {
                const done = Boolean(answers[q.id]);
                const isCur = idx === currentIdx;
                const isFlag = flagged.has(q.id);
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold border-2 transition-all flex items-center justify-center ${
                      isCur
                        ? 'border-rose-600 bg-rose-600 text-white scale-105 shadow-md shadow-rose-200'
                        : done
                        ? 'border-green-400 bg-green-50 text-green-700 font-extrabold'
                        : isFlag
                        ? 'border-amber-400 bg-amber-50 text-amber-700 font-extrabold'
                        : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="space-y-1.5 text-[11px] text-slate-500 mb-4 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-rose-600" />
                <span>Đang làm</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-green-50 border border-green-400" />
                <span>Đã chọn đáp án</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-amber-50 border border-amber-400 text-amber-600 flex items-center justify-center">
                  <Flag className="w-2.5 h-2.5" />
                </div>
                <span>Đã đánh dấu cờ</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-slate-50 border border-slate-200" />
                <span>Chưa làm</span>
              </div>
            </div>

            {/* Submit button in sidebar */}
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={submitting}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-3 rounded-2xl text-sm transition-all shadow-md hover:scale-102 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Nộp Bài Thi
            </button>
          </div>
        </aside>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-sm p-6 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg mb-2">
              Xác Nhận Nộp Bài Thi
            </h3>
            {unansweredCount > 0 ? (
              <p className="text-slate-600 text-sm mb-6">
                Bạn còn <span className="font-bold text-rose-600">{unansweredCount}</span> câu hỏi
                chưa làm. Bạn có chắc chắn muốn nộp bài bây giờ không?
              </p>
            ) : (
              <p className="text-slate-600 text-sm mb-6">
                Bạn đã hoàn thành tất cả <span className="font-bold text-green-600">{answeredCount}</span> câu hỏi. Sẵn sàng xem điểm và nhận giải thích từ AI chưa?
              </p>
            )}

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
              >
                Kiểm Tra Lại
              </button>
              <button
                type="button"
                onClick={() => doSubmit(false)}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm transition-colors shadow-sm"
              >
                {submitting ? 'Đang Nộp...' : 'Nộp Ngay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
