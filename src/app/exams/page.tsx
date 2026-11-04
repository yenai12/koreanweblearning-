export const instant = false;

import { Navbar } from '@/components/Navbar';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Clock, FileText, Users, ChevronRight, BookOpen } from 'lucide-react';

const levelColors: Record<string, string> = {
  TOPIK_I: 'bg-green-100 text-green-700 border-green-200',
  TOPIK_II: 'bg-blue-100 text-blue-700 border-blue-200',
  BASIC: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  INTERMEDIATE: 'bg-orange-100 text-orange-700 border-orange-200',
  ADVANCED: 'bg-red-100 text-red-700 border-red-200',
};

const levelLabels: Record<string, string> = {
  TOPIK_I: 'TOPIK I',
  TOPIK_II: 'TOPIK II',
  BASIC: 'Sơ Cấp',
  INTERMEDIATE: 'Trung Cấp',
  ADVANCED: 'Cao Cấp',
};

export default async function ExamsPage() {
  const exams = await prisma.exam.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
    include: {
      teacher: { select: { name: true } },
      classroom: { select: { name: true, code: true } },
      _count: { select: { questions: true, submissions: true } },
    },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-rose-500" />
              Danh Sách Đề Thi
            </h1>
            <p className="text-slate-500 mt-1">
              Chọn đề thi để bắt đầu luyện tập. Kết quả & AI phân tích lỗi ngay sau khi nộp bài.
            </p>
          </div>
          <Link
            href="/exams/new"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-sm"
          >
            + Đăng Đề Thi Mới
          </Link>
        </div>

        {/* Exam Cards */}
        {exams.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <div className="text-5xl mb-4">📄</div>
            <p>Chưa có đề thi nào được đăng tải.</p>
          </div>
        ) : (
          <div className="grid gap-5">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-rose-200 hover:shadow-lg transition-all p-6 flex flex-col md:flex-row md:items-center gap-4"
              >
                {/* Info */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${levelColors[exam.level] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}
                    >
                      {levelLabels[exam.level] ?? exam.level}
                    </span>
                    {exam.classroom && (
                      <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full border border-slate-200">
                        🏫 {exam.classroom.name}
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 mb-1">{exam.title}</h2>
                  {exam.description && (
                    <p className="text-sm text-slate-500 mb-3">{exam.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-rose-400" />
                      {exam.durationMinutes} phút
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-400" />
                      {exam._count.questions} câu hỏi
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-green-400" />
                      {exam._count.submissions} lượt thi
                    </span>
                    <span className="text-slate-400">— {exam.teacher.name}</span>
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href={`/exams/${exam.id}/take`}
                  className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold px-6 py-3 rounded-xl whitespace-nowrap transition-colors shadow-sm"
                >
                  Thi Ngay <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
