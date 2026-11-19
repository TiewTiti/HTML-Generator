import { esc } from './model.js';

function pieceHtml(p) {
  const id = esc(p.id);
  if (p.tag === 'p') return `    <p id="${id}">${esc(p.text)}</p>`;
  if (p.tag === 'a') return `    <a id="${id}" href="${esc(p.href || '#')}">${esc(p.text)}</a>`;
  if (p.tag === 'button') return `    <button id="${id}" type="submit">${esc(p.text)}</button>`;
  if (p.tag === 'img') {
    const src = p.src ? ` src="${esc(p.src)}"` : '';
    return `    <img id="${id}" alt=""${src}>`;
  }
  if (p.tag === 'input') {
    const type = p.inputType === 'password' || p.inputType === 'email' ? p.inputType : 'text';
    return `    <input id="${id}" type="${type}" placeholder="${esc(p.text)}">`;
  }
  return `    <div id="${id}">${esc(p.text)}</div>`;
}

export function htmlSource(pieces) {
  return `<form class="sheet">\n${pieces.map(pieceHtml).join('\n')}\n</form>`;
}

function pieceRule(p) {
  const s = p.style;
  const lines = [
    `#${p.id} {`,
    `  background: ${s.bg};`,
    `  color: ${s.color};`,
    `  border: 1.5px solid ${s.border};`,
    `  border-radius: ${s.radius}px;`,
    `  font-size: ${s.fontSize}px;`,
  ];
  if (p.tag === 'img' && p.src) lines.push('  width: 120px;', '  height: 88px;', '  object-fit: cover;');
  lines.push('}');
  return lines.join('\n');
}

export function cssSource(page, pieces) {
  const image = page.image ? `url("${page.image.replace(/"/g, '%22')}")` : 'none';
  return [
    'body {',
    '  margin: 0;',
    '  min-height: 100vh;',
    `  background-color: ${page.bg};`,
    `  background-image: ${image};`,
    '  background-size: cover;',
    '  background-position: center;',
    "  font-family: Sarabun, 'Noto Sans Thai', sans-serif;",
    '}',
    '.sheet {',
    '  display: flex;',
    '  flex-direction: column;',
    '  gap: 12px;',
    '  width: min(420px, calc(100% - 32px));',
    '  margin: 48px auto;',
    '  padding: 8px 0 24px;',
    '}',
    '.sheet > * {',
    '  box-sizing: border-box;',
    '  margin: 0;',
    '  padding: 14px 16px;',
    '  font-family: inherit;',
    '}',
    pieces.map(pieceRule).join('\n'),
  ].join('\n');
}

export function fullDocument(state) {
  const login = htmlSource(state.boards.login);
  const register = htmlSource(state.boards.register);
  const css = cssSource(state.page, [...state.boards.login, ...state.boards.register]);
  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${state.form === 'register' ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}</title>
  <style>
${css}
.switch { display: flex; gap: 8px; justify-content: center; padding: 16px; }
.switch button { height: 36px; padding: 0 16px; border-radius: 18px; border: 1px solid #d5dde6; background: #fff; cursor: pointer; }
.switch button.on { background: #3b82f6; color: #fff; border-color: #3b82f6; }
.pane { display: none; }
.pane.on { display: block; }
  </style>
</head>
<body>
  <div class="switch">
    <button type="button" class="on" data-show="login">เข้าสู่ระบบ</button>
    <button type="button" data-show="register">สมัคร</button>
  </div>
  <div class="pane on" data-pane="login">
${login}
  </div>
  <div class="pane" data-pane="register">
${register}
  </div>
  <script>
    var root = document;
    root.querySelectorAll('[data-show]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        root.querySelectorAll('[data-show]').forEach(function (b) { b.classList.remove('on'); });
        btn.classList.add('on');
        root.querySelectorAll('[data-pane]').forEach(function (pane) {
          pane.classList.toggle('on', pane.getAttribute('data-pane') === btn.getAttribute('data-show'));
        });
      });
    });
    root.querySelectorAll('form').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        alert('ฟอร์มนี้ส่งได้แล้ว\\n\\nไฟล์นี้ไม่มีหลังบ้าน จึงยังไม่บันทึกข้อมูล');
      });
    });
  </script>
</body>
</html>
`;
}
