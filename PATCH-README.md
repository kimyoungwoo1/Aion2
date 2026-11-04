# 일일 던전 잔여 횟수 및 초기화 수정

- 악몽 횟수는 수동 현황 초기화 API에서 변경하지 않습니다.
- 일일 던전은 미저장 상태에서 21회로 표시됩니다.
- 일일 던전은 잔여 횟수 방식이며 `-`로 사용 횟수를 차감하고 `+`로 복구합니다.
- 매주 수요일 05:00 KST 주간 키가 바뀌면 저장 기록이 없는 새 주차에서 21회로 시작합니다.
- 현황 초기화는 직접 숙제/기본 숙제 완료 기록을 초기화하고, 일일 던전만 21회로 되돌립니다.
- 직접 추가한 숙제 목록, 악몽 횟수, 오드, 멤버십, 캐릭터 정렬은 유지합니다.
- D1 스키마 변경은 없습니다.

Codespaces:
```bash
unzip -o aion2-homework-daily-remaining-patch.zip -d .
node --check public/app.js
node --check src/index.js
npm run deploy
git add public/app.js src/index.js
git commit -m "Set daily dungeon remaining count to 21"
git push
```
