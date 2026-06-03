import { useState, useEffect } from 'react';
import { TOTAL_MATCHES, GROUP_ORDER } from '../data';
import { Icon } from '../components/Icon';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { TeamBadge } from '../components/ui/TeamBadge';
import { PageTitle } from '../components/ui/PageTitle';
import { matchService, adminService } from '../services/api';

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

export function Admin({ allUsers, togglePaid }) {
  const [toast, setToast] = useState(null);
  const [busy, setBusy] = useState(null);
  const [matches, setMatches] = useState([]);
  const [activeGroup, setActiveGroup] = useState("A");
  const [localScores, setLocalScores] = useState({});
  const [savingMatch, setSavingMatch] = useState(null);

  useEffect(() => {
    matchService.getMatches().then(data => {
      setMatches(data);
      const init = {};
      data.forEach(m => {
        if (m.realHome != null && m.realAway != null) {
          init[m.id] = { h: String(m.realHome), a: String(m.realAway) };
        }
      });
      setLocalScores(init);
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
      showToast("Pontuações recalculadas para todos.");
    } catch {
      showToast("Erro ao recalcular pontuações.");
    } finally {
      setBusy(null);
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

  const setScore = (matchId, side, val) => {
    setLocalScores(prev => ({ ...prev, [matchId]: { ...(prev[matchId] || {}), [side]: val } }));
  };

  const groupMatches = matches.filter(m => m.group === activeGroup);
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

      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <Button variant="secondary" size="lg" icon="refresh" disabled={!!busy} onClick={handleRefreshMatches}>
          {busy === "res" ? "Atualizando..." : "Atualizar Jogos"}
        </Button>
        <Button variant="primary" size="lg" icon="calculator" disabled={!!busy} onClick={handleCalculate}>
          {busy === "calc" ? "Calculando..." : "Calcular Pontuações"}
        </Button>
      </div>

      <Card pad={false} className="overflow-hidden mb-6">
        <div className="px-5 py-3.5 border-b border-edge flex items-center justify-between">
          <h2 className="font-display text-lg text-cream">Lançar Resultados</h2>
          <span className="font-cond text-mute2 text-sm">{launchedCount}/{matches.length} lançados</span>
        </div>

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
            const s = localScores[m.id] || { h: "", a: "" };
            const hasResult = m.realHome != null && m.realAway != null;
            const canSave = s.h !== "" && s.a !== "" && savingMatch !== m.id;
            return (
              <div key={m.id} className="px-5 py-3 flex items-center gap-3">
                <span className="font-cond text-mute2 text-xs w-10 shrink-0">{fmtDate(m.matchDate)}</span>

                <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
                  <span className="font-cond text-sm text-cream truncate hidden sm:block">{m.homeTeam}</span>
                  <TeamBadge name={m.homeTeam} showName={false} size="sm" />
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <input type="number" min="0" max="20" value={s.h}
                    onChange={e => setScore(m.id, "h", e.target.value)}
                    placeholder="–" className={inputCls} />
                  <span className="text-mute2 font-cond text-sm">×</span>
                  <input type="number" min="0" max="20" value={s.a}
                    onChange={e => setScore(m.id, "a", e.target.value)}
                    placeholder="–" className={inputCls} />
                </div>

                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <TeamBadge name={m.awayTeam} showName={false} size="sm" />
                  <span className="font-cond text-sm text-cream truncate hidden sm:block">{m.awayTeam}</span>
                </div>

                <Button size="sm" variant={hasResult ? "secondary" : "primary"}
                  disabled={!canSave} onClick={() => saveResult(m.id)}>
                  {savingMatch === m.id ? "..." : hasResult ? "Atualizar" : "Salvar"}
                </Button>
              </div>
            );
          })}
        </div>
      </Card>

      <Card pad={false} className="overflow-hidden">
        <div className="px-5 py-3.5 border-b border-edge flex items-center justify-between">
          <h2 className="font-display text-lg text-cream">Participantes</h2>
          <span className="font-cond text-mute2 text-sm">{total} no total</span>
        </div>
        <div className="grid grid-cols-[1fr_72px_110px_88px] sm:grid-cols-[1fr_100px_130px_100px] px-5 py-2.5 border-b border-edge bg-surface2/40">
          {["Participante", "Total", "Status", "Ação"].map((h, i) => (
            <span key={h} className={`font-cond font-semibold text-mute2 text-xs tracking-widest uppercase ${i === 1 ? "text-right" : ""}`}>
              {h}
            </span>
          ))}
        </div>
        {allUsers?.map(u => (
          <div key={u.id || u.handle}
            className="grid grid-cols-[1fr_72px_110px_88px] sm:grid-cols-[1fr_100px_130px_100px] items-center px-5 py-3 border-b border-edge/40 last:border-0 hover:bg-surface2/30 transition">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-8 h-8 shrink-0 rounded-full bg-surface2 border border-edge grid place-items-center font-display text-xs text-cream">
                {u.name?.[0] || "?"}
              </span>
              <div className="min-w-0">
                <div className="font-cond font-bold text-cream truncate text-sm">{u.name}</div>
                <div className="text-mute2 text-xs truncate">{u.handle}</div>
              </div>
            </div>
            <span className="text-right font-cond font-bold text-cream text-sm">{u.totalPts ?? (u.groupPts + u.awardPts)}</span>
            <div>
              {u.isPaid
                ? <Badge tone="green" icon="check">Pago</Badge>
                : <Badge tone="amber" icon="clock">Pendente</Badge>}
            </div>
            <button onClick={() => togglePaid(u)}
              className="font-cond text-xs font-semibold text-mute hover:text-grass-400 transition text-left">
              {u.isPaid ? "Marcar pend." : "Marcar pago"}
            </button>
          </div>
        ))}
      </Card>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-surface border border-grass/40 text-cream rounded-full px-5 py-3 shadow-card flex items-center gap-2.5 pop">
          <Icon name="checkCircle" size={18} className="text-grass-400" />
          <span className="font-cond font-semibold text-sm">{toast}</span>
        </div>
      )}
    </div>
  );
}
