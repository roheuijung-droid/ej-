import React, { useState } from 'react';
import { LoanRecord } from '../types/library';
import {
  Download,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  Calendar,
} from 'lucide-react';

interface HistoryLogViewProps {
  loans: LoanRecord[];
}

export const HistoryLogView: React.FC<HistoryLogViewProps> = ({ loans }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'ongoing'>('all');

  const filteredLogs = loans.filter((loan) => {
    if (statusFilter === 'completed' && loan.status !== '반납완료') return false;
    if (statusFilter === 'ongoing' && loan.status === '반납완료') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        loan.bookTitle.toLowerCase().includes(q) ||
        loan.bookId.toLowerCase().includes(q) ||
        loan.borrowerName.toLowerCase().includes(q) ||
        loan.borrowerContact.includes(q) ||
        (loan.notes && loan.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['대출번호', '도서ID', '도서명', '대출자', '연락처', '소속', '대출일', '반납예정일', '실제반납일', '상태', '연장횟수', '비고'];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.bookId,
      `"${l.bookTitle.replace(/"/g, '""')}"`,
      `"${l.borrowerName.replace(/"/g, '""')}"`,
      l.borrowerContact,
      `"${(l.borrowerOrg || '').replace(/"/g, '""')}"`,
      l.borrowDate,
      l.dueDate,
      l.returnDate || '',
      l.status,
      l.renewCount,
      `"${(l.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `도서관_대출이력_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const completedCount = loans.filter((l) => l.status === '반납완료').length;
  const ongoingCount = loans.filter((l) => l.status !== '반납완료').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            도서관 대출·반납 이용 이력
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            누적 대출 및 반납 트랜잭션 기록을 조회하고 엑셀/CSV로 다운로드할 수 있습니다.
          </p>
        </div>

        <button
          onClick={exportToCSV}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>CSV 내보내기</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            전체 내역 ({loans.length})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              statusFilter === 'completed'
                ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            반납 완료 ({completedCount})
          </button>
          <button
            onClick={() => setStatusFilter('ongoing')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              statusFilter === 'ongoing'
                ? 'bg-white text-blue-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            대출 진행 중 ({ongoingCount})
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="도서명, 도서ID, 대출자 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <FileSpreadsheet className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">조회된 이력 데이터가 없습니다.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/75">
                  <th className="py-3 px-4 font-semibold">대출 번호</th>
                  <th className="py-3 px-4 font-semibold">도서 정보</th>
                  <th className="py-3 px-4 font-semibold">대출자</th>
                  <th className="py-3 px-4 font-semibold">대출 일시</th>
                  <th className="py-3 px-4 font-semibold">반납 예정일</th>
                  <th className="py-3 px-4 font-semibold">실제 반납일</th>
                  <th className="py-3 px-4 font-semibold">최종 상태</th>
                  <th className="py-3 px-4 font-semibold">비고</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => {
                  const isReturned = log.status === '반납완료';

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-500">
                        {log.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 text-sm">
                          {log.bookTitle}
                        </div>
                        <div className="text-[11px] text-blue-700 font-mono mt-0.5">
                          {log.bookId}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">{log.borrowerName}</div>
                        <div className="text-[11px] text-slate-500">{log.borrowerContact}</div>
                      </td>
                      <td className="py-3 px-4 tabular-nums text-slate-600">
                        {log.borrowDate}
                      </td>
                      <td className="py-3 px-4 tabular-nums text-slate-700 font-medium">
                        {log.dueDate}
                      </td>
                      <td className="py-3 px-4 tabular-nums text-emerald-700 font-medium">
                        {log.returnDate || '-'}
                      </td>
                      <td className="py-3 px-4">
                        {isReturned ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>반납 완료</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            <Clock className="w-3 h-3" />
                            <span>대출 중</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {log.notes || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
