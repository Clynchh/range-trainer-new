// AuthPage.jsx — Login / Signup
import { useState } from "react";
import { supabase } from "./supabaseClient";
import { C, F } from "./styles";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setMessage(""); setLoading(true);
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMessage("Check your email for a confirmation link, then sign in.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    }
    setLoading(false);
  };

  const inputStyle = {
    width: "100%", padding: "10px 12px", fontSize: 13, fontFamily: F.body,
    background: C.card, border: `1px solid ${C.border}`, borderRadius: 4,
    color: C.text, outline: "none",
  };
  const labelStyle = {
    fontFamily: F.body, fontSize: 9, color: C.textDim, display: "block",
    marginBottom: 4, letterSpacing: "0.1em", textTransform: "uppercase",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, padding: 16 }}>
      <div style={{ width: 360, maxWidth: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{
            fontFamily: F.display, fontSize: 26, fontWeight: 700, margin: "8px 0 0",
            letterSpacing: "0.08em",
            background: `linear-gradient(135deg, ${C.goldDim}, ${C.goldBright}, ${C.gold})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>MTT PREFLOP TRAINER</h1>
          <p style={{ fontFamily: F.body, fontSize: 11, color: C.textDim, marginTop: 4 }}>
            Drill GTO preflop ranges. Climb the leaderboard.
          </p>
        </div>

        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 28 }}>
          <h2 style={{ fontFamily: F.display, fontSize: 16, color: C.text, marginBottom: 20, textAlign: "center", letterSpacing: "0.04em" }}>
            {isSignUp ? "Create Account" : "Sign In"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                required placeholder="you@example.com" style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = C.gold)}
                onBlur={(e) => (e.target.style.borderColor = C.border)} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                required placeholder="••••••••" minLength={6} style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = C.gold)}
                onBlur={(e) => (e.target.style.borderColor = C.border)} />
            </div>
            {error && <div style={{ fontFamily: F.body, fontSize: 11, color: C.red, marginBottom: 12, padding: "8px 10px", background: `${C.red}0c`, borderRadius: 3 }}>{error}</div>}
            {message && <div style={{ fontFamily: F.body, fontSize: 11, color: C.green, marginBottom: 12, padding: "8px 10px", background: `${C.green}0c`, borderRadius: 3 }}>{message}</div>}
            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "11px", fontSize: 12, fontFamily: F.body, fontWeight: 700,
              letterSpacing: "0.08em", textTransform: "uppercase",
              background: C.gold, color: "#0a0a0a", border: "none", borderRadius: 4,
              cursor: loading ? "wait" : "pointer", opacity: loading ? 0.6 : 1, transition: "opacity 0.2s",
            }}>{loading ? "..." : isSignUp ? "Create Account" : "Sign In"}</button>
          </form>
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button onClick={() => { setIsSignUp(!isSignUp); setError(""); setMessage(""); }}
              style={{ background: "none", border: "none", color: C.gold, cursor: "pointer", fontFamily: F.body, fontSize: 11 }}>
              {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
