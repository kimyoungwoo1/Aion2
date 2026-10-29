# 아이온2 관리 - 캐릭터 API 자동 조회

GitHub Codespaces + Cloudflare Workers + D1. 웹사이트 이름은 **아이온2 관리**.

## 이번 변경
- 등록 시 입력: 캐릭터명, 서버 ID 두 항목만 (소유자는 로그인 닉네임 자동 사용)
- `aion2-api` Worker를 Service Binding으로 호출하여 직업/아이템 레벨/남툴(k) 조회 후 D1 저장
- 수정 시 재조회, 목록에서 캐릭터별 `API 갱신` 버튼 지원
- API 장애/조회 실패 시 잘못된 값을 저장하지 않음
- 기존 D1 캐릭터 정보 유지, 서버 ID 추가 (`0002_character_api.sql` 마이그레이션)
- 로그인 및 기존 Cloudflare ACCESS_CODE Secret 유지

## 운영 사이트 업데이트 (Codespaces 터미널)

1. ZIP을 프로젝트 루트에 올린 후 `unzip -o aion2-character-api-update.zip` 실행.
2. **기존 wrangler.jsonc는 ZIP에서 덮어쓰지 않음**. 현재 `database_id`를 보존하면서 `services` 바인딩 추가:

   ```json
   "services": [
     { "binding": "AION_API", "service": "aion2-api" }
   ]
   ```

   최상위 JSON 속성에 추가하세요 (`d1_databases`와 같은 레벨). `aion2-api`는 Cloudflare에 배포된 기존 API Worker의 실제 서비스 이름이어야 합니다.
3. `npx wrangler d1 migrations apply aion2-db --remote`
4. `npx wrangler deploy`
5. 운영 사이트에서 등록을 시험하고 캐릭터 정보가 자동으로 들어오는지 확인.

## API 요청 형식

기존 Google Apps Script와 동일하게 `GET https://aion2-api.ksmsy1.workers.dev/?name=<캐릭터명>&serverId=<서버ID>&format=csv`를 호출합니다. Worker간 통신은 Service Binding을 사용합니다.

서버 ID `2003`은 제공된 Google Apps Script에서 확인된 값입니다. 다른 서버명과 ID의 대응 관계는 제공된 스크립트에 없으므로 현재 화면에는 서버 **ID** 입력을 제공합니다.

API 응답 첫 행을 `직업,아이템레벨,남툴` 순서의 CSV로 처리합니다. 남툴 예: `1092.5k` 또는 `1.2m`은 D1의 k 단위 숫자로 변환해 저장합니다.

## 주의

- Google Apps Script에 있는 오전 6시 / 오후 6시 예약 갱신은 **이번 버전에 포함하지 않았습니다**. 등록/수정 시 자동 조회 및 목록의 개별 갱신부터 적용합니다.
- 실제 `aion2-api` Worker 응답은 이 코드 작업 환경에서 직접 호출할 수 없었으므로 운영 배포 후 실조회 테스트가 필요합니다.
- 짧은 공용 접속 코드는 추측하기 쉽습니다. 운영에서는 긴 무작위 코드와 Cloudflare의 요청 제한 설정을 권장합니다.
