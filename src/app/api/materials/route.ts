import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const materials = await prisma.material.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      teacher: { select: { name: true } },
      classroom: { select: { name: true } },
    },
  });
  return NextResponse.json(materials);
}

// POST /api/materials — Đăng tài liệu học tập mới
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, content, type = 'GRAMMAR', classroomId } = body;

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: 'Tiêu đề và nội dung tài liệu không được để trống' },
        { status: 400 }
      );
    }

    const teacher = await prisma.user.findFirst({
      where: { role: 'TEACHER' },
    });
    if (!teacher) {
      return NextResponse.json({ error: 'Không tìm thấy tài khoản giáo viên' }, { status: 404 });
    }

    const material = await prisma.material.create({
      data: {
        title,
        description,
        content,
        type,
        teacherId: teacher.id,
        classroomId: classroomId || null,
      },
    });

    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    console.error('Lỗi tạo tài liệu:', error);
    return NextResponse.json(
      { error: 'Không thể tạo tài liệu' },
      { status: 500 }
    );
  }
}
