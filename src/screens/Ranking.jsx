import { useState } from 'react';
import { Icon } from '../components/Icon';
import { Card } from '../components/ui/Card';
import { PageTitle } from '../components/ui/PageTitle';
import { Badge } from '../components/ui/Badge';

export function Ranking({ ranking, currentUser, prizePool = 0 }) {
  const [mode, setMode] = useState("geral"); // geral or premium
  const medal = ["#e3b23c", "#c9c9c9", "#cd7f4a"];

  const fmtBRL = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const premiumUsers = ranking.filter(u => u.isPaid);
  const totalArrecadado = prizePool;
  
  const displayRanking = mode === "premium" ? premiumUsers : ranking;

  const prizes = [
    { label: "1º Lugar", pct: 0.70 },
    { label: "2º Lugar", pct: 0.15 },
    { label: "3º Lugar", pct: 0.10 }
  ].map(p => ({ ...p, value: totalArrecadado * p.pct }));

  if (!ranking || ranking.length === 0) {
    return (
      <div>
        <PageTitle kicker="Classificação geral">Ranking Geral</PageTitle>
        <p className="text-mute -mt-3 mb-7">Nenhum participante encontrado ainda.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <PageTitle kicker="Classificação geral" className="mb-0">Ranking</PageTitle>
        
        <div className="flex bg-surface2/60 p-1 rounded-xl border border-edge/60 self-start">
          <button onClick={() => setMode("geral")}
            className={`px-4 py-1.5 rounded-lg font-cond font-bold text-xs tracking-wider uppercase transition-all
              ${mode === "geral" ? "bg-grass text-bg shadow-lg" : "text-mute hover:text-cream"}`}>
            Geral
          </button>
          <button onClick={() => setMode("premium")}
            className={`px-4 py-1.5 rounded-lg font-cond font-bold text-xs tracking-wider uppercase transition-all flex items-center gap-2
              ${mode === "premium" ? "bg-gold text-bg shadow-lg" : "text-mute hover:text-cream"}`}>
            <Icon name="star" size={12} />
            Premium
          </button>
        </div>
      </div>

      <p className="text-mute -mt-3 mb-7">
        {mode === "premium" 
          ? "Exibindo apenas os participantes com inscrição confirmada e premiação ativa."
          : "Todos os participantes do bolão, em uma única tabela. Pontos de grupos + pódio & premiações."}
      </p>

      {mode === "premium" && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <Card className="sm:col-span-1 bg-surface2/40 border-edge/60">
            <div className="text-mute font-cond text-xs tracking-widest uppercase mb-1">Total Arrecadado</div>
            <div className="text-2xl font-display text-cream">{fmtBRL(totalArrecadado)}</div>
          </Card>
          <div className="sm:col-span-3 grid grid-cols-3 gap-3">
            {prizes.map((p, i) => (
              <Card key={p.label} className="bg-bg/40 border-edge/40">
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ color: medal[i] }}><Icon name="trophy" size={14} /></span>
                  <span className="text-mute2 font-cond text-[10px] tracking-widest uppercase">{p.label}</span>
                </div>
                <div className="text-lg font-display text-cream leading-none">{fmtBRL(p.value)}</div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Card pad={false} className="overflow-hidden">
        <div className={`grid items-center px-4 sm:px-5 py-3 border-b border-edge bg-surface2/60
          ${mode === "premium" 
            ? "grid-cols-[44px_1fr_80px] sm:grid-cols-[56px_1fr_90px_96px_110px]" 
            : "grid-cols-[44px_1fr_72px] sm:grid-cols-[56px_1fr_90px_90px_96px]"}`}>
          
          <span className="font-cond font-semibold text-mute2 text-xs tracking-widest uppercase">#</span>
          <span className="font-cond font-semibold text-mute2 text-xs tracking-widest uppercase">Participante</span>
          
          {mode === "geral" ? (
            <>
              <span className="hidden sm:block font-cond font-semibold text-mute2 text-xs tracking-widest uppercase text-right">Grupos</span>
              <span className="hidden sm:block font-cond font-semibold text-mute2 text-xs tracking-widest uppercase text-right">Prêmios</span>
              <span className="font-cond font-semibold text-mute2 text-xs tracking-widest uppercase text-right">Total</span>
            </>
          ) : (
            <>
              <span className="hidden sm:block font-cond font-semibold text-mute2 text-xs tracking-widest uppercase text-right">Grupos</span>
              <span className="hidden sm:block font-cond font-semibold text-mute2 text-xs tracking-widest uppercase text-right">Total</span>
              <span className="font-cond font-semibold text-mute2 text-xs tracking-widest uppercase text-right">Premiação</span>
            </>
          )}
        </div>

        {displayRanking.map((u, i) => {
          const me = u.handle === currentUser?.handle;
          const userPrize = mode === "premium" && i < 3 ? prizes[i].value : null;

          return (
            <div key={u.handle}
              className={`grid items-center px-4 sm:px-5 py-3.5 border-b border-edge/40 last:border-0 transition
                ${mode === "premium" 
                  ? "grid-cols-[44px_1fr_80px] sm:grid-cols-[56px_1fr_90px_96px_110px]" 
                  : "grid-cols-[44px_1fr_72px] sm:grid-cols-[56px_1fr_90px_90px_96px]"}
                ${me ? "bg-grass-dim/40" : "hover:bg-surface2/40"}`}>
              <div className="flex items-center">
                {i < 3 ? (
                  <span style={{ color: medal[i] }}><Icon name="trophy" size={20} /></span>
                ) : (
                  <span className="font-display text-mute text-base pl-1">{i + 1}</span>
                )}
              </div>
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-9 h-9 shrink-0 rounded-full bg-surface2 border border-edge grid place-items-center font-display text-sm text-cream">
                  {u.name ? u.name[0] : "?"}
                </span>
                <div className="min-w-0">
                  <div className="font-cond font-bold text-cream truncate flex items-center gap-2">
                    {u.name}
                    {me && (
                      <span className="text-[10px] font-semibold tracking-wide bg-grass text-bg rounded-full px-1.5 py-0.5">
                        VOCÊ
                      </span>
                    )}
                  </div>
                  <div className="text-mute2 text-[10px] sm:text-xs truncate">{u.handle}</div>
                </div>
              </div>
              
              <span className="hidden sm:block text-right font-cond font-semibold text-mute text-sm">{u.groupPts}</span>
              
              {mode === "geral" ? (
                <>
                  <span className="hidden sm:block text-right font-cond font-semibold text-gold text-sm">{u.specialPts}</span>
                  <span className="text-right font-display text-grass-400 text-lg">{u.total}</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:block text-right font-display text-cream text-lg">{u.total}</span>
                  <div className="text-right">
                    {userPrize ? (
                      <Badge tone="gold" className="font-display text-[10px] sm:text-[11px] px-1.5 sm:px-2">{fmtBRL(userPrize)}</Badge>
                    ) : (
                      <span className="text-mute2 font-cond text-xs">—</span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </Card>
    </div>
  );
}
