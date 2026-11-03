// Generated UI only. Never apply these adaptations to vendor or upstream.
export function adaptDesign(text) {
  const colors = {
    '#3182f6': '#16845b', '#3b82f6': '#16845b', '#2563eb': '#116a49',
    '#60a5fa': '#116a49', '#93c5fd': '#116a49', '#1d4ed8': '#0d573c',
  };
  text = text.replace(/#(?:3182f6|3b82f6|2563eb|60a5fa|93c5fd|1d4ed8)\b/gi, value => colors[value.toLowerCase()]);
  text = text.replace(/rgba?\(\s*(?:49\s*,\s*130\s*,\s*246|59\s*,\s*130\s*,\s*246|37\s*,\s*99\s*,\s*235)/g, match => match.replace(/\(.*/, '(22, 132, 91'));
  // Transform CSS declarations, never pixel-art fills or canvas drawing colors.
  const lightColors = {
    '#0b1120':'#f2faf6', '#111827':'#f2faf6', '#0f172a':'#ffffff', '#1e293b':'#ffffff',
    '#131c2e':'#ffffff', '#162032':'#f2faf6', '#172554':'#e2f3eb', '#1a2333':'#ffffff',
    '#26354d':'#e2f3eb', '#334155':'#c7dcd1', '#475569':'#a5c4b5',
    '#f8fafc':'#193b31', '#f1f5f9':'#193b31', '#ffffff':'#193b31', '#fff':'#193b31',
    '#e2e8f0':'#314f43', '#cbd5e1':'#466356', '#94a3b8':'#587367',
    '#38bdf8':'#087869', '#7dd3fc':'#087869', '#bae6fd':'#087869',
    '#fde047':'#78540c', '#facc15':'#78540c', '#fbbf24':'#78540c', '#fcd34d':'#78540c',
    '#fca5a5':'#a53434', '#f87171':'#b73535', '#6ee7b7':'#116a49',
    '#e9d5ff':'#6d3894', '#c4b5fd':'#6d3894', '#a78bfa':'#6d3894',
    '#291d12':'#fcf5e6', '#2e1065':'#f4edf9', '#1e1b4b':'#e6f4ee', '#090d16':'#f2faf6',
  };
  text = text.replace(/((?:color|background(?:-color)?|border(?:-color)?|box-shadow)\s*:\s*)([^;\n{}]+)/gi, (match, property, value) => {
    value = value.replace(/#[a-f0-9]{3,8}\b/gi, hex => lightColors[hex.toLowerCase()] || hex);
    value = value.replace(/rgba\(\s*(?:15,\s*23,\s*42|30,\s*41,\s*59|9,\s*13,\s*24)\s*,\s*([.\d]+)\)/g, 'rgba(242, 250, 246, $1)');
    return property + value;
  });
  text = text.replace(/font-size\s*:\s*(\d*\.?\d+)(px|rem|em)\b/gi, (match, number, unit) => {
    const px = Number(number) * (unit === 'px' ? 1 : 16);
    return px > 0 && px < 15 ? 'font-size: 15px' : match;
  });
  text = text.replace(/((?:color|background(?:-color)?|border(?:-color)?|box-shadow)\s*:\s*)([^;\n{}]+)/gi, (match, property, value) => property + value.replace(/#[a-f0-9]{3,8}\b/gi, hex => ({ '#16845b':'var(--primary)', '#116a49':'var(--primary-hover)', '#0d573c':'var(--primary-hover)', '#f2faf6':'var(--bg)', '#ffffff':'var(--card-bg)', '#e6f4ee':'var(--theme-soft)', '#e2f3eb':'var(--card-hover)', '#c7dcd1':'var(--border)', '#193b31':'var(--text)', '#314f43':'var(--text)', '#466356':'var(--text-muted)', '#587367':'var(--text-muted)' }[hex.toLowerCase()] || hex)));
  text = text.replace(/rgba\(242,\s*250,\s*246,\s*([.\d]+)\)/g, (_, alpha) => `color-mix(in srgb, var(--bg) ${Number(alpha) * 100}%, transparent)`);
  text = text.replace(/rgba\(22,\s*132,\s*91,\s*([.\d]+)\)/g, (_, alpha) => `color-mix(in srgb, var(--primary) ${Number(alpha) * 100}%, transparent)`);
  return text.replace(/font-weight\s*:\s*(?:800|900|1000)\b/g, 'font-weight: 700');
}
