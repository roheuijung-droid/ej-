import { Book, LoanRecord, LibraryStats } from '../types/library';

const STORAGE_KEY_BOOKS = 'library_hub_books_v1';
const STORAGE_KEY_LOANS = 'library_hub_loans_v1';

// Seed sample books that complement the 3 initial books from Google Sheet
export const INITIAL_SAMPLE_BOOKS: Book[] = [
  {
    id: 'B001',
    title: '파이썬 코딩의 기술',
    author: '길도 밴 로섬',
    category: 'IT/프로그래밍',
    status: '대출가능',
    publisher: '길벗',
    location: 'A-01 서가',
    coverImage: '/src/assets/images/cover_python_code_1791590094451.jpg',
    isRecommended: true,
    recommendationReason: '파이썬 핵심 베스트 프랙티스와 깔끔하고 효율적인 코드 작성을 위한 실무 필수 지침서!',
    isFromGoogleSheet: true,
  },
  {
    id: 'B002',
    title: '인공지능의 미래',
    author: '샘 알트만',
    category: 'IT/AI',
    status: '대출가능',
    publisher: '한빛미디어',
    location: 'A-02 서가',
    coverImage: '/src/assets/images/cover_ai_future_1791590116628.jpg',
    isRecommended: true,
    recommendationReason: '생성형 AI와 차세대 범용 인공지능(AGI)이 바꿀 사회와 기술의 대변혁을 조망하는 필독서.',
    isFromGoogleSheet: true,
  },
  {
    id: 'B003',
    title: '클린 코드',
    author: '로버트 C. 마틴',
    category: 'IT/프로그래밍',
    status: '대출가능',
    publisher: '인사이트',
    location: 'A-03 서가',
    coverImage: '/src/assets/images/cover_clean_code_1791590127564.jpg',
    isRecommended: true,
    recommendationReason: '애자일 소프트웨어 장인정신과 읽기 좋은 명품 코드를 만드는 방법론의 고전.',
    isFromGoogleSheet: true,
  },
  {
    id: 'B004',
    title: 'Do it! 리액트 모던 웹 개발',
    author: '박상언',
    category: 'IT/웹개발',
    status: '대출중',
    publisher: '이지스퍼블리싱',
    location: 'A-04 서가',
    isRecommended: true,
    recommendationReason: '현대 프론트엔드 개발의 핵심인 React 생태계와 상태 관리의 완벽 정복!',
  },
  {
    id: 'B005',
    title: '모던 자바스크립트 Deep Dive',
    author: '이웅모',
    category: 'IT/프로그래밍',
    status: '대출중',
    publisher: '위키북스',
    location: 'A-05 서가',
    isRecommended: false,
  },
  {
    id: 'B006',
    title: '생각에 관한 생각',
    author: '대니얼 카너먼',
    category: '인문/교양',
    status: '대출가능',
    publisher: '김영사',
    location: 'B-01 서가',
    isRecommended: true,
    recommendationReason: '노벨 경제학상 수상자가 밝혀내는 인간 사고의 두 가지 시스템(빠른 직관 vs 깊은 이성).',
  },
  {
    id: 'B007',
    title: '사피엔스',
    author: '유발 하라리',
    category: '인문/역사',
    status: '대출중',
    publisher: '김영사',
    location: 'B-02 서가',
    isRecommended: false,
  },
  {
    id: 'B008',
    title: '코스모스 (특별판)',
    author: '칼 세이건',
    category: '자연과학',
    status: '대출가능',
    publisher: '사이언스북스',
    location: 'B-03 서가',
    isRecommended: true,
    recommendationReason: '광활한 우주와 인류의 기원을 인문학적 깊이로 풀어낸 영원한 과학 고전 명저.',
  },
  {
    id: 'B009',
    title: '달러구트 꿈 백화점',
    author: '이미예',
    category: '문학/소설',
    status: '대출가능',
    publisher: '팩토리나인',
    location: 'C-01 서가',
    isRecommended: false,
  },
  {
    id: 'B010',
    title: '아몬드',
    author: '손원평',
    category: '문학/소설',
    status: '대출중',
    publisher: '창비',
    location: 'C-02 서가',
    isRecommended: false,
  },
];

// Helper to format date string as YYYY-MM-DD
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Add days to date
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Sample initial loan records
function generateInitialLoans(): LoanRecord[] {
  const today = new Date();
  const overdueDate = addDays(today, -3);
  const dueSoonDate = addDays(today, 2);
  const nextWeekDate = addDays(today, 7);
  const pastReturnDate = addDays(today, -10);

  return [
    {
      id: 'L-202610-001',
      bookId: 'B004',
      bookTitle: 'Do it! 리액트 모던 웹 개발',
      borrowerName: '김민준',
      borrowerContact: '010-3456-7890',
      borrowerOrg: '소프트웨어과 23학번',
      borrowDate: formatDate(addDays(today, -12)),
      dueDate: formatDate(overdueDate),
      status: '연체',
      renewCount: 0,
      notes: '1차 반납 안내 문자 발송',
      createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    },
    {
      id: 'L-202610-002',
      bookId: 'B005',
      bookTitle: '모던 자바스크립트 Deep Dive',
      borrowerName: '이서연',
      borrowerContact: '010-9876-5432',
      borrowerOrg: '컴퓨터공학과 22학번',
      borrowDate: formatDate(addDays(today, -5)),
      dueDate: formatDate(dueSoonDate),
      status: '대출중',
      renewCount: 0,
      notes: '프로젝트 참고용 대출',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: 'L-202610-003',
      bookId: 'B007',
      bookTitle: '사피엔스',
      borrowerName: '박지훈',
      borrowerContact: '010-5544-3322',
      borrowerOrg: '인문학부',
      borrowDate: formatDate(addDays(today, -2)),
      dueDate: formatDate(nextWeekDate),
      status: '대출중',
      renewCount: 1,
      notes: '1회 기간 연장 완료',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'L-202610-004',
      bookId: 'B010',
      bookTitle: '아몬드',
      borrowerName: '정하은',
      borrowerContact: '010-1234-5678',
      borrowerOrg: '국어국문과',
      borrowDate: formatDate(addDays(today, -1)),
      dueDate: formatDate(addDays(today, 13)),
      status: '대출중',
      renewCount: 0,
      notes: '정기 도서 대출',
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: 'L-202610-005',
      bookId: 'B001',
      bookTitle: '파이썬 코딩의 기술',
      borrowerName: '최우진',
      borrowerContact: '010-7788-9900',
      borrowerOrg: '인공지능학과',
      borrowDate: formatDate(addDays(today, -20)),
      dueDate: formatDate(addDays(today, -6)),
      returnDate: formatDate(pastReturnDate),
      status: '반납완료',
      renewCount: 0,
      notes: '정상 반납 완료',
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    },
  ];
}

export function loadBooks(): Book[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load books from localStorage, using defaults:', err);
  }
  saveBooks(INITIAL_SAMPLE_BOOKS);
  return INITIAL_SAMPLE_BOOKS;
}

export function saveBooks(books: Book[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(books));
  } catch (err) {
    console.error('Failed to save books to localStorage:', err);
  }
}

export function loadLoans(): LoanRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOANS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load loans from localStorage, using initial:', err);
  }
  const initial = generateInitialLoans();
  saveLoans(initial);
  return initial;
}

export function saveLoans(loans: LoanRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_LOANS, JSON.stringify(loans));
  } catch (err) {
    console.error('Failed to save loans to localStorage:', err);
  }
}

/**
 * Merge books fetched from Google Sheet into current book catalog
 */
export function mergeGoogleSheetBooks(currentBooks: Book[], sheetBooks: Book[]): Book[] {
  const updatedMap = new Map<string, Book>();

  // Add existing
  currentBooks.forEach((b) => updatedMap.set(b.id, { ...b }));

  // Update or insert from Sheet
  sheetBooks.forEach((sb) => {
    const existing = updatedMap.get(sb.id);
    if (existing) {
      updatedMap.set(sb.id, {
        ...existing,
        title: sb.title,
        author: sb.author,
        category: sb.category,
        // If sheet explicitly specifies status, preserve it unless we have an active local loan
        status: sb.status || existing.status,
        coverImage: sb.coverImage || existing.coverImage,
        recommendationReason: existing.recommendationReason,
        isRecommended: existing.isRecommended,
        isFromGoogleSheet: true,
      });
    } else {
      updatedMap.set(sb.id, {
        ...sb,
        isFromGoogleSheet: true,
      });
    }
  });

  const merged = Array.from(updatedMap.values());
  saveBooks(merged);
  return merged;
}

/**
 * Calculate dynamic library statistics
 */
export function calculateStats(books: Book[], loans: LoanRecord[]): LibraryStats {
  const todayStr = formatDate(new Date());

  // Check and update overdue status dynamically
  const activeLoans = loans.filter((l) => l.status === '대출중' || l.status === '연체');
  let overdueCount = 0;
  let dueSoonCount = 0;

  activeLoans.forEach((loan) => {
    if (loan.dueDate < todayStr) {
      overdueCount++;
    } else {
      // Due within 3 days
      const due = new Date(loan.dueDate).getTime();
      const now = new Date(todayStr).getTime();
      const diffDays = Math.ceil((due - now) / 86400000);
      if (diffDays <= 3) {
        dueSoonCount++;
      }
    }
  });

  const loanedBooksCount = books.filter((b) => b.status === '대출중' || b.status === '연체').length;
  const availableCount = books.filter((b) => b.status === '대출가능').length;

  const todayLoans = loans.filter((l) => l.borrowDate === todayStr).length;
  const todayReturns = loans.filter((l) => l.returnDate === todayStr).length;

  const totalLoansCount = loans.length;
  const returnedCount = loans.filter((l) => l.status === '반납완료').length;
  const returnRate =
    totalLoansCount > 0 ? Math.round((returnedCount / totalLoansCount) * 100) : 100;

  return {
    totalBooks: books.length,
    availableBooks: availableCount,
    loanedBooks: loanedBooksCount,
    overdueBooks: overdueCount,
    dueSoonBooks: dueSoonCount,
    todayLoans,
    todayReturns,
    returnRate,
  };
}
