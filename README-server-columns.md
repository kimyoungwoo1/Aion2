# 아이온2 서버 매칭표 표시 오류 수정

## 해결한 문제
- 기존 프로젝트 전역 `table { min-width:780px; }` 설정 때문에 서버 매칭 카드(약 300~400px)의 `서부` / `동부` 열이 보이지 않던 오류 해결
- 각 카드의 `번호(17%) / 서부(38%) / 동부(45%)` 3열이 화면에 들어오도록 전용 CSS 지정
- 서버 매칭표의 접기/펼치기 기능을 제거하고 **항상 표시**하도록 변경
- 750px 이하 모바일 화면에서는 그룹 카드를 한 줄에 하나씩 배치
- **D1에 저장된 매칭 21개, 적용 기간, 수정 기능 및 다른 사이트 기능은 변경하지 않음**
- 숙제 명칭 **`오드구매&제작`**도 변경하지 않음

## Codespaces 적용

기존 `/workspaces/Aion2`에서 ZIP을 압축 해제한 후:

```bash
unzip -o Aion2_Server_Matches_Columns_Always_Visible.zip
python3 scripts/fix-server-match-columns.py
node --check public/content-schedule-manage.js
npx wrangler deploy
```

**별도 D1 마이그레이션은 필요 없습니다.**

## GitHub에도 저장

```bash
git add public/index.html public/content-schedule.css public/content-schedule-manage.js scripts/fix-server-match-columns.py
git commit -m "Fix visible server matching columns and permanent display"
git push origin main
```

GitHub 자동 배포가 이전 파일을 다시 덮어쓰지 않도록 Push하세요.

## 기존 상태 백업

패치는 덮어쓰기 전 `.aion2-backups/`에 변경 파일의 원본을 따로 저장합니다. 이 폴더는 Git에 추가하지 마세요.
