# 📚 스마트 도서관 관리 시스템 (Smart Library Hub)

구글 스프레드시트(Google Sheets) 및 Google Apps Script(GAS)와 실시간 연동되는 도서관 대출·반납 및 도서 추천 관리 웹 애플리케이션입니다.

![Tech Stack](https://img.shields.io/badge/React-19-blue)
![Build](https://img.shields.io/badge/Vite-8-purple)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-cyan)
![Deployment](https://img.shields.io/badge/Vercel-Ready-black)

---

## ✨ 주요 기능

1. **실시간 구글 시트 연동 (`action=getBooks`)**
   - 구글 스프레드시트에 등록된 도서 목록을 실시간으로 가져옵니다.
   - 앱 내에서 대출 및 반납 처리 시 구글 시트의 상태 열(E열) 및 '대출기록' 시트에 즉시 반영됩니다.

2. **반납 예정 도서 집중 모니터링 (3일 이내 임박 & 연체)**
   - 반납 기한이 3일 이내로 다가온 도서(`D-3`, `D-2`, `D-1`, `오늘 반납`) 및 연체 도서를 대시보드 상단에 시각적으로 강조.
   - 위젯 내에서 **[즉시 반납]** 및 **[연장 (+7일)]** 처리 가능.

3. **사서 추천 도서 큐레이션 위젯**
   - 도서 표지 사진 및 추천 한마디가 포함된 추천 도서 위젯.
   - IT/AI, 인문/교양, 자연과학 등 분야별 필터 및 즉시 대출 지원.

4. **도서 표지 그림 (Book Covers)**
   - 고해상도 북 커버 이미지 지원 및 미등록 시 분야별 고급 북자켓 디자인 자동 생성.
   - 신규 도서 등록 시 표지 이미지 웹 링크(URL) 등록 지원.

5. **도서 검색, 대출 이력 및 CSV 내보내기**
   - 도서명, 저자, 분야, ID별 실시간 검색.
   - 누적된 대출·반납 트랜잭션 기록을 엑셀/CSV로 다운로드.

---

## 🚀 깃허브(GitHub) 업로드 방법

터미널에서 아래 명령어를 실행하여 깃허브 저장소로 푸시합니다.

```bash
# 1. git 초기화 (이미 되어있다면 생략)
git init

# 2. 파일 추가 및 커밋
git add .
git commit -m "feat: 스마트 도서관 웹앱 및 Vercel 배포 설정 완료"

# 3. 기본 브랜치 이름을 main으로 변경
git branch -M main

# 4. 깃허브 원격 저장소 연결 (본인의 저장소 URL 입력)
git remote add origin https://github.com/사용자이름/저장소이름.git

# 5. 깃허브로 푸시
git push -u origin main
```

---

## ⚡ 버셀(Vercel) 배포 가이드

1. **[Vercel](https://vercel.com)에 로그인**합니다.
2. **"Add New..." > "Project"**를 클릭하고 방금 올린 **GitHub 저장소를 Import**합니다.
3. 프로젝트 설정(Configure Project)을 확인합니다:
   - **Framework Preset**: `Vite` (자동 감지됨)
   - **Root Directory**: `./` (기본값)
   - **Build Command**: `npm run build` (자동 설정)
   - **Output Directory**: `dist` (자동 설정)
4. *(선택사항)* **Environment Variables (환경 변수)** 설정:
   - Name: `VITE_GAS_ENDPOINT`
   - Value: `본인의 Google Apps Script 웹 앱 URL`
5. **[Deploy]** 버튼을 누르면 1분 내로 배포가 완료되고 고유 도메인(`https://your-project.vercel.app`)이 발급됩니다!

---

## 📑 구글 시트 및 Google Apps Script 설정

### 1. 구글 스프레드시트 열 구성 ('도서목록' 시트)
| A열 (도서ID) | B열 (제목) | C열 (저자) | D열 (분야) | E열 (상태) | F열 (표지이미지) |
|---|---|---|---|---|---|
| B001 | 파이썬 코딩의 기술 | 길도 밴 로섬 | IT/프로그래밍 | 대출가능 | https://... |
| B002 | 인공지능의 미래 | 샘 알트만 | IT/AI | 대출가능 | https://... |
| B003 | 클린 코드 | 로버트 C. 마틴 | IT/프로그래밍 | 대출가능 | https://... |

### 2. Google Apps Script 배포 (`Code.gs`)
구글 시트 메뉴의 **확장 프로그램 > Apps Script**에 들어가 `Code.gs`에 아래 코드를 붙여넣고 저장한 후, **배포 > 새 배포 (웹 앱, 액세스 권한: 모든 사용자)**로 배포하세요.

```javascript
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "getBooks";
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("도서목록") || ss.getSheets()[0];

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
        coverImage: String(data[i][5] || "")
      });
    }
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      books: books,
      count: books.length
    })).setMimeType(ContentService.MimeType.JSON);
  }

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

    var logSheet = ss.getSheetByName("대출기록");
    if (!logSheet) {
      logSheet = ss.insertSheet("대출기록");
      logSheet.appendRow(["대출일시", "도서ID", "대출자", "반납예정일", "상태", "실제반납일"]);
    }
    logSheet.appendRow([new Date(), bookId, borrower, dueDate, "대출중", ""]);

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: found ? "대출 완료" : "도서 없음"
    })).setMimeType(ContentService.MimeType.JSON);
  }

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
      message: found ? "반납 완료" : "도서 없음"
    })).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({
    success: false,
    message: "올바르지 않은 action 값입니다."
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  return doGet(e);
}
```

---

## 💻 로컬 개발 환경 실행

```bash
# 패키지 설치
npm install

# 개발 서버 실행 (포트 3000)
npm run dev

# 프로덕션 빌드
npm run build
```
