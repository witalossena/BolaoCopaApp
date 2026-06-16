import { useState, useEffect, useRef } from 'react';
import { Icon } from '../components/Icon';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageTitle } from '../components/ui/PageTitle';
import { SectionLabel } from '../components/ui/SectionLabel';
import { TeamBadge } from '../components/ui/TeamBadge';
import { predictionService } from '../services/api';
import { SPECIAL_FIELDS, MATCHES } from '../data';
import { ExportPDFLayout } from '../components/ExportPDFLayout';
import { CravadosShareCard } from '../components/CravadosShareCard';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function Ring({ value, label }) {
  const r = 42, c = 2 * Math.PI * r, off = c - (value / 100) * c;
  return (
    <div className="relative w-32 h-32">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#1f3a29" strokeWidth="9" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="#34c75e" strokeWidth="9" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off} style={{ transition: "stroke-dashoffset .8s ease" }} />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <div className="font-display text-3xl text-cream leading-none">
          {value}<span className="text-grass-400 text-lg">%</span>
        </div>
        <div className="font-cond text-mute2 text-[10px] tracking-widest mt-1">{label}</div>
      </div>
    </div>
  );
}

function BigStat({ icon, value, suffix, label, tone = "grass" }) {
  const c = tone === "gold" ? "text-gold" : "text-grass-400";
  return (
    <Card className="flex flex-col gap-3">
      <span className={c}><Icon name={icon} size={24} /></span>
      <div>
        <div className="font-display text-4xl text-cream leading-none">
          {value}<span className={`${c} text-2xl`}>{suffix}</span>
        </div>
        <div className="font-cond text-mute text-sm tracking-wide mt-2">{label}</div>
      </div>
    </Card>
  );
}

function ptsTone(pts) {
  if (pts >= 15) return { bg: "bg-grass-dim/60 text-grass-400 border-grass/30", label: "Exato" };
  if (pts >= 10) return { bg: "bg-blue-900/40 text-blue-300 border-blue-500/30", label: "+Saldo" };
  if (pts >= 5)  return { bg: "bg-gold-dim/60 text-gold-400 border-gold/30", label: "Resultado" };
  return { bg: "bg-danger/10 text-danger border-danger/20", label: "Errou" };
}

export function Desempenho({ user, ranking, setView, onClearAll, specials = {}, locked = false }) {
  const [history, setHistory] = useState([]);
  const [groupRanks, setGroupRanks] = useState([]);
  const [matchPredictions, setMatchPredictions] = useState([]);
  const [knockoutPredictions, setKnockoutPredictions] = useState([]);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sharingCravados, setSharingCravados] = useState(false);
  const dashboardRef = useRef();

  useEffect(() => {
    predictionService.getPredictionHistory().then(setHistory).catch(console.error);
    predictionService.getUserPredictions().then(d => {
      setGroupRanks(d.groupRanks || []);
      setMatchPredictions(d.matchPredictions || []);
      setKnockoutPredictions(d.knockoutPredictions || []);
    }).catch(console.error);
  }, []);

  const rankEntry = ranking.find(u => u.handle === user.handle);
  const pos = ranking.indexOf(rankEntry) + 1;
  
  const pts = rankEntry ? {
    total: rankEntry.total || 0,
    groupPts: rankEntry.groupPts || 0,
    knockoutPts: rankEntry.knockoutPts || 0,
    specialPts: rankEntry.specialPts || 0,
    exactCount: rankEntry.exactCount || 0,
    exactRate: rankEntry.exactRate || 0
  } : (user.points || { total: 0, groupPts: 0, knockoutPts: 0, specialPts: 0, exactCount: 0, exactRate: 0 });

  const total = pts.total;

  const leaderTotal = ranking.length > 0 ? ranking[0].total : 0;
  const distance = pos === 1 ? "Você lidera! 🏆" : `${leaderTotal - total} pts`;

  const bestPred = history.length > 0
    ? history.reduce((a, b) => (b.points > a.points ? b : a), history[0])
    : null;

  const handleClearAll = async () => {
    setClearing(true);
    try { await onClearAll?.(); } finally { setClearing(false); setClearConfirm(false); }
  };

  const hasAnyPrediction = matchPredictions.length > 0 || knockoutPredictions.length > 0 || groupRanks.length > 0 || Object.keys(specials).length > 0;

  const handleDownloadPDF = async () => {
    if (!hasAnyPrediction) return;
    setDownloading(true);
    try {
      const element = document.getElementById('pdf-export-layout-container');
      element.style.display = 'block';

      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      element.style.display = 'none';

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`meus-palpites-copa-2026-${user.handle}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  const cravados = history.filter(h => h.points >= 15);

  const handleShareCravados = async () => {
    if (cravados.length === 0) return;
    setSharingCravados(true);
    try {
      const el = document.getElementById('cravados-share-card-container');
      el.style.display = 'block';
      const canvas = await html2canvas(el, { backgroundColor: null, scale: 2, useCORS: true, logging: false });
      el.style.display = 'none';
      canvas.toBlob(async (blob) => {
        const file = new File([blob], `cravados-${user.handle}-copa2026.png`, { type: 'image/png' });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: 'Meus cravados — Bolão Copa 2026' });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = file.name; a.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    } catch (err) {
      if (err.name !== 'AbortError') console.error('Share failed:', err);
    } finally {
      setSharingCravados(false);
    }
  };

  const fmtDate = (d) => new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

  return (
    <div ref={dashboardRef} className="bg-bg p-2 sm:p-4 rounded-3xl text-left">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
        <PageTitle kicker={`Olá, ${user.name.split(" ")[0]}`} className="mb-0">Meu Desempenho</PageTitle>
        <div className="flex gap-2">
          {cravados.length > 0 && (
            <Button variant="secondary" icon="share" disabled={sharingCravados} onClick={handleShareCravados}>
              {sharingCravados ? "Gerando..." : `🎯 ${cravados.length} Cravado${cravados.length !== 1 ? 's' : ''}`}
            </Button>
          )}
          <Button variant="secondary" icon="download" disabled={downloading || !hasAnyPrediction} onClick={handleDownloadPDF}>
            {downloading ? "Gerando PDF..." : "Baixar Palpites (PDF)"}
          </Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <BigStat icon="zap" value={total} label="Pontos totais acumulados" />
        <BigStat icon="trophy" value={`${pos > 0 ? pos : '-'}º`} label={`Posição entre ${ranking.length} participantes`} tone="gold" />
        <Card className="flex items-center justify-center text-center">
          <Ring value={Math.round(pts.exactRate * 100) || 0} label="PLACARES EXATOS" />
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        <Card accent>
          <SectionLabel icon="trendingUp">De onde vêm seus pontos</SectionLabel>
          {[
            ["Fase de grupos", pts.groupPts, "#34c75e"],
            ["Mata-mata", pts.knockoutPts, "#5aa9e6"],
            ["Pódio & premiações", pts.specialPts, "#e3b23c"],
          ].map(([l, v, col]) => (
            <div key={l} className="mb-4 last:mb-0">
              <div className="flex justify-between font-cond text-sm mb-1.5">
                <span className="text-cream">{l}</span>
                <span className="font-bold" style={{ color: col }}>{v} pts</span>
              </div>
              <div className="h-2.5 rounded-full bg-bg/70 overflow-hidden">
                <div className="h-full rounded-full"
                  style={{ width: `${total ? (v / total) * 100 : 0}%`, background: col, transition: "width .8s ease" }} />
              </div>
            </div>
          ))}
        </Card>

        <Card accent>
          <SectionLabel icon="target">Resumo</SectionLabel>
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-mute">
                <Icon name="ball" size={18} />
                <span className="font-cond font-semibold text-sm">Placares exatos acertados</span>
              </div>
              <span className="font-display text-xl text-cream">{pts.exactCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-mute">
                <Icon name="trendingUp" size={18} />
                <span className="font-cond font-semibold text-sm">Distância para o líder</span>
              </div>
              <span className="font-display text-xl text-cream">{distance}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-mute">
                <Icon name="star" size={18} />
                <span className="font-cond font-semibold text-sm">Melhor palpite</span>
              </div>
              <div className="text-right">
                {bestPred ? (
                  <>
                    <div className="font-cond font-bold text-xs text-cream leading-tight">
                      {bestPred.homeTeam} {bestPred.predictedHome}×{bestPred.predictedAway} {bestPred.awayTeam}
                    </div>
                    <div className="text-gold font-cond font-bold text-[10px] uppercase">{bestPred.points} pts</div>
                  </>
                ) : <span className="text-mute2 text-sm">–</span>}
              </div>
            </div>
            <Button variant="secondary" className="w-full" iconRight="arrowRight" onClick={() => setView("ranking")}>
              Ver ranking completo
            </Button>
          </div>
        </Card>
      </div>

      <Card className="border-danger/20 bg-danger/5">
        <SectionLabel icon="alert" className="text-danger">Zona de perigo</SectionLabel>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="font-cond font-bold text-cream">Limpar todos os palpites</div>
            {locked
              ? <p className="text-mute2 text-xs">Não é possível apagar palpites após o início dos jogos.</p>
              : <p className="text-mute2 text-xs">Remove placares, classificações, mata-mata e especiais. Irreversível.</p>
            }
          </div>
          {locked ? (
            <Button variant="danger" outline size="sm" disabled>Limpar tudo</Button>
          ) : clearConfirm ? (
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setClearConfirm(false)}>Cancelar</Button>
              <Button variant="danger" size="sm" onClick={handleClearAll} disabled={clearing}>
                {clearing ? "Limpando..." : "Confirmar exclusão"}
              </Button>
            </div>
          ) : (
            <Button variant="danger" outline size="sm" onClick={() => setClearConfirm(true)}>Limpar tudo</Button>
          )}
        </div>
      </Card>

      {(history.length > 0 || groupRanks.length > 0 || Object.keys(specials).length > 0 || matchPredictions.length > 0 || knockoutPredictions.length > 0) && (
        <Card accent className="mt-6">
          <SectionLabel icon="clock">Histórico de Palpites</SectionLabel>

          {history.length > 0 && (
            <div className="divide-y divide-edge/40 mb-6 text-left">
              <div className="font-cond text-mute2 text-xs tracking-widest uppercase mb-2">Jogos Encerrados</div>
              {history.map((item, i) => {
                const tone = ptsTone(item.points);
                return (
                  <div key={i} className="py-3 flex items-center gap-3">
                    <span className="font-cond text-mute2 text-xs w-10 shrink-0">{fmtDate(item.matchDate)}</span>

                    <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
                      <span className="font-cond text-sm text-cream truncate hidden sm:block">{item.homeTeam}</span>
                      <TeamBadge name={item.homeTeam} showName={false} size="sm" />
                    </div>

                    <div className="flex items-center gap-1 shrink-0 font-cond text-sm">
                      <span className="text-mute2">{item.predictedHome}×{item.predictedAway}</span>
                      <span className="text-mute2 mx-1 text-xs">→</span>
                      <span className="text-cream font-bold">{item.realHome}×{item.realAway}</span>
                    </div>

                    <div className="flex-1 flex items-center gap-2 min-w-0">
                      <TeamBadge name={item.awayTeam} showName={false} size="sm" />
                      <span className="font-cond text-sm text-cream truncate hidden sm:block">{item.awayTeam}</span>
                    </div>

                    <span className={`shrink-0 font-cond font-bold text-xs px-2.5 py-1 rounded-full border ${tone.bg}`}>
                      {item.points > 0 ? `+${item.points}` : "0"} pts
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {(matchPredictions.length > 0 || knockoutPredictions.length > 0 || groupRanks.length > 0 || Object.keys(specials).length > 0) && (
            <div className={`${history.length > 0 ? "pt-4 border-t border-edge/40" : ""} space-y-6 text-left`}>
              
              {matchPredictions.length > 0 && (
                <div>
                  <div className="font-cond text-mute2 text-xs tracking-widest uppercase mb-2">Placares (Fase de Grupos)</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {matchPredictions.map(p => {
                      const match = MATCHES.find(m => m.id === p.externalId || m.id === `m${p.matchId}`);
                      if (!match) return null;
                      return (
                        <div key={p.id} className="bg-surface2/50 rounded-xl p-2 flex flex-col items-center gap-1 border border-edge/30">
                          <div className="font-cond text-[9px] text-mute2 uppercase tracking-tighter">Grupo {match.group}</div>
                          <div className="flex items-center gap-1.5 font-cond font-bold text-xs text-cream">
                            <span>{match.homeCode}</span>
                            <span className="bg-bg/60 px-1.5 rounded text-grass-400">{p.homeScore}×{p.awayScore}</span>
                            <span>{match.awayCode}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {knockoutPredictions.length > 0 && (
                <div>
                  <div className="font-cond text-mute2 text-xs tracking-widest uppercase mb-2">Mata-Mata</div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {knockoutPredictions.map(p => (
                      <div key={p.id} className="flex items-center gap-3 bg-surface2/50 rounded-xl px-3 py-2 border border-edge/30">
                        <span className="text-grass-400 shrink-0"><Icon name="bracket" size={14} /></span>
                        <div className="flex-1 min-w-0">
                          <div className="font-cond text-[10px] text-mute2 uppercase tracking-wider leading-none mb-1">
                            {p.externalId?.includes('r32') ? 'Oitavas' : 
                             p.externalId?.includes('r16') ? 'Quartas' : 
                             p.externalId?.includes('sf') ? 'Semifinal' : 'Final'}
                          </div>
                          <div className="font-cond font-bold text-xs text-cream truncate">
                            {p.winnerTeam} <span className="text-mute2 font-normal ml-1">({p.homeScore}×{p.awayScore})</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {groupRanks.length > 0 && (
                <div>
                  <div className="font-cond text-mute2 text-xs tracking-widest uppercase mb-2">Classificação de Grupos</div>
                  <div className="space-y-2">
                    {groupRanks.map(g => {
                      const tone = ptsTone(g.points || 0);
                      return (
                        <div key={g.group} className="flex items-center gap-3 bg-surface2/50 rounded-xl px-3 py-2">
                          <span className="font-display text-cream w-5 shrink-0 text-sm">{g.group}</span>
                          <div className="flex-1 font-cond text-xs text-cream space-y-0.5 min-w-0">
                            <div className="truncate">1º {g.firstTeam} · 2º {g.secondTeam}</div>
                            {(g.thirdTeam || g.fourthTeam) && (
                              <div className="truncate text-mute2">3º {g.thirdTeam || '–'} · 4º {g.fourthTeam || '–'}</div>
                            )}
                          </div>
                          <span className={`shrink-0 font-cond font-bold text-xs px-2.5 py-1 rounded-full border ${tone.bg}`}>
                            {(g.points || 0) > 0 ? `+${g.points}` : "–"} pts
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {Object.keys(specials).length > 0 && (
                <div>
                  <div className="font-cond text-mute2 text-xs tracking-widest uppercase mb-2">Pódio & Premiações</div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {SPECIAL_FIELDS.map(f => {
                      const val = specials[f.key];
                      if (!val) return null;
                      return (
                        <div key={f.key} className="flex items-center gap-3 bg-surface2/50 rounded-xl px-3 py-2">
                          <span className="text-gold shrink-0">
                            <Icon name={f.kind === "team" ? "shield" : "star"} size={14} />
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="font-cond text-[10px] text-mute2 uppercase tracking-wider leading-none mb-1">{f.label}</div>
                            <div className="font-cond font-bold text-xs text-cream truncate">{val}</div>
                          </div>
                          <span className="shrink-0 font-cond font-bold text-mute2 text-[10px] px-2 py-0.5 rounded-full border border-edge/40">
                            – pts
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      <div id="pdf-export-layout-container" style={{ display: 'none', position: 'absolute', top: 0, left: 0 }}>
        <ExportPDFLayout
          user={user}
          matchPredictions={matchPredictions}
          groupRanks={groupRanks}
          knockoutPredictions={knockoutPredictions}
          specials={specials}
        />
      </div>

      <div id="cravados-share-card-container" style={{ display: 'none', position: 'absolute', top: 0, left: 0, zIndex: -1 }}>
        <CravadosShareCard user={user} cravados={cravados} />
      </div>
    </div>
  );
}
