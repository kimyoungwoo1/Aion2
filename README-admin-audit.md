# 아이온2 관리 — 관리자 전용 변경 이력

기존 `public/app.js`, `public/index.html`, `wrangler.jsonc`를 덮어쓰지 않습니다.
`/admin`에서 관리자 비밀번호를 입력해야 변경 기록을 확인할 수 있습니다.

## 설치 (Codespaces `/workspaces/Aion2`)

1. ZIP을 프로젝트 최상위 디렉터리에 업로드합니다.
2. 파일을 추가하고 코드를 적용합니다.

```bash
unzip -o Aion2_Admin_Change_History.zip
python3 scripts/add-admin-audit.py
node --check src/index.js
node tests/test-admin-audit.mjs
python3 tests/test-admin-audit-migration.py
```

3. 관리자 비밀번호를 Cloudflare Secret으로 설정합니다. **기존 공용 `ACCESS_CODE`와 다른, 12자 이상의 긴 비밀번호**를 설정하세요. 비밀번호를 코드나 채팅에 붙여넣지 마세요.

```bash
npx wrangler secret put ADMIN_PASSWORD --name aion2
```

4. **D1 마이그레이션 성공 후에만 배포**합니다.

```bash
npx wrangler d1 migrations apply aion2-db --remote && npx wrangler deploy
```

5. `https://aion2.ksmsy1.workers.dev/admin`을 열고, 먼저 사이트 공용 로그인 상태에서 별도 관리자 비밀번호로 로그인합니다.

6. GitHub 자동 배포에서도 유지되도록 수정한 파일을 커밋하고 푸시합니다.

```bash
git add src/index.js src/admin-api.js src/audit-log.js \
  public/admin.html public/admin.js public/admin.css \
  migrations/0022_admin_audit_history.sql scripts/add-admin-audit.py \
  tests/test-admin-audit.mjs tests/test-admin-audit-migration.py README-admin-audit.md
git diff --cached --stat
git commit -m "Add admin-only change history"
git push origin main
```

## 관리자 페이지 기능

- **이후에 성공한 사용자 수정 요청**의 시간(KST), 로그인 닉네임, 작업 종류, 대상, 요청 내용, 가능한 경우 수정 전/후 값을 기록합니다.
- 캐릭터 등록/수정/삭제/전투력 갱신, 성역 일정, 파티 및 징표/비고, 숙제 완료·초기화·정렬, 오드·멤버십, 컨텐츠 일정표 서버 매칭, 문의/답글을 포함합니다.
- 관리자 이력 조회는 서버에서 **별도 비밀번호로 인증된 관리자 세션만** 허용합니다. 화면 탭에는 메뉴를 추가하지 않았습니다.
- 관리자 인증 세션은 1시간 후 만료됩니다. 5회 연속 실패 시 같은 접속 출처는 15분간 제한합니다.
- 기존 공용 로그인 인증은 유지됩니다. 로그인 비밀번호, 관리자 비밀번호, 인증 토큰, 문의 본문·답글 본문은 감사 로그에 저장하지 않습니다.
- 변경 이력은 `admin_audit_events`에 영구 저장하며 주간 일정/숙제 초기화와 무관합니다.
- **배포 이전 변경 기록은 복원할 수 없습니다.** API 변경 전/후 스냅샷이 지원되지 않는 새 기능은 요청한 필드가 우선 기록됩니다.
- 자동으로 실행되는 Cron 갱신·초기화는 사람이 수행한 변경과 구별하기 위해 현재 감사 로그에서 제외했습니다.
- **닉네임은 자유 입력 가능하므로 로그에 보이는 닉네임이 실제 사용자의 신원을 증명하지 않습니다.** 관리자 비밀번호를 가진 사람만 이력을 볼 수 있지만, 사용자 식별의 정확도를 높이려면 별도 사용자 인증 체계가 필요합니다.
- 보안 사항: `ADMIN_PASSWORD`는 다른 사람에게 알려주지 말고, 사이트에서 관리자 잠금을 눌러 세션을 종료하세요.

## 참고

- 기존 `0022_*.sql` 마이그레이션이 있으면 먼저 번호 충돌을 해결하세요.
- 코드와 마이그레이션 적용에 실패하면 배포를 진행하지 마세요.
- 기존 데이터, 성역 월요일 초기화 시각, 숙제 수요일 초기화, `오드구매&제작`, `카이라` 명칭, 컨텐츠 일정표 로고 제거는 수정하지 않습니다.
