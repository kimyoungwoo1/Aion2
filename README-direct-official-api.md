# 아이온2 관리 — 공식 캐릭터 API 직접 조회 통합

기존 `aion2-api` Worker 호출을 제거하고, `aion2` Worker에서 공식 아이온2 캐릭터 정보실을 직접 조회합니다.

## 변경 파일

- `src/index.js` — 기존 로그인/성역/파티/숙제/D1 동작은 유지, 캐릭터 조회 연결 부분만 변경
- `src/aion-api.js` — 신규. 공식 API 검색 + 상세 정보 조회, 정확한 캐릭터 검증, 직업/아이템 레벨/남툴 추출
- `scripts/remove-aion-service-binding.py` — 기존 `wrangler.jsonc`에서 `aion2-api` Service Binding 한 개만 제거. 자동 백업 생성
- `tests/test-aion-api.mjs` — 공식 응답 형식에 대한 모의 테스트 (서버 직접 호출은 하지 않음)

> `wrangler.jsonc`, `public/`, D1 마이그레이션 파일은 ZIP에 넣지 않았습니다. 이전의 로그인, 성역 일정, 파티, 숙제 코드는 유지합니다.

## Codespaces에서 적용

기존 프로젝트 최상위인 `/workspaces/Aion2`에 ZIP을 올린 뒤 실행합니다.

```bash
unzip -o Aion2_Direct_Official_API.zip
node tests/test-aion-api.mjs
python3 scripts/remove-aion-service-binding.py
npx wrangler deploy
```

`remove-aion-service-binding.py` 실행 시 `wrangler.jsonc.before-api-integration.bak` 파일이 만들어집니다. GitHub에는 이 .bak 파일을 추가하지 마세요.

**D1 마이그레이션은 필요하지 않습니다.**

## 배포 후 확인

1. Cloudflare 운영 사이트에서 `솜구름 / 바바룽` 캐릭터를 등록 또는 전투력 갱신
2. `호법성 / 5,447 / 600.6k`가 반영되는지 확인 (이 값은 이전에 제공한 공식 API 조회 시점 기준이며 시간이 지나면 달라질 수 있습니다)
3. 다른 캐릭터도 하나 테스트
4. 기존 성역/파티/숙제/로그인이 정상인지 확인
5. 이후 GitHub 반영

```bash
git add src/index.js src/aion-api.js scripts/remove-aion-service-binding.py tests/test-aion-api.mjs wrangler.jsonc
git commit -m "Query official AION2 API directly"
git push origin main
```

## 공식 API 요청 흐름

검색:
`https://aion2.plaync.com/ko-kr/api/search/aion2/search/v2/character?keyword=<name>&race=<1|2>&serverId=<id>`

상세:
`https://aion2.plaync.com/api/character/info?lang=ko&characterId=<id>&serverId=<id>`

- 검색 응답에서 캐릭터명, 서버 ID, 종족이 **모두 정확히 일치**하는 항목만 선택합니다.
- 상세 응답의 `profile.className`, `profile.combatPower`, `stat.statList`의 `type=ItemLevel`을 사용합니다.
- 실패하거나 비정상적인 응답이면 DB 갱신을 하지 않습니다.
- 공식 API가 나중에 변경되거나 Cloudflare 네트워크에서 차단되는 경우에는 코드 수정이 필요할 수 있습니다.
- 기존 `aion2-api` Worker는 새 코드가 실제 운영 사이트에서 정상 조회됨을 확인한 후에 별도로 삭제하세요. **이 ZIP은 외부 Worker를 삭제하지 않습니다.**
