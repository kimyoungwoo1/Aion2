# 아이온2 관리 - 파티 편성 선택 캐릭터명 표시 수정

## 변경 사항
- 성역의 '파티 편성' 카드에서 고정 참여자 닉네임 대신 실제 연결한 캐릭터의 `character_name`을 표시합니다.
- 캐릭터가 아직 연결되지 않았다면 '캐릭터 미연결'로 표시합니다.
- 직업, 아이템 레벨, 남툴, 징표, 캐릭터 비고는 기존처럼 선택된 캐릭터의 정보와 성역 편성 데이터를 사용합니다.
- '전체 참여 캐릭터'의 참여자 이름은 기존대로 남겨 누구에게 연결된 캐릭터인지 구분할 수 있습니다.
- D1, Cloudflare 설정, 로그인/ACCESS_CODE, 숙제/일정 초기화, 기존 파티 배정은 변경되지 않습니다.

## 적용
Codespaces 프로젝트 최상위(`/workspaces/Aion2`)에 ZIP 파일을 업로드한 후:

```bash
unzip -o Aion2_Selected_Character_Display.zip
node --check public/app.js
npx wrangler deploy
```

문제가 없으면 GitHub에 반영:

```bash
git add public/app.js
git commit -m "Display selected character names in party roster"
git push origin main
```

## 테스트
예: '니코틴' 참여자가 '다른 캐릭터 이름'을 연결해 둔 경우 오른쪽 파티 편성에는 참여자명 '니코틴'이 아니라 연결된 캐릭터명이 표시되는지 확인합니다. 직업/레벨/남툴은 해당 캐릭터의 값이어야 합니다.
