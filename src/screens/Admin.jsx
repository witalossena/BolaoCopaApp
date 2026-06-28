import { useState, useEffect, useRef } from 'react';
import { TOTAL_MATCHES, GROUP_ORDER, GROUPS, SPECIAL_FIELDS } from '../data';
import { AdminReportLayout } from '../components/AdminReportLayout';
import { AdminCravadosCard } from '../components/AdminCravadosCard';
import { Icon } from '../components/Icon';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { TeamBadge } from '../components/ui/TeamBadge';
import { PageTitle } from '../components/ui/PageTitle';
import { Select } from '../components/ui/Select';
import { matchService, adminService } from '../services/api';
import html2canvas from 'html2canvas';

function AdminTile({ icon, value, label, tone }) {
  const c = tone === "gold" ? "text-gold" : tone === "amber" ? "text-gold-400" : tone === "red" ? "text-danger" : "text-grass-400";
  return (
    <Card className="flex items-center gap-4">
      <span className={`w-11 h-11 rounded-xl grid place-items-center bg-surface2 border border-edge ${c}`}>
        <Icon name={icon} size={22} />
      </span>
      <div>
        <div className="font-display text-3xl text-cream leading-none">{value}</div>
        <div className="font-cond text-mute text-xs tracking-wide mt-1.5">{label}</div>
      </div>
    </Card>
  );
}

function UserPredictionsModal({ user, matches, onClose }) {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminService.getUserPredictions(user.id)
      .then(data => { setPredictions(data); setLoading(false); })
      .catch(() => { setError("Erro ao carregar apostas."); setLoading(false); });
  }, [user.id]);

  const matchMap = Object.fromEntries(matches.map(m => [m.externalId, m]));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-bg/80 backdrop-blur-sm" />
      <div className="relative bg-surface border border-edge rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-card"
        onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-surface border-b border-edge px-5 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-surface2 border border-edge grid place-items-center text-grass-400">
              <Icon name="user" size={16} />
            </div>
            <div>
              <div className="font-display text-lg text-cream leading-tight">{user.name}</div>
              <div className="text-mute2 text-xs font-cond">{user.handle}</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl border border-edge bg-surface2 grid place-items-center text-mute hover:text-cream transition">
            <Icon name="x" size={14} />
          </button>
        </div>

        <div className="p-5 space-y-6 divide-y divide-edge/40">
          {loading && <div className="text-center text-mute2 font-cond py-8">Carregando apostas...</div>}
          {error && <div className="text-center text-danger font-cond py-8">{error}</div>}

          {predictions && (<>
            {predictions.matchPredictions?.length > 0 && (() => {
              const today = new Date().toDateString();
              const todayItems = [];
              const byGroup = {};
              predictions.matchPredictions.forEach(p => {
                const m = matchMap[p.externalId];
                if (m && new Date(m.matchDate).toDateString() === today) {
                  todayItems.push({ p, m });
                } else {
                  const g = m?.group || '?';
                  if (!byGroup[g]) byGroup[g] = [];
                  byGroup[g].push({ p, m });
                }
              });
              const groupKeys = Object.keys(byGroup).sort();

              const PredRow = ({ p, m }) => {
                const hasResult = m?.realHome != null && m?.realAway != null;
                const pointsBadge = hasResult
                  ? <span className={`font-cond text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${(p.points ?? 0) > 0 ? 'bg-grass-400/20 text-grass-400' : 'bg-surface text-mute2'}`}>{p.points ?? 0}pt</span>
                  : null;
                return (
                  <div key={p.externalId} className="flex items-center gap-2 bg-surface2 rounded-xl px-4 py-2.5">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {m && <TeamBadge name={m.homeTeam} showName={false} size="sm" />}
                      <span className="font-cond text-sm text-cream truncate">{m ? m.homeTeam : p.externalId}</span>
                    </div>
                    <span className="font-display text-cream text-sm shrink-0 w-14 text-center">{p.homeScore} × {p.awayScore}</span>
                    <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                      <span className="font-cond text-sm text-cream truncate">{m ? m.awayTeam : ""}</span>
                      {m && <TeamBadge name={m.awayTeam} showName={false} size="sm" />}
                    </div>
                    {pointsBadge}
                  </div>
                );
              };

              return (
                <div className="pt-0">
                  <div className="font-cond font-semibold text-grass-400 text-xs tracking-widest uppercase mb-3">Apostas de Partidas</div>
                  <div className="space-y-4">
                    {todayItems.length > 0 && (
                      <div>
                        <div className="font-cond text-[10px] text-grass-400/70 uppercase tracking-widest mb-1.5 px-1">Jogos de Hoje</div>
                        <div className="space-y-1.5">
                          {todayItems.map(({ p, m }) => <PredRow key={p.externalId} p={p} m={m} />)}
                        </div>
                      </div>
                    )}
                    {groupKeys.map(g => (
                      <div key={g}>
                        <div className="font-cond text-[10px] text-mute2 uppercase tracking-widest mb-1.5 px-1">Grupo {g}</div>
                        <div className="space-y-1.5">
                          {byGroup[g].map(({ p, m }) => <PredRow key={p.externalId} p={p} m={m} />)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {predictions.groupRanks?.length > 0 && (
              <div className="pt-6">
                <div className="font-cond font-semibold text-grass-400 text-xs tracking-widest uppercase mb-3">Classificação de Grupos</div>
                <div className="space-y-1.5">
                  {predictions.groupRanks.map(g => (
                    <div key={g.group} className="bg-surface2 rounded-xl px-4 py-2.5 flex items-start gap-3">
                      <span className="font-display text-cream w-5 shrink-0 mt-0.5">{g.group}</span>
                      <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-0.5">
                        <div className="font-cond text-sm text-cream truncate">1º {g.firstTeam}</div>
                        <div className="font-cond text-sm text-mute2 truncate text-right">2º {g.secondTeam}</div>
                        {(g.thirdTeam || g.fourthTeam) && <>
                          <div className="font-cond text-xs text-mute2 truncate">3º {g.thirdTeam || '–'}</div>
                          <div className="font-cond text-xs text-mute2 truncate text-right">4º {g.fourthTeam || '–'}</div>
                        </>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {predictions.knockoutPredictions?.length > 0 && (
              <div className="pt-6">
                <div className="font-cond font-semibold text-grass-400 text-xs tracking-widest uppercase mb-3">Mata-Mata</div>
                <div className="space-y-1.5">
                  {predictions.knockoutPredictions.map(k => {
                    const m = matchMap[k.externalId];
                    return (
                      <div key={k.externalId} className="flex items-center justify-between bg-surface2 rounded-xl px-4 py-2.5">
                        <span className="font-cond text-sm text-mute2 truncate">{m ? `${m.homeTeam} vs ${m.awayTeam}` : k.externalId}</span>
                        <span className="font-cond font-bold text-grass-400 text-sm ml-3 shrink-0">{k.winnerTeam}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {predictions.specials && (
              <div className="pt-6">
                <div className="font-cond font-semibold text-gold text-xs tracking-widest uppercase mb-3">Pódio & Premiações</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {SPECIAL_FIELDS.map(f => {
                    const BACKEND_KEY = { campeao: 'champion', vice: 'runnerUp', terceiro: 'thirdPlace', artilheiro: 'topScorer', assist: 'mostAssists', mvp: 'mvp', goldenboy: 'goldenBoy' };
                    const val = predictions.specials[BACKEND_KEY[f.key]];
                    if (!val) return null;
                    return (
                      <div key={f.key} className="flex items-center gap-2 bg-surface2 rounded-xl px-3 py-2.5">
                        <span className="text-gold shrink-0">
                          <Icon name={f.kind === "team" ? "shield" : "star"} size={13} />
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-cond text-[10px] text-mute2 uppercase tracking-wider leading-none mb-0.5">{f.label}</div>
                          <div className="font-cond font-bold text-xs text-cream truncate">{val}</div>
                        </div>
                        <span className="shrink-0 font-cond text-[10px] text-mute2">{f.pts}pts</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!predictions.matchPredictions?.length && !predictions.groupRanks?.length && !predictions.knockoutPredictions?.length && !predictions.specials && (
              <div className="text-center text-mute2 font-cond py-8">Nenhuma aposta registrada.</div>
            )}
          </>)}
        </div>
      </div>
    </div>
  );
}

export function Admin({ allUsers, ranking = [], togglePaid, togglePredictionUnlock, tournamentPhase = "GroupStage", setTournamentPhase, arePredictionsLocked = false, setArePredictionsLocked, prizePool = 0, setPrizePool }) {
  const [toast, setToast] = useState(null);
  const [busy, setBusy] = useState(null);
  const [matches, setMatches] = useState([]);
  const [activeGroup, setActiveGroup] = useState("A");
  const [localScores, setLocalScores] = useState({});
  const [savingMatch, setSavingMatch] = useState(null);
  const [resettingMatch, setResettingMatch] = useState(null);
  const [lockingMatch, setLockingMatch] = useState(null);
  const [resultTab, setResultTab] = useState("grupos"); // "grupos" | "classificacao" | "matamata"
  const [groupResults, setGroupResults] = useState({});
  const [savingGroupResult, setSavingGroupResult] = useState(null);
  const [resettingGroup, setResettingGroup] = useState(null);
  const [localTeams, setLocalTeams] = useState({});
  const [savingTeams, setSavingTeams] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [paymentUser, setPaymentUser] = useState(null);
  const [togglingUnlock, setTogglingUnlock] = useState(null);
  const [localPrizePool, setLocalPrizePool] = useState(prizePool);
  const [savingPrize, setSavingPrize] = useState(false);
  const [lockingAll, setLockingAll] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [sharingCravados, setSharingCravados] = useState(false);
  useEffect(() => { setLocalPrizePool(prizePool); }, [prizePool]);

  useEffect(() => {
    adminService.getGroupResults().then(data => {
      const map = {};
      data.forEach(r => { map[r.group] = { first: r.firstTeam, second: r.secondTeam, third: r.thirdTeam || "", fourth: r.fourthTeam || "" }; });
      setGroupResults(map);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    matchService.getMatches().then(data => {
      setMatches(data);
      const initScores = {};
      const initTeams = {};
      data.forEach(m => {
        if (m.realHome != null && m.realAway != null) {
          initScores[m.id] = { h: String(m.realHome), a: String(m.realAway) };
        }
        if (m.round !== "Group") {
          initTeams[m.id] = { h: m.homeTeam, a: m.awayTeam };
        }
      });
      setLocalScores(initScores);
      setLocalTeams(initTeams);
    }).catch(() => {});
  }, []);

  const total = allUsers?.length || 0;
  const paid = allUsers?.filter(u => u.isPaid).length || 0;
  const pending = total - paid;

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const handleRefreshMatches = async () => {
    setBusy("res");
    try {
      const data = await matchService.getMatches();
      setMatches(data);
        const init = {};
      data.forEach(m => {
        if (m.realHome != null && m.realAway != null) {
          init[m.id] = { h: String(m.realHome), a: String(m.realAway) };
        }
      });
      setLocalScores(init);
      showToast("Jogos atualizados.");
    } catch {
      showToast("Erro ao atualizar jogos.");
    } finally {
      setBusy(null);
    }
  };

  const handleCalculate = async () => {
    setBusy("calc");
    try {
      await adminService.calculateScores();
      await adminService.calculateGroupScores();
      showToast("Pontuações recalculadas para todos.");
    } catch {
      showToast("Erro ao recalcular pontuações.");
    } finally {
      setBusy(null);
    }
  };

  const handleConfirmPayment = async (amount) => {
    setBusy(`pay-${paymentUser.id}`);
    try {
      await adminService.confirmPayment(paymentUser.handle, amount);
      togglePaid({ id: paymentUser.id, isPaid: !(amount > 0) });
      
      // Update local prize pool state
      const oldAmount = paymentUser.paidAmount || 0;
      setPrizePool(prev => prev - oldAmount + amount);
      
      showToast(`Pagamento de ${paymentUser.name} registrado!`);
    } catch (err) {
      showToast("Erro ao registrar pagamento.");
    } finally {
      setBusy(null);
      setPaymentUser(null);
    }
  };

  const toggleLockAll = async () => {
    const next = !arePredictionsLocked;
    setLockingAll(true);
    try {
      await adminService.lockAllPredictions(next);
      setArePredictionsLocked(next);
      showToast(next ? "Todas as apostas foram travadas!" : "Apostas liberadas para edição.");
    } catch {
      showToast("Erro ao alterar trava global.");
    } finally {
      setLockingAll(false);
    }
  };

  const savePrize = async () => {
    setSavingPrize(true);
    try {
      await adminService.setPrizePool(parseFloat(localPrizePool) || 0);
      setPrizePool(parseFloat(localPrizePool) || 0);
      showToast("Premiação salva.");
    } catch {
      showToast("Erro ao salvar premiação.");
    } finally {
      setSavingPrize(false);
    }
  };

  const saveGroupResult = async (groupId) => {
    const r = groupResults[groupId];
    if (!r?.first || !r?.second) return;
    setSavingGroupResult(groupId);
    try {
      await adminService.setGroupResult(groupId, r.first, r.second, r.third || null, r.fourth || null);
      showToast(`Resultado do Grupo ${groupId} salvo.`);
    } catch {
      showToast("Erro ao salvar resultado.");
    } finally {
      setSavingGroupResult(null);
    }
  };

  const setGroupResult = (groupId, key, val) => {
    setGroupResults(prev => ({ ...prev, [groupId]: { ...(prev[groupId] || {}), [key]: val } }));
  };

  const resetGroupResult = async (groupId) => {
    setResettingGroup(groupId);
    try {
      await adminService.resetGroupResult(groupId);
      setGroupResults(prev => ({ ...prev, [groupId]: {} }));
      showToast(`Classificação do Grupo ${groupId} removida.`);
    } catch {
      showToast("Erro ao resetar classificação.");
    } finally {
      setResettingGroup(null);
    }
  };

  const resetResult = async (matchId) => {
    setResettingMatch(matchId);
    try {
      await adminService.resetMatchResult(matchId);
      setMatches(prev => prev.map(m =>
        m.id === matchId ? { ...m, status: "Open", realHome: null, realAway: null } : m
      ));
      setLocalScores(prev => ({ ...prev, [matchId]: { h: "", a: "" } }));
      showToast("Resultado removido.");
    } catch {
      showToast("Erro ao resetar resultado.");
    } finally {
      setResettingMatch(null);
    }
  };

  const saveResult = async (matchId) => {
    const s = localScores[matchId];
    if (!s || s.h === "" || s.a === "") return;
    setSavingMatch(matchId);
    try {
      await adminService.updateMatchResult(matchId, parseInt(s.h, 10), parseInt(s.a, 10));
      setMatches(prev => prev.map(m =>
        m.id === matchId
          ? { ...m, status: "Locked", realHome: parseInt(s.h, 10), realAway: parseInt(s.a, 10) }
          : m
      ));
      showToast("Resultado salvo.");
    } catch {
      showToast("Erro ao salvar resultado.");
    } finally {
      setSavingMatch(null);
    }
  };

  const saveLiveScore = async (matchId) => {
    const s = localScores[matchId];
    if (!s || s.h === "" || s.a === "") return;
    setSavingMatch(matchId);
    try {
      await adminService.updateLiveScore(matchId, parseInt(s.h, 10), parseInt(s.a, 10));
      setMatches(prev => prev.map(m =>
        m.id === matchId
          ? { ...m, status: "Live", realHome: parseInt(s.h, 10), realAway: parseInt(s.a, 10) }
          : m
      ));
      showToast("Placar ao vivo atualizado.");
    } catch {
      showToast("Erro ao atualizar placar.");
    } finally {
      setSavingMatch(null);
    }
  };

  const toggleLock = async (m) => {
    const newLocked = m.status !== "Locked";
    setLockingMatch(m.id);
    try {
      await adminService.lockMatch(m.id, newLocked);
      setMatches(prev => prev.map(x =>
        x.id === m.id ? { ...x, status: newLocked ? "Locked" : "Open" } : x
      ));
      showToast(newLocked ? "Apostas travadas." : "Apostas desbloqueadas.");
    } catch {
      showToast("Erro ao alterar status.");
    } finally {
      setLockingMatch(null);
    }
  };

  const handlePrintReport = async () => {
    if (!allUsers?.length) return;
    setLoadingReport(true);
    try {
      const results = await Promise.allSettled(
        allUsers.map(u => adminService.getUserPredictions(u.id).then(p => ({ user: u, predictions: p })))
      );
      const usersData = results.filter(r => r.status === 'fulfilled').map(r => r.value);
      setReportData(usersData);
      setShowReport(true);
    } catch {
      showToast("Erro ao gerar relatório.");
    } finally {
      setLoadingReport(false);
    }
  };

  const handleShareCravados = async () => {
    setSharingCravados(true);
    try {
      const el = document.getElementById('admin-cravados-card-container');
      el.style.display = 'block';
      const canvas = await html2canvas(el, { backgroundColor: null, scale: 2, useCORS: true, logging: false });
      el.style.display = 'none';
      canvas.toBlob(async (blob) => {
        const file = new File([blob], 'cravados-copa-2026.png', { type: 'image/png' });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: 'Cravados do Bolão Copa 2026' });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = 'cravados-copa-2026.png'; a.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    } catch (err) {
      if (err.name !== 'AbortError') showToast('Erro ao gerar imagem.');
    } finally {
      setSharingCravados(false);
    }
  };

  const setScore = (matchId, side, val) => {
    setLocalScores(prev => ({ ...prev, [matchId]: { ...(prev[matchId] || {}), [side]: val } }));
  };

  const setTeam = (matchId, side, val) => {
    setLocalTeams(prev => ({ ...prev, [matchId]: { ...(prev[matchId] || {}), [side]: val } }));
  };

  const saveTeams = async (matchId) => {
    const t = localTeams[matchId];
    if (!t || !t.h || !t.a) return;
    setSavingTeams(matchId);
    try {
      await adminService.updateMatchTeams(matchId, t.h, t.a);
      setMatches(prev => prev.map(m => m.id === matchId ? { ...m, homeTeam: t.h, awayTeam: t.a } : m));
      showToast("Times atualizados.");
    } catch {
      showToast("Erro ao salvar times.");
    } finally {
      setSavingTeams(null);
    }
  };

  const groupMatches = matches.filter(m => m.group === activeGroup);
  const knockoutMatches = matches.filter(m => m.round !== "Group");
  const KO_ROUNDS = [
    { key: "RoundOf32",    label: "16avos" },
    { key: "RoundOf16",    label: "Oitavas" },
    { key: "QuarterFinal", label: "Quartas" },
    { key: "SemiFinal",    label: "Semifinal" },
    { key: "ThirdPlace",   label: "3º Lugar" },
    { key: "Final",        label: "Final" },
  ];
  const launchedCount = matches.filter(m => m.realHome != null).length;

  const fmtDate = (d) => new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

  const inputCls = `w-10 h-9 text-center text-sm font-cond font-bold rounded-lg border outline-none transition
    bg-bg/70 border-edge text-cream focus:border-grass focus:ring-2 focus:ring-grass/25`;

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <Badge tone="red" icon="shield">Acesso restrito</Badge>
      </div>
      <PageTitle kicker="Controle do bolão">Painel Admin</PageTitle>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 -mt-2">
        <AdminTile icon="users"  value={total}         label="USUÁRIOS CADASTRADOS" />
        <AdminTile icon="wallet" value={paid}          label="INSCRIÇÕES PAGAS"      tone="gold" />
        <AdminTile icon="alert"  value={pending}       label="PAGAMENTOS PENDENTES"  tone="amber" />
        <AdminTile icon="ball"   value={TOTAL_MATCHES} label="JOGOS NO BANCO" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Button variant="secondary" size="lg" icon="refresh" disabled={!!busy} onClick={handleRefreshMatches}>
          {busy === "res" ? "Atualizando..." : "Atualizar Jogos"}
        </Button>
        <Button variant="primary" size="lg" icon="calculator" disabled={!!busy} onClick={handleCalculate}>
          {busy === "calc" ? "Calculando..." : "Calcular Pontuações"}
        </Button>
        <Button variant={arePredictionsLocked ? "danger" : "secondary"} size="lg" icon={arePredictionsLocked ? "lock" : "unlock"}
          disabled={lockingAll} onClick={toggleLockAll}>
          {lockingAll ? "..." : arePredictionsLocked ? "Apostas Travadas" : "Travar Tudo"}
        </Button>
        <Button variant="secondary" size="lg" icon="share" disabled={sharingCravados || ranking.length === 0} onClick={handleShareCravados}>
          {sharingCravados ? "Gerando..." : "Compartilhar Cravados"}
        </Button>
      </div>

      <Card className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="font-cond font-semibold text-cream text-sm">Fase do Torneio</div>
          <div className="font-cond text-mute2 text-xs mt-0.5">
            {tournamentPhase === "KnockoutStage" ? "Mata-Mata aberto para palpites" : "Fase de Grupos — Mata-Mata bloqueado"}
          </div>
        </div>
        <Button
          variant={tournamentPhase === "KnockoutStage" ? "secondary" : "primary"}
          icon="lock"
          disabled={!!busy}
          onClick={async () => {
            const next = tournamentPhase === "KnockoutStage" ? "GroupStage" : "KnockoutStage";
            setBusy("phase");
            try {
              await adminService.setTournamentPhase(next);
              setTournamentPhase(next);
              showToast(next === "KnockoutStage" ? "Mata-Mata aberto!" : "Mata-Mata bloqueado.");
            } catch { showToast("Erro ao alterar fase."); }
            finally { setBusy(null); }
          }}>
          {busy === "phase" ? "..." : tournamentPhase === "KnockoutStage" ? "Bloquear Mata-Mata" : "Abrir Mata-Mata"}
        </Button>
      </Card>

      <Card className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="font-cond font-semibold text-cream text-sm">Premiação</div>
          <div className="font-cond text-mute2 text-xs mt-0.5">Valor total do prêmio a ser distribuído entre os participantes.</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-cond text-mute2 text-sm shrink-0">R$</span>
          <input
            type="number" min="0" step="0.01"
            value={localPrizePool}
            onChange={e => setLocalPrizePool(e.target.value)}
            className="w-28 h-9 px-3 text-sm font-cond font-bold rounded-xl border outline-none transition bg-bg/70 border-edge text-cream focus:border-grass focus:ring-2 focus:ring-grass/25"
          />
          <Button variant="primary" size="sm" disabled={savingPrize} onClick={savePrize}>
            {savingPrize ? "..." : "Salvar"}
          </Button>
        </div>
      </Card>

      <Card pad={false} className="overflow-hidden mb-6">
        <div className="px-5 py-3.5 border-b border-edge flex items-center justify-between">
          <h2 className="font-display text-lg text-cream">Lançar Resultados</h2>
          <span className="font-cond text-mute2 text-sm">{launchedCount}/{matches.length} lançados</span>
        </div>

        <div className="px-5 py-3 border-b border-edge flex gap-2 flex-wrap">
          {[["grupos", "Fase de Grupos"], ["classificacao", "Classificação"], ["matamata", "Mata-Mata"]].map(([tab, label]) => (
            <button key={tab} onClick={() => setResultTab(tab)}
              className={`px-4 h-8 rounded-xl font-cond font-bold text-sm border transition-all
                ${resultTab === tab
                  ? "bg-grass text-bg border-grass"
                  : "bg-surface2 text-mute border-edge hover:text-cream hover:border-edge2"}`}>
              {label}
            </button>
          ))}
        </div>

        {resultTab === "grupos" && (<>
          <div className="px-5 py-3 border-b border-edge flex flex-wrap gap-1.5">
            {GROUP_ORDER.map(g => {
              const groupMs = matches.filter(m => m.group === g);
              const done = groupMs.length > 0 && groupMs.every(m => m.realHome != null);
              return (
                <button key={g} onClick={() => setActiveGroup(g)}
                  className={`relative w-9 h-9 rounded-xl font-cond font-bold text-sm border transition-all
                    ${activeGroup === g
                      ? "bg-grass text-bg border-grass"
                      : "bg-surface2 text-mute border-edge hover:text-cream hover:border-edge2"}`}>
                  {g}
                  {done && activeGroup !== g && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-grass-400 border-2 border-bg" />
                  )}
                </button>
              );
            })}
          </div>
          <div className="divide-y divide-edge/40">
            {groupMatches.length === 0 && (
              <div className="px-5 py-8 text-center text-mute2 font-cond text-sm">Nenhum jogo encontrado.</div>
            )}
            {groupMatches.map(m => {
              const s = { h: localScores[m.id]?.h ?? "", a: localScores[m.id]?.a ?? "" };
              const hasResult = m.realHome != null && m.realAway != null;
              const isLocked = m.status === "Locked";
              const canSave = s.h !== "" && s.a !== "" && savingMatch !== m.id && !isLocked;
              const lockBtn = (
                <button onClick={() => toggleLock(m)} disabled={lockingMatch === m.id}
                  title={isLocked ? "Desbloquear apostas" : "Travar apostas"}
                  className={`w-8 h-8 rounded-lg border grid place-items-center shrink-0 transition
                    ${isLocked
                      ? "bg-danger/20 border-danger/40 text-danger hover:bg-danger/30"
                      : "bg-surface2 border-edge text-mute hover:text-cream hover:border-edge2"}`}>
                  <Icon name="lock" size={13} />
                </button>
              );
              const liveBtn = !isLocked && (
                <button onClick={() => saveLiveScore(m.id)} disabled={!canSave || savingMatch === m.id}
                  title="Atualizar placar ao vivo (sem encerrar)"
                  className={`w-8 h-8 rounded-lg border grid place-items-center shrink-0 transition
                    ${m.status === "Live"
                      ? "bg-danger/20 border-danger/40 text-danger hover:bg-danger/30"
                      : "bg-surface2 border-edge text-mute hover:text-danger hover:border-danger/40"}`}>
                  <Icon name="radio" size={13} />
                </button>
              );
              const saveBtn = !isLocked && (
                <Button size="sm" variant={hasResult ? "secondary" : "primary"}
                  className="w-24 justify-center" disabled={!canSave} onClick={() => saveResult(m.id)}>
                  {savingMatch === m.id ? "..." : hasResult ? "Finalizar" : "Salvar"}
                </Button>
              );
              const resetBtn = hasResult && !isLocked && (
                <button onClick={() => resetResult(m.id)} disabled={resettingMatch === m.id}
                  title="Remover resultado"
                  className="w-8 h-8 rounded-lg border border-edge bg-surface2 text-mute hover:text-danger hover:border-danger/40 grid place-items-center shrink-0 transition">
                  <Icon name="x" size={13} />
                </button>
              );
              return (
                <div key={m.id} className="px-3 sm:px-5 py-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="font-cond text-mute2 text-xs w-9 shrink-0">{fmtDate(m.matchDate)}</span>
                    <div className="shrink-0 sm:flex-1 flex items-center justify-end gap-2">
                      <span className="font-cond text-sm text-cream truncate hidden sm:block">{m.homeTeam}</span>
                      <TeamBadge name={m.homeTeam} showName={false} size="sm" />
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <input type="number" min="0" max="20" value={s.h ?? ""}
                        onChange={e => setScore(m.id, "h", e.target.value)}
                        placeholder="–" disabled={isLocked} className={inputCls} />
                      <span className="text-mute2 font-cond text-sm">×</span>
                      <input type="number" min="0" max="20" value={s.a ?? ""}
                        onChange={e => setScore(m.id, "a", e.target.value)}
                        placeholder="–" disabled={isLocked} className={inputCls} />
                    </div>
                    <div className="shrink-0 sm:flex-1 flex items-center gap-2">
                      <TeamBadge name={m.awayTeam} showName={false} size="sm" />
                      <span className="font-cond text-sm text-cream truncate hidden sm:block">{m.awayTeam}</span>
                    </div>
                    {lockBtn}{liveBtn}{saveBtn}{resetBtn}
                  </div>
                </div>
              );
            })}
          </div>
        </>)}

        {resultTab === "classificacao" && (
          <div className="divide-y divide-edge/40">
            <div className="px-5 py-3 bg-surface2/30 font-cond text-xs text-mute2">
              Registre o resultado final de cada grupo (1º ao 4º) para calcular a pontuação dos palpites de classificação.
            </div>
            {GROUP_ORDER.map(gId => {
              const group = GROUPS.find(g => g.id === gId);
              const r = groupResults[gId] || {};
              const teams = group?.teams || [];
              const getOpts = (currentKey) => {
                const taken = ["first","second","third","fourth"].filter(k => k !== currentKey).map(k => r[k]).filter(Boolean);
                return teams.filter(t => !taken.includes(t));
              };
              const canSave = r.first && r.second && savingGroupResult !== gId;
              const saved = r.first && r.second;
              return (
                <div key={gId} className="px-5 py-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-display text-grass-400 text-lg">Grupo {gId}</span>
                    {saved && <span className="font-cond text-xs text-grass-400 flex items-center gap-1"><Icon name="checkCircle" size={13} />Salvo</span>}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                    {[["first","1º"], ["second","2º"], ["third","3º"], ["fourth","4º"]].map(([key, label]) => (
                      <div key={key}>
                        <div className="font-cond text-xs text-mute2 mb-1">{label} lugar</div>
                        <Select value={r[key] || ""} placeholder="Selecionar..."
                          onChange={e => setGroupResult(gId, key, e.target.value)}>
                          {getOpts(key).map(t => <option key={t} value={t}>{t}</option>)}
                        </Select>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant={saved ? "secondary" : "primary"} disabled={!canSave}
                      onClick={() => saveGroupResult(gId)}>
                      {savingGroupResult === gId ? "..." : saved ? "Atualizar" : "Salvar"}
                    </Button>
                    {saved && (
                      <button onClick={() => resetGroupResult(gId)} disabled={resettingGroup === gId}
                        title="Remover classificação"
                        className="w-8 h-8 rounded-lg border border-edge bg-surface2 text-mute hover:text-danger hover:border-danger/40 grid place-items-center shrink-0 transition">
                        <Icon name="x" size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {resultTab === "matamata" && (
          <div className="divide-y divide-edge/30">
            {KO_ROUNDS.map(({ key, label }) => {
              const rms = knockoutMatches.filter(m => m.round === key).sort((a, b) => new Date(a.matchDate) - new Date(b.matchDate));
              if (rms.length === 0) return null;
              return (
                <div key={key}>
                  <div className="px-5 py-2 bg-surface2/40 font-cond font-semibold text-grass-400 text-xs tracking-widest uppercase">
                    {label}
                  </div>
                  <div className="divide-y divide-edge/40">
                    {rms.map(m => {
                      const s = { h: localScores[m.id]?.h ?? "", a: localScores[m.id]?.a ?? "" };
                      const t = { h: localTeams[m.id]?.h ?? m.homeTeam ?? "", a: localTeams[m.id]?.a ?? m.awayTeam ?? "" };
                      const hasResult = m.realHome != null && m.realAway != null;
                      const isLocked = m.status === "Locked";
                      const canSave = s.h !== "" && s.a !== "" && savingMatch !== m.id && !isLocked;
                      const canSaveTeams = t.h && t.a && savingTeams !== m.id;
                      const isUndefined = !m.homeTeam || m.homeTeam === "A definir" || !m.awayTeam || m.awayTeam === "A definir";
                      const lockBtn = (
                        <button onClick={() => toggleLock(m)} disabled={lockingMatch === m.id}
                          title={isLocked ? "Desbloquear apostas" : "Travar apostas"}
                          className={`w-8 h-8 rounded-lg border grid place-items-center shrink-0 transition
                            ${isLocked
                              ? "bg-danger/20 border-danger/40 text-danger hover:bg-danger/30"
                              : "bg-surface2 border-edge text-mute hover:text-cream hover:border-edge2"}`}>
                          <Icon name="lock" size={13} />
                        </button>
                      );
                      const liveBtn = !isLocked && (
                        <button onClick={() => saveLiveScore(m.id)} disabled={!canSave || savingMatch === m.id}
                          title="Atualizar placar ao vivo"
                          className={`w-8 h-8 rounded-lg border grid place-items-center shrink-0 transition
                            ${m.status === "Live"
                              ? "bg-danger/20 border-danger/40 text-danger hover:bg-danger/30"
                              : "bg-surface2 border-edge text-mute hover:text-danger hover:border-danger/40"}`}>
                          <Icon name="radio" size={13} />
                        </button>
                      );
                      const saveBtn = !isLocked && (
                        <Button size="sm" variant={hasResult ? "secondary" : "primary"}
                          className="w-24 justify-center" disabled={!canSave} onClick={() => saveResult(m.id)}>
                          {savingMatch === m.id ? "..." : hasResult ? "Finalizar" : "Salvar"}
                        </Button>
                      );
                      const resetBtn = hasResult && !isLocked && (
                        <button onClick={() => resetResult(m.id)} disabled={resettingMatch === m.id}
                          title="Remover resultado"
                          className="w-8 h-8 rounded-lg border border-edge bg-surface2 text-mute hover:text-danger hover:border-danger/40 grid place-items-center shrink-0 transition">
                          <Icon name="x" size={13} />
                        </button>
                      );
                      return (
                        <div key={m.id} className="px-3 sm:px-5 py-3 space-y-2">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <span className="font-cond text-mute2 text-xs w-9 shrink-0">{fmtDate(m.matchDate)}</span>
                            <div className="shrink-0 sm:flex-1 flex items-center justify-end gap-2">
                              <span className="font-cond text-sm text-cream truncate hidden sm:block">{t.h || "A definir"}</span>
                              {!isUndefined && <TeamBadge name={m.homeTeam} showName={false} size="sm" />}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <input type="number" min="0" max="20" value={s.h ?? ""}
                                onChange={e => setScore(m.id, "h", e.target.value)}
                                placeholder="–" disabled={isLocked} className={inputCls} />
                              <span className="text-mute2 font-cond text-sm">×</span>
                              <input type="number" min="0" max="20" value={s.a ?? ""}
                                onChange={e => setScore(m.id, "a", e.target.value)}
                                placeholder="–" disabled={isLocked} className={inputCls} />
                            </div>
                            <div className="shrink-0 sm:flex-1 flex items-center gap-2">
                              {!isUndefined && <TeamBadge name={m.awayTeam} showName={false} size="sm" />}
                              <span className="font-cond text-sm text-cream truncate hidden sm:block">{t.a || "A definir"}</span>
                            </div>
                            {lockBtn}{liveBtn}{saveBtn}{resetBtn}
                          </div>
                          {isUndefined && (
                            <div className="flex items-center gap-2 pl-9">
                              <input value={t.h} onChange={e => setTeam(m.id, "h", e.target.value)}
                                placeholder="Time da casa"
                                className="flex-1 h-8 px-2 text-sm font-cond rounded-lg border bg-bg/70 border-edge text-cream focus:border-grass focus:ring-2 focus:ring-grass/25 outline-none" />
                              <span className="text-mute2 font-cond text-sm shrink-0">vs</span>
                              <input value={t.a} onChange={e => setTeam(m.id, "a", e.target.value)}
                                placeholder="Time visitante"
                                className="flex-1 h-8 px-2 text-sm font-cond rounded-lg border bg-bg/70 border-edge text-cream focus:border-grass focus:ring-2 focus:ring-grass/25 outline-none" />
                              <Button size="sm" variant="secondary" disabled={!canSaveTeams} onClick={() => saveTeams(m.id)}>
                                {savingTeams === m.id ? "..." : "Times"}
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card pad={false} className="overflow-hidden">
        <div className="px-5 py-3.5 border-b border-edge flex items-center justify-between">
          <h2 className="font-display text-lg text-cream">Participantes</h2>
          <div className="flex items-center gap-3">
            <span className="font-cond text-mute2 text-sm">{total} no total</span>
            <Button size="sm" variant="secondary" icon="printer" onClick={handlePrintReport} disabled={loadingReport || !allUsers?.length}>
              {loadingReport ? "Carregando..." : "Relatório"}
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-[1fr_48px_32px_72px_36px] sm:grid-cols-[1fr_100px_130px_100px_80px] gap-x-3 px-5 py-2.5 border-b border-edge bg-surface2/40">
          {["Participante", "Total", "Status", "Ação", ""].map((h, i) => (
            <span key={i} className={`font-cond font-semibold text-mute2 text-xs tracking-widest uppercase ${i === 1 ? "text-right" : ""}`}>
              {h}
            </span>
          ))}
        </div>
        {allUsers?.map(u => (
          <div key={u.id || u.handle}
            className="grid grid-cols-[1fr_48px_32px_72px_36px_36px] sm:grid-cols-[1fr_100px_130px_100px_36px_80px] gap-x-3 items-center px-5 py-3 border-b border-edge/40 last:border-0 hover:bg-surface2/30 transition">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-8 h-8 shrink-0 rounded-full bg-surface2 border border-edge grid place-items-center font-display text-xs text-cream">
                {u.name?.[0] || "?"}
              </span>
              <div className="min-w-0">
                <div className="font-cond font-bold text-cream truncate text-sm">{u.name}</div>
                <div className="text-mute2 text-xs truncate">{u.handle}</div>
              </div>
            </div>
            <span className="text-right font-cond font-bold text-cream text-sm">{u.totalPts ?? ((u.groupPts ?? 0) + (u.awardPts ?? 0))}</span>
            <div className="flex items-center">
              <span className="sm:hidden">
                {u.isPaid
                  ? <Icon name="check" size={15} className="text-grass-400" />
                  : <Icon name="clock" size={15} className="text-gold" />}
              </span>
              <span className="hidden sm:block">
                {u.isPaid
                  ? <Badge tone="green" icon="check">Pago</Badge>
                  : <Badge tone="amber" icon="clock">Pendente</Badge>}
              </span>
            </div>
            <button onClick={() => setPaymentUser(u)}
              className="font-cond text-xs font-semibold text-mute hover:text-grass-400 transition text-left">
              {u.isPaid ? "Marcar pend." : "Marcar pago"}
            </button>
            <button
              onClick={async () => {
                setTogglingUnlock(u.id);
                await togglePredictionUnlock(u);
                setTogglingUnlock(null);
              }}
              disabled={togglingUnlock === u.id}
              title={u.isPredictionUnlocked ? "Bloquear apostas do usuário" : "Desbloquear apostas do usuário"}
              className={`w-8 h-8 rounded-lg border grid place-items-center transition shrink-0
                ${u.isPredictionUnlocked
                  ? "bg-gold/20 border-gold/50 text-gold hover:bg-gold/30"
                  : "bg-surface2 border-edge text-mute hover:text-gold hover:border-gold/50"}`}>
              <Icon name={u.isPredictionUnlocked ? "lock-open" : "lock"} size={13} />
            </button>
            <button onClick={() => setViewingUser(u)} title="Ver apostas"
              className="w-8 h-8 rounded-lg border border-edge bg-surface2 grid place-items-center text-mute hover:text-cream hover:border-edge2 transition shrink-0">
              <Icon name="eye" size={14} />
            </button>
          </div>
        ))}
      </Card>

      {viewingUser && (
        <UserPredictionsModal
          user={viewingUser}
          matches={matches}
          onClose={() => setViewingUser(null)}
        />
      )}

      {paymentUser && (
        <PaymentModal 
          user={paymentUser} 
          onClose={() => setPaymentUser(null)} 
          onConfirm={handleConfirmPayment} 
        />
      )}

      {showReport && reportData && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto" id="admin-report-printable">
          <div id="admin-report-no-print" className="sticky top-0 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between" style={{ zIndex: 10 }}>
            <div className="font-semibold text-gray-800 text-sm">
              Relatório de Apostas — {reportData.length} participante{reportData.length !== 1 ? 's' : ''}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition"
              >
                <Icon name="printer" size={15} />
                Imprimir / Salvar PDF
              </button>
              <button
                onClick={() => setShowReport(false)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                <Icon name="x" size={15} />
                Fechar
              </button>
            </div>
          </div>
          <AdminReportLayout usersData={reportData} knockoutMatches={knockoutMatches} />
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface border border-edge/80 px-5 py-3 rounded-2xl shadow-card flex items-center gap-2.5 pop">
          <Icon name="checkCircle" size={18} className="text-grass-400" />
          <span className="font-cond font-semibold text-sm">{toast}</span>
        </div>
      )}

      <div id="admin-cravados-card-container" style={{ display: 'none', position: 'absolute', top: 0, left: 0, zIndex: -1 }}>
        <AdminCravadosCard ranking={ranking} />
      </div>
      </div>
      );
      }

      function PaymentModal({ user, onClose, onConfirm }) {
      const [val, setVal] = useState(user.isPaid ? String(user.paidAmount || "50") : "50");
      return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm pop">
      <Card className="w-full max-w-sm border-gold/30 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-gold-dim/20 border border-gold/40 grid place-items-center text-gold">
            <Icon name="wallet" size={24} />
          </div>
          <div>
            <h3 className="font-display text-xl text-cream">Registrar Pagamento</h3>
            <p className="text-mute2 text-xs font-cond uppercase tracking-widest">{user.name}</p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-[10px] font-cond font-bold text-mute2 uppercase tracking-widest mb-1.5 pl-1">
              Valor Recebido (R$)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gold font-bold text-lg">R$</span>
              <input autoFocus type="number" value={val} onChange={e => setVal(e.target.value)}
                className="w-full bg-bg/60 border border-edge focus:border-gold rounded-xl h-14 pl-12 pr-4 text-2xl font-display text-cream outline-none transition" />
            </div>
          </div>
          <p className="text-mute text-xs italic text-center px-4 leading-relaxed">
            Ao confirmar, o usuário será marcado como <span className="text-gold font-bold">PAGO</span> e o valor será somado ao total.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" className="bg-gold text-bg border-gold hover:brightness-110" 
            onClick={() => onConfirm(parseFloat(val) || 0)}>
            {parseFloat(val) > 0 ? "Confirmar" : "Remover Pago"}
          </Button>
        </div>
      </Card>
      </div>
      );
      }
