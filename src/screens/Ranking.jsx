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
  const fee = 0.05;
  const netPrizePool = prizePool * (1 - fee);
  
  const displayRanking = mode === "premium" ? premiumUsers : ranking;

  const prizes = [
    { label: "1º Lugar", pct: 0.70 },
    { label: "2º Lugar", pct: 0.15 },
    { label: "3º Lugar", pct: 0.10 }
  ].map(p => ({ ...p, value: netPrizePool * p.pct }));

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

      <Card className="mb-8 border-gold/30 bg-gradient-to-br from-gold/20 via-transparent to-transparent overflow-hidden relative group">
        <div className="absolute right-0 top-0 bottom-0 w-32 pointer-events-none opacity-10 group-hover:opacity-20 transition-opacity">
          <Icon name="trophy" size={140} className="text-gold -mr-10 -mt-2" />
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-gold shrink-0"><Icon name="sparkles" size={16} /></span>
              <span className="font-cond font-bold text-gold-400 text-xs tracking-[0.2em] uppercase">Grande Premiação em Jogo</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-display text-cream drop-shadow-sm">{fmtBRL(netPrizePool)}</span>
              <span className="text-mute2 font-cond text-sm uppercase tracking-widest text-balance">Premiação Total Disponível</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4 flex-1 sm:max-w-md">
            {prizes.map((p, i) => (
              <div key={p.label} className="bg-bg/60 border border-edge/60 rounded-xl p-2.5 sm:p-3 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-1">
                  <span style={{ color: medal[i] }} className="shrink-0"><Icon name="trophy" size={12} /></span>
                  <span className="text-mute2 font-cond text-[9px] sm:text-[10px] tracking-wider uppercase truncate">{p.label}</span>
                </div>
                <div className="text-sm sm:text-base font-display text-cream leading-none">{fmtBRL(p.value)}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card pad={false} className="overflow-hidden">
        <div className="grid items-center px-4 sm:px-5 py-3 border-b border-edge bg-surface2/60 grid-cols-[44px_1fr_80px_110px] sm:grid-cols-[56px_1fr_90px_96px_110px]">
          <span className="font-cond font-semibold text-mute2 text-xs tracking-widest uppercase">#</span>
          <span className="font-cond font-semibold text-mute2 text-xs tracking-widest uppercase">Participante</span>
          <span className="hidden sm:block font-cond font-semibold text-mute2 text-xs tracking-widest uppercase text-right">Grupos</span>
          <span className="font-cond font-semibold text-mute2 text-xs tracking-widest uppercase text-right">Total</span>
          <span className="font-cond font-semibold text-mute2 text-xs tracking-widest uppercase text-right">Premiação</span>
        </div>

        {displayRanking.map((u, i) => {
          const me = u.handle === currentUser?.handle;
          
          let userPrize = null;
          if (u.isPaid && u.total > 0) {
            const premiumIndex = premiumUsers.findIndex(pu => pu.handle === u.handle);
            if (premiumIndex !== -1 && premiumIndex < 3) {
              userPrize = prizes[premiumIndex].value;
            }
          }

          return (
            <div key={u.handle}
              className={`grid items-center px-4 sm:px-5 py-3.5 border-b border-edge/40 last:border-0 transition
                grid-cols-[44px_1fr_80px_110px] sm:grid-cols-[56px_1fr_90px_96px_110px]
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
              <span className="text-right font-display text-grass-400 text-lg">{u.total}</span>
              <div className="text-right">
                {userPrize ? (
                  <Badge tone="gold" className="font-display text-[10px] sm:text-[11px] px-1.5 sm:px-2">{fmtBRL(userPrize)}</Badge>
                ) : (
                  <span className="text-mute2 font-cond text-xs">—</span>
                )}
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
