// Generated UI only. Never apply these adaptations to vendor or upstream.
export function adaptDesign(text) {
  const colors = {
    '#3182f6': '#d5a64a', '#3b82f6': '#d5a64a', '#2563eb': '#ba8629',
    '#60a5fa': '#edc977', '#93c5fd': '#f4db9e', '#1d4ed8': '#9a6d20',
  };
  text = text.replace(/#(?:3182f6|3b82f6|2563eb|60a5fa|93c5fd|1d4ed8)\b/gi, value => colors[value.toLowerCase()]);
  text = text.replace(/rgba?\(\s*(?:49\s*,\s*130\s*,\s*246|59\s*,\s*130\s*,\s*246|37\s*,\s*99\s*,\s*235)/g, match => match.replace(/\(.*/, '(213, 166, 74'));
  text = text.replace(/font-size\s*:\s*(\d*\.?\d+)(px|rem|em)\b/gi, (match, number, unit) => {
    const px = Number(number) * (unit === 'px' ? 1 : 16);
    return px > 0 && px < 15 ? 'font-size: 15px' : match;
  });
  return text.replace(/font-weight\s*:\s*(?:800|900|1000)\b/g, 'font-weight: 700');
}
