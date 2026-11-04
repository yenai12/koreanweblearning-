import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/exams/[id]/submit — nộp bài
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: examId } = await params;
  const body = await req.json();
  // body: { studentId: string, answers: { questionId, selectedOptionId }[] }
  const { studentId, answers } = body as {
    studentId: string;
    answers: { questionId: string; selectedOptionId: string }[];
  };

  if (!studentId || !answers?.length) {
    return NextResponse.json({ error: 'Thiếu thông tin bài làm' }, { status: 400 });
  }

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      questions: { include: { options: true } },
    },
  });
  if (!exam) return NextResponse.json({ error: 'Đề thi không tồn tại' }, { status: 404 });

  let totalScore = 0;
  const details: {
    questionId: string;
    selectedOptionId: string | null;
    isCorrect: boolean;
    pointsAwarded: number;
  }[] = [];

  for (const ans of answers) {
    const question = exam.questions.find((q) => q.id === ans.questionId);
    if (!question) continue;
    const selectedOption = question.options.find((o) => o.id === ans.selectedOptionId);
    const isCorrect = selectedOption?.isCorrect ?? false;
    const pointsAwarded = isCorrect ? question.points : 0;
    totalScore += pointsAwarded;
    details.push({
      questionId: question.id,
      selectedOptionId: ans.selectedOptionId ?? null,
      isCorrect,
      pointsAwarded,
    });
  }

  const maxScore = exam.questions.reduce((s, q) => s + q.points, 0);
  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

  const submission = await prisma.submission.create({
    data: {
      examId,
      studentId,
      score: totalScore,
      maxScore,
      percentage,
      passed: percentage >= 60,
      submittedAt: new Date(),
      details: {
        create: details,
      },
    },
    include: { details: { include: { question: true, selectedOption: true } } },
  });

  return NextResponse.json(submission);
}
