import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Trả về học sinh demo đầu tiên (sẽ được thay bằng auth thực)
export async function GET() {
  const student = await prisma.user.findFirst({
    where: { role: 'STUDENT' },
    select: { id: true, name: true, email: true },
  });
  if (!student) return NextResponse.json({ error: 'Chưa có học sinh' }, { status: 404 });
  return NextResponse.json(student);
}
