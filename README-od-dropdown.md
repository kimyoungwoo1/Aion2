# 아이온2 관리 - 참여자 드롭다운 및 숙제 오드 기록

## 변경 사항
- 성역 > 참여자·파티 편성 > 전체 참여 캐릭터: 참가자 선택/캐릭터 선택 2단 드롭다운, 현재 1개 캐릭터만 편집. 기존 독립 캐릭터별 파티·징표·비고 저장 API 유지.
- 숙제: 남툴 바로 다음에 오드1(840), 오드2(2000), 오드합 추가. 오드1/2는 캐릭터별 수동 입력, 입력 완료(blur/change) 시 자동 저장, 합계 자동 계산.
- 오드1·오드2는 매주 수요일 05:00 KST에 주차별 초기화되고 기존 숙제 완료 데이터/캐릭터/파티 배정을 변경하지 않는다.
- 기존 D1 DB·세션·ACCESS_CODE·wrangler.jsonc·Cron 설정을 건드리지 않는다.

## 적용 (프로젝트 루트에서)
```bash
unzip -o Aion2_Participant_Dropdowns_Homework_Od.zip
npx wrangler d1 migrations apply aion2-db --remote
npx wrangler deploy
```

`wrangler.jsonc`는 ZIP에 포함하지 않으며, `aion2-api` Service Binding을 다시 추가하지 않는다.

## 신규 DB
`migrations/0013_homework_od_amounts.sql`을 원격 D1에 반드시 적용한다. 해당 테이블은 `week_start + character_id`가 고유 키여서 기존 숙제 체크와 독립적이다.
