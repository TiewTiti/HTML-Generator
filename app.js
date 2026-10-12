// ==========================================================================
//  Login & Register Studio — เครื่องมือสอน HTML/CSS/JS (ไม่มีหลังบ้าน)
//  หลักการสำคัญของไฟล์นี้:
//  1) CSS ของ "การ์ดฟอร์ม" ถูกเก็บไว้ที่ CARD_CSS ที่เดียว แล้วใช้ทั้ง
//     - หน้าตัวอย่างในเครื่องมือ (inject เข้า <style> ตอนเปิดโปรแกรม)
//     - ไฟล์ที่ export ออกไป (ฝังเข้าไปในไฟล์นั้นตรง ๆ)
//     ทำให้สิ่งที่เห็นในตัวอย่าง = ไฟล์ที่นักเรียนได้จริง (1:1)
//  2) buildAuthMarkup() เป็นตัวสร้าง HTML ของฟอร์มที่เดียว ใช้ทั้งหน้าตัวอย่าง
//     หน้าตัวอย่างแบบ pop-up และไฟล์ที่ export (ต่างกันแค่ scope ของ id และไอคอน)
//  3) ไฟล์ที่ export ไม่มีคลังภายนอก (CDN) เลย → เปิดแบบออฟไลน์ได้จริง
// ==========================================================================

// --------------------------------------------------------------------------
// CARD_CSS — CSS ของการ์ดฟอร์ม (ใช้ร่วมกันทั้งโปรแกรมและไฟล์ที่ export)
// ค่าที่เปลี่ยนได้ทำเป็น CSS Variables (--card-*) ทั้งหมด เพื่อให้แก้แล้วเห็นผลทันที
//   --card-accent  --card-accent-soft  --card-bg      --card-text   --card-border
//   --card-edge    --card-shadow       --card-input-bg --card-muted  --card-switcher-bg
//   --card-radius  --card-blur         --card-font
// --card-radius ตัวเดียวคุมความมนของการ์ด ปุ่มสลับ ช่องกรอก และปุ่มส่ง (คำนวณด้วย calc)
// --------------------------------------------------------------------------
/** พิกเซลโปร่งใส 1×1 (ใช้เป็นค่าตั้งต้นของรูปย่อพื้นหลัง ไม่ให้เหลือ <img> ไม่มี src) */
const BLANK_PX = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

const CARD_CSS = `
/* ===== การ์ดฟอร์ม ===== */
.auth-card-wrapper{
  width: 100%;
  max-width: 460px;
  margin: 0 auto;
  padding: 32px;
  border-radius: var(--card-radius, 16px);
  background-color: var(--card-bg, rgba(255,255,255,.95));
  -webkit-backdrop-filter: blur(var(--card-blur, 16px));
  backdrop-filter: blur(var(--card-blur, 16px));
  border: 1px solid var(--card-edge, rgba(255,255,255,.35));
  box-shadow: var(--card-shadow, 0 20px 25px -5px rgba(0,0,0,.28));
  color: var(--card-text, #0f172a);
  font-family: var(--card-font, 'Prompt', -apple-system, 'Segoe UI', 'Noto Sans Thai', sans-serif);
}

/* ===== ปุ่มสลับ Login / Register (4 แบบ เลือกด้วยคลาส style-xxxx) ===== */
.auth-switcher-container{
  display: flex;
  gap: 4px;
  padding: 4px;
  margin-bottom: 22px;
  background-color: var(--card-switcher-bg, rgba(15,23,42,.06));
  border-radius: calc(var(--card-radius, 16px) * 0.62);
}
.switcher-tab{
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 12px;
  border: 0;
  border-radius: calc(var(--card-radius, 16px) * 0.5);
  background: transparent;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  color: var(--card-muted, #64748b);
  cursor: pointer;
  transition: background-color .25s ease, color .25s ease, box-shadow .25s ease, transform .25s ease;
}
.switcher-tab.active{ background-color: var(--card-accent, #2563eb); color: #fff; font-weight: 600; }
/* แบบ sliding: แท็บที่เลือกดูเหมือนลอยขึ้นเล็กน้อย */
.style-sliding .switcher-tab.active{ box-shadow: 0 6px 14px rgba(15,23,42,.22); transform: translateY(-1px); }
/* แบบ minimal: เป็นลิงก์ข้อความ มีขีดเส้นใต้เฉพาะอันที่เลือก */
.style-minimal .auth-switcher-container{ background: transparent; border-radius: 0; padding: 0 0 8px; gap: 20px; border-bottom: 1px solid var(--card-border, #cbd5e1); }
.style-minimal .switcher-tab{ flex: 0 0 auto; padding: 4px 2px; border-radius: 0; }
.style-minimal .switcher-tab.active{ background: transparent; color: var(--card-accent, #2563eb); box-shadow: none; border-bottom: 2px solid var(--card-accent, #2563eb); margin-bottom: -10px; }
/* แบบ pill: ปุ่มแคปซูล */
.style-pill .auth-switcher-container{ background: transparent; padding: 0; gap: 8px; }
.style-pill .switcher-tab{ border: 1px solid var(--card-border, #cbd5e1); border-radius: 999px; padding: 8px 14px; }
.style-pill .switcher-tab.active{ border-color: var(--card-accent, #2563eb); }

/* ===== สลับหน้า Login / Register (5 เอฟเฟกต์ เลือกด้วยคลาส fx-xxxx) ===== */
.auth-views-viewport{ position: relative; perspective: 900px; }
.auth-view-pane{ display: none; }
.auth-view-pane.active{ display: block; animation: viewSwitch .34s ease both; }
@keyframes viewSwitch{ from{ opacity:0; transform: translateX(26px); } to{ opacity:1; transform: none; } }
.fx-fade   .auth-view-pane.active{ animation-name: viewSwitchFade; }
.fx-flip   .auth-view-pane.active{ animation-name: viewSwitchFlip; }
.fx-zoom   .auth-view-pane.active{ animation-name: viewSwitchZoom; }
.fx-bounce .auth-view-pane.active{ animation-name: viewSwitchBounce; }
@keyframes viewSwitchFade{ from{ opacity:0; } to{ opacity:1; } }
@keyframes viewSwitchFlip{ from{ opacity:0; transform: rotateY(90deg); } to{ opacity:1; transform: rotateY(0); } }
@keyframes viewSwitchZoom{ from{ opacity:0; transform: scale(.92); } to{ opacity:1; transform: scale(1); } }
@keyframes viewSwitchBounce{ 0%{ opacity:0; transform: translateY(-22px); } 70%{ transform: translateY(6px); } 100%{ opacity:1; transform: translateY(0); } }

/* ===== องค์ประกอบในฟอร์ม (กริด 12 คอลัมน์ เหมือนหน้าออกแบบ) ===== */
.pane-content{ display: grid; grid-template-columns: repeat(12, 1fr); gap: 14px; align-items: start; }
.form-row{ grid-column: span 12; display: flex; flex-direction: column; gap: 6px; }
.form-row.col-6{ grid-column: span 6; }
.form-row.col-4{ grid-column: span 4; }
.form-heading{ font-size: 20px; font-weight: 700; line-height: 1.3; }
.form-subtitle{ font-size: 13px; color: var(--card-muted, #64748b); }
.form-label{ font-size: 13px; font-weight: 600; }
.form-label .req{ color: #e11d48; }
.form-input{
  width: 100%;
  padding: 11px 12px;
  border-radius: calc(var(--card-radius, 16px) * 0.5);
  border: 1px solid var(--card-border, #cbd5e1);
  background-color: var(--card-input-bg, #fff);
  color: inherit;
  font-family: inherit;   /* สำคัญ: input ไม่รับค่าฟอนต์จากพ่อแม่โดยอัตโนมัติ */
  font-size: 13px;
  transition: border-color .2s ease, box-shadow .2s ease;
}
.form-input:focus{ outline: none; border-color: var(--card-accent, #2563eb); box-shadow: 0 0 0 3px var(--card-accent-soft, rgba(37,99,235,.18)); }
.form-btn{
  width: 100%;
  padding: 12px;
  border: 0;
  border-radius: calc(var(--card-radius, 16px) * 0.5);
  background-color: var(--card-accent, #2563eb);
  color: #fff;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: filter .2s ease;
}
.form-btn:hover{ filter: brightness(.93); }
.form-check{ display: flex; align-items: center; gap: 8px; font-size: 13px; }
.form-divider{ border: 0; border-top: 1px solid var(--card-border, #cbd5e1); margin: 2px 0; }

/* จอเล็ก: ทุกช่องกลับมาเต็มความกว้าง + ลดขนาดปุ่มสลับให้พอดี */
@media (max-width: 560px){
  .form-row.col-6, .form-row.col-4{ grid-column: span 12; }
  .switcher-tab{ font-size: 12px; padding: 8px 6px; gap: 4px; }
}
`;

// ==========================================================================
// STATE
// ==========================================================================
let activeStep = 1;
let builderTarget = 'login';      // 'login' | 'register'
let selectedElementId = null;
let previewView = 'login';        // หน้าที่แสดงในตัวอย่าง (ใช้ร่วมกันทั้งหน้าตัวอย่างและ modal)
let idSeq = 100;                  // ตัวนับ id (แยกจาก el-1..el-9 ของฟอร์มตัวอย่าง เพื่อไม่ให้ id ซ้ำ)
let pageTitle = 'ฟอร์มเข้าสู่ระบบและสมัครสมาชิก';
let dragSourceId = null;          // id ของการ์ดที่กำลังลากเพื่อสลับตำแหน่ง (null = ไม่ได้ลากอยู่)

const DEFAULT_LOGIN = () => ([
  { id: 'el-1', type: 'heading',  label: 'เข้าสู่ระบบ', subtitle: 'กรอกบัญชีผู้ใช้เพื่อเข้าสู่ระบบ', colSpan: 12 },
  { id: 'el-2', type: 'text',     label: 'ชื่อผู้ใช้ หรือ อีเมล', placeholder: 'username / email', required: true, colSpan: 12 },
  { id: 'el-3', type: 'password', label: 'รหัสผ่าน', placeholder: '••••••••', required: true, colSpan: 12 },
  { id: 'el-4', type: 'button',   label: 'เข้าสู่ระบบ', colSpan: 12 }
]);
const DEFAULT_REGISTER = () => ([
  { id: 'el-5', type: 'heading',  label: 'สมัครสมาชิก', subtitle: 'สร้างบัญชีผู้ใช้ใหม่สำหรับชั้น ม.5', colSpan: 12 },
  { id: 'el-6', type: 'text',     label: 'ชื่อ-นามสกุล', placeholder: 'นายสมชาย ใจดี', required: true, colSpan: 12 },
  { id: 'el-7', type: 'email',    label: 'อีเมล', placeholder: 'student@school.ac.th', required: true, colSpan: 12 },
  { id: 'el-8', type: 'password', label: 'ตั้งรหัสผ่าน', placeholder: '••••••••', required: true, colSpan: 12 },
  { id: 'el-9', type: 'button',   label: 'ยืนยันการสมัครสมาชิก', colSpan: 12 }
]);

let loginElements = [];
let registerElements = [];

const DEFAULT_CONFIG = () => ({
  themePreset: 'corporate',
  accentColor: '#2563eb',
  cardBgColor: '#ffffff',
  textColor: '#0f172a',
  borderColor: '#cbd5e1',
  // ค่าที่เพิ่มรอบนี้: ขอบ/เงาของการ์ด, พื้นหลังช่องกรอก, สีข้อความรอง, พื้นหลังปุ่มสลับ
  cardEdge: 'rgba(255,255,255,.45)',
  cardShadow: '0 20px 25px -5px rgba(15,23,42,.28)',
  inputBgColor: '#ffffff',
  mutedColor: '#64748b',
  switcherBg: 'rgba(15,23,42,.06)',
  // พื้นหลัง: ถ้าไม่มีรูป (ทั้ง URL และรูปที่ฝังจากเครื่อง) จะใช้ไล่สีนี้
  bgImageUrl: '',
  bgImageData: '',
  bgGradient: 'linear-gradient(135deg, #1d4ed8, #0f172a)',
  cardOpacity: 95,
  cardBlur: 16,
  cardRadius: 16,
  switcherStyle: 'tabs',
  transitionFx: 'slide',
  fontFamily: "'Prompt', -apple-system, 'Segoe UI', 'Noto Sans Thai', sans-serif"
});
let studioConfig = DEFAULT_CONFIG();

// ==========================================================================
// UTILITIES
// ==========================================================================
// แปลงข้อความของผู้ใช้ให้ปลอดภัยก่อนใส่ลง HTML (กันแท็ก/เครื่องหมายคำพูดทำหน้าเว็บพัง)
function esc(value) {
  return String(value === undefined || value === null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// id ที่ปลอดภัยสำหรับใช้เป็น id/name ของ input ใน HTML
function safeId(id) { return String(id || '').replace(/[^a-zA-Z0-9_-]/g, ''); }

// รับเฉพาะที่อยู่รูปภาพที่ปลอดภัย (กัน javascript: หรือ scheme แปลก ๆ)
// หมายเหตุสำคัญ: "ห้ามตัดอักขระใน URL" — ของเดิมตัด ( ) ' " ทำให้ URL ที่ตรวจผ่านแล้ว
// กลายเป็นที่อยู่อื่นตอนใช้งานจริง → รูปไม่ขึ้นทั้งที่ตรวจว่าโหลดได้ (บั๊กที่ผู้ใช้เจอ)
// ความปลอดภัยจัดการด้วยการ escape ตอนฝัง CSS (ดู cssUrlValue) ไม่ใช่การตัดอักขระ
function safeUrl(url) {
  const u = String(url || '').trim();
  if (!/^(https?:\/\/|data:image\/)/i.test(u)) return '';
  return u;
}

// ฝัง URL ลงใน CSS แบบปลอดภัย: ใช้ url("...") + escape เครื่องหมายคำพูด/แบ็กสแลช/ขึ้นบรรทัดใหม่
function cssUrlValue(url) {
  const safe = String(url).replace(/[\\]/g, '\\\\').replace(/"/g, '\\"').replace(/[\r\n]+/g, '');
  return `url("${safe}")`;
}

// ทำความสะอาด "ลิงก์ที่ผู้ใช้คัดลอกมา" ให้เป็นลิงก์รูปที่ใช้ได้จริง
// (คัดลอกจาก LINE/Facebook/HTML/Google Drive/Dropbox มักมีอักขระปนหรือเป็นลิงก์หน้าเว็บ)
function normalizeImageUrl(raw) {
  let u = String(raw == null ? '' : raw);
  u = u.replace(/[\u200B-\u200F\u2060\uFEFF\u00A0\u2028\u2029\t]/g, ' ');   // อักขระล่องหน/NBSP/แท็บ
  u = u.trim();
  const md = /\]\((https?:\/\/[^)]+)\)/.exec(u);                            // [ข้อความ](ลิงก์) หรือ ![](ลิงก์)
  if (md) u = md[1];
  u = u.replace(/^[\s"'`<\[(]+/, '').replace(/[\s"'`>\])]+$/, '');          // อักขระห่อหุ้มจากการคัดลอก
  u = u.replace(/^url\(\s*/i, '').replace(/\s*\)$/, '').replace(/^[\s"'`]+/, '').replace(/[\s"'`]+$/, '');
  u = u.replace(/&amp;/gi, '&').replace(/&#38;/g, '&').replace(/&quot;/gi, '"').replace(/&#39;/g, "'");
  if (/^\/\//.test(u)) u = 'https:' + u;                                    // //example.com/a.png
  if (/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}\//i.test(u)) u = 'https://' + u;     // example.com/a.png (ไม่มี scheme)
  const gDrive = /drive\.google\.com\/file\/d\/([A-Za-z0-9_-]{10,})/i.exec(u);
  if (gDrive) u = 'https://drive.google.com/uc?export=download&id=' + gDrive[1];   // ลิงก์แชร์ → ลิงก์รูปตรง ๆ
  if (/dropbox\.com\//i.test(u)) u = u.replace(/([?&])dl=[01]\b/, '$1raw=1');      // Dropbox → raw
  return u;
}

function hexToRgba(hex, alpha) {
  let c = String(hex || '').replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(c)) return `rgba(255,255,255,${alpha})`;
  const num = parseInt(c, 16);
  return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
}

// --------------------------------------------------------------------------
// ตรวจความอ่านง่ายของสี (contrast ตามมาตรฐาน WCAG) — ใช้สอนว่า "สีต้องอ่านออก"
// การ์ดที่โปร่งแสงจะถูกผสมกับพื้นหลังของหน้าโดยประมาณ (บอกผู้ใช้ตรง ๆ ว่าเป็นค่าประมาณ)
// --------------------------------------------------------------------------
function hexToRgbParts(hex) {
  let c = String(hex || '').replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(c)) return null;
  const n = parseInt(c, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function mixHex(fg, bg, alpha) {
  const a = hexToRgbParts(fg); const b = hexToRgbParts(bg);
  if (!a || !b) return bg;
  const t = Math.max(0, Math.min(1, alpha));
  const ch = (x, y) => Math.round(x * t + y * (1 - t)).toString(16).padStart(2, '0');
  return '#' + ch(a.r, b.r) + ch(a.g, b.g) + ch(a.b, b.b);
}
function relLuminance(hex) {
  const c = hexToRgbParts(hex);
  if (!c) return 0;
  const f = (v) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
}
function contrastRatio(a, b) {
  const l1 = relLuminance(a); const l2 = relLuminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
// สีพื้นหลังของหน้า (ค่าประมาณ): ถ้าไม่มีรูป ใช้สีแรกของไล่สี · ถ้ามีรูป ใช้สีเข้มของธีม
function cardBaseColor() {
  if (!effectiveBgUrl()) {
    const m = String(studioConfig.bgGradient || '').match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/);
    if (m) return m[0];
  }
  return '#0f172a';
}
function updateContrastNote() {
  const el = document.getElementById('contrast-note');
  if (!el) return;
  const c = studioConfig;
  const alpha = Math.max(0.4, Math.min(1, (Number(c.cardOpacity) || 95) / 100));
  const cardBg = mixHex(c.cardBgColor, cardBaseColor(), alpha);
  const t = contrastRatio(c.textColor, cardBg);
  const btn = contrastRatio(c.accentColor, '#ffffff');   // ตัวอักษรบนปุ่มเป็นสีขาว (ดู .form-btn ใน CARD_CSS)
  const warn = [];
  if (t < 4.5) warn.push(`สีข้อความหลักอ่านบนการ์ดยาก (${t.toFixed(1)}:1)`);
  if (btn < 4.5) warn.push(`ตัวอักษรสีขาวบนปุ่มสีเน้นหลักอ่านยาก (${btn.toFixed(1)}:1)`);

  if (warn.length) {
    el.className = 'contrast-note is-warn';
    el.innerHTML = '<strong>สีอาจอ่านยาก:</strong> ' + esc(warn.join(' · ')) +
      ' — มาตรฐานแนะนำอย่างน้อย <strong>4.5:1</strong> · ลองปรับ “สีข้อความหลัก” ให้เข้มขึ้น/อ่อนลง หรือเปลี่ยน “สีเน้นหลัก” แล้วดูตัวเลขนี้ใหม่' +
      '<br><span class="contrast-hint">(ค่าประมาณ: คิดจากการ์ดที่ผสมกับพื้นหลังของหน้าเมื่อการ์ดโปร่งแสง)</span>';
  } else {
    el.className = 'contrast-note is-ok';
    el.textContent = `สีที่เลือกอ่านง่าย — ข้อความ/การ์ด ${t.toFixed(1)}:1 · ตัวอักษรขาว/ปุ่ม ${btn.toFixed(1)}:1`;
  }
}

// --------------------------------------------------------------------------
// ค่าของการ์ดทั้งหมด → CSS Variables ชุดเดียว (--card-*)
// ใช้ 3 ที่: (1) หน้าตัวอย่าง/modal  (2) ไฟล์ที่ export  (3) ตัวอย่างย่อของธีม
// → ทุกที่จะหน้าตาตรงกันเสมอ ไม่มีทางหลุดธีมกัน
// --------------------------------------------------------------------------
function cardVarMap(v) {
  return {
    '--card-accent': v.accent,
    '--card-accent-soft': hexToRgba(v.accent, 0.18),
    '--card-bg': hexToRgba(v.cardBg, v.opacity / 100),
    '--card-text': v.text,
    '--card-border': v.border,
    '--card-edge': v.edge || 'rgba(255,255,255,.35)',
    '--card-shadow': v.shadow || '0 20px 25px -5px rgba(0,0,0,.28)',
    '--card-input-bg': v.inputBg || '#ffffff',
    '--card-muted': v.muted || '#64748b',
    '--card-switcher-bg': v.switcherBg || 'rgba(15,23,42,.06)',
    '--card-radius': v.radius + 'px',
    '--card-blur': v.blur + 'px',
    '--card-font': v.font
  };
}

// อ่านค่าที่ผู้ใช้ตั้งไว้ในเครื่องมือ ให้อยู่ในรูปเดียวกับที่ cardVarMap ต้องการ
function studioVars() {
  const c = studioConfig;
  return {
    accent: c.accentColor, cardBg: c.cardBgColor, text: c.textColor, border: c.borderColor,
    edge: c.cardEdge, shadow: c.cardShadow, inputBg: c.inputBgColor, muted: c.mutedColor,
    switcherBg: c.switcherBg, radius: c.cardRadius, blur: c.cardBlur, opacity: c.cardOpacity,
    font: c.fontFamily
  };
}

// ค่าของธีมสำเร็จรูป → รูปแบบเดียวกัน
function presetVars(p) {
  return {
    accent: p.accent, cardBg: p.cardBg, text: p.text, border: p.border,
    edge: p.edge, shadow: p.shadow, inputBg: p.inputBg, muted: p.muted,
    switcherBg: p.switcherBg, radius: p.radius, blur: p.blur, opacity: p.opacity,
    font: fontStack(p.font)
  };
}

// ตัวเลือกพื้นหลังไล่สีสำเร็จรูป (CSS ล้วน — ไม่ต้องต่ออินเทอร์เน็ต)
const BG_GRADIENTS = [
  { key: 'sea',    label: 'ทะเลลึก',      css: 'linear-gradient(135deg, #1d4ed8, #0f172a)' },
  { key: 'sunset', label: 'ตะวันตกดิน',   css: 'linear-gradient(135deg, #fb7185, #f97316 55%, #7c2d12)' },
  { key: 'forest', label: 'ป่าเขียว',     css: 'linear-gradient(135deg, #6ee7b7, #059669 55%, #064e3b)' },
  { key: 'night',  label: 'ค่ำคืน',       css: 'linear-gradient(135deg, #0f172a, #1e293b 60%, #020617)' },
  { key: 'candy',  label: 'พาสเทลหวาน',   css: 'linear-gradient(135deg, #fbcfe8, #c7d2fe 60%, #a5b4fc)' },
  { key: 'cream',  label: 'ครีมอุ่น',     css: 'linear-gradient(135deg, #fef3c7, #fcd34d 60%, #b45309)' }
];

// รูปพื้นหลังที่ใช้จริงตอนนี้ (รูปจาก URL ก่อน ถ้าไม่มีก็ใช้รูปที่ฝังจากเครื่อง)
function effectiveBgUrl() {
  return safeUrl(studioConfig.bgImageUrl) || safeUrl(studioConfig.bgImageData) || '';
}

// ขนาดไฟล์แบบอ่านง่าย (KB/MB)
function fmtSize(bytes) {
  const b = Number(bytes) || 0;
  if (b < 1024) return b + ' B';
  if (b < 1024 * 1024) return (b / 1024).toFixed(0) + ' KB';
  return (b / (1024 * 1024)).toFixed(2) + ' MB';
}

function toast(message) {
  let box = document.getElementById('app-toast');
  if (!box) {
    box = document.createElement('div');
    box.id = 'app-toast';
    box.className = 'app-toast';
    box.setAttribute('role', 'status');
    document.body.appendChild(box);
  }
  box.textContent = message;
  box.classList.add('show');
  clearTimeout(box._timer);
  box._timer = setTimeout(() => box.classList.remove('show'), 3600);
}

function injectCardCss() {
  if (document.getElementById('shared-card-css')) return;
  const style = document.createElement('style');
  style.id = 'shared-card-css';
  style.textContent = CARD_CSS;
  document.head.appendChild(style);
}

// ==========================================================================
// AUTOSAVE (เก็บงานไว้ในเบราว์เซอร์ ไม่ต้องมีหลังบ้าน)
// ==========================================================================
const STORE_KEY = 'html-generate-studio-v1';
const UI_KEY = 'html-generate-studio-ui-v1';   // เก็บสถานะ "หน้าจอ" แยกจากงาน (คนละคีย์)

function saveState() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ v: 1, pageTitle, loginElements, registerElements, studioConfig }));
    const note = document.getElementById('autosave-note');
    if (note) {
      const t = new Date();
      note.textContent = `บันทึกอัตโนมัติแล้ว ${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')} น. (เปิดหน้านี้ใหม่แล้วงานยังอยู่)`;
    }
  } catch (e) {
    // รูปที่ฝังจากเครื่องอาจทำให้ข้อมูลใหญ่เกินพื้นที่ของเบราว์เซอร์ — ต้องบอกผู้ใช้ตรง ๆ
    const note = document.getElementById('autosave-note');
    if (note) note.textContent = 'บันทึกอัตโนมัติไม่สำเร็จ (ข้อมูลใหญ่เกินพื้นที่ของเบราว์เซอร์) — งานยังอยู่ แต่ถ้าเปิดหน้าใหม่ รูปพื้นหลังที่ฝังไว้อาจหายไป (ลองใช้รูปเล็กลง)';
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return false;
    const s = JSON.parse(raw);
    if (!s || !Array.isArray(s.loginElements) || !Array.isArray(s.registerElements) || !s.studioConfig) return false;
    loginElements = s.loginElements;
    registerElements = s.registerElements;
    studioConfig = Object.assign(DEFAULT_CONFIG(), s.studioConfig);
    pageTitle = s.pageTitle || pageTitle;
    return true;
  } catch (e) { return false; }
}

function resetSavedData() {
  if (!confirm('ล้างข้อมูลที่บันทึกไว้ทั้งหมด และเริ่มจากกระดานว่างใช่หรือไม่? (คืนค่าไม่ได้)')) return;
  try { localStorage.removeItem(STORE_KEY); localStorage.removeItem(UI_KEY); } catch (e) {}
  // เริ่มจากกระดานว่าง (ไม่มี Canvas item) — ถ้าต้องการฟอร์มตัวอย่างกลับ กดปุ่ม "โหลดโครงสร้างฟอร์มมาตรฐาน"
  loginElements = [];
  registerElements = [];
  studioConfig = DEFAULT_CONFIG();
  pageTitle = 'ฟอร์มเข้าสู่ระบบและสมัครสมาชิก';
  idSeq = 100;
  selectedElementId = null;
  previewView = 'login';
  uiState = defaultUiState();
  applyUiState();
  applyConfigToControls();
  syncBgUi();
  syncThemeActive(studioConfig.themePreset, null);
  commitAll();
  toast('ล้างข้อมูลเดิมแล้ว — กระดานว่าง เริ่มสร้างฟอร์มใหม่ได้เลย');
}

// ==========================================================================
// สถานะหน้าจอ (เปิด/ปิดกลุ่มเครื่องมือ, ย่อ/ขยายแถบ) — เก็บคนละคีย์กับงาน
// เก็บไว้เพื่อให้ "เปิดใหม่แล้วเหมือนเดิม" โดยไม่ไปแตะงานที่นักเรียนทำไว้
// ==========================================================================
// กลุ่มตั้งค่า 5 กลุ่ม — กลุ่มที่ 3 รวม "สี + พื้นหลัง + ความโปร่งแสง/ความเบลอ" ไว้ด้วยกัน
// key ต้องตรงกับ id ใน index.html: #group-<key>-header / #group-<key>-body
const GROUP_KEYS = ['page', 'theme', 'appearance', 'switcher', 'typography'];
const PANEL_KEYS = ['toolbox', 'inspector', 'controls', 'code', 'teach'];
const PANEL_LAYOUT = { toolbox: '.builder-layout', inspector: '.builder-layout', controls: '.studio-layout', code: '', teach: '' };

// ค่าเริ่มต้นของ "แถบด้านข้าง": เปิดทุกแถบ (เห็นงาน + เครื่องมือพร้อมกันตั้งแต่แรก)
// ยกเว้น "โหมดสอนอ่านโค้ด" ที่ปิดไว้เพราะเป็นโหมดเสริม (กดเปิดเองเมื่อต้องสอนอ่านโค้ด)
const DEFAULT_PANELS = { toolbox: true, inspector: true, controls: true, code: true, teach: false };
const UI_STATE_VERSION = 3;            // เก็บไว้เป็นร่องรอยของรูปแบบเซฟ (ดูหมายเหตุใน loadUiState)

function defaultUiState() {
  // groups = {} → กลุ่มย่อยทุกกลุ่ม "พับปิด" (เห็นแค่หัวข้อใหญ่) ตามค่าเริ่มต้นของ isGroupOpen()
  return { groups: {}, panels: Object.assign({}, DEFAULT_PANELS) };
}
let uiState = defaultUiState();

function loadUiState() {
  try {
    const raw = localStorage.getItem(UI_KEY);
    if (!raw) return;
    const s = JSON.parse(raw);
    if (s && typeof s === 'object') {
      // เซฟเก็บเฉพาะ "สิ่งที่ผู้ใช้เลือกเอง" — ค่าที่ไม่มีในเซฟ = ใช้ค่าเริ่มต้นปัจจุบัน (แถบเปิด / กลุ่มพับปิด)
      // จึงอ่านของเก่าได้ทุกเวอร์ชันโดยไม่ต้องย้ายค่า
      uiState = {
        groups: Object.assign({}, s.groups || {}),
        panels: Object.assign({}, DEFAULT_PANELS, s.panels || {}),
      };
    }
  } catch (e) { uiState = defaultUiState(); }
}
function saveUiState() {
  try { localStorage.setItem(UI_KEY, JSON.stringify({ v: UI_STATE_VERSION, groups: uiState.groups, panels: uiState.panels })); } catch (e) {}
}

// กลุ่มย่อยในแถบตกแต่ง: ต้องมีค่า true ชัดเจนจึงถือว่า "กาง" (ไม่มีค่า = พับปิด เห็นแค่หัวข้อใหญ่)
function isGroupOpen(key) { return uiState.groups[key] === true; }
// แถบด้านข้าง: ต้องมีค่า false ชัดเจนจึงถือว่า "ซ่อน" (ไม่มีค่า = เปิด)
function isPanelOpen(key) { return uiState.panels[key] !== false; }

// เปิด/ปิดกลุ่ม — แค่ซ่อน/โชว์ ไม่วาดตัวอย่างใหม่ (งานที่ทำไว้จึงไม่หายและไม่กระพริบ)
function toggleGroup(key, ev) {
  uiState.groups[key] = !isGroupOpen(key);
  saveUiState();
  applyGroupState(key);
}
function applyGroupState(key) {
  const open = isGroupOpen(key);
  const body = document.getElementById('group-' + key + '-body');
  const btn = document.getElementById('group-' + key + '-header');
  if (body) body.hidden = !open;
  if (btn) {
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.classList.toggle('is-collapsed', !open);
    const hint = btn.getAttribute('data-open-label') || '';
    if (hint) btn.setAttribute('title', (open ? 'ย่อ' : 'ขยาย') + hint);
  }
}
function setAllGroups(open) {
  GROUP_KEYS.forEach((k) => { uiState.groups[k] = open; });
  saveUiState();
  applyUiState();
  toast(open ? 'ขยายทุกกลุ่มแล้ว' : 'ย่อทุกกลุ่มแล้ว — กดหัวข้อกลุ่มเพื่อเปิดทีละกลุ่มได้');
}

// ย่อ/ขยายแถบด้านข้าง (และกล่องโค้ด) — จำเป็นบนจอเล็กที่พื้นที่จำกัด
function togglePanel(panel, e) {
  // Ensure only one side panel (toolbox or inspector) is open at a time in step1
  // (Removed exclusive logic to allow both panels open simultaneously for layout test)
  const wasOpen = isPanelOpen(panel);
  uiState.panels[panel] = !wasOpen;
  // No mutual exclusivity enforced here
  saveUiState();
  applyPanelState(panel);
  const fromRail = e && e.currentTarget && e.currentTarget.classList && e.currentTarget.classList.contains('rail-btn');
  if (fromRail && !wasOpen) {
    const headerBtn = document.getElementById('panel-' + panel + '-toggle');
    if (headerBtn && headerBtn.focus) headerBtn.focus({ preventScroll: true });
  }
  if (isPanelOpen(panel) && window.matchMedia('(max-width: 1100px)').matches) {
    const sel = { toolbox: '.toolbox-sidebar', inspector: '.inspector-sidebar', controls: '.studio-controls-sidebar' }[panel];
    const el = sel ? document.querySelector(sel) : null;
    if (el && el.getBoundingClientRect().top > window.innerHeight - 80 && el.scrollIntoView) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

function applyPanelState(key) {
  const open = isPanelOpen(key);
  const body = document.getElementById('panel-' + key + '-body');
  const btn = document.getElementById('panel-' + key + '-toggle');
  if (body) body.hidden = !open;
  if (btn) {
    const label = btn.getAttribute('data-label') || 'แถบนี้';
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', (open ? 'ซ่อน' : 'เปิด') + label);
    btn.setAttribute('title', (open ? 'ซ่อน' : 'เปิด') + label);
    const txt = btn.querySelector('.toggle-text');
    if (txt) txt.textContent = (open ? 'ซ่อน' : 'แสดง') + label;
  }
  const layoutSel = PANEL_LAYOUT[key];
  const layout = layoutSel ? document.querySelector(layoutSel) : null;
  if (layout) layout.classList.toggle(key + '-hidden', !open);
  // ปุ่มในรางเปิดแถบ (จอใหญ่): บอกสถานะให้ถูก — ตอนนี้แถบปิดอยู่ กดแล้วจะเปิด
  const rail = document.getElementById('panel-' + key + '-rail');
  if (rail) {
    const railLabel = rail.getAttribute('data-label') || 'แถบนี้';
    rail.setAttribute('aria-expanded', open ? 'true' : 'false');
    rail.setAttribute('aria-label', 'เปิด' + railLabel);
    rail.setAttribute('title', 'เปิด' + railLabel);
  }
  if (key === 'teach' && open) renderTeachCode();   // วาดเนื้อหาโหมดสอนอ่านโค้ดตอนเปิด (ไม่กินเวลาเมื่อปิดอยู่)
}
function applyUiState() {
  GROUP_KEYS.forEach(applyGroupState);
  PANEL_KEYS.forEach(applyPanelState);
}

// ==========================================================================
// INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  injectCardCss();
  const restored = loadState();
  loadUiState();
  renderComponentButtons();
  renderThemePresets();
  renderGradientPresets();
  applyUiState();
  applyConfigToControls();
  renderCanvas();
  renderInspector();
  renderStudioPreviewStage();
  updateStudioStyles();
  bindModalEvents();
  bindBackgroundEvents();
  if (restored) toast('โหลดงานที่บันทึกไว้ล่าสุดให้แล้ว');
});

// ==========================================================================
// STEP 1: VISUAL BUILDER
// ==========================================================================
function switchMainStep(step) {
  activeStep = step;
  document.querySelectorAll('.step-tab-btn').forEach((btn, idx) => {
    btn.classList.toggle('active', idx + 1 === step);
    btn.setAttribute('aria-selected', idx + 1 === step ? 'true' : 'false');
  });
  document.querySelectorAll('.step-panel').forEach((panel, idx) => {
    panel.classList.toggle('active', idx + 1 === step);
  });
  if (step === 2) renderStudioPreviewStage();
}

function setBuilderTarget(target) {
  builderTarget = target;
  document.getElementById('target-login-btn').classList.toggle('active', target === 'login');
  document.getElementById('target-register-btn').classList.toggle('active', target === 'register');
  document.getElementById('active-target-badge').innerText = `กำลังแก้ไข: ฟอร์ม ${target === 'login' ? 'Login' : 'Register'}`;
  selectedElementId = null;
  renderCanvas();
  renderInspector();
}

function getActiveList() {
  return builderTarget === 'login' ? loginElements : registerElements;
}

function newElementId() { return 'el-' + (idSeq++); }

// รายการ "องค์ประกอบที่เพิ่มได้" — ใช้ที่เดียว สร้างทั้งกล่องเครื่องมือด้านซ้าย
// และแถบเพิ่มเร็ว (บนจอมือถือ) ปุ่มสองที่จะไม่มีทางไม่ตรงกัน
const COMPONENTS = [
  { type: 'heading',  icon: 'fa-heading',            label: 'หัวข้อ (Heading)',          short: 'หัวข้อ',
    make: () => ({ label: 'หัวข้อใหม่', subtitle: 'รายละเอียด' }) },
  { type: 'text',     icon: 'fa-font',               label: 'ช่องข้อความ (Input Text)',  short: 'ข้อความ',
    make: () => ({ label: 'ป้ายชื่อข้อความ', placeholder: 'กรอกข้อความ...', required: false }) },
  { type: 'password', icon: 'fa-key',                label: 'รหัสผ่าน (Password)',       short: 'รหัสผ่าน',
    make: () => ({ label: 'รหัสผ่าน', placeholder: '••••••••', required: true }) },
  { type: 'email',    icon: 'fa-envelope',           label: 'อีเมล (Email Input)',       short: 'อีเมล',
    make: () => ({ label: 'อีเมล', placeholder: 'name@example.com', required: true }) },
  { type: 'checkbox', icon: 'fa-square-check',       label: 'ตัวเลือก (Checkbox)',       short: 'ตัวเลือก',
    make: () => ({ label: 'ยอมรับเงื่อนไขการใช้งาน' }) },
  { type: 'button',   icon: 'fa-circle-play',        label: 'ปุ่มกด (Submit Button)',    short: 'ปุ่มกด',
    make: () => ({ label: 'ปุ่มกด' }) },
  { type: 'divider',  icon: 'fa-minus',              label: 'เส้นแบ่ง (Divider)',        short: 'เส้นแบ่ง',
    make: () => ({ label: 'เส้นแบ่ง' }) }
];
const COMPONENT_BY_TYPE = {};
COMPONENTS.forEach((c) => { COMPONENT_BY_TYPE[c.type] = c; });

function renderComponentButtons() {
  const grid = document.getElementById('component-grid');
  if (grid) {
    grid.innerHTML = COMPONENTS.map((c) => `
              <button class="comp-btn" onclick="addCanvasElement('${c.type}')">
                <i class="fa-solid ${c.icon}" aria-hidden="true"></i> ${esc(c.label)}
              </button>`).join('');
  }
  const bar = document.getElementById('quickbar-grid');
  if (bar) {
    bar.innerHTML = COMPONENTS.map((c) => `
        <button class="quick-tile" type="button" onclick="addCanvasElement('${c.type}')" aria-label="เพิ่ม ${esc(c.label)}">
          <i class="fa-solid ${c.icon}" aria-hidden="true"></i><span>${esc(c.short)}</span>
        </button>`).join('');
  }
}

function addCanvasElement(type) {
  const list = getActiveList();
  const def = COMPONENT_BY_TYPE[type];
  if (!def) return;
  const newEl = Object.assign({ id: newElementId(), type, colSpan: 12 }, def.make());
  list.push(newEl);
  selectedElementId = newEl.id;
  commitAll();
}

function removeElement(id) {
  const list = getActiveList();
  if (list.length <= 1 && !confirm('ลบองค์ประกอบสุดท้ายของฟอร์มนี้ใช่หรือไม่?')) return;
  if (builderTarget === 'login') loginElements = loginElements.filter((el) => el.id !== id);
  else registerElements = registerElements.filter((el) => el.id !== id);
  selectedElementId = null;
  commitAll();
}

// --------------------------------------------------------------------------
// ย้ายตำแหน่งองค์ประกอบในฟอร์ม (สลับลำดับ) — ไม่ต้องลบแล้วสร้างใหม่ให้เสียเวลา
// ลำดับในอาร์เรย์ = ลำดับที่แสดงบนกระดาน และลำดับที่ออกมาในโค้ด HTML
// --------------------------------------------------------------------------
function moveElement(id, dir) {
  const list = getActiveList();
  const from = list.findIndex((el) => el.id === id);
  if (from < 0) return;
  const to = from + dir;
  if (to < 0 || to >= list.length) return;   // อยู่บนสุด/ล่างสุดแล้ว ไม่ต้องทำอะไร
  const [moved] = list.splice(from, 1);
  list.splice(to, 0, moved);
  selectedElementId = moved.id;
  commitAll();
}

// ย้าย id ไปไว้ "ก่อน/หลัง" เป้าหมาย (ใช้ตอนลากการ์ดวางทับ)
function reorderElement(sourceId, targetId, placeBefore) {
  const list = getActiveList();
  const from = list.findIndex((el) => el.id === sourceId);
  if (from < 0 || sourceId === targetId) return;
  if (!list.some((el) => el.id === targetId)) return;
  const [moved] = list.splice(from, 1);
  let to = list.findIndex((el) => el.id === targetId);
  if (!placeBefore) to += 1;
  list.splice(to, 0, moved);
  selectedElementId = moved.id;
  commitAll();
}

function clearDropMarkers() {
  document.querySelectorAll('#builder-canvas .canvas-item.drop-before, #builder-canvas .canvas-item.drop-after')
    .forEach((el) => el.classList.remove('drop-before', 'drop-after'));
}

function selectElement(id) {
  selectedElementId = id;
  renderCanvas();
  renderInspector();
}

function renderCanvas() {
  const canvas = document.getElementById('builder-canvas');
  const list = getActiveList();
  canvas.innerHTML = '';

  if (list.length === 0) {
    canvas.innerHTML = `<div style="grid-column: span 12; text-align: center; color: var(--text-muted); padding: 40px;">
      <i class="fa-solid fa-plus-circle" aria-hidden="true" style="font-size: 32px; margin-bottom: 8px;"></i>
      <p>ยังไม่มีองค์ประกอบในฟอร์ม ${esc(builderTarget)} คลิกเครื่องมือด้านซ้ายเพื่อเพิ่มองค์ประกอบ — หรือกด «โหลดโครงสร้างฟอร์มมาตรฐาน» ถ้าอยากเริ่มจากตัวอย่าง</p>
    </div>`;
    return;
  }

  list.forEach((item, idx) => {
    const isFirst = idx === 0;
    const isLast = idx === list.length - 1;
    const itemCard = document.createElement('div');
    itemCard.className = `canvas-item col-${item.colSpan || 12} ${selectedElementId === item.id ? 'selected' : ''}`;
    itemCard.tabIndex = 0;
    itemCard.dataset.elementId = item.id;
    itemCard.setAttribute('aria-label', `องค์ประกอบ ${item.type} : ${item.label || ''} — ลำดับที่ ${idx + 1} จาก ${list.length}`);
    itemCard.title = 'ลากการ์ดนี้เพื่อสลับตำแหน่งได้เลย';
    itemCard.onclick = (e) => { e.stopPropagation(); selectElement(item.id); };
    itemCard.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectElement(item.id); }
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); removeElement(item.id); }
      // ย้ายตำแหน่งด้วยคีย์บอร์ด: Alt + ลูกศรขึ้น/ลง
      if (e.altKey && e.key === 'ArrowUp') { e.preventDefault(); moveElement(item.id, -1); }
      if (e.altKey && e.key === 'ArrowDown') { e.preventDefault(); moveElement(item.id, 1); }
    };

    // ----- ลากการ์ดเพื่อสลับตำแหน่ง (ทางเลือกเสริมจากปุ่มลูกศร) -----
    itemCard.draggable = true;
    itemCard.addEventListener('dragstart', (e) => {
      dragSourceId = item.id;
      itemCard.classList.add('dragging');
      try { e.dataTransfer.setData('text/plain', item.id); e.dataTransfer.effectAllowed = 'move'; } catch (err) {}
    });
    itemCard.addEventListener('dragend', () => {
      dragSourceId = null;
      itemCard.classList.remove('dragging');
      clearDropMarkers();
    });
    itemCard.addEventListener('dragover', (e) => {
      if (!dragSourceId || dragSourceId === item.id) return;
      e.preventDefault();
      try { e.dataTransfer.dropEffect = 'move'; } catch (err) {}
      const rect = itemCard.getBoundingClientRect();
      const placeBefore = (e.clientY - rect.top) < rect.height / 2;
      clearDropMarkers();
      itemCard.classList.add(placeBefore ? 'drop-before' : 'drop-after');
    });
    itemCard.addEventListener('drop', (e) => {
      if (!dragSourceId || dragSourceId === item.id) return;
      e.preventDefault();
      const rect = itemCard.getBoundingClientRect();
      const placeBefore = (e.clientY - rect.top) < rect.height / 2;
      const sourceId = dragSourceId;
      dragSourceId = null;
      clearDropMarkers();
      reorderElement(sourceId, item.id, placeBefore);
    });

    let contentHTML = '';
    if (item.type === 'heading') {
      contentHTML = `<h3 style="font-size: 16px; font-weight: 700;">${esc(item.label)}</h3><p style="font-size: 12px; color: var(--text-muted);">${esc(item.subtitle || '')}</p>`;
    } else if (['text', 'password', 'email'].includes(item.type)) {
      contentHTML = `<label style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 4px;">${esc(item.label)} ${item.required ? '<span style="color:red">*</span>' : ''}</label>
                     <input type="${item.type}" placeholder="${esc(item.placeholder)}" disabled style="width:100%; padding: 6px; border:1px solid #cbd5e1; border-radius:4px; font-size:12px;">`;
    } else if (item.type === 'checkbox') {
      contentHTML = `<label style="font-size: 12px; display: flex; align-items: center; gap: 6px;"><input type="checkbox" disabled> ${esc(item.label)}</label>`;
    } else if (item.type === 'button') {
      contentHTML = `<button disabled style="width: 100%; padding: 8px; background: var(--accent-primary); color: #fff; border: none; border-radius: 4px; font-size: 12px;">${esc(item.label)}</button>`;
    } else if (item.type === 'divider') {
      contentHTML = `<hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 8px 0;">`;
    }

    itemCard.innerHTML = `
      <div class="item-controls">
        <span class="item-order-hint" aria-hidden="true">ลำดับ ${idx + 1}</span>
        <span class="item-btn-group">
          <button type="button" class="ctrl-btn ctrl-move" data-dir="up"${isFirst ? ' disabled' : ''} title="ย้ายขึ้น (ไปลำดับก่อนหน้า)" aria-label="ย้ายองค์ประกอบนี้ขึ้นหนึ่งลำดับ" onclick="event.stopPropagation(); moveElement('${safeId(item.id)}', -1)"><i class="fa-solid fa-arrow-up" aria-hidden="true"></i></button>
          <button type="button" class="ctrl-btn ctrl-move" data-dir="down"${isLast ? ' disabled' : ''} title="ย้ายลง (ไปลำดับถัดไป)" aria-label="ย้ายองค์ประกอบนี้ลงหนึ่งลำดับ" onclick="event.stopPropagation(); moveElement('${safeId(item.id)}', 1)"><i class="fa-solid fa-arrow-down" aria-hidden="true"></i></button>
          <button type="button" class="ctrl-btn ctrl-delete" title="ลบองค์ประกอบนี้" aria-label="ลบองค์ประกอบนี้" onclick="event.stopPropagation(); removeElement('${safeId(item.id)}')"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
        </span>
      </div>
      ${contentHTML}
    `;
    canvas.appendChild(itemCard);
  });
}

function renderInspector() {
  const inspector = document.getElementById('inspector-properties');
  const list = getActiveList();
  const item = list.find((el) => el.id === selectedElementId);

  if (!item) {
    inspector.innerHTML = `<div class="empty-inspector-state">
      <i class="fa-solid fa-arrow-pointer" aria-hidden="true"></i>
      <p>คลิกเลือกองค์ประกอบในพื้นที่ออกแบบเพื่อปรับแต่งคุณสมบัติ</p>
    </div>`;
    return;
  }

  const id = safeId(item.id);
  inspector.innerHTML = `
    <div class="inspector-field">
      <label for="insp-label">ข้อความป้ายชื่อ / หัวข้อ:</label>
      <input id="insp-label" type="text" value="${esc(item.label || '')}" oninput="updateItemProp('${id}', 'label', this.value)">
    </div>
    ${item.type === 'heading' ? `
      <div class="inspector-field">
        <label for="insp-subtitle">คำอธิบายย่อย (Subtitle):</label>
        <input id="insp-subtitle" type="text" value="${esc(item.subtitle || '')}" oninput="updateItemProp('${id}', 'subtitle', this.value)">
      </div>
    ` : ''}
    ${['text', 'password', 'email'].includes(item.type) ? `
      <div class="inspector-field">
        <label for="insp-placeholder">ข้อความกำกับ (Placeholder):</label>
        <input id="insp-placeholder" type="text" value="${esc(item.placeholder || '')}" oninput="updateItemProp('${id}', 'placeholder', this.value)">
      </div>
      <div class="inspector-field">
        <label for="insp-required"><input id="insp-required" type="checkbox" ${item.required ? 'checked' : ''} onchange="updateItemProp('${id}', 'required', this.checked)"> จำเป็นต้องกรอก (Required)</label>
      </div>
    ` : ''}
    <div class="inspector-field">
      <label for="insp-colspan">ความกว้าง (Column Width):</label>
      <select id="insp-colspan" onchange="updateItemProp('${id}', 'colSpan', parseInt(this.value))">
        <option value="12" ${item.colSpan === 12 ? 'selected' : ''}>เต็มความกว้าง (100%)</option>
        <option value="6" ${item.colSpan === 6 ? 'selected' : ''}>ครึ่งหนึ่ง (50%)</option>
        <option value="4" ${item.colSpan === 4 ? 'selected' : ''}>หนึ่งในสาม (33%)</option>
      </select>
    </div>
    <p class="inspector-hint">แก้ข้อความแล้วหน้าตัวอย่าง/โค้ดด้านล่างจะเปลี่ยนตามทันที — ย้ายลำดับขององค์ประกอบได้โดยกดปุ่มลูกศรขึ้น/ลงบนการ์ด หรือลากการ์ดไปวางในตำแหน่งที่ต้องการ</p>
  `;
}

function updateItemProp(id, prop, val) {
  const list = getActiveList();
  const item = list.find((el) => el.id === id);
  if (item) {
    item[prop] = val;
    commitAll({ keepInspector: true });
  }
}

function clearCanvas() {
  const which = builderTarget === 'login' ? 'Login' : 'Register';
  if (!confirm(`ล้างองค์ประกอบทั้งหมดของฟอร์ม ${which} ใช่หรือไม่? (คืนค่าไม่ได้)`)) return;
  if (builderTarget === 'login') loginElements = [];
  else registerElements = [];
  selectedElementId = null;
  commitAll();
}

function loadDefaultFormStructure() {
  if (!confirm('โหลดโครงสร้างฟอร์มมาตรฐานทับงานปัจจุบันของ "ทั้ง Login และ Register" ใช่หรือไม่? (คืนค่าไม่ได้)')) return;
  loginElements = DEFAULT_LOGIN();
  registerElements = DEFAULT_REGISTER();
  selectedElementId = null;
  commitAll();
  toast('โหลดโครงสร้างฟอร์มมาตรฐานให้ทั้งสองฝั่งแล้ว');
}

function forwardToStep2() {
  switchMainStep(2);
  toast('ส่งโครงสร้างไปขั้นตอนที่ 2 แล้ว — เลือกธีม/สี แล้วดูโค้ดด้านล่างเปลี่ยนตามได้เลย');
}

// เรียกหลังแก้ข้อมูลทุกครั้ง: วาดใหม่ + สร้างโค้ดใหม่ + บันทึก
function commitAll(opts = {}) {
  renderCanvas();
  if (!opts.keepInspector) renderInspector();
  renderStudioPreviewStage();
  regenerateCode();
  saveState();
}

// ==========================================================================
// STEP 2: ตัวสร้าง HTML (ใช้ร่วมกันทั้งหน้าตัวอย่าง / modal / ไฟล์ที่ export)
// ==========================================================================
// สร้าง HTML ของ "การ์ด + ปุ่มสลับ + 2 หน้า" (ไม่รวม <div class="auth-card-wrapper"> ด้านนอก)
//   scope: เติมหน้าชื่อ id เพื่อให้ id ในหน้าโปรแกรมไม่ซ้ำกัน (ไฟล์ที่ export ใช้ '')
//   icons: ใส่ไอคอน FontAwesome หรือไม่ (ไฟล์ที่ export ไม่ใส่ เพื่อให้ใช้ได้แบบออฟไลน์)
function buildAuthMarkup(opts = {}) {
  const scope = opts.scope || '';
  const withIcons = opts.icons !== false;
  const icon = (cls) => (withIcons ? `<i class="fa-solid ${cls}" aria-hidden="true"></i> ` : '');

  const tabs = `
    <div class="auth-switcher-container" role="tablist" aria-label="สลับระหว่างหน้าเข้าสู่ระบบและสมัครสมาชิก">
      <button type="button" class="switcher-tab ${previewView === 'login' ? 'active' : ''}" role="tab" aria-selected="${previewView === 'login'}" data-view="login">
        ${icon('fa-right-to-bracket')}เข้าสู่ระบบ (Login)
      </button>
      <button type="button" class="switcher-tab ${previewView === 'register' ? 'active' : ''}" role="tab" aria-selected="${previewView === 'register'}" data-view="register">
        ${icon('fa-user-plus')}สมัครสมาชิก (Register)
      </button>
    </div>`;

  const pane = (view, list) => `
      <form class="auth-form auth-view-pane ${previewView === view ? 'active' : ''}" role="tabpanel" data-pane="${view}">
        <div class="pane-content">${renderFormFields(list, scope)}</div>
      </form>`;

  return `${tabs}<div class="auth-views-viewport">${pane('login', loginElements)}${pane('register', registerElements)}</div>`;
}

function renderFormFields(list, scope = '') {
  if (!list || list.length === 0) {
    return `<p class="form-subtitle" style="grid-column: span 12;">ยังไม่มีองค์ประกอบในฟอร์มนี้</p>`;
  }
  const fid = (elId) => scope + 'field-' + safeId(elId);

  return list.map((item) => {
    const span = `col-${item.colSpan || 12}`;
    const label = esc(item.label || '');
    const id = fid(item.id);

    if (item.type === 'heading') {
      return `
          <div class="form-row ${span}">
            <h3 class="form-heading">${label}</h3>${item.subtitle ? `\n            <p class="form-subtitle">${esc(item.subtitle)}</p>` : ''}
          </div>`;
    }
    if (['text', 'password', 'email'].includes(item.type)) {
      return `
          <div class="form-row ${span}">
            <label class="form-label" for="${id}">${label}${item.required ? ' <span class="req">*</span>' : ''}</label>
            <input class="form-input" id="${id}" name="${id}" type="${item.type}" placeholder="${esc(item.placeholder || '')}"${item.required ? ' required' : ''}>
          </div>`;
    }
    if (item.type === 'checkbox') {
      return `
          <div class="form-row ${span}">
            <label class="form-check"><input type="checkbox" id="${id}" name="${id}"> ${label}</label>
          </div>`;
    }
    if (item.type === 'button') {
      return `
          <div class="form-row ${span}">
            <button class="form-btn" type="submit">${label}</button>
          </div>`;
    }
    if (item.type === 'divider') {
      return `
          <div class="form-row ${span}">
            <hr class="form-divider">
          </div>`;
    }
    return '';
  }).join('');
}

// ผูกปุ่มสลับหน้าให้ "การ์ดหนึ่งใบ" (ใช้ได้ทั้งหน้าตัวอย่างและ modal โดยไม่ชนกัน)
function bindCard(card) {
  card.addEventListener('click', (e) => {
    const tab = e.target.closest('.switcher-tab');
    if (tab) switchPreviewPane(card, tab.dataset.view);
  });
  // ในหน้าตัวอย่างไม่ให้ฟอร์มส่งข้อมูลจริง (ไม่มีหลังบ้าน) แต่ยังโชว์ผลการตรวจ required
  card.addEventListener('submit', (e) => {
    e.preventDefault();
    toast('ฟอร์มกรอกครบแล้ว ✓ (ตัวอย่างนี้ไม่ส่งข้อมูลจริง — ไฟล์ที่ export จะมีแท็ก <form> และการตรวจ required เหมือนกัน)');
  });
}

function switchPreviewPane(card, view) {
  previewView = view === 'register' ? 'register' : 'login';
  card.querySelectorAll('.switcher-tab').forEach((t) => {
    const on = t.dataset.view === previewView;
    t.classList.toggle('active', on);
    t.setAttribute('aria-selected', on ? 'true' : 'false');
  });
  card.querySelectorAll('.auth-view-pane').forEach((p) => {
    p.classList.toggle('active', p.dataset.pane === previewView);
  });
}

function applyCardVars(card) {
  const c = studioConfig;
  card.className = `auth-card-wrapper style-${c.switcherStyle} fx-${c.transitionFx}`;
  const vars = cardVarMap(studioVars());
  Object.keys(vars).forEach((name) => card.style.setProperty(name, vars[name]));
}

// อัปเดตพื้นหลังของเวทีตัวอย่าง (ไม่สร้างการ์ดใหม่ จะได้ไม่กระพริบ)
// ลำดับ: รูปที่ผู้ใช้ตั้งไว้ → ถ้าไม่มีรูป ใช้ไล่สีที่เลือกไว้ (ไม่ต้องต่อเน็ต)
function stageBackgroundCss() {
  const url = effectiveBgUrl();
  const grad = studioConfig.bgGradient || DEFAULT_CONFIG().bgGradient;
  return url
    ? `${cssUrlValue(url)}, ${grad}`
    : grad;
}

function updateStageBackground() {
  const stageBox = document.getElementById('preview-stage');
  if (!stageBox) return;
  stageBox.style.backgroundImage = stageBackgroundCss();
}

// วาดหน้าตัวอย่างจริง (สร้างการ์ดใหม่ทั้งใบ เพื่อให้ตรงกับสถานะปัจจุบันเสมอ)
function renderStudioPreviewStage() {
  const stage = document.getElementById('preview-stage-root');
  if (!stage) return;

  const card = document.createElement('div');
  card.id = 'preview-card-wrapper';
  card.innerHTML = buildAuthMarkup({ scope: 'stage-' });
  applyCardVars(card);
  bindCard(card);

  stage.innerHTML = '';
  stage.appendChild(card);
  updateStageBackground();
}

// อ่านค่าจากตัวควบคุมทั้งหมด → เก็บใน studioConfig → อัปเดตตัวอย่างทันที
function updateStudioStyles() {
  const val = (id, fallback) => {
    const el = document.getElementById(id);
    return el ? el.value : fallback;
  };
  studioConfig.accentColor = val('color-accent', studioConfig.accentColor);
  studioConfig.cardBgColor = val('color-card-bg', studioConfig.cardBgColor);
  studioConfig.textColor = val('color-text', studioConfig.textColor);
  studioConfig.borderColor = val('color-border', studioConfig.borderColor);
  // หมายเหตุ: ช่อง "URL รูปภาพพื้นหลัง" ไม่อ่านที่นี่ — ต้องตรวจก่อนว่าโหลดรูปได้จริง
  // (ดู onBgUrlChanged / handleBgFileInput) รูปที่ฝังจากเครื่องจึงไม่ถูกทับด้วยข้อความในช่อง
  studioConfig.cardOpacity = Number(val('slider-card-opacity', studioConfig.cardOpacity));
  studioConfig.cardBlur = Number(val('slider-card-blur', studioConfig.cardBlur));
  studioConfig.cardRadius = Number(val('slider-card-radius', studioConfig.cardRadius));
  studioConfig.switcherStyle = val('switcher-style-select', studioConfig.switcherStyle);
  studioConfig.transitionFx = val('transition-fx-select', studioConfig.transitionFx);
  studioConfig.fontFamily = fontStack(val('font-family-select', fontChoice(studioConfig.fontFamily)));
  pageTitle = val('page-title-input', pageTitle) || pageTitle;

  document.getElementById('val-card-opacity').innerText = studioConfig.cardOpacity + '%';
  document.getElementById('val-card-blur').innerText = studioConfig.cardBlur + 'px';
  document.getElementById('val-card-radius').innerText = studioConfig.cardRadius + 'px';
  updateContrastNote();   // เตือนถ้าสีที่เลือกอ่านยาก (a11y)

  // ใส่ค่าให้การ์ดทุกใบที่เปิดอยู่ (หน้าตัวอย่าง + modal ถ้าเปิด)
  document.querySelectorAll('.auth-card-wrapper').forEach(applyCardVars);
  updateStageBackground();
  syncGradientActive();
  regenerateCode();
  saveState();
  // ถ้ามีสีที่ยังไม่กด "ตกลง" ค้างอยู่ แล้วผู้ใช้ไปแก้อย่างอื่น (ธีม/สไลเดอร์/สลับหน้า) = ถือว่ายืนยันสีนั้นไปด้วย
  if (pendingColors) clearPendingColors();
}

// ==========================================================================
// ยืนยัน/ยกเลิกการเปลี่ยนสี (รอบที่ 16 ตามคำขอผู้ใช้: พาเลชต้องมีปุ่ม ตกลง / ยกเลิก)
// หลักการ: เลือกสี → เห็นผลทันทีในตัวอย่าง + คำเตือนคอนทราสต์ แต่ยังไม่เข้าโค้ด/ไม่บันทึก
//          กด "ตกลง" = สร้างโค้ดใหม่ + บันทึกอัตโนมัติ · กด "ยกเลิก" = คืนค่าสีที่ใช้อยู่ก่อนเริ่มแก้
// ==========================================================================
const COLOR_FIELDS = [
  { id: 'color-accent', key: 'accentColor', label: 'สีเน้นหลัก' },
  { id: 'color-card-bg', key: 'cardBgColor', label: 'พื้นหลังการ์ด' },
  { id: 'color-text', key: 'textColor', label: 'สีข้อความ' },
  { id: 'color-border', key: 'borderColor', label: 'เส้นขอบอินพุต' },
];
let pendingColors = null;   // สำเนา studioConfig ตอน "เริ่มแก้สี" ครั้งแรก (ใช้ตอนกดยกเลิก)

function readColorInputs() {
  COLOR_FIELDS.forEach((f) => {
    const el = document.getElementById(f.id);
    if (el) studioConfig[f.key] = el.value;
  });
}

function onColorInput() {
  if (!pendingColors) pendingColors = Object.assign({}, studioConfig);   // ค่าที่ใช้อยู่จริงก่อนเริ่มแก้
  readColorInputs();
  // วาดผลให้เห็นทันที (ตัวอย่าง + modal + คำเตือนคอนทราสต์) แต่ยังไม่สร้างโค้ด/ไม่บันทึก
  document.querySelectorAll('.auth-card-wrapper').forEach(applyCardVars);
  updateStageBackground();
  updateContrastNote();
  showColorConfirmBar();
}

function showColorConfirmBar() {
  const bar = document.getElementById('picker-confirm-bar');
  const note = document.getElementById('picker-confirm-note');
  if (!bar) return;
  const changed = COLOR_FIELDS.filter((f) => studioConfig[f.key] !== pendingColors[f.key])
    .map((f) => `${f.label} ${pendingColors[f.key]} → ${studioConfig[f.key]}`);
  if (note) {
    note.textContent = changed.length
      ? `ยังไม่บันทึก — ${changed.join(' · ')}`
      : 'ยังไม่บันทึก — เลือกสีใหม่แล้วกด "ตกลง" เพื่อใช้ หรือ "ยกเลิก" เพื่อคืนค่าเดิม';
  }
  bar.hidden = false;
}

function clearPendingColors() {
  pendingColors = null;
  const bar = document.getElementById('picker-confirm-bar');
  if (bar) bar.hidden = true;
}

// กด "ตกลง": สีถูกใช้ในตัวอย่างอยู่แล้ว → สร้างโค้ดใหม่ + บันทึก แล้วปิดแถบ
function commitPendingColors() {
  if (!pendingColors) return;
  pendingColors = null;
  updateStudioStyles();
  clearPendingColors();
  toast('ใช้สีใหม่แล้ว (โค้ดด้านล่างอัปเดตตามเรียบร้อย)');
}

// กด "ยกเลิก": คืนค่าสีทั้งหมดกลับเป็นชุดก่อนเริ่มแก้
function cancelPendingColors() {
  if (!pendingColors) return;
  Object.assign(studioConfig, pendingColors);
  pendingColors = null;
  applyConfigToControls();
  updateStudioStyles();
  clearPendingColors();
  toast('คืนค่าสีก่อนหน้าแล้ว');
}

// เขียนค่าลงตัวควบคุมทั้งหมด (ใช้ตอนโหลดงานที่บันทึกไว้ / กดธีม / รีเซ็ต)
function applyConfigToControls() {
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
  set('color-accent', studioConfig.accentColor);
  set('color-card-bg', studioConfig.cardBgColor);
  set('color-text', studioConfig.textColor);
  set('color-border', studioConfig.borderColor);
  // ช่อง URL แสดงเฉพาะที่อยู่แบบ http(s) — รูปที่ฝังจากเครื่องจะแสดงเป็นรูปย่อด้านล่างแทน
  set('bg-image-url', /^data:/i.test(studioConfig.bgImageUrl) ? '' : studioConfig.bgImageUrl);
  set('slider-card-opacity', studioConfig.cardOpacity);
  set('slider-card-blur', studioConfig.cardBlur);
  set('slider-card-radius', studioConfig.cardRadius);
  set('switcher-style-select', studioConfig.switcherStyle);
  set('transition-fx-select', studioConfig.transitionFx);
  set('font-family-select', fontChoice(studioConfig.fontFamily));
  set('page-title-input', pageTitle);
  document.getElementById('val-card-opacity').innerText = studioConfig.cardOpacity + '%';
  document.getElementById('val-card-blur').innerText = studioConfig.cardBlur + 'px';
  document.getElementById('val-card-radius').innerText = studioConfig.cardRadius + 'px';
  syncThemeActive(studioConfig.themePreset, null);
  syncGradientActive();
  syncBgUi();
}

// ตัวเลือกฟอนต์เก็บเป็นชื่อสั้น ๆ (Prompt / Inter / Sarabun / Kanit / system)
function fontStack(choice) {
  if (!choice || choice === 'system') return `-apple-system, 'Segoe UI', 'Noto Sans Thai', sans-serif`;
  return `'${choice}', -apple-system, 'Segoe UI', 'Noto Sans Thai', sans-serif`;
}
function fontChoice(stack) {
  const m = /'([A-Za-z]+)'/.exec(String(stack || ''));
  return m ? m[1] : 'system';
}

// ==========================================================================
// ชุดธีมสำเร็จรูป (10 ชุด) — แต่ละชุดตั้งค่าครบทุกมิติ ไม่ใช่แค่สี
//   สี (accent/cardBg/text/border/edge) • ความมน (radius) • เบลอ/โปร่งแสง (blur/opacity)
//   ฟอนต์ (font) • พื้นหลัง (gradient — CSS ล้วน ไม่มี URL ภายนอก) • เงา (shadow)
//   รูปแบบปุ่มสลับ (switcherStyle) • เอฟเฟกต์สลับหน้า (transitionFx)
// ==========================================================================
const THEME_PRESETS = {
  corporate: {
    label: 'Corporate Slate', hint: 'ทางการ เรียบ เทา-น้ำเงิน',
    accent: '#2563eb', cardBg: '#ffffff', text: '#0f172a', border: '#cbd5e1',
    edge: 'rgba(255,255,255,.5)', shadow: '0 20px 25px -5px rgba(15,23,42,.3)',
    inputBg: '#ffffff', muted: '#64748b', switcherBg: 'rgba(15,23,42,.06)',
    radius: 16, blur: 16, opacity: 95, font: 'Prompt', switcherStyle: 'tabs', transitionFx: 'slide',
    gradient: 'linear-gradient(135deg, #1d4ed8, #0f172a)'
  },
  minimal: {
    label: 'Minimal Clean', hint: 'ขาวสะอาด มนน้อย ไม่เบลอ',
    accent: '#18181b', cardBg: '#ffffff', text: '#09090b', border: '#e4e4e7',
    edge: 'rgba(9,9,11,.12)', shadow: '0 2px 10px rgba(9,9,11,.08)',
    inputBg: '#fafafa', muted: '#71717a', switcherBg: 'transparent',
    radius: 4, blur: 0, opacity: 100, font: 'system', switcherStyle: 'minimal', transitionFx: 'fade',
    gradient: 'linear-gradient(135deg, #f4f4f5, #d4d4d8)'
  },
  resort: {
    label: 'Resort Sky', hint: 'ฟ้าทะเล การ์ดมนมาก โปร่งแสง',
    accent: '#0284c7', cardBg: '#ffffff', text: '#0c4a6e', border: '#7dd3fc',
    edge: 'rgba(255,255,255,.65)', shadow: '0 24px 40px -12px rgba(2,132,199,.45)',
    inputBg: '#f0f9ff', muted: '#0369a1', switcherBg: 'rgba(2,132,199,.1)',
    radius: 26, blur: 18, opacity: 88, font: 'Prompt', switcherStyle: 'pill', transitionFx: 'slide',
    gradient: 'linear-gradient(160deg, #38bdf8, #0369a1 60%, #082f49)'
  },
  tech: {
    label: 'Tech Indigo', hint: 'ครามนีออน ฟอนต์ Inter พลิกการ์ด',
    accent: '#4f46e5', cardBg: '#ffffff', text: '#1e1b4b', border: '#c7d2fe',
    edge: 'rgba(199,210,254,.55)', shadow: '0 26px 44px -14px rgba(79,70,229,.5)',
    inputBg: '#f5f3ff', muted: '#6366f1', switcherBg: 'rgba(79,70,229,.12)',
    radius: 12, blur: 22, opacity: 88, font: 'Inter', switcherStyle: 'sliding', transitionFx: 'flip',
    gradient: 'linear-gradient(135deg, #312e81, #0f172a)'
  },
  pastel: {
    label: 'Soft Pastel', hint: 'พาสเทลชมพู นุ่ม ปุ่มแคปซูล',
    accent: '#ec4899', cardBg: '#fff5f9', text: '#831843', border: '#fbcfe8',
    edge: 'rgba(236,72,153,.25)', shadow: '0 18px 30px -12px rgba(236,72,153,.4)',
    inputBg: '#ffffff', muted: '#a21caf', switcherBg: 'rgba(236,72,153,.1)',
    radius: 20, blur: 10, opacity: 96, font: 'Prompt', switcherStyle: 'pill', transitionFx: 'bounce',
    gradient: 'linear-gradient(135deg, #fda4af, #fbcfe8 45%, #c7d2fe)'
  },
  slate: {
    label: 'Deep Slate', hint: 'เทาเข้มจริงจัง แท็บมินิมอล จางนุ่ม',
    accent: '#0f172a', cardBg: '#f8fafc', text: '#0f172a', border: '#94a3b8',
    edge: 'rgba(15,23,42,.22)', shadow: '0 14px 28px -14px rgba(2,6,23,.6)',
    inputBg: '#ffffff', muted: '#475569', switcherBg: 'rgba(15,23,42,.08)',
    radius: 8, blur: 8, opacity: 98, font: 'Inter', switcherStyle: 'minimal', transitionFx: 'fade',
    gradient: 'linear-gradient(135deg, #334155, #020617)'
  },
  retro: {
    label: 'Warm Cream', hint: 'ครีมอุ่น ฟอนต์ Kanit คมเหลี่ยม',
    accent: '#d97706', cardBg: '#fffbeb', text: '#78350f', border: '#d6b98c',
    edge: 'rgba(120,53,15,.35)', shadow: '8px 8px 0 rgba(120,53,15,.18)',
    inputBg: '#fffdf5', muted: '#92400e', switcherBg: 'rgba(217,119,6,.14)',
    radius: 4, blur: 0, opacity: 100, font: 'Kanit', switcherStyle: 'tabs', transitionFx: 'slide',
    gradient: 'linear-gradient(135deg, #fef3c7, #f59e0b 55%, #b45309)'
  },
  eco: {
    label: 'Eco Emerald', hint: 'เขียวธรรมชาติ Sarabun ค่อยจาง',
    accent: '#059669', cardBg: '#ffffff', text: '#064e3b', border: '#6ee7b7',
    edge: 'rgba(5,150,105,.25)', shadow: '0 18px 32px -14px rgba(5,150,105,.45)',
    inputBg: '#f0fdf4', muted: '#047857', switcherBg: 'rgba(5,150,105,.1)',
    radius: 14, blur: 6, opacity: 97, font: 'Sarabun', switcherStyle: 'pill', transitionFx: 'fade',
    gradient: 'linear-gradient(135deg, #34d399, #059669 55%, #064e3b)'
  },
  glassdark: {
    label: 'Dark Glass', hint: 'การ์ดเข้ม เบลอจัด เงาลึก',
    accent: '#38bdf8', cardBg: '#0b1220', text: '#e2e8f0', border: 'rgba(148,163,184,.45)',
    edge: 'rgba(255,255,255,.18)', shadow: '0 30px 60px -20px rgba(0,0,0,.75)',
    inputBg: 'rgba(15,23,42,.55)', muted: '#94a3b8', switcherBg: 'rgba(255,255,255,.09)',
    radius: 22, blur: 28, opacity: 45, font: 'Prompt', switcherStyle: 'pill', transitionFx: 'zoom',
    gradient: 'linear-gradient(135deg, #0f172a, #1e293b 50%, #020617)'
  },
  sunset: {
    label: 'Sunset Glow', hint: 'ส้มตะวันตกดิน Kanit เงานุ่ม',
    accent: '#f97316', cardBg: '#fff7ed', text: '#7c2d12', border: '#fdba74',
    edge: 'rgba(249,115,22,.3)', shadow: '0 26px 50px -18px rgba(249,115,22,.55)',
    inputBg: '#ffffff', muted: '#c2410c', switcherBg: 'rgba(249,115,22,.12)',
    radius: 28, blur: 12, opacity: 94, font: 'Kanit', switcherStyle: 'sliding', transitionFx: 'zoom',
    gradient: 'linear-gradient(135deg, #fb7185, #f97316 50%, #7c2d12)'
  }
};
const THEME_KEYS = Object.keys(THEME_PRESETS);

function syncThemeActive(key, ev) {
  let clicked = (ev && ev.currentTarget) || null;
  if (!clicked && ev && ev.target && ev.target.closest) clicked = ev.target.closest('.theme-preset-card');
  document.querySelectorAll('.theme-preset-card').forEach((card) => {
    const on = card.dataset.theme === key;
    card.classList.toggle('active', on);
    card.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
}

// ปุ่มธีม + "ตัวอย่างย่อ" (swatch) ที่ใช้ CSS Variables ชุดเดียวกับการ์ดจริง
// → เห็นหน้าตาก่อนกด และสีในตัวอย่างย่อไม่มีทางหลุดจากธีมจริง
function renderThemePresets() {
  const grid = document.getElementById('theme-presets-grid');
  if (!grid) return;
  grid.innerHTML = THEME_KEYS.map((key) => {
    const p = THEME_PRESETS[key];
    const vars = cardVarMap(presetVars(p));
    const varsText = Object.keys(vars).map((k) => `${k}:${vars[k]}`).join(';');
    return `
      <button type="button" class="theme-preset-card" data-theme="${key}" aria-pressed="${studioConfig.themePreset === key}"
              onclick="applyThemePreset('${key}', event)" title="ใช้ธีม ${esc(p.label)}">
        <span class="theme-swatch" style="${esc(varsText)};background-image:${p.gradient}" aria-hidden="true">
          <span class="mini-card">
            <span class="mini-aa">Aa</span>
            <span class="mini-line"></span>
            <span class="mini-btn"></span>
          </span>
        </span>
        <span class="theme-name">${esc(p.label)}</span>
        <span class="theme-hint">${esc(p.hint)}</span>
      </button>`;
  }).join('');
}

function applyThemePreset(presetKey, ev) {
  const p = THEME_PRESETS[presetKey];
  if (!p) return;
  studioConfig.themePreset = presetKey;

  studioConfig.accentColor = p.accent;
  studioConfig.cardBgColor = p.cardBg;
  studioConfig.textColor = p.text;
  studioConfig.borderColor = p.border;
  studioConfig.cardEdge = p.edge;
  studioConfig.cardShadow = p.shadow;
  studioConfig.inputBgColor = p.inputBg;
  studioConfig.mutedColor = p.muted;
  studioConfig.switcherBg = p.switcherBg;
  studioConfig.cardRadius = p.radius;
  studioConfig.cardBlur = p.blur;
  studioConfig.cardOpacity = p.opacity;
  studioConfig.fontFamily = fontStack(p.font);
  studioConfig.switcherStyle = p.switcherStyle;
  studioConfig.transitionFx = p.transitionFx;
  // พื้นหลังเป็นไล่สีในตัวธีม (ไม่ใช่ URL ภายนอก) → ไฟล์ที่ export ยังออฟไลน์ได้
  // ถ้าผู้ใช้ใส่รูปพื้นหลังไว้ รูปจะยังอยู่ (ไม่ลบงานที่ทำไว้)
  studioConfig.bgGradient = p.gradient;

  syncThemeActive(presetKey, ev);
  applyConfigToControls();   // สไลเดอร์/ดรอปดาวน์/สี ขยับตามธีม
  updateStudioStyles();      // ตัวอย่าง + modal + โค้ดที่ export + autosave
  toast(`ใช้ธีม ${p.label} แล้ว — สี ฟอนต์ ความมน ความเบลอ พื้นหลัง และอนิเมชันเปลี่ยนพร้อมกันทั้งหน้าตัวอย่างและโค้ดที่ export`);
}

// ==========================================================================
// พื้นหลัง: รูปจากเครื่อง (ฝังเป็น data URL) / URL / ไล่สีสำเร็จรูป
// หลักที่ยึดไว้: "ไฟล์ที่ export ต้องออฟไลน์ได้" → รูปที่เลือกจากเครื่องถูกฝังลงในไฟล์เลย
// และพื้นหลังสำเร็จรูปเป็น CSS gradient ล้วน (ไม่มีลิงก์ภายนอก)
// ==========================================================================
const BG_MAX_BYTES = 1.5 * 1024 * 1024;   // ใหญ่กว่านี้ → ย่ออัตโนมัติ
const BG_MAX_WIDTH = 1600;                // จำกัดความกว้างของรูปที่ฝัง

function setBgStatus(text, kind, linkUrl) {
  const box = document.getElementById('bg-status');
  if (!box) return;
  box.className = 'bg-status' + (kind ? ' is-' + kind : '');
  box.textContent = text || '';
  // ให้ผู้ใช้กดตรวจสอบลิงก์เองได้ว่าเป็น "ที่อยู่ของรูป" จริงหรือเป็นหน้าเว็บ
  if (linkUrl && /^https?:\/\//i.test(linkUrl)) {
    const a = document.createElement('a');
    a.className = 'bg-status-link';
    a.href = linkUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = 'เปิดลิงก์นี้ในแท็บใหม่เพื่อดูว่าเป็นที่อยู่ของรูปจริงหรือไม่';
    box.appendChild(document.createTextNode(' '));
    box.appendChild(a);
  }
}

function renderGradientPresets() {
  const box = document.getElementById('gradient-presets');
  if (!box) return;
  box.innerHTML = BG_GRADIENTS.map((g) => `
        <button type="button" class="grad-chip" data-grad="${g.key}" style="background-image:${g.css}" onclick="applyGradientPreset('${g.key}', event)">
          <span>${esc(g.label)}</span>
        </button>`).join('');
}

function syncGradientActive() {
  document.querySelectorAll('.grad-chip').forEach((chip) => {
    const g = BG_GRADIENTS.find((x) => x.key === chip.dataset.grad);
    const on = !!g && g.css === studioConfig.bgGradient;
    chip.classList.toggle('active', on);
    chip.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
}

// อัปเดตรูปย่อ + ข้อความยืนยันว่ากำลังใช้รูปอะไรอยู่ (ทำให้ผู้ใช้เห็นว่า "ติดจริง")
function syncBgUi() {
  const row = document.getElementById('bg-thumb-row');
  const img = document.getElementById('bg-thumb');
  const info = document.getElementById('bg-thumb-info');
  const clearBtn = document.getElementById('bg-image-clear');
  const url = effectiveBgUrl();
  const fromFile = !!safeUrl(studioConfig.bgImageData);

  if (clearBtn) clearBtn.disabled = !url;
  if (row) row.hidden = !url;
  if (img) {
    if (url) img.src = url;
    else img.src = BLANK_PX;   // พิกเซลโปร่งใส 1×1 — ไม่ทิ้ง <img> ที่ไม่มี src (รูปย่อถูกซ่อนด้วยแถวเมื่อไม่มีรูป)

  }
  if (info) {
    const kb = url ? fmtSize(Math.round(url.length * 0.75)) : '';   // ประมาณขนาดไฟล์จริงจาก base64
    info.textContent = url
      ? (fromFile ? `ใช้รูปที่ฝังจากเครื่องอยู่ (${kb} • ฝังในไฟล์ → ออฟไลน์ใช้ได้)` : `ใช้รูปจาก URL อยู่ (ไม่ฝังในไฟล์ — ถ้าไม่มีเน็ตจะไม่ขึ้น)`)
      : 'ยังไม่มีรูป — ใช้พื้นหลังไล่สีด้านล่างแทน';
  }
  syncGradientActive();
  syncUrlFieldClear();   // รอบที่ 17: ให้ปุ่มล้างในช่องตรงกับค่าจริง (พิมพ์/ฝังรูป/โหลดงานเก่า)
}

// เลือกไฟล์จากเครื่อง (ปุ่ม + ลากมาวาง)
function pickBgFile() {
  const input = document.getElementById('bg-image-file');
  if (input) input.click();
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(new Error('read-error'));
    fr.readAsDataURL(file);
  });
}

// อ่านขนาดรูปจริง (px) จาก data URL
function imgNaturalSize(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}

// ย่อรูปก่อนฝัง (วาดลง canvas) → ไฟล์ที่ได้เล็กลง โค้ดไม่บวม
function downscaleImage(dataUrl, maxWidth, quality) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(1, maxWidth / img.naturalWidth);
        const w = Math.max(1, Math.round(img.naturalWidth * scale));
        const h = Math.max(1, Math.round(img.naturalHeight * scale));
        const cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        cv.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(cv.toDataURL('image/jpeg', quality));
      } catch (e) { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}

async function handleBgFileInput(files, opts) {
  const options = opts || {};
  const file = files && files[0];
  if (!file) return;
  if (!/^image\//.test(file.type || '')) {
    setBgStatus('ไฟล์นี้ไม่ใช่รูปภาพ — เลือกไฟล์ .png .jpg .jpeg .gif .webp หรือ .svg', 'warn');
    return;
  }
  setBgStatus(`กำลังอ่านไฟล์ ${file.name} ...`, 'info');
  try {
    const raw = await readFileAsDataURL(file);
    const size = await imgNaturalSize(raw);
    const isSvg = /^data:image\/svg/i.test(raw);

    // ไฟล์ที่เบราว์เซอร์ถอดรหัสเป็นรูปไม่ได้ (ไฟล์เสีย/เปลี่ยนนามสกุลมา) → ไม่ฝัง เพื่อไม่ให้ได้รูปพัง
    if (!isSvg && !size) {
      setBgStatus(`เปิดรูปจากไฟล์ ${file.name} ไม่ได้ — ไฟล์อาจเสียหรือไม่ใช่รูปจริง ลองบันทึกใหม่เป็น .jpg/.png แล้วเลือกอีกครั้ง`, 'warn');
      return;
    }

    let dataUrl = raw;
    let resized = false;

    if (!isSvg && (file.size > BG_MAX_BYTES || (size && size.w > BG_MAX_WIDTH))) {
      const out = await downscaleImage(raw, BG_MAX_WIDTH, 0.8);
      if (out) { dataUrl = out; resized = true; }
    }

    studioConfig.bgImageData = dataUrl;
    studioConfig.bgImageUrl = '';                                  // รูปจากเครื่องทับ URL เดิม
    const urlBox = document.getElementById('bg-image-url');
    if (urlBox) urlBox.value = '';
    syncBgUi();
    updateStudioStyles();

    const before = fmtSize(file.size);
    const after = fmtSize(Math.round(dataUrl.length * 0.75));
    const addedCode = fmtSize(dataUrl.length);
    setBgStatus(
      `ฝังรูปแล้ว: ${file.name}${options.fromUrl ? ` (ดึงจากลิงก์ ${options.fromUrl.slice(0, 60)})` : ''} — ${before}${resized ? ` → ย่อเหลือ ${after} (จำกัดความกว้าง ${BG_MAX_WIDTH}px, JPEG คุณภาพ 80%)` : ' (ขนาดเดิม)'}` +
      ` • โค้ดที่ export จะใหญ่ขึ้นประมาณ ${addedCode} แต่เปิดใช้ได้แบบออฟไลน์ ไม่ต้องพึ่งลิงก์ภายนอก`,
      'ok'
    );
    toast(resized ? `ฝังรูปแล้ว (ย่อจาก ${before} เหลือ ${after})` : 'ฝังรูปพื้นหลังแล้ว — ใช้ได้แม้ไม่มีเน็ต');
  } catch (e) {
    setBgStatus('อ่านไฟล์นี้ไม่ได้ — ลองบันทึกรูปใหม่เป็น .jpg/.png แล้วเลือกอีกครั้ง', 'warn');
  }
}

// URL ที่พิมพ์/วาง: ต้องทำความสะอาดลิงก์ก่อน แล้ว "ลองโหลดจริง" (Image onload/onerror)
// ไม่ปล่อยให้เงียบ — และไม่ดัดแปลง URL หลังตรวจแล้ว (URL ที่ตรวจ = URL ที่ใช้จริง)
// ปุ่มล้างในช่อง URL (รอบที่ 17): โผล่เฉพาะเมื่อมีข้อความ · กดแล้วล้างช่องและเข้าทางเดิม (ว่าง = กลับไปใช้พื้นหลังไล่สี)
function syncUrlFieldClear() {
  const input = document.getElementById('bg-image-url');
  const btn = document.getElementById('bg-url-clear');
  if (input && btn) btn.hidden = input.value.trim().length === 0;
}

function clearBgUrlField() {
  const input = document.getElementById('bg-image-url');
  if (!input) return;
  input.value = '';
  syncUrlFieldClear();
  scheduleBgUrlCheck(0);   // ตรวจทันที (ยกเลิก timer ของการพิมพ์ก่อนหน้า)
  input.focus();
}

let bgUrlTimer = null;
let bgUrlCheckToken = 0;

function scheduleBgUrlCheck(delay) {
  clearTimeout(bgUrlTimer);
  bgUrlTimer = setTimeout(() => onBgUrlChanged(), delay === undefined ? 700 : delay);
}

function applyBgUrlOk(url, probe) {
  studioConfig.bgImageUrl = url;
  studioConfig.bgImageData = '';   // URL ใหม่ทับรูปที่ฝังไว้
  syncBgUi();
  updateStudioStyles();
  setBgStatus(`ตรวจสอบแล้ว: รูปเปิดได้จริง (${probe ? probe.naturalWidth + '×' + probe.naturalHeight + ' px' : 'โหลดช้าแต่ตอบกลับแล้ว'}) — ใช้เป็นพื้นหลังแล้ว · ไฟล์นี้ต้องต่อเน็ตถึงจะเห็นรูป (ถ้าอยากให้ออฟไลน์ได้ ให้ใช้ปุ่ม "เลือกรูปจากเครื่อง")`, 'ok');
}

// ดึงรูปจาก URL มาฝังในไฟล์ให้ (ใช้ได้เมื่อโฮสต์อนุญาต CORS) → เปลี่ยน "ลิงก์ที่ใช้ไม่ได้" ให้กลายเป็นรูปที่ออฟไลน์ได้
async function tryEmbedFromUrl(url) {
  if (!/^https?:\/\//i.test(url) || typeof fetch !== 'function') return false;
  try {
    const ctl = new AbortController();
    const to = setTimeout(() => ctl.abort(), 12000);
    const res = await fetch(url, { mode: 'cors', credentials: 'omit', signal: ctl.signal });
    clearTimeout(to);
    if (!res.ok) return false;
    const ct = (res.headers.get('content-type') || '').split(';')[0].trim();
    if (!/^image\//i.test(ct)) return false;
    const blob = await res.blob();
    if (!blob.size || blob.size > 12 * 1024 * 1024) return false;   // ใหญ่เกิน 12 MB ไม่รับ
    const ext = (ct.split('/')[1] || 'png').replace(/[^a-z0-9]/gi, '');
    await handleBgFileInput([new File([blob], 'from-url.' + ext, { type: ct })], { fromUrl: url });
    return !!studioConfig.bgImageData;
  } catch (e) { return false; }
}

async function applyBgUrlFailed(url, timedOut) {
  const box = document.getElementById('bg-image-url');
  setBgStatus('โหลดเป็นรูปโดยตรงไม่ได้ — กำลังลองดึงรูปมาฝังไว้ในไฟล์ให้ (ใช้ได้แม้ไม่มีเน็ต)...', 'info');

  // ทางออกที่ได้ผลจริง: ดึงรูปมาฝังเป็น data URL ให้เลย
  const embedded = await tryEmbedFromUrl(url);
  if (embedded) {
    const info = document.getElementById('bg-status');
    if (info) {
      info.textContent += ` · ดึงรูปจากลิงก์ให้อัตโนมัติแล้ว (${fmtSize(Math.round(studioConfig.bgImageData.length * 0.75))}) และฝังไว้ในไฟล์ — ต่อไปเปิดแบบออฟไลน์ก็เห็นรูป`;
      info.className = 'bg-status is-ok';
    }
    toast('ดึงรูปจากลิงก์มาฝังในไฟล์ให้แล้ว — เปิดใช้ได้แม้ไม่มีเน็ต');
    return;
  }

  if (box) box.value = studioConfig.bgImageUrl;   // คืนค่าที่ใช้ได้จริงกลับไป
  const offline = !navigator.onLine;
  const reason = timedOut
    ? 'ตรวจสอบไม่เสร็จใน 10 วินาที (เน็ตช้าหรือโฮสต์ตอบช้า)'
    : (offline
      ? 'เครื่องนี้กำลังออฟไลน์อยู่ — รูปจาก URL ต้องต่ออินเทอร์เน็ต'
      : 'ลิงก์อาจเป็น "หน้าเว็บที่มีรูปอยู่" ไม่ใช่ที่อยู่ของไฟล์รูปโดยตรง, ลิงก์หมดอายุ, หรือโฮสต์ไม่อนุญาตให้เว็บอื่นดึงรูปไปใช้');
  setBgStatus(
    `โหลดรูปจากที่อยู่นี้ไม่ได้ — ${reason} (ลองดึงมาฝังให้แล้วแต่โฮสต์ไม่อนุญาต) · ยังใช้พื้นหลังเดิมอยู่ · ทางที่ชัวร์ที่สุด: กด "เลือกรูปจากเครื่อง" หรือลากรูปมาวาง แล้วรูปจะถูกฝังไว้ในไฟล์เลย (ใช้ออฟไลน์ได้)`,
    'warn',
    url
  );
}

function onBgUrlChanged() {
  const box = document.getElementById('bg-image-url');
  if (!box) return;
  const typed = box.value;
  const url = normalizeImageUrl(typed);
  if (url !== typed) box.value = url;   // ให้เห็นค่าที่ใช้จริง (ตัดอักขระปนจากการคัดลอกออกแล้ว)

  // 1) เว้นว่าง = ใช้พื้นหลังไล่สี (พฤติกรรมเดิม)
  if (!url) {
    bgUrlCheckToken++;   // รอบที่ 17: ยกเลิกผลตรวจของ URL ที่เพิ่งล้างไป (ไม่งั้นคำเตือนของ URL เก่าโผล่ทีหลัง = หลอกผู้ใช้)
    studioConfig.bgImageUrl = '';
    syncBgUi();
    updateStudioStyles();
    setBgStatus(studioConfig.bgImageData ? 'ลบที่อยู่ในช่องแล้ว — ยังใช้รูปที่ฝังจากเครื่องอยู่' : 'เว้นว่าง = ใช้พื้นหลังไล่สี (ไม่ต้องต่อเน็ต)', 'info');
    return;
  }

  // 2) คำแนะนำตรงจุด สำหรับสิ่งที่ "หน้าตาไม่ใช่ URL รูป" แต่ผู้ใช้อาจเข้าใจผิด
  if (/^data:/i.test(url) && !/^data:image\//i.test(url)) {
    setBgStatus('ค่านี้เป็น data: URL ที่ไม่ใช่รูปภาพ — ต้องขึ้นต้นด้วย data:image/... (หรือใช้ปุ่ม "เลือกรูปจากเครื่อง" จะง่ายกว่า)', 'warn');
    box.value = studioConfig.bgImageUrl;
    return;
  }
  if (/^[A-Za-z0-9+/=\s]{200,}$/.test(url)) {
    setBgStatus('ค่านี้ดูเหมือนข้อมูล base64 ดิบที่ขาดหัวกำกับ — ให้ใช้ปุ่ม "เลือกรูปจากเครื่อง" หรือลากไฟล์รูปมาวางในช่องนี้ จะฝังรูปให้เอง', 'warn');
    box.value = studioConfig.bgImageUrl;
    return;
  }
  if (/^(\/|[A-Za-z]:\\|~\/)/.test(url)) {
    setBgStatus('ที่อยู่นี้เป็น "ไฟล์ในเครื่อง" (path) เบราว์เซอร์เปิดให้เว็บใช้ไม่ได้ — ให้ใช้ปุ่ม "เลือกรูปจากเครื่อง" หรือลากไฟล์รูปมาวาง รูปจะถูกฝังในไฟล์ (ออฟไลน์ใช้ได้)', 'warn');
    box.value = studioConfig.bgImageUrl;
    return;
  }
  if (!/^(https?:\/\/|data:image\/)/i.test(url)) {
    setBgStatus('ที่อยู่นี้ใช้ไม่ได้ — ต้องขึ้นต้นด้วย http:// หรือ https:// เท่านั้น (หรือใช้ปุ่ม "เลือกรูปจากเครื่อง" เพื่อฝังรูปไว้ในไฟล์)', 'warn');
    box.value = studioConfig.bgImageUrl;
    return;
  }

  // 3) ตรวจว่าโหลดได้จริง (Image onload/onerror)
  const token = ++bgUrlCheckToken;
  setBgStatus('กำลังตรวจสอบว่ารูปนี้เปิดได้จริง...', 'info');
  let settled = false;
  const finish = (fn) => { if (settled) return; settled = true; clearTimeout(timer); if (token === bgUrlCheckToken) fn(); };
  const timer = setTimeout(() => finish(() => applyBgUrlFailed(url, true)), 10000);
  const probe = new Image();
  probe.onload = () => finish(() => applyBgUrlOk(url, probe));
  probe.onerror = () => finish(() => applyBgUrlFailed(url, false));
  probe.src = url;
}

function clearBackgroundImage() {
  const had = effectiveBgUrl();
  bgUrlCheckToken++;   // รอบที่ 17: ยกเลิกผลตรวจที่ค้างอยู่ของ URL ที่กำลังจะลบ
  studioConfig.bgImageUrl = '';
  studioConfig.bgImageData = '';
  const box = document.getElementById('bg-image-url');
  if (box) box.value = '';
  syncBgUi();
  updateStudioStyles();
  setBgStatus(had ? 'ลบรูปพื้นหลังแล้ว — กลับไปใช้พื้นหลังไล่สี' : 'ยังไม่มีรูปพื้นหลังให้ลบ', had ? 'ok' : 'info');
  if (had) toast('ลบรูปพื้นหลังแล้ว — ใช้พื้นหลังไล่สีแทน');
}

function applyGradientPreset(key, ev) {
  const g = BG_GRADIENTS.find((x) => x.key === key);
  if (!g) return;
  const hadImage = !!effectiveBgUrl();
  studioConfig.bgGradient = g.css;
  if (hadImage) {
    studioConfig.bgImageUrl = '';
    studioConfig.bgImageData = '';
    const box = document.getElementById('bg-image-url');
    if (box) box.value = '';
  }
  syncBgUi();
  updateStudioStyles();
  setBgStatus(`ใช้พื้นหลังสำเร็จรูป "${g.label}" แล้ว (CSS ไล่สี ไม่ต้องใช้เน็ต)${hadImage ? ' — ลบรูปพื้นหลังเดิมออกให้แล้ว' : ''}`, 'ok');
  toast(`พื้นหลัง "${g.label}" ใช้ได้ทันที และออฟไลน์ได้`);
}

// ลากรูปมาวาง (ที่กล่องของมันเอง หรือวางทับหน้าตัวอย่างเลยก็ได้)
function bindDropTarget(el) {
  if (!el) return;
  ['dragenter', 'dragover'].forEach((evt) => el.addEventListener(evt, (e) => {
    e.preventDefault();
    el.classList.add('is-dragover');
  }));
  ['dragleave', 'dragend'].forEach((evt) => el.addEventListener(evt, () => el.classList.remove('is-dragover')));
  el.addEventListener('drop', (e) => {
    e.preventDefault();
    el.classList.remove('is-dragover');
    const dt = e.dataTransfer;
    if (!dt) return;
    if (dt.files && dt.files.length) { handleBgFileInput(dt.files); return; }
    // ไม่ได้ลาก "ไฟล์" มา แต่ลาก "รูปจากหน้าเว็บอื่น" มา → เบราว์เซอร์ส่งที่อยู่รูปมาให้
    const uri = dt.getData('text/uri-list') || dt.getData('text/plain') || '';
    const html = dt.getData('text/html') || '';
    const fromHtml = /<img[^>]+src=["']([^"']+)["']/i.exec(html);
    const picked = (fromHtml && fromHtml[1]) || uri.split(/[\r\n]+/)[0] || '';
    if (picked) {
      const box = document.getElementById('bg-image-url');
      if (box) { box.value = picked; onBgUrlChanged(); }
    }
  });
}

function bindBackgroundEvents() {
  const zone = document.getElementById('bg-drop-zone');
  bindDropTarget(zone);

  // สำคัญ (บั๊กที่ผู้ใช้เจอ): เดิมตรวจแค่ตอน "change" ซึ่งต้องคลิกออกจากช่องก่อน
  // → วางลิงก์แล้วจ้องดูตัวอย่าง จะไม่มีอะไรเกิดขึ้น ตอนนี้ตรวจให้ทันทีหลังวาง/พิมพ์เสร็จ
  const urlBox = document.getElementById('bg-image-url');
  if (urlBox) {
    urlBox.addEventListener('paste', () => { scheduleBgUrlCheck(80); syncUrlFieldClear(); });
    urlBox.addEventListener('input', () => { scheduleBgUrlCheck(700); syncUrlFieldClear(); });
    urlBox.addEventListener('blur', () => scheduleBgUrlCheck(0));
    urlBox.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); scheduleBgUrlCheck(0); } });
  }
  if (zone) {
    zone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pickBgFile(); }
    });
    zone.addEventListener('click', (e) => { if (e.target === zone || e.target.tagName !== 'BUTTON') pickBgFile(); });
  }
  bindDropTarget(document.getElementById('preview-stage'));
  bindDropTarget(document.getElementById('modal-preview-stage'));
  syncBgUi();
}

// ==========================================================================
// MODAL PREVIEW (สร้างการ์ดใหม่ในโมดัล ไม่ใช้ clone → ไม่มี id ซ้ำ)
// ==========================================================================
let lastFocusedElement = null;

function bindModalEvents() {
  const modal = document.getElementById('preview-modal');
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) { closeModalPreview(); return; }
    // focus trap: ขณะเปิดโมดัล กด Tab ต้องวนอยู่ข้างใน (ไม่หลุดไปคลิกของหลังโมดัล)
    if (e.key === 'Tab' && modal.classList.contains('active')) {
      const items = [...modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
        .filter((el) => !el.disabled && el.getBoundingClientRect().height > 0);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (!modal.contains(active)) { e.preventDefault(); first.focus(); return; }
      if (e.shiftKey && active === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
    }
  });
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModalPreview(); });
}

function openModalPreview() {
  const modal = document.getElementById('preview-modal');
  const stage = document.getElementById('modal-preview-stage');

  const card = document.createElement('div');
  card.innerHTML = buildAuthMarkup({ scope: 'modal-' });
  applyCardVars(card);
  bindCard(card);

  stage.innerHTML = '';
  stage.appendChild(card);
  stage.style.backgroundImage = stageBackgroundCss();

  lastFocusedElement = document.activeElement;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  const closeBtn = modal.querySelector('.modal-close-btn');
  if (closeBtn) closeBtn.focus();
}

function closeModalPreview() {
  const modal = document.getElementById('preview-modal');
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.getElementById('modal-preview-stage').innerHTML = ''; // เก็บกวาด ไม่ให้ HTML ค้างใน DOM
  document.body.style.overflow = '';
  if (lastFocusedElement && lastFocusedElement.focus) lastFocusedElement.focus();
}

// ==========================================================================
// CODE GENERATOR — หัวใจของเครื่องมือนี้: ได้ไฟล์ HTML เดียวที่รันได้จริง
// ==========================================================================
// ค่าที่ปรับได้ทั้งหมด → CSS Variables สำหรับไฟล์ที่ export (แหล่งเดียวกับหน้าตัวอย่าง)
function varsToCssBlock(indent = '    ') {
  const vars = cardVarMap(studioVars());
  return `  :root{
${Object.keys(vars).map((k) => `${indent}${k}: ${vars[k]};`).join('\n')}
  }`;
}

function buildStandaloneHTML() {
  const c = studioConfig;
  const bgUrl = effectiveBgUrl();
  const grad = c.bgGradient || DEFAULT_CONFIG().bgGradient;
  // มีรูป (URL หรือรูปที่ฝังจากเครื่อง) → ใช้รูปทับไล่สีของธีม; ไม่มีรูป → ใช้ไล่สีล้วน ๆ
  const bgBlock = bgUrl
    ? `background-image: ${cssUrlValue(bgUrl)}, ${grad};\n    background-size: cover;\n    background-position: center;\n    background-color: #0f172a;`
    : `background-image: ${grad};`;

  const cssVars = varsToCssBlock();

  const cardMarkup = buildAuthMarkup({ scope: '', icons: false })
    .split('\n').map((line) => (line.trim() ? '      ' + line.trim() : '')).join('\n');

  const swClass = `style-${c.switcherStyle} fx-${c.transitionFx}`;

  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(pageTitle)}</title>
  <!-- ธีมที่ใช้: ${esc((THEME_PRESETS[c.themePreset] || {}).label || 'กำหนดเอง')} — อยากเปลี่ยนก็แก้ค่าใน :root ด้านล่างได้เลย -->

  <!-- อยากได้ฟอนต์สวย ๆ (Prompt / Kanit / Sarabun)? ให้ลบเครื่องหมายคอมเมนต์บรรทัดล่างออก
       หมายเหตุ: ต้องต่ออินเทอร์เน็ต ถ้าไม่มี เบราว์เซอร์จะใช้ฟอนต์ในเครื่องให้อัตโนมัติ
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Prompt:wght@400;600;700&display=swap"> -->

  <style>
  /* ---------- พื้นหลังของทั้งหน้า ---------- */
  * { box-sizing: border-box; }
  html { height: 100%; }
  body {
    margin: 0;
    min-height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    ${bgBlock}
  }

  /* ---------- ค่าที่เปลี่ยนได้ (CSS Variables) แก้ตัวเลขตรงนี้แล้วทั้งหน้าเปลี่ยน ---------- */
${cssVars}

  /* ---------- สไตล์ของการ์ดและฟอร์ม ---------- */
${CARD_CSS.trim()}

  /* ---------- จอเล็ก ---------- */
  @media (max-width: 560px){
    body { padding: 12px; }
    .auth-card-wrapper { padding: 20px; }
  }
  </style>
</head>
<body>

  <!-- การ์ดฟอร์ม: เปลี่ยนคลาส style-... / fx-... เพื่อสลับรูปแบบปุ่มและเอฟเฟกต์ -->
  <div class="auth-card-wrapper ${swClass}">
${cardMarkup}
  </div>

  <script>
  // ===== 1) สลับระหว่างหน้า Login และ Register =====
  var tabs  = document.querySelectorAll('.switcher-tab');
  var panes = document.querySelectorAll('.auth-view-pane');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      panes.forEach(function (pane) {
        pane.classList.toggle('active', pane.dataset.pane === tab.dataset.view);
      });
    });
  });

  // ===== 2) ไม่มีหลังบ้าน: กดปุ่มแล้วแสดงข้อความตัวอย่าง =====
  // (ถ้าเว้นช่องที่ required ไว้ เบราว์เซอร์จะเตือนให้กรอกก่อน ตามที่เขียนไว้)
  document.querySelectorAll('.auth-form').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();   // กันไม่ให้หน้าเว็บรีเฟรช/เปลี่ยนหน้า
      var which = form.dataset.pane === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก';
      alert('ตัวอย่างการทำงาน: ฟอร์ม "' + which + '" ส่งข้อมูลได้แล้ว\\n\\nแต่ไฟล์นี้ไม่มีหลังบ้าน จึงยังไม่มีการบันทึกข้อมูลจริง');
    });
  });
  <\/script>
</body>
</html>
`;
}

// --------------------------------------------------------------------------
// โหมดสอนอ่านโค้ด: แยก "โค้ดที่สร้างจริง" ออกเป็นส่วน ๆ พร้อมคำอธิบายภาษาไทย
// วิธีที่เลือก: ตัดจากโค้ดที่ buildStandaloneHTML() สร้างจริง (ไม่เขียนโค้ดชุดที่สอง)
//   → รับประกันว่าทุกส่วนต่อกันแล้ว = ไฟล์ที่นักเรียนดาวน์โหลด เป๊ะ ๆ (ไม่มีทางเพี้ยนกัน)
//   จุดตัดคือคอมเมนต์หัวข้อที่อยู่ในโค้ดอยู่แล้ว ถ้าวันหนึ่งคอมเมนต์เปลี่ยน จะถอยไปใช้ทั้งไฟล์ (ไม่พัง)
// --------------------------------------------------------------------------
const CODE_PART_ORDER = ['head', 'background', 'vars', 'card', 'media', 'form', 'script'];
const CODE_PART_INFO = {
  head: { label: 'หัวไฟล์ (head) — บอกเบราว์เซอร์ว่านี่คือ HTML5 ภาษาไทย', desc: 'เริ่มจาก <!DOCTYPE html> แล้วตามด้วย <head> ซึ่งเก็บ<meta> (การเข้ารหัส/ขนาดจอ) และ <title> ที่โชว์บนแท็บ — นักเรียนแก้ชื่อเว็บได้ตรงนี้' },
  background: { label: 'พื้นหลังของทั้งหน้า + จัดการ์ดให้อยู่กลางจอ', desc: 'body ใช้ display:flex เพื่อดันการ์ดไปกลางจอ แล้วใส่ background-image เป็นไล่สี (หรือรูปที่ฝังไว้ในไฟล์) — ไม่มีลิงก์จากเน็ตเลย' },
  vars: { label: 'CSS Variables — ค่าที่ปรับได้ทั้งหมด (--card-*)', desc: 'หัวใจของธีม: สี ความมน ความเบลอ ฟอนต์ ถูกเก็บเป็นตัวแปร แก้ตัวเลขตรงนี้ที่เดียวแล้วทั้งหน้าเปลี่ยนตาม' },
  card: { label: 'สไตล์การ์ด ฟอร์ม ปุ่ม และอนิเมชันสลับหน้า', desc: 'สไตล์ของ .auth-card-wrapper / .switcher-tab / .form-input / .form-btn พร้อมเอฟเฟกต์ fx-* ที่ใช้ตอนสลับ Login/Register' },
  media: { label: 'จอเล็ก (@media) — ปรับระยะห่างเมื่อจอแคบกว่า 560px', desc: 'สอนเรื่อง responsive: เมื่อจอเล็กให้ลด padding เพื่อให้การ์ดยังอ่านสบายบนมือถือ' },
  form: { label: 'โครงสร้างฟอร์ม (HTML) — ฟอร์ม Login/Register จริง', desc: 'ปุ่มสลับหน้า + ฟอร์ม 2 ฟอร์มที่มี <label> คู่กับ <input> และ required — กดส่งแล้วเบราว์เซอร์ตรวจให้เองโดยไม่ต้องมีหลังบ้าน' },
  script: { label: 'JavaScript — สลับหน้า + บอกว่าไฟล์นี้ไม่มีหลังบ้าน', desc: 'คลิกแท็บแล้วสลับคลาส .active ระหว่าง 2 หน้า และเมื่อกดปุ่มส่งข้อมูลจะขึ้นข้อความตัวอย่าง เพื่อไม่ให้นักเรียนเข้าใจผิดว่ามีเซิร์ฟเวอร์' }
};

function buildCodeParts() {
  const code = buildStandaloneHTML();
  const marks = [
    '  /* ---------- พื้นหลังของทั้งหน้า ---------- */',
    '  /* ---------- ค่าที่เปลี่ยนได้ (CSS Variables)',
    '  /* ---------- สไตล์ของการ์ดและฟอร์ม ---------- */',
    '  /* ---------- จอเล็ก ---------- */',
    '  <!-- การ์ดฟอร์ม:',
    '  <script>'
  ];
  const pos = [];
  let prev = -1;
  for (const m of marks) {
    const i = code.indexOf(m);
    if (i < 0 || i <= prev) return { script: code };   // หาจุดตัดไม่ได้ → แสดงทั้งไฟล์ (ไม่พัง)
    pos.push(i); prev = i;
  }
  return {
    head: code.slice(0, pos[0]),
    background: code.slice(pos[0], pos[1]),
    vars: code.slice(pos[1], pos[2]),
    card: code.slice(pos[2], pos[3]),
    media: code.slice(pos[3], pos[4]),
    form: code.slice(pos[4], pos[5]),
    script: code.slice(pos[5])
  };
}
function codePartKeys(parts) { return CODE_PART_ORDER.filter((k) => (parts || {})[k]); }

function renderTeachCode() {
  const box = document.getElementById('teach-code-parts');
  if (!box) return;
  const parts = buildCodeParts();
  box.innerHTML = codePartKeys(parts).map((k, i) => {
    const info = CODE_PART_INFO[k] || { label: k, desc: '' };
    const code = parts[k];
    const shown = code.length > 1500
      ? code.slice(0, 1500) + `\n\n/* … ตัดให้สั้นเพื่ออ่านง่าย — กด “คัดลอกส่วนนี้” จะได้โค้ดเต็ม ${code.length} ตัวอักษร … */`
      : code;
    return `<article class="teach-part" data-part="${k}">
        <header class="teach-part-head">
          <span class="teach-part-no" aria-hidden="true">${i + 1}</span>
          <span class="teach-part-title"><strong>ส่วนที่ ${i + 1} · ${esc(info.label)}</strong></span>
          <span class="teach-part-size">${fmtSize(code.length)}</span>
          <button type="button" class="btn btn-secondary btn-sm" onclick="copyCodePart('${k}')">
            <i class="fa-solid fa-copy" aria-hidden="true"></i> คัดลอกส่วนนี้
          </button>
        </header>
        <p class="teach-part-desc">${esc(info.desc)}</p>
        <pre class="teach-code" tabindex="0">${esc(shown)}</pre>
      </article>`;
  }).join('');
}

function copyCodePart(key) {
  const text = (buildCodeParts() || {})[key] || '';
  const ok = () => toast(`คัดลอก ${CODE_PART_INFO[key] ? '“' + CODE_PART_INFO[key].label.split('—')[0].trim() + '”' : key} แล้ว (${fmtSize(text.length)}) — เอาไปวางในไฟล์ได้เลย`);
  const fail = () => toast('คัดลอกอัตโนมัติไม่ได้ — ให้คลิกในกล่องโค้ดด้านบนแล้วกด Ctrl+C (หรือ Cmd+C) เอง');
  if (!text) { fail(); return; }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(ok).catch(fail);
  } else {
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy') ? ok() : fail(); } catch (e) { fail(); }
    document.body.removeChild(ta);
  }
}

function regenerateCode() {
  const box = document.getElementById('standalone-code-output');
  const code = buildStandaloneHTML();
  if (box) box.value = code;
  if (isPanelOpen('teach')) renderTeachCode();   // เปิดโหมดสอนอ่านโค้ดอยู่ → อัปเดตส่วนต่าง ๆ ตามด้วย
  const note = document.getElementById('code-size-note');
  if (note) {
    const embedded = !!safeUrl(studioConfig.bgImageData);
    note.textContent = `ขนาดโค้ด ≈ ${fmtSize(code.length)}${embedded ? ' (ใหญ่เพราะฝังรูปพื้นหลังจากเครื่องไว้ในไฟล์)' : ''}`;
  }
  return code;
}

function copyFullStandaloneHTML() {
  const code = regenerateCode();

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(code).then(showCopySuccess).catch(fallbackCopy);
  } else {
    fallbackCopy();
  }

  function fallbackCopy() {
    const textarea = document.getElementById('standalone-code-output');
    textarea.removeAttribute('readonly');
    textarea.select();
    try {
      const ok = document.execCommand('copy');
      textarea.setAttribute('readonly', 'readonly');
      if (ok) showCopySuccess();
      else toast('คัดลอกอัตโนมัติไม่ได้ — ให้คลิกในกล่องโค้ดแล้วกด Ctrl+C (หรือ Cmd+C) เอง');
    } catch (err) {
      textarea.setAttribute('readonly', 'readonly');
      toast('คัดลอกอัตโนมัติไม่ได้ — ให้คลิกในกล่องโค้ดแล้วกด Ctrl+C (หรือ Cmd+C) เอง');
    }
  }

  function showCopySuccess() {
    const btn = document.getElementById('copy-standalone-btn');
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i> คัดลอกโค้ดทั้งหน้าเว็บสำเร็จแล้ว!';
    btn.classList.remove('btn-success');
    btn.classList.add('btn-sky');
    toast('คัดลอกโค้ดแล้ว — เอาไปวางในไฟล์ index.html แล้วดับเบิลคลิกเปิดได้เลย');
    setTimeout(() => {
      btn.innerHTML = original;
      btn.classList.remove('btn-sky');
      btn.classList.add('btn-success');
    }, 2500);
  }
}

// ดาวน์โหลดเป็นไฟล์ index.html ได้เลย (สะดวกเวลาสอน/ส่งงาน)
function downloadStandaloneHTML() {
  const code = regenerateCode();
  const blob = new Blob([code], { type: 'text/html;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'index.html';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  toast('ดาวน์โหลด index.html แล้ว — ดับเบิลคลิกไฟล์เพื่อเปิดบนเบราว์เซอร์ได้เลย (ไม่ต้องต่อเน็ต)');
}
