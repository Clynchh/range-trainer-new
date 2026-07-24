// PokerTable.jsx — minimalist table with seats + positions, hero hole cards,
// villain action, and dealer button.
import { C, F } from "./styles";
import { holeCards, potLabel } from "./poker";

// Seat coordinates as % of the container (8-handed ring).
const SEATS = [
  { pos: "UTG", x: 24, y: 16 },
  { pos: "UTG+1", x: 50, y: 10 },
  { pos: "LJ", x: 76, y: 16 },
  { pos: "HJ", x: 90, y: 50 },
  { pos: "CO", x: 76, y: 84 },
  { pos: "BTN", x: 50, y: 90 },
  { pos: "SB", x: 24, y: 84 },
  { pos: "BB", x: 10, y: 50 },
];

const VILLAIN_VERB = {
  open: "opens", "3bet": "3-bets", "4bet": "4-bets", "5bet": "5-bets",
  limp: "limps", call: "calls", raise: "raises",
};

function MiniCard({ rank, suit, red }) {
  return (
    <div style={{
      width: 40, height: 56, borderRadius: 6, background: "#f5f5ef",
      color: red ? "#c0392b" : "#141414", display: "flex", flexDirection: "column",
      justifyContent: "space-between", padding: "5px 6px", fontWeight: 700,
      boxShadow: "0 3px 8px rgba(0,0,0,.45)",
    }}>
      <span style={{ fontSize: 17, lineHeight: 1 }}>{rank}</span>
      <span style={{ fontSize: 15, alignSelf: "flex-end", lineHeight: 1 }}>{suit}</span>
    </div>
  );
}

function Seat({ pos, x, y, isHero, isVillain, villainVerb }) {
  const border = isHero ? C.gold : isVillain ? C.red : C.border;
  const color = isHero ? C.goldBright : isVillain ? "#e08a83" : C.textDim;
  const bg = isHero ? `${C.gold}18` : isVillain ? `${C.red}14` : C.card;
  return (
    <div style={{ position: "absolute", left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)", textAlign: "center", width: 74 }}>
      <div style={{
        padding: "5px 0", borderRadius: 6, border: `1.5px solid ${border}`, background: bg,
        fontFamily: F.body, fontSize: 11, fontWeight: 700, color, letterSpacing: "0.03em",
      }}>
        {pos}
        {pos === "BTN" && (
          <span style={{
            display: "inline-block", marginLeft: 5, width: 14, height: 14, lineHeight: "14px",
            borderRadius: "50%", background: "#e8e4da", color: "#141414", fontSize: 9, fontWeight: 800,
            verticalAlign: "middle",
          }}>D</span>
        )}
      </div>
      <div style={{ height: 12, marginTop: 2 }}>
        {isHero && <span style={{ fontFamily: F.body, fontSize: 8, fontWeight: 700, color: C.gold, letterSpacing: "0.12em" }}>YOU</span>}
        {isVillain && villainVerb && <span style={{ fontFamily: F.body, fontSize: 8, fontWeight: 700, color: "#e08a83", letterSpacing: "0.06em" }}>{villainVerb}</span>}
      </div>
    </div>
  );
}

export default function PokerTable({ situation, hand }) {
  const hero = situation.hero_position;
  const villain = situation.vs_position;
  const verb = VILLAIN_VERB[situation.vs_action] || situation.vs_action;
  const cards = hand ? holeCards(hand) : null;

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 400, margin: "0 auto", aspectRatio: "4 / 3" }}>
      {/* felt */}
      <div style={{
        position: "absolute", top: "24%", bottom: "24%", left: "13%", right: "13%",
        borderRadius: "50% / 50%",
        background: "radial-gradient(ellipse at center, #16523a 0%, #0e3527 70%, #0b2a1f 100%)",
        border: `6px solid #241d12`, boxShadow: "inset 0 0 30px rgba(0,0,0,.5)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
      }}>
        {cards && (
          <div style={{ display: "flex", gap: 8 }}>
            {cards.map((c, i) => <MiniCard key={i} rank={c.r} suit={c.s} red={c.red} />)}
          </div>
        )}
        <div style={{ fontFamily: F.body, fontSize: 10.5, color: "#a9c7b6", letterSpacing: "0.05em" }}>
          {situation.stack_depth_bb}bb · {potLabel(situation.action_type)}
        </div>
      </div>

      {SEATS.map((s) => (
        <Seat key={s.pos} {...s}
          isHero={s.pos === hero}
          isVillain={s.pos === villain}
          villainVerb={verb} />
      ))}
    </div>
  );
}
