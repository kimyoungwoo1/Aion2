# Aion2: content schedule tab

This update adds **컨텐츠 일정표** to the right of **숙제**. The reference display reproduces the user-provided image: weekly schedule, content guide, group timing, and 21-server matching table. The dates are **2026.10.21–2026.11.11** and the page is a static reference, not live game data.

## Apply in /workspaces/Aion2

```bash
unzip -o Aion2_Content_Schedule_Tab.zip
python3 scripts/add-content-schedule.py
node --check public/app.js
npx wrangler deploy
```

Then sync both the patch script and the resulting customized front-end files to GitHub (to avoid older auto-deploy overwriting the UI):

```bash
git add public/index.html public/app.js public/content-schedule.css scripts/add-content-schedule.py
 git diff --cached --stat
 git commit -m "Add content schedule tab"
 git push origin main
```

No DB migration, no Cron, and no Workers backend changes. The script is idempotent; executing twice does not duplicate the tab. The existing `오드구매&제작` label is preserved/normalized without modifying the task identifier or stored D1 completion records.

## Screenshot notes

Content includes the schedule as presented in the image, including period-specific `시공쟁탈전` and server matches; these may become outdated after November 11, 2026. The **09:00** row in the screenshot shows **아그로** while its 카이아 guidance card also says 09:00; both are reproduced as pictured.
