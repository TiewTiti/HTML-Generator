export const TEACHER_CODE = '759212';

const STORE = 'login-studio-next-v3';
const UNLOCK = 'login-studio-next-teacher';

export const TAGS = ['div', 'p', 'a', 'input', 'button', 'img'];

let seq = 1;

export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}

export function defaultStyle(tag) {
  if (tag === 'button') return { bg: '#3b82f6', border: '#2563eb', color: '#ffffff', radius: 18, fontSize: 16 };
  if (tag === 'p') return { bg: '#eff6ff', border: '#93c5fd', color: '#1e3a8a', radius: 18, fontSize: 22 };
  if (tag === 'a') return { bg: '#f5f3ff', border: '#c4b5fd', color: '#5b21b6', radius: 18, fontSize: 16 };
  if (tag === 'div') return { bg: '#fff7ed', border: '#fdba74', color: '#9a3412', radius: 22, fontSize: 16 };
  if (tag === 'img') return { bg: '#fdf2f8', border: '#f9a8d4', color: '#9d174d', radius: 18, fontSize: 14 };
  return { bg: '#f0fdf4', border: '#86efac', color: '#14532d', radius: 18, fontSize: 16 };
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
    style: defaultStyle(tag),
  };
  if (tag === 'div') piece.text = 'กล่อง';
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
