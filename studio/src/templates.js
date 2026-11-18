import { childBox, frameSize, spanFor } from './model.js';

const BRANDS = [
  { id: 'google', name: 'Google', mark: 'G', accent: '#1a73e8', page: '#ffffff', card: '#ffffff', text: '#202124', radius: 4 },
  { id: 'apple', name: 'Apple', mark: 'A', accent: '#1d1d1f', page: '#f5f5f7', card: '#ffffff', text: '#1d1d1f', radius: 12 },
  { id: 'airbnb', name: 'Airbnb', mark: 'Ab', accent: '#ff5a5f', page: '#fff5f5', card: '#ffffff', text: '#222222', radius: 8 },
  { id: 'microsoft', name: 'Microsoft', mark: 'M', accent: '#00a4ef', page: '#f3f5f8', card: '#ffffff', text: '#1b1b1b', radius: 2 },
  { id: 'instagram', name: 'Instagram', mark: 'Ig', accent: '#e1306c', page: '#fafafa', card: '#ffffff', text: '#262626', radius: 8 },
  { id: 'github', name: 'GitHub', mark: 'Gh', accent: '#24292f', page: '#f6f8fa', card: '#ffffff', text: '#24292f', radius: 6 },
  { id: 'notion', name: 'Notion', mark: 'N', accent: '#111111', page: '#ffffff', card: '#ffffff', text: '#111111', radius: 4 },
  { id: 'spotify', name: 'Spotify', mark: 'S', accent: '#1db954', page: '#121212', card: '#181818', text: '#ffffff', radius: 24 },
  { id: 'netflix', name: 'Netflix', mark: 'N', accent: '#e50914', page: '#141414', card: '#000000', text: '#ffffff', radius: 4 },
  { id: 'youtube', name: 'YouTube', mark: 'Yt', accent: '#ff0000', page: '#f9f9f9', card: '#ffffff', text: '#0f0f0f', radius: 8 },
];

function brick(id, tag, host, col, row, text, style, extra) {
  const piece = Object.assign({
    id, tag, host, col, row, span: spanFor(tag), text, href: '#', src: '', inputType: 'text', style,
    x: 0, y: 0, w: 0, h: 0,
  }, extra || {});
  const box = childBox(piece);
  piece.x = box.x;
  piece.y = box.y;
  piece.w = box.w;
  piece.h = box.h;
  return piece;
}

export function templateList() {
  return BRANDS;
}

export function piecesFor(brand, form) {
  const title = form === 'register' ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ';
  const button = form === 'register' ? 'สมัคร' : 'ถัดไป';
  const link = form === 'register' ? 'มีบัญชีแล้ว' : 'สร้างบัญชี';
  const lightCard = brand.card;
  const onCard = brand.text;
  const fieldBg = brand.page === '#121212' || brand.page === '#141414' ? '#222222' : '#ffffff';
  const fieldText = brand.page === '#121212' || brand.page === '#141414' ? '#ffffff' : '#1c2430';
  const id = brand.id + '-' + form;
  const frame = {
    id: id + '-card', tag: 'div', host: '', col: 0, row: 0, cols: 10, rows: 10,
    text: '', href: '#', src: '', inputType: 'text', x: 220, y: 36, w: 0, h: 0,
    style: { bg: lightCard, border: '#d5dde6', color: onCard, radius: 16, fontSize: 16 },
  };
  const size = frameSize(frame);
  frame.w = size.w;
  frame.h = size.h;
  return [
    frame,
    brick(id + '-title', 'p', frame.id, 1, 0, title, {
      bg: 'transparent', border: 'transparent', color: onCard, radius: 0, fontSize: 28,
    }),
    brick(id + '-email', 'input', frame.id, 1, 2, 'name@school.ac.th', {
      bg: fieldBg, border: '#d5dde6', color: fieldText, radius: brand.radius, fontSize: 16,
    }, { inputType: 'email' }),
    brick(id + '-pass', 'input', frame.id, 1, 4, '••••••••', {
      bg: fieldBg, border: '#d5dde6', color: fieldText, radius: brand.radius, fontSize: 16,
    }, { inputType: 'password' }),
    brick(id + '-go', 'button', frame.id, 1, 6, button, {
      bg: brand.accent, border: brand.accent, color: '#ffffff', radius: brand.radius, fontSize: 16,
    }),
    brick(id + '-link', 'a', frame.id, 1, 8, link, {
      bg: 'transparent', border: 'transparent', color: brand.accent, radius: 0, fontSize: 15,
    }),
  ];
}

export function applyBrand(brand, form) {
  return {
    pieces: piecesFor(brand, form),
    page: { bg: brand.page, image: '' },
  };
}
