import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    const classroomCount = await prisma.classroom.count();
    const examCount = await prisma.exam.count();
    const questionCount = await prisma.question.count();
    const submissionCount = await prisma.submission.count();

    const sampleExam = await prisma.exam.findFirst({
      include: {
        classroom: true,
        teacher: { select: { name: true, email: true } },
        questions: {
          include: {
            options: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    return NextResponse.json({
      status: 'ok',
      message: '🇰🇷 HangulMaster Core Backend & DB sẵn sàng hoạt động!',
      stats: {
        users: userCount,
        classrooms: classroomCount,
        exams: examCount,
        questions: questionCount,
        submissions: submissionCount,
      },
      sampleExam: {
        title: sampleExam?.title,
        level: sampleExam?.level,
        teacher: sampleExam?.teacher?.name,
        questionCount: sampleExam?.questions?.length,
      },
    });
  } catch (error) {
    console.error('Lỗi API health:', error);
    return NextResponse.json(
      { status: 'error', message: 'Không thể kết nối cơ sở dữ liệu' },
      { status: 500 }
    );
  }
}
