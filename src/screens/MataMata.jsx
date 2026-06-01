import { useState } from 'react';
import { Icon } from '../components/Icon';
import { Card } from '../components/ui/Card';
import { PageTitle } from '../components/ui/PageTitle';
import { TeamBadge } from '../components/ui/TeamBadge';

const R16_SEEDS = [
  "Brasil","Suíça","Argentina","Holanda","Espanha","Croácia","França","Japão",
  "Inglaterra","Senegal","Portugal","México","Alemanha","Uruguai","Bélgica","Marrocos",
];
const ROUND_NAMES = ["Oitavas", "Quartas", "Semifinal", "Final"];

function BracketSlot({ name, picked, onClick, dim }) {
  return (
    <button onClick={onClick} disabled={!name}
      className={`w-full flex items-center gap-2 px-2.5 h-9 rounded-md border text-left transition
        ${!name
          ? "border-dashed border-edge/60 text-mute2 cursor-default"
          : picked
            ? "bg-grass-dim border-grass/50"
            : "bg-bg/50 border-edge hover:border-grass/50 hover:bg-surface2"}`}>
      {name
        ? <TeamBadge name={name} size="sm" dim={dim && !picked} />
        : <span className="font-cond text-xs text-mute2">a definir</span>}
    </button>
  );
}

export function MataMata() {
  const [winners, setWinners] = useState({});
  const ROUNDS = 4;

  const getTeams = (round, m) => {
    if (round === 0) return [R16_SEEDS[m * 2], R16_SEEDS[m * 2 + 1]];
    return [winners[`${round - 1}-${m * 2}`], winners[`${round - 1}-${m * 2 + 1}`]];
  };

  const pick = (round, m, team) => {
    if (!team) return;
    setWinners(prev => {
      const next = { ...prev };
      next[`${round}-${m}`] = team;
      let r = round, idx = m;
      while (r < ROUNDS - 1) {
        idx = Math.floor(idx / 2); r += 1;
        delete next[`${r}-${idx}`];
      }
      return next;
    });
  };

  const matchesIn = (round) => 8 / Math.pow(2, round);
  const champion = winners[`${ROUNDS - 1}-0`];

  return (
    <div>
      <PageTitle kicker="Fase eliminatória">Mata-Mata</PageTitle>
      <p className="text-mute -mt-3 mb-5">
        Clique na seleção que você acha que vence cada confronto — ela avança para a próxima chave.
        Cada acerto vale <b className="text-grass-400">10 pts</b>.
      </p>

      {champion && (
        <Card className="mb-6 border-gold/40 bg-gold-dim/30 flex items-center gap-4 pop">
          <span className="text-gold"><Icon name="crown" size={28} /></span>
          <div>
            <div className="font-cond text-mute text-xs tracking-widest uppercase">Seu campeão</div>
            <div className="font-display text-2xl text-gold-400">{champion}</div>
          </div>
          <button onClick={() => setWinners({})}
            className="ml-auto font-cond text-sm text-mute hover:text-cream flex items-center gap-1.5">
            <Icon name="refresh" size={15} />Recomeçar
          </button>
        </Card>
      )}

      <Card pad={false} className="p-4 sm:p-6 overflow-x-auto">
        <div className="flex gap-4 sm:gap-6 min-w-[760px]">
          {Array.from({ length: ROUNDS }).map((_, round) => (
            <div key={round} className="flex-1 flex flex-col">
              <div className="font-cond font-semibold text-grass-400 text-xs tracking-widest uppercase text-center mb-3">
                {ROUND_NAMES[round]}
              </div>
              <div className="flex-1 flex flex-col justify-around gap-3">
                {Array.from({ length: matchesIn(round) }).map((__, m) => {
                  const [t1, t2] = getTeams(round, m);
                  const w = winners[`${round}-${m}`];
                  return (
                    <div key={m} className="bg-surface2/50 border border-edge rounded-lg p-1.5 space-y-1">
                      <BracketSlot name={t1} picked={w === t1} dim={!!w} onClick={() => pick(round, m, t1)} />
                      <BracketSlot name={t2} picked={w === t2} dim={!!w} onClick={() => pick(round, m, t2)} />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex flex-col items-center justify-center w-20 shrink-0">
            <div className="font-cond font-semibold text-gold text-xs tracking-widest uppercase mb-3">Taça</div>
            <div className={`w-16 h-16 rounded-full grid place-items-center border-2 transition ${champion ? "border-gold bg-gold-dim text-gold pop" : "border-edge text-mute2"}`}>
              <Icon name="trophy" size={30} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
