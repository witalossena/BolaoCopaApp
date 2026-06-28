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
  const specialsDebounceRef = useRef(null);

  const [view, setView]             = useState(saved.view || "landing");
  const [user, setUser]             = useState(localStorage.getItem('token') ? authService.getCurrentUser() : null);

  useEffect(() => {
    const handle = () => { setUser(null); setView("landing"); };
    window.addEventListener('auth:logout', handle);
    return () => window.removeEventListener('auth:logout', handle);
  }, []);
  const [scores, setScores]         = useState({});
  const [ranks, setRanks]           = useState({});
  const [specials, setSpecials]     = useState({});
  const [adminUsers, setAdminUsers] = useState(null);
  const [realRanking, setRealRanking] = useState([]);
  const [matchStatuses, setMatchStatuses] = useState({});
  const [matchIdMap, setMatchIdMap] = useState({});
  const [knockoutMatches, setKnockoutMatches] = useState([]);
  const [koWinners, setKoWinners] = useState({});
  const [koScores, setKoScores] = useState({});
  const [koResolutions, setKoResolutions] = useState({});
  const [thirds, setThirds] = useState({});
  const [tournamentPhase, setTournamentPhase] = useState(null);
  const [arePredictionsLocked, setArePredictionsLocked] = useState(false);
  const [prizePool, setPrizePool] = useState(0);

  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify({ view }));
  }, [view]);

  useEffect(() => {
    tournamentService.getInfo().then(d => {
      setTournamentPhase(d.phase);
      setPrizePool(d.prizePool ?? 0);
      setArePredictionsLocked(d.arePredictionsLocked ?? false);
    }).catch(() => {});
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
      const koMatches = [];
      data.forEach(m => {
        if (m.externalId) {
          statuses[m.externalId] = m.status.toLowerCase();
          idMap[m.externalId] = m.id;
          if (m.externalId.startsWith('ko_')) {
            koMatches.push({ externalId: m.externalId, id: m.id, homeTeam: m.homeTeam, awayTeam: m.awayTeam, matchDate: m.matchDate, status: m.status.toLowerCase() });
          }
        }
      });
      setMatchStatuses(statuses);
      setMatchIdMap(idMap);
      setKnockoutMatches(koMatches);
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
        setThirds(prev => {
          const merged = { ...prev };
          data.groupRanks.forEach(g => {
            if (g.thirdTeam) merged[g.group] = g.thirdTeam;
          });
          return merged;
        });
      }
      if (data.knockoutPredictions?.length > 0) {
        const winnerMap = {};
        const scoreMap = {};
        const resolutionMap = {};
        const etScoreMap = {};
        data.knockoutPredictions.forEach(({ externalId, winnerTeam, homeScore, awayScore, resolution }) => {
          const key = externalIdToWinnerKey(externalId);
          if (key) {
            winnerMap[key] = winnerTeam;
            if (homeScore != null && awayScore != null)
              scoreMap[key] = { h: String(homeScore), a: String(awayScore) };
            if (resolution) resolutionMap[key] = resolution;
          }
        });
        setKoWinners(prev => ({ ...prev, ...winnerMap }));
        setKoScores(prev => ({ ...prev, ...scoreMap }));
        setKoResolutions(prev => ({ ...prev, ...resolutionMap }));
      }
      if (data.specials) {
        setSpecials({
          campeao: data.specials.champion || '',
          vice: data.specials.runnerUp || '',
          terceiro: data.specials.thirdPlace || '',
          artilheiro: data.specials.topScorer || '',
          assist: data.specials.mostAssists || '',
          mvp: data.specials.mvp || '',
          goldenboy: data.specials.goldenBoy || '',
        });
      }
    }).catch(() => {});
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    if (tournamentPhase !== "GroupStage" || arePredictionsLocked) return;
    const hasAny = Object.values(specials).some(v => v && v.trim());
    if (!hasAny) return;
    if (specialsDebounceRef.current) clearTimeout(specialsDebounceRef.current);
    specialsDebounceRef.current = setTimeout(() => {
      predictionService.submitSpecialPrediction({
        champion: specials.campeao || null,
        runnerUp: specials.vice || null,
        thirdPlace: specials.terceiro || null,
        otherFinalist: null,
        topScorer: specials.artilheiro || null,
        mostAssists: specials.assist || null,
        mvp: specials.mvp || null,
        goldenBoy: specials.goldenboy || null,
      }).catch(err => console.error('Failed to save specials:', err));
    }, 800);
  }, [specials, user, tournamentPhase]);


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
    setKoResolutions({});
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

  const togglePredictionUnlock = async (target) => {
    try {
      const newStatus = !target.isPredictionUnlocked;
      await adminService.toggleUserPredictionUnlock(target.id, newStatus);
      setAdminUsers(prev => prev.map(u =>
        u.id === target.id ? { ...u, isPredictionUnlocked: newStatus } : u
      ));
      if (user?.id === target.id) {
        setUser(u => ({ ...u, isPredictionUnlocked: newStatus }));
      }
    } catch (err) {
      console.error("Failed to toggle prediction unlock:", err);
    }
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
          <Ranking ranking={realRanking} currentUser={{ handle: "__none__" }} prizePool={prizePool} />
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
    case "palpites":   screen = <Palpites scores={scores} setScore={setScore} ranks={ranks} setRank={setRank} matchStatuses={matchStatuses} matchIdMap={matchIdMap} locked={(arePredictionsLocked || tournamentPhase !== "GroupStage") && !user?.isPredictionUnlocked} />; break;
    case "especiais":  screen = <Especiais specials={specials} setSpecial={setSpecial} koWinners={koWinners} locked={arePredictionsLocked || tournamentPhase !== "GroupStage"} />; break;
    case "matamata":   screen = <MataMata ranks={ranks} matchIdMap={matchIdMap} knockoutMatches={knockoutMatches} winners={koWinners} setWinners={setKoWinners} koScores={koScores} setKoScores={setKoScores} koResolutions={koResolutions} setKoResolutions={setKoResolutions} thirds={thirds} setThirds={setThirds} tournamentPhase={tournamentPhase} onReset={() => { setSpecials(s => { const n = {...s}; delete n.campeao; delete n.vice; return n; }); setKoScores({}); setKoResolutions({}); }} locked={arePredictionsLocked} />; break;
    case "ranking":    screen = <Ranking ranking={ranking} currentUser={user} prizePool={prizePool} />; break;
    case "desempenho": screen = <Desempenho user={user} ranking={ranking} setView={setView} onClearAll={handleClearAll} specials={specials} locked={arePredictionsLocked || Object.values(matchStatuses).some(s => s !== "open")} />; break;
    case "regras":     screen = <Regras />; break;
    case "admin":      screen = <Admin allUsers={adminUsers || [user]} ranking={ranking} togglePaid={togglePaid} togglePredictionUnlock={togglePredictionUnlock} tournamentPhase={tournamentPhase} setTournamentPhase={setTournamentPhase} arePredictionsLocked={arePredictionsLocked} setArePredictionsLocked={setArePredictionsLocked} prizePool={prizePool} setPrizePool={setPrizePool} />; break;
    default:           screen = <Palpites scores={scores} setScore={setScore} ranks={ranks} setRank={setRank} />;
  }

  return (
    <AppShell user={userForShell} view={view} setView={setView} onLogout={logout}>
      {screen}
    </AppShell>
  );
}

