import type { Metadata } from "next";
import { Inter, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { AIChatWidget } from "@/components/AIChatWidget";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-kr",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "HangulMaster - Nền Tảng Học & Luyện Thi Tiếng Hàn TOPIK Thông Minh",
  description: "Ôn tập đề thi TOPIK, phòng thi trực tuyến, trợ lý AI tiếng Hàn và phân tích kết quả theo lớp học.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${inter.variable} ${notoSansKR.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900 selection:bg-rose-100 selection:text-rose-700">
        <div className="flex-1 flex flex-col">{children}</div>
        <AIChatWidget />
      </body>
    </html>
  );
}
