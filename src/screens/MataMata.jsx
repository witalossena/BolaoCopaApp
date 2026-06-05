import { useMemo } from 'react';
import { Icon } from '../components/Icon';
import { Card } from '../components/ui/Card';
import { PageTitle } from '../components/ui/PageTitle';
import { TeamBadge } from '../components/ui/TeamBadge';
import { Select } from '../components/ui/Select';
import { predictionService } from '../services/api';
import { GROUPS } from '../data';

// 32 slots: [group, "first"|"second"] or ["third", slotIndex 0-7]
// Groups A-H (8 groups): 1sts vs 2nds among themselves — 8 matches
// Groups I-L (4 groups): 1sts and 2nds face the 8 qualifying third-place teams — 8 matches
const R32_BRACKET = [
  ["A","first"],  ["B","second"],   // M0: A1 vs B2
  ["C","first"],  ["D","second"],   // M1: C1 vs D2
  ["E","first"],  ["F","second"],   // M2: E1 vs F2
  ["G","first"],  ["H","second"],   // M3: G1 vs H2
  ["B","first"],  ["A","second"],   // M4: B1 vs A2
  ["D","first"],  ["C","second"],   // M5: D1 vs C2
  ["F","first"],  ["E","second"],   // M6: F1 vs E2
  ["H","first"],  ["G","second"],   // M7: H1 vs G2
  ["I","first"],  ["third",0],      // M8:  I1 vs 3º[1]
  ["I","second"], ["third",1],      // M9:  I2 vs 3º[2]
  ["J","first"],  ["third",2],      // M10: J1 vs 3º[3]
  ["J","second"], ["third",3],      // M11: J2 vs 3º[4]
  ["K","first"],  ["third",4],      // M12: K1 vs 3º[5]
  ["K","second"], ["third",5],      // M13: K2 vs 3º[6]
  ["L","first"],  ["third",6],      // M14: L1 vs 3º[7]
  ["L","second"], ["third",7],      // M15: L2 vs 3º[8]
];

const ROUND_NAMES = ["16avos", "Oitavas", "Quartas", "Semifinal", "Final"];

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

function getExternalId(round, m) {
  if (round === 0) return `ko_r32_${m}`;
  if (round === 1) return `ko_r16_${m}`;
  if (round === 2) return `ko_qf_${m}`;
  if (round === 3) return `ko_sf_${m}`;
  if (round === 4) return `ko_final`;
  return null;
}

export function MataMata({ ranks = {}, matchIdMap = {}, winners = {}, setWinners, thirds = [], setThirds = () => {} }) {
  const ROUNDS = 5;

  const seeds = useMemo(
    () => R32_BRACKET.map(([g, pos]) => {
      if (g === "third") return thirds[pos] || null;
      return ranks[g]?.[pos] || null;
    }),
    [ranks, thirds]
  );

  const eligibleThirds = useMemo(() => {
    const taken = new Set(
      Object.values(ranks).flatMap(r => [r.first, r.second].filter(Boolean))
    );
    return GROUPS.flatMap(g => g.teams.filter(t => !taken.has(t)));
  }, [ranks]);

  const getTeams = (round, m) => {
    if (round === 0) return [seeds[m * 2], seeds[m * 2 + 1]];
    return [winners[`${round - 1}-${m * 2}`], winners[`${round - 1}-${m * 2 + 1}`]];
  };

  const pick = (round, m, team) => {
    if (!team) return;
    const externalId = getExternalId(round, m);
    const matchGuid = matchIdMap[externalId];
    if (matchGuid) {
      predictionService.submitKnockoutPrediction(matchGuid, team).catch(console.error);
    }
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

  const pickThird = (slot, team) => {
    setThirds(prev => {
      const next = Array.from({ length: 8 }, (_, i) => prev[i] || null);
      if (team) {
        const existing = next.indexOf(team);
        if (existing !== -1) next[existing] = null;
      }
      next[slot] = team || null;
      return next;
    });
  };

  const matchesIn = (round) => 16 / Math.pow(2, round);
  const champion = winners[`${ROUNDS - 1}-0`];
  const missingGroups = ["A","B","C","D","E","F","G","H","I","J","K","L"].filter(g => !ranks[g]?.first || !ranks[g]?.second);
  const thirdsCount = thirds.filter(Boolean).length;

  return (
    <div>
      <PageTitle kicker="Fase eliminatória">Mata-Mata</PageTitle>
      <p className="text-mute -mt-3 mb-5">
        Clique na seleção que você acha que vence cada confronto — ela avança para a próxima chave.
        Cada acerto vale <b className="text-grass-400">10 pts</b>.
      </p>

      {missingGroups.length > 0 && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-gold/40 bg-gold-dim/20 px-4 py-3">
          <span className="text-gold mt-0.5 shrink-0"><Icon name="clock" size={16} /></span>
          <p className="font-cond text-sm text-gold-400">
            Defina 1º e 2º lugar nos grupos <b>{missingGroups.join(", ")}</b> para preencher o bracket automaticamente.
          </p>
        </div>
      )}

      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-grass-400"><Icon name="medal" size={18} /></span>
          <span className="font-cond font-semibold text-cream">8 Terceiros Classificados</span>
          <span className="ml-auto font-cond text-xs text-mute2">{thirdsCount}/8 selecionados</span>
        </div>
        <p className="font-cond text-sm text-mute mb-4">
          Dos 12 grupos, os 8 melhores terceiros avançam para os 16avos. Escolha quais você prevê:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <div className="font-cond text-mute2 text-[10px] tracking-widest mb-1.5">VAGA {i + 1}</div>
              <Select
                value={thirds[i] || ""}
                placeholder="Selecionar..."
                onChange={e => pickThird(i, e.target.value)}
              >
                {eligibleThirds
                  .filter(t => !thirds.includes(t) || thirds[i] === t)
                  .map(t => <option key={t} value={t}>{t}</option>)
                }
              </Select>
            </div>
          ))}
        </div>
      </Card>

      {champion && (
        <Card className="mb-6 border-gold/40 bg-gold-dim/30 flex items-center gap-4 pop">
          <span className="text-gold"><Icon name="crown" size={28} /></span>
          <div>
            <div className="font-cond text-mute text-xs tracking-widest uppercase">Seu campeão</div>
            <div className="font-display text-2xl text-gold-400">{champion}</div>
          </div>
          <button onClick={() => setWinners({})}
            className="ml-auto font-cond text-sm text-mute hover:text-cream flex items-center gap-1.5" type="button">
            <Icon name="refresh" size={15} />Recomeçar
          </button>
        </Card>
      )}

      <Card pad={false} className="p-4 sm:p-6 overflow-x-auto">
        <div className="flex gap-3 sm:gap-4 min-w-[1100px]">
          {Array.from({ length: ROUNDS }).map((_, round) => (
            <div key={round} className="flex-1 flex flex-col">
              <div className="font-cond font-semibold text-grass-400 text-xs tracking-widest uppercase text-center mb-3">
                {ROUND_NAMES[round]}
              </div>
              <div className="flex-1 flex flex-col justify-around gap-2">
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
