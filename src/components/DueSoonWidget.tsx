import React from 'react';
import { LoanRecord, Book } from '../types/library';
import { BookCover } from './BookCover';
import { AlertCircle, Clock, Calendar, CheckCircle2 } from 'lucide-react';

interface DueSoonWidgetProps {
  loans: LoanRecord[];
  books: Book[];
  onOpenReturn: (loan: LoanRecord) => void;
  onExtendLoan: (loanId: string) => void;
}

export const DueSoonWidget: React.FC<DueSoonWidgetProps> = ({
  loans,
  books,
  onOpenReturn,
  onExtendLoan,
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter active loans with dueDate within 3 days or overdue
  const dueSoonLoans = loans
    .filter((loan) => {
      if (loan.status === '반납완료') return false;
      const due = new Date(loan.dueDate);
      due.setHours(0, 0, 0, 0);
      const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000);
      return diffDays <= 3; // Overdue (< 0) or due within 3 days (0 ~ 3)
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const getDDay = (dueDateStr: string) => {
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000);

    if (diffDays < 0) {
      return { text: `연체 ${Math.abs(diffDays)}일`, isOverdue: true, isToday: false };
    }
    if (diffDays === 0) {
      return { text: '오늘 반납 마감', isOverdue: false, isToday: true };
    }
    return { text: `D-${diffDays} 반납 예정`, isOverdue: false, isToday: false };
  };

  const getBook = (bookId: string) => {
    return books.find((b) => b.id === bookId);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>반납 예정 도서 (3일 이내)</span>
              <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                {dueSoonLoans.length}권
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              반납 기한이 임박하거나 연체된 도서를 집중 모니터링합니다.
            </p>
          </div>
        </div>
      </div>

      {dueSoonLoans.length === 0 ? (
        <div className="py-8 text-center text-slate-500 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
          <p className="text-xs font-semibold text-slate-700">
            3일 이내 반납 예정 도서가 없습니다.
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            현재 대출된 모든 도서의 반납 기한이 여유롭습니다.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {dueSoonLoans.map((loan) => {
            const book = getBook(loan.bookId);
            const dDay = getDDay(loan.dueDate);

            return (
              <div
                key={loan.id}
                className={`p-3 rounded-lg border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  dDay.isOverdue
                    ? 'bg-rose-50/40 border-rose-200'
                    : dDay.isToday
                    ? 'bg-amber-50/50 border-amber-200'
                    : 'bg-slate-50/80 border-slate-200'
                }`}
              >
                {/* Book & Borrower Left section */}
                <div className="flex items-center gap-3 min-w-0">
                  <BookCover
                    title={loan.bookTitle}
                    author={book?.author || '저자 미상'}
                    category={book?.category}
                    coverImage={book?.coverImage}
                    size="sm"
                    className="shadow-xs shrink-0"
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                        {loan.bookId}
                      </span>
                      {dDay.isOverdue ? (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <AlertCircle className="w-2.5 h-2.5" />
                          <span>{dDay.text}</span>
                        </span>
                      ) : dDay.isToday ? (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                          {dDay.text}
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                          {dDay.text}
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 truncate max-w-xs leading-snug">
                      {loan.bookTitle}
                    </h4>

                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                      <span>대출자: <strong className="text-slate-700">{loan.borrowerName}</strong></span>
                      <span>·</span>
                      <span className="font-mono">{loan.borrowerContact}</span>
                      <span>·</span>
                      <span className="font-mono text-slate-600">반납일: {loan.dueDate}</span>
                    </div>
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => onExtendLoan(loan.id)}
                    disabled={loan.renewCount >= 2}
                    title={loan.renewCount >= 2 ? '최대 연장 2회 완료' : '반납 기한 +7일 연장'}
                    className="px-2.5 py-1.5 text-[11px] font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors disabled:opacity-40"
                  >
                    연장 ({loan.renewCount}/2)
                  </button>
                  <button
                    onClick={() => onOpenReturn(loan)}
                    className="px-3 py-1.5 text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-2xs"
                  >
                    즉시 반납
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
