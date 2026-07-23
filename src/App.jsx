// App.jsx — auth + profile gate + tab navigation
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { C, F } from "./styles";
import AuthPage from "./AuthPage";
import OnboardingPage from "./OnboardingPage";
import TrainPage from "./TrainPage";
import AnalysisPage from "./AnalysisPage";
import LeaderboardPage from "./LeaderboardPage";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [profileChecked, setProfileChecked] = useState(false);
  const [charts, setCharts] = useState(null);
  const [tab, setTab] = useState("train");

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  // Load profile when session changes
  useEffect(() => {
    if (!session) { setProfile(null); setProfileChecked(false); return; }
    loadProfile();
  }, [session]);

  async function loadProfile() {
    const { data } = await supabase
      .from("profiles").select("*").eq("id", session.user.id).maybeSingle();
    setProfile(data || null);
    setProfileChecked(true);
  }

  // Load range data once
  useEffect(() => {
    fetch("/ranges.json")
      .then((r) => r.json())
      .then(setCharts)
      .catch(() => setCharts([]));
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null); setProfile(null); setProfileChecked(false);
  };

  if (loading) return <Splash text="Loading..." />;
  if (!session) return <AuthPage />;
  if (!profileChecked) return <Splash text="Loading..." />;
  if (!profile) return <OnboardingPage session={session} onDone={loadProfile} onSignOut={signOut} />;

  const tabs = [
    { id: "train", label: "Train" },
    { id: "analysis", label: "My Stats" },
    { id: "leaderboard", label: "Leaderboard" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <div style={{ padding: "16px 20px 0", borderBottom: `1px solid ${C.border}`, background: `linear-gradient(180deg, ${C.surface} 0%, ${C.bg} 100%)` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", maxWidth: 1000, margin: "0 auto" }}>
          <div>
            <h1 style={{
              fontFamily: F.display, fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: "0.06em",
              background: `linear-gradient(135deg, ${C.goldDim}, ${C.goldBright}, ${C.gold})`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>MTT PREFLOP TRAINER</h1>
            <p style={{ fontFamily: F.body, fontSize: 10, color: C.textDim, margin: "2px 0 0" }}>
              {charts ? `${charts.length} scenarios loaded` : "loading ranges..."}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: F.body, fontSize: 11, color: C.gold }}>{profile.username}</span>
            <button onClick={signOut} style={{
              padding: "4px 10px", fontSize: 9, fontFamily: F.body, fontWeight: 600,
              background: "transparent", border: `1px solid ${C.border}`, borderRadius: 3,
              color: C.textDim, cursor: "pointer", letterSpacing: "0.06em", textTransform: "uppercase",
            }}>Sign Out</button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 0, marginTop: 12, maxWidth: 1000, margin: "12px auto 0" }}>
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "9px 16px", fontSize: 10, fontFamily: F.body, fontWeight: 600,
              letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer",
              border: "none", whiteSpace: "nowrap",
              borderBottom: `2px solid ${tab === t.id ? C.gold : "transparent"}`,
              background: "transparent", color: tab === t.id ? C.gold : C.textDim, transition: "all 0.2s",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "22px 20px 60px", maxWidth: 1000, margin: "0 auto" }}>
        {!charts ? <Splash text="Loading ranges..." inline /> : (
          <>
            {tab === "train" && <TrainPage charts={charts} session={session} />}
            {tab === "analysis" && <AnalysisPage session={session} />}
            {tab === "leaderboard" && <LeaderboardPage />}
          </>
        )}
      </div>
    </div>
  );
}

function Splash({ text, inline }) {
  return (
    <div style={{ minHeight: inline ? 200 : "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: inline ? "transparent" : C.bg }}>
      <span style={{ fontFamily: F.body, fontSize: 13, color: C.textDim }}>{text}</span>
    </div>
  );
}
