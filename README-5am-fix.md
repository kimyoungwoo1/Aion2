# 아이온2 관리: 수요일 오전 5시 초기화 / 파티 오류 / 숙제 표 너비 수정

이 ZIP은 기존 프로젝트 최상위에 직접 덮어쓰는 구조입니다. `wrangler.jsonc`와 Secret, D1 UUID는 포함하지 않습니다.

## 변경 내용
- 성역 4·3·2 참여 일정의 주간 경계를 매주 **수요일 05:00 KST**로 변경. 수요일 00:00~04:59에는 이전 주 정보 유지.
- 다음 7개 숙제 항목만 매주 05:00 KST 초기화: **각성전, 루드라, 침식, 무스펠, 델트라스, 시련, 오드구매(기존 오드구매&제작)**.
- 요청 목록에 없는 **어비스회랑은 주간 초기화 대상에서 제외**하고 완료 여부를 계속 유지.
- 지난주 성역 일정 및 주간 숙제 완료 기록은 별도로 보관하지 않음. 고정 참여자·파티 편성·캐릭터 유지.
- `partyLabel is not a function` 오류 수정: `partyLabel` 함수와 같은 이름의 HTML 라벨 지역 변수 변경.
- 숙제 화면에서 사용 가능한 가로폭을 넓히고, 마지막 `오드구매` 열이 잘리지 않도록 표 너비 및 버튼 크기 축소.
- 기존 공용 접속 코드/로그인 구조, 다른 사람의 숙제 조회 제한을 유지.

## 적용 (Codespaces 프로젝트 최상위에서)

```bash
npx wrangler d1 export aion2-db --remote --output=../aion2-db-before-5am.sql
unzip -o Aion2_Wed05_Reset_PartyFix_HomeworkFit.zip
python3 scripts/enable-wednesday-5am-reset.py
npx wrangler d1 migrations apply aion2-db --remote
npx wrangler deploy
```

참고: 반드시 `0007_wednesday_reset_force_cleanup.sql`까지 기존 마이그레이션이 적용된 상태에서 `0008_abyss_persistent.sql`을 적용하세요. 기존 `ACCESS_CODE`는 다시 등록하지 않습니다.

## 배포 후 확인
1. 로그인 확인: `/api/me` 응답은 미로그인일 때 401(JSON), 로그인 상태일 때 닉네임(JSON).
2. 4·3·2성역 알림: `매주 수요일 오전 5시(KST)`.
3. 4·3·2성역의 참여자·파티 편성 화면에서 선택/배정 동작 확인.
4. 숙제의 마지막 열 `오드구매`가 잘리지 않고 보이는지 확인.
5. 수요일 오전 5시 전후 주차가 바뀌고 숙제 7개 항목이 초기화되는지 확인.

## 시간 설정
Cloudflare Cron은 UTC 기준이며 `0 20 * * TUE`는 **한국시간 매주 수요일 05:00**입니다.
기존 Cron `0 15 * * TUE`(수요일 00:00 KST)은 제거됩니다.

참고: 공용 접속 코드를 알고 같은 닉네임으로 로그인하면 숙제 접근이 가능하다는 제한은 유지됩니다.
