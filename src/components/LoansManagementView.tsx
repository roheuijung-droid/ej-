import React, { useState } from 'react';
import { LoanRecord, Book } from '../types/library';
import { BookCover } from './BookCover';
import {
  Search,
  RotateCcw,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  User,
  Plus,
  Filter,
} from 'lucide-react';

interface LoansManagementViewProps {
  loans: LoanRecord[];
  books: Book[];
  onOpenBorrow: () => void;
  onOpenReturn: (loan: LoanRecord) => void;
  onExtendLoan: (loanId: string) => void;
}

type LoanFilter = 'active' | 'due-soon' | 'overdue' | 'returned' | 'all';

export const LoansManagementView: React.FC<LoansManagementViewProps> = ({
  loans,
  books,
  onOpenBorrow,
  onOpenReturn,
  onExtendLoan,
}) => {
  const [filter, setFilter] = useState<LoanFilter>('active');
  const [searchQuery, setSearchQuery] = useState('');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Helper for D-Day calculation
  const getDDay = (dueDateStr: string, isReturned: boolean) => {
    if (isReturned) {
      return { text: '반납 완료', isReturned: true, isOverdue: false, isDueSoon: false };
    }
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000);

    if (diffDays < 0) {
      return { text: `연체 ${Math.abs(diffDays)}일`, isReturned: false, isOverdue: true, isDueSoon: false };
    }
    if (diffDays === 0) {
      return { text: '오늘 반납', isReturned: false, isOverdue: false, isDueSoon: true };
    }
    if (diffDays <= 3) {
      return { text: `D-${diffDays}`, isReturned: false, isOverdue: false, isDueSoon: true };
    }
    return { text: `D-${diffDays}`, isReturned: false, isOverdue: false, isDueSoon: false };
  };

  const filteredLoans = loans.filter((loan) => {
    const isReturned = loan.status === '반납완료';
    const due = new Date(loan.dueDate);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000);
    const isOverdue = !isReturned && diffDays < 0;
    const isDueSoon = !isReturned && diffDays >= 0 && diffDays <= 3;

    // Apply status filter
    if (filter === 'active' && isReturned) return false;
    if (filter === 'overdue' && !isOverdue) return false;
    if (filter === 'due-soon' && !isDueSoon) return false;
    if (filter === 'returned' && !isReturned) return false;

    // Apply search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        loan.bookTitle.toLowerCase().includes(q) ||
        loan.bookId.toLowerCase().includes(q) ||
        loan.borrowerName.toLowerCase().includes(q) ||
        loan.borrowerContact.includes(q) ||
        (loan.borrowerOrg && loan.borrowerOrg.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  // Calculate counts for badges
  const activeCount = loans.filter((l) => l.status !== '반납완료').length;
  const overdueCount = loans.filter((l) => {
    if (l.status === '반납완료') return false;
    const due = new Date(l.dueDate);
    due.setHours(0, 0, 0, 0);
    return due.getTime() < today.getTime();
  }).length;
  const dueSoonCount = loans.filter((l) => {
    if (l.status === '반납완료') return false;
    const due = new Date(l.dueDate);
    due.setHours(0, 0, 0, 0);
    const diff = Math.round((due.getTime() - today.getTime()) / 86400000);
    return diff >= 0 && diff <= 3;
  }).length;
  const returnedCount = loans.filter((l) => l.status === '반납완료').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            도서 대출 및 반납 관리
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            이용자별 대출 현황을 확인하고 기간 연장 및 원클릭 반납 처리를 진행할 수 있습니다.
          </p>
        </div>

        <button
          onClick={onOpenBorrow}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>신규 대출 등록</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Segmented Filter Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              filter === 'active'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            현재 대출 중 ({activeCount})
          </button>
          <button
            onClick={() => setFilter('due-soon')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              filter === 'due-soon'
                ? 'bg-white text-amber-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            반납 임박 ({dueSoonCount})
          </button>
          <button
            onClick={() => setFilter('overdue')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              filter === 'overdue'
                ? 'bg-white text-rose-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            연체 중 ({overdueCount})
          </button>
          <button
            onClick={() => setFilter('returned')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              filter === 'returned'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            반납 완료 ({returnedCount})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              filter === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            전체 ({loans.length})
          </button>
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="대출자 이름, 연락처, 도서명 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Loans Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {filteredLoans.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Filter className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">해당 조건의 대출 내역이 없습니다.</p>
            <p className="text-xs text-slate-500 mt-1">필터를 변경하거나 검색어를 조정해 보세요.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/75">
                  <th className="py-3 px-4 font-semibold">도서 ID / 도서명</th>
                  <th className="py-3 px-4 font-semibold">대출자 정보</th>
                  <th className="py-3 px-4 font-semibold">대출일</th>
                  <th className="py-3 px-4 font-semibold">반납 예정일</th>
                  <th className="py-3 px-4 font-semibold">상태 및 D-Day</th>
                  <th className="py-3 px-4 font-semibold">메모 / 연장</th>
                  <th className="py-3 px-4 font-semibold text-right">반납 관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLoans.map((loan) => {
                  const isReturned = loan.status === '반납완료';
                  const dDay = getDDay(loan.dueDate, isReturned);

                  return (
                    <tr
                      key={loan.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        dDay.isOverdue ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      {/* Book info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <BookCover
                            title={loan.bookTitle}
                            author={books.find((b) => b.id === loan.bookId)?.author || '저자 미상'}
                            category={books.find((b) => b.id === loan.bookId)?.category}
                            coverImage={books.find((b) => b.id === loan.bookId)?.coverImage}
                            size="sm"
                          />
                          <div>
                            <div className="font-semibold text-slate-900 text-sm leading-tight">
                              {loan.bookTitle}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-1.5">
                              <span className="text-blue-700 font-semibold">{loan.bookId}</span>
                              <span>·</span>
                              <span>관리번호 {loan.id}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Borrower info */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{loan.borrowerName}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {loan.borrowerContact}
                          {loan.borrowerOrg && ` (${loan.borrowerOrg})`}
                        </div>
                      </td>

                      {/* Borrow Date */}
                      <td className="py-3.5 px-4 tabular-nums text-slate-600">
                        {loan.borrowDate}
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-4 tabular-nums">
                        <span className="font-semibold text-slate-900">{loan.dueDate}</span>
                        {isReturned && loan.returnDate && (
                          <div className="text-[11px] text-emerald-600 mt-0.5">
                            반납일: {loan.returnDate}
                          </div>
                        )}
                      </td>

                      {/* D-Day Badge */}
                      <td className="py-3.5 px-4">
                        {isReturned ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>반납 완료</span>
                          </span>
                        ) : dDay.isOverdue ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded">
                            <AlertCircle className="w-3 h-3" />
                            <span>{dDay.text}</span>
                          </span>
                        ) : dDay.isDueSoon ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded">
                            <Clock className="w-3 h-3" />
                            <span>{dDay.text}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{dDay.text}</span>
                          </span>
                        )}
                      </td>

                      {/* Memo & Renew count */}
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        <div>{loan.notes || '-'}</div>
                        <div className="text-slate-400 mt-0.5 font-mono">
                          연장: {loan.renewCount}회
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {isReturned ? (
                          <span className="text-xs text-slate-400 font-medium">처리 완료</span>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onExtendLoan(loan.id)}
                              disabled={loan.renewCount >= 2}
                              title={
                                loan.renewCount >= 2
                                  ? '최대 연장 횟수 초과'
                                  : '대출 기간 +7일 연장'
                              }
                              className="px-2.5 py-1 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded text-xs font-medium transition-colors disabled:opacity-40"
                            >
                              연장 (+7일)
                            </button>
                            <button
                              onClick={() => onOpenReturn(loan)}
                              className="px-3 py-1 text-white bg-blue-600 hover:bg-blue-700 rounded text-xs font-semibold transition-colors shadow-2xs"
                            >
                              반납 확인
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
