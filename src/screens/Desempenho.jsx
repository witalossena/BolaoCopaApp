import { useState } from 'react';
import { Icon } from '../components/Icon';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageTitle } from '../components/ui/PageTitle';
import { SectionLabel } from '../components/ui/SectionLabel';
import { paymentService } from '../services/api';

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

export function Desempenho({ user, ranking, setView }) {
  const [pixData, setPixData] = useState(null);
  const [loadingPix, setLoadingPix] = useState(false);

  const pos = ranking.findIndex(u => u.handle === user.handle) + 1;
  const pts = user.points || { total: 0, groupPts: 0, knockoutPts: 0, specialPts: 0, exactCount: 0, exactRate: 0 };
  const total = pts.total;
  
  // Calculate distance to leader
  const leaderTotal = ranking.length > 0 ? ranking[0].total : 0;
  const distance = pos === 1 ? "Você lidera! 🏆" : `${leaderTotal - total} pts`;

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
            <div className="mt-6 pt-6 border-t border-gold/20 flex flex-col md:flex-row items-center gap-8 fade-in">
              <div className="bg-white p-3 rounded-2xl shadow-lg shrink-0">
                <img src={`data:image/jpeg;base64,${pixData.qrCodeBase64}`} alt="PIX QR Code" className="w-40 h-40" />
              </div>
              <div className="flex-1 min-w-0 text-center md:text-left">
                <h3 className="font-display text-xl text-cream mb-2">Escaneie o QR Code</h3>
                <p className="text-mute text-sm mb-4">
                  Ou copie e cole o código abaixo no aplicativo do seu banco para completar o pagamento de <strong>R$ 30,00</strong>.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 bg-bg/60 border border-edge rounded-xl px-4 py-3 font-mono text-[11px] text-mute truncate">
                    {pixData.qrCodeCopyPaste}
                  </div>
                  <Button variant="secondary" icon="copy" onClick={copyPix}>
                    Copiar Código
                  </Button>
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

      <div className="grid lg:grid-cols-2 gap-5">
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
          </div>
          <Button variant="secondary" className="w-full mt-5" iconRight="arrowRight" onClick={() => setView("ranking")}>
            Ver ranking completo
          </Button>
        </Card>
      </div>
    </div>
  );
}
