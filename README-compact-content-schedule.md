# 아이온2 컨텐츠 일정표 간결화 + 서버 매칭표 웹 관리

- 기존 일정표를 가로 폭 1250px 이하, 축소된 글꼴/행 높이/카드로 표시
- 서버 매칭표는 기본 접힘. 펼치면 1~3그룹의 21개 서버와 수정 버튼 표시
- 시작일/종료일과 21개 매칭을 입력 후 **서버 매칭표 저장**하면 D1에 보관
- 이후 2주마다 **사이트에서 직접 수정**. Codespaces 업로드, GitHub Push, Worker 배포는 불필요
- 복수 로그인 닉네임이 최신 DB 값을 공유함 (단, 현재의 공용 접속 코드 인증 사용자 누구나 수정할 수 있음)
- 기존 HTML 이미지 매칭은 D1이 비어 있을 때 초기값으로 표시. 최초 저장 후부터 D1 값 우선
- 기존 캐릭터·숙제·오드1·오드2·멤버십·오드구매&제작·파티 데이터 및 Cron 설정 변경 없음
- 새 마이그레이션 `0020_content_schedule_server_matches.sql`은 새 테이블을 생성할 뿐 기존 데이터를 수정하지 않음

## Codespaces 적용

```bash
unzip -o Aion2_Compact_Schedule_Editable_Matches.zip
python3 scripts/compact-content-schedule.py
node --check public/app.js
node --check public/content-schedule-manage.js
node --check src/index.js
npx wrangler d1 migrations apply aion2-db --remote
npx wrangler deploy
```

**마이그레이션 실패 시 배포를 진행하지 마세요.** 기존 D1 `od1_membership` 이슈가 남아 있다면 먼저 해당 마이그레이션을 복구해야 합니다.

GitHub 자동 배포가 이전 파일로 덮어쓰지 않도록 다음도 실행하세요.

```bash
git add public/index.html public/content-schedule.css public/content-schedule-manage.js src/index.js migrations/0020_content_schedule_server_matches.sql scripts/compact-content-schedule.py
git commit -m "Compact schedule and store server matches in D1"
git push origin main
```

기존 소스는 프로젝트의 `.aion2-backups/`에 백업됩니다. **이 폴더는 Git에 추가하지 마세요.**

## 2주마다 매칭표 변경하는 법

1. **컨텐츠 일정표** 탭 → **서버 매칭표 펼치기**
2. **서버 매칭 수정** 클릭
3. 새 적용 시작일/종료일 입력
4. 21개 줄의 **번호[탭]서부[탭]동부** 수정. 엑셀 3열을 복사해서 그대로 붙여넣을 수 있음
5. **매칭표 저장** 클릭. 새로고침하거나 다른 PC에서도 변경된 표가 표시됨.

번호 1~21은 각 1~3그룹에 정해져 있으며, 해당 숫자에 따라 그룹이 자동으로 결정됩니다. 수정 내용은 브라우저에만 저장되지 않고 공통 D1 테이블에 반영됩니다.

추후 운영자 전용 수정 권한을 별도로 구성하려면 관리자 인증을 추가해야 합니다. 지금 방식은 기존 공용 접속 코드 인증을 그대로 따릅니다.
