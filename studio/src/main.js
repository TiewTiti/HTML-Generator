import './style.css';
import {
  TAGS, TEACHER_CODE, activePieces, esc, isTeacherUnlocked, loadState, makePiece,
  saveState, selectedPiece, setTeacherUnlocked,
} from './model.js';
import { applyBrand, templateList } from './templates.js';
import { cssSource, fullDocument, htmlSource } from './export.js';

const app = document.querySelector('#app');
const state = loadState();
const otp = ['', '', '', '', '', ''];
let toastTimer = 0;

function persist() { saveState(state); }
function showToast(text) {
  state.toast = text;
  render();
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { state.toast = ''; render(); }, 1600);
}

function stepClass(id) {
  const order = ['html', 'css', 'code'];
  const cur = order.indexOf(state.step);
  const i = order.indexOf(id);
  if (i === cur) return 'border-[#1a73e8] bg-[#1a73e8] font-bold text-white';
  if (i === cur + 1) return 'border-[#1a73e8] bg-white font-bold text-[#1b4f86]';
  return 'border-[#d5dde6] bg-white font-bold text-[#1b4f86]';
}

function icon(tag, size) {
  return `<img src="/icons/${tag}.png" width="${size}" height="${size}" alt="" draggable="false">`;
}

function brandMark() {
  return `<img src="/crest.jpg" width="28" height="40" alt="" class="object-contain">`;
}

function nav() {
  const loginOn = state.form === 'login';
  const caretLeft = state.step === 'html' ? '605px' : state.step === 'css' ? '711px' : '817px';
  return `
  <header class="relative flex h-14 shrink-0 items-center border-b border-[#e6e8ec] bg-white px-4">
    ${brandMark()}
    <div class="ml-3 flex h-[50px] items-center rounded-[25px] border border-[#e6e8ec] bg-white px-4 text-sm font-semibold">Design : Login &amp; Register</div>
    <nav class="absolute left-[570px] top-1.5 flex h-11 w-[300px] items-center" aria-label="ลำดับงาน">
      <button type="button" data-step="html" class="ml-2 h-8 w-[72px] rounded-2xl border text-sm ${stepClass('html')}">HTML</button>
      <span class="mx-1 text-[#5c6570]">→</span>
      <button type="button" data-step="css" class="h-8 w-[72px] rounded-2xl border text-sm ${stepClass('css')}">CSS</button>
      <span class="mx-1 text-[#5c6570]">→</span>
      <button type="button" data-step="code" class="h-8 w-[72px] rounded-2xl border text-sm ${stepClass('code')}">code</button>
    </nav>
    <img src="/icons/caret.svg" width="16" height="9" alt="" class="pointer-events-none absolute top-[45px]" style="left:${caretLeft}">
    <button type="button" data-action="ask-done" class="ml-auto h-8 rounded-lg bg-[#1f9d55] px-4 text-[13px] font-semibold text-white">เสร็จสิ้น</button>
    <div class="flex items-center gap-3">
      <div class="flex h-8 w-[208px] items-center rounded-2xl border border-[#d5dde6] bg-[#f3f5f8] p-px">
        <button type="button" data-form="login" class="h-7 flex-1 rounded-[14px] text-sm ${loginOn ? 'bg-[#1a73e8] text-white' : 'bg-white text-[#3c4450]'}">เข้าสู่ระบบ</button>
        <button type="button" data-form="register" class="h-7 w-[84px] rounded-[14px] text-sm ${loginOn ? 'bg-white text-[#3c4450]' : 'bg-[#1a73e8] text-white'}">สมัคร</button>
      </div>
      <div class="grid size-9 place-items-center rounded-[18px] bg-[#1a73e8] text-sm font-semibold text-white" aria-hidden="true">น</div>
    </div>
  </header>`;
}

const PIECE_NAME = { div: 'กล่อง', p: 'ข้อความ', a: 'ลิงก์', input: 'ช่องกรอก', button: 'ปุ่ม', img: 'รูป' };

function blockBody(p) {
  const s = p.style;
  const nub = `<span class="nub" style="background:${s.bg};border-color:${s.border}"></span>`;
  if (p.tag === 'input') {
    const type = p.inputType === 'password' || p.inputType === 'email' ? p.inputType : 'text';
    const kindName = { text: 'ข้อความ', email: 'อีเมล', password: 'รหัส' }[type];
    return `<span class="vex-tag">&lt;input&gt;</span><span class="vex-text">${esc(p.text)}</span><span class="vex-kind">${kindName}</span>${nub}`;
  }
  if (p.tag === 'img') {
    const face = p.src
      ? `<img src="${esc(p.src)}" alt="" class="vex-img">`
      : `<span class="vex-text">รูป</span>`;
    return `<span class="vex-tag">&lt;img&gt;</span>${face}${nub}`;
  }
  return `<span class="vex-tag">&lt;${p.tag}&gt;</span><span class="vex-text">${esc(p.text)}</span>${nub}`;
}

function paper() {
  const list = activePieces(state);
  const image = state.page.image ? `url("${state.page.image}")` : 'none';
  const blocks = list.map((p) => {
    const on = state.selectedId === p.id ? ' is-on' : '';
    const s = p.style;
    return `<article class="vex vex-${p.tag}${on}" data-piece="${p.id}" style="background:${s.bg};color:${s.color};border-color:${s.border};border-radius:${s.radius}px;font-size:${s.fontSize}px">${blockBody(p)}</article>`;
  }).join('');
  const end = list.length
    ? ''
    : `<p class="stack-empty">กดชิ้นทางขวา<br>มันจะมาต่อกันให้</p>`;
  return `
  <section class="relative min-w-0 flex-1 overflow-auto" style="background-color:${state.page.bg};background-image:${image};background-size:cover;background-position:center">
    <div class="stack-wrap">
      <div class="stack" data-stack>
        ${blocks}${end}
      </div>
    </div>
  </section>`;
}

function tagButton(tag) {
  return `<button type="button" data-add="${tag}" class="grid h-[92px] w-20 place-items-center gap-1 rounded-xl border-[1.5px] border-[#c9d0da] bg-white text-xs font-semibold text-[#1c2430]">${icon(tag, 28)}<span>${PIECE_NAME[tag]}</span><span class="font-normal text-[#5c6570]">&lt;${tag}&gt;</span></button>`;
}

function kindButton(kind, label) {
  const piece = selectedPiece(state);
  const on = piece && piece.tag === 'input' && piece.inputType === kind;
  return `<button type="button" data-kind="${kind}" class="h-9 flex-1 rounded-lg border text-xs font-semibold ${on ? 'border-[#1a73e8] bg-[#1a73e8] text-white' : 'border-[#d5dde6] bg-white text-[#1c2430]'}">${label}</button>`;
}

function colorField(key, label, value) {
  return `
  <label class="grid h-[104px] w-20 place-items-center rounded-xl border-[1.5px] border-[#c9d0da] bg-white text-xs font-semibold">
    <input data-color="${key}" type="color" value="${esc(safeHex(value))}" class="size-10 cursor-pointer rounded-lg border border-[#c5ced6] bg-transparent p-0">
    ${label}
  </label>`;
}

function safeHex(value) {
  return /^#[0-9a-fA-F]{6}$/.test(value || '') ? value : '#ffffff';
}

function htmlPanel() {
  const piece = selectedPiece(state);
  const list = activePieces(state);
  const index = piece ? list.findIndex((item) => item.id === piece.id) : -1;
  const move = piece ? `
    <p class="px-4 pt-4 text-sm font-bold">สลับที่</p>
    <div class="flex gap-2 px-4 pt-2">
      <button type="button" data-move="-1" class="h-10 flex-1 rounded-lg border border-[#d5dde6] text-sm font-semibold" ${index <= 0 ? 'disabled' : ''}>ขึ้น</button>
      <button type="button" data-move="1" class="h-10 flex-1 rounded-lg border border-[#d5dde6] text-sm font-semibold" ${index < 0 || index >= list.length - 1 ? 'disabled' : ''}>ลง</button>
    </div>` : '';
  const kinds = piece && piece.tag === 'input' ? `
    <p class="px-4 pt-4 text-sm font-bold">ชนิดช่อง</p>
    <div class="flex gap-2 px-4 pt-2">${kindButton('text', 'ข้อความ')}${kindButton('email', 'อีเมล')}${kindButton('password', 'รหัส')}</div>` : '';
  const photo = piece && piece.tag === 'img' ? `
    <label class="mx-4 mt-4 flex h-10 cursor-pointer items-center justify-center rounded-lg border border-[#d5dde6] text-sm font-semibold">
      ใส่รูป
      <input data-file="img" type="file" accept="image/*" class="sr-only">
    </label>` : '';
  return `
  <p class="px-4 pt-4 text-[15px] font-semibold">เพิ่มชิ้น</p>
  <p class="px-4 pt-1 text-xs text-[#5c6570]">กดครั้งเดียว ชิ้นไปต่อท้าย</p>
  <div class="grid grid-cols-3 gap-2 px-4 pt-3">
    ${TAGS.map(tagButton).join('')}
  </div>
  <p class="px-4 pt-4 text-sm font-bold">คำบนชิ้น</p>
  <input data-sample type="text" value="${esc(piece ? piece.text : '')}" placeholder="เลือกชิ้นก่อน" class="mx-4 mt-2 h-11 w-[268px] rounded-lg border border-[#1a73e8] px-3 text-[15px] outline-none" ${piece ? '' : 'disabled'}>
  ${kinds}
  ${photo}
  ${move}`;
}

function cssPanel() {
  const piece = selectedPiece(state);
  const style = piece ? piece.style : { bg: state.page.bg, border: '#1a73e8', color: '#1c2430', radius: 8, fontSize: 28 };
  const name = piece ? PIECE_NAME[piece.tag] : 'พื้นของหน้า';
  const back = state.role === 'teacher'
    ? `<button type="button" data-action="show-templates" class="mx-4 mt-3 text-left text-sm font-semibold text-[#1a73e8]">เว็บต้นแบบ</button>`
    : '';
  return `
  <p class="px-4 pt-4 text-[15px] font-semibold">สี</p>
  <p class="px-4 pt-1 text-xs text-[#5c6570]">เลือกชิ้น แล้วเปลี่ยนสี</p>
  ${back}
  <div class="mx-4 mt-3 flex h-9 items-center rounded-lg border border-[#e6e8ec] px-3 text-sm">${name}</div>
  <div class="grid grid-cols-3 gap-2 px-4 pt-4">
    ${colorField('bg', 'พื้น', style.bg)}
    ${colorField('border', 'กรอบ', style.border)}
    ${colorField('color', 'ตัวอักษร', style.color)}
  </div>
  <div class="flex gap-2 px-4 pt-4">
    <label class="h-[72px] flex-1 rounded-xl border border-[#e6e8ec] px-3 pt-2 text-[13px] text-[#5c6570]">ขนาดตัวอักษร
      <input data-number="fontSize" type="number" min="12" max="72" value="${style.fontSize}" class="mt-1 block w-full bg-transparent text-lg font-bold text-[#1c2430] outline-none">
    </label>
    <label class="h-[72px] flex-1 rounded-xl border border-[#e6e8ec] px-3 pt-2 text-[13px] text-[#5c6570]">มุมโค้ง
      <input data-number="radius" type="number" min="0" max="40" value="${style.radius}" class="mt-1 block w-full bg-transparent text-lg font-bold text-[#1c2430] outline-none">
    </label>
  </div>
  <p class="px-4 pt-4 text-sm font-bold">รูปพื้นหลัง</p>
  <label class="mx-4 mt-2 flex h-[88px] cursor-pointer flex-col items-center justify-center rounded-[10px] border border-dashed border-[#1a73e8] text-center">
    <span class="text-sm text-[#1a73e8]">วางรูปของคุณ</span>
    <span class="text-xs text-[#5c6570]">ใช้เป็นพื้นของหน้านี้</span>
    <input data-file="page" type="file" accept="image/*" class="hidden">
  </label>`;
}

function templatePanel() {
  const cards = templateList().map((brand) => `
    <button type="button" data-template="${brand.id}" class="mb-2 flex h-[70px] w-full items-center gap-3 rounded-xl border border-[#e6e8ec] bg-white px-3 text-left">
      <span class="grid size-7 place-items-center rounded-md text-xs font-bold text-white" style="background:${brand.accent}">${esc(brand.mark)}</span>
      <span>
        <span class="block text-sm font-semibold">${esc(brand.name)}</span>
        <span class="block text-xs text-[#5c6570]">ใส่ให้เลย</span>
      </span>
    </button>`).join('');
  return `
  <p class="px-4 pt-4 text-[15px] font-semibold">เว็บต้นแบบ</p>
  <p class="px-4 pt-1 text-xs text-[#5c6570]">รหัสครูปลดล็อกชุดนี้ นักเรียนแต่งสีเองได้</p>
  <div class="px-4 pt-3">${cards}</div>
  <button type="button" data-action="own-colors" class="mx-4 mt-2 h-10 rounded-lg border border-[#1a73e8] text-sm font-semibold text-[#1a73e8]">แต่งสีเอง</button>`;
}

function side() {
  let body = htmlPanel();
  if (state.step === 'css') {
    body = state.role === 'teacher' && state.teacherPanel === 'templates' ? templatePanel() : cssPanel();
  }
  return `
  <aside class="side-panel flex h-full w-[300px] shrink-0 flex-col border-l border-[#e6e8ec] bg-white">
    <div class="min-h-0 flex-1 overflow-auto pb-4">${body}</div>
    <button type="button" data-action="ask-clear" class="mx-6 mb-6 h-11 shrink-0 rounded-lg border border-[#9f1239] text-[15px] text-[#9f1239]">ลบกระดาน</button>
  </aside>`;
}

function workScreen() {
  return `
  <div class="flex h-full min-h-0 flex-col">
    ${nav()}
    <div class="work-row flex min-h-0 flex-1">
      ${state.step === 'code' ? codeBody() : paper()}
      ${state.step === 'code' ? '' : side()}
    </div>
  </div>`;
}

function codeBody() {
  const pieces = activePieces(state);
  const html = htmlSource(pieces);
  const css = cssSource(state.page, pieces);
  return `
  <section class="min-w-0 flex-1 overflow-auto bg-[#f3f5f8] px-10 py-8">
    <p class="mb-6 text-center text-sm text-[#5c6570]">กด code ด้านบนเพื่อมาหน้านี้</p>
    <div class="mx-auto grid max-w-[1160px] gap-8 lg:grid-cols-2">
      ${codeCard('โครง HTML', html, 'html')}
      ${codeCard('สี CSS', css, 'css')}
    </div>
    <div class="mx-auto mt-6 grid max-w-[1160px] gap-8 lg:grid-cols-2">
      <button type="button" data-copy="page" class="h-[52px] rounded-lg bg-[#1a73e8] font-semibold text-white">คัดลอกทั้งหน้า</button>
      <button type="button" data-action="download" class="h-[52px] rounded-lg border border-[#1a73e8] bg-white font-semibold text-[#1a73e8]">ดาวน์โหลดไฟล์</button>
    </div>
  </section>`;
}

function codeCard(title, text, key) {
  const extra = key === 'css'
    ? `<span class="ml-auto flex gap-1 text-xs"><span class="rounded-2xl bg-[#1a73e8] px-3 py-1.5 text-white">ในหน้า</span><span class="rounded-2xl border border-[#d5dde6] px-3 py-1.5">ไฟล์ .css</span></span>`
    : '';
  return `
  <article class="flex h-[680px] flex-col rounded-2xl bg-white shadow-[0_8px_24px_rgba(23,36,61,0.06)]">
    <header class="flex h-14 items-center px-6 text-base font-semibold">${title}${extra}</header>
    <pre class="mx-6 min-h-0 flex-1 overflow-auto rounded-xl bg-[#f3f5f8] p-4 text-left text-[13px] leading-6">${esc(text)}</pre>
    <button type="button" data-copy="${key}" class="mx-6 mb-6 mt-4 h-[52px] rounded-lg bg-[#1a73e8] font-semibold text-white">คัดลอก${key === 'html' ? 'โครง' : 'สี'}</button>
  </article>`;
}

function entryScreen() {
  return `
  <div class="entry-split relative flex h-full min-h-[640px]">
    <section class="relative grid flex-1 place-items-center bg-[#1d4ed8] text-white">
      <div class="w-[560px] max-w-[90%] text-center">
        <h1 class="font-['Chakra_Petch',sans-serif] text-[72px] font-bold leading-none">นักเรียน</h1>
        <p class="mt-4 text-[22px] font-medium">เริ่มวางฟอร์มได้เลย</p>
        <button type="button" data-go="student" class="mx-auto mt-8 block h-14 w-[260px] rounded-lg bg-white text-lg font-semibold text-[#1d4ed8] shadow-[0_6px_14px_rgba(23,36,61,0.2)]">เข้าเลย</button>
      </div>
    </section>
    <section class="relative grid flex-1 place-items-center bg-[#c2410c] text-white">
      <div class="w-[560px] max-w-[90%] text-center">
        <h1 class="font-['Chakra_Petch',sans-serif] text-[72px] font-bold leading-none">ครู</h1>
        <p class="mt-4 text-[22px] font-medium">ใส่รหัส 6 หลัก</p>
        <button type="button" data-go="teacher" class="mx-auto mt-8 block h-14 w-[260px] rounded-lg bg-white text-lg font-semibold text-[#c2410c] shadow-[0_6px_14px_rgba(23,36,61,0.2)]">ใส่รหัส</button>
      </div>
    </section>
    <div class="absolute left-1/2 top-7 flex h-[84px] w-[268px] -translate-x-1/2 items-center gap-3 rounded-[42px] bg-white px-4 text-[#1c1917] shadow-[0_8px_9px_rgba(23,36,61,0.18)]">
      <img src="/crest.jpg" width="36" height="52" alt="" class="object-contain">
      <span class="font-['Chakra_Petch',sans-serif] text-base font-semibold">Design : Login &amp; Register</span>
    </div>
  </div>`;
}

function otpScreen() {
  const boxes = otp.map((digit, i) => `
    <input class="otp-box h-20 w-16 rounded-lg border border-[#d5dde6] text-center text-2xl outline-none focus:border-[#1a73e8]" data-otp="${i}" inputmode="numeric" autocomplete="off" maxlength="1" aria-label="หลักที่ ${i + 1}" value="${digit ? '•' : ''}">`).join('');
  return `
  <div class="grid h-full place-items-center bg-white text-center">
    <div>
      <img src="/crest.jpg" width="36" height="52" alt="" class="mx-auto object-contain">
      <p class="mt-3 font-semibold">Design : Login &amp; Register</p>
      <h1 class="mt-6 font-['Chakra_Petch',sans-serif] text-5xl font-bold">ใส่รหัส 6 หลัก</h1>
      <div class="mt-8 flex justify-center gap-3" id="otp-row">${boxes}</div>
      <p class="mt-3 min-h-5 text-sm text-[#9f1239]">${esc(state.otpError || '')}</p>
      <button type="button" data-action="otp-submit" class="mx-auto mt-2 block h-14 w-[300px] rounded-lg bg-[#1a73e8] text-lg font-semibold text-white">เข้าใช้งาน</button>
      <p class="mt-4 text-sm text-[#5c6570]">กรอกทีละช่อง แล้วกดเข้าใช้งาน</p>
      <button type="button" data-action="otp-back" class="mx-auto mt-4 block h-12 w-[300px] text-[#1c2430]">กลับไปเลือกทางเข้า</button>
    </div>
  </div>`;
}

function dialog() {
  if (!state.dialog) return '';
  const clear = state.dialog === 'clear';
  const title = clear ? 'ลบกระดานนี้ใช่ไหม' : 'เสร็จขั้นนี้แล้วใช่ไหม';
  const body = clear ? 'กดลบกระดาน ถ้าต้องการเริ่มวางใหม่' : 'กดไปต่อ แล้วเปิดหน้าคัดลอกโค้ด';
  const yes = clear ? 'ลบกระดาน' : 'ไปต่อ';
  const yesClass = clear ? 'bg-[#9f1239] text-white' : 'bg-[#1f9d55] text-white';
  return `
  <div class="fixed inset-0 z-40 grid place-items-center bg-[#17243d]/35">
    <div class="relative w-[min(520px,92vw)] rounded-2xl bg-white px-9 pb-8 pt-16 text-center shadow-xl">
      <div class="absolute left-1/2 top-0 grid size-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white shadow">
        <span class="icon-[lucide--bell] text-[48px] text-[#1a73e8]"></span>
        <span class="absolute right-3 top-2 grid size-6 place-items-center rounded-full bg-[#1a73e8] text-xs font-bold text-white">!</span>
      </div>
      <h2 class="text-2xl font-semibold">${title}</h2>
      <p class="mt-3 text-sm text-[#5c6570]">${body}</p>
      <div class="mt-6 flex justify-center gap-5">
        ${clear
          ? `<button type="button" data-action="dialog-no" class="h-14 w-[210px] rounded-lg border border-[#d5dde6]">ยกเลิก</button>
             <button type="button" data-action="dialog-yes" class="h-14 w-[210px] rounded-lg ${yesClass}">${yes}</button>`
          : `<button type="button" data-action="dialog-yes" class="h-14 w-[210px] rounded-lg ${yesClass}">${yes}</button>
             <button type="button" data-action="dialog-no" class="h-14 w-[210px] rounded-lg border border-[#d5dde6]">ยกเลิก</button>`}
      </div>
    </div>
  </div>`;
}

function toast() {
  if (!state.toast) return '';
  return `<div class="fixed top-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#1c2430] px-4 py-2 text-sm text-white">${esc(state.toast)}</div>`;
}

function render() {
  const screen = state.screen === 'otp' ? otpScreen() : state.screen === 'work' ? workScreen() : entryScreen();
  app.innerHTML = `<div class="h-full">${screen}${dialog()}${toast()}</div>`;
}

function addTag(tag) {
  const list = activePieces(state);
  const piece = makePiece(tag, list.length, state.form, state.inputKind);
  list.push(piece);
  state.selectedId = piece.id;
  state.pickedTag = tag;
  state.step = 'html';
  persist();
  render();
}

function readOtp() {
  return otp.join('');
}

function submitOtp() {
  if (readOtp() !== TEACHER_CODE) {
    state.otpError = 'รหัสไม่ถูกต้อง ลองใหม่';
    otp.fill('');
    render();
    return;
  }
  state.otpError = '';
  state.role = 'teacher';
  state.screen = 'work';
  state.step = 'css';
  state.teacherPanel = 'templates';
  setTeacherUnlocked(true);
  persist();
  render();
}

function onClick(event) {
  const add = event.target.closest('[data-add]');
  if (add) { addTag(add.dataset.add); return; }
  const go = event.target.closest('[data-go]');
  if (go) {
    if (go.dataset.go === 'student') {
      state.role = 'student';
      state.screen = 'work';
      state.step = 'html';
      persist();
      render();
    } else if (isTeacherUnlocked()) {
      state.role = 'teacher';
      state.screen = 'work';
      state.step = 'css';
      state.teacherPanel = 'templates';
      persist();
      render();
    } else {
      otp.fill('');
      state.otpError = '';
      state.screen = 'otp';
      render();
    }
    return;
  }
  const step = event.target.closest('[data-step]');
  if (step) {
    state.step = step.dataset.step;
    if (state.step === 'css' && state.role === 'teacher') state.teacherPanel = 'templates';
    persist();
    render();
    return;
  }
  const form = event.target.closest('[data-form]');
  if (form) {
    state.form = form.dataset.form;
    state.selectedId = null;
    persist();
    render();
    return;
  }
  const kind = event.target.closest('[data-kind]');
  if (kind) {
    const piece = selectedPiece(state);
    if (piece && piece.tag === 'input') {
      piece.inputType = kind.dataset.kind;
      persist();
      render();
    }
    return;
  }
  const move = event.target.closest('[data-move]');
  if (move && !move.disabled) {
    const list = activePieces(state);
    const from = list.findIndex((item) => item.id === state.selectedId);
    const to = from + Number(move.dataset.move);
    if (from >= 0 && to >= 0 && to < list.length) {
      const [item] = list.splice(from, 1);
      list.splice(to, 0, item);
      persist();
      render();
    }
    return;
  }
  const template = event.target.closest('[data-template]');
  if (template) {
    const brand = templateList().find((item) => item.id === template.dataset.template);
    if (brand) {
      const next = applyBrand(brand, state.form);
      state.boards[state.form] = next.pieces;
      state.page = next.page;
      state.selectedId = next.pieces[2] ? next.pieces[2].id : null;
      persist();
      showToast('ใส่โครง ' + brand.name + ' แล้ว');
    }
    return;
  }
  const copy = event.target.closest('[data-copy]');
  if (copy) {
    const pieces = activePieces(state);
    const text = copy.dataset.copy === 'css'
      ? cssSource(state.page, pieces)
      : copy.dataset.copy === 'page'
        ? fullDocument(state)
        : htmlSource(pieces);
    navigator.clipboard.writeText(text).then(() => showToast('คัดลอกแล้ว'));
    return;
  }
  const action = event.target.closest('[data-action]');
  if (action) {
    const name = action.dataset.action;
    if (name === 'ask-done') state.dialog = 'done';
    if (name === 'ask-clear') state.dialog = 'clear';
    if (name === 'dialog-no') state.dialog = null;
    if (name === 'own-colors') state.teacherPanel = 'colors';
    if (name === 'show-templates') state.teacherPanel = 'templates';
    if (name === 'otp-back') { state.screen = 'entry'; state.otpError = ''; }
    if (name === 'otp-submit') { submitOtp(); return; }
    if (name === 'dialog-yes' && state.dialog === 'clear') {
      state.boards[state.form] = [];
      state.selectedId = null;
      state.dialog = null;
    }
    if (name === 'dialog-yes' && state.dialog === 'done') {
      state.dialog = null;
      state.step = 'code';
    }
    if (name === 'download') {
      const blob = new Blob([fullDocument(state)], { type: 'text/html;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'login-register.html';
      link.click();
      URL.revokeObjectURL(link.href);
      showToast('ดาวน์โหลดไฟล์แล้ว');
      return;
    }
    persist();
    render();
    return;
  }
  const pieceEl = event.target.closest('[data-piece]');
  if (pieceEl && !event.target.closest('aside')) {
    state.selectedId = pieceEl.dataset.piece;
    const piece = selectedPiece(state);
    if (piece) {
      state.pickedTag = piece.tag;
      if (piece.tag === 'input') state.inputKind = piece.inputType;
    }
    persist();
    render();
  }
}

function onInput(event) {
  const sample = event.target.closest('[data-sample]');
  if (sample) {
    const piece = selectedPiece(state);
    if (!piece) return;
    piece.text = sample.value;
    persist();
    const node = app.querySelector(`[data-piece="${piece.id}"]`);
    if (!node) return;
    const label = node.querySelector('.vex-text');
    if (label) label.textContent = piece.text;
    const kind = node.querySelector('.vex-kind');
    if (kind && piece.tag === 'input') kind.textContent = piece.inputType;
    return;
  }
  const color = event.target.closest('[data-color]');
  if (color) {
    const piece = selectedPiece(state);
    const key = color.dataset.color;
    if (!piece) {
      if (key === 'bg') state.page.bg = color.value;
      persist();
      paintPiece(null);
      return;
    }
    if (key === 'bg' || (key === 'button' && piece.tag === 'button')) piece.style.bg = color.value;
    if (key === 'border' || (key === 'button' && piece.tag === 'button')) piece.style.border = color.value;
    if (key === 'color') piece.style.color = color.value;
    persist();
    paintPiece(piece);
    return;
  }
  const number = event.target.closest('[data-number]');
  if (number) {
    const piece = selectedPiece(state);
    const value = Number(number.value);
    if (!piece || !Number.isFinite(value)) return;
    if (number.dataset.number === 'fontSize') piece.style.fontSize = value;
    if (number.dataset.number === 'radius') piece.style.radius = value;
    if (number.dataset.number === 'h') piece.h = value;
    persist();
    paintPiece(piece);
  }
  const otpInput = event.target.closest('[data-otp]');
  if (otpInput) {
    const index = Number(otpInput.dataset.otp);
    const digit = String(otpInput.value || '').replace(/\D/g, '').slice(-1);
    otp[index] = digit;
    otpInput.value = digit ? '•' : '';
    state.otpError = '';
    const err = app.querySelector('.text-\\[\\#9f1239\\]');
    if (err) err.textContent = '';
    if (digit && index < 5) {
      const next = app.querySelector(`[data-otp="${index + 1}"]`);
      if (next) next.focus();
    }
    if (digit && index === 5 && readOtp().length === 6) submitOtp();
  }
}

function paintPiece(piece) {
  if (!piece) {
    const section = app.querySelector('section.relative');
    if (section) section.style.backgroundColor = state.page.bg;
    return;
  }
  const node = app.querySelector(`[data-piece="${piece.id}"]`);
  if (!node) return;
  const s = piece.style;
  node.style.background = s.bg;
  node.style.color = s.color;
  node.style.border = `1.5px solid ${s.border}`;
  node.style.borderRadius = s.radius + 'px';
  node.style.fontSize = s.fontSize + 'px';
  node.style.borderRadius = s.radius + 'px';
  const nub = node.querySelector('.nub');
  if (nub) {
    nub.style.background = s.bg;
    nub.style.borderColor = s.border;
  }
}

function readFile(file, done) {
  const reader = new FileReader();
  reader.onload = () => done(String(reader.result || ''));
  reader.readAsDataURL(file);
}

function onChange(event) {
  const file = event.target.closest('[data-file]');
  if (!file || !file.files || !file.files[0]) return;
  readFile(file.files[0], (url) => {
    if (file.dataset.file === 'page') state.page.image = url;
    if (file.dataset.file === 'img') {
      const piece = selectedPiece(state);
      const target = piece && piece.tag === 'img'
        ? piece
        : activePieces(state).find((item) => item.tag === 'img');
      if (target) target.src = url;
      else {
        const made = makePiece('img', activePieces(state).length, state.form, 'text');
        made.src = url;
        activePieces(state).push(made);
        state.selectedId = made.id;
      }
    }
    persist();
    render();
  });
}

function onKeyDown(event) {
  const otpInput = event.target.closest('[data-otp]');
  if (!otpInput) return;
  const index = Number(otpInput.dataset.otp);
  if (event.key === 'Backspace' && !otp[index] && index > 0) {
    otp[index - 1] = '';
    const prev = app.querySelector(`[data-otp="${index - 1}"]`);
    if (prev) { prev.value = ''; prev.focus(); }
  }
  if (event.key === 'Enter') submitOtp();
}

function onPaste(event) {
  const otpInput = event.target.closest('[data-otp]');
  if (!otpInput) return;
  const digits = (event.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
  if (!digits) return;
  event.preventDefault();
  digits.split('').forEach((digit, i) => {
    otp[i] = digit;
    const box = app.querySelector(`[data-otp="${i}"]`);
    if (box) box.value = '•';
  });
  if (digits.length === 6) submitOtp();
}

app.addEventListener('click', onClick);
app.addEventListener('input', onInput);
app.addEventListener('change', onChange);
app.addEventListener('keydown', onKeyDown);
app.addEventListener('paste', onPaste);

render();
