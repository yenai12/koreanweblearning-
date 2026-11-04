import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/classrooms/[id] — chi tiết lớp học + thống kê
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const classroom = await prisma.classroom.findUnique({
    where: { id },
    include: {
      teacher: { select: { name: true, email: true } },
      members: {
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              submissions: {
                where: { exam: { classroomId: id } },
                select: { score: true, maxScore: true, percentage: true, submittedAt: true, examId: true },
                orderBy: { submittedAt: 'desc' },
              },
            },
          },
        },
      },
      exams: {
        where: { isPublished: true },
        include: {
          _count: { select: { questions: true, submissions: true } },
          submissions: {
            select: { score: true, maxScore: true, percentage: true, passed: true, studentId: true },
          },
        },
      },
    },
  });

  if (!classroom) {
    return NextResponse.json({ error: 'Không tìm thấy lớp học' }, { status: 404 });
  }

  return NextResponse.json(classroom);
}
