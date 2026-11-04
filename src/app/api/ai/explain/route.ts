import { NextRequest, NextResponse } from 'next/server';
import { explainWrongAnswer } from '@/lib/gemini';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { answerDetailId } = await req.json() as { answerDetailId: string };

    const detail = await prisma.answerDetail.findUnique({
      where: { id: answerDetailId },
      include: {
        question: { include: { options: true } },
        selectedOption: true,
      },
    });

    if (!detail) {
      return NextResponse.json({ error: 'Không tìm thấy câu trả lời' }, { status: 404 });
    }

    if (detail.isCorrect) {
      return NextResponse.json({ feedback: '✅ Câu này bạn đã trả lời đúng rồi!' });
    }

    // Nếu đã có AI feedback, trả về luôn
    if (detail.aiFeedback) {
      return NextResponse.json({ feedback: detail.aiFeedback });
    }

    const correctOpt = detail.question.options.find((o) => o.isCorrect);
    const feedback = await explainWrongAnswer(
      detail.question.content,
      detail.question.passage,
      detail.selectedOption?.text ?? '(Không chọn)',
      correctOpt?.text ?? '(Không rõ)',
      detail.question.explanation
    );

    // Lưu lại vào DB để lần sau không cần gọi AI nữa
    await prisma.answerDetail.update({
      where: { id: answerDetailId },
      data: { aiFeedback: feedback },
    });

    return NextResponse.json({ feedback });
  } catch (err) {
    console.error('AI Explain error:', err);
    return NextResponse.json(
      { error: 'AI đang bận, vui lòng thử lại.' },
      { status: 500 }
    );
  }
}
