'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { ArrowLeft, BookOpen, Send } from 'lucide-react';
import Link from 'next/link';

export default function CreateMaterialPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('GRAMMAR');
  const [content, setContent] = useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Tiêu đề và nội dung tài liệu không được để trống');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          type,
          content,
          classroomId: classroomId || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Lỗi khi đăng tài liệu');
      }

      router.push('/materials');
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối máy chủ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Link
          href="/materials"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại thư viện tài liệu
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2 flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-rose-500" />
            Đăng Tài Liệu Học Tiếng Hàn
          </h1>
          <p className="text-slate-500 text-sm mb-6">
            Soạn bài giảng ngữ pháp, bảng từ vựng hoặc cẩm nang ôn thi TOPIK cho học viên.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Tiêu Đề Tài Liệu <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Phân biệt cấu trúc -아/어서 và -(으)니까"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-rose-400 outline-none text-slate-900 text-sm font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Phân Loại
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-rose-400 outline-none text-slate-900 text-sm font-semibold bg-white"
                >
                  <option value="GRAMMAR">📐 Ngữ Pháp (Grammar)</option>
                  <option value="VOCABULARY">📖 Từ Vựng (Vocabulary)</option>
                  <option value="DOCUMENT">📄 Tài Liệu Tổng Hợp (Document)</option>
                  <option value="AUDIO">🔊 Bài Nghe / Luyện Âm</option>
                </select>
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
                  <option value="">🌐 Tài liệu mở (Công khai toàn trường)</option>
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id}>
                      🏫 {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Tóm Tắt Ngắn
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả ngắn về nội dung cẩm nang này..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-rose-400 outline-none text-slate-900 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Nội Dung Bài Học (Hỗ trợ Markdown & Tiếng Hàn) <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={10}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Ví dụ:&#10;### 1. Ý nghĩa:&#10;- -아/어서: biểu thị nguyên nhân khách quan, không dùng với đuôi mệnh lệnh...&#10;- -(으)니까: biểu thị nguyên nhân chủ quan, dùng được với -(으)세요..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-rose-400 outline-none text-slate-900 text-sm korean-text leading-relaxed font-mono"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-md hover:scale-105 disabled:opacity-50 text-sm"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Đang lưu...' : 'Đăng Tài Liệu Lên Web'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
