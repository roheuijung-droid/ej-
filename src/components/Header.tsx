import React, { useState } from 'react';
import { NavTab } from '../types/library';
import { BookOpen, Plus, Menu, X, FileSpreadsheet } from 'lucide-react';

interface HeaderProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenQuickBorrow: () => void;
  isSyncing: boolean;
  onSyncGas: () => void;
  lastSyncTime: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenQuickBorrow,
  isSyncing,
  onSyncGas,
  lastSyncTime,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: NavTab; label: string }[] = [
    { id: 'dashboard', label: '대시보드' },
    { id: 'loans', label: '대출·반납 관리' },
    { id: 'books', label: '도서 목록' },
    { id: 'history', label: '이용 기록' },
    { id: 'sheet-sync', label: '시트 연동' },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark (single line) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-md"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors whitespace-nowrap block">
                스마트 도서관 HUB
              </span>
              <span className="text-[11px] text-slate-500 font-medium leading-none block">
                Google Sheets 실시간 연동
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (single-line, 1-2 word labels) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-3.5 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-blue-700 bg-blue-50/80 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <button
            onClick={onSyncGas}
            disabled={isSyncing}
            title={lastSyncTime ? `마지막 동기화: ${lastSyncTime}` : '구글 시트 즉시 동기화'}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 active:bg-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            <FileSpreadsheet className={`w-3.5 h-3.5 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? '동기화 중...' : '시트 동기화'}</span>
          </button>

          <button
            onClick={onOpenQuickBorrow}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>빠른 대출 등록</span>
          </button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={onOpenQuickBorrow}
            className="p-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            title="빠른 대출"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="메뉴 열기"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation panel */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 animate-in fade-in slide-in-from-top-2">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => {
                onSyncGas();
                setMobileMenuOpen(false);
              }}
              disabled={isSyncing}
              className="text-xs text-slate-600 flex items-center gap-1.5 py-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>구글 시트 즉시 새로고침</span>
            </button>
            {lastSyncTime && (
              <span className="text-[11px] text-slate-600 font-mono">
                {lastSyncTime.split(' ')[1] || lastSyncTime}
              </span>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
