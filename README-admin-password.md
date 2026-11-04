# 관리자 비밀번호 최소 12자 제한 해제

기존 관리자 변경 이력 및 IP 이력 기능을 유지하며, 관리자 비밀번호의 **최소 12자 제한만 제거**합니다.

- 브라우저 입력칸의 `minlength="12"` 제거
- 서버의 `env.ADMIN_PASSWORD.length >= 12` 제한을 `length > 0`으로 변경
- 관리자는 일반 사용자 접속 코드(`ACCESS_CODE`)와 **서로 다른 비밀번호**를 사용해야 한다는 기존 정책 유지
- 비밀번호 상한 256자, 관리자 세션 유효 시간, 로그인 실패 횟수 제한 유지
- 기존 `ADMIN_PASSWORD` Secret은 변경하지 않음
- D1 마이그레이션 불필요

## 적용

프로젝트 루트 `/workspaces/Aion2`에 ZIP을 올리고 다음을 실행하세요.

```sh
unzip -o Aion2_Admin_Password_No_12_Minimum.zip
python3 scripts/remove-admin-password-minlength.py
node tests/test-admin-short-password.mjs
npx wrangler deploy
```

짧은 관리자 비밀번호로 **변경**하려면, 별도 명령으로 Secret을 교체하세요.

```sh
npx wrangler secret put ADMIN_PASSWORD --name aion2
```

명령 실행 후 비밀번호를 터미널 프롬프트에 입력하세요. 비밀번호를 소스코드나 채팅에 적지 마세요. 가능하면 길고 고유한 비밀번호를 사용하세요.

GitHub 자동 배포를 사용하는 경우:

```sh
git add public/admin.html src/admin-api.js scripts/remove-admin-password-minlength.py tests/test-admin-short-password.mjs README-admin-password.md
git commit -m "Allow shorter admin passwords"
git push origin main
```

스크립트는 현재 `public/admin.html`, `src/admin-api.js`에서 일치하는 문자열만 바꾸며, 다른 파일과 기존 관리자/IP 이력 기능은 덮어쓰지 않습니다. 이미 적용한 상태에서 재실행해도 추가 수정하지 않습니다.
