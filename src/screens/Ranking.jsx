import { Icon } from '../components/Icon';
import { Card } from '../components/ui/Card';
import { PageTitle } from '../components/ui/PageTitle';

export function Ranking({ ranking, currentUser }) {
  const medal = ["#e3b23c", "#c9c9c9", "#cd7f4a"];
  return (
    <div>
      <PageTitle kicker="Classificação geral">Ranking Geral</PageTitle>
      <p className="text-mute -mt-3 mb-7">
        Todos os participantes do bolão, em uma única tabela. Pontos de grupos + pódio &amp; premiações.
      </p>

      <Card pad={false} className="overflow-hidden">
        <div className="grid grid-cols-[44px_1fr_64px_64px_72px] sm:grid-cols-[56px_1fr_90px_90px_96px] items-center px-4 sm:px-5 py-3 border-b border-edge bg-surface2/60">
          {["#", "Participante", "Grupos", "Prêmios", "Total"].map((h, i) => (
            <span key={h} className={`font-cond font-semibold text-mute2 text-xs tracking-widest uppercase ${i >= 2 ? "text-right" : ""}`}>
              {h}
            </span>
          ))}
        </div>

        {ranking.map((u, i) => {
          const me = u.handle === currentUser.handle;
          return (
            <div key={u.handle || u.user}
              className={`grid grid-cols-[44px_1fr_64px_64px_72px] sm:grid-cols-[56px_1fr_90px_90px_96px] items-center px-4 sm:px-5 py-3.5 border-b border-edge/40 last:border-0 transition
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
                  {u.name[0]}
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
                  <div className="text-mute2 text-xs truncate">{u.handle || u.user}</div>
                </div>
              </div>
              <span className="text-right font-cond font-semibold text-mute text-sm">{u.groupPts}</span>
              <span className="text-right font-cond font-semibold text-gold text-sm">{u.awardPts}</span>
              <span className="text-right font-display text-grass-400 text-lg">{u.groupPts + u.awardPts}</span>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
