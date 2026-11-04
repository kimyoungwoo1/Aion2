# 아이온2 관리 — 수요일 초기화 / 성역 4포스 / 개인 숙제 잠금 제거

이번 업데이트는 기존 Codespaces 프로젝트 루트에서 덮어쓰는 **평면 ZIP**입니다.

## 반영 내용
- 성역 일정·숙제 초기화: 매주 **수요일 00:00 KST** (2026-10-28~2026-11-03 주간)
- 요일 순서: 수·목·금·토·일·월·화
- 모두 참여 가능한 날: `수요일 (가능)` 또는 `목요일 (오후)`만 한 번씩 표시
- 파티 편성: **1~4포스**, 각 포스에 **1·2파티**, 파티당 5명
- 기존 D1 `party_number` 1~8: `1포스1파티`, `1포스2파티`, ... `4포스2파티` 순서로 표기 (데이터 유지)
- 숙제 화면: **개인 코드/잠금/발급 UI 및 API 없이** 로그인 닉네임 기준 캐릭터만 표시, 소유자 검증 유지
- `0007` 마이그레이션에서 예전 개인 잠금 DB 테이블 삭제
- 기존 공용 `ACCESS_CODE`·세션 쿠키·Worker/D1/API Service Binding 변경하지 않음

## 배포 전에 중요
이번 SQL은 이전 **월~일 주간 데이터**를 새로운 **수~화 주간**으로 이전합니다.
기존 배열 중 수~일 상태는 보존되고, 새 주의 월·화는 미입력으로 시작합니다.
숙제 완료는 수요일 00시(KST) 이후 완료한 항목만 보존합니다.
**운영 DB를 먼저 백업**하세요. 0007은 `0006_weekly_homework.sql`까지 적용된 상태를 전제로 합니다.

```bash
npx wrangler d1 export aion2-db --remote --output=../aion2-db-before-wednesday.sql
unzip -o Aion2_Wednesday_Force4_NoHomeworkLock.zip
python3 scripts/enable-wednesday-reset.py
npx wrangler d1 migrations apply aion2-db --remote
npx wrangler deploy
```

기존 `wrangler.jsonc`는 ZIP에 없습니다. Cron 변경 스크립트는 기존 DB UUID, `services`, `secrets` 등을 유지하고 이전 `0 15 * * SUN`을 `0 15 * * TUE`로 교체합니다.
배포 후 캐시가 남는다면 **Ctrl+Shift+R**로 새로고침하세요. `public/index.html`의 스크립트 버전 쿼리도 변경되었습니다.

## 숙제 접근 방식
- `슬롱`으로 로그인: `characters.owner_name = '슬롱'`인 캐릭터만 조회/수정
- **개인 잠금 코드는 전혀 필요하지 않습니다.** `HOMEWORK_ADMIN_CODE` Secret도 필요하지 않습니다.
- 다만 공용 접속 코드는 **닉네임 자체의 소유권을 증명하지 않기 때문에**, 다른 사람이 '슬롱'이라는 닉네임으로 로그인하는 것까지 방지하지는 못합니다.

## 확인
1. `curl -i https://aion2.ksmsy1.workers.dev/api/me` → 세션 없을 때 JSON 401
2. 성역 주간 표기: **2026-10-28 ~ 2026-11-03**
3. 가능한 요일: `수요일 (가능)` / `목요일 (오후)` 형식
4. 파티 편성: 1~4포스 각각 2개 파티, 총 8개 파티
5. 숙제 탭: 개인 코드 화면이 없고 본인 소유 캐릭터만 표시
6. 다음 주: 수요일 자동 초기화 안내문 표시
