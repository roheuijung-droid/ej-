import React, { useState, useEffect } from 'react';
import { Book } from '../types/library';
import { formatDate, addDays } from '../services/storageService';
import { BookCover } from './BookCover';
import { X, Calendar, User, Phone, BookOpen, AlertCircle } from 'lucide-react';

interface BorrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBooks: Book[];
  initialBook?: Book;
  onConfirmBorrow: (data: {
    bookId: string;
    borrowerName: string;
    borrowerContact: string;
    borrowerOrg?: string;
    loanDays: number;
    notes?: string;
  }) => void;
}

export const BorrowModal: React.FC<BorrowModalProps> = ({
  isOpen,
  onClose,
  availableBooks,
  initialBook,
  onConfirmBorrow,
}) => {
  const [selectedBookId, setSelectedBookId] = useState('');
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerContact, setBorrowerContact] = useState('');
  const [borrowerOrg, setBorrowerOrg] = useState('');
  const [loanDays, setLoanDays] = useState<number>(14);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialBook) {
      setSelectedBookId(initialBook.id);
    } else if (availableBooks.length > 0) {
      setSelectedBookId(availableBooks[0].id);
    }
    setError('');
  }, [initialBook, availableBooks, isOpen]);

  if (!isOpen) return null;

  const today = new Date();
  const dueDate = addDays(today, loanDays);
  const selectedBook = availableBooks.find((b) => b.id === selectedBookId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookId) {
      setError('대출할 도서를 선택해 주세요.');
      return;
    }
    if (!borrowerName.trim()) {
      setError('대출자 이름을 입력해 주세요.');
      return;
    }
    if (!borrowerContact.trim()) {
      setError('대출자 연락처(전화번호)를 입력해 주세요.');
      return;
    }

    onConfirmBorrow({
      bookId: selectedBookId,
      borrowerName: borrowerName.trim(),
      borrowerContact: borrowerContact.trim(),
      borrowerOrg: borrowerOrg.trim() || undefined,
      loanDays,
      notes: notes.trim() || undefined,
    });

    // Reset fields
    setBorrowerName('');
    setBorrowerContact('');
    setBorrowerOrg('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 relative animate-in zoom-in-95">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <BookOpen className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">도서 대출 등록</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            이용자 정보와 대출 기간을 입력하면 즉시 대출 처리 및 예정일이 계산됩니다.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Book Select */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              대출 도서 선택 <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs font-medium"
            >
              {availableBooks.length === 0 ? (
                <option value="">대출 가능한 도서가 없습니다</option>
              ) : (
                availableBooks.map((b) => (
                  <option key={b.id} value={b.id}>
                    [{b.id}] {b.title} - {b.author} ({b.category})
                  </option>
                ))
              )}
            </select>
            {selectedBook && (
              <div className="mt-2.5 p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg flex items-center gap-3">
                <BookCover
                  title={selectedBook.title}
                  author={selectedBook.author}
                  category={selectedBook.category}
                  coverImage={selectedBook.coverImage}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-900 truncate">{selectedBook.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {selectedBook.author} · {selectedBook.category}
                  </div>
                  <div className="text-[10px] text-blue-700 font-mono mt-0.5">
                    도서번호: {selectedBook.id}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Borrower Name & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                대출자 이름 <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="예: 홍길동"
                  value={borrowerName}
                  onChange={(e) => setBorrowerName(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                연락처 <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="예: 010-1234-5678"
                  value={borrowerContact}
                  onChange={(e) => setBorrowerContact(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Organization / Student ID */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              소속 / 학번 / 사번 (선택)
            </label>
            <input
              type="text"
              placeholder="예: 경영학과 24학번 / 연구팀"
              value={borrowerOrg}
              onChange={(e) => setBorrowerOrg(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs"
            />
          </div>

          {/* Loan Period Presets */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              대출 기간 선택
            </label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {[7, 14, 30].map((days) => (
                <button
                  type="button"
                  key={days}
                  onClick={() => setLoanDays(days)}
                  className={`py-2 px-3 rounded-lg font-medium text-center transition-colors ${
                    loanDays === days
                      ? 'bg-blue-600 text-white shadow-xs font-semibold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {days}일 대출
                </button>
              ))}
            </div>

            {/* Calculated Due Date banner */}
            <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-lg flex items-center justify-between text-xs text-blue-900 font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>반납 예정일</span>
              </span>
              <span className="font-bold font-mono text-blue-700">
                {formatDate(dueDate)} ({loanDays}일 후)
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">비고 / 메모 (선택)</label>
            <input
              type="text"
              placeholder="예: 파손 주의 안내 완료, 부록 CD 포함 등"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={availableBooks.length === 0}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              대출 등록 완료
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
