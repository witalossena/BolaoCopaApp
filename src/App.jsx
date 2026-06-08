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
import { rankingService, authService, adminService, matchService, predictionService, tournamentService } from './services/api';

const STORE_KEY = "bolao2026_v1";

function externalIdToWinnerKey(externalId) {
  if (!externalId) return null;
  const r32 = externalId.match(/^ko_r32_(\d+)$/);
  if (r32) return `0-${r32[1]}`;
  const r16 = externalId.match(/^ko_r16_(\d+)$/);
  if (r16) return `1-${r16[1]}`;
  const qf = externalId.match(/^ko_qf_(\d+)$/);
  if (qf) return `2-${qf[1]}`;
  const sf = externalId.match(/^ko_sf_(\d+)$/);
  if (sf) return `3-${sf[1]}`;
  if (externalId === 'ko_final') return '4-0';
  return null;
}

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
  const [user, setUser]             = useState(localStorage.getItem('token') ? (saved.user || authService.getCurrentUser()) : null);

  useEffect(() => {
    const handle = () => { setUser(null); setView("landing"); };
    window.addEventListener('auth:logout', handle);
    return () => window.removeEventListener('auth:logout', handle);
  }, []);
  const [scores, setScores]         = useState(saved.scores || {});
  const [ranks, setRanks]           = useState(saved.ranks || {});
  const [specials, setSpecials]     = useState(saved.specials || {});
  const [adminUsers, setAdminUsers] = useState(saved.adminUsers || null);
  const [realRanking, setRealRanking] = useState([]);
  const [matchStatuses, setMatchStatuses] = useState({});
  const [matchIdMap, setMatchIdMap] = useState({});
  const [koWinners, setKoWinners] = useState(saved.koWinners || {});
  const [koScores, setKoScores] = useState(saved.koScores || {});
  const [thirds, setThirds] = useState(saved.thirds || {});
  const [tournamentPhase, setTournamentPhase] = useState("GroupStage");

  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify({ view, user, scores, ranks, specials, adminUsers, thirds, koWinners, koScores }));
  }, [view, user, scores, ranks, specials, adminUsers, thirds, koWinners, koScores]);

  useEffect(() => {
    tournamentService.getPhase().then(setTournamentPhase).catch(() => {});
  }, []);

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
      const idMap = {};
      data.forEach(m => {
        if (m.externalId) {
          statuses[m.externalId] = m.status.toLowerCase();
          idMap[m.externalId] = m.id;
        }
      });
      setMatchStatuses(statuses);
      setMatchIdMap(idMap);
    }).catch(() => {});
  }, [view]);

  useEffect(() => {
    if (!user) return;
    predictionService.getUserPredictions().then(data => {
      if (data.matchPredictions?.length > 0) {
        setScores(prev => {
          const merged = { ...prev };
          data.matchPredictions.forEach(p => {
            merged[p.externalId] = { h: String(p.homeScore), a: String(p.awayScore) };
          });
          return merged;
        });
      }
      if (data.groupRanks?.length > 0) {
        setRanks(prev => {
          const merged = { ...prev };
          data.groupRanks.forEach(g => {
            merged[g.group] = { first: g.firstTeam, second: g.secondTeam, third: g.thirdTeam, fourth: g.fourthTeam };
          });
          return merged;
        });
      }
      if (data.knockoutPredictions?.length > 0) {
        const winnerMap = {};
        const scoreMap = {};
        data.knockoutPredictions.forEach(({ externalId, winnerTeam, homeScore, awayScore }) => {
          const key = externalIdToWinnerKey(externalId);
          if (key) {
            winnerMap[key] = winnerTeam;
            if (homeScore != null && awayScore != null)
              scoreMap[key] = { h: String(homeScore), a: String(awayScore) };
          }
        });
        setKoWinners(prev => ({ ...prev, ...winnerMap }));
        setKoScores(prev => ({ ...prev, ...scoreMap }));
      }
    }).catch(() => {});
  }, [user?.id]);

  // Sync bracket picks → specials for derivable team fields
  useEffect(() => {
    const champion = koWinners["4-0"];
    const sf0Winner = koWinners["3-0"];
    const sf1Winner = koWinners["3-1"];
    if (champion) setSpecials(s => ({ ...s, campeao: champion }));
    if (sf0Winner && sf1Winner) {
      const vice = champion === sf0Winner ? sf1Winner : sf0Winner;
      setSpecials(s => ({ ...s, vice }));
    }
  }, [koWinners["4-0"], koWinners["3-0"], koWinners["3-1"]]);

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

  const handleClearAll = async () => {
    await predictionService.clearAllPredictions();
    setScores({});
    setRanks({});
    setSpecials({});
    setKoWinners({});
    setKoScores({});
    setThirds({});
  };

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
    localStorage.removeItem(STORE_KEY);
    setUser(null);
    setKoWinners({});
    setKoScores({});
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
    case "palpites":   screen = <Palpites scores={scores} setScore={setScore} ranks={ranks} setRank={setRank} matchStatuses={matchStatuses} matchIdMap={matchIdMap} />; break;
    case "especiais":  screen = <Especiais specials={specials} setSpecial={setSpecial} koWinners={koWinners} />; break;
    case "matamata":   screen = <MataMata ranks={ranks} matchIdMap={matchIdMap} winners={koWinners} setWinners={setKoWinners} koScores={koScores} setKoScores={setKoScores} thirds={thirds} setThirds={setThirds} tournamentPhase={tournamentPhase} onReset={() => { setSpecials(s => { const n = {...s}; delete n.campeao; delete n.vice; return n; }); setKoScores({}); }} />; break;
    case "ranking":    screen = <Ranking ranking={ranking} currentUser={user} />; break;
    case "desempenho": screen = <Desempenho user={user} ranking={ranking} setView={setView} refreshProfile={refreshProfile} onClearAll={handleClearAll} />; break;
    case "regras":     screen = <Regras />; break;
    case "admin":      screen = <Admin allUsers={adminUsers || [user]} togglePaid={togglePaid} tournamentPhase={tournamentPhase} setTournamentPhase={setTournamentPhase} />; break;
    default:           screen = <Palpites scores={scores} setScore={setScore} ranks={ranks} setRank={setRank} />;
  }

  return (
    <AppShell user={userForShell} view={view} setView={setView} onLogout={logout}>
      {screen}
    </AppShell>
  );
}

