# 아이온2 관리 — 내 캐릭터 우선 정렬 / 참여자별 캐릭터 선택

이번 업데이트는 **캐릭터 목록 정렬**과 **성역 파티 편성의 캐릭터 선택 후보**만 수정합니다.

- 캐릭터 관리: 로그인한 닉네임(`슬롱` 등)이 `owner_name`과 일치하는 캐릭터를 위에 표시합니다. 나머지는 소유자→캐릭터명 순서로 가나다 정렬합니다. 내 캐릭터가 없어도 모두 가나다순입니다.
- 성역 참여자·파티 편성: 해당 참여자 닉네임과 `owner_name`이 일치하는 캐릭터만 선택할 수 있습니다. 한 참여자에게 여러 캐릭터가 등록되어 있으면 그 캐릭터들만 보입니다. 자동 연결도 참여자 자신의 캐릭터명과 소유자 이름이 일치할 때만 수행합니다. 조회 목록은 가나다순입니다.
- 기존에 다른 소유자 캐릭터를 연결한 기록이 있을 경우 데이터 보존을 위해 해당 **현재 연결 값만** '소유자 확인 필요'라고 표시합니다. 새로운 다른 소유자 연결은 서버에서도 거부합니다. 기존 편성·징표·비고는 변경하지 않습니다.
- 주간 일정, 숙제, 초기화 시간, 로그인/ACCESS_CODE, D1 바인딩과 구조는 변경하지 않습니다. **SQL 마이그레이션 없음.**

## 설치

Codespaces 프로젝트 루트(`/workspaces/Aion2`)에 ZIP 파일을 올려 다음을 실행합니다.

```bash
unzip -o Aion2_MyCharacters_ParticipantFilter.zip
node --check public/app.js
node --check src/index.js
npx wrangler deploy
```

정상 확인 후 GitHub 동기화:

```bash
git add public/app.js public/index.html src/index.js
git commit -m "Prioritize my characters and filter sanctuary roster choices"
git push origin main
```

## 확인

1. `슬롱`으로 로그인했을 때 슬롱 소유 캐릭터가 맨 위에 보이는지 확인합니다.
2. `슬롱` 소유 캐릭터가 없으면 소유자→캐릭터명 가나다 순서로 표시되는지 확인합니다.
3. 각 성역 파티 편성의 예: `니코틴` 캐릭터 선택에는 `owner_name=니코틴`인 캐릭터만 나타나는지 확인합니다.
4. 배정/징표/비고가 기존 그대로인지 확인합니다.

※ 공용 접속 코드로 닉네임을 자유롭게 입력하는 기존 인증 방식은 변경하지 않습니다.
