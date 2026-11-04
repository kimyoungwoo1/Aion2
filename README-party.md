# 아이온2 관리 — 성역별 참여자·파티 편성 업데이트

기존 `캐릭터 관리`, `참여 일정`, 4·3성역 공통 일정, 2성역 독립 일정, D1 데이터, ACCESS_CODE를 유지합니다.

## 적용

Codespaces 프로젝트 최상위(`/workspaces/Aion2`)에 ZIP 업로드 후:

```bash
unzip -o Aion2_Sanctuary_Party_20261029.zip
npx wrangler d1 migrations apply aion2-db --remote
npx wrangler deploy
curl -i https://aion2.ksmsy1.workers.dev/api/me
```

마지막 curl은 로그인 쿠키 없이 `HTTP 401`과 JSON을 반환하면 정상입니다. 이후 운영 사이트에 접속해 보세요. ZIP에 `wrangler.jsonc`와 로그인 Secret은 포함하지 않았습니다. **이번 DB 마이그레이션(0005)은 배포 전에 필수**입니다.

정상 확인 후:

```bash
git add public/index.html public/app.js src/index.js migrations/0005_sanctuary_party.sql README-party.md
git commit -m "Add sanctuary character roster and party assignments"
git push origin main
```

## 동작

- 4·3·2성역 각 탭에 `참여 일정` / `참여자 · 파티 편성`을 추가.
- 참여 캐릭터 목록은 **각 성역의 고정 참여 명단**으로 생성. 명단은 참여 일정 탭에서 등록/삭제.
- 참여자 닉네임과 같은 이름의 등록 캐릭터가 있으면 자동으로 정보 연결. 다르면 `캐릭터 연결` 메뉴에서 선택. 서버 ID는 표시하지 않음.
- 직업·아이템 레벨·남툴은 기존 캐릭터 DB 정보 사용; 전투력 갱신은 기존 캐릭터 관리에서 수행.
- 성역별 파티 배정은 **독립**. 기본 2파티, 파티당 5자리, 최대 8파티. 각 참여자의 배정 자리를 선택하면 즉시 D1에 저장. 이미 점유한 자리는 선택 불가하고 서버에서도 중복 검증.
- 고정 참여자를 성역에서 제거하면 그 성역의 캐릭터 연결/파티 배정도 지워짐. 다른 성역 및 주간 일정 데이터는 그대로 남음.
- 기존 일정 자동 동기화는 영향을 받지 않음. 4·3성역 일정만 공유하고 파티는 공유하지 않음.
- API 엔드포인트: `GET /api/sanctuary/roster`, `POST /api/sanctuary/roster/character`, `POST /api/sanctuary/roster/party`.

**운영 유의**: 공용 접속 코드는 개인 인증이 아니므로, 로그인한 누구나 파티를 편집할 수 있습니다. 추후 관리자 권한이 필요하면 별도 인증 체계가 필요합니다.
