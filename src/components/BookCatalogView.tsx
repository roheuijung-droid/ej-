import React, { useState } from 'react';
import { Book, LoanRecord } from '../types/library';
import { BookCover } from './BookCover';
import {
  Search,
  Plus,
  BookOpen,
  BookmarkCheck,
  Clock,
  Layers,
  LayoutGrid,
  List,
  FileSpreadsheet,
} from 'lucide-react';

interface BookCatalogViewProps {
  books: Book[];
  loans: LoanRecord[];
  onOpenBorrow: (book: Book) => void;
  onOpenReturn: (loan: LoanRecord) => void;
  onOpenAddBook: () => void;
}

export const BookCatalogView: React.FC<BookCatalogViewProps> = ({
  books,
  loans,
  onOpenBorrow,
  onOpenReturn,
  onOpenAddBook,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'loaned'>('all');
  const [onlySheetBooks, setOnlySheetBooks] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Categories list
  const categories = Array.from(new Set(books.map((b) => b.category)));

  // Filter books
  const filteredBooks = books.filter((book) => {
    if (selectedCategory !== 'all' && book.category !== selectedCategory) {
      return false;
    }
    if (statusFilter === 'available' && book.status !== '대출가능') {
      return false;
    }
    if (statusFilter === 'loaned' && book.status !== '대출중') {
      return false;
    }
    if (onlySheetBooks && !book.isFromGoogleSheet) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.id.toLowerCase().includes(q) ||
        book.category.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Helper to find active loan for a book
  const getActiveLoan = (bookId: string) => {
    return loans.find((l) => l.bookId === bookId && l.status !== '반납완료');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            도서 소장 목록 및 관리
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            구글 시트 연동 도서와 로컬 등록 도서를 통합 검색하고 대출 상태를 변경할 수 있습니다.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onOpenAddBook}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>신규 도서 등록</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="도서명, 저자, 카테고리, 도서ID(B001 등) 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg self-end md:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="카드 뷰"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="테이블 뷰"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Pills / Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* Status filters */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium mr-1">상태:</span>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white font-medium'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setStatusFilter('available')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === 'available'
                  ? 'bg-emerald-600 text-white font-medium'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              대출 가능
            </button>
            <button
              onClick={() => setStatusFilter('loaned')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === 'loaned'
                  ? 'bg-blue-600 text-white font-medium'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              대출 중
            </button>
          </div>

          <span className="text-slate-300">|</span>

          {/* Categories select */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">분야:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-1 px-2.5 bg-slate-100 border-none rounded-md text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              <option value="all">전체 분야</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <span className="text-slate-300">|</span>

          {/* Sheet only toggle */}
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 hover:text-slate-900">
            <input
              type="checkbox"
              checked={onlySheetBooks}
              onChange={(e) => setOnlySheetBooks(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>구글 시트 연동 도서만 보기</span>
          </label>

          <span className="ml-auto text-slate-500 tabular-nums">
            총 <strong>{filteredBooks.length}</strong>권 검색됨
          </span>
        </div>
      </div>

      {/* Book Grid / Table */}
      {filteredBooks.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-16 text-center text-slate-500">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-800">검색 조건에 맞는 도서가 없습니다.</p>
          <p className="text-xs text-slate-500 mt-1">다른 검색어나 필터를 선택해 보세요.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBooks.map((book) => {
            const activeLoan = getActiveLoan(book.id);
            const isAvailable = book.status === '대출가능';

            return (
              <div
                key={book.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {book.id}
                    </span>
                    <div className="flex items-center gap-1">
                      {book.isFromGoogleSheet && (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <FileSpreadsheet className="w-2.5 h-2.5" />
                          <span>시트 연동</span>
                        </span>
                      )}
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          isAvailable
                            ? 'text-emerald-700 bg-emerald-50'
                            : 'text-blue-700 bg-blue-50'
                        }`}
                      >
                        {book.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3.5 mb-3">
                    <BookCover
                      title={book.title}
                      author={book.author}
                      category={book.category}
                      coverImage={book.coverImage}
                      size="md"
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                        {book.title}
                      </h3>
                      <div className="text-xs text-slate-500 mt-1">
                        <span>{book.author}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        <span>{book.category}</span>
                      </div>

                      <div className="mt-2.5 text-[11px] text-slate-500 space-y-0.5">
                        {book.location && (
                          <div className="font-mono text-slate-600">위치: {book.location}</div>
                        )}
                        {book.publisher && (
                          <div className="text-slate-500">출판: {book.publisher}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {activeLoan && (
                    <div className="p-2 bg-blue-50/70 rounded text-[11px] text-blue-900 mb-2">
                      <div className="font-semibold">대출자: {activeLoan.borrowerName}</div>
                      <div className="text-blue-700">반납 예정: {activeLoan.dueDate}</div>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  {isAvailable ? (
                    <button
                      onClick={() => onOpenBorrow(book)}
                      className="w-full py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors shadow-2xs"
                    >
                      도서 대출하기
                    </button>
                  ) : activeLoan ? (
                    <button
                      onClick={() => onOpenReturn(activeLoan)}
                      className="w-full py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg transition-colors"
                    >
                      반납 처리하기
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-2 text-xs font-medium text-slate-400 bg-slate-100 rounded-lg cursor-not-allowed"
                    >
                      대출 중
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/75">
                  <th className="py-3 px-4 font-semibold">표지 / ID</th>
                  <th className="py-3 px-4 font-semibold">도서명</th>
                  <th className="py-3 px-4 font-semibold">저자</th>
                  <th className="py-3 px-4 font-semibold">카테고리</th>
                  <th className="py-3 px-4 font-semibold">서가 위치</th>
                  <th className="py-3 px-4 font-semibold">상태</th>
                  <th className="py-3 px-4 font-semibold text-right">대출/반납 작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBooks.map((book) => {
                  const activeLoan = getActiveLoan(book.id);
                  const isAvailable = book.status === '대출가능';

                  return (
                    <tr key={book.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <BookCover
                            title={book.title}
                            author={book.author}
                            category={book.category}
                            coverImage={book.coverImage}
                            size="sm"
                          />
                          <span className="font-mono font-bold text-blue-700">
                            {book.id}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 text-sm">{book.title}</div>
                        {book.isFromGoogleSheet && (
                          <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1 py-0.2 rounded mt-0.5 inline-block">
                            시트 연동
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">{book.author}</td>
                      <td className="py-3.5 px-4 text-slate-600">{book.category}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">{book.location || '-'}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            isAvailable
                              ? 'text-emerald-700 bg-emerald-50'
                              : 'text-blue-700 bg-blue-50'
                          }`}
                        >
                          {book.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isAvailable ? (
                          <button
                            onClick={() => onOpenBorrow(book)}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                          >
                            대출
                          </button>
                        ) : activeLoan ? (
                          <button
                            onClick={() => onOpenReturn(activeLoan)}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                          >
                            반납
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs">대출중</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
