'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Hash, Loader2 } from 'lucide-react';

export function JoinClassroomForm() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Lấy studentId demo
      const userRes = await fetch('/api/users/demo').then((r) => r.json());
      const studentId = userRes?.id;
      if (!studentId) throw new Error('Chưa có tài khoản học sinh');

      const res = await fetch('/api/classrooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, studentId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Lỗi không xác định');
      } else if (data.alreadyMember) {
        setSuccess(`Bạn đã là thành viên lớp "${data.classroom.name}" rồi!`);
        setTimeout(() => router.push(`/classrooms/${data.classroom.id}`), 1200);
      } else {
        setSuccess(`✅ Đã tham gia lớp "${data.classroom.name}" thành công!`);
        setTimeout(() => router.push(`/classrooms/${data.classroom.id}`), 1200);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleJoin} className="flex flex-col gap-2 w-full md:w-auto">
      <div className="flex gap-2">
        <div className="relative">
          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Nhập mã lớp... (vd: TOPIK2026)"
            className="pl-9 pr-4 py-2.5 border-2 border-slate-200 focus:border-rose-400 rounded-xl text-sm outline-none w-56 font-mono font-semibold uppercase tracking-wider transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Vào Lớp
        </button>
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      {success && <p className="text-xs text-green-600 font-medium">{success}</p>}
    </form>
  );
}
