# 아이온2 관리 - 오드1 다음 회복 카운트다운 + 4/3성역 일정 비고 공유

## 변경사항

- 숙제 현황의 `어비스회랑: 수·토 21:00 초기화` 오른쪽에 `오드1 다음 자연회복까지 HH:MM:SS (HH:MM 예정)`을 표시합니다.
- 한국시간 02·05·08·11·14·17·20·23시를 기준으로 **초 단위 자동 갱신**합니다. 기존 `public/od-recovery.js`의 `nextOdRecoveryAt()`을 재사용하므로 실제 오드1 계산 로직과 시각이 일치합니다. 별도의 API, DB 접근, Cron이 추가되지 않습니다.
- 4성역·3성역의 **참여 일정 비고**를 주차+닉네임 기준으로 공통 저장/조회합니다. 2성역 일정 비고와 **캐릭터별 파티 비고**는 그대로 독립 유지합니다.
- 신규 마이그레이션 `0019_shared_sanctuary_schedule_notes.sql`: 예전 4/3 비고가 서로 다른 경우 최신 수정 시각의 **비어 있지 않은 비고**를 공통 비고로 복사합니다. 수정 시각이 같다면 4성역 비고를 우선합니다. 이전 지역별 원본 비고는 삭제하지 않습니다.
- 새 비고 데이터 역시 다른 주간 일정과 마찬가지로 수요일 05:00 KST 시작 주차가 지나면 정리됩니다.

## 적용

Codespaces `/workspaces/Aion2` 최상위에 ZIP을 업로드한 다음:

```bash
unzip -o Aion2_Od1_Countdown_Shared_Schedule_Notes.zip
python3 scripts/apply-od-countdown-shared-notes.py
node --check public/app.js && node --check src/index.js
npx wrangler d1 migrations apply aion2-db --remote && npx wrangler deploy
```

기존에 `0018_homework_od_caps_membership_default.sql` 등 미적용 마이그레이션이 남아 있다면 순서대로 적용되어야 합니다. **마이그레이션이 실패하면 배포하지 마세요.** 현재 D1 문제를 먼저 해결해야 합니다.

`wrangler.jsonc`, 접속 코드, D1 ID, 기존 Cron, `src/aion-api.js`, 사용자 지정 문구(`오드구매&제작` 포함) 등은 덮어쓰지 않습니다. 패처가 현재 소스에 필요한 줄만 바꾸며, 예상한 코드와 다르면 변경 없이 중단됩니다.

## 확인

1. 숙제 탭에서 어비스회랑 안내 오른쪽에 `오드1 다음 자연회복까지 02:...`가 보이고 초 단위로 줄어드는지 확인합니다.
2. 4성역 참여 일정에 비고를 저장하고 3성역에서 같은 비고가 보이는지 확인합니다. 반대 방향도 동일합니다.
3. 2성역 일정 비고와 4/3성역 캐릭터별 파티 비고는 영향을 받지 않는지 확인합니다.
