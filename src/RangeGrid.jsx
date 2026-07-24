// RangeGrid.jsx — 13x13 range chart colored by action, with a legend.
import { C, F } from "./styles";
import { cellHand, actionColor, actionLabel, chartActions } from "./poker";

function cellBackground(actions) {
  const entries = Object.entries(actions).filter(([, f]) => f > 0).sort((a, b) => b[1] - a[1]);
  if (!entries.length) return actionColor("fold");
  if (entries.length === 1) return actionColor(entries[0][0]);
  const [a1, a2] = entries;
  // 50/50 split cell
  return `linear-gradient(135deg, ${actionColor(a1[0])} 0 50%, ${actionColor(a2[0])} 50% 100%)`;
}

export default function RangeGrid({ chart }) {
  const legend = chartActions(chart);
  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <div style={{
          minWidth: 460, display: "grid", gridTemplateColumns: "repeat(13, 1fr)", gap: 2,
        }}>
          {Array.from({ length: 13 }).map((_, r) =>
            Array.from({ length: 13 }).map((__, c) => {
              const hand = cellHand(r, c);
              const actions = chart.range[hand] || { fold: 1 };
              return (
                <div key={hand} title={`${hand}: ${Object.entries(actions).map(([a, f]) => `${actionLabel(a)} ${Math.round(f * 100)}%`).join(", ")}`}
                  style={{
                    aspectRatio: "1 / 1", background: cellBackground(actions), borderRadius: 2,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: F.body, fontSize: 9.5, fontWeight: 600, color: "#f7f6f1",
                    textShadow: "0 1px 2px rgba(0,0,0,.6)", userSelect: "none",
                  }}>
                  {hand}
                </div>
              );
            })
          )}
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 14 }}>
        {legend.map((a) => (
          <div key={a} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 13, height: 13, borderRadius: 3, background: actionColor(a), display: "inline-block" }} />
            <span style={{ fontFamily: F.body, fontSize: 11, color: C.textSoft }}>{actionLabel(a)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
