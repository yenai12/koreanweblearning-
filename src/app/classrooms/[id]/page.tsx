export const instant = false;

import { Navbar } from '@/components/Navbar';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Users, BookOpen, CheckCircle2, XCircle, Hash,
  TrendingUp, Trophy, AlertCircle, ChevronRight,
} from 'lucide-react';

export default async function ClassroomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const classroom = await prisma.classroom.findUnique({
    where: { id },
    include: {
      teacher: { select: { name: true } },
      members: {
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      exams: {
        where: { isPublished: true },
        include: {
          _count: { select: { questions: true } },
          submissions: {
            select: {
              id: true,
              studentId: true,
              score: true,
              maxScore: true,
              percentage: true,
              passed: true,
            },
          },
        },
      },
    },
  });

  if (!classroom) notFound();

  const totalStudents = classroom.members.length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 mb-2">{classroom.name}</h1>
              {classroom.description && (
                <p className="text-slate-500 mb-4">{classroom.description}</p>
              )}
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="flex items-center gap-1.5 bg-rose-50 text-rose-700 px-3 py-1.5 rounded-full border border-rose-100 font-bold">
                  <Hash className="w-3.5 h-3.5" /> Mã lớp: {classroom.code}
                </span>
                <span className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                  <Users className="w-3.5 h-3.5" /> {totalStudents} học viên
                </span>
                <span className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                  <BookOpen className="w-3.5 h-3.5" /> {classroom.exams.length} đề thi
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-3">Giáo viên: {classroom.teacher.name}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Exam Analytics */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-rose-500" /> Thống Kê Đề Thi
            </h2>
            <div className="space-y-4">
              {classroom.exams.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
                  <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Chưa có đề thi nào trong lớp.</p>
                </div>
              ) : (
                classroom.exams.map((exam) => {
                  const studentIds = classroom.members.map((m) => m.student.id);
                  // Lấy 1 submission mới nhất mỗi học sinh
                  const submittedIds = new Set(exam.submissions.map((s) => s.studentId));
                  const doneCount = studentIds.filter((sid) => submittedIds.has(sid)).length;
                  const notDoneCount = totalStudents - doneCount;
                  const donePercent = totalStudents > 0 ? Math.round((doneCount / totalStudents) * 100) : 0;

                  const submissionsForExam = exam.submissions;
                  const avgScore =
                    submissionsForExam.length > 0
                      ? submissionsForExam.reduce((s, sub) => s + sub.percentage, 0) /
                        submissionsForExam.length
                      : null;
                  const passedCount = submissionsForExam.filter((s) => s.passed).length;

                  return (
                    <div
                      key={exam.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5"
                    >
                      <div className="flex items-start justify-between gap-2 mb-4">
                        <h3 className="font-bold text-slate-800 text-sm leading-tight">
                          {exam.title}
                        </h3>
                        <Link
                          href={`/exams/${exam.id}/take`}
                          className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-0.5 whitespace-nowrap"
                        >
                          Thi <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>

                      {/* Completion Rate */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                          <span>Tỉ lệ hoàn thành</span>
                          <span>{donePercent}%</span>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-rose-500 rounded-full transition-all"
                            style={{ width: `${donePercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Stats row */}
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-green-50 rounded-xl py-2 border border-green-100">
                          <div className="font-bold text-green-700 text-base">{doneCount}</div>
                          <div className="text-green-600">Đã làm</div>
                        </div>
                        <div className="bg-red-50 rounded-xl py-2 border border-red-100">
                          <div className="font-bold text-red-600 text-base">{notDoneCount}</div>
                          <div className="text-red-500">Chưa làm</div>
                        </div>
                        <div className="bg-blue-50 rounded-xl py-2 border border-blue-100">
                          <div className="font-bold text-blue-700 text-base">
                            {avgScore != null ? `${avgScore.toFixed(0)}%` : '—'}
                          </div>
                          <div className="text-blue-600">TB điểm</div>
                        </div>
                      </div>

                      {submissionsForExam.length > 0 && (
                        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                          <Trophy className="w-3.5 h-3.5 text-amber-400" />
                          <span>
                            <span className="font-semibold text-green-600">{passedCount}</span> học sinh đạt /{' '}
                            <span className="font-semibold text-red-500">
                              {submissionsForExam.length - passedCount}
                            </span>{' '}
                            chưa đạt
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Student List */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-rose-500" /> Danh Sách Học Viên
            </h2>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {classroom.members.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Chưa có học viên nào.</p>
                  <p className="text-xs mt-1">Chia sẻ mã lớp <strong className="text-rose-600">{classroom.code}</strong> cho học sinh!</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {classroom.members.map((member, idx) => {
                    const student = member.student;
                    // Tính số đề đã làm
                    const examIds = new Set(classroom.exams.map((e) => e.id));
                    const doneSubs = classroom.exams
                      .flatMap((e) => e.submissions)
                      .filter((s) => s.studentId === student.id);
                    const doneExamIds = new Set(
                      classroom.exams
                        .filter((e) => e.submissions.some((s) => s.studentId === student.id))
                        .map((e) => e.id)
                    );
                    const doneCount = doneExamIds.size;
                    const totalExams = classroom.exams.length;
                    const avgPct =
                      doneSubs.length > 0
                        ? doneSubs.reduce((s, sub) => s + sub.percentage, 0) / doneSubs.length
                        : null;

                    return (
                      <div key={member.studentId} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                        <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-sm font-bold text-rose-600 flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 text-sm truncate">{student.name}</p>
                          <p className="text-xs text-slate-400 truncate">{student.email}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-bold text-slate-700">
                            {doneCount}/{totalExams} đề
                          </div>
                          {avgPct != null ? (
                            <div className="flex items-center gap-1.5 justify-end">
                              <span
                                className={`text-xs font-semibold ${
                                  avgPct >= 80
                                    ? 'text-green-600'
                                    : avgPct >= 60
                                    ? 'text-blue-600'
                                    : 'text-red-500'
                                }`}
                              >
                                TB {avgPct.toFixed(0)}%
                              </span>
                              {doneSubs[0] && (
                                <Link
                                  href={`/submissions/${doneSubs[0].id}`}
                                  className="text-[11px] text-rose-600 hover:underline font-semibold"
                                  title="Xem bài thi gần nhất"
                                >
                                  (Xem bài)
                                </Link>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-slate-400">Chưa làm bài</div>
                          )}
                        </div>
                        {doneCount === totalExams && totalExams > 0 ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                        ) : doneCount === 0 ? (
                          <AlertCircle className="w-5 h-5 text-slate-300 flex-shrink-0" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-blue-400 flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
