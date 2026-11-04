import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sub = await prisma.submission.findUnique({
    where: { id },
    include: {
      exam: { select: { title: true, level: true, durationMinutes: true } },
      student: { select: { name: true, email: true } },
      details: {
        include: {
          question: { include: { options: { orderBy: { order: 'asc' } } } },
          selectedOption: true,
        },
        orderBy: { question: { order: 'asc' } },
      },
    },
  });
  if (!sub) return NextResponse.json({ error: 'Không tìm thấy bài làm' }, { status: 404 });
  return NextResponse.json(sub);
}
