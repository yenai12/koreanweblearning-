import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const classrooms = await prisma.classroom.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      teacher: { select: { name: true } },
      _count: { select: { members: true, exams: true } },
    },
  });
  return NextResponse.json(classrooms);
}

// POST /api/classrooms — Giáo viên tạo lớp học mới
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, code, description } = body;

    if (!name?.trim() || !code?.trim()) {
      return NextResponse.json(
        { error: 'Tên lớp học và mã lớp không được để trống' },
        { status: 400 }
      );
    }

    const cleanCode = code.toUpperCase().trim();

    // Kiểm tra trùng mã
    const existing = await prisma.classroom.findUnique({
      where: { code: cleanCode },
    });
    if (existing) {
      return NextResponse.json(
        { error: `Mã lớp "${cleanCode}" đã tồn tại. Vui lòng chọn mã khác!` },
        { status: 400 }
      );
    }

    const teacher = await prisma.user.findFirst({
      where: { role: 'TEACHER' },
    });
    if (!teacher) {
      return NextResponse.json({ error: 'Không tìm thấy tài khoản giáo viên' }, { status: 404 });
    }

    const classroom = await prisma.classroom.create({
      data: {
        name: name.trim(),
        code: cleanCode,
        description: description?.trim() || null,
        teacherId: teacher.id,
      },
    });

    return NextResponse.json(classroom, { status: 201 });
  } catch (error) {
    console.error('Lỗi tạo lớp học:', error);
    return NextResponse.json({ error: 'Không thể tạo lớp học' }, { status: 500 });
  }
}
