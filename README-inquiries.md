# 아이온2 관리 - 문의사항 게시판

기존 **컨텐츠 일정표** 오른쪽에 **문의사항** 탭을 추가합니다.

## 동작

- 공용 접속 코드로 로그인한 사용자가 제목(최대 100자)과 본문(최대 2,000자)을 작성하여 문의를 등록합니다.
- 문의 작성자는 로그인한 닉네임으로 자동 기록되고, 작성 시각은 한국시간으로 표시됩니다.
- 로그인한 사용자 누구나 최신 문의를 읽고 답글(최대 1,000자)을 작성할 수 있습니다.
- 내 문의만 보기, 20개씩 페이지 이동, 목록 새로고침을 지원합니다.
- 문의 내용과 답글은 Cloudflare D1에 저장되므로 배포/주간 초기화 후에도 남습니다.
- 무분별한 연속 등록을 줄이기 위해 동일 닉네임 문의 15초, 답글 5초 간격을 둡니다.
- 모든 텍스트는 HTML로 실행하지 않고 텍스트로 표시합니다.

**주의:** 공용 접속 코드와 자유로운 닉네임 방식에서는 실제 본인 확인이 되지 않습니다. 게시글은 공용 접속 코드로 로그인한 누구나 읽을 수 있습니다. 별도 관리자 권한이나 비공개 문의 기능은 없으며, 비밀번호/개인정보를 올리지 마세요.

## 적용 방법 (Codespaces /workspaces/Aion2)

1. ZIP을 `/workspaces/Aion2`에 업로드 후 아래 명령을 실행하세요.

```bash
unzip -o Aion2_Inquiries_Board_Tab.zip
python3 scripts/add-inquiries-board.py
node tests/test-inquiries.mjs
python3 tests/test-inquiries-migration.py
```

2. 반드시 D1 마이그레이션을 먼저 적용한 다음 배포하세요.

```bash
npx wrangler d1 migrations apply aion2-db --remote && npx wrangler deploy
```

3. GitHub 자동 배포가 예전 소스로 덮어쓰지 않도록 **변경된 소스와 새 파일을 함께** Push하세요.

```bash
git add public/index.html public/app.js public/inquiries.js public/inquiries.css \
  src/index.js src/inquiries-api.js migrations/0021_inquiries_board.sql \
  scripts/add-inquiries-board.py tests/test-inquiries.mjs tests/test-inquiries-migration.py README-inquiries.md
git diff --cached --stat
git commit -m "Add inquiry board and replies"
git push origin main
```

**기존 `wrangler.jsonc`는 변경하지 않습니다.** 추가 Cron도 필요하지 않습니다. 기존 캐릭터·성역·숙제·오드·컨텐츠 일정표 데이터는 수정하지 않습니다.

패치는 기존 `public/index.html`, `public/app.js`, `src/index.js` 파일의 필요한 부분만 수정하며 원본은 프로젝트의 `.aion2-backups/` 폴더에 최초 1회 백업합니다. 이 폴더는 Git에 올리지 마세요.

신규 D1 마이그레이션 이름은 `0021_inquiries_board.sql`입니다. 프로젝트에 **다른 `0021_...sql` 마이그레이션이 이미 존재한다면** 충돌 여부를 확인하고 적절한 다음 번호로 이름을 조정해야 합니다.

## 추가되는 파일

- `public/inquiries.js`: 문의 게시판 화면 동작
- `public/inquiries.css`: 문의 게시판 스타일
- `src/inquiries-api.js`: 인증된 문의/답글 API
- `migrations/0021_inquiries_board.sql`: 문의/답글 D1 테이블과 인덱스
- `scripts/add-inquiries-board.py`: 현재 HTML/JS/Worker에 변경사항만 추가하는 스크립트
- `tests/test-inquiries.mjs`, `tests/test-inquiries-migration.py`: 기능 및 스키마 검증

UI/코드 변경 시 이전 요청한 **오드구매&제작**, **카이라**, **컨텐츠 일정표 로고 제거** 기준도 적용/유지합니다.
