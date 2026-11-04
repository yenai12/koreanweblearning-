export const instant = false;

import { Suspense } from 'react';
import TakeExamContent from './TakeExamContent';

export default async function TakeExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="text-5xl mb-4 animate-bounce">🇰🇷</div>
            <p className="text-slate-600 font-bold">Đang chuẩn bị đề thi...</p>
          </div>
        </div>
      }
    >
      <TakeExamContent examId={id} />
    </Suspense>
  );
}
