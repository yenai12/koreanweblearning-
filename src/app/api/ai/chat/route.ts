import { NextRequest, NextResponse } from 'next/server';
import { chatWithKoreanTutor } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, message } = body as {
      messages: { role: 'user' | 'model'; text: string }[];
      message: string;
    };

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Tin nhắn không được để trống' }, { status: 400 });
    }

    const reply = await chatWithKoreanTutor(messages ?? [], message);
    return NextResponse.json({ reply });
  } catch (err) {
    console.error('AI Chat error:', err);
    return NextResponse.json(
      { error: 'AI đang bận, vui lòng thử lại sau ít giây.' },
      { status: 500 }
    );
  }
}
