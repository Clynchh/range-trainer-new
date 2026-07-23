// AnalysisPage.jsx — your own accuracy, by pot type and by exact spot
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { C, F } from "./styles";
import { potLabel, posRank } from "./poker";

export default function AnalysisPage({ session }) {
  const [rows, setRows] = useState(null);
  const [sortBy, setSortBy] = useState("mistakes"); // "mistakes" | "accuracy" | "volume"

  useEffect(() => {
    supabase
      .from("attempts")
      .select("stack_depth_bb,hero_position,villain_position,action_type,correct")
      .eq("user_id", session.user.id)
      .limit(20000)
      .then(({ data }) => setRows(data || []));
  }, [session]);

  if (!rows) return <Muted>Loading your stats...</Muted>;
  if (!rows.length) return <Muted>No hands drilled yet. Head to Train and play some spots.</Muted>;

  const overall = agg(rows);
  const byPot = groupBy(rows, (r) => r.action_type);
  const bySpot = groupBy(rows, (r) => `${r.stack_depth_bb}|${r.hero_position}|${r.action_type}|${r.villain_position || "-"}`);

  const spotList = Object.entries(bySpot).map(([key, rs]) => {
    const [stack, hero, action, vil] = key.split("|");
    const a = agg(rs);
    return { key, stack: +stack, hero, action, vil, ...a };
  });
  spotList.sort((x, y) => {
    if (sortBy === "accuracy") return x.accuracy - y.accuracy;
    if (sortBy === "volume") return y.n - x.n;
    return y.mistakes - x.mistakes; // default
  });

  return (
    <div>
      <h2 style={{ fontFamily: F.display, fontSize: 16, color: C.text, letterSpacing: "0.04em", marginBottom: 16 }}>Your training stats</h2>

      {/* overall tiles */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 26 }}>
        <Tile label="Spots drilled" value={overall.n} />
        <Tile label="Accuracy" value={overall.accuracy + "%"} accent />
        <Tile label="Correct" value={overall.correct} />
        <Tile label="Mistakes" value={overall.mistakes} danger />
      </div>

      {/* by pot type */}
      <SectionTitle>Accuracy by pot type</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 28 }}>
        {Object.entries(byPot)
          .map(([k, rs]) => ({ k, ...agg(rs) }))
          .sort((a, b) => a.accuracy - b.accuracy)
          .map(({ k, n, accuracy, mistakes }) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 90, fontFamily: F.body, fontSize: 12, color: C.textSoft }}>{potLabel(k)}</span>
              <div style={{ flex: 1, height: 8, background: C.card, borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: `${accuracy}%`, height: "100%", background: barColor(accuracy) }} />
              </div>
              <span style={{ width: 46, textAlign: "right", fontFamily: F.body, fontSize: 12, color: C.text, fontVariantNumeric: "tabular-nums" }}>{accuracy}%</span>
              <span style={{ width: 120, fontFamily: F.body, fontSize: 10.5, color: C.textDim }}>{mistakes} miss / {n}</span>
            </div>
          ))}
      </div>

      {/* by spot */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <SectionTitle noMargin>Where you make mistakes</SectionTitle>
        <div style={{ display: "flex", gap: 4 }}>
          {[["mistakes", "Most misses"], ["accuracy", "Worst %"], ["volume", "Most played"]].map(([id, lbl]) => (
            <button key={id} onClick={() => setSortBy(id)} style={{
              fontFamily: F.body, fontSize: 9.5, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase",
              padding: "5px 9px", borderRadius: 4, cursor: "pointer",
              border: `1px solid ${sortBy === id ? C.gold : C.border}`,
              background: sortBy === id ? `${C.gold}1a` : "transparent",
              color: sortBy === id ? C.goldBright : C.textDim,
            }}>{lbl}</button>
          ))}
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: F.body }}>
          <thead>
            <tr style={{ textAlign: "left", color: C.textDim, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              <Th>Stack</Th><Th>Hero</Th><Th>Pot</Th><Th>Vs</Th>
              <Th right>Played</Th><Th right>Miss</Th><Th right>Acc</Th>
            </tr>
          </thead>
          <tbody>
            {spotList.map((s) => (
              <tr key={s.key} style={{ borderTop: `1px solid ${C.border}` }}>
                <Td>{s.stack}bb</Td><Td>{s.hero}</Td><Td>{potLabel(s.action)}</Td>
                <Td dim>{s.vil === "-" ? "—" : s.vil}</Td>
                <Td right>{s.n}</Td>
                <Td right danger={s.mistakes > 0}>{s.mistakes}</Td>
                <Td right><span style={{ color: barColor(s.accuracy) }}>{s.accuracy}%</span></Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// helpers
function agg(rs) {
  const n = rs.length;
  const correct = rs.reduce((a, r) => a + (r.correct ? 1 : 0), 0);
  return { n, correct, mistakes: n - correct, accuracy: n ? Math.round((correct / n) * 100) : 0 };
}
function groupBy(rs, keyFn) {
  const m = {};
  for (const r of rs) (m[keyFn(r)] ||= []).push(r);
  return m;
}
function barColor(acc) { return acc >= 90 ? C.green : acc >= 75 ? C.gold : C.red; }

function Tile({ label, value, accent, danger }) {
  return (
    <div style={{ flex: "1 1 120px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px" }}>
      <div style={{ fontFamily: F.body, fontSize: 26, fontWeight: 700, color: danger ? C.red : accent ? C.goldBright : C.text, fontVariantNumeric: "tabular-nums" }}>{value}</div>
      <div style={{ fontFamily: F.body, fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>{label}</div>
    </div>
  );
}
function SectionTitle({ children, noMargin }) {
  return <div style={{ fontFamily: F.body, fontSize: 9, color: C.textDim, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: noMargin ? 0 : 12 }}>{children}</div>;
}
const Th = ({ children, right }) => <th style={{ padding: "6px 8px", textAlign: right ? "right" : "left" }}>{children}</th>;
const Td = ({ children, right, dim, danger }) => <td style={{ padding: "7px 8px", textAlign: right ? "right" : "left", fontSize: 12, color: danger ? C.red : dim ? C.textDim : C.textSoft, fontVariantNumeric: "tabular-nums" }}>{children}</td>;
function Muted({ children }) { return <div style={{ fontFamily: F.body, fontSize: 13, color: C.textDim, textAlign: "center", padding: 40 }}>{children}</div>; }
