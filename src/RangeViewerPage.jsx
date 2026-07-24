// RangeViewerPage.jsx — study ranges before drilling.
import { useState, useMemo } from "react";
import { C, F } from "./styles";
import RangeGrid from "./RangeGrid";
import { dimensionOptions, filterCharts, situationText, potLabel, posRank } from "./poker";

const emptySel = () => ({ stacks: new Set(), pots: new Set(), heroes: new Set(), villains: new Set() });

export default function RangeViewerPage({ charts }) {
  const [sel, setSel] = useState(emptySel);
  const [openFile, setOpenFile] = useState(charts[0]?.file || null);

  const opts = useMemo(() => dimensionOptions(charts), [charts]);
  const matching = useMemo(() => {
    const m = filterCharts(charts, sel);
    return [...m].sort((a, b) => {
      const s = a.situation, t = b.situation;
      return s.stack_depth_bb - t.stack_depth_bb || posRank(s.hero_position) - posRank(t.hero_position)
        || s.action_type.localeCompare(t.action_type);
    });
  }, [charts, sel]);

  const active = charts.find((c) => c.file === openFile) || matching[0] || charts[0];

  const toggle = (dim, val) => setSel((s) => {
    const next = { ...s, [dim]: new Set(s[dim]) };
    next[dim].has(val) ? next[dim].delete(val) : next[dim].add(val);
    return next;
  });

  const dims = [
    { key: "stacks", label: "Stack", vals: opts.stacks, render: (v) => `${v}bb` },
    { key: "pots", label: "Pot type", vals: opts.pots, render: (v) => potLabel(v) },
    { key: "heroes", label: "Hero", vals: opts.heroes, render: (v) => v },
    { key: "villains", label: "Villain", vals: opts.villains, render: (v) => (v === null ? "(RFI)" : v) },
  ];

  return (
    <div>
      <h2 style={{ fontFamily: F.display, fontSize: 16, color: C.text, letterSpacing: "0.04em", marginBottom: 4 }}>Study ranges</h2>
      <p style={{ fontFamily: F.body, fontSize: 11, color: C.textDim, marginBottom: 18 }}>
        Browse the solved ranges before you drill them.
      </p>

      {/* filters */}
      {dims.map((d) => (
        <div key={d.key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
          <span style={{ width: 66, fontFamily: F.body, fontSize: 9, color: C.textDim, letterSpacing: "0.1em", textTransform: "uppercase" }}>{d.label}</span>
          {d.vals.map((v) => {
            const on = sel[d.key].has(v);
            return (
              <button key={String(v)} onClick={() => toggle(d.key, v)} style={{
                padding: "5px 11px", fontFamily: F.body, fontSize: 11.5, fontWeight: 600, borderRadius: 16, cursor: "pointer",
                border: `1px solid ${on ? C.gold : C.border}`, background: on ? `${C.gold}1a` : C.card,
                color: on ? C.goldBright : C.textSoft,
              }}>{d.render(v)}</button>
            );
          })}
        </div>
      ))}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 20, marginTop: 20 }}>
        {/* scenario list */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {matching.map((c) => {
            const on = active && c.file === active.file;
            return (
              <button key={c.file} onClick={() => setOpenFile(c.file)} style={{
                padding: "6px 10px", fontFamily: F.body, fontSize: 11, borderRadius: 5, cursor: "pointer",
                border: `1px solid ${on ? C.gold : C.border}`, background: on ? `${C.gold}1a` : "transparent",
                color: on ? C.goldBright : C.textSoft,
              }}>{situationText(c.situation)}</button>
            );
          })}
        </div>

        {/* selected chart */}
        {active && (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18 }}>
            <div style={{ fontFamily: F.body, fontSize: 13, color: C.text, fontWeight: 600, marginBottom: 14 }}>
              {situationText(active.situation)}
            </div>
            <RangeGrid chart={active} />
          </div>
        )}
      </div>
    </div>
  );
}
