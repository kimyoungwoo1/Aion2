# 아이온2 관리자 변경 이력 — 접속 IP 기록 및 검색

현재 설치된 **관리자 변경 이력 기능(0022 마이그레이션 포함)**을 확장합니다. **일반 사이트의 `public/app.js`, `public/index.html`, `src/index.js`, `wrangler.jsonc`는 교체하지 않습니다.** 기존에 사용자가 직접 변경한 `오드구매&제작`, `카이라` 표시도 보존합니다.

## 적용

ZIP을 `/workspaces/Aion2` 프로젝트 루트에 업로드한 다음 순서대로 실행합니다.

```bash
unzip -o Aion2_Admin_Audit_IP_History.zip
python3 scripts/add-admin-audit-ip.py
node tests/test-admin-audit.mjs
node tests/test-admin-audit-ip.mjs
python3 tests/test-admin-audit-ip-migration.py
npx wrangler d1 migrations apply aion2-db --remote && npx wrangler deploy
```

* **중요:** 먼저 기존 관리자 감사 로그(0022)가 정상 적용되어 있어야 합니다. 새 DB 마이그레이션은 `0023_admin_audit_ip.sql`이며, 같은 번호의 다른 마이그레이션이 이미 있다면 패치 스크립트가 적용을 중단합니다. 해당 경우 번호 충돌을 먼저 확인하세요.
* 데이터 손실 우려가 있다면 먼저 `npx wrangler d1 export aion2-db --remote --output aion2-db-before-audit-ip.sql`로 백업하세요.
* 새 IP 컬럼을 추가하므로 **D1 마이그레이션이 필수**입니다. 기존 마이그레이션 오류가 있으면 모두 해결한 뒤 적용하세요. 마이그레이션이 실패하면 `&&` 때문에 Worker는 배포되지 않습니다.
* 패치 스크립트는 파일 앵커를 사전 검사하고 기존 관리자 파일의 백업을 `.aion2-backups/audit-ip/`에 만듭니다. 재실행할 수 있습니다.
* GitHub 자동 배포에서 구버전으로 돌아가지 않도록 다음도 실행하세요.

```bash
git add src/audit-log.js src/admin-api.js \
  public/admin.html public/admin.js public/admin.css \
  migrations/0023_admin_audit_ip.sql \
  scripts/add-admin-audit-ip.py \
  tests/test-admin-audit.mjs tests/test-admin-audit-ip.mjs tests/test-admin-audit-ip-migration.py \
  README-admin-audit-ip.md
git diff --cached --stat
git commit -m "Record visitor IP in admin change history"
git push origin main
```

## 변경 사항

- 접속 IP: Cloudflare의 `CF-Connecting-IP` 요청 헤더 값을 서버가 수집합니다. 브라우저에서 보내는 JSON 또는 `X-Forwarded-For` 값을 IP 기록에 사용하지 않습니다.
- D1 `admin_audit_events.actor_ip` 필드에 **성공한 사용자 변경 요청 시** 저장합니다. 실패·조회 요청이나 로그인 비밀번호는 기록하지 않습니다.
- `/admin` 변경 이력 목록에 **IP 주소 열**을 추가하고, IP 주소 검색도 제공합니다.
- IP를 비롯한 감사 로그는 기존과 동일하게 **관리자 비밀번호로 인증한 세션만 API에서 조회**할 수 있습니다. 일반 사이트 사용자 화면에는 IP가 노출되지 않습니다.
- 변경 이력에 이미 있던 과거 데이터는 그대로 보존하며, **과거 기록의 IP는 `기록 없음`**으로 보입니다. IP는 이번 기능 배포 이후부터 수집됩니다.
- 자동 Cron 작업은 사용자 변경 요청이 아니므로 IP 기록 대상이 아닙니다.

## 운영 유의 사항

IP 주소는 개인 식별 가능성이 있는 개인정보입니다. 이용자에게 수집 목적·관리자 열람·보관 기간을 명확히 안내하고, 접근 제어 및 필요 이상 장기 보관 방지 정책을 마련하세요. 현재 패치는 기존 이력 보관 방식을 변경하거나 자동 삭제 정책을 추가하지 않습니다.

공인 IP가 같더라도 사무실/공유기/NAT 사용자가 여럿일 수 있고 VPN/모바일망 사용 시 IP가 변할 수 있으므로, **IP만으로 사용자 동일성을 확정하거나 제재하지 마세요.** 로그인 닉네임도 현재 자유롭게 설정할 수 있어 실제 신원을 보장하지 않습니다. Cloudflare의 일부 Worker 간 하위 요청에서는 IP 헤더가 다른 값으로 변환될 수 있으므로, 직접 접속하는 일반 사용자 요청 기준으로 사용하세요.
