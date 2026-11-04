'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, BookOpen, Users, FileText, Bot, Plus } from 'lucide-react';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

function NavLink({ href, children, className = '', onClick }: NavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`text-slate-600 hover:text-rose-600 font-bold transition-colors duration-150 ${className}`}
    >
      {children}
    </Link>
  );
}

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <span className="text-2xl p-1 bg-rose-50 rounded-xl border border-rose-100">🇰🇷</span>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg text-slate-900 leading-tight">
              HangulMaster
            </span>
            <span className="text-[10px] text-rose-600 font-bold tracking-wider uppercase">
              TOPIK & AI Tutor
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-sm">
          <NavLink href="/exams">Đề Thi TOPIK</NavLink>
          <NavLink href="/classrooms">Lớp Học</NavLink>
          <NavLink href="/materials">Thư Viện Tài Liệu</NavLink>
          <NavLink href="/chat" className="flex items-center gap-1.5 text-rose-600">
            <Bot className="w-4 h-4" /> AI Thầy Kim
          </NavLink>
        </nav>

        {/* Action button */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/exams"
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl transition-all shadow-sm hover:scale-105"
          >
            Làm Bài Thi →
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col space-y-2 text-sm font-semibold">
            <Link
              href="/exams"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-700"
            >
              <BookOpen className="w-4 h-4 text-rose-500" /> Đề Thi TOPIK
            </Link>
            <Link
              href="/classrooms"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-700"
            >
              <Users className="w-4 h-4 text-blue-500" /> Quản Lý Lớp Học
            </Link>
            <Link
              href="/materials"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-700"
            >
              <FileText className="w-4 h-4 text-green-500" /> Thư Viện Tài Liệu
            </Link>
            <Link
              href="/chat"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-rose-50 text-rose-700 font-bold"
            >
              <Bot className="w-4 h-4 text-rose-600" /> AI Trợ Lý Tiếng Hàn
            </Link>
          </div>
          <div className="pt-2 border-t border-slate-100 flex gap-2">
            <Link
              href="/exams/new"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700"
            >
              + Đăng Đề Thi
            </Link>
            <Link
              href="/exams"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center py-2.5 rounded-xl bg-rose-600 text-xs font-bold text-white shadow-sm"
            >
              Thi Ngay
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
