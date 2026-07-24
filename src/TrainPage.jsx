// TrainPage.jsx — grouped scenario selection, quiz drilling, attempt recording
import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "./supabaseClient";
import { C, F } from "./styles";
import PokerTable from "./PokerTable";
import {
  dimensionOptions, filterCharts, pickHand, parseHand, chartActions,
  nonFoldActions, actionLabel, actionColor, situationText, potLabel,
} from "./poker";

const emptySel = () => ({ stacks: new Set(), pots: new Set(), heroes: new Set(), villains: new Set() });

export default function TrainPage({ charts, session }) {
  const [sel, setSel] = useState(emptySel);
  const [phase, setPhase] = useState("select"); // "select" | "drill"
  const [playableOnly, setPlayableOnly] = useState(false);
  const [pool, setPool] = useState([]);
  const [cur, setCur] = useState(null);          // { chart, hand }
  const [picked, setPicked] = useState(null);
  const [stats, setStats] = useState({ n: 0, correct: 0, streak: 0 });

  const opts = useMemo(() => dimensionOptions(charts), [charts]);
  const matching = useMemo(() => filterCharts(charts, sel), [charts, sel]);

  const toggle = (dim, val) => {
    setSel((s) => {
      const next = { ...s, [dim]: new Set(s[dim]) };
      next[dim].has(val) ? next[dim].delete(val) : next[dim].add(val);
      return next;
    });
  };

  const answered = picked !== null;

  const nextHand = useCallback((activePool) => {
    const p = activePool || pool;
    if (!p.length) return;
    const chart = p[(Math.random() * p.length) | 0];
    const hand = pickHand(chart, playableOnly);
    setCur({ chart, hand });
    setPicked(null);
  }, [pool, playableOnly]);

  const start = () => {
    const p = matching;
    if (!p.length) return;
    setPool(p);
    setStats({ n: 0, correct: 0, streak: 0 });
    setPhase("drill");
    nextHand(p);
  };

  const answer = (action) => {
    if (answered || !cur) return;
    const actions = cur.chart.range[cur.hand];
    const correct = (actions[action] || 0) > 0;
    setPicked(action);
    setStats((s) => ({ n: s.n + 1, correct: s.correct + (correct ? 1 : 0), streak: correct ? s.streak + 1 : 0 }));
    // record attempt (fire-and-forget)
    const s = cur.chart.situation;
    supabase.from("attempts").insert({
      user_id: session.user.id,
      stack_depth_bb: s.stack_depth_bb,
      hero_position: s.hero_position,
      villain_position: s.vs_position || null,
      action_type: s.action_type,
      hand: cur.hand,
      chosen_action: action,
      correct,
    }).then(({ error }) => { if (error) console.error("record attempt:", error.message); });
  };

  // keyboard
  useEffect(() => {
    if (phase !== "drill") return;
    const onKey = (e) => {
      if (answered) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); nextHand(); }
        return;
      }
      const n = parseInt(e.key, 10);
      if (n >= 1 && cur) {
        const btns = chartActions(cur.chart);
        if (btns[n - 1]) answer(btns[n - 1]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, answered, cur, nextHand]);

  if (phase === "select") {
    return (
      <ScenarioSelect
        opts={opts} sel={sel} toggle={toggle} clear={() => setSel(emptySel())}
        matching={matching} playableOnly={playableOnly} setPlayableOnly={setPlayableOnly}
        start={start}
      />
    );
  }

  return (
    <DrillView
      cur={cur} answered={answered} picked={picked} stats={stats}
      onAnswer={answer} onNext={() => nextHand()} onBack={() => setPhase("select")}
      poolCount={pool.length}
    />
  );
}

// ---------------------------------------------------------------------------
function ScenarioSelect({ opts, sel, toggle, clear, matching, playableOnly, setPlayableOnly, start }) {
  const dims = [
    { key: "stacks", label: "Stack depth", vals: opts.stacks, render: (v) => `${v}bb` },
    { key: "pots", label: "Pot type", vals: opts.pots, render: (v) => potLabel(v) },
    { key: "heroes", label: "Hero position", vals: opts.heroes, render: (v) => v },
    { key: "villains", label: "Villain position", vals: opts.villains, render: (v) => (v === null ? "(none / RFI)" : v) },
  ];
  const anySel = ["stacks", "pots", "heroes", "villains"].some((k) => sel[k].size);

  return (
    <div>
      <h2 style={{ fontFamily: F.display, fontSize: 16, color: C.text, letterSpacing: "0.04em", marginBottom: 4 }}>
        Choose what to drill
      </h2>
      <p style={{ fontFamily: F.body, fontSize: 11, color: C.textDim, marginBottom: 20 }}>
        Pick any combination. Leave a row untouched to include all of it.
      </p>

      {dims.map((d) => (
        <div key={d.key} style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: F.body, fontSize: 9, color: C.textDim, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
            {d.label}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {d.vals.map((v) => {
              const on = sel[d.key].has(v);
              return (
                <button key={String(v)} onClick={() => toggle(d.key, v)} style={{
                  padding: "7px 13px", fontFamily: F.body, fontSize: 12, fontWeight: 600,
                  borderRadius: 20, cursor: "pointer", transition: "all 0.15s",
                  border: `1px solid ${on ? C.gold : C.border}`,
                  background: on ? `${C.gold}1a` : C.card,
                  color: on ? C.goldBright : C.textSoft,
                }}>{d.render(v)}</button>
              );
            })}
          </div>
        </div>
      ))}

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 24, flexWrap: "wrap" }}>
        <button onClick={start} disabled={!matching.length} style={{
          padding: "12px 28px", fontFamily: F.body, fontSize: 13, fontWeight: 700,
          letterSpacing: "0.08em", textTransform: "uppercase", borderRadius: 5, border: "none",
          background: matching.length ? C.gold : C.border, color: matching.length ? "#0a0a0a" : C.textDim,
          cursor: matching.length ? "pointer" : "default",
        }}>Start Drilling</button>
        <span style={{ fontFamily: F.body, fontSize: 12, color: C.textSoft }}>
          {matching.length} scenario{matching.length === 1 ? "" : "s"} selected
        </span>
        {anySel && (
          <button onClick={clear} style={{ background: "none", border: "none", color: C.textDim, cursor: "pointer", fontFamily: F.body, fontSize: 11 }}>
            clear
          </button>
        )}
        <label style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 7, fontFamily: F.body, fontSize: 11, color: C.textSoft, cursor: "pointer" }}>
          <input type="checkbox" checked={playableOnly} onChange={(e) => setPlayableOnly(e.target.checked)} />
          Drill playable hands only
        </label>
      </div>

      {!!matching.length && (
        <div style={{ marginTop: 24, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
          <div style={{ fontFamily: F.body, fontSize: 9, color: C.textDim, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
            In rotation
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {matching.slice(0, 40).map((c) => (
              <span key={c.file} style={{ fontFamily: F.body, fontSize: 10.5, color: C.textSoft, background: C.card, border: `1px solid ${C.border}`, borderRadius: 4, padding: "3px 8px" }}>
                {situationText(c.situation)}
              </span>
            ))}
            {matching.length > 40 && <span style={{ fontFamily: F.body, fontSize: 10.5, color: C.textDim, padding: "3px 8px" }}>+{matching.length - 40} more</span>}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
function DrillView({ cur, answered, picked, stats, onAnswer, onNext, onBack, poolCount }) {
  if (!cur) return null;
  const { chart, hand } = cur;
  const actions = chart.range[hand];
  const p = parseHand(hand);
  const buttons = chartActions(chart);
  const isCorrect = (a) => (actions[a] || 0) > 0;
  const mixed = nonFoldActions(actions).length + (actions.fold ? 1 : 0) > 1;
  const acc = stats.n ? Math.round((stats.correct / stats.n) * 100) : null;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <button onClick={onBack} style={{ background: "none", border: `1px solid ${C.border}`, color: C.textDim, cursor: "pointer", fontFamily: F.body, fontSize: 10, borderRadius: 4, padding: "5px 10px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          ‹ Change scenario
        </button>
        <div style={{ display: "flex", gap: 18, fontFamily: F.body }}>
          <Stat label="Acc" value={acc === null ? "–" : acc + "%"} />
          <Stat label="Hands" value={stats.n} />
          <Stat label="Streak" value={stats.streak} />
        </div>
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24 }}>
        <PokerTable situation={chart.situation} hand={hand} />
        <div style={{ textAlign: "center", fontFamily: F.body, fontSize: 13, color: C.text, letterSpacing: "1px", fontWeight: 600, margin: "6px 0 18px" }}>
          {hand} <span style={{ color: C.textDim, fontWeight: 400, fontSize: 11, textTransform: "uppercase" }}>· {p.type}</span>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          {buttons.map((a, i) => {
            let bg = C.card, bord = C.border, col = C.text, opacity = 1;
            if (answered) {
              if (isCorrect(a)) { bg = `${C.green}22`; bord = C.green; col = "#7fe0a0"; }
              else if (a === picked) { bg = `${C.red}22`; bord = C.red; col = "#f0928c"; }
              else opacity = 0.4;
            }
            return (
              <button key={a} onClick={() => onAnswer(a)} disabled={answered} style={{
                flex: "1 1 0", minWidth: 100, padding: "14px 10px", borderRadius: 10,
                border: `1px solid ${bord}`, background: bg, color: col, opacity,
                fontFamily: F.body, fontSize: 14, fontWeight: 600, cursor: answered ? "default" : "pointer",
                position: "relative", borderLeft: `3px solid ${actionColor(a)}`,
              }}>
                <span style={{ position: "absolute", top: 5, left: 7, fontSize: 9, color: C.textDim, fontWeight: 500 }}>{i + 1}</span>
                {actionLabel(a)}
              </button>
            );
          })}
        </div>

        {answered && (
          <>
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <div style={{ fontFamily: F.body, fontSize: 16, fontWeight: 700, color: isCorrect(picked) ? C.green : C.red }}>
                {isCorrect(picked) ? "✓ Correct" : "✗ Not quite"}
              </div>
              <div style={{ fontFamily: F.body, fontSize: 12.5, color: C.textSoft, marginTop: 4 }}>
                {hand}: {Object.entries(actions).sort((a, b) => b[1] - a[1]).map(([a, f]) => `${actionLabel(a)} ${Math.round(f * 100)}%`).join(" / ")}
                {mixed && <span style={{ color: C.gold }}> (mix — either counts)</span>}
              </div>
            </div>
            <div style={{ textAlign: "center", marginTop: 14 }}>
              <button onClick={onNext} style={{
                padding: "11px 26px", borderRadius: 8, border: "none", background: C.gold,
                color: "#0a0a0a", fontFamily: F.body, fontWeight: 700, fontSize: 13, cursor: "pointer",
              }}>Next hand ▸</button>
            </div>
          </>
        )}
      </div>
      <p style={{ textAlign: "center", fontFamily: F.body, fontSize: 10, color: C.textDim, marginTop: 12 }}>
        Drilling {poolCount} scenario{poolCount === 1 ? "" : "s"} · press number keys to answer, space for next
      </p>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ textAlign: "right" }}>
      <div style={{ fontSize: 18, color: C.text, lineHeight: 1.1, fontVariantNumeric: "tabular-nums" }}>{value}</div>
      <div style={{ fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
    </div>
  );
}
