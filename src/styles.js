// styles.js — MTT Preflop Trainer theme (shared design language with Fantasy Poker)

export const F = {
  body: `'IBM Plex Mono', 'JetBrains Mono', monospace`,
  display: `'Cinzel', Georgia, serif`,
};

export const C = {
  bg: "#07080a",
  surface: "#0d0f12",
  card: "#111318",
  cardHover: "#161a20",
  border: "#1c2028",
  borderLight: "#252b35",
  text: "#e2dfd8",
  textSoft: "#9a9590",
  textDim: "#5a5550",
  gold: "#c9a84c",
  goldBright: "#e8c85a",
  goldDim: "#8a7235",
  red: "#c0392b",
  green: "#27ae60",
  blue: "#2980b9",
};

// Action colors mirror the chart legend (yellow raise / red big raise / etc.)
export const ACTION_COLORS = {
  raise: "#d9b64e",
  raise_big: "#d15b3c",
  allin: "#8e2b2b",
  open: "#d9b64e",
  "3bet": "#d15b3c",
  "4bet": "#d15b3c",
  "5bet": "#8e2b2b",
  squeeze: "#d15b3c",
  limp: "#5a8c5a",
  call: "#3f9d5c",
  fold: "#3a5f88",
};
