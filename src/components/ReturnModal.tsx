import React, { useState } from 'react';
import { LoanRecord, Book } from '../types/library';
import { formatDate } from '../services/storageService';
import { BookCover } from './BookCover';
import { X, CheckCircle2, AlertCircle, BookOpen, User, Calendar } from 'lucide-react';

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: LoanRecord | null;
  book?: Book;
  onConfirmReturn: (loanId: string, notes?: string) => void;
}

export const ReturnModal: React.FC<ReturnModalProps> = ({
  isOpen,
  onClose,
  loan,
  book,
  onConfirmReturn,
}) => {
  const [returnNotes, setReturnNotes] = useState('');

  if (!isOpen || !loan) return null;

  const todayStr = formatDate(new Date());
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(loan.dueDate);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000);
  const isOverdue = diffDays < 0;

  const handleConfirm = () => {
    onConfirmReturn(loan.id, returnNotes.trim() || undefined);
    setReturnNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 relative animate-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">도서 반납 확인</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            도서의 반납 상태를 확인하고 서가로 복귀 처리합니다.
          </p>
        </div>

        {/* Loan Details Card */}
        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2.5 text-xs mb-4">
          <div className="flex items-center gap-3">
            <BookCover
              title={loan.bookTitle}
              author={book?.author || '저자 미상'}
              category={book?.category}
              coverImage={book?.coverImage}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-slate-900 text-sm truncate">{loan.bookTitle}</div>
              <div className="font-mono text-blue-700 text-[11px] mt-0.5">도서 ID: {loan.bookId}</div>
              <div className="text-[10px] text-slate-400 font-mono">관리번호: {loan.id}</div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/70 grid grid-cols-2 gap-2 text-slate-600">
            <div>
              <span className="text-slate-400 block text-[10px]">대출자</span>
              <strong className="text-slate-800">{loan.borrowerName}</strong>
              <span className="text-[11px] text-slate-500 block">{loan.borrowerContact}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">반납 예정일</span>
              <strong className="text-slate-800">{loan.dueDate}</strong>
              <span className="text-[11px] text-slate-500 block">대출일: {loan.borrowDate}</span>
            </div>
          </div>

          {/* Overdue alert if applicable */}
          {isOverdue && (
            <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                <strong>{Math.abs(diffDays)}일 연체</strong>된 도서입니다. 연체 반납 처리됩니다.
              </span>
            </div>
          )}
        </div>

        {/* Return Date & Notes */}
        <div className="space-y-3 text-xs mb-5">
          <div className="flex items-center justify-between p-2.5 bg-slate-100/70 rounded-lg">
            <span className="font-medium text-slate-600 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>반납 처리 일자</span>
            </span>
            <span className="font-bold font-mono text-slate-900">{todayStr} (오늘)</span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              반납 메모 / 도서 상태 (선택)
            </label>
            <input
              type="text"
              placeholder="예: 상태 양호, 부록 반납 완료 등"
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-xs"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs transition-colors"
          >
            반납 완료 처리
          </button>
        </div>
      </div>
    </div>
  );
};
