# 아이온2 관리: 일정 집계 및 파티 화면 가독성 개선

기존 프로젝트의 `public/app.js`와 `public/index.html`만 수정합니다.
D1, `src/index.js`, `wrangler.jsonc`, `ACCESS_CODE`, 캐릭터/일정/배정 데이터는 건드리지 않습니다.

## 반영 내용

1. 날짜별 참여 가능 인원에서 `미입력: n명` 행은 표시하지 않음. `불가능` 선택자가 있으면 그 수만 표시.
2. 다같이 가능한 요일은 **그날 상태를 입력한 참여자만** 비교. 입력자가 0명이면 표시하지 않음. 응답자가 1명뿐이라도 표시하지만, 결과에는 `1/10명 입력 기준`처럼 응답자 수를 명시. 명시적 `불가능`은 제외하지 않음.
3. 포스별 카드를 세로 한 열로 배치하고 그 안에 파티 2개를 넓게 나란히 표시. 배정된 캐릭터만 목록으로 표시하며 빈 자리는 요약. 비어 있는 포스는 기본 접힘(클릭해 펼침).
4. 파티 편성: 징표, 캐릭터명, 직업, 아이템 레벨, 남툴, 캐릭터 비고를 간결하게 표현. 전체 참여 캐릭터 수정 기능은 기존 하단 접이식 패널에 그대로 유지.

## Codespaces 적용

```bash
unzip -o Aion2_Schedule_Party_Clarity.zip
npx wrangler deploy
```

GitHub 저장까지 하려면:

```bash
git add public/app.js public/index.html
git commit -m "Improve sanctuary availability and party readability"
git push origin main
```

**주의:** 배포 후 로그인에서 문제가 보이면 `/api/me`를 확인하세요. 이번 ZIP에는 백엔드 파일이 없으므로 로그인 로직은 변경되지 않습니다.
