import React, { useState, useEffect, useCallback } from 'react';
import { Book, LoanRecord, NavTab, ToastMessage } from './types/library';
import {
  loadBooks,
  saveBooks,
  loadLoans,
  saveLoans,
  calculateStats,
  mergeGoogleSheetBooks,
  formatDate,
  addDays,
} from './services/storageService';
import {
  getStoredGasUrl,
  saveGasUrl,
  fetchBooksFromGAS,
  syncBorrowToGAS,
  syncReturnToGAS,
} from './services/gasService';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { LoansManagementView } from './components/LoansManagementView';
import { BookCatalogView } from './components/BookCatalogView';
import { HistoryLogView } from './components/HistoryLogView';
import { GoogleSheetSyncView } from './components/GoogleSheetSyncView';
import { BorrowModal } from './components/BorrowModal';
import { ReturnModal } from './components/ReturnModal';
import { AddBookModal } from './components/AddBookModal';
import { Toast } from './components/Toast';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [books, setBooks] = useState<Book[]>([]);
  const [loans, setLoans] = useState<LoanRecord[]>([]);
  const [gasUrl, setGasUrl] = useState<string>(getStoredGasUrl());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals state
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);
  const [selectedBorrowBook, setSelectedBorrowBook] = useState<Book | undefined>(undefined);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedReturnLoan, setSelectedReturnLoan] = useState<LoanRecord | null>(null);
  const [addBookModalOpen, setAddBookModalOpen] = useState(false);

  // Toast helper
  const addToast = useCallback(
    (type: ToastMessage['type'], message: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync with Google Apps Script
  const syncWithGAS = useCallback(
    async (urlToUse: string = gasUrl, isInitial: boolean = false) => {
      setIsSyncing(true);
      try {
        const res = await fetchBooksFromGAS(urlToUse);
        if (res.success && res.books.length > 0) {
          setBooks((prevBooks) => {
            const merged = mergeGoogleSheetBooks(prevBooks, res.books);
            return merged;
          });
          const timeStr = new Date().toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
          setLastSyncTime(`${formatDate(new Date())} ${timeStr}`);
          if (!isInitial) {
            addToast('success', `구글 시트에서 도서 ${res.books.length}권을 성공적으로 동기화했습니다.`);
          }
        } else {
          if (!isInitial) {
            addToast(
              'warning',
              res.error
                ? `구글 시트 동기화 안내: ${res.error}`
                : '구글 시트에서 도서 데이터를 가져오지 못했습니다. 로컬 데이터를 유지합니다.'
            );
          }
        }
      } catch (err: any) {
        if (!isInitial) {
          addToast('error', `시트 연동 중 오류 발생: ${err.message || '네트워크 오류'}`);
        }
      } finally {
        setIsSyncing(false);
      }
    },
    [gasUrl, addToast]
  );

  // Initial load
  useEffect(() => {
    const loadedBooks = loadBooks();
    const loadedLoans = loadLoans();
    setBooks(loadedBooks);
    setLoans(loadedLoans);

    // Initial background sync with Google Apps Script
    syncWithGAS(gasUrl, true);
  }, []);

  // Update storage whenever books or loans change
  const handleUpdateBooks = (newBooks: Book[]) => {
    setBooks(newBooks);
    saveBooks(newBooks);
  };

  const handleUpdateLoans = (newLoans: LoanRecord[]) => {
    setLoans(newLoans);
    saveLoans(newLoans);
  };

  // Borrow action
  const handleConfirmBorrow = async (data: {
    bookId: string;
    borrowerName: string;
    borrowerContact: string;
    borrowerOrg?: string;
    loanDays: number;
    notes?: string;
  }) => {
    const targetBook = books.find((b) => b.id === data.bookId);
    if (!targetBook) {
      addToast('error', '대출할 도서를 찾을 수 없습니다.');
      return;
    }

    const todayStr = formatDate(new Date());
    const dueDateStr = formatDate(addDays(new Date(), data.loanDays));
    const loanId = `L-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(loans.length + 1).padStart(3, '0')}`;

    const newLoan: LoanRecord = {
      id: loanId,
      bookId: targetBook.id,
      bookTitle: targetBook.title,
      borrowerName: data.borrowerName,
      borrowerContact: data.borrowerContact,
      borrowerOrg: data.borrowerOrg,
      borrowDate: todayStr,
      dueDate: dueDateStr,
      status: '대출중',
      renewCount: 0,
      notes: data.notes,
      createdAt: new Date().toISOString(),
    };

    // Update loan list
    const updatedLoans = [newLoan, ...loans];
    handleUpdateLoans(updatedLoans);

    // Update book status to '대출중'
    const updatedBooks = books.map((b) =>
      b.id === targetBook.id ? { ...b, status: '대출중' as const } : b
    );
    handleUpdateBooks(updatedBooks);

    addToast('success', `'${targetBook.title}' 대출 처리가 완료되었습니다. (반납예정: ${dueDateStr})`);

    // Async sync to Google Sheet
    if (targetBook.isFromGoogleSheet) {
      syncBorrowToGAS(targetBook.id, data.borrowerName, dueDateStr, gasUrl).then((res) => {
        if (res.success) {
          addToast('info', '구글 시트 스프레드시트에 대출 내역이 기록되었습니다.');
        }
      });
    }
  };

  // Return action
  const handleConfirmReturn = async (loanId: string, notes?: string) => {
    const targetLoan = loans.find((l) => l.id === loanId);
    if (!targetLoan) {
      addToast('error', '반납 처리할 대출 기록을 찾을 수 없습니다.');
      return;
    }

    const todayStr = formatDate(new Date());

    // Update loan record
    const updatedLoans = loans.map((l) => {
      if (l.id === loanId) {
        return {
          ...l,
          status: '반납완료' as const,
          returnDate: todayStr,
          notes: notes ? `${l.notes ? l.notes + ' / ' : ''}${notes}` : l.notes,
        };
      }
      return l;
    });
    handleUpdateLoans(updatedLoans);

    // Update book status to '대출가능'
    const updatedBooks = books.map((b) =>
      b.id === targetLoan.bookId ? { ...b, status: '대출가능' as const } : b
    );
    handleUpdateBooks(updatedBooks);

    addToast('success', `'${targetLoan.bookTitle}' 도서가 정상 반납되었습니다.`);

    // Async sync to Google Sheet
    syncReturnToGAS(targetLoan.bookId, gasUrl).then((res) => {
      if (res.success) {
        addToast('info', '구글 시트 스프레드시트에 반납 완료가 반영되었습니다.');
      }
    });
  };

  // Extend loan (+7 days)
  const handleExtendLoan = (loanId: string) => {
    const targetLoan = loans.find((l) => l.id === loanId);
    if (!targetLoan) return;

    if (targetLoan.renewCount >= 2) {
      addToast('warning', '대출 연장은 최대 2회까지만 가능합니다.');
      return;
    }

    const currentDue = new Date(targetLoan.dueDate);
    const newDue = addDays(currentDue, 7);
    const newDueStr = formatDate(newDue);

    const updatedLoans = loans.map((l) => {
      if (l.id === loanId) {
        return {
          ...l,
          dueDate: newDueStr,
          renewCount: l.renewCount + 1,
          status: '대출중' as const,
        };
      }
      return l;
    });
    handleUpdateLoans(updatedLoans);

    addToast(
      'success',
      `'${targetLoan.bookTitle}' 대출 기간이 7일 연장되었습니다. (새 반납일: ${newDueStr})`
    );
  };

  // Add new book
  const handleAddBook = (newBook: Book) => {
    const updated = [newBook, ...books];
    handleUpdateBooks(updated);
    addToast('success', `새로운 도서 '${newBook.title}'(ID: ${newBook.id})이 등록되었습니다.`);
  };

  // Save new GAS URL
  const handleSaveGasUrl = (newUrl: string) => {
    setGasUrl(newUrl);
    saveGasUrl(newUrl);
    addToast('success', '새로운 구글 웹 앱 URL이 저장되었습니다. 동기화를 진행합니다.');
    syncWithGAS(newUrl);
  };

  // Quick Open Borrow
  const handleOpenQuickBorrow = (preselectedBook?: Book) => {
    setSelectedBorrowBook(preselectedBook);
    setBorrowModalOpen(true);
  };

  // Quick Open Return
  const handleOpenReturnModal = (loan: LoanRecord) => {
    setSelectedReturnLoan(loan);
    setReturnModalOpen(true);
  };

  // Computed statistics
  const stats = calculateStats(books, loans);
  const availableBooks = books.filter((b) => b.status === '대출가능');
  const sheetBookCount = books.filter((b) => b.isFromGoogleSheet).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Bar Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenQuickBorrow={() => handleOpenQuickBorrow()}
        isSyncing={isSyncing}
        onSyncGas={() => syncWithGAS(gasUrl)}
        lastSyncTime={lastSyncTime}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'dashboard' && (
          <DashboardView
            stats={stats}
            books={books}
            loans={loans}
            onOpenBorrow={handleOpenQuickBorrow}
            onOpenReturn={handleOpenReturnModal}
            onExtendLoan={handleExtendLoan}
            onNavigateTab={setCurrentTab}
            onSyncGas={() => syncWithGAS(gasUrl)}
            isSyncing={isSyncing}
            lastSyncTime={lastSyncTime}
            gasUrl={gasUrl}
          />
        )}

        {currentTab === 'loans' && (
          <LoansManagementView
            loans={loans}
            books={books}
            onOpenBorrow={() => handleOpenQuickBorrow()}
            onOpenReturn={handleOpenReturnModal}
            onExtendLoan={handleExtendLoan}
          />
        )}

        {currentTab === 'books' && (
          <BookCatalogView
            books={books}
            loans={loans}
            onOpenBorrow={handleOpenQuickBorrow}
            onOpenReturn={handleOpenReturnModal}
            onOpenAddBook={() => setAddBookModalOpen(true)}
          />
        )}

        {currentTab === 'history' && <HistoryLogView loans={loans} />}

        {currentTab === 'sheet-sync' && (
          <GoogleSheetSyncView
            currentUrl={gasUrl}
            onSaveUrl={handleSaveGasUrl}
            onSync={() => syncWithGAS(gasUrl)}
            isSyncing={isSyncing}
            lastSyncTime={lastSyncTime}
            sheetBookCount={sheetBookCount}
          />
        )}
      </main>

      {/* Modals */}
      <BorrowModal
        isOpen={borrowModalOpen}
        onClose={() => {
          setBorrowModalOpen(false);
          setSelectedBorrowBook(undefined);
        }}
        availableBooks={availableBooks}
        initialBook={selectedBorrowBook}
        onConfirmBorrow={handleConfirmBorrow}
      />

      <ReturnModal
        isOpen={returnModalOpen}
        onClose={() => {
          setReturnModalOpen(false);
          setSelectedReturnLoan(null);
        }}
        loan={selectedReturnLoan}
        book={books.find((b) => b.id === selectedReturnLoan?.bookId)}
        onConfirmReturn={handleConfirmReturn}
      />

      <AddBookModal
        isOpen={addBookModalOpen}
        onClose={() => setAddBookModalOpen(false)}
        existingBooks={books}
        onAddBook={handleAddBook}
      />

      {/* Toast notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Quiet Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 스마트 도서관 관리 시스템 · Google Sheets API 연동</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>엔드포인트: script.google.com</span>
            <span>·</span>
            <button
              onClick={() => setCurrentTab('sheet-sync')}
              className="hover:text-blue-600 transition-colors"
            >
              연동 설정 및 코드 가이드
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
