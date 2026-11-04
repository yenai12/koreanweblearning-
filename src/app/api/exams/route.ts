import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ExamLevel, QuestionSection } from '@prisma/client';

export async function GET() {
  const exams = await prisma.exam.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
    include: {
      teacher: { select: { name: true } },
      classroom: { select: { name: true, code: true } },
      _count: { select: { questions: true, submissions: true } },
    },
  });
  return NextResponse.json(exams);
}

// POST /api/exams — Giáo viên tạo đề thi mới
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      level = 'TOPIK_I',
      durationMinutes = 30,
      classroomId,
      questions,
    } = body;

    if (!title?.trim() || !questions?.length) {
      return NextResponse.json(
        { error: 'Tiêu đề đề thi và danh sách câu hỏi không được để trống' },
        { status: 400 }
      );
    }

    // Lấy giáo viên mặc định (Thầy Kim)
    const teacher = await prisma.user.findFirst({
      where: { role: 'TEACHER' },
    });
    if (!teacher) {
      return NextResponse.json({ error: 'Không tìm thấy tài khoản giáo viên' }, { status: 404 });
    }

    const totalPoints = questions.reduce(
      (acc: number, q: any) => acc + (Number(q.points) || 10),
      0
    );

    const exam = await prisma.exam.create({
      data: {
        title,
        description,
        level: level as ExamLevel,
        durationMinutes: Number(durationMinutes),
        totalPoints,
        teacherId: teacher.id,
        classroomId: classroomId || null,
        isPublished: true,
        questions: {
          create: questions.map((q: any, qIdx: number) => ({
            order: qIdx + 1,
            section: (q.section as QuestionSection) || QuestionSection.READING,
            title: q.title || null,
            passage: q.passage || null,
            content: q.content,
            points: Number(q.points) || 10,
            explanation: q.explanation || null,
            options: {
              create: q.options.map((opt: any, optIdx: number) => ({
                order: optIdx + 1,
                text: opt.text,
                isCorrect: Boolean(opt.isCorrect),
              })),
            },
          })),
        },
      },
      include: {
        questions: {
          include: { options: true },
        },
      },
    });

    return NextResponse.json(exam, { status: 201 });
  } catch (error) {
    console.error('Lỗi tạo đề thi:', error);
    return NextResponse.json(
      { error: 'Không thể tạo đề thi. Vui lòng kiểm tra lại thông tin.' },
      { status: 500 }
    );
  }
}
