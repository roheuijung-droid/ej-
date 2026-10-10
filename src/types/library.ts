export type BookStatus = '대출가능' | '대출중' | '연체' | '예약중';

export interface Book {
  id: string; // e.g. "B001"
  title: string;
  author: string;
  category: string;
  status: BookStatus;
  isbn?: string;
  publisher?: string;
  location?: string;
  isFromGoogleSheet?: boolean;
  coverImage?: string;
  recommendationReason?: string;
  isRecommended?: boolean;
  addedAt?: string;
}

export type LoanStatus = '대출중' | '반납완료' | '연체';

export interface LoanRecord {
  id: string;
  bookId: string;
  bookTitle: string;
  borrowerName: string;
  borrowerContact: string;
  borrowerOrg?: string; // 소속 또는 학번/사번
  borrowDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  returnDate?: string | null; // YYYY-MM-DD
  status: LoanStatus;
  renewCount: number; // 최대 연장 횟수 관리
  notes?: string;
  createdAt: string; // ISO string
}

export interface LibraryStats {
  totalBooks: number;
  availableBooks: number;
  loanedBooks: number;
  overdueBooks: number;
  dueSoonBooks: number;
  todayLoans: number;
  todayReturns: number;
  returnRate: number;
}

export type NavTab = 'dashboard' | 'loans' | 'books' | 'history' | 'sheet-sync';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}
