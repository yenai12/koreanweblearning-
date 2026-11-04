import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export const KOREAN_TUTOR_SYSTEM = `Bạn là 선생님 Kim — giáo viên tiếng Hàn bản xứ giàu kinh nghiệm, chuyên dạy cho người Việt học TOPIK.
Phong cách: thân thiện, dễ hiểu, dùng ví dụ thực tế.
Quy tắc:
- Luôn trả lời bằng tiếng Việt, kèm ví dụ tiếng Hàn (có phiên âm Romaja nếu cần).
- Khi giải thích ngữ pháp: nêu cấu trúc → nghĩa → ví dụ → mẹo ghi nhớ.
- Khi học sinh hỏi từ vựng: cho nghĩa, ví dụ câu, từ liên quan.
- Khi chấm bài: chỉ rõ sai ở đâu, vì sao sai, đáp án đúng là gì.
- Dùng emoji phù hợp để bài giảng sinh động hơn 🎯📚✨
- Giới hạn mỗi câu trả lời ngắn gọn, tối đa 300 từ.`;

const PRIMARY_MODEL = 'gemini-3.5-flash-lite';
const FALLBACK_MODELS = ['gemini-3.8-flash', 'gemini-flash-lite-latest'];

export async function chatWithKoreanTutor(
  messages: { role: 'user' | 'model'; text: string }[],
  newMessage: string
): Promise<string> {
  const models = [PRIMARY_MODEL, ...FALLBACK_MODELS];
  let lastError: any = null;

  for (const model of models) {
    try {
      const chat = genAI.chats.create({
        model,
        config: { systemInstruction: KOREAN_TUTOR_SYSTEM },
        history: messages.map((m) => ({
          role: m.role,
          parts: [{ text: m.text }],
        })),
      });

      const response = await chat.sendMessage({ message: newMessage });
      return response.text ?? '(Không có phản hồi)';
    } catch (err) {
      lastError = err;
      console.warn(`Model ${model} failed, trying fallback...`, err);
    }
  }

  throw lastError ?? new Error('Không thể kết nối mô hình AI');
}

export async function explainWrongAnswer(
  questionContent: string,
  passage: string | null,
  selectedOptionText: string,
  correctOptionText: string,
  existingExplanation: string | null
): Promise<string> {
  const prompt = `Học sinh làm bài thi tiếng Hàn và trả lời sai câu sau:

📌 Câu hỏi: ${questionContent}
${passage ? `📄 Đoạn văn: ${passage}` : ''}
❌ Học sinh chọn: "${selectedOptionText}"
✅ Đáp án đúng: "${correctOptionText}"
${existingExplanation ? `📝 Gợi ý có sẵn: ${existingExplanation}` : ''}

Hãy giải thích chi tiết:
1. Vì sao đáp án học sinh sai
2. Phân tích ngữ pháp/từ vựng liên quan
3. Vì sao đáp án đúng là chính xác
4. Mẹo để không nhầm lần sau`;

  const models = [PRIMARY_MODEL, ...FALLBACK_MODELS];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await genAI.models.generateContent({
        model,
        config: { systemInstruction: KOREAN_TUTOR_SYSTEM },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      return response.text ?? '(Không thể tạo giải thích)';
    } catch (err) {
      lastError = err;
      console.warn(`Model ${model} explain failed, trying fallback...`, err);
    }
  }

  throw lastError ?? new Error('Không thể tạo giải thích từ AI');
}
