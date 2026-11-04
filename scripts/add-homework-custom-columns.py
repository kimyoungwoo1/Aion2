#!/usr/bin/env python3
"""Patch live Aion2 project in-place: owner-specific homework columns, no replacements.
Run from project root after extracting the ZIP.
"""
from pathlib import Path
import re

root = Path.cwd()
server = root / 'src/index.js'
app = root / 'public/app.js'
html = root / 'public/index.html'
module = root / 'src/homework-custom-api.js'
migration = root / 'migrations/0024_homework_custom_columns.sql'
for path in (server,app,html,module,migration):
    if not path.is_file():
        raise SystemExit(f'Missing required file: {path}')


def replace_once(text, old, new, label):
    if text.count(old) != 1:
        raise RuntimeError(f'Expected one {label}, found {text.count(old)}. No file written.')
    return text.replace(old,new,1)


def apply_server(text):
    marker = 'AION2_HOMEWORK_CUSTOM_COLUMNS_V1'
    if marker in text: return text
    text = ('import { getCustomHomeworkData, customHomeworkApi } from "./homework-custom-api.js";\n'
            + text)
    func = re.search(r'async function homeworkApi\(request, env, path, user, now\)\s*\{', text)
    if not func: raise RuntimeError('homeworkApi() not found')
    init = func.group(0)
    text = replace_once(text, init, init + '''
  // AION2_HOMEWORK_CUSTOM_COLUMNS_V1: separate owner-scoped persistent tasks.
  if (path === '/api/homework/custom-task' ||
      path === '/api/homework/custom-progress' ||
      path === '/api/homework/task-order') {
    return customHomeworkApi(request,env,path,user.nickname,now);
  }
''', 'homework API entry')
    match = re.search(r'return json\(\{weekStart:week,\s*tasks:HOMEWORK_TASKS,\s*characters,\s*order\}\);',text)
    if not match: raise RuntimeError('homework GET result not found')
    text = text[:match.start()] + '''const custom = await getCustomHomeworkData(env,nickname,characters);
    return json({weekStart:week,tasks:HOMEWORK_TASKS,characters,order,...custom});''' + text[match.end():]
    text = re.sub(r"(\{\s*key:\s*'craft',\s*label:\s*')[^']+('\s*\})",
                  lambda m:m.group(1)+r'\uC624\uB4DC\uAD6C\uB9E4&\uC81C\uC791'+m.group(2), text, count=1)
    # Use JS escape sequences; actual visible name comes from JS parser.
    return text


def apply_app(text):
    marker = 'AION2_HOMEWORK_TASK_COLUMNS_V1'
    if marker in text: return text
    new_helper = r'''
// AION2_HOMEWORK_TASK_COLUMNS_V1: task column order belongs to the login nickname.
let homeworkTaskSaving = false;
let homeworkDraggingTask = null;
function orderedHomeworkTasks(data) {
  const builtins = (data?.tasks || []).map(t => ({...t,
    label:t.key === 'craft' ? '\uC624\uB4DC\uAD6C\uB9E4&\uC81C\uC791' : t.label}));
  const extras = (data?.customTasks || []);
  const merged = [...builtins,...extras];
  const byKey = new Map(merged.map(t => [t.key,t]));
  const order = Array.isArray(data?.taskOrder) ? data.taskOrder : [];
  return [...order.map(key => byKey.get(key)).filter(Boolean),
    ...merged.filter(t => !order.includes(t.key))];
}
async function saveHomeworkTaskOrder(keys) {
  if (!homeworkData || homeworkTaskSaving) return;
  const old = [...(homeworkData.taskOrder || [])];
  homeworkTaskSaving = true;
  homeworkData.taskOrder = [...keys];
  renderHomework();
  $('hwMessage').textContent = '\uC219\uC81C \uC5F4 \uC21C\uC11C \uC800\uC7A5 \uC911...';
  try {
    const result = await api('/api/homework/task-order','POST',{taskKeys:keys});
    homeworkData.taskOrder = result.taskOrder;
    $('hwMessage').textContent = '\uC219\uC81C \uC5F4 \uC21C\uC11C\uB97C \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4. \uCD08\uAE30\uD654 \uD6C4\uC5D0\uB3C4 \uC720\uC9C0\uB429\uB2C8\uB2E4.';
  } catch (error) {
    homeworkData.taskOrder = old;
    renderHomework();
    $('hwMessage').textContent = error.message;
  } finally { homeworkTaskSaving = false; }
}
function renderHomeworkTaskHeaders(tasks) {
  const table = document.querySelector('.homework-table');
  const head = table?.querySelector('thead tr');
  if (!head) return;
  const all = [...head.querySelectorAll(':scope > th')];
  if (all.length < 8) return;
  // Keep 7 fixed character/od columns and the last membership column.
  for (const old of all.slice(7,-1)) old.remove();
  const membership = all[all.length-1];
  table.style.minWidth = tasks.length > 8
    ? `${Math.max(1240,1240 + (tasks.length - 8) * 102)}px` : '';
  for (const task of tasks) {
    const th = document.createElement('th');
    th.className = 'hw-task-column' + (task.custom ? ' hw-task-custom' : '');
    th.dataset.taskKey = task.key;
    const handle = document.createElement('span');
    handle.className = 'hw-task-grip';
    handle.textContent = '\u283F';
    handle.draggable = true;
    handle.tabIndex = 0;
    handle.setAttribute('role','button');
    handle.setAttribute('aria-label',`${task.label} \uC219\uC81C \uC5F4 \uC21C\uC11C \uBCC0\uACBD`);
    handle.title = '\uB4DC\uB798\uADF8\uD558\uAC70\uB098 \uC88C/\uC6B0 \uBC29\uD5A5\uD0A4\uB85C \uC774\uB3D9';
    const label = document.createElement('span');
    label.textContent = task.label;
    label.className = 'hw-task-caption';
    th.append(handle,label);
    head.insertBefore(th,membership);
    handle.addEventListener('dragstart',event => {
      if (homeworkTaskSaving) { event.preventDefault(); return; }
      homeworkDraggingTask = task.key;
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain',task.key);
      th.classList.add('hw-task-dragging');
    });
    handle.addEventListener('dragend',() => {
      homeworkDraggingTask = null;
      head.querySelectorAll('.hw-task-dragging,.hw-task-target').forEach(
        h => h.classList.remove('hw-task-dragging','hw-task-target'));
    });
    th.addEventListener('dragover',event => {
      if (!homeworkDraggingTask || homeworkTaskSaving) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      head.querySelectorAll('.hw-task-target').forEach(h => h.classList.remove('hw-task-target'));
      if (homeworkDraggingTask !== task.key) th.classList.add('hw-task-target');
    });
    th.addEventListener('drop',event => {
      if (!homeworkDraggingTask || homeworkTaskSaving) return;
      event.preventDefault();
      const dragged = homeworkDraggingTask;
      homeworkDraggingTask = null;
      head.querySelectorAll('.hw-task-dragging,.hw-task-target').forEach(
        h => h.classList.remove('hw-task-dragging','hw-task-target'));
      if (dragged === task.key) return;
      const keys = tasks.map(t => t.key).filter(k => k !== dragged);
      const i = keys.indexOf(task.key);
      if (i < 0) return;
      const after = event.clientX > th.getBoundingClientRect().left + th.offsetWidth / 2;
      keys.splice(i + (after ? 1 : 0),0,dragged);
      void saveHomeworkTaskOrder(keys);
    });
    handle.addEventListener('keydown',event => {
      if (!['ArrowLeft','ArrowRight'].includes(event.key) || homeworkTaskSaving) return;
      event.preventDefault();
      const keys = tasks.map(t => t.key);
      const i = keys.indexOf(task.key);
      const target = i + (event.key === 'ArrowLeft' ? -1 : 1);
      if (target < 0 || target >= keys.length) return;
      [keys[i],keys[target]] = [keys[target],keys[i]];
      void saveHomeworkTaskOrder(keys).then(() => {
        const next = [...head.querySelectorAll('.hw-task-grip')].find(
          el => el.getAttribute('aria-label')?.startsWith(`${task.label} `));
        next?.focus();
      });
    });
  }
}

function setupHomeworkTaskCreator() {
  const add = $('hwAddTask');
  const dialog = $('hwAddTaskDialog');
  const form = $('hwAddTaskForm');
  const cancel = $('hwAddTaskCancel');
  const titleInput = $('hwTaskTitle');
  if (!add || !dialog || !form || !cancel || !titleInput) return;
  add.addEventListener('click', () => {
    titleInput.value = '';
    dialog.showModal();
    titleInput.focus();
  });
  cancel.addEventListener('click', () => dialog.close());
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const title = titleInput.value.trim();
    if (!title || title.length > 24) {
      $('hwMessage').textContent = '\uC219\uC81C \uC774\uB984\uC740 1~24\uC790\uB85C \uC785\uB825\uD574 \uC8FC\uC138\uC694.';
      return;
    }
    add.disabled = true;
    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;
    try {
      await api('/api/homework/custom-task','POST',{title});
      dialog.close();
      await loadHomework();
      $('hwMessage').textContent = `${title} \uC219\uC81C\uB97C \uCD94\uAC00\uD588\uC2B5\uB2C8\uB2E4. \uC644\uB8CC \uC0C1\uD0DC\uB294 \uC790\uB3D9 \uCD08\uAE30\uD654\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.`;
    } catch(error) {
      $('hwMessage').textContent = error.message;
    } finally {add.disabled=false;submit.disabled=false;}
  });
}
setupHomeworkTaskCreator();
'''
    anchor = 'function resetHomeworkView() {'
    text = replace_once(text, anchor, new_helper + '\n' + anchor, 'homework UI helper anchor')
    start = '  const tasks = homeworkData.tasks || [];'
    text = replace_once(text,start,'  const tasks = orderedHomeworkTasks(homeworkData);\n  renderHomeworkTaskHeaders(tasks);', 'homework tasks line')
    text = replace_once(text,'const completed = rows.reduce((sum, ch) => sum + ch.completed.length, 0);',
      'const completed = rows.reduce((sum, ch) => sum + ch.completed.length + (ch.customCompleted || []).length, 0);',
      'homework completed count')
    # A dynamic task header has one cell per task, so keep legacy fixed cell count for empty row.
    text = replace_once(text,'cell.colSpan = 16;', 'cell.colSpan = 8 + tasks.length;', 'empty homework colspan')
    old = '''      const done = character.completed.includes(task.key);'''
    text = replace_once(text,old,'''      const done = task.custom
        ? (character.customCompleted || []).includes(task.key)
        : character.completed.includes(task.key);''','task done check')
    old_request = "await api('/api/homework','POST', {characterId:character.id,taskKey:task.key,completed:!done});"
    new_request = """await api(task.custom ? '/api/homework/custom-progress' : '/api/homework',
            'POST', task.custom
              ? {characterId:character.id,taskId:task.id,completed:!done}
              : {characterId:character.id,taskKey:task.key,completed:!done});"""
    text = replace_once(text,old_request,new_request,'task completion save')
    return text


def apply_html(text):
    marker = 'AION2_HOMEWORK_TASK_COLUMNS_V1'
    if marker in text: return text
    start = 'id="hwReload"'
    if text.count(start)!=1: raise RuntimeError('homework reload button not found')
    # Insert before reset button when present, otherwise before reload.
    needle = '<button class="danger small" id="hwReset"'
    if needle not in text:
        needle = '<button class="secondary small" id="hwReload"'
    add_button = ('<!-- AION2_HOMEWORK_TASK_COLUMNS_V1 -->'
                  '<button class="secondary small" id="hwAddTask" type="button">'
                  '&#xC219;&#xC81C; &#xCD94;&#xAC00;</button> ')
    text = replace_once(text,needle,add_button + needle,'add task button')
    # Expose a short dialog, not native window.prompt.
    body_anchor = '</body>'
    dialog = '''  <dialog id="hwAddTaskDialog" class="hw-custom-dialog">
    <form id="hwAddTaskForm">
      <h3>&#xC219;&#xC81C; &#xCD94;&#xAC00;</h3>
      <label for="hwTaskTitle">&#xC0C8; &#xC219;&#xC81C; &#xC774;&#xB984;</label>
      <input id="hwTaskTitle" type="text" maxlength="24" required autocomplete="off"
             placeholder="&#xC219;&#xC81C; &#xC774;&#xB984; &#xC785;&#xB825;" />
      <p class="muted">&#xCD94;&#xAC00;&#xD55C; &#xC219;&#xC81C;&#xB294; &#xCD08;&#xAE30;&#xD654;&#xD558;&#xC9C0; &#xC54A;&#xC2B5;&#xB2C8;&#xB2E4;.</p>
      <div class="hw-custom-actions">
        <button type="button" class="secondary" id="hwAddTaskCancel">&#xCDE8;&#xC18C;</button>
        <button type="submit" class="primary">&#xCD94;&#xAC00;</button>
      </div>
    </form>
  </dialog>
'''
    text=replace_once(text,body_anchor,dialog+body_anchor,'body closing tag')
    css = '''
    /* Task headers are reorderable independently of character rows. */
    .homework-table th.hw-task-column { min-width:78px; padding:7px 2px; vertical-align:middle; }
    .hw-task-grip { display:inline-block; cursor:grab; touch-action:none;
      user-select:none; padding:3px 5px; color:#edc07b; border-radius:5px;
      font-size:14px; line-height:1; }
    .hw-task-grip:focus-visible, .hw-task-grip:hover {outline:2px solid #edc07b;}
    .hw-task-caption { display:block; font-size:11px; white-space:normal; overflow-wrap:anywhere; }
    .hw-task-dragging {opacity:.5;}
    .hw-task-target {outline:2px dashed #edc07b; outline-offset:-2px;}
    .hw-task-custom .hw-task-caption {color:#f0c67d;}
    .hw-custom-dialog { border:1px solid #536583; border-radius:13px; background:#18243b;
      color:#fff; padding:22px; min-width:min(400px,90vw); max-width:90vw; }
    .hw-custom-dialog::backdrop {background:rgba(2,8,18,.75);}
    .hw-custom-dialog form {display:grid;gap:12px;}
    .hw-custom-dialog h3 {margin:0;}
    .hw-custom-dialog input {width:100%; box-sizing:border-box;}
    .hw-custom-actions {display:flex;gap:10px;justify-content:flex-end;}
'''
    text=replace_once(text,'</style>', css+'</style>','existing inline style')
    # Keep the user-requested item text even in the no-JS fallback table header.
    text=text.replace('>\uc624\ub4dc\uad6c\ub9e4</th>', '>\uc624\ub4dc\uad6c\ub9e4&\uc81c\uc791</th>')
    return text

originals={server:server.read_text('utf-8'),app:app.read_text('utf-8'),html:html.read_text('utf-8')}
try:
    changed={server:apply_server(originals[server]),app:apply_app(originals[app]),
             html:apply_html(originals[html])}
except Exception as error:
    raise SystemExit('Patch aborted before writing any files: '+str(error))
for path,content in changed.items():
    if content != originals[path]:
        path.write_text(content,'utf-8')
        print('Updated',path)
    else:
        print('Already patched',path)

# Preserve compatibility with older in-memory Worker tests that create only
# the pre-0024 schema. New custom API reads require the extra three tables.
for test_name in ('test-homework-order.mjs','test-homework-od.mjs','test-od-auto-recovery.mjs'):
    test_file = root / 'tests' / test_name
    if not test_file.exists():
        continue
    original = test_file.read_text('utf-8')
    if '0024_homework_custom_columns.sql' in original:
        continue
    pattern = r"db\.exec\(readFileSync\(new URL\('../migrations/00\d+_[^']+\.sql',import\.meta\.url\),'utf8'\)\);"
    matches = list(re.finditer(pattern, original))
    if not matches:
        print('Skipped legacy test (unrecognized setup):', test_file)
        continue
    insertion = "\ndb.exec(readFileSync(new URL('../migrations/0024_homework_custom_columns.sql',import.meta.url),'utf8'));"
    position = matches[-1].end()
    test_file.write_text(original[:position] + insertion + original[position:],'utf-8')
    print('Updated in-memory DB setup',test_file)

print('Custom columns patch applied; run D1 migration before deploying.')
