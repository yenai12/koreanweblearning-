'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Plus, Trash2, ArrowLeft, CheckCircle2, Sparkles, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface NewOption {
  text: string;
  isCorrect: boolean;
}

interface NewQuestion {
  section: string;
  title: string;
  passage: string;
  content: string;
  points: number;
  explanation: string;
  options: NewOption[];
}

export default function CreateExamPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState('TOPIK_I');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [classroomId, setClassroomId] = useState('');
  const [classrooms, setClassrooms] = useState<{ id: string; name: string; code: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/classrooms')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setClassrooms(data);
      })
      .catch(console.error);
  }, []);

  const [questions, setQuestions] = useState<NewQuestion[]>([
    {
      section: 'READING',
      title: 'Đọc hiểu từ vựng',
      passage: '',
      content: '다음 빈칸에 알맞은 것을 고르십시오.',
      points: 20,
      explanation: '',
      options: [
        { text: '사과 (Quả táo)', isCorrect: true },
        { text: '우유 (Sữa)', isCorrect: false },
        { text: '물 (Nước)', isCorrect: false },
        { text: '빵 (Bánh mì)', isCorrect: false },
      ],
    },
  ]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        section: 'READING',
        title: '',
        passage: '',
        content: '',
        points: 20,
        explanation: '',
        options: [
          { text: '', isCorrect: true },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
        ],
      },
    ]);
  };

  const removeQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const updateQuestion = (idx: number, field: keyof NewQuestion, val: any) => {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], [field]: val };
    setQuestions(updated);
  };

  const updateOptionText = (qIdx: number, optIdx: number, text: string) => {
    const updated = [...questions];
    updated[qIdx].options[optIdx].text = text;
    setQuestions(updated);
  };

  const setCorrectOption = (qIdx: number, optIdx: number) => {
    const updated = [...questions];
    updated[qIdx].options = updated[qIdx].options.map((opt, i) => ({
      ...opt,
      isCorrect: i === optIdx,
    }));
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Vui lòng nhập tên đề thi');
      return;
    }
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].content.trim()) {
        setError(`Câu hỏi số ${i + 1} chưa có nội dung`);
        return;
      }
      const hasEmptyOpt = questions[i].options.some((o) => !o.text.trim());
      if (hasEmptyOpt) {
        setError(`Câu hỏi số ${i + 1} có đáp án còn để trống`);
        return;
      }
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          level,
          durationMinutes,
          classroomId: classroomId || null,
          questions,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Lỗi khi tạo đề thi');
      }

      const created = await res.json();
      router.push(`/exams/${created.id}/take`);
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối máy chủ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/exams"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách đề thi
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2 flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-rose-500" />
            Tạo Đề Thi Tiếng Hàn Mới
          </h1>
          <p className="text-slate-500 text-sm mb-6">
            Soạn thảo câu hỏi trắc nghiệm, đoạn văn đọc hiểu Hangul và lời giải thích ngữ pháp.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Tên Đề Thi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Đề Thi Thử TOPIK I - Đọc Hiểu Tháng 11"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-rose-400 outline-none text-slate-900 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Cấp Độ (TOPIK Level)
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-rose-400 outline-none text-slate-900 text-sm font-semibold bg-white"
                >
                  <option value="TOPIK_I">TOPIK I (Cấp 1-2)</option>
                  <option value="TOPIK_II">TOPIK II (Cấp 3-6)</option>
                  <option value="BASIC">Sơ Cấp Cơ Bản</option>
                  <option value="INTERMEDIATE">Trung Cấp</option>
                  <option value="ADVANCED">Cao Cấp</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Thời Gian Làm Bài (Phút)
                </label>
                <input
                  type="number"
                  min={5}
                  max={180}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-rose-400 outline-none text-slate-900 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Gán Vào Lớp Học (Tùy chọn)
                </label>
                <select
                  value={classroomId}
                  onChange={(e) => setClassroomId(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-rose-400 outline-none text-slate-900 text-sm font-semibold bg-white"
                >
                  <option value="">🌐 Đề thi tự do (Công khai toàn trường)</option>
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id}>
                      🏫 {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Mô Tả Đề Thi
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả phạm vi từ vựng, ngữ pháp bài thi..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-rose-400 outline-none text-slate-900 text-sm font-medium"
                />
              </div>
            </div>

            {/* Questions List */}
            <div className="pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">
                  Danh Sách Câu Hỏi ({questions.length})
                </h2>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 px-3.5 py-2 rounded-xl transition-colors"
                >
                  <Plus className="w-4 h-4" /> Thêm Câu Hỏi
                </button>
              </div>

              <div className="space-y-6">
                {questions.map((q, qIdx) => (
                  <div
                    key={qIdx}
                    className="p-5 border-2 border-slate-200 rounded-2xl bg-white space-y-4 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-800 text-base">
                        Câu {qIdx + 1}
                      </span>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(qIdx)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-slate-500 font-semibold mb-1">
                          Phân loại kỹ năng
                        </label>
                        <select
                          value={q.section}
                          onChange={(e) => updateQuestion(qIdx, 'section', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white"
                        >
                          <option value="READING">📖 Đọc hiểu (Reading)</option>
                          <option value="VOCAB_GRAMMAR">📚 Từ vựng & Ngữ pháp</option>
                          <option value="LISTENING">🔊 Nghe hiểu (Listening)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 font-semibold mb-1">
                          Tiêu đề/Dạng bài
                        </label>
                        <input
                          type="text"
                          value={q.title}
                          onChange={(e) => updateQuestion(qIdx, 'title', e.target.value)}
                          placeholder="Ví dụ: Chọn từ đối nghĩa, Điền liên từ..."
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 font-semibold mb-1">
                          Điểm số
                        </label>
                        <input
                          type="number"
                          value={q.points}
                          onChange={(e) => updateQuestion(qIdx, 'points', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    {/* Passage */}
                    <div>
                      <label className="block text-xs text-slate-500 font-semibold mb-1">
                        Đoạn văn đọc hiểu (Nếu có bài đọc Hangul)
                      </label>
                      <textarea
                        rows={2}
                        value={q.passage}
                        onChange={(e) => updateQuestion(qIdx, 'passage', e.target.value)}
                        placeholder="Ví dụ: 저는 주말마다 친구를 만납니다..."
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs korean-text"
                      />
                    </div>

                    {/* Question Content */}
                    <div>
                      <label className="block text-xs text-slate-700 font-bold mb-1">
                        Nội dung câu hỏi tiếng Hàn <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={q.content}
                        onChange={(e) => updateQuestion(qIdx, 'content', e.target.value)}
                        placeholder="Ví dụ: 무엇에 대한 이야기입니까? 알맞은 것을 고르십시오."
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm korean-text font-semibold"
                      />
                    </div>

                    {/* 4 Options */}
                    <div>
                      <label className="block text-xs text-slate-700 font-bold mb-2">
                        4 Lựa chọn (Chọn nút tròn để chỉ định đáp án đúng)
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {q.options.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className={`flex items-center gap-2 p-2 border rounded-xl transition-all ${
                              opt.isCorrect
                                ? 'border-green-400 bg-green-50'
                                : 'border-slate-200 bg-slate-50'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => setCorrectOption(qIdx, optIdx)}
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                                opt.isCorrect
                                  ? 'border-green-600 bg-green-600 text-white'
                                  : 'border-slate-300 bg-white text-slate-400 hover:border-slate-400'
                              }`}
                            >
                              {optIdx + 1}
                            </button>
                            <input
                              type="text"
                              required
                              value={opt.text}
                              onChange={(e) => updateOptionText(qIdx, optIdx, e.target.value)}
                              placeholder={`Đáp án lựa chọn ${optIdx + 1}...`}
                              className="flex-1 bg-transparent border-none text-xs outline-none korean-text font-medium"
                            />
                            {opt.isCorrect && (
                              <span className="text-[11px] font-bold text-green-700 pr-1">
                                Đúng ✓
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Explanation */}
                    <div>
                      <label className="block text-xs text-slate-500 font-semibold mb-1">
                        💡 Giải thích ngữ pháp & lý do chọn đáp án
                      </label>
                      <input
                        type="text"
                        value={q.explanation}
                        onChange={(e) => updateQuestion(qIdx, 'explanation', e.target.value)}
                        placeholder="Ví dụ: 사과 và 바나나 đều là 과일 (hoa quả), nên đáp án đúng là 과일..."
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs korean-text"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={addQuestion}
                className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm"
              >
                + Thêm câu nữa
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-md transition-all hover:scale-105 disabled:opacity-50"
              >
                {submitting ? 'Đang tạo...' : 'Xuất Bản Đề Thi →'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
