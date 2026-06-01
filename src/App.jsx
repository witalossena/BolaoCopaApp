import { useState, useRef, useMemo, useEffect } from 'react';
import { MOCK_USERS } from './data';
import { AppShell } from './components/AppShell';
import { Landing, PublicShell } from './screens/Landing';
import { AuthScreen } from './screens/AuthScreen';
import { Regras } from './screens/Regras';
import { Palpites } from './screens/Palpites';
import { Especiais } from './screens/Especiais';
import { MataMata } from './screens/MataMata';
import { Ranking } from './screens/Ranking';
import { Desempenho } from './screens/Desempenho';
import { Admin } from './screens/Admin';

const STORE_KEY = "bolao2026_v1";

function loadStore() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
  catch { return {}; }
}

function buildRanking(users) {
  return [...users].sort((a, b) => (b.groupPts + b.awardPts) - (a.groupPts + a.awardPts));
}

function idOf(u) { return u.handle || u.user; }

export default function App() {
  const saved = useRef(loadStore()).current;

  const [view, setView]             = useState(saved.view || "landing");
  const [user, setUser]             = useState(saved.user || null);
  const [scores, setScores]         = useState(saved.scores || {});
  const [ranks, setRanks]           = useState(saved.ranks || {});
  const [specials, setSpecials]     = useState(saved.specials || {});
  const [adminUsers, setAdminUsers] = useState(saved.adminUsers || null);

  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify({ view, user, scores, ranks, specials, adminUsers }));
  }, [view, user, scores, ranks, specials, adminUsers]);

  const setScore = (id, side, val) => {
    const clean = val === "" ? "" : String(Math.max(0, Math.min(20, parseInt(val, 10) || 0)));
    setScores(s => ({ ...s, [id]: { ...(s[id] || {}), [side]: clean } }));
  };
  const setRank = (g, key, val) => setRanks(r => ({ ...r, [g]: { ...(r[g] || {}), [key]: val } }));
  const setSpecial = (key, val) => setSpecials(s => ({ ...s, [key]: val }));

  const handleAuth = (base) => {
    const u = {
      name: base.name, handle: base.handle, email: base.email,
      paid: false,
      groupPts: 120, awardPts: 70, exact: 24, exactRate: 34,
    };
    u.totalPts = u.groupPts + u.awardPts;
    setUser(u);
    setAdminUsers([...MOCK_USERS, u]);
    setView("palpites");
  };

  const logout = () => { setUser(null); setView("landing"); };

  const togglePaid = (target) => {
    setAdminUsers(list => (list || []).map(u =>
      idOf(u) === idOf(target) ? { ...u, paid: !u.paid } : u));
    if (user && idOf(user) === idOf(target)) setUser(u => ({ ...u, paid: !u.paid }));
  };

  const ranking = useMemo(() => {
    const base = adminUsers || (user ? [...MOCK_USERS, user] : MOCK_USERS);
    return buildRanking(base);
  }, [adminUsers, user]);

  if (!user) {
    if (view === "auth") return <AuthScreen onAuth={handleAuth} go={setView} />;
    if (view === "pub_ranking")
      return (
        <PublicShell active="pub_ranking" go={setView}>
          <Ranking ranking={buildRanking(MOCK_USERS)} currentUser={{ handle: "__none__" }} />
        </PublicShell>
      );
    if (view === "pub_regras")
      return (
        <PublicShell active="pub_regras" go={setView}>
          <Regras />
        </PublicShell>
      );
    return <Landing go={setView} />;
  }

  const userForShell = { ...user, handle: user.handle, totalPts: user.groupPts + user.awardPts };

  let screen = null;
  switch (view) {
    case "palpites":   screen = <Palpites scores={scores} setScore={setScore} ranks={ranks} setRank={setRank} />; break;
    case "especiais":  screen = <Especiais specials={specials} setSpecial={setSpecial} />; break;
    case "matamata":   screen = <MataMata />; break;
    case "ranking":    screen = <Ranking ranking={ranking} currentUser={user} />; break;
    case "desempenho": screen = <Desempenho user={user} ranking={ranking} setView={setView} />; break;
    case "regras":     screen = <Regras />; break;
    case "admin":      screen = <Admin allUsers={adminUsers || [...MOCK_USERS, user]} togglePaid={togglePaid} />; break;
    default:           screen = <Palpites scores={scores} setScore={setScore} ranks={ranks} setRank={setRank} />;
  }

  return (
    <AppShell user={userForShell} view={view} setView={setView} onLogout={logout}>
      {screen}
    </AppShell>
  );
}
