// OnboardingPage.jsx — choose a display name on first login
import { useState } from "react";
import { supabase } from "./supabaseClient";
import { C, F } from "./styles";

export default function OnboardingPage({ session, onDone, onSignOut }) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const name = username.trim();
    if (name.length < 2) { setError("Pick a name with at least 2 characters."); return; }
    setError(""); setLoading(true);
    const { error } = await supabase.from("profiles").insert({ id: session.user.id, username: name });
    setLoading(false);
    if (error) {
      setError(error.code === "23505" ? "That name is taken — try another." : error.message);
      return;
    }
    onDone();
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, padding: 16 }}>
      <div style={{ width: 360, maxWidth: "100%" }}>
        <h1 style={{ fontFamily: F.display, fontSize: 20, color: C.text, textAlign: "center", marginBottom: 8, letterSpacing: "0.05em" }}>
          Choose your name
        </h1>
        <p style={{ fontFamily: F.body, fontSize: 11, color: C.textDim, textAlign: "center", marginBottom: 24 }}>
          This is how you'll appear on the leaderboard.
        </p>
        <form onSubmit={submit} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 28 }}>
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus
            placeholder="e.g. corey" maxLength={20} style={{
              width: "100%", padding: "10px 12px", fontSize: 14, fontFamily: F.body,
              background: C.card, border: `1px solid ${C.border}`, borderRadius: 4,
              color: C.text, outline: "none", marginBottom: 16,
            }}
            onFocus={(e) => (e.target.style.borderColor = C.gold)}
            onBlur={(e) => (e.target.style.borderColor = C.border)} />
          {error && <div style={{ fontFamily: F.body, fontSize: 11, color: C.red, marginBottom: 12 }}>{error}</div>}
          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "11px", fontSize: 12, fontFamily: F.body, fontWeight: 700,
            letterSpacing: "0.08em", textTransform: "uppercase", background: C.gold, color: "#0a0a0a",
            border: "none", borderRadius: 4, cursor: loading ? "wait" : "pointer", opacity: loading ? 0.6 : 1,
          }}>{loading ? "..." : "Start Training"}</button>
        </form>
        <div style={{ textAlign: "center", marginTop: 14 }}>
          <button onClick={onSignOut} style={{ background: "none", border: "none", color: C.textDim, cursor: "pointer", fontFamily: F.body, fontSize: 10 }}>
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
