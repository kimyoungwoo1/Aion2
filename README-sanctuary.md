# 아이온2 관리 – 성역 일정 3개 탭 업데이트

기존 프로젝트 파일 위에 덮어쓰도록 제작한 **최상위 폴더 없는 ZIP**입니다.

## 적용 파일
- `public/index.html` – 캐릭터 관리 + 4성역 델트라스 / 3성역 무스펠 / 2성역 침식 탭
- `public/app.js` – 날짜별 입력, 참여 인원 집계, 저장/조회
- `src/index.js` – `/api/sanctuary` 조회 및 저장 API, 기존 캐릭터 API 유지
- `migrations/0003_sanctuary_schedules.sql` – 새 성역 일정 테이블 (기존 데이터 변경 없음)

## 기존 Codespaces에서 적용
```bash
unzip -o aion2-sanctuary-tabs.zip
npx wrangler d1 migrations apply aion2-db --remote
npx wrangler deploy
```

새 DB 생성이나 `wrangler.jsonc` 변경은 필요 없습니다. 기존 DB 바인딩 `DB`, Service Binding `AION_API`, 공용 코드 Secret을 유지합니다.

## 일정 정책
- 각 탭 일정은 서로 독립적으로 저장됩니다.
- 주차는 **월요일~일요일(한국 날짜)** 기준입니다. 새 주는 자동으로 빈 입력 화면이 되며 과거 주의 기록은 삭제하지 않습니다.
- `가능`: 오전과 오후 참여 가능 / `오후 가능`: 오후만 참여 가능 / `불가능`: 참여 불가능 / `미입력`: 아직 응답 없음.
- 로그인에 사용한 닉네임으로 1주당 1행을 저장합니다. 비고는 주당 300자까지 작성할 수 있습니다.
- 공용 코드는 개인 계정 인증이 아니므로 동일 닉네임을 입력하는 사람도 해당 닉네임의 일정을 덮어쓸 수 있습니다.

## 안전한 배포 순서
1. 압축 해제
2. `npx wrangler d1 migrations apply aion2-db --remote`
3. `npx wrangler d1 execute aion2-db --remote --command="SELECT name FROM sqlite_master WHERE name='sanctuary_schedules';"`
4. `npx wrangler deploy`
5. 캐릭터 관리 화면과 성역 3개 탭 확인
