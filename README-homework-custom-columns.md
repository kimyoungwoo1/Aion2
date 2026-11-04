# 아이온2 숙제 열 정렬 / 숙제 추가 - 호환성 수정 v3

이번 파일은 이전에 실패했던 **`Expected one homework tasks line, found 0`** 오류를 해결한 버전입니다.
`public/app.js`의 기존 `const tasks = ...` 선언문을 정확히 일치시켜 찾는 방식을 제거했습니다.
현재 숙제 렌더러의 별도 `taskColumns` 변수를 사용하므로 해당 선언문이 변경되어도 적용됩니다.

## 적용

Codespaces 프로젝트 루트 `/workspaces/Aion2`에서 ZIP을 압축 해제한 후:

```bash
unzip -o Aion2_Homework_Custom_Columns_Compatible_V3.zip
bash scripts/install-homework-custom-columns.sh --deploy
```

이 명령은 실제 `public/index.html`, `public/app.js`, `src/index.js`에 패치를 적용하고,
문법·DB 테스트, D1 마이그레이션과 Worker 배포를 순서대로 실행합니다.
배포 전에 먼저 검사만 하려면 `--check-only` 옵션을 사용할 수 있습니다.

```bash
bash scripts/install-homework-custom-columns.sh --check-only
```

**주의**: `--check-only`도 소스 파일은 패치하되 원격 DB나 Worker를 변경하지 않습니다.
중간 단계에서 오류가 발생하면 배포하지 않습니다.

## GitHub 자동 배포 방지

```bash
git add public/app.js public/index.html src/index.js src/homework-custom-api.js \
  migrations/0024_homework_custom_columns.sql scripts/add-homework-custom-columns.py \
  scripts/install-homework-custom-columns.sh scripts/verify-homework-custom-columns.py \
  tests/test-homework-custom-columns.mjs tests/test-homework-custom-live.mjs \
  tests/test-homework-custom-migration.py README-homework-custom-columns.md
git commit -m "Fix homework custom tasks patch compatibility"
git push origin main
```

## 기능

- 기존 숙제 기본 순서: 어비스회랑, 각성전, 루드라, 침식, 무스펠, 델트라스, 시련, 오드구매&제작.
- 헤더의 ⠿ 손잡이로 숙제 열을 이동하고 로그인 닉네임별 D1에 영구 저장.
- `숙제 추가` 버튼은 `현황 초기화` 왼쪽에 생성.
- 사용자별 최대 20개 추가 숙제, 추가 직후 오드구매&제작 우측에 배치.
- 추가 숙제 완료 여부는 수요일 자동 초기화 및 현황 초기화 대상에서 제외.
- 기존 숙제 완료, 오드1/2 수량, 멤버십, 캐릭터 행 정렬, 성역, 관리자 이력 변경 없음.
- 공용 코드 로그인은 닉네임만으로 실제 신원을 검증하지 못함.

## 배포 확인

```bash
grep -n 'id="hwAddTask"' public/index.html
curl -fsSL "https://aion2.ksmsy1.workers.dev/?v=$(date +%s)" | grep -o 'id="hwAddTask"'
```

브라우저에 이전 JS가 보이면 Ctrl+Shift+R 새로고침을 실행하세요.
기존 파일을 삭제하거나 `wrangler.jsonc`를 덮어쓰지 않습니다.
