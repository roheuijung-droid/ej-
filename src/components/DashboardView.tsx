import React, { useState } from 'react';
import { Book, LoanRecord, LibraryStats, NavTab } from '../types/library';
import { BookCover } from './BookCover';
import { DueSoonWidget } from './DueSoonWidget';
import { BookRecommendationWidget } from './BookRecommendationWidget';
import {
  BookOpen,
  BookmarkCheck,
  Clock,
  AlertCircle,
  Search,
  ArrowRight,
  FileSpreadsheet,
  RotateCcw,
} from 'lucide-react';

interface DashboardViewProps {
  stats: LibraryStats;
  books: Book[];
  loans: LoanRecord[];
  onOpenBorrow: (book?: Book) => void;
  onOpenReturn: (loan: LoanRecord) => void;
  onExtendLoan: (loanId: string) => void;
  onNavigateTab: (tab: NavTab) => void;
  onSyncGas: () => void;
  isSyncing: boolean;
  lastSyncTime: string | null;
  gasUrl: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  books,
  loans,
  onOpenBorrow,
  onOpenReturn,
  onExtendLoan,
  onNavigateTab,
  onSyncGas,
  isSyncing,
  lastSyncTime,
}) => {
  const [quickQuery, setQuickQuery] = useState('');

  // Active loans currently borrowed or overdue
  const activeLoans = loans.filter((l) => l.status === '대출중' || l.status === '연체');

  // Filtered active loans by quick query
  const filteredActiveLoans = activeLoans.filter((loan) => {
    if (!quickQuery.trim()) return true;
    const q = quickQuery.toLowerCase();
    return (
      loan.bookTitle.toLowerCase().includes(q) ||
      loan.bookId.toLowerCase().includes(q) ||
      loan.borrowerName.toLowerCase().includes(q)
    );
  });

  // Google Sheet books
  const sheetBooks = books.filter((b) => b.isFromGoogleSheet);

  // Helper for D-Day calculation
  const getDDay = (dueDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000);

    if (diffDays < 0) {
      return { text: `연체 ${Math.abs(diffDays)}일`, isOverdue: true, isDueSoon: false };
    }
    if (diffDays === 0) {
      return { text: '오늘 반납', isOverdue: false, isDueSoon: true };
    }
    if (diffDays <= 3) {
      return { text: `D-${diffDays}`, isOverdue: false, isDueSoon: true };
    }
    return { text: `D-${diffDays}`, isOverdue: false, isDueSoon: false };
  };

  const getBook = (bookId: string) => {
    return books.find((b) => b.id === bookId);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Live Sync Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              실시간 동기화 대시보드
            </span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-slate-500">
              구글 시트 연동 도서: <strong className="text-slate-800">{sheetBooks.length}권</strong>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            도서관 대출 및 반납 종합 상황실
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            구글 시트 스프레드시트 데이터와 연동되어 대출·반납 처리가 실시간으로 관리됩니다.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onSyncGas}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-60"
          >
            <FileSpreadsheet className={`w-4 h-4 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? '구글 시트 갱신 중...' : '시트 데이터 동기화'}</span>
          </button>
          <button
            onClick={() => onNavigateTab('sheet-sync')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
          >
            <span>새로운 Code.gs 확인</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4 Core KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Books */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">전체 소장 도서</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {stats.totalBooks}
            </span>
            <span className="text-xs text-slate-500 font-medium">권 보유</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>시트 등록 {sheetBooks.length}권</span>
            <button
              onClick={() => onNavigateTab('books')}
              className="text-blue-600 hover:underline font-medium"
            >
              목록 보기 →
            </button>
          </div>
        </div>

        {/* Available Books */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">대출 가능 도서</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <BookmarkCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700 tabular-nums">
              {stats.availableBooks}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              권 ({stats.totalBooks > 0 ? Math.round((stats.availableBooks / stats.totalBooks) * 100) : 0}%)
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>즉시 대출 가능한 수량</span>
            <button
              onClick={() => onOpenBorrow()}
              className="text-emerald-700 hover:underline font-medium"
            >
              대출하기 +
            </button>
          </div>
        </div>

        {/* Active Loans */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">현재 대출 중</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-700 tabular-nums">
              {stats.loanedBooks}
            </span>
            <span className="text-xs text-slate-500 font-medium">권 대출 중</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>반납 예정 관리</span>
            <button
              onClick={() => onNavigateTab('loans')}
              className="text-blue-600 hover:underline font-medium"
            >
              현황 관리 →
            </button>
          </div>
        </div>

        {/* Overdue / Due Soon */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">반납 기한 임박 & 연체</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-2xl font-bold tabular-nums ${stats.dueSoonBooks > 0 || stats.overdueBooks > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              {stats.dueSoonBooks + stats.overdueBooks}
            </span>
            <span className="text-xs text-slate-500 font-medium">권 관리 필요</span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-rose-600 font-semibold">{stats.overdueBooks}권 연체</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {stats.dueSoonBooks > 0 ? (
              <span className="text-amber-700 font-semibold">아래 '반납 예정' 위젯에서 즉시 확인</span>
            ) : (
              <span>반납 기한 내 정상 대출 중</span>
            )}
          </div>
        </div>
      </div>

      {/* 1. NEW WIDGET: 반납 기한 3일 이내 '반납 예정' 위젯 (강조 표시) */}
      <DueSoonWidget
        loans={loans}
        books={books}
        onOpenReturn={onOpenReturn}
        onExtendLoan={onExtendLoan}
      />

      {/* 2. NEW WIDGET: 사서의 책 추천 위젯 (표지 그림과 함께 표시, 기존 카테고리별 도서현황 대체) */}
      <BookRecommendationWidget
        books={books}
        onOpenBorrow={onOpenBorrow}
        onNavigateToCatalog={() => onNavigateTab('books')}
      />

      {/* 3. Main Split: Active Loans Queue + Google Sheet Live Connect */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Loans & Return Management */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>전체 대출 중인 도서 목록</span>
                  <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {activeLoans.length}건
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  도서별 반납 예정일 및 D-Day를 확인하고 바로 반납 또는 연장 처리할 수 있습니다.
                </p>
              </div>

              {/* Quick Filter Search */}
              <div className="relative w-full sm:w-60">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="도서명, 번호, 대출자 검색..."
                  value={quickQuery}
                  onChange={(e) => setQuickQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Loans Table / List with Book Cover */}
            {filteredActiveLoans.length === 0 ? (
              <div className="py-12 text-center text-slate-500 border border-dashed border-slate-200 rounded-lg">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">
                  {quickQuery ? '검색된 대출 도서가 없습니다.' : '현재 대출 중인 도서가 없습니다.'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  모든 도서가 반납되어 안전하게 서가에 보관 중입니다.
                </p>
                <button
                  onClick={() => onOpenBorrow()}
                  className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  신규 도서 대출 등록
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/70">
                      <th className="py-2.5 px-3 font-semibold">도서 표지 및 정보</th>
                      <th className="py-2.5 px-3 font-semibold">대출자</th>
                      <th className="py-2.5 px-3 font-semibold">대출일 / 반납예정일</th>
                      <th className="py-2.5 px-3 font-semibold">상태</th>
                      <th className="py-2.5 px-3 font-semibold text-right">관리 작업</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredActiveLoans.map((loan) => {
                      const book = getBook(loan.bookId);
                      const dDay = getDDay(loan.dueDate);
                      return (
                        <tr key={loan.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <BookCover
                                title={loan.bookTitle}
                                author={book?.author || '저자 미상'}
                                category={book?.category}
                                coverImage={book?.coverImage}
                                size="sm"
                              />
                              <div>
                                <div className="font-semibold text-slate-900 leading-tight">
                                  {loan.bookTitle}
                                </div>
                                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                  ID: {loan.bookId}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-medium text-slate-900">{loan.borrowerName}</div>
                            <div className="text-[11px] text-slate-500">{loan.borrowerContact}</div>
                          </td>
                          <td className="py-3 px-3 tabular-nums">
                            <div className="text-slate-600">{loan.borrowDate}</div>
                            <div className="text-slate-900 font-medium">{loan.dueDate}</div>
                          </td>
                          <td className="py-3 px-3">
                            {dDay.isOverdue ? (
                              <span className="inline-flex items-center text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                                {dDay.text}
                              </span>
                            ) : dDay.isDueSoon ? (
                              <span className="inline-flex items-center text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                                {dDay.text}
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                {dDay.text}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => onExtendLoan(loan.id)}
                                disabled={loan.renewCount >= 2}
                                title={
                                  loan.renewCount >= 2
                                    ? '최대 연장 횟수(2회) 초과'
                                    : '대출 기간 7일 연장'
                                }
                                className="px-2 py-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-medium transition-colors disabled:opacity-40"
                              >
                                연장 {loan.renewCount > 0 ? `(${loan.renewCount})` : ''}
                              </button>
                              <button
                                onClick={() => onOpenReturn(loan)}
                                className="px-2.5 py-1 text-white bg-blue-600 hover:bg-blue-700 rounded text-[11px] font-semibold transition-colors shadow-2xs"
                              >
                                반납 처리
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>반납 안내 알림은 기한 3일 전 자동 분류됩니다.</span>
              <button
                onClick={() => onNavigateTab('loans')}
                className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1"
              >
                <span>대출·반납 전체 내역 관리</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Google Sheet Source */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">구글 시트 연동 도서</h3>
              </div>
              <button
                onClick={onSyncGas}
                disabled={isSyncing}
                title="새로고침"
                className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              현재 스프레드시트와 실시간 양방향 동기화 중인 도서입니다.
            </p>

            <div className="space-y-2.5">
              {sheetBooks.map((b) => (
                <div
                  key={b.id}
                  className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <BookCover
                      title={b.title}
                      author={b.author}
                      category={b.category}
                      coverImage={b.coverImage}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-900 truncate">{b.title}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <span className="font-mono text-blue-700">{b.id}</span>
                        <span>·</span>
                        <span>{b.author}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    {b.status === '대출가능' ? (
                      <button
                        onClick={() => onOpenBorrow(b)}
                        className="px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors shrink-0"
                      >
                        대출
                      </button>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-200/70 px-1.5 py-0.5 rounded shrink-0">
                        대출중
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span>동기화 상태: 정상 연결됨</span>
              <span className="font-mono">
                {lastSyncTime ? lastSyncTime.split(' ')[1] : '방금 전'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
