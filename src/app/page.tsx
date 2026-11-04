import { Navbar } from '@/components/Navbar';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="flex-1 bg-gradient-to-br from-rose-50 via-white to-orange-50 flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="mb-4 text-6xl">🇰🇷</div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
          HangulMaster
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mb-2">
          Nền tảng học và luyện thi tiếng Hàn thông minh — TOPIK I & II, từ vựng,
          ngữ pháp và chấm điểm tự động bằng{' '}
          <span className="text-rose-600 font-semibold">AI Gemini miễn phí</span>.
        </p>
        <p className="text-slate-400 mb-10 korean-text text-lg">한국어를 즐겁게 배워요! 🎓</p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/exams"
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-8 py-3 rounded-xl text-lg shadow-lg shadow-rose-200 transition-all hover:scale-105"
          >
            Làm Đề Thi Thử →
          </Link>
          <Link
            href="/classrooms"
            className="bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-800 font-bold px-8 py-3 rounded-xl text-lg transition-all hover:scale-105"
          >
            Vào Lớp Học
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <Link
              key={f.title}
              href={f.href}
              className="group bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-2xl p-6 flex flex-col gap-3 transition-all hover:shadow-md"
            >
              <div className="text-3xl">{f.icon}</div>
              <h3 className="font-bold text-slate-900 group-hover:text-rose-700">{f.title}</h3>
              <p className="text-sm text-slate-500">{f.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 px-4 bg-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { n: 'TOPIK I & II', label: 'Cấp độ đề thi' },
            { n: 'AI Gemini', label: 'Chấm bài & Giải thích' },
            { n: '100%', label: 'Miễn phí' },
            { n: '실시간', label: 'Chấm điểm tức thì' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-extrabold text-rose-400 korean-text">{s.n}</div>
              <div className="text-slate-400 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-slate-800 text-slate-400 text-sm text-center py-6">
        © 2026 HangulMaster • Học tiếng Hàn thông minh cùng AI
      </footer>
    </div>
  );
}

const features = [
  {
    icon: '📝',
    title: 'Đề Thi Thực Chiến',
    desc: 'Làm đề thi thử TOPIK chuẩn cấu trúc, có đồng hồ bấm giờ và nộp bài tự động.',
    href: '/exams',
  },
  {
    icon: '🤖',
    title: 'AI Trợ Lý Tiếng Hàn',
    desc: 'Hỏi đáp bất kỳ câu hỏi nào về từ vựng, ngữ pháp, cách dùng qua AI Gemini miễn phí.',
    href: '/chat',
  },
  {
    icon: '📊',
    title: 'Chấm Điểm & Phân Tích',
    desc: 'Kết quả thi ngay tức thì, AI giải thích từng câu sai và chỉ ra cách ghi nhớ đúng.',
    href: '/exams',
  },
  {
    icon: '🏫',
    title: 'Lớp Học Riêng',
    desc: 'Giáo viên tạo lớp bằng mã code, theo dõi tiến trình và tỉ lệ học sinh toàn lớp.',
    href: '/classrooms',
  },
];
