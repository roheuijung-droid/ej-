import { Book } from '../types/library';

export const DEFAULT_GAS_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbxuXTxmteYGTV5yr07OsensjdLP_Fgu5WznpJqmm2TztDpm7yUyD3IoF7Pm4fs661BZ/exec';

const STORAGE_KEY_GAS_URL = 'library_gas_endpoint_url';

export function getStoredGasUrl(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_GAS_URL);
    return saved && saved.trim() ? saved.trim() : DEFAULT_GAS_ENDPOINT;
  } catch {
    return DEFAULT_GAS_ENDPOINT;
  }
}

export function saveGasUrl(url: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_GAS_URL, url.trim());
  } catch (err) {
    console.error('Failed to save GAS endpoint URL:', err);
  }
}

export interface GasFetchResult {
  success: boolean;
  books: Book[];
  raw?: unknown;
  error?: string;
  timestamp: string;
}

/**
 * Fetch books from Google Apps Script Web App
 */
export async function fetchBooksFromGAS(
  endpointUrl: string = getStoredGasUrl()
): Promise<GasFetchResult> {
  const timestamp = new Date().toISOString();
  try {
    const targetUrl = new URL(endpointUrl);
    targetUrl.searchParams.set('action', 'getBooks');
    // Add cache buster to ensure freshest data from Google Sheets
    targetUrl.searchParams.set('_t', Date.now().toString());

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(targetUrl.toString(), {
      method: 'GET',
      redirect: 'follow',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data && data.success && Array.isArray(data.books)) {
      const parsedBooks: Book[] = data.books.map((b: any, index: number) => ({
        id: String(b.id || `B${String(index + 1).padStart(3, '0')}`),
        title: String(b.title || '제목 없음'),
        author: String(b.author || '저자 미상'),
        category: String(b.category || '기타'),
        status: (b.status === '대출중' ? '대출중' : '대출가능') as Book['status'],
        coverImage: b.coverImage || b.cover || b.image || undefined,
        isFromGoogleSheet: true,
      }));

      return {
        success: true,
        books: parsedBooks,
        raw: data,
        timestamp,
      };
    } else {
      return {
        success: false,
        books: [],
        raw: data,
        error: data?.message || '응답 데이터 포맷이 올바르지 않습니다.',
        timestamp,
      };
    }
  } catch (err: any) {
    const errorMsg =
      err.name === 'AbortError'
        ? '구글 시트 응답 시간이 초과되었습니다 (12초).'
        : err.message || '구글 시트 연동 중 네트워크 오류가 발생했습니다.';
    return {
      success: false,
      books: [],
      error: errorMsg,
      timestamp,
    };
  }
}

/**
 * Try to record borrow to Google Apps Script
 */
export async function syncBorrowToGAS(
  bookId: string,
  borrowerName: string,
  dueDate: string,
  endpointUrl: string = getStoredGasUrl()
): Promise<{ success: boolean; message: string }> {
  try {
    const targetUrl = new URL(endpointUrl);
    targetUrl.searchParams.set('action', 'borrow');
    targetUrl.searchParams.set('bookId', bookId);
    targetUrl.searchParams.set('borrower', borrowerName);
    targetUrl.searchParams.set('dueDate', dueDate);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(targetUrl.toString(), {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json();
    if (data.success) {
      return { success: true, message: data.message || '구글 시트에 대출 기록이 반영되었습니다.' };
    }
    return { success: false, message: data.message || '시트 응답 실패' };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || '시트 연동 요청 실패 (로컬 시스템에는 정상 저장됨)',
    };
  }
}

/**
 * Try to record return to Google Apps Script
 */
export async function syncReturnToGAS(
  bookId: string,
  endpointUrl: string = getStoredGasUrl()
): Promise<{ success: boolean; message: string }> {
  try {
    const targetUrl = new URL(endpointUrl);
    targetUrl.searchParams.set('action', 'return');
    targetUrl.searchParams.set('bookId', bookId);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(targetUrl.toString(), {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json();
    if (data.success) {
      return { success: true, message: data.message || '구글 시트에 반납 완료가 반영되었습니다.' };
    }
    return { success: false, message: data.message || '시트 응답 실패' };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || '시트 연동 요청 실패 (로컬 시스템에는 정상 저장됨)',
    };
  }
}
