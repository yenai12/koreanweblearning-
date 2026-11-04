import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      teacher: { select: { name: true } },
      classroom: { select: { name: true, code: true } },
      questions: {
        orderBy: { order: 'asc' },
        include: { options: { orderBy: { order: 'asc' } } },
      },
    },
  });
  if (!exam) return NextResponse.json({ error: 'Không tìm thấy đề thi' }, { status: 404 });
  return NextResponse.json(exam);
}
