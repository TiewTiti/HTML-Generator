export const TEACHER_CODE = '759212';

const STORE = 'login-studio-next-v2';
export const STUD = 36;
export const PLATE_PAD = 18;
const UNLOCK = 'login-studio-next-teacher';

export const TAGS = ['div', 'p', 'a', 'input', 'button', 'img'];

let seq = 1;

export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}

export function defaultStyle(tag) {
  if (tag === 'button') {
    return { bg: '#1a73e8', border: '#1a73e8', color: '#ffffff', radius: 8, fontSize: 16 };
  }
  if (tag === 'p') {
    return { bg: 'transparent', border: 'transparent', color: '#1c2430', radius: 0, fontSize: 28 };
  }
  if (tag === 'a') {
    return { bg: 'transparent', border: 'transparent', color: '#1a73e8', radius: 0, fontSize: 16 };
  }
  if (tag === 'div') {
    return { bg: '#ffffff', border: '#d5dde6', color: '#1c2430', radius: 12, fontSize: 16 };
  }
  if (tag === 'img') {
    return { bg: '#f3f5f8', border: '#c9d0da', color: '#5c6570', radius: 8, fontSize: 14 };
  }
  return { bg: '#ffffff', border: '#c9d0da', color: '#1c2430', radius: 8, fontSize: 16 };
}

function defaultText(tag, form, inputType) {
  const register = form === 'register';
  if (tag === 'p') return register ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ';
  if (tag === 'a') return register ? 'มีบัญชีแล้ว' : 'ลืมรหัสผ่าน';
  if (tag === 'button') return register ? 'สมัคร' : 'เข้าสู่ระบบ';
  if (tag === 'input') {
    if (inputType === 'password') return '••••••••';
    if (inputType === 'email') return 'name@school.ac.th';
    return 'กรอกข้อความ';
  }
  return '';
}

export function spanFor(tag) {
  if (tag === 'img') return { c: 3, r: 3 };
  if (tag === 'a') return { c: 5, r: 1 };
  if (tag === 'p') return { c: 8, r: 2 };
  return { c: 8, r: 2 };
}

export function frameSize(frame) {
  return {
    w: PLATE_PAD * 2 + frame.cols * STUD,
    h: PLATE_PAD * 2 + frame.rows * STUD,
  };
}

export function childBox(piece) {
  const span = piece.span || spanFor(piece.tag);
  return {
    x: PLATE_PAD + piece.col * STUD + 3,
    y: PLATE_PAD + piece.row * STUD + 3,
    w: span.c * STUD - 6,
    h: span.r * STUD - 6,
  };
}

function covers(piece, col, row) {
  const span = piece.span || spanFor(piece.tag);
  return col >= piece.col && col < piece.col + span.c && row >= piece.row && row < piece.row + span.r;
}

export function slotFits(frame, piece, col, row, others) {
  const span = piece.span || spanFor(piece.tag);
  if (col < 0 || row < 0 || col + span.c > frame.cols || row + span.r > frame.rows) return false;
  return !others.some((item) => {
    if (!item.host || item.host !== frame.id || item.id === piece.id) return false;
    for (let r = row; r < row + span.r; r += 1) {
      for (let c = col; c < col + span.c; c += 1) {
        if (covers(item, c, r)) return true;
      }
    }
    return false;
  });
}

export function firstSlot(frame, piece, others) {
  const span = piece.span || spanFor(piece.tag);
  for (let row = 0; row <= frame.rows - span.r; row += 1) {
    for (let col = 0; col <= frame.cols - span.c; col += 1) {
      if (slotFits(frame, piece, col, row, others)) return { col, row };
    }
  }
  return null;
}

export function makePiece(tag, index, form, inputType) {
  const kind = tag === 'input' ? (inputType || 'text') : 'text';
  const piece = {
    id: 'el-' + (seq++),
    tag,
    x: 200,
    y: 36 + index * 24,
    w: 220,
    h: 40,
    text: defaultText(tag, form, kind),
    inputType: kind,
    href: '#',
    src: '',
    host: '',
    col: 0,
    row: 0,
    span: spanFor(tag),
    style: defaultStyle(tag),
  };
  if (tag === 'div') {
    piece.cols = 10;
    piece.rows = 8;
    piece.x = 180;
    piece.y = 28;
    const size = frameSize(piece);
    piece.w = size.w;
    piece.h = size.h;
  }
  return piece;
}

export function blankState() {
  return {
    role: null,
    screen: 'entry',
    step: 'html',
    form: 'login',
    boards: { login: [], register: [] },
    selectedId: null,
    pickedTag: 'input',
    inputKind: 'email',
    page: { bg: '#f3f5f8', image: '' },
    teacherPanel: 'templates',
    dialog: null,
    toast: '',
  };
}

function bumpSeq(state) {
  const ids = [...state.boards.login, ...state.boards.register]
    .map((p) => Number(String(p.id).replace(/\D/g, '')))
    .filter((n) => Number.isFinite(n));
  seq = (ids.length ? Math.max(...ids) : 0) + 1;
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORE);
    if (!raw) return blankState();
    const saved = JSON.parse(raw);
    const state = Object.assign(blankState(), saved);
    state.boards = {
      login: Array.isArray(saved.boards?.login) ? saved.boards.login : [],
      register: Array.isArray(saved.boards?.register) ? saved.boards.register : [],
    };
    state.page = Object.assign({ bg: '#f3f5f8', image: '' }, saved.page || {});
    state.dialog = null;
    state.toast = '';
    if (state.screen === 'otp') state.screen = 'entry';
    if (state.role === 'teacher' && !isTeacherUnlocked()) state.screen = 'otp';
    bumpSeq(state);
    return state;
  } catch (e) {
    return blankState();
  }
}

export function saveState(state) {
  const copy = JSON.parse(JSON.stringify(state));
  delete copy.dialog;
  delete copy.toast;
  try { localStorage.setItem(STORE, JSON.stringify(copy)); } catch (e) { /* full storage stays quiet */ }
}

export function isTeacherUnlocked() {
  try { return sessionStorage.getItem(UNLOCK) === '1'; } catch (e) { return false; }
}

export function setTeacherUnlocked(on) {
  try {
    if (on) sessionStorage.setItem(UNLOCK, '1');
    else sessionStorage.removeItem(UNLOCK);
  } catch (e) { /* private mode */ }
}

export function activePieces(state) {
  return state.boards[state.form] || [];
}

export function selectedPiece(state) {
  return activePieces(state).find((p) => p.id === state.selectedId) || null;
}
