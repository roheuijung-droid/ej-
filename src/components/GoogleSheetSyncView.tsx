import React, { useState } from 'react';
import { DEFAULT_GAS_ENDPOINT } from '../services/gasService';
import {
  FileSpreadsheet,
  Check,
  Copy,
  ExternalLink,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Code2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface GoogleSheetSyncViewProps {
  currentUrl: string;
  onSaveUrl: (newUrl: string) => void;
  onSync: () => void;
  isSyncing: boolean;
  lastSyncTime: string | null;
  sheetBookCount: number;
}

export const GoogleSheetSyncView: React.FC<GoogleSheetSyncViewProps> = ({
  currentUrl,
  onSaveUrl,
  onSync,
  isSyncing,
  lastSyncTime,
  sheetBookCount,
}) => {
  const [inputUrl, setInputUrl] = useState(currentUrl);
  const [copied, setCopied] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'testing' | 'success' | 'error';
    message?: string;
    count?: number;
  }>({ status: 'idle' });

  const sampleAppsScriptCode = `/**
 * 구글 시트 도서관 관리 시스템 웹 앱 스크립트 (Code.gs 최신 버전)
 * - 6개 열 지원: 도서ID(A), 제목(B), 저자(C), 분야(D), 상태(E), 표지이미지(F)
 * - '도서목록' 시트 및 '대출기록' 시트 자동 양방향 연동
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "getBooks";
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("도서목록") || ss.getSheets()[0];

  // 1. 도서 목록 전체 조회 (getBooks) - 표지 이미지(F열) 포함
  if (action === "getBooks") {
    var data = sheet.getDataRange().getValues();
    var books = [];
    for (var i = 1; i < data.length; i++) {
      if (!data[i][0]) continue;
      books.push({
        id: String(data[i][0]),
        title: String(data[i][1] || ""),
        author: String(data[i][2] || ""),
        category: String(data[i][3] || "기타"),
        status: String(data[i][4] || "대출가능"),
        coverImage: String(data[i][5] || "") // F열: 표지 이미지 URL (선택)
      });
    }
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      books: books,
      count: books.length
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // 2. 도서 대출 처리 (borrow) -> 도서목록 E열을 '대출중'으로 변경 & 대출기록 시트에 기록
  if (action === "borrow") {
    var bookId = e.parameter.bookId;
    var borrower = e.parameter.borrower || "이용자";
    var dueDate = e.parameter.dueDate || "";
    var data = sheet.getDataRange().getValues();
    var found = false;

    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(bookId)) {
        sheet.getRange(i + 1, 5).setValue("대출중");
        found = true;
        break;
      }
    }

    // 대출기록 시트가 없으면 자동 생성 후 기록
    var logSheet = ss.getSheetByName("대출기록");
    if (!logSheet) {
      logSheet = ss.insertSheet("대출기록");
      logSheet.appendRow(["대출일시", "도서ID", "대출자", "반납예정일", "상태", "실제반납일"]);
    }
    logSheet.appendRow([new Date(), bookId, borrower, dueDate, "대출중", ""]);

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: found ? "대출 상태가 시트에 성공적으로 반영되었습니다." : "도서ID를 찾을 수 없습니다."
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // 3. 도서 반납 처리 (return) -> 도서목록 E열을 '대출가능'으로 복구 & 대출기록 시트 상태 갱신
  if (action === "return") {
    var bookId = e.parameter.bookId;
    var data = sheet.getDataRange().getValues();
    var found = false;

    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(bookId)) {
        sheet.getRange(i + 1, 5).setValue("대출가능");
        found = true;
        break;
      }
    }

    // 대출기록 시트의 최근 대출 상태를 '반납완료'로 갱신
    var logSheet = ss.getSheetByName("대출기록");
    if (logSheet) {
      var logData = logSheet.getDataRange().getValues();
      for (var j = logData.length - 1; j >= 1; j--) {
        if (String(logData[j][1]) === String(bookId) && String(logData[j][4]) === "대출중") {
          logSheet.getRange(j + 1, 5).setValue("반납완료");
          logSheet.getRange(j + 1, 6).setValue(new Date());
          break;
        }
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: found ? "반납 처리가 시트에 성공적으로 반영되었습니다." : "도서ID를 찾을 수 없습니다."
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // 4. 신규 도서 등록 (addBook)
  if (action === "addBook") {
    var newId = e.parameter.id;
    var title = e.parameter.title || "";
    var author = e.parameter.author || "";
    var category = e.parameter.category || "기타";
    var coverImage = e.parameter.coverImage || "";

    sheet.appendRow([newId, title, author, category, "대출가능", coverImage]);

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "신규 도서가 시트에 등록되었습니다."
    })).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({
    success: false,
    message: "올바르지 않은 action 값입니다."
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  // POST 요청 시 doGet으로 동일하게 처리
  return doGet(e);
}`;

  const copyCode = () => {
    navigator.clipboard.writeText(sampleAppsScriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTestConnection = async () => {
    setTestResult({ status: 'testing' });
    try {
      const url = new URL(inputUrl);
      url.searchParams.set('action', 'getBooks');
      url.searchParams.set('_t', Date.now().toString());

      const res = await fetch(url.toString(), { method: 'GET', redirect: 'follow' });
      const data = await res.json();

      if (data && data.success && Array.isArray(data.books)) {
        setTestResult({
          status: 'success',
          message: `연결 성공! 현재 시트에서 ${data.books.length}권의 도서 정보를 불러왔습니다.`,
          count: data.books.length,
        });
      } else {
        setTestResult({
          status: 'error',
          message: data.message || '시트 응답 포맷이 일치하지 않습니다.',
        });
      }
    } catch (err: any) {
      setTestResult({
        status: 'error',
        message: err.message || '엔드포인트 연결에 실패했습니다. URL을 확인해 주세요.',
      });
    }
  };

  const handleSave = () => {
    onSaveUrl(inputUrl);
  };

  const handleResetDefault = () => {
    setInputUrl(DEFAULT_GAS_ENDPOINT);
    onSaveUrl(DEFAULT_GAS_ENDPOINT);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
          <span>구글 시트 (Apps Script) 연동 관리</span>
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          현재 연결된 Google Apps Script 웹 앱 엔드포인트를 확인하고 연동 스크립트를 관리합니다.
        </p>
      </div>

      {/* Connection Status & URL Setting */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">구글 웹 앱 엔드포인트 URL</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Google Apps Script에서 "배포 &gt; 새 배포 &gt; 웹 앱"을 통해 발급받은 URL입니다.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              연동 도서: <strong className="text-emerald-700">{sheetBookCount}권</strong>
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-mono">
              {lastSyncTime ? `최종: ${lastSyncTime.split(' ')[1]}` : '미동기화'}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/.../exec"
            className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
          <button
            onClick={handleTestConnection}
            disabled={testResult.status === 'testing'}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
          >
            {testResult.status === 'testing' ? '테스트 중...' : '연결 테스트'}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap"
          >
            URL 저장
          </button>
          <button
            onClick={handleResetDefault}
            className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap"
          >
            기본값 복원
          </button>
        </div>

        {/* Test Result Message */}
        {testResult.status !== 'idle' && (
          <div
            className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
              testResult.status === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : testResult.status === 'error'
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : 'bg-blue-50 text-blue-800'
            }`}
          >
            {testResult.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
            {testResult.status === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
            <span>{testResult.message || '연결 확인 중...'}</span>
          </div>
        )}
      </div>

      {/* Guide & Script Template */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-blue-600" />
              <span>구글 스프레드시트 양방향 연동 Apps Script 가이드</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              사용자님의 구글 시트에서 대출/반납 시 상태 열을 실시간으로 갱신하려면 아래 코드를 붙여넣기 하세요.
            </p>
          </div>

          <button
            onClick={copyCode}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg transition-colors shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">복사 완료!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>코드 복사</span>
              </>
            )}
          </button>
        </div>

        {/* Step Guide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <span className="font-bold text-blue-700 block mb-1">01. 구글 시트 열 구성</span>
            <p className="text-slate-600 leading-relaxed">
              시트 이름: <strong>'도서목록'</strong><br />
              1행 헤더: <strong>A(도서ID) · B(제목) · C(저자) · D(분야) · E(상태) · F(표지이미지)</strong>
            </p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <span className="font-bold text-blue-700 block mb-1">02. 스크립트 붙여넣기</span>
            <p className="text-slate-600 leading-relaxed">
              구글 시트 상단 메뉴 <strong>확장 프로그램 &gt; Apps Script</strong>를 열고 아래 코드를 그대로 붙여넣고 저장합니다.
            </p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <span className="font-bold text-blue-700 block mb-1">03. 웹 앱 배포</span>
            <p className="text-slate-600 leading-relaxed">
              우측 상단 <strong>배포 &gt; 새 배포</strong> (유형: 웹 앱, 액세스 권한: <strong>모든 사용자</strong>) 후 생성된 URL을 연동합니다.
            </p>
          </div>
        </div>

        {/* Code Box */}
        <div className="relative">
          <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg text-[11px] font-mono overflow-x-auto max-h-96 leading-relaxed">
            <code>{sampleAppsScriptCode}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
