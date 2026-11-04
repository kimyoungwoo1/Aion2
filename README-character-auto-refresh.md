# 아이온2 관리 — 모든 캐릭터 하루 두 번 자동 전투력 갱신

## 동작

- 매일 **오전 6시 및 오후 6시 (한국시간, KST)** 시작하는 자동 전체 갱신을 추가합니다.
- **별도 API Worker 없이** 기존 `src/aion-api.js`를 사용해 공식 캐릭터 **검색 API + 상세 API**를 조회합니다.
- 목록의 `새로고침` **왼쪽**에 `최근 전체 갱신: 날짜 시각 · 성공/전체 명`이 표시됩니다. 갱신 중에는 진행 건수도 표시됩니다.
- 기존 개별 `전투력 갱신` 버튼과 소유자별 남툴 내림차순 정렬은 유지합니다.
- 일부 조회 실패 시 **해당 캐릭터 기존 직업/아이템 레벨/남툴/갱신 시각은 보존**하고 나머지는 계속 갱신합니다.
- `수정자`는 자동 갱신이 덮어쓰지 않습니다. 개별 캐릭터의 `전투력 갱신 시각`만 갱신됩니다.
- 기존 성역, 숙제, 오드 영구 저장, 주간 숙제 초기화는 건드리지 않습니다.
- 이번에는 **DB 마이그레이션 0016 필수**입니다. 기존 데이터는 변경/삭제되지 않고 실행 기록 테이블만 추가됩니다.

## Cloudflare Cron 시간

Cloudflare Cron은 UTC입니다.

- `0 20 * * TUE` — 수요일 오전 5시 KST: 기존 주간 초기화
- `0 12 * * WED,SAT` — 수요일·토요일 오후 9시 KST: 기존 어비스회랑 초기화
- `*/5 9,21 * * *` — KST 오전 6시~6시 55분, 오후 6시~6시 55분: 자동 갱신 배치

각 갱신 주기의 첫 실행은 **06:00 또는 18:00**에 시작합니다. 등록 캐릭터가 많으면 5분 단위로 다음 배치를 이어서 처리하며, 다 처리하면 나머지 트리거는 아무 조회도 하지 않습니다. 무료 Worker의 외부 요청 제한에 맞춰 **호출당 18캐릭터**씩 처리합니다(공식 API 요청 최대 36회). 이 구성은 한 시각의 1시간 창에 **최대 216캐릭터**까지 처리합니다. 더 많다면 Cron 창이나 배치 아키텍처를 확장해야 합니다. 타사 공식 API 상태/호출 제한에 따라 특정 캐릭터 조회가 실패할 수 있습니다.

## Codespaces 배포

ZIP을 `/workspaces/Aion2`에 업로드 후 실행:

```bash
unzip -o Aion2_Character_AutoRefresh_6AM_6PM.zip
npx wrangler d1 migrations apply aion2-db --remote
python3 scripts/enable-character-power-cron.py
node tests/test-character-power-cron.mjs
npx wrangler deploy
```

`enable-character-power-cron.py`는 사용자의 **기존 `wrangler.jsonc`를 읽어서 Cron Trigger 목록에 추가**합니다. `wrangler.jsonc`를 ZIP으로 덮어쓰지 않으며, D1 ID / Secrets / 나머지 설정을 보존하고 최초 실행 시 `.before-power-cron.bak`을 생성합니다. 기존 Cron도 유지합니다. 이미 추가된 Cron은 중복 추가하지 않습니다.

GitHub 저장도 원한다면:

```bash
git add public/app.js public/index.html src/index.js scripts/enable-character-power-cron.py migrations/0016_character_power_auto_refresh.sql tests/test-character-power-cron.mjs wrangler.jsonc README-character-auto-refresh.md
git commit -m "Schedule twice-daily character power refresh"
git push origin main
```

Cloudflare Cron 새 설정 전파에 시간이 걸릴 수 있습니다. **첫 자동 갱신 시간 전**에 적용하세요. `최근 전체 갱신: 아직 없음`은 아직 Cron 실행 기록이 없다는 의미입니다. 페이지가 열려 있을 때는 `새로고침`을 눌러 최신 자동 갱신 실행 결과를 확인할 수 있습니다.

## 확인 항목

- 캐릭터 목록 새로고침 왼쪽에 전체 갱신 시간이 보이는지
- 06:00/18:00 이후 캐릭터별 `전투력 갱신 시각`이 최신화됐는지
- 실패한 캐릭터 데이터는 보존되고 성공한 캐릭터는 갱신됐는지
- 숙제·오드·성역 데이터는 그대로인지

이 ZIP에는 `wrangler.jsonc`, `src/aion-api.js`, 기존 D1 데이터가 포함되지 않습니다.
