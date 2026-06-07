import { useState, useEffect } from 'react';
import { Icon } from '../components/Icon';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageTitle } from '../components/ui/PageTitle';
import { SectionLabel } from '../components/ui/SectionLabel';
import { TeamBadge } from '../components/ui/TeamBadge';
import { paymentService, predictionService } from '../services/api';

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

export function Desempenho({ user, ranking, setView, refreshProfile, onClearAll }) {
  const [pixData, setPixData] = useState(null);
  const [loadingPix, setLoadingPix] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [history, setHistory] = useState([]);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    predictionService.getPredictionHistory().then(setHistory).catch(() => {});
  }, []);

  const pos = ranking.findIndex(u => u.handle === user.handle) + 1;
  const pts = user.points || { total: 0, groupPts: 0, knockoutPts: 0, specialPts: 0, exactCount: 0, exactRate: 0 };
  const total = pts.total;

  const leaderTotal = ranking.length > 0 ? ranking[0].total : 0;
  const distance = pos === 1 ? "Você lidera! 🏆" : `${leaderTotal - total} pts`;

  const bestPred = history.length > 0
    ? history.reduce((a, b) => (b.points > a.points ? b : a), history[0])
    : null;

  const handlePay = async () => {
    setLoadingPix(true);
    try {
      const data = await paymentService.generatePix();
      setPixData(data);
    } catch (err) {
      console.error("Failed to generate PIX:", err);
    } finally {
      setLoadingPix(false);
    }
  };

  const copyPix = () => {
    if (!pixData) return;
    navigator.clipboard.writeText(pixData.qrCodeCopyPaste);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshProfile();
    setRefreshing(false);
  };

  const handleClearAll = async () => {
    setClearing(true);
    try { await onClearAll?.(); } finally { setClearing(false); setClearConfirm(false); }
  };

  const fmtDate = (d) => new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

  return (
    <div>
      <PageTitle kicker={`Olá, ${user.name.split(" ")[0]}`}>Meu Desempenho</PageTitle>

      {!user.isPaid && (
        <Card className="mb-6 -mt-2 border-gold/40 bg-gold-dim/30">
          <div className="flex flex-wrap items-center gap-4 justify-between">
            <div className="flex items-center gap-3">
              <span className="text-gold-400"><Icon name="alert" size={22} /></span>
              <div>
                <div className="font-cond font-bold text-gold-400">Pagamento pendente</div>
                <div className="text-mute text-sm">Confirme sua inscrição para validar os pontos no ranking oficial.</div>
              </div>
            </div>
            {!pixData && (
              <Button variant="gold" size="sm" icon="wallet" onClick={handlePay} disabled={loadingPix}>
                {loadingPix ? "Gerando..." : "Pagar inscrição · R$ 30"}
              </Button>
            )}
          </div>

          {pixData && (
            <div className="mt-6 pt-6 border-t border-gold/20 flex flex-col md:flex-row items-center gap-8 fade-in overflow-hidden">
              <div className="bg-white p-3 rounded-2xl shadow-lg shrink-0">
                <img src={`data:image/jpeg;base64,${pixData.qrCodeBase64}`} alt="PIX QR Code" className="w-40 h-40" />
              </div>
              <div className="flex-1 min-w-0 w-full text-center md:text-left">
                <h3 className="font-display text-xl text-cream mb-2">Escaneie o QR Code</h3>
                <p className="text-mute text-sm mb-4">
                  Ou copie e cole o código abaixo no aplicativo do seu banco para completar o pagamento de <strong>R$ 30,00</strong>.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 min-w-0 bg-bg/60 border border-edge rounded-xl px-4 py-3 font-mono text-[11px] text-mute overflow-hidden">
                    <span className="block truncate">{pixData.qrCodeCopyPaste}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" icon="copy" onClick={copyPix}>
                      Copiar
                    </Button>
                    <Button variant="primary" icon="refresh" onClick={handleRefresh} disabled={refreshing}>
                      {refreshing ? "..." : "Já paguei"}
                    </Button>
                  </div>
                </div>
                <p className="mt-4 text-xs text-mute2 italic">
                  * Após o pagamento, o status será atualizado automaticamente em alguns instantes.
                </p>
              </div>
            </div>
          )}
        </Card>
      )}

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <BigStat icon="zap" value={total} label="Pontos totais acumulados" />
        <BigStat icon="trophy" value={`${pos > 0 ? pos : '-'}º`} label={`Posição entre ${ranking.length} participantes`} tone="gold" />
        <Card className="flex items-center justify-center">
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
          <div className="space-y-3">
            {[
              ["Placares exatos acertados", `${pts.exactCount}`, "ball"],
              ["Distância para o líder", distance, "arrowUpRight"],
              ["Inscrição", user.isPaid ? "Confirmada" : "Pendente", "wallet"],
            ].map(([l, v, ic]) => (
              <div key={l} className="flex items-center justify-between py-2 border-b border-edge/50 last:border-0">
                <span className="flex items-center gap-2.5 text-mute text-sm">
                  <Icon name={ic} size={16} className="text-mute2" />{l}
                </span>
                <span className="font-cond font-bold text-cream">{v}</span>
              </div>
            ))}

            {bestPred && (
              <div className="flex items-start justify-between py-2 border-t border-edge/50">
                <span className="flex items-center gap-2.5 text-mute text-sm">
                  <Icon name="star" size={16} className="text-gold" />Melhor palpite
                </span>
                <div className="text-right">
                  <div className="font-cond font-bold text-cream text-sm">
                    {bestPred.homeTeam} {bestPred.predictedHome}×{bestPred.predictedAway} {bestPred.awayTeam}
                  </div>
                  <div className="font-cond text-gold text-xs">{bestPred.points} pts</div>
                </div>
              </div>
            )}
          </div>
          <Button variant="secondary" className="w-full mt-5" iconRight="arrowRight" onClick={() => setView("ranking")}>
            Ver ranking completo
          </Button>
        </Card>
      </div>

      <Card className="border-danger/30 bg-danger/5">
        <SectionLabel icon="alert">Zona de perigo</SectionLabel>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="font-cond font-semibold text-cream text-sm">Limpar todos os palpites</div>
            <div className="font-cond text-mute2 text-xs mt-0.5">Remove placares, classificações, mata-mata e especiais. Irreversível.</div>
          </div>
          {!clearConfirm ? (
            <button onClick={() => setClearConfirm(true)}
              className="shrink-0 font-cond font-semibold text-sm px-4 h-9 rounded-xl border border-danger/50 text-danger hover:bg-danger/10 transition">
              Limpar tudo
            </button>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => setClearConfirm(false)}
                className="font-cond text-sm px-3 h-9 rounded-xl border border-edge text-mute hover:text-cream transition">
                Cancelar
              </button>
              <button onClick={handleClearAll} disabled={clearing}
                className="font-cond font-bold text-sm px-4 h-9 rounded-xl bg-danger/90 hover:bg-danger text-white transition disabled:opacity-50">
                {clearing ? "Limpando..." : "Confirmar reset"}
              </button>
            </div>
          )}
        </div>
      </Card>

      {history.length > 0 && (
        <Card accent>
          <SectionLabel icon="clock">Histórico de Palpites</SectionLabel>
          <div className="divide-y divide-edge/40">
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
        </Card>
      )}
    </div>
  );
}
