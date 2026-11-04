export const instant = false;

import { Navbar } from '@/components/Navbar';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Users, BookOpen, Hash, ChevronRight } from 'lucide-react';
import { JoinClassroomForm } from './JoinClassroomForm';
import { CreateClassroomModal } from './CreateClassroomModal';

export default async function ClassroomsPage() {
  const classrooms = await prisma.classroom.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      teacher: { select: { name: true } },
      _count: { select: { members: true, exams: true } },
    },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
              <Users className="w-8 h-8 text-rose-500" />
              Lớp Học
            </h1>
            <p className="text-slate-500 mt-1">
              Tham gia lớp học bằng mã code hoặc theo dõi tiến trình làm bài của từng lớp.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <CreateClassroomModal />
            <JoinClassroomForm />
          </div>
        </div>

        {classrooms.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <div className="text-5xl mb-4">🏫</div>
            <p>Chưa có lớp học nào.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {classrooms.map((cls) => (
              <Link
                key={cls.id}
                href={`/classrooms/${cls.id}`}
                className="bg-white rounded-2xl border border-slate-200 hover:border-rose-200 hover:shadow-lg transition-all p-6 flex flex-col gap-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-slate-900 text-lg leading-tight mb-1">
                      {cls.name}
                    </h2>
                    {cls.description && (
                      <p className="text-sm text-slate-500 line-clamp-2">{cls.description}</p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 flex-shrink-0 mt-1" />
                </div>

                <div className="flex flex-wrap gap-3 text-sm">
                  <span className="flex items-center gap-1.5 bg-rose-50 text-rose-700 px-3 py-1 rounded-full border border-rose-100 font-semibold">
                    <Hash className="w-3.5 h-3.5" /> {cls.code}
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                    <Users className="w-3.5 h-3.5" /> {cls._count.members} học viên
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                    <BookOpen className="w-3.5 h-3.5" /> {cls._count.exams} đề thi
                  </span>
                </div>

                <p className="text-xs text-slate-400">Giáo viên: {cls.teacher.name}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
