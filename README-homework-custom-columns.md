# 아이온2 숙제 열 정렬 / 추가 기능 - 배포 누락 복구

이 ZIP은 **수정 소스 파일 전체를 덮어쓰는 ZIP이 아닙니다**. 사용자의 현재 `public/app.js`, `public/index.html`, `src/index.js`를 보존하면서 패치 스크립트가 필요한 코드만 추가합니다. 이전 ZIP에서 압축만 해제하고 `wrangler deploy`를 실행하면 화면이 바뀌지 않은 이유를 해결하기 위해 **적용+검사+마이그레이션+배포**를 한 명령으로 묶었습니다.

```bash
unzip -o Aion2_Homework_Custom_Columns_Repair.zip
bash scripts/install-homework-custom-columns.sh --deploy
```

스크립트는 현재 파일을 실제로 고쳤는지 검사하고, `app.js` 캐시 버전 문자열을 갱신하며, 문법/기능 테스트를 수행한 후 **D1 성공 시에만** Worker를 배포합니다. 원격 페이지의 `숙제 추가` 버튼 존재 여부까지 검사합니다. 중간에 실패하면 배포를 진행하지 않습니다.

패치만 확인하려면:
```bash
bash scripts/install-homework-custom-columns.sh --check-only
```

GitHub에서 이전 버전을 자동 배포하지 않도록 확인 후 커밋/푸시합니다:
```bash
git add public/index.html public/app.js src/index.js src/homework-custom-api.js \
  migrations/0024_homework_custom_columns.sql scripts tests README-homework-custom-columns.md
git commit -m "Install persistent homework columns"
git push origin main
```

## 실제 반영 여부 확인

```bash
grep -n 'id="hwAddTask"' public/index.html
curl -fsSL "https://aion2.ksmsy1.workers.dev/?check=$(date +%s)" | grep -o 'id="hwAddTask"'
```

위 두 번째 명령에서 버튼 ID가 보이면 운영 서버 HTML까지 적용된 상태입니다. 그런데도 브라우저에서 안 보이면 `Ctrl+Shift+R`로 캐시를 무시하고 새로고침하세요.

## 기능/데이터

- 기본 숙제 8열 순서는 현재 순서 그대로 시작합니다.
- 각 숙제의 `⠿` 손잡이로 열 위치를 변경하고 **로그인 닉네임별로 D1에 영구 저장**합니다.
- `숙제 추가` 버튼으로 새 항목을 만들고 오드구매&제작 오른쪽에 배치합니다.
- 새 숙제의 완료 상태는 수요일 초기화와 `현황 초기화` 모두에서 제외됩니다.
- 기존 숙제·오드·멤버십·파티·관리자 이력 데이터는 삭제하지 않습니다.
- 해당 닉네임으로 로그인하면 그 닉네임의 데이터에 접근할 수 있는 기존 공용 로그인 구조는 그대로 유지됩니다.
