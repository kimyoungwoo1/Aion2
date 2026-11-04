# 아이온2 | 성역 일정 초기화만 월요일 00:00(KST)으로 변경

## 꼭 구분할 사항

- **화면의 요일과 날짜 배열은 수요일~화요일 그대로입니다.** 월~일 배열로 바꾸지 않습니다.
- **4성역·3성역·2성역 참여 일정(가능 여부, 일정 비고)만** 한국시간 **매주 월요일 00:00**에 새 주차로 전환합니다.
- 월요일이 되면 **다가오는 수요일부터 다음 화요일까지** 일정표를 보여줍니다. 수요일 오전 5시에는 성역 일정이 다시 초기화되지 않습니다.
- 4·3성역의 참여 일정·일정 비고 동기화, 2성역의 독립 설정은 유지합니다.
- **고정 참여자, 캐릭터별 파티 배정, 징표, 캐릭터별 비고는 초기화하지 않습니다.**
- 기존 숙제는 수요일 05:00, 어비스회랑은 수/토 21:00, 전투력 자동 갱신은 06:00·18:00으로 그대로 유지합니다.
- 기존에 직접 수정한 `오드구매&제작`, `카이라`, 컨텐츠 일정표 로고 제거도 덮어쓰지 않습니다.

## 시간 예시

| 한국시간 | 성역 일정 표시 기간 |
|---|---|
| 2026-11-08(일) 23:59 | 11/04(수) ~ 11/10(화) |
| 2026-11-09(월) 00:00 | **11/11(수) ~ 11/17(화)**, 기존 참여 일정 초기화 |
| 2026-11-11(수) 05:00 | 11/11(수) ~ 11/17(화), **추가 초기화 없음** |

구현은 기존 D1 `week_start` 필드(수요일 날짜)를 그대로 사용합니다. 주차 선택 시점만 월요일 자정으로 앞당깁니다. 기존 저장된 이번 주 데이터는 월요일 자정 전까지 그대로 보이며, 이후 새 주차에서는 이전 데이터가 나오지 않습니다. 저장된 이전 기간의 참여 일정은 정리하지만 고정 명단과 파티 배정은 삭제하지 않습니다.

## Codespaces 적용

프로젝트 루트 `/workspaces/Aion2`에서 ZIP을 업로드하고 실행합니다.

```bash
unzip -o Aion2_Sanctuary_Monday_Reset_Keep_Wed_Tue.zip
python3 scripts/set-sanctuary-monday-reset.py
python3 scripts/add-sanctuary-monday-cron.py
node tests/test-sanctuary-monday-reset.mjs
npx wrangler deploy
```

**이번에는 D1 마이그레이션이 필요하지 않습니다.**

수동 배포가 GitHub 자동 배포에 의해 덮어써지지 않도록 다음도 실행하세요.

```bash
git add src/index.js public/app.js public/index.html wrangler.jsonc \
  scripts/set-sanctuary-monday-reset.py scripts/add-sanctuary-monday-cron.py \
  tests/test-sanctuary-monday-reset.mjs README-sanctuary-monday-wed-tue.md
git commit -m "Reset sanctuary schedules Monday midnight while keeping Wed-Tue view"
git push origin main
```

적용 스크립트는 현재 파일에서 **필요한 부분만** 수정합니다. 기존 코드 구조와 다르면 안전하게 중단하고 다른 파일을 수정하지 않습니다. 변경 전 파일은 `.aion2-backups/sanctuary-reset-mon-keep-wed-tue/` 폴더에 보관합니다.

`wrangler.jsonc`에서 필요한 Cron 트리거만 **추가**하며 기존 트리거와 D1/Secret 설정을 보존합니다.

| UTC Cron | 한국시간 | 용도 |
|---|---|---|
| `0 15 * * SUN` | **월요일 00:00** | 성역 일정 초기화 |
| `0 20 * * TUE` | 수요일 05:00 | 숙제 주간 초기화 |
| `0 12 * * WED,SAT` | 수·토 21:00 | 어비스회랑 초기화 |
| `*/5 9,21 * * *` | 매일 06·18시 시간대 | 전 캐릭터 전투력 갱신 |

Cron이 지연되더라도 성역 일정의 조회·저장 과정에서 새 주차만 허용하므로 Monday 00:00부터 새 일정이 표시됩니다.
