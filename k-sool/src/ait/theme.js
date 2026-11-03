// One palette registry feeds every screen. Component CSS consumes semantic roles only.
const palette = (label, accent, ink, muted, canvas, soft, border, edge, mid, light, base, shelf, card, control) => ({
  label, tokens: { primary: accent, 'primary-hover': ink, 'primary-soft': soft,
    bg: canvas, 'app-bg': canvas, 'card-bg': '#ffffff', 'card-hover': soft, border,
    text: ink, 'text-muted': muted, 'theme-accent': accent, 'theme-soft': soft,
    'glass-edge': edge, 'glass-mid': mid, 'glass-light': light, 'glass-base': base,
    'shelf-tint': shelf, 'card-tint': card, 'card-ink': ink, 'control-bg': control,
    'control-ink': '#ffffff', 'disabled-bg': soft, 'disabled-ink': muted,
    'ait-on-primary': '#ffffff', 'swatch-dark': edge, 'swatch-light': light }
});
export const bottleThemes = Object.freeze({
  green: palette('초록 유리', '#16845b', '#193b31', '#526f60', '#f5f8ef', '#e6efd9', '#c7d7bb', '#176339', '#48984c', '#a5cc8b', '#03170e', '#f1f6e8', '#e3edcf', '#164c32'),
  blue: palette('푸른 유리', '#2177a7', '#193e60', '#506c80', '#f0f7fb', '#e5eef3', '#c7dcea', '#5ea3c2', '#ccd8e2', '#f7f9fb', '#32677c', '#2177a7', '#dcecf6', '#244b58'),
  apricot: palette('살구빛 유리', '#92552f', '#634338', '#79604d', '#fff8ef', '#fbecd8', '#ddc5a5', '#cc9551', '#efd09a', '#fae9c7', '#70452d', '#fff1d9', '#f3dfbd', '#805033'),
  brown: palette('갈색 유리', '#76501f', '#493015', '#755e41', '#fbf6eb', '#f8edcf', '#d8c393', '#351f16', '#72361c', '#d3782c', '#1e130e', '#d8b565', '#f0dca7', '#58351f'),
});
export function applyBottleTheme(id) {
  const theme = bottleThemes[id] || bottleThemes.green;
  document.documentElement.dataset.bottleTheme = Object.hasOwn(bottleThemes, id) ? id : 'green';
  for (const [role, value] of Object.entries(theme.tokens)) document.documentElement.style.setProperty(`--${role}`, value);
}
