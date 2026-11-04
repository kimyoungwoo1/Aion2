# 아이온2 관리 - 멤버십 체크박스 + 오드 입력 상한 (2026-10-29)

## 변경 내용

- 숙제 표의 `오드구매` 오른쪽에 **멤버십** 체크박스를 추가했습니다. 기존 오드1 아래의 일반/멤버십 선택 메뉴는 제거했습니다.
- 체크: 오드1 3시간마다 +15, 일반적인 회복 상한 840. 해제: 3시간마다 +10, 일반 회복 상한 560. 기존에 560을 넘게 입력된 합법적인 보유값(최대 840)은 체크 해제 시 임의로 깎지 않습니다.
- **수기 입력 상한은 멤버십 여부와 무관하게** 오드1 `840`, 오드2 `2,000`입니다. 초과/음수/비정수 입력 시 해당 칸 아래에 즉시 오류를 표시하고 저장하지 않습니다. 서버 API에서도 같은 상한을 검증합니다.
- 오드합 = 현재 예상 오드1 + 수기 입력 오드2입니다. 숙제 완료/오드 저장/멤버십 체크는 각각 독립적으로 저장됩니다.
- 오드1과 오드2는 **매주 초기화되지 않습니다**. 기존 오전/오후 전투력 자동 갱신, 숙제 정렬, 파티/징표/비고도 그대로 유지됩니다.

## 기존 데이터 이전 (신규 D1 마이그레이션 필수)

- `0018_homework_od_caps_membership_default.sql`은 **멤버십 미설정(NULL)을 일반(0)**로 변경하고, 기존 입력 잔량을 기준으로 마이그레이션 시점부터 일반 회복을 시작합니다. 과거 회복량을 소급 추가하지 않습니다.
- 기존에 오드1이 840을 넘거나 오드2가 2000을 넘었다면 새 상한으로 조정합니다. 조정 전 잔량은 `homework_od_limit_backup_20261029` 테이블에 남깁니다. 기존 숙제·주차·파티·정렬 기록은 수정하지 않습니다.
- 이미 멤버십 설정을 저장한 캐릭터는 설정과 기존 기준 시각이 유지됩니다.

## Codespaces 적용

ZIP을 `/workspaces/Aion2` 프로젝트 최상위에 업로드한 후:

```bash
unzip -o Aion2_Membership_Checkbox_Od_Limits.zip
npx wrangler d1 migrations apply aion2-db --remote
node tests/test-membership-checkbox-caps.mjs
node tests/test-od-auto-recovery.mjs
node tests/test-homework-od.mjs
node tests/test-homework-order.mjs
npx wrangler deploy
```

`wrangler.jsonc`, D1 ID, Cron, 세션 Secret, `src/aion-api.js`는 ZIP에 포함하지 않았습니다. 이 변경 패치는 이전 `Aion2_Od1_Auto_Recovery.zip`이 적용된 상태를 기준으로 합니다.

## 한계

오드1 자동 회복은 게임 서버에서 실제 잔량을 조회하지 않고 수기 입력값·기준 시각·멤버십 여부로 **예상치**를 계산합니다. 게임 내 사용량과 유료 보상은 자동 반영되지 않습니다. 값이 달라지면 다시 수기로 입력하세요.
