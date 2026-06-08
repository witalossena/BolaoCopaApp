import { useMemo } from 'react';
import { Icon } from '../components/Icon';
import { Card } from '../components/ui/Card';
import { PageTitle } from '../components/ui/PageTitle';
import { TeamBadge } from '../components/ui/TeamBadge';
import { Select } from '../components/ui/Select';
import { predictionService } from '../services/api';
import { GROUPS } from '../data';

// Which group winners face a 3rd-place team, and which 3rd-place groups are eligible.
// Order matters for the greedy assignment: more constrained winners go first.
const MATCHUP_RULES = [
  ["E", ["A", "B", "C", "D", "F"]],
  ["I", ["C", "D", "F", "G", "H"]],
  ["A", ["C", "E", "F", "H", "I"]],
  ["L", ["E", "H", "I", "J", "K"]],
  ["G", ["A", "E", "H", "I", "J"]],
  ["D", ["B", "E", "F", "I", "J"]],
  ["B", ["E", "F", "G", "I", "J"]],
  ["K", null], // gets whatever qualifying group is left
];

// R32 match specifications (16 matches, 32 teams).
// { g, p } = group first/second place. { third: winnerGroup } = dynamic 3rd-place slot.
// M0-M7: the 8 group winners that face a 3rd-place team.
// M8-M15: the remaining 8 direct qualifier matches (approx. — full FIFA bracket TBD).
const R32_MATCHES = [
  [{ g:"E", p:"first" },  { third:"E" }],             // M0
  [{ g:"I", p:"first" },  { third:"I" }],             // M1
  [{ g:"A", p:"first" },  { third:"A" }],             // M2
  [{ g:"L", p:"first" },  { third:"L" }],             // M3
  [{ g:"G", p:"first" },  { third:"G" }],             // M4
  [{ g:"D", p:"first" },  { third:"D" }],             // M5
  [{ g:"B", p:"first" },  { third:"B" }],             // M6
  [{ g:"K", p:"first" },  { third:"K" }],             // M7
  [{ g:"C", p:"first" },  { g:"D", p:"second" }],     // M8
  [{ g:"F", p:"first" },  { g:"E", p:"second" }],     // M9
  [{ g:"H", p:"first" },  { g:"G", p:"second" }],     // M10
  [{ g:"J", p:"first" },  { g:"I", p:"second" }],     // M11
  [{ g:"A", p:"second" }, { g:"C", p:"second" }],     // M12
  [{ g:"B", p:"second" }, { g:"F", p:"second" }],     // M13
  [{ g:"L", p:"second" }, { g:"H", p:"second" }],     // M14
  [{ g:"K", p:"second" }, { g:"J", p:"second" }],     // M15
];

// Given 8 qualifying group letters, assign each group winner (from MATCHUP_RULES)
// to the qualifying group whose 3rd-place team they will face.
function assignThirds(qualifyingGroups) {
  if (!qualifyingGroups || qualifyingGroups.length < 8) return {};
  const available = new Set(qualifyingGroups.slice(0, 8));
  const result = {};
  for (const [winner, eligible] of MATCHUP_RULES) {
    if (!eligible) {
      const leftover = [...available][0];
      if (leftover) { result[winner] = leftover; available.delete(leftover); }
    } else {
      const match = eligible.find(g => available.has(g));
      if (match) { result[winner] = match; available.delete(match); }
    }
  }
  return result;
}

const ROUND_NAMES = ["16avos", "Oitavas", "Quartas", "Semifinal", "Final"];
const ALL_GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"];

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

export function MataMata({ ranks = {}, matchIdMap = {}, winners = {}, setWinners, koScores = {}, setKoScores = () => {}, thirds = {}, setThirds = () => {}, onReset, tournamentPhase = "GroupStage" }) {
  const ROUNDS = 5;

  // Qualifying groups: groups where the user has picked a 3rd-place team
  const qualifyingGroups = useMemo(
    () => ALL_GROUPS.filter(g => thirds[g]),
    [thirds]
  );

  // Dynamic assignment: which qualifying group's 3rd faces which group winner
  const thirdAssignment = useMemo(
    () => assignThirds(qualifyingGroups),
    [qualifyingGroups]
  );

  // Eligible 3rd-place teams per group: not predicted as 1st or 2nd in that group
  const groupThirdOptions = useMemo(() => {
    const result = {};
    GROUPS.forEach(g => {
      const taken = [ranks[g.id]?.first, ranks[g.id]?.second].filter(Boolean);
      result[g.id] = g.teams.filter(t => !taken.includes(t));
    });
    return result;
  }, [ranks]);

  const resolveSlot = (slot) => {
    if (slot.third) {
      const assignedGroup = thirdAssignment[slot.third];
      return assignedGroup ? (thirds[assignedGroup] || null) : null;
    }
    return ranks[slot.g]?.[slot.p] || null;
  };

  const getTeams = (round, m) => {
    if (round === 0) {
      const [s1, s2] = R32_MATCHES[m];
      return [resolveSlot(s1), resolveSlot(s2)];
    }
    return [winners[`${round - 1}-${m * 2}`] || null, winners[`${round - 1}-${m * 2 + 1}`] || null];
  };

  const pick = (round, m, team) => {
    if (!team) return;
    const key = `${round}-${m}`;
    const externalId = getExternalId(round, m);
    const matchGuid = matchIdMap[externalId];
    const score = koScores[key];
    if (matchGuid) {
      const h = score?.h !== "" && score?.h != null ? parseInt(score.h, 10) : null;
      const a = score?.a !== "" && score?.a != null ? parseInt(score.a, 10) : null;
      predictionService.submitKnockoutPrediction(matchGuid, team, h, a).catch(console.error);
    } else {
      console.warn(`[MataMata] matchIdMap missing entry for ${externalId} — pick saved locally only`);
    }
    setWinners(prev => {
      const next = { ...prev };
      next[key] = team;
      let r = round, idx = m;
      while (r < ROUNDS - 1) {
        idx = Math.floor(idx / 2); r += 1;
        delete next[`${r}-${idx}`];
      }
      return next;
    });
    setKoScores(prev => {
      const next = { ...prev };
      let r = round, idx = m;
      while (r < ROUNDS - 1) {
        idx = Math.floor(idx / 2); r += 1;
        delete next[`${r}-${idx}`];
      }
      return next;
    });
  };

  const handleKoScore = (round, m, side, val) => {
    const clean = val === "" ? "" : String(Math.max(0, Math.min(20, parseInt(val, 10) || 0)));
    const key = `${round}-${m}`;
    setKoScores(prev => ({ ...prev, [key]: { ...(prev[key] || {}), [side]: clean } }));
  };

  const submitKoScore = (round, m) => {
    const key = `${round}-${m}`;
    const w = winners[key];
    const score = koScores[key];
    if (!w || score?.h === "" || score?.h == null || score?.a === "" || score?.a == null) return;
    const externalId = getExternalId(round, m);
    const matchGuid = matchIdMap[externalId];
    if (matchGuid) {
      predictionService.submitKnockoutPrediction(matchGuid, w, parseInt(score.h, 10), parseInt(score.a, 10)).catch(console.error);
    }
  };

  const pickThird = (groupId, team) => {
    setThirds(prev => ({ ...prev, [groupId]: team || undefined }));
  };

  const matchesIn = (round) => 16 / Math.pow(2, round);
  const champion = winners[`${ROUNDS - 1}-0`];
  const missingGroups = ALL_GROUPS.filter(g => !ranks[g]?.first || !ranks[g]?.second);
  const thirdsCount = qualifyingGroups.length;

  if (tournamentPhase === "GroupStage" || tournamentPhase === "PreTournament") {
    return (
      <div>
        <PageTitle kicker="Fase eliminatória">Mata-Mata</PageTitle>
        <Card className="flex flex-col items-center justify-center py-16 gap-4 text-center border-edge/60">
          <div className="w-14 h-14 rounded-2xl bg-surface2 border border-edge grid place-items-center text-mute2">
            <Icon name="lock" size={28} />
          </div>
          <div>
            <div className="font-display text-lg text-cream mb-1">Fase de Grupos em andamento</div>
            <div className="font-cond text-mute2 text-sm max-w-xs">Os palpites do Mata-Mata serão liberados após o encerramento da fase de grupos.</div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageTitle kicker="Fase eliminatória">Mata-Mata</PageTitle>
      <p className="text-mute -mt-3 mb-5">
        Clique na seleção que você acha que vence cada confronto — ela avança para a próxima chave.
        Acerto vale <b className="text-grass-400">15 pts</b>. Com placar exato: <b className="text-gold">20 pts</b>.
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
          Escolha o 3º colocado dos grupos que você prevê que avançarão. Os confrontos nos 16avos são atribuídos automaticamente conforme as regras da FIFA.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {ALL_GROUPS.map(g => {
            const options = groupThirdOptions[g] || [];
            const selected = thirds[g] || "";
            const assignment = thirdAssignment;
            const facesWinner = Object.entries(assignment).find(([w, tg]) => tg === g)?.[0];
            return (
              <div key={g} className={`rounded-xl border p-2.5 transition ${selected ? "border-grass/40 bg-grass-dim/10" : "border-edge bg-surface2/30"}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-cond font-bold text-sm text-cream">Grupo {g}</span>
                  {selected && facesWinner && (
                    <span className="font-cond text-[9px] text-mute2 tracking-wider">vs 1º {facesWinner}</span>
                  )}
                </div>
                <Select
                  value={selected}
                  placeholder="3º lugar..."
                  onChange={e => pickThird(g, e.target.value)}
                >
                  {options.map(t => <option key={t} value={t}>{t}</option>)}
                </Select>
              </div>
            );
          })}
        </div>
        {thirdsCount > 8 && (
          <p className="mt-3 font-cond text-xs text-red-400">
            Você selecionou {thirdsCount} grupos — apenas os 8 primeiros serão usados no bracket.
          </p>
        )}
      </Card>

      {champion && (
        <Card className="mb-6 border-gold/40 bg-gold-dim/30 flex items-center gap-4 pop">
          <span className="text-gold"><Icon name="crown" size={28} /></span>
          <div>
            <div className="font-cond text-mute text-xs tracking-widest uppercase">Seu campeão</div>
            <div className="font-display text-2xl text-gold-400">{champion}</div>
          </div>
          <button onClick={() => { setWinners({}); setKoScores({}); onReset?.(); predictionService.clearKnockoutPredictions().catch(console.error); }}
            className="ml-auto font-cond text-sm text-mute hover:text-cream flex items-center gap-1.5" type="button">
            <Icon name="refresh" size={15} />Recomeçar
          </button>
        </Card>
      )}

      <Card pad={false} className="p-3 sm:p-5 overflow-x-auto">
        <div className="flex gap-2 sm:gap-3 min-w-[900px] lg:min-w-0 lg:w-full">
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
                      {w && (
                        <div className="flex items-center justify-center gap-1 py-0.5">
                          <input type="number" min="0" max="20"
                            value={koScores[`${round}-${m}`]?.h ?? ""}
                            onChange={e => handleKoScore(round, m, "h", e.target.value)}
                            onBlur={() => submitKoScore(round, m)}
                            placeholder="0"
                            className="w-8 h-6 text-center text-xs font-bold rounded border bg-bg/70 border-edge text-cream focus:border-grass outline-none" />
                          <span className="text-mute2 text-xs">×</span>
                          <input type="number" min="0" max="20"
                            value={koScores[`${round}-${m}`]?.a ?? ""}
                            onChange={e => handleKoScore(round, m, "a", e.target.value)}
                            onBlur={() => submitKoScore(round, m)}
                            placeholder="0"
                            className="w-8 h-6 text-center text-xs font-bold rounded border bg-bg/70 border-edge text-cream focus:border-grass outline-none" />
                        </div>
                      )}
                      <BracketSlot name={t2} picked={w === t2} dim={!!w} onClick={() => pick(round, m, t2)} />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex flex-col items-center justify-center w-16 sm:w-20 shrink-0">
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
