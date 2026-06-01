import { useState, useRef, useMemo, useEffect } from 'react';
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
import { rankingService, authService } from './services/api';

const STORE_KEY = "bolao2026_v1";

function loadStore() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
  catch { return {}; }
}

function buildRanking(users) {
  if (!users) return [];
  return [...users].sort((a, b) => (b.total || 0) - (a.total || 0));
}

function idOf(u) { return u.handle || u.user; }

export default function App() {
  const saved = useRef(loadStore()).current;

  const [view, setView]             = useState(saved.view || "landing");
  const [user, setUser]             = useState(saved.user || authService.getCurrentUser());
  const [scores, setScores]         = useState(saved.scores || {});
  const [ranks, setRanks]           = useState(saved.ranks || {});
  const [specials, setSpecials]     = useState(saved.specials || {});
  const [adminUsers, setAdminUsers] = useState(saved.adminUsers || null);
  const [realRanking, setRealRanking] = useState([]);

  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify({ view, user, scores, ranks, specials, adminUsers }));
  }, [view, user, scores, ranks, specials, adminUsers]);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const data = await rankingService.getRanking();
        setRealRanking(data);
      } catch (err) {
        console.error("Failed to fetch ranking:", err);
      }
    };
    fetchRanking();
  }, [view]);

  const setScore = (id, side, val) => {
    const clean = val === "" ? "" : String(Math.max(0, Math.min(20, parseInt(val, 10) || 0)));
    setScores(s => ({ ...s, [id]: { ...(s[id] || {}), [side]: clean } }));
  };
  const setRank = (g, key, val) => setRanks(r => ({ ...r, [g]: { ...(r[g] || {}), [key]: val } }));
  const setSpecial = (key, val) => setSpecials(s => ({ ...s, [key]: val }));

  const handleAuth = (userData) => {
    setUser(userData);
    setView("palpites");
  };

  const logout = () => { 
    authService.logout();
    setUser(null); 
    setView("landing"); 
  };

  const togglePaid = (target) => {
    // This part might need backend integration later
    if (user && idOf(user) === idOf(target)) setUser(u => ({ ...u, paid: !u.paid }));
  };

  const ranking = useMemo(() => {
    return realRanking;
  }, [realRanking]);

  if (!user) {
    if (view === "auth") return <AuthScreen onAuth={handleAuth} go={setView} />;
    if (view === "pub_ranking")
      return (
        <PublicShell active="pub_ranking" go={setView}>
          <Ranking ranking={realRanking} currentUser={{ handle: "__none__" }} />
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

  const userForShell = { 
    ...user, 
    handle: user.handle, 
    totalPts: user.points?.total || 0 
  };

  let screen = null;
  switch (view) {
    case "palpites":   screen = <Palpites scores={scores} setScore={setScore} ranks={ranks} setRank={setRank} />; break;
    case "especiais":  screen = <Especiais specials={specials} setSpecial={setSpecial} />; break;
    case "matamata":   screen = <MataMata />; break;
    case "ranking":    screen = <Ranking ranking={ranking} currentUser={user} />; break;
    case "desempenho": screen = <Desempenho user={user} ranking={ranking} setView={setView} />; break;
    case "regras":     screen = <Regras />; break;
    case "admin":      screen = <Admin allUsers={adminUsers || [user]} togglePaid={togglePaid} />; break;
    default:           screen = <Palpites scores={scores} setScore={setScore} ranks={ranks} setRank={setRank} />;
  }

  return (
    <AppShell user={userForShell} view={view} setView={setView} onLogout={logout}>
      {screen}
    </AppShell>
  );
}

