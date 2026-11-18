import { defaultStyle } from './model.js';

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

function piece(id, tag, x, y, w, h, text, style, extra) {
  return Object.assign({
    id, tag, x, y, w, h, text, href: '#', src: '', inputType: 'text', style,
  }, extra || {});
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
  return [
    piece(id + '-card', 'div', 300, 70, 540, 480, '', {
      bg: lightCard, border: 'transparent', color: onCard, radius: 16, fontSize: 16,
    }),
    piece(id + '-title', 'p', 340, 110, 460, 48, title, {
      bg: 'transparent', border: 'transparent', color: onCard, radius: 0, fontSize: 28,
    }),
    piece(id + '-email', 'input', 340, 180, 460, 52, 'name@school.ac.th', {
      bg: fieldBg, border: '#d5dde6', color: fieldText, radius: brand.radius, fontSize: 16,
    }, { inputType: 'email' }),
    piece(id + '-pass', 'input', 340, 248, 460, 52, '••••••••', {
      bg: fieldBg, border: '#d5dde6', color: fieldText, radius: brand.radius, fontSize: 16,
    }, { inputType: 'password' }),
    piece(id + '-go', 'button', 340, 328, 460, 48, button, {
      bg: brand.accent, border: brand.accent, color: '#ffffff', radius: brand.radius, fontSize: 16,
    }),
    piece(id + '-link', 'a', 340, 400, 220, 32, link, {
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

export { defaultStyle };
