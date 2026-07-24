// poker.js — hand notation, action labels, scenario grouping helpers
import { ACTION_COLORS } from "./styles";

export const ACTION_LABELS = {
  raise: "Raise", raise_big: "Big Raise", allin: "All-in", open: "Open", limp: "Limp",
  "3bet": "3-Bet", "4bet": "4-Bet", "5bet": "5-Bet", squeeze: "Squeeze",
  call: "Call", fold: "Fold",
};
export const ACTION_ORDER = ["raise", "raise_big", "allin", "open", "limp",
  "3bet", "4bet", "5bet", "squeeze", "call", "fold"];

export const POT_LABELS = {
  RFI: "RFI", vs_RFI: "vs RFI", vs_3bet: "vs 3-Bet", vs_4bet: "vs 4-Bet",
  squeeze: "Squeeze", vs_squeeze: "vs Squeeze",
};

// canonical seat order for sorting
export const POS_ORDER = ["UTG", "UTG+1", "UTG+2", "LJ", "MP", "HJ", "CO", "BTN", "SB", "BB"];
export function posRank(p) {
  const i = POS_ORDER.indexOf(p);
  return i < 0 ? 99 : i;
}

export function actionLabel(a) { return ACTION_LABELS[a] || a; }
export function actionColor(a) { return ACTION_COLORS[a] || "#555"; }
export function potLabel(t) { return POT_LABELS[t] || t; }

export function parseHand(h) {
  if (h.length === 2) return { a: h[0], b: h[1], type: "pair" };
  return { a: h[0], b: h[1], type: h[2] === "s" ? "suited" : "offsuit" };
}

// 13x13 grid mapping (matches the extractor: pairs on the diagonal,
// suited upper-right, offsuit lower-left).
export const RANKS = "AKQJT98765432";
export function cellHand(r, c) {
  if (r === c) return RANKS[r] + RANKS[r];
  if (r < c) return RANKS[r] + RANKS[c] + "s";
  return RANKS[c] + RANKS[r] + "o";
}

// Two hole-card faces (rank + suit + isRed) for a hand class.
export function holeCards(hand) {
  const p = parseHand(hand);
  if (p.type === "suited") return [{ r: p.a, s: "♠", red: false }, { r: p.b, s: "♠", red: false }];
  return [{ r: p.a, s: "♠", red: false }, { r: p.b, s: "♥", red: true }];
}

// One-line description of a chart's situation
export function situationText(s) {
  let t = `${s.stack_depth_bb}bb · ${s.hero_position} · ${potLabel(s.action_type)}`;
  if (s.vs_position) t += ` ${s.vs_position}` + (s.vs_action ? ` ${s.vs_action}` : "");
  return t;
}

// A stable key describing the exact spot (for grouping / mistake analysis)
export function spotKey(s) {
  return [s.stack_depth_bb, s.hero_position, s.action_type, s.vs_position || "-"].join("|");
}

export function nonFoldActions(actions) {
  return Object.keys(actions).filter((a) => a !== "fold" && actions[a] > 0);
}

// Buttons for a chart = every action that appears anywhere in it (+ fold), ordered.
export function chartActions(chart) {
  const set = new Set();
  for (const h in chart.range)
    for (const a in chart.range[h]) if (chart.range[h][a] > 0) set.add(a);
  set.add("fold");
  return ACTION_ORDER.filter((a) => set.has(a));
}

// ---- scenario grouping -----------------------------------------------------
// Build the distinct value set for each dimension across all charts.
export function dimensionOptions(charts) {
  const stacks = new Set(), pots = new Set(), heroes = new Set(), villains = new Set();
  for (const c of charts) {
    const s = c.situation;
    stacks.add(s.stack_depth_bb);
    pots.add(s.action_type);
    heroes.add(s.hero_position);
    villains.add(s.vs_position || null);
  }
  return {
    stacks: [...stacks].sort((a, b) => a - b),
    pots: [...pots].sort(),
    heroes: [...heroes].sort((a, b) => posRank(a) - posRank(b)),
    villains: [...villains].sort((a, b) => (a === null ? -1 : posRank(a)) - (b === null ? -1 : posRank(b))),
  };
}

// Filter charts by the selected dimension values. An empty set = "all".
export function filterCharts(charts, sel) {
  return charts.filter((c) => {
    const s = c.situation;
    if (sel.stacks.size && !sel.stacks.has(s.stack_depth_bb)) return false;
    if (sel.pots.size && !sel.pots.has(s.action_type)) return false;
    if (sel.heroes.size && !sel.heroes.has(s.hero_position)) return false;
    if (sel.villains.size && !sel.villains.has(s.vs_position || null)) return false;
    return true;
  });
}

// Pick a random hand from a chart, weighted toward playable (non-fold) hands.
export function pickHand(chart, playableOnly) {
  const hands = Object.keys(chart.range);
  const playable = hands.filter((h) => nonFoldActions(chart.range[h]).length > 0);
  if (playableOnly && playable.length) return playable[(Math.random() * playable.length) | 0];
  if (!playableOnly && playable.length && Math.random() < 0.6)
    return playable[(Math.random() * playable.length) | 0];
  return hands[(Math.random() * hands.length) | 0];
}
