import { esc } from './model.js';

function rule(p) {
  const s = p.style;
  const bg = p.tag === 'button' ? s.bg : s.bg;
  return [
    `left:${p.x}px`,
    `top:${p.y}px`,
    `width:${p.w}px`,
    `height:${p.h}px`,
    `background:${bg}`,
    `color:${s.color}`,
    `border:1.5px solid ${s.border}`,
    `border-radius:${s.radius}px`,
    `font-size:${s.fontSize}px`,
  ].join(';');
}

function pieceHtml(p, indent) {
  const id = esc(p.id);
  const style = rule(p);
  const pad = indent || '    ';
  if (p.tag === 'p') return `${pad}<p class="piece" id="${id}" style="${style}">${esc(p.text)}</p>`;
  if (p.tag === 'a') return `${pad}<a class="piece" id="${id}" href="${esc(p.href || '#')}" style="${style}">${esc(p.text)}</a>`;
  if (p.tag === 'button') return `${pad}<button class="piece" id="${id}" type="submit" style="${style}">${esc(p.text)}</button>`;
  if (p.tag === 'img') {
    const src = p.src ? ` src="${esc(p.src)}"` : '';
    return `${pad}<img class="piece" id="${id}" alt=""${src} style="${style};object-fit:cover">`;
  }
  if (p.tag === 'input') {
    const type = p.inputType === 'password' || p.inputType === 'email' ? p.inputType : 'text';
    return `${pad}<input class="piece" id="${id}" type="${type}" placeholder="${esc(p.text)}" style="${style}">`;
  }
  return `${pad}<div class="piece" id="${id}" style="${style}"></div>`;
}

function plateHtml(frame, pieces) {
  const kids = pieces.filter((item) => item.host === frame.id).map((item) => pieceHtml(item, '      ')).join('\n');
  return `    <div class="piece plate" id="${esc(frame.id)}" style="${rule(frame)}">\n${kids}\n    </div>`;
}

export function htmlSource(pieces) {
  const body = pieces
    .filter((item) => !item.host)
    .map((item) => (item.tag === 'div' && item.cols ? plateHtml(item, pieces) : pieceHtml(item)))
    .join('\n');
  return `<form class="sheet">\n${body}\n</form>`;
}

export function cssSource(page, pieces) {
  const image = page.image ? `url("${page.image.replace(/"/g, '%22')}")` : 'none';
  const lines = [
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
    '  position: relative;',
    '  width: min(1140px, 100%);',
    '  min-height: 780px;',
    '  margin: 0 auto;',
    '}',
    '.piece {',
    '  position: absolute;',
    '  box-sizing: border-box;',
    '}',
    'button.piece, input.piece {',
    '  font-family: inherit;',
    '}',
  ];
  pieces.forEach((p) => {
    if (p.tag === 'p') lines.push(`#${p.id} { font-size: ${p.style.fontSize}px; }`);
  });
  return lines.join('\n');
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
.switch button.on { background: #1a73e8; color: #fff; border-color: #1a73e8; }
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
