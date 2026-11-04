export const instant = false;

import { Navbar } from '@/components/Navbar';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { BookOpen, FileText, ChevronRight } from 'lucide-react';

const typeIcons: Record<string, string> = {
  GRAMMAR: '📐',
  VOCABULARY: '📖',
  DOCUMENT: '📄',
  AUDIO: '🔊',
};

export default async function MaterialsPage() {
  const materials = await prisma.material.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      teacher: { select: { name: true } },
      classroom: { select: { name: true } },
    },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-rose-500" />
              Thư Viện Tài Liệu
            </h1>
            <p className="text-slate-500 mt-1">
              Cẩm nang ngữ pháp, từ vựng TOPIK và bài đọc tiếng Hàn được biên soạn bởi giáo viên.
            </p>
          </div>
          <Link
            href="/materials/new"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-sm"
          >
            + Đăng Tài Liệu Mới
          </Link>
        </div>

        {materials.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <div className="text-5xl mb-4">📚</div>
            <p>Chưa có tài liệu nào.</p>
          </div>
        ) : (
          <div className="grid gap-5">
            {materials.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-rose-200 hover:shadow-md transition-all p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{typeIcons[m.type] ?? '📄'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full border border-slate-200">
                        {m.type}
                      </span>
                      {m.classroom && (
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-200">
                          🏫 {m.classroom.name}
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 mb-1">{m.title}</h2>
                    {m.description && (
                      <p className="text-sm text-slate-500 mb-3">{m.description}</p>
                    )}
                    {m.content && (
                      <div className="bg-slate-50 rounded-xl px-5 py-4 text-sm text-slate-700 korean-text leading-relaxed whitespace-pre-line border border-slate-100 max-h-48 overflow-y-auto">
                        {m.content}
                      </div>
                    )}
                    <p className="text-xs text-slate-400 mt-2">— {m.teacher.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
