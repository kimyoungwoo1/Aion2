# 아이온2 숙제 기능 업데이트

## 변경 내용
- 숙제 추가 창에 기본 숙제 선택(악몽 0~14회, 일일 던전 0~21회)을 추가했습니다.
- 횟수형 숙제는 캐릭터별 주간 횟수로 저장하며, 현재 일반 숙제 주차 키(수요일 05:00 기준)를 사용합니다.
- `+` / `−` 버튼으로 횟수를 변경하며 0 미만 및 각 숙제 최대 횟수를 서버와 화면 양쪽에서 제한합니다.
- 기존 직접 추가 숙제는 완료/미완료 방식으로 유지합니다.
- 사용자 정의 숙제 열의 `×` 버튼으로 삭제할 수 있습니다. 삭제 시 해당 숙제의 완료/횟수 기록과 정렬 항목도 정리합니다.
- 사용자 정의 횟수 기록은 별도 D1 테이블에 저장합니다.

## 적용 방법 (GitHub Codespaces 터미널)
1. ZIP 압축을 풉니다.
2. ZIP 안의 `public`, `src`, `migrations`, `tests` 폴더를 Codespaces 프로젝트의 같은 위치에 덮어씁니다.
3. D1 원격 마이그레이션을 적용합니다.

```bash
npm run db:remote
```

4. 테스트 및 배포합니다.

```bash
node --check src/index.js
node --check src/homework-custom-api.js
node --check public/app.js
node --test tests/test-homework-custom-columns.mjs
npm run deploy
```

## 주의
- 마이그레이션 `0025_homework_count_tasks.sql`이 적용되기 전에는 새 API를 배포하지 마세요.
- 기존 데이터는 삭제하지 않습니다. 기존 사용자 정의 숙제는 자동으로 `toggle`(완료/미완료) 유형으로 유지됩니다.
- 이 ZIP은 전체 프로젝트가 아니라 변경 파일만 포함한 패치입니다.
