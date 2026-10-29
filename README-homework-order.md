# 숙제 현황 캐릭터 정렬 / 순서 보존

- 첫 조회에서는 현재 로그인한 닉네임의 캐릭터를 남툴(전투력) **내림차순**으로 표시합니다.
- 캐릭터명 왼쪽 `⠿` 드래그 핸들로 행의 순서를 바꿀 수 있으며, 키보드 ↑/↓도 지원합니다.
- 이동한 순서는 `POST /api/homework/order`를 통해 D1의 `homework_character_order`에 로그인 닉네임별로 저장합니다.
- 자동 숙제 초기화(수요일 05:00), 어비스회랑 초기화(수·토 21:00), 오드 초기화와 무관하게 순서가 유지됩니다.
- 캐릭터가 새로 추가되면 수동 순서 뒤에 남툴 높은 순으로 표시됩니다. 캐릭터가 삭제되면 없는 ID를 무시합니다.
- 원래 숙제 완료/미완료, 오드1/오드2, 기존 성역/파티/비고, 공식 API 연동 모듈, `wrangler.jsonc`는 변경하지 않습니다.

## Codespaces 배포

```bash
unzip -o Aion2_Homework_Drag_Persistent_Order.zip
npx wrangler d1 migrations apply aion2-db --remote
npx wrangler deploy
```

DB 적용 후 Worker를 배포하세요. 새로운 마이그레이션은 `0014_homework_character_order.sql`입니다.
