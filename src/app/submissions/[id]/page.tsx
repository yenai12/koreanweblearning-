export const instant = false;

import { Navbar } from '@/components/Navbar';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, XCircle, Trophy, MessageCircle } from 'lucide-react';
import { AIExplainButton } from '@/components/AIExplainButton';
import { PronounceButton } from '@/components/PronounceButton';

export default async function SubmissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const sub = await prisma.submission.findUnique({
    where: { id },
    include: {
      exam: { select: { title: true, level: true } },
      student: { select: { name: true } },
      details: {
        include: {
          question: { include: { options: { orderBy: { order: 'asc' } } } },
          selectedOption: true,
        },
        orderBy: { question: { order: 'asc' } },
      },
    },
  });

  if (!sub) notFound();

  const grade = sub.percentage >= 80 ? 'Xuất Sắc 🏆' : sub.percentage >= 60 ? 'Đạt ✅' : 'Chưa Đạt ❌';
  const gradeColor =
    sub.percentage >= 80 ? 'text-green-600' : sub.percentage >= 60 ? 'text-blue-600' : 'text-red-600';
  const barColor =
    sub.percentage >= 80 ? 'bg-green-500' : sub.percentage >= 60 ? 'bg-blue-500' : 'bg-red-500';

  const correctCount = sub.details.filter((d) => d.isCorrect).length;
  const wrongCount = sub.details.filter((d) => !d.isCorrect).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Score Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center mb-8">
          <Trophy className="w-14 h-14 mx-auto text-amber-400 mb-3" />
          <h1 className="text-2xl font-extrabold text-slate-900 mb-1">{sub.exam.title}</h1>
          <p className="text-slate-500 mb-6">Học viên: <span className="font-semibold text-slate-700">{sub.student.name}</span></p>

          <div className="flex justify-center gap-12 mb-6">
            <div>
              <div className="text-5xl font-extrabold text-rose-600">{sub.score.toFixed(0)}</div>
              <div className="text-sm text-slate-400 mt-1">/ {sub.maxScore} điểm</div>
            </div>
            <div>
              <div className={`text-5xl font-extrabold ${gradeColor}`}>{sub.percentage.toFixed(0)}%</div>
              <div className={`text-sm font-semibold mt-1 ${gradeColor}`}>{grade}</div>
            </div>
          </div>

          <div className="max-w-xs mx-auto h-3 bg-slate-100 rounded-full overflow-hidden mb-6">
            <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${sub.percentage}%` }} />
          </div>

          <div className="flex justify-center gap-6 text-sm font-medium">
            <span className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
              <CheckCircle2 className="w-4 h-4" /> {correctCount} câu đúng
            </span>
            <span className="flex items-center gap-1.5 text-red-500 bg-red-50 px-3 py-1.5 rounded-full border border-red-200">
              <XCircle className="w-4 h-4" /> {wrongCount} câu sai
            </span>
          </div>

          {wrongCount > 0 && (
            <p className="mt-4 text-sm text-violet-600 font-medium">
              ✨ Bấm <strong>"AI Giải Thích Chi Tiết"</strong> ở mỗi câu sai để hiểu rõ ngữ pháp nhé!
            </p>
          )}
        </div>

        {/* Detail per question */}
        <h2 className="text-xl font-bold text-slate-900 mb-4">Chi Tiết Từng Câu</h2>
        <div className="space-y-4">
          {sub.details.map((detail, idx) => {
            const q = detail.question;
            const correctOpt = q.options.find((o) => o.isCorrect);

            return (
              <div
                key={detail.id}
                className={`bg-white rounded-2xl border-2 p-5 ${
                  detail.isCorrect ? 'border-green-200' : 'border-red-200'
                }`}
              >
                {/* Question header */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    {detail.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    )}
                    <span className="font-bold text-slate-800">Câu {idx + 1}</span>
                  </div>
                  <span className={`text-sm font-bold px-2.5 py-0.5 rounded-full ${
                    detail.isCorrect ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {detail.pointsAwarded}/{q.points}đ
                  </span>
                </div>

                {/* Passage */}
                {q.passage && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 korean-text leading-relaxed whitespace-pre-line mb-3 flex items-start justify-between gap-2">
                    <div>{q.passage}</div>
                    <PronounceButton text={q.passage} />
                  </div>
                )}

                {/* Question text */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <p className="font-semibold text-slate-900 korean-text">{q.content}</p>
                  <PronounceButton text={q.content} />
                </div>

                {/* Options */}
                <div className="grid gap-2 mb-3">
                  {q.options.map((opt) => {
                    const isSelected = detail.selectedOptionId === opt.id;
                    const isCorrectOpt = opt.isCorrect;
                    return (
                      <div
                        key={opt.id}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm korean-text ${
                          isCorrectOpt
                            ? 'bg-green-50 border-2 border-green-400 text-green-800 font-semibold'
                            : isSelected && !isCorrectOpt
                            ? 'bg-red-50 border-2 border-red-400 text-red-700 line-through opacity-70'
                            : 'bg-slate-50 border border-slate-200 text-slate-500'
                        }`}
                      >
                        <span className="w-6 h-6 flex-shrink-0 rounded-full border border-current flex items-center justify-center text-xs font-bold">
                          {opt.order}
                        </span>
                        <span className="flex-1">{opt.text}</span>
                        {isCorrectOpt && <span className="text-xs text-green-600 font-bold ml-auto">✓ Đúng</span>}
                        {isSelected && !isCorrectOpt && <span className="text-xs text-red-500 ml-auto">✗ Em chọn</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Static explanation */}
                {!detail.isCorrect && q.explanation && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900 leading-relaxed mb-2">
                    <p className="font-bold mb-1">💡 Lời giải ngữ pháp</p>
                    <p className="whitespace-pre-line korean-text">{q.explanation}</p>
                  </div>
                )}

                {/* AI Explain Button (Client Component) */}
                {!detail.isCorrect && (
                  <AIExplainButton
                    answerDetailId={detail.id}
                    initialFeedback={detail.aiFeedback}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Back buttons */}
        <div className="flex flex-wrap gap-4 mt-8 justify-center">
          <Link
            href="/exams"
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-8 py-3 rounded-xl transition-colors"
          >
            Làm Đề Khác →
          </Link>
          <Link
            href="/chat"
            className="bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-700 font-bold px-8 py-3 rounded-xl transition-colors flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4 text-violet-500" /> Hỏi AI Thêm
          </Link>
        </div>
      </main>
    </div>
  );
}
