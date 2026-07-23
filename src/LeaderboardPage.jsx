// LeaderboardPage.jsx — cross-user rankings: accuracy (by pot type) + volume
import { useState, useEffect, useMemo } from "react";
import { supabase } from "./supabaseClient";
import { C, F } from "./styles";
import { potLabel } from "./poker";

const MIN_FOR_ACCURACY = 20; // hide low-volume users from the accuracy ranking

export default function LeaderboardPage() {
  const [overall, setOverall] = useState(null);
  const [byPot, setByPot] = useState(null);
  const [metric, setMetric] = useState("accuracy"); // "accuracy" | "spots"
  const [pot, setPot] = useState("all");

  useEffect(() => {
    supabase.from("leaderboard").select("*").then(({ data }) => setOverall(data || []));
    supabase.from("leaderboard_by_pot").select("*").then(({ data }) => setByPot(data || []));
  }, []);

  const potTypes = useMemo(() => {
    const s = new Set((byPot || []).map((r) => r.action_type));
    return [...s].sort();
  }, [byPot]);

  const rows = useMemo(() => {
    if (!overall || !byPot) return null;
    let base = pot === "all" ? overall : byPot.filter((r) => r.action_type === pot);
    base = base.map((r) => ({ ...r, spots: Number(r.spots), accuracy: Number(r.accuracy) }));
    base.sort((a, b) => {
      if (metric === "spots") return b.spots - a.spots;
      // accuracy: demote sub-threshold users, tiebreak on volume
      const qa = a.spots >= MIN_FOR_ACCURACY, qb = b.spots >= MIN_FOR_ACCURACY;
      if (qa !== qb) return qa ? -1 : 1;
      return b.accuracy - a.accuracy || b.spots - a.spots;
    });
    return base;
  }, [overall, byPot, metric, pot]);

  if (!rows) return <Muted>Loading leaderboard...</Muted>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
        <h2 style={{ fontFamily: F.display, fontSize: 16, color: C.text, letterSpacing: "0.04em", margin: 0 }}>Leaderboard</h2>
        <div style={{ display: "flex", gap: 6 }}>
          {[["accuracy", "Accuracy"], ["spots", "Volume"]].map(([id, lbl]) => (
            <button key={id} onClick={() => setMetric(id)} style={pillStyle(metric === id)}>{lbl}</button>
          ))}
        </div>
      </div>

      {/* pot type filter */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        <button onClick={() => setPot("all")} style={pillStyle(pot === "all")}>All pots</button>
        {potTypes.map((t) => (
          <button key={t} onClick={() => setPot(t)} style={pillStyle(pot === t)}>{potLabel(t)}</button>
        ))}
      </div>

      {metric === "accuracy" && (
        <p style={{ fontFamily: F.body, fontSize: 10, color: C.textDim, marginBottom: 10 }}>
          Ranked by accuracy · minimum {MIN_FOR_ACCURACY} spots to qualify
        </p>
      )}

      {!rows.length ? <Muted>No attempts recorded yet.</Muted> : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: F.body }}>
            <thead>
              <tr style={{ textAlign: "left", color: C.textDim, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                <Th>#</Th><Th>Player</Th><Th right>Spots</Th><Th right>Accuracy</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const qualified = r.spots >= MIN_FOR_ACCURACY;
                const rank = metric === "accuracy" && !qualified ? "–" : i + 1;
                const medal = ["🥇", "🥈", "🥉"][i] && (metric !== "accuracy" || qualified) ? ["🥇", "🥈", "🥉"][i] : null;
                return (
                  <tr key={r.username} style={{ borderTop: `1px solid ${C.border}` }}>
                    <Td>{medal || rank}</Td>
                    <Td strong>{r.username}</Td>
                    <Td right>{r.spots}</Td>
                    <Td right><span style={{ color: r.accuracy >= 90 ? C.green : r.accuracy >= 75 ? C.gold : C.red }}>{r.accuracy}%</span></Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function pillStyle(on) {
  return {
    fontFamily: F.body, fontSize: 11, fontWeight: 600, letterSpacing: "0.04em",
    padding: "6px 12px", borderRadius: 16, cursor: "pointer",
    border: `1px solid ${on ? C.gold : C.border}`,
    background: on ? `${C.gold}1a` : "transparent",
    color: on ? C.goldBright : C.textDim,
  };
}
const Th = ({ children, right }) => <th style={{ padding: "6px 10px", textAlign: right ? "right" : "left" }}>{children}</th>;
const Td = ({ children, right, strong }) => <td style={{ padding: "9px 10px", textAlign: right ? "right" : "left", fontSize: 13, color: strong ? C.text : C.textSoft, fontWeight: strong ? 600 : 400, fontVariantNumeric: "tabular-nums" }}>{children}</td>;
function Muted({ children }) { return <div style={{ fontFamily: F.body, fontSize: 13, color: C.textDim, textAlign: "center", padding: 40 }}>{children}</div>; }
