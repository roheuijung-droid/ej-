import React, { useState } from 'react';
import { Book } from '../types/library';
import { X, BookPlus, AlertCircle } from 'lucide-react';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingBooks: Book[];
  onAddBook: (book: Book) => void;
}

export const AddBookModal: React.FC<AddBookModalProps> = ({
  isOpen,
  onClose,
  existingBooks,
  onAddBook,
}) => {
  // Suggest next ID
  const nextIdNum = existingBooks.length + 1;
  const suggestedId = `B${String(nextIdNum).padStart(3, '0')}`;

  const [id, setId] = useState(suggestedId);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('IT/프로그래밍');
  const [customCategory, setCustomCategory] = useState('');
  const [location, setLocation] = useState('A-01 서가');
  const [publisher, setPublisher] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim()) {
      setError('도서 ID를 입력해 주세요.');
      return;
    }
    if (existingBooks.some((b) => b.id.toLowerCase() === id.trim().toLowerCase())) {
      setError(`도서 ID '${id}'는 이미 등록되어 있습니다.`);
      return;
    }
    if (!title.trim()) {
      setError('도서 제목을 입력해 주세요.');
      return;
    }
    if (!author.trim()) {
      setError('저자명을 입력해 주세요.');
      return;
    }

    const finalCategory = category === '직접입력' ? customCategory.trim() || '기타' : category;

    const newBook: Book = {
      id: id.trim().toUpperCase(),
      title: title.trim(),
      author: author.trim(),
      category: finalCategory,
      status: '대출가능',
      location: location.trim() || undefined,
      publisher: publisher.trim() || undefined,
      coverImage: coverImage.trim() || undefined,
      addedAt: new Date().toISOString(),
    };

    onAddBook(newBook);
    setTitle('');
    setAuthor('');
    setPublisher('');
    setCoverImage('');
    setError('');
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
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <BookPlus className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">신규 소장 도서 등록</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            도서관 장서 목록에 신규 도서를 등록합니다.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                도서 ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="B001"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs uppercase"
              />
            </div>
            <div className="col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                도서명 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 클린 아키텍처"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                저자 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="예: 로버트 C. 마틴"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">분야 / 카테고리</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              >
                <option value="IT/프로그래밍">IT/프로그래밍</option>
                <option value="IT/AI">IT/AI</option>
                <option value="IT/웹개발">IT/웹개발</option>
                <option value="인문/교양">인문/교양</option>
                <option value="문학/소설">문학/소설</option>
                <option value="자연과학">자연과학</option>
                <option value="사회/경영">사회/경영</option>
                <option value="직접입력">직접 입력</option>
              </select>
            </div>
          </div>

          {category === '직접입력' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">카테고리 직접 입력</label>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="새로운 분야 입력"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">서가 위치</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="예: A-01 서가"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">출판사</label>
              <input
                type="text"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                placeholder="예: 인사이트"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              표지 이미지 URL (선택)
            </label>
            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="예: https://... (미입력 시 감성적인 도서 자켓이 자동 생성됩니다)"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>

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
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs transition-colors"
            >
              도서 등록
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
