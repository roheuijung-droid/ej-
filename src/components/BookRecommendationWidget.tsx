import React, { useState } from 'react';
import { Book } from '../types/library';
import { BookCover } from './BookCover';
import { Sparkles, BookmarkCheck, ArrowRight, BookOpen } from 'lucide-react';

interface BookRecommendationWidgetProps {
  books: Book[];
  onOpenBorrow: (book: Book) => void;
  onNavigateToCatalog: () => void;
}

export const BookRecommendationWidget: React.FC<BookRecommendationWidgetProps> = ({
  books,
  onOpenBorrow,
  onNavigateToCatalog,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Filter books marked as recommended or top books
  const recommendedBooks = books.filter((b) => {
    if (filterCategory === 'all') return b.isRecommended || b.isFromGoogleSheet;
    return b.category.toLowerCase().includes(filterCategory.toLowerCase());
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>사서 추천 도서 큐레이션</span>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                인기 필독서
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              이달의 엄선된 도서와 구글 시트 추천 도서를 표지와 함께 만나보세요.
            </p>
          </div>
        </div>

        {/* Filter categories */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs self-start sm:self-auto">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              filterCategory === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setFilterCategory('IT')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              filterCategory === 'IT'
                ? 'bg-white text-blue-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            IT/AI
          </button>
          <button
            onClick={() => setFilterCategory('인문')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              filterCategory === '인문'
                ? 'bg-white text-amber-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            인문/교양
          </button>
          <button
            onClick={() => setFilterCategory('과학')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              filterCategory === '과학'
                ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            자연과학
          </button>
        </div>
      </div>

      {/* Recommended Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendedBooks.slice(0, 3).map((book) => {
          const isAvailable = book.status === '대출가능';

          return (
            <div
              key={book.id}
              className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 flex flex-col justify-between hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs"
            >
              <div className="flex gap-3">
                <BookCover
                  title={book.title}
                  author={book.author}
                  category={book.category}
                  coverImage={book.coverImage}
                  size="md"
                  className="shadow-sm"
                />

                <div className="min-w-0 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-mono font-bold text-blue-700 bg-white border border-blue-100 px-1.5 py-0.5 rounded">
                        {book.id}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          isAvailable
                            ? 'text-emerald-700 bg-emerald-50'
                            : 'text-blue-700 bg-blue-50'
                        }`}
                      >
                        {book.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight">
                      {book.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {book.author} · {book.category}
                    </p>
                  </div>

                  {/* Recommendation Note */}
                  <div className="mt-2 p-2 bg-white/90 border border-slate-200/60 rounded-md text-[10px] text-slate-600 line-clamp-2 leading-relaxed">
                    💡 {book.recommendationReason || '도서관 이용자들이 가장 많이 찾는 인기 소장 도서입니다.'}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">
                  {book.location || '일반서가'}
                </span>
                {isAvailable ? (
                  <button
                    onClick={() => onOpenBorrow(book)}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors shadow-2xs"
                  >
                    대출하기
                  </button>
                ) : (
                  <span className="px-2.5 py-1 text-xs font-medium text-slate-400 bg-slate-200/60 rounded-md">
                    대출 중
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>매주 신간 및 추천 도서 목록이 자동으로 갱신됩니다.</span>
        <button
          onClick={onNavigateToCatalog}
          className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1"
        >
          <span>소장 도서 전체 검색</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
