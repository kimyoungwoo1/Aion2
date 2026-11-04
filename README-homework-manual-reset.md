# 아이온2 관리 — 숙제 현황 초기화 버튼

숙제 탭의 **이번 주 숙제 현황** 제목 우측에 `현황 초기화` 버튼을 `새로고침` **왼쪽**에 추가합니다.

- 버튼 클릭 시 **로그인 닉네임 / 캐릭터 수 / 현재 완료 기록 수**가 표시된 확인창이 먼저 뜹니다.
- 확인하면 **현재 로그인 닉네임 소유의 캐릭터들에 대해서만** 이번 주 일반 숙제 및 현재 어비스회랑 회차의 완료 기록을 삭제하여 `미완료`로 표시합니다.
- 새로고침 후 **완료 건수와 완료율**이 즉시 반영됩니다.
- **다른 닉네임의 숙제**, **오드1·오드2**, **오드합·자연 회복 시각**, **멤버십**, **캐릭터 순서**, **파티 배정 및 비고**, **문의사항** 등은 변경하지 않습니다.
- 기존의 **`오드구매&제작`**, **`카이라`** 표시나 컨텐츠 일정표 상단 로고 제거 상태를 덮어쓰지 않습니다.
- 새 DB 테이블을 만들지 않으므로 **D1 마이그레이션은 필요하지 않습니다.**

> 주의: 완료 기록을 초기화하면 원래 완료였던 항목을 자동 복구할 수 없습니다. 확인창 취소 시 아무것도 변경되지 않습니다.
> 공용 접속 코드와 자유 닉네임 체계에서는 같은 닉네임으로 로그인하는 사람을 구별할 수 없습니다.

## 적용

`/workspaces/Aion2` 폴더에 ZIP 파일을 업로드한 다음 아래를 실행합니다.

```bash
unzip -o Aion2_Homework_Manual_Reset_Button.zip
python3 scripts/add-homework-manual-reset.py
python3 tests/test-homework-manual-reset.py
node --check public/app.js
node --check src/index.js
npx wrangler deploy
```

GitHub 자동 배포가 뒤에서 옛날 코드를 다시 올리지 않도록 **변경된 파일도 같이 커밋**합니다.

```bash
git add public/index.html public/app.js src/index.js \
  scripts/add-homework-manual-reset.py tests/test-homework-manual-reset.py \
  README-homework-manual-reset.md
git diff --cached --stat
git commit -m "Add owner-scoped homework reset button"
git push origin main
```

**적용 스크립트**는 기존 프로젝트의 3개 파일에서 필요한 위치에만 코드를 추가하고, 기존 내용을 `.aion2-backups/homework-manual-reset/`에 최초 1회 백업합니다. 압축 파일에는 기존 화면이나 Worker 전체 파일을 넣지 않았기 때문에, 직접 변경한 코드를 옛날 버전으로 덮어쓰지 않습니다.
