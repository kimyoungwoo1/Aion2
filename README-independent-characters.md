# 성역별 캐릭터 독립 편성 수정

## 현상과 수정
이전에는 `sanctuary_party_slots`의 기본 키가 `(sanctuary, nickname)`이라
같은 소유자의 다른 캐릭터를 선택하면 이전 캐릭터의 배정이 대체되었습니다.
이제 `(sanctuary, character_id)`를 기준으로 **캐릭터별 파티 위치/징표/비고**를 관리합니다.

- 아래 수정 창은 고정 참여자로 등록된 소유자 닉네임에 속한 **모든 캐릭터**를 각각 보여줍니다.
- 캐릭터별로 `변경사항 저장`을 누르면 해당 캐릭터만 수정합니다.
- 동일 캐릭터는 한 성역 내에서 파티 자리 하나만 배정되며, 서로 다른 캐릭터는 별도 자리를 사용합니다.
- 4/3/2 성역은 서로 독립적입니다. 일정을 체크하는 고정 참여자 명단은 그대로 유지됩니다.
- 현재 남아 있는 이전 배정 및 징표는 0012 마이그레이션에서 자동 복사합니다.
- 비고는 기존 캐릭터별 테이블을 그대로 사용합니다.
- **이미 예전 코드로 덮어써서 사라진 이전 배정은 자동 복원할 수 없습니다.** 그 배정만 직접 다시 지정해야 합니다.

## 설치
프로젝트 루트(`/workspaces/Aion2`)에 ZIP 업로드 후:

```bash
unzip -o Aion2_Independent_Character_Party.zip
npx wrangler d1 migrations apply aion2-db --remote
npx wrangler deploy
```

D1 마이그레이션이 성공한 다음 배포해야 합니다.
기존 `wrangler.jsonc`는 ZIP에 포함하지 않으므로 D1 바인딩, 접속 비밀번호, Cron, 공식 API 직접 연동 설정을 변경하지 않습니다.

```bash
git add public/app.js public/index.html src/index.js migrations/0012_independent_character_party_slots.sql
git commit -m "Keep party assignments independent per character"
git push origin main
```

## 배포 후 확인
1. 같은 닉네임으로 등록한 캐릭터 A를 1포스, 캐릭터 B를 2포스에 각각 저장합니다.
2. 목록 새로고침 후 두 캐릭터가 각 자리에서 유지되는지 확인합니다.
3. A의 징표/비고를 변경해도 B의 징표/비고가 유지되는지 확인합니다.
4. 3성역으로 전환해도 4성역 배정이 바뀌지 않는지 확인합니다.
