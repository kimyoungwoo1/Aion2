# 아이온2 횟수형 숙제 직접 입력 업데이트

## 변경 내용
- 악몽(0~14회), 일일 던전(0~21회)의 횟수 표시를 숫자 입력칸으로 변경했습니다.
- 기존 `−` / `+` 버튼은 그대로 유지했습니다.
- 숫자 입력 후 Enter 또는 입력칸에서 포커스를 이동하면 저장합니다.
- 0 미만, 최대 횟수 초과, 소수 입력은 저장하지 않고 기존 값으로 되돌립니다.
- 저장은 기존 `/api/homework/custom-count` API를 사용하므로 DB 구조 변경은 없습니다.

## 적용 방법 (GitHub Codespaces)
ZIP 파일을 `/workspaces/Aion2`에 업로드한 다음 실행하세요.

```bash
unzip -o aion2-homework-editable-count-patch.zip -d .
node --check public/app.js
git add public/app.js public/index.html
git commit -m "Allow direct input for count-based homework"
git push
```

GitHub Push 후 기존에 연결된 Cloudflare 자동 배포가 진행됩니다. 이번 변경은 프론트엔드만 수정하므로 D1 마이그레이션이나 `npm run db:remote`는 실행할 필요가 없습니다.
