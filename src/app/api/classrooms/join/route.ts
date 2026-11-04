import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/classrooms/join — học sinh nhập mã tham gia lớp
export async function POST(req: NextRequest) {
  const { code, studentId } = await req.json() as { code: string; studentId: string };

  if (!code?.trim() || !studentId) {
    return NextResponse.json({ error: 'Cần mã lớp và ID học sinh' }, { status: 400 });
  }

  const classroom = await prisma.classroom.findUnique({ where: { code: code.toUpperCase().trim() } });
  if (!classroom) {
    return NextResponse.json({ error: 'Mã lớp không đúng. Vui lòng kiểm tra lại!' }, { status: 404 });
  }

  // Kiểm tra đã vào lớp chưa
  const existing = await prisma.classroomMember.findUnique({
    where: { classroomId_studentId: { classroomId: classroom.id, studentId } },
  });
  if (existing) {
    return NextResponse.json({ classroom, alreadyMember: true });
  }

  await prisma.classroomMember.create({
    data: { classroomId: classroom.id, studentId },
  });

  return NextResponse.json({ classroom, alreadyMember: false });
}
