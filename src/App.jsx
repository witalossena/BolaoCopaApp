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
import { rankingService, authService, adminService, matchService } from './services/api';

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
  const [matchStatuses, setMatchStatuses] = useState({});

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

  useEffect(() => {
    if (!user) return;
    matchService.getMatches().then(data => {
      const statuses = {};
      data.forEach(m => { if (m.externalId) statuses[m.externalId] = m.status.toLowerCase(); });
      setMatchStatuses(statuses);
    }).catch(() => {});
  }, [view]);

  useEffect(() => {
    if (view === "admin") {
      const fetchAdminUsers = async () => {
        try {
          const data = await adminService.getUsers();
          setAdminUsers(data);
        } catch (err) {
          console.error("Failed to fetch admin users:", err);
        }
      };
      fetchAdminUsers();
    }
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

  const refreshProfile = async () => {
    try {
      const updatedUser = await authService.getProfile();
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      console.error("Failed to refresh profile:", err);
    }
  };

  const logout = () => { 
    authService.logout();
    setUser(null); 
    setView("landing"); 
  };

  const togglePaid = async (target) => {
    try {
      const newStatus = !target.isPaid;
      await adminService.togglePayment(target.id, newStatus);
      
      // Update local state
      setAdminUsers(prev => prev.map(u => 
        u.id === target.id ? { ...u, isPaid: newStatus } : u
      ));

      if (user && user.id === target.id) {
        setUser(u => ({ ...u, isPaid: newStatus }));
      }
    } catch (err) {
      console.error("Failed to toggle payment:", err);
    }
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
    case "palpites":   screen = <Palpites scores={scores} setScore={setScore} ranks={ranks} setRank={setRank} matchStatuses={matchStatuses} />; break;
    case "especiais":  screen = <Especiais specials={specials} setSpecial={setSpecial} />; break;
    case "matamata":   screen = <MataMata ranks={ranks} />; break;
    case "ranking":    screen = <Ranking ranking={ranking} currentUser={user} />; break;
    case "desempenho": screen = <Desempenho user={user} ranking={ranking} setView={setView} refreshProfile={refreshProfile} />; break;
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

